import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const foremanUpdateSchema = z.object({
  name: z.string().min(1, "Nama kepala tukang wajib diisi"),
  phone: z.string().optional().nullable(),
});

// GET /api/foremen/[id]
export const GET = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const foreman = await prisma.foreman.findUnique({
    where: { id: BigInt(id) },
    include: { project: true },
  });

  if (!foreman) {
    return NextResponse.json({ error: "Kepala tukang tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: Number(foreman.id),
      project_id: Number(foreman.projectId),
      name: foreman.name,
      phone: foreman.phone,
      project_name: foreman.project.name,
    },
  });
});

// PUT /api/foremen/[id]
export const PUT = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = foremanUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const foreman = await prisma.foreman.update({
    where: { id: BigInt(id) },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
    },
  });

  return NextResponse.json({
    data: {
      id: Number(foreman.id),
      project_id: Number(foreman.projectId),
      name: foreman.name,
      phone: foreman.phone,
    },
  });
});

// DELETE /api/foremen/[id]
export const DELETE = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.foreman.delete({
    where: { id: BigInt(id) },
  });

  return NextResponse.json({ message: "Kepala tukang berhasil dihapus" });
});
