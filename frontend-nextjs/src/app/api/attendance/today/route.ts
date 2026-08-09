import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/bigint";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const attendances = await prisma.attendance.findMany({
    where: { date: today },
    include: { worker: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: serializeBigInt(attendances) });
});
