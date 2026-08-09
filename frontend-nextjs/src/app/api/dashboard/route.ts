import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [todayAttendances, totalWorkers, totalProjects, activeProjects, activeWorkers] =
    await Promise.all([
      prisma.attendance.findMany({
        where: { date: today },
        select: { status: true, wage: true },
      }),
      prisma.worker.count(),
      prisma.project.count(),
      prisma.project.count({ where: { isActive: true } }),
      prisma.worker.count({ where: { isActive: true } }),
    ]);

  const todayStats = todayAttendances.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      acc.total_expense += a.wage;
      return acc;
    },
    { hadir: 0, lembur: 0, cor: 0, alpha: 0, total_expense: 0 } as Record<string, number>
  );

  return NextResponse.json({
    data: {
      today_present: todayStats.hadir,
      today_overtime: todayStats.lembur,
      today_cor: todayStats.cor,
      today_alpha: todayStats.alpha,
      today_expense: todayStats.total_expense,
      total_workers: totalWorkers,
      total_projects: totalProjects,
      active_projects: activeProjects,
      active_workers: activeWorkers,
    },
  });
});
