"use client";

import Link from "next/link";

interface DashboardStats {
  totalProjects: number;
  totalWorkers: number;
  presentToday: number;
  totalAttendanceToday: number;
}

interface ActiveProject {
  id: number;
  name: string;
  location: string;
  attendanceCount: number;
  totalWorkersNeeded: number;
}

export function DashboardClient({
  stats,
  activeProjects,
}: {
  stats: DashboardStats;
  activeProjects: ActiveProject[];
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="page-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--primary)", color: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" strokeWidth={1.75} />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Total Proyek</div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "4px" }}>{stats.totalProjects}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--bg-page)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div style={{ position: "absolute", top: "24px", right: "24px", fontSize: "12px", fontWeight: 600 }}>Aktif</div>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Total Pekerja</div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "4px" }}>{stats.totalWorkers}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#e0f2fe", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Hadir Hari Ini</div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "4px" }}>{stats.presentToday}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--bg-page)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={1.75} />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth={1.75} />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth={1.75} />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth={1.75} />
            </svg>
          </div>
          <div style={{ position: "absolute", top: "24px", right: "24px", fontSize: "12px", fontWeight: 600 }}>Hari Ini</div>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Total Absensi</div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "4px" }}>{stats.totalAttendanceToday}</div>
          </div>
        </div>
      </div>

      {/* Tabel Proyek Aktif */}
      <div className="card" style={{ padding: "0" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Proyek Aktif</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Kehadiran pekerja hari ini per lokasi proyek</p>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Lokasi</th>
                <th>Kehadiran Hari Ini</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>
                    Belum ada proyek aktif.
                  </td>
                </tr>
              ) : (
                activeProjects.map((project) => {
                  const percentage = project.totalWorkersNeeded > 0
                    ? Math.min((project.attendanceCount / project.totalWorkersNeeded) * 100, 100)
                    : 0;

                  return (
                    <tr key={project.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>{project.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          ID: PROJ-{currentYear}-{String(project.id).padStart(3, "0")}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{project.location}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div className="attendance-progress-bar">
                            <div
                              className="attendance-progress-fill"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                            {project.attendanceCount}/{project.totalWorkersNeeded}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Link href="/proyek" style={{ color: "var(--text-main)" }}>
                          <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
