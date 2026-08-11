import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const positionSchema = z.object({
  name: z.string().min(1),
  daily_wage: z.number().int().min(0),
  overtime_wage: z.union([z.number().int().min(0), z.null()]).optional(),
  casting_wage: z.union([z.number().int().min(0), z.null()]).optional(),
});

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const positions = await prisma.position.findMany({ orderBy: { name: "asc" } });
  
  // Map camelCase ke snake_case untuk frontend
  const mapped = positions.map((p) => ({
    id: Number(p.id),
    name: p.name,
    daily_wage: p.dailyWage,
    overtime_wage: p.overtimeWage,
    casting_wage: p.castingWage,
  }));
  
  const res = NextResponse.json({ data: mapped });
  // Disable cache untuk master data yang sering berubah
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = positionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const position = await prisma.position.create({
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
  }, { status: 201 });
});
