import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // 3 query paralel (sebelumnya 5) — workers & projects digabung pakai groupBy isActive
  const [todayAttendances, workerStats, projectStats] = await Promise.all([
    prisma.attendance.findMany({
      where: { date: today },
      select: { status: true, wage: true },
    }),
    // 1 query untuk total + active workers sekaligus
    prisma.worker.groupBy({
      by: ["isActive"],
      _count: { id: true },
    }),
    // 1 query untuk total + active projects sekaligus
    prisma.project.groupBy({
      by: ["isActive"],
      _count: { id: true },
    }),
  ]);

  // Hitung stats dari groupBy result
  const totalWorkers = workerStats.reduce((sum, g) => sum + g._count.id, 0);
  const activeWorkers = workerStats.find((g) => g.isActive === true)?._count.id ?? 0;
  const totalProjects = projectStats.reduce((sum, g) => sum + g._count.id, 0);
  const activeProjects = projectStats.find((g) => g.isActive === true)?._count.id ?? 0;

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
