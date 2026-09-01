import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  project_id: z.number().int().positive().optional(),
  position_id: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const worker = await prisma.worker.findUnique({
    where: { id: BigInt(id) },
    include: {
      project: { select: { id: true, name: true } },
      position: { select: { id: true, name: true, dailyWage: true, overtimeWage: true, castingWage: true } },
    },
  });
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: serializeBigInt(worker) });
});

export const PUT = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Jika project_id diubah, validasi bahwa proyek target masih aktif
  if (parsed.data.project_id !== undefined) {
    const project = await prisma.project.findUnique({
      where: { id: BigInt(parsed.data.project_id) },
      select: { isActive: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }

    if (!project.isActive) {
      return NextResponse.json(
        { error: `Tidak dapat memindahkan pekerja ke proyek "${project.name}" karena proyek sudah selesai` },
        { status: 400 }
      );
    }
  }

  const worker = await prisma.worker.update({
    where: { id: BigInt(id) },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
      ...(parsed.data.address !== undefined && { address: parsed.data.address }),
      ...(parsed.data.project_id !== undefined && { projectId: BigInt(parsed.data.project_id) }),
      ...(parsed.data.position_id !== undefined && { positionId: BigInt(parsed.data.position_id) }),
      ...(parsed.data.is_active !== undefined && { isActive: parsed.data.is_active }),
    },
    include: {
      project: { select: { id: true, name: true } },
      position: { select: { id: true, name: true, dailyWage: true, overtimeWage: true, castingWage: true } },
    },
  });

  return NextResponse.json({ data: serializeBigInt(worker) });
});

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.worker.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ message: "Deleted" });
});
