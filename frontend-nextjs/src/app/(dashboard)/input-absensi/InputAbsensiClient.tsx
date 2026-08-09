"use client";

import { useState } from "react";
import type { AttendanceStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";

interface ProjectOption { id: number; name: string }
interface WorkerRow {
  worker_id: number; worker_name: string; position: string;
  current_status: AttendanceStatus | null;
}

const STATUS_OPTIONS: AttendanceStatus[] = ["hadir", "lembur", "cor", "alpha"];
const STATUS_LABELS: Record<AttendanceStatus, string> = { hadir: "Hadir", lembur: "Lembur", cor: "Cor", alpha: "Alpha" };
const STATUS_COLORS: Record<AttendanceStatus, string> = {
  hadir:  "bg-emerald-500 text-white border-emerald-500",
  lembur: "bg-blue-500 text-white border-blue-500",
  cor:    "bg-amber-500 text-white border-amber-500",
  alpha:  "bg-red-500 text-white border-red-500",
};
const STATUS_COLORS_INACTIVE = "bg-white text-stone-400 border-stone-200 hover:border-stone-300";

export function InputAbsensiClient({ projects }: { projects: ProjectOption[] }) {
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState(today);
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadWorkers(projectId: number, date: string) {
    if (!projectId) return;
    setLoadingWorkers(true); setSaved(false);
    try {
      const res = await fetch(`/api/attendance/project/${projectId}?date=${date}`);
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setWorkers(data);
      const prefill: Record<number, AttendanceStatus> = {};
      for (const w of data as WorkerRow[]) { if (w.current_status) prefill[w.worker_id] = w.current_status; }
      setStatuses(prefill);
    } catch { toast.error("Gagal memuat data pekerja"); setWorkers([]); }
    finally { setLoadingWorkers(false); }
  }

  const allFilled = workers.length > 0 && workers.every(w => statuses[w.worker_id]);

  async function handleSave() {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: selectedProject, date: selectedDate,
          attendances: workers.map(w => ({ worker_id: w.worker_id, status: statuses[w.worker_id] ?? "alpha" })) }),
      });
      if (!res.ok) { toast.error("Gagal menyimpan absensi"); return; }
      setSaved(true); toast.success("Absensi berhasil disimpan");
      loadWorkers(selectedProject, selectedDate);
    } catch { toast.error("Tidak dapat terhubung ke server"); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Input Absensi</h1>
        <p className="page-subtitle">Catat kehadiran pekerja per hari</p>
      </div>

      {/* Filter card */}
      <div className="card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ab-project" className="input-label">Proyek</label>
          <select id="ab-project" className="input-field" value={selectedProject}
            onChange={e => { const id = Number(e.target.value); setSelectedProject(id); loadWorkers(id, selectedDate); }}>
            <option value={0} disabled>Pilih proyek...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ab-date" className="input-label">Tanggal</label>
          <input id="ab-date" type="date" className="input-field" value={selectedDate} max={today}
            onChange={e => { setSelectedDate(e.target.value); loadWorkers(selectedProject, e.target.value); }} />
        </div>
      </div>

      {/* Loading */}
      {loadingWorkers && (
        <div className="card flex items-center justify-center py-14">
          <div className="flex items-center gap-2.5 text-stone-400">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="text-sm font-medium">Memuat data pekerja...</span>
          </div>
        </div>
      )}

      {!loadingWorkers && workers.length > 0 && (
        <div className="card p-0 overflow-hidden">
          {/* Toolbar: isi semua */}
          <div className="px-4 py-3 border-b border-stone-100 flex flex-wrap items-center gap-2 justify-between">
            <span className="text-sm font-medium text-stone-600">{workers.length} pekerja</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-400 hidden sm:inline">Isi semua:</span>
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => { const a: Record<number,AttendanceStatus> = {}; workers.forEach(w => a[w.worker_id]=s); setStatuses(a); }}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border-2 transition-all ${STATUS_COLORS[s]}`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Worker rows — stacked on mobile, table-like on sm+ */}
          <div className="divide-y divide-stone-100">
            {workers.map(w => (
              <div key={w.worker_id} className="px-4 py-3.5">
                {/* Name + position row */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">{w.worker_name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{w.position}</p>
                  </div>
                </div>
                {/* Status buttons — 2x2 grid on xs, single row on sm */}
                <div className="grid grid-cols-2 sm:flex gap-2" role="group" aria-label={`Status ${w.worker_name}`}>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} type="button"
                      onClick={() => setStatuses(prev => ({ ...prev, [w.worker_id]: s }))}
                      className={`text-xs py-2 px-3 rounded-xl font-semibold border-2 transition-all
                        ${statuses[w.worker_id] === s ? STATUS_COLORS[s] : STATUS_COLORS_INACTIVE}`}
                      aria-pressed={statuses[w.worker_id] === s}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer save */}
          <div className="px-4 py-3.5 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
            {saved && (
              <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Tersimpan
              </span>
            )}
            {!saved && <div/>}
            <button onClick={handleSave} disabled={saving || !allFilled}
              className="btn-primary ml-auto">
              {saving ? "Menyimpan..." : "Simpan Absensi"}
            </button>
          </div>
        </div>
      )}

      {!loadingWorkers && workers.length === 0 && selectedProject > 0 && (
        <div className="card text-center py-14 text-stone-400 text-sm">
          Tidak ada pekerja aktif di proyek ini
        </div>
      )}
    </div>
  );
}
