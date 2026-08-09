import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/wage";

export default async function DashboardPage() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [todayAttendances, totalWorkers, totalProjects, activeProjects, activeWorkers] =
    await Promise.all([
      prisma.attendance.findMany({ where: { date: today }, select: { status: true, wage: true } }),
      prisma.worker.count(),
      prisma.project.count(),
      prisma.project.count({ where: { isActive: true } }),
      prisma.worker.count({ where: { isActive: true } }),
    ]);

  const stats = todayAttendances.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      acc.total_expense += a.wage;
      return acc;
    },
    { hadir: 0, lembur: 0, cor: 0, alpha: 0, total_expense: 0 } as Record<string, number>
  );

  const formatDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(new Date());

  const attendanceCards = [
    { label: "Hadir",  value: stats.hadir,  bg: "bg-emerald-50", icon: "✓", iconColor: "text-emerald-600", ring: "ring-emerald-100" },
    { label: "Lembur", value: stats.lembur, bg: "bg-blue-50",    icon: "⏱", iconColor: "text-blue-600",    ring: "ring-blue-100"    },
    { label: "Cor",    value: stats.cor,    bg: "bg-amber-50",   icon: "🔧", iconColor: "text-amber-600",   ring: "ring-amber-100"   },
    { label: "Alpha",  value: stats.alpha,  bg: "bg-red-50",     icon: "✗", iconColor: "text-red-600",     ring: "ring-red-100"     },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle capitalize">{formatDate}</p>
        </div>
        {/* Accent pill */}
        <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-100 text-amber-700
                         text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Absensi hari ini */}
      <div>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Absensi Hari Ini</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {attendanceCards.map((card) => (
            <div key={card.label}
              className={`card flex items-center gap-3 sm:gap-4 ring-1 ${card.ring} border-transparent p-4 sm:p-6`}>
              <div className={`w-11 h-11 rounded-xl ${card.bg} ring-1 ${card.ring}
                              flex items-center justify-center flex-shrink-0`}>
                <span className={`text-lg font-bold ${card.iconColor}`}>{card.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{card.value}</p>
                <p className="text-xs text-stone-500 font-medium">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total pengeluaran — amber hero card */}
      <div className="rounded-2xl bg-amber-gradient p-4 sm:p-6 flex items-center justify-between shadow-card-md glow-amber">
        <div>
          <p className="text-amber-100 text-sm font-medium">Total Pengeluaran Hari Ini</p>
          <p className="text-3xl font-bold text-white mt-1">{formatRupiah(stats.total_expense)}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Summary */}
      <div>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Ringkasan</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Proyek",  value: totalProjects,  sub: `${activeProjects} aktif` },
            { label: "Total Pekerja", value: totalWorkers,   sub: `${activeWorkers} aktif` },
            { label: "Proyek Aktif",  value: activeProjects, sub: "berjalan" },
            { label: "Pekerja Aktif", value: activeWorkers,  sub: "bertugas" },
          ].map((item) => (
            <div key={item.label} className="card text-center hover:shadow-card-md transition-shadow">
              <p className="text-3xl font-bold text-stone-900">{item.value}</p>
              <p className="text-sm font-semibold text-stone-600 mt-1">{item.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
