import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { calculateWage } from "@/lib/wage";
import { z } from "zod";
import { AttendanceStatus } from "@/generated/client";

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

  const { project_id, date, attendances } = parsed.data;
  const dateObj = new Date(date + "T00:00:00.000Z");

  const workerIds = attendances.map((a) => BigInt(a.worker_id));
  const workers = await prisma.worker.findMany({
    where: { id: { in: workerIds } },
    include: { position: true },
  });

  const workerMap = new Map(workers.map((w) => [w.id.toString(), w]));

  // Validasi: Cek apakah ada pekerja yang mencoba hadir di 2 proyek sekaligus (berdasarkan nama)
  const hadirWorkers = attendances.filter((a) => a.status === "hadir");
  if (hadirWorkers.length > 0) {
    const hadirWorkerIds = hadirWorkers.map((a) => BigInt(a.worker_id));
    
    // Ambil nama pekerja yang akan diabsen hadir
    const hadirWorkerNames = workers
      .filter((w) => hadirWorkerIds.includes(w.id))
      .map((w) => w.name);
    
    // Cek apakah ada pekerja dengan nama sama sudah hadir di proyek lain
    const conflictingAttendances = await prisma.attendance.findMany({
      where: {
        date: dateObj,
        projectId: { not: BigInt(project_id) },
        status: "hadir",
        worker: {
          name: {
            in: hadirWorkerNames,
            mode: 'insensitive',
          },
        },
      },
      include: {
        worker: { select: { name: true } },
        project: { select: { name: true } },
      },
    });

    if (conflictingAttendances.length > 0) {
      const conflicts = conflictingAttendances.map(
        (a) => `${a.worker.name} sudah hadir di ${a.project.name}`
      );
      return NextResponse.json(
        { error: `Tidak dapat menyimpan: ${conflicts.join(", ")}` },
        { status: 400 }
      );
    }
  }

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
        where: {
          workerId_projectId_date: {
            workerId: BigInt(worker_id),
            projectId: BigInt(project_id),
            date: dateObj,
          },
        },
        create: {
          workerId: BigInt(worker_id),
          projectId: BigInt(project_id),
          date: dateObj,
          status,
          wage,
        },
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

export const DELETE = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get("workerId");
  const projectId = searchParams.get("projectId");
  const date = searchParams.get("date");

  if (!workerId || !projectId || !date) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const dateObj = new Date(date + "T00:00:00.000Z");

  try {
    const deleted = await prisma.attendance.delete({
      where: {
        workerId_projectId_date: {
          workerId: BigInt(workerId),
          projectId: BigInt(projectId),
          date: dateObj,
        },
      },
    });

    return NextResponse.json(
      { data: serializeBigInt(deleted), message: "Absensi berhasil dibatalkan" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Absensi tidak ditemukan" }, { status: 404 });
  }
});
