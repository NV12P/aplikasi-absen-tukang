import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const workerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  project_id: z.number().int().positive(),
  position_id: z.number().int().positive(),
  is_active: z.boolean().optional().default(true),
});

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workers = await prisma.worker.findMany({
    include: {
      project: { select: { id: true, name: true } },
      position: { select: { id: true, name: true, dailyWage: true, overtimeWage: true, castingWage: true } },
    },
    orderBy: { name: "asc" },
  });

  const res = NextResponse.json({ data: serializeBigInt(workers) });
  // Cache 30 detik di browser, stale 60 detik di background
  res.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
  return res;
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = workerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Validasi: cek apakah proyek masih aktif
  const project = await prisma.project.findUnique({
    where: { id: BigInt(parsed.data.project_id) },
    select: { isActive: true, name: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
  }

  if (!project.isActive) {
    return NextResponse.json(
      { error: `Tidak dapat menambahkan pekerja ke proyek "${project.name}" karena proyek sudah selesai` },
      { status: 400 }
    );
  }

  const worker = await prisma.worker.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      address: parsed.data.address ?? null,
      projectId: BigInt(parsed.data.project_id),
      positionId: BigInt(parsed.data.position_id),
      isActive: parsed.data.is_active ?? true,
    },
    include: {
      project: { select: { id: true, name: true } },
      position: { select: { id: true, name: true, dailyWage: true, overtimeWage: true, castingWage: true } },
    },
  });

  return NextResponse.json({ data: serializeBigInt(worker) }, { status: 201 });
});
