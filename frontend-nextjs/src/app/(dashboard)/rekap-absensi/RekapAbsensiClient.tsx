"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/wage";
import type { AttendanceStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";

interface ProjectOption { id: number; name: string }

interface WorkerReportRow {
  worker_id: number;
  worker_name: string;
  position: string;
  daily_wage: number;
  days: Record<string, string>;
  total_wage: number;
}

interface WeeklyReport {
  summary: { project: string; period: string; total_workers: number; total_expense: number };
  workers: WorkerReportRow[];
}

const STATUS_SHORT: Record<string, string> = { hadir: "H", lembur: "L", cor: "C", alpha: "A" };
const STATUS_CLASS: Record<string, string> = {
  hadir: "badge-hadir", lembur: "badge-lembur", cor: "badge-cor", alpha: "badge-alpha",
};

function getWeekDates(weekStr: string): string[] {
  const base = new Date(weekStr);
  const day = base.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function RekapAbsensiClient({ projects }: { projects: ProjectOption[] }) {
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [selectedWeek, setSelectedWeek] = useState(today);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function loadReport(projectId: number, week: string) {
    if (!projectId) return;
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch(`/api/attendance/report?project_id=${projectId}&week=${week}`);
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setReport(data);
    } catch {
      toast.error("Gagal memuat rekap absensi");
    } finally {
      setLoading(false);
    }
  }

  function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    setSelectedProject(id);
    loadReport(id, selectedWeek);
  }

  function handleWeekChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedWeek(e.target.value);
    loadReport(selectedProject, e.target.value);
  }

  async function handleExport() {
    if (!selectedProject) return;
    setExporting(true);
    try {
      const res = await fetch(
        `/api/attendance/export?project_id=${selectedProject}&date=${selectedWeek}`
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap_absensi_${selectedWeek}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File Excel berhasil diunduh");
    } catch {
      toast.error("Gagal mengekspor file Excel");
    } finally {
      setExporting(false);
    }
  }

  const weekDates = getWeekDates(selectedWeek);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Rekap Absensi</h1>
          <p className="page-subtitle">Laporan kehadiran mingguan per proyek</p>
        </div>
        {report && (
          <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? "Mengekspor..." : "Export Excel"}
          </button>
        )}
      </div>

      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rek-project" className="input-label">Proyek</label>
            <select id="rek-project" className="input-field" value={selectedProject}
              onChange={handleProjectChange}>
              <option value={0} disabled>Pilih proyek...</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="rek-week" className="input-label">Pilih Minggu</label>
            <input id="rek-week" type="date" className="input-field" value={selectedWeek}
              onChange={handleWeekChange} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="card flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memuat rekap...
          </div>
        </div>
      )}

      {report && !loading && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { label: "Proyek", value: report.summary.project },
              { label: "Periode", value: report.summary.period },
              { label: "Total Pekerja", value: String(report.summary.total_workers) },
              { label: "Total Pengeluaran", value: formatRupiah(report.summary.total_expense) },
            ].map((item) => (
              <div key={item.label} className="card">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="card p-0 overflow-hidden">
            {/* Hint scroll di mobile */}
            <div className="sm:hidden px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              <span className="text-xs text-amber-600 font-medium">Geser ke kanan untuk lihat semua hari</span>
            </div>
            <div className="table-container overflow-x-auto">
              <table className="table-base min-w-[640px]" aria-label="Rekap absensi mingguan">
                <thead className="table-head">
                  <tr>
                    <th className="table-th sticky left-0 bg-gray-50 z-10">Pekerja</th>
                    <th className="table-th">Jabatan</th>
                    {weekDates.map((d, i) => (
                      <th key={d} className="table-th text-center min-w-[48px]">
                        <div className="text-xs font-semibold">{DAY_NAMES[i]}</div>
                        <div className="text-xs text-gray-400 font-normal">
                          {new Date(d + "T00:00:00").getDate()}/{new Date(d + "T00:00:00").getMonth() + 1}
                        </div>
                      </th>
                    ))}
                    <th className="table-th text-right">Total Upah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.workers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="table-td text-center text-gray-400 py-8">
                        Tidak ada data absensi untuk periode ini
                      </td>
                    </tr>
                  ) : (
                    report.workers.map((w) => (
                      <tr key={w.worker_id} className="table-row">
                        <td className="table-td font-medium sticky left-0 bg-white z-10">{w.worker_name}</td>
                        <td className="table-td text-gray-500 text-xs">{w.position}</td>
                        {weekDates.map((d) => {
                          const status = w.days[d] as AttendanceStatus | undefined;
                          return (
                            <td key={d} className="table-td text-center">
                              {status ? (
                                <span className={`${STATUS_CLASS[status]} text-xs`}>
                                  {STATUS_SHORT[status]}
                                </span>
                              ) : (
                                <span className="text-gray-200 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="table-td text-right font-medium">{formatRupiah(w.total_wage)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={9} className="table-td font-semibold text-xs sm:text-sm">Total Pengeluaran</td>
                    <td className="table-td text-right font-bold">{formatRupiah(report.summary.total_expense)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs flex-wrap">
            <span className="text-gray-400">Keterangan:</span>
            {[
              { code: "H", label: "Hadir", cls: "badge-hadir" },
              { code: "L", label: "Lembur", cls: "badge-lembur" },
              { code: "C", label: "Cor", cls: "badge-cor" },
              { code: "A", label: "Alpha", cls: "badge-alpha" },
            ].map((item) => (
              <span key={item.code} className={item.cls}>{item.code} = {item.label}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
