import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const positionSchema = z.object({
  name: z.string().min(1),
  daily_wage: z.number().int().min(0),
  overtime_wage: z.union([z.number().int().min(0), z.null()]).optional(),
  casting_wage: z.union([z.number().int().min(0), z.null()]).optional(),
});

export const GET = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const position = await prisma.position.findUnique({ where: { id: BigInt(id) } });

  if (!position) return NextResponse.json({ error: "Position not found" }, { status: 404 });

  return NextResponse.json({ 
    data: {
      id: Number(position.id),
      name: position.name,
      daily_wage: position.dailyWage,
      overtime_wage: position.overtimeWage,
      casting_wage: position.castingWage,
    }
  });
});

export const PUT = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = positionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const position = await prisma.position.update({
    where: { id: BigInt(id) },
    data: {
      name: parsed.data.name,
      dailyWage: parsed.data.daily_wage,
      overtimeWage: parsed.data.overtime_wage ?? null,
      castingWage: parsed.data.casting_wage ?? null,
    },
  });

  return NextResponse.json({ 
    data: {
      id: Number(position.id),
      name: position.name,
      daily_wage: position.dailyWage,
      overtime_wage: position.overtimeWage,
      casting_wage: position.castingWage,
    }
  });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Check if position is used by workers
  const workersCount = await prisma.worker.count({
    where: { positionId: BigInt(id) },
  });

  if (workersCount > 0) {
    return NextResponse.json(
      { error: `Tidak dapat menghapus jabatan yang masih digunakan oleh ${workersCount} pekerja` },
      { status: 400 }
    );
  }

  await prisma.position.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ message: "Position deleted successfully" });
});
