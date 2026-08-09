import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { calculateWage } from "@/lib/wage";
import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

const storeSchema = z.object({
  project_id: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  attendances: z
    .array(
      z.object({
        worker_id: z.number().int().positive(),
        status: z.nativeEnum(AttendanceStatus),
      })
    )
    .min(1),
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = storeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { date, attendances } = parsed.data;
  const dateObj = new Date(date + "T00:00:00.000Z");

  const workerIds = attendances.map((a) => BigInt(a.worker_id));
  const workers = await prisma.worker.findMany({
    where: { id: { in: workerIds } },
    include: { position: true },
  });

  const workerMap = new Map(workers.map((w) => [w.id.toString(), w]));

  const results = await Promise.all(
    attendances.map(async ({ worker_id, status }) => {
      const worker = workerMap.get(worker_id.toString());
      if (!worker?.position) return null;

      const wage = calculateWage(
        status,
        worker.position.dailyWage,
        worker.position.overtimeWage,
        worker.position.castingWage
      );

      return prisma.attendance.upsert({
        where: { workerId_date: { workerId: BigInt(worker_id), date: dateObj } },
        create: { workerId: BigInt(worker_id), date: dateObj, status, wage },
        update: { status, wage },
      });
    })
  );

  const saved = results.filter(Boolean);
  return NextResponse.json(
    { data: serializeBigInt(saved), message: `${saved.length} absensi berhasil disimpan` },
    { status: 201 }
  );
});
