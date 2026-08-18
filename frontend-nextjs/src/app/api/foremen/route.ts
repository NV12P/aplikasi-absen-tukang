import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const foremanSchema = z.object({
  project_id: z.number().int().positive(),
  name: z.string().min(1, "Nama kepala tukang wajib diisi"),
  phone: z.string().optional().nullable(),
});

// GET /api/foremen?project_id=1
export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return NextResponse.json({ error: "project_id wajib diisi" }, { status: 422 });
  }

  const foreman = await prisma.foreman.findUnique({
    where: { projectId: BigInt(projectId) },
    include: { project: true },
  });

  if (!foreman) {
    return NextResponse.json({ data: null });
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

// POST /api/foremen
export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = foremanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: BigInt(parsed.data.project_id) },
  });

  if (!project) {
    return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
  }

  // Check if foreman already exists for this project
  const existing = await prisma.foreman.findUnique({
    where: { projectId: BigInt(parsed.data.project_id) },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Proyek ini sudah memiliki kepala tukang" },
      { status: 400 }
    );
  }

  const foreman = await prisma.foreman.create({
    data: {
      projectId: BigInt(parsed.data.project_id),
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
    },
  });

  return NextResponse.json(
    {
      data: {
        id: Number(foreman.id),
        project_id: Number(foreman.projectId),
        name: foreman.name,
        phone: foreman.phone,
      },
    },
    { status: 201 }
  );
});
