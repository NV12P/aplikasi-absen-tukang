import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  // start_date bisa diedit saat edit proyek
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id: BigInt(id) } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: serializeBigInt(project) });
});

export const PUT = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { name, location, description, start_date, end_date, is_active } = parsed.data;

  const project = await prisma.project.update({
    where: { id: BigInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(location !== undefined && { location }),
      ...(description !== undefined && { description }),
      ...(start_date !== undefined && { startDate: start_date ? new Date(start_date) : null }),
      ...(end_date !== undefined && { endDate: end_date ? new Date(end_date) : null }),
      ...(is_active !== undefined && { isActive: is_active }),
    },
  });

  return NextResponse.json({ data: serializeBigInt(project) });
});

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.project.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ message: "Deleted" });
});
