import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  daily_wage: z.number().int().min(0).optional(),
  overtime_wage: z.number().int().min(0).optional(),
  casting_wage: z.number().int().min(0).optional(),
});

type Params = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const position = await prisma.position.findUnique({ where: { id: BigInt(id) } });
  if (!position) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: serializeBigInt(position) });
});

export const PUT = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const position = await prisma.position.update({
    where: { id: BigInt(id) },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.daily_wage !== undefined && { dailyWage: parsed.data.daily_wage }),
      ...(parsed.data.overtime_wage !== undefined && { overtimeWage: parsed.data.overtime_wage }),
      ...(parsed.data.casting_wage !== undefined && { castingWage: parsed.data.casting_wage }),
    },
  });

  return NextResponse.json({ data: serializeBigInt(position) });
});

export const DELETE = apiHandler(async (_req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.position.delete({ where: { id: BigInt(id) } });

  return NextResponse.json({ message: "Deleted" });
});
