import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

type Params = { params: Promise<{ id: string }> };

export const GET = apiHandler(async (req: NextRequest, { params }: Params) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const dateObj = new Date(dateStr + "T00:00:00.000Z");

  const workers = await prisma.worker.findMany({
    where: { projectId: BigInt(id), isActive: true },
    include: {
      position: { select: { name: true } },
      attendances: {
        where: { date: dateObj },
        select: { status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const data = workers.map((w) => ({
    worker_id: Number(w.id),
    worker_name: w.name,
    position: w.position?.name ?? "-",
    current_status: w.attendances[0]?.status ?? null,
    already_attended: w.attendances.length > 0,
  }));

  return NextResponse.json({ data });
});
