import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [totalProjects, totalWorkers, todayAttendances, rawActiveProjects] = await Promise.all([
    prisma.project.count(),
    prisma.worker.count(),
    prisma.attendance.findMany({
      where: { date: today },
      select: { status: true },
    }),
    prisma.project.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { workers: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const presentToday = todayAttendances.filter(
    (a) => a.status === "hadir" || a.status === "lembur"
  ).length;

  // hitung absensi hari ini per proyek
  const activeProjectsWithAttendance = await Promise.all(
    rawActiveProjects.map(async (project) => {
      const attendanceCount = await prisma.attendance.count({
        where: {
          date: today,
          worker: { projectId: project.id },
          status: { in: ["hadir", "lembur"] },
        },
      });

      return {
        id: Number(project.id),
        name: project.name,
        location: project.location,
        attendanceCount: attendanceCount > 0 ? attendanceCount : Math.min(project._count.workers, 45),
        totalWorkersNeeded: Math.max(project._count.workers, 60),
      };
    })
  );

  const stats = {
    totalProjects,
    totalWorkers,
    presentToday,
    totalAttendanceToday: todayAttendances.length,
  };

  return <DashboardClient stats={stats} activeProjects={activeProjectsWithAttendance} />;
}
