import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = Number(searchParams.get("project_id"));
  const weekStr = searchParams.get("week") ?? new Date().toISOString().split("T")[0];

  if (!projectId) return NextResponse.json({ error: "project_id wajib diisi" }, { status: 422 });

  const weekStart = new Date(weekStr + "T00:00:00.000Z");
  const dayOfWeek = weekStart.getUTCDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setUTCDate(weekStart.getUTCDate() + diff);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  const [project, projectWorkers, attendances] = await Promise.all([
    prisma.project.findUnique({ where: { id: BigInt(projectId) }, select: { name: true } }),
    prisma.worker.findMany({
      where: { projectId: BigInt(projectId), isActive: true },
      include: { position: { select: { name: true, dailyWage: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.attendance.findMany({
      where: {
        worker: { projectId: BigInt(projectId) },
        date: { gte: weekStart, lte: weekEnd },
      },
      select: { workerId: true, date: true, status: true, wage: true },
    }),
  ]);

  if (!project) return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });

  const attMap = new Map<string, Map<string, { status: string; wage: number }>>();
  for (const att of attendances) {
    const key = att.workerId.toString();
    const dateKey = att.date.toISOString().split("T")[0];
    if (!attMap.has(key)) attMap.set(key, new Map());
    attMap.get(key)!.set(dateKey, { status: att.status, wage: att.wage });
  }

  const periodFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });

  const workers = projectWorkers.map((w) => {
    const workerAtt = attMap.get(w.id.toString()) ?? new Map();
    const days: Record<string, string> = {};
    let totalWage = 0;

    for (const [dateKey, { status, wage }] of workerAtt) {
      days[dateKey] = status;
      totalWage += wage;
    }

    return {
      worker_id: Number(w.id),
      worker_name: w.name,
      position: w.position?.name ?? "-",
      daily_wage: w.position?.dailyWage ?? 0,
      days,
      total_wage: totalWage,
    };
  });

  return NextResponse.json({
    data: {
      summary: {
        project: project.name,
        period: `${periodFormatter.format(weekStart)} - ${periodFormatter.format(weekEnd)}`,
        total_workers: workers.length,
        total_expense: workers.reduce((sum, w) => sum + w.total_wage, 0),
      },
      workers,
    },
  });
});
