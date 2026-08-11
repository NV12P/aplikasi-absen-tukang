import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Semua query dijalankan paralel sekaligus — tidak ada N+1
  const [totalProjects, totalWorkers, todayAttendances, rawActiveProjects, todayAttendancePerProject] =
    await Promise.all([
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
      // 1 query untuk semua attendance hari ini per proyek (ganti N query loop)
      prisma.attendance.groupBy({
        by: ["workerId"],
        where: {
          date: today,
          status: { in: ["hadir", "lembur"] },
        },
        _count: { workerId: true },
      }).then(async (rows) => {
        // Ambil projectId untuk setiap workerId sekaligus
        if (rows.length === 0) return new Map<string, number>();
        const workerIds = rows.map((r) => r.workerId);
        const workers = await prisma.worker.findMany({
          where: { id: { in: workerIds } },
          select: { id: true, projectId: true },
        });
        const projectCount = new Map<string, number>();
        for (const w of workers) {
          const pid = w.projectId.toString();
          projectCount.set(pid, (projectCount.get(pid) ?? 0) + 1);
        }
        return projectCount;
      }),
    ]);

  const presentToday = todayAttendances.filter(
    (a) => a.status === "hadir" || a.status === "lembur"
  ).length;

  const activeProjectsWithAttendance = rawActiveProjects.map((project) => ({
    id: Number(project.id),
    name: project.name,
    location: project.location,
    attendanceCount: todayAttendancePerProject.get(project.id.toString()) ?? 0,
    totalWorkersNeeded: project._count.workers,
  }));

  const stats = {
    totalProjects,
    totalWorkers,
    presentToday,
    totalAttendanceToday: todayAttendances.length,
  };

  return <DashboardClient stats={stats} activeProjects={activeProjectsWithAttendance} />;
}
