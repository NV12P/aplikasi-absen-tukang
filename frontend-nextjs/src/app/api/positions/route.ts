import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";
import { z } from "zod";

const positionSchema = z.object({
  name: z.string().min(1),
  daily_wage: z.number().int().min(0),
  overtime_wage: z.number().int().min(0),
  casting_wage: z.number().int().min(0),
});

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const positions = await prisma.position.findMany({ orderBy: { name: "asc" } });
  const res = NextResponse.json({ data: serializeBigInt(positions) });
  // Posisi jarang berubah — cache lebih lama: 60 detik, stale 120 detik
  res.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
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
      overtimeWage: parsed.data.overtime_wage,
      castingWage: parsed.data.casting_wage,
    },
  });

  return NextResponse.json({ data: serializeBigInt(position) }, { status: 201 });
});
