"use client";

import { useState } from "react";
import type { AttendanceStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";

interface ProjectOption { id: number; name: string }

interface WorkerRow {
  worker_id: number;
  worker_name: string;
  position: string;
  current_status: AttendanceStatus | null;
}

const STATUS_OPTIONS: AttendanceStatus[] = ["hadir", "lembur", "cor", "alpha"];

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  hadir: "Hadir", lembur: "Lembur", cor: "Cor", alpha: "Alpha",
};

const STATUS_CLASS: Record<AttendanceStatus, string> = {
  hadir: "badge-hadir", lembur: "badge-lembur", cor: "badge-cor", alpha: "badge-alpha",
};

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
    setLoadingWorkers(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/attendance/project/${projectId}?date=${date}`);
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setWorkers(data);
      const prefill: Record<number, AttendanceStatus> = {};
      for (const w of data as WorkerRow[]) {
        if (w.current_status) prefill[w.worker_id] = w.current_status;
      }
      setStatuses(prefill);
    } catch {
      toast.error("Gagal memuat data pekerja");
      setWorkers([]);
    } finally {
      setLoadingWorkers(false);
    }
  }

  function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    setSelectedProject(id);
    loadWorkers(id, selectedDate);
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedDate(e.target.value);
    loadWorkers(selectedProject, e.target.value);
  }

  function setAllStatus(status: AttendanceStatus) {
    const all: Record<number, AttendanceStatus> = {};
    workers.forEach((w) => { all[w.worker_id] = status; });
    setStatuses(all);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const entries = workers.map((w) => ({
        worker_id: w.worker_id,
        status: statuses[w.worker_id] ?? "alpha",
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProject,
          date: selectedDate,
          attendances: entries,
        }),
      });

      if (!res.ok) {
        toast.error("Gagal menyimpan absensi");
        return;
      }

      setSaved(true);
      toast.success("Absensi berhasil disimpan");
      loadWorkers(selectedProject, selectedDate);
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setSaving(false);
    }
  }

  const allFilled = workers.length > 0 && workers.every((w) => statuses[w.worker_id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Input Absensi</h1>
        <p className="page-subtitle">Catat kehadiran pekerja per hari</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ab-project" className="input-label">Proyek</label>
            <select id="ab-project" className="input-field" value={selectedProject}
              onChange={handleProjectChange}>
              <option value={0} disabled>Pilih proyek...</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ab-date" className="input-label">Tanggal</label>
            <input id="ab-date" type="date" className="input-field" value={selectedDate}
              max={today} onChange={handleDateChange} />
          </div>
        </div>
      </div>

      {loadingWorkers ? (
        <div className="card flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memuat data pekerja...
          </div>
        </div>
      ) : workers.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-gray-500">{workers.length} pekerja</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Isi semua:</span>
              {STATUS_OPTIONS.map((s) => (
                <button key={s} onClick={() => setAllStatus(s)}
                  className={`text-xs px-2 py-1 rounded-full font-medium border ${STATUS_CLASS[s]}`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="table-container">
            <table className="table-base" aria-label="Input absensi pekerja">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Nama Pekerja</th>
                  <th className="table-th">Jabatan</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workers.map((w) => (
                  <tr key={w.worker_id} className="table-row">
                    <td className="table-td font-medium">{w.worker_name}</td>
                    <td className="table-td text-gray-500">{w.position}</td>
                    <td className="table-td">
                      <div className="flex gap-2 flex-wrap" role="group" aria-label={`Status ${w.worker_name}`}>
                        {STATUS_OPTIONS.map((s) => (
                          <button key={s} type="button"
                            onClick={() => setStatuses((prev) => ({ ...prev, [w.worker_id]: s }))}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium border-2 transition-all
                              ${statuses[w.worker_id] === s
                                ? `${STATUS_CLASS[s]} border-current scale-105`
                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                              }`}
                            aria-pressed={statuses[w.worker_id] === s}>
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            {saved && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tersimpan
              </span>
            )}
            <div className="ml-auto">
              <button onClick={handleSave} disabled={saving || !allFilled} className="btn-primary">
                {saving ? "Menyimpan..." : "Simpan Absensi"}
              </button>
            </div>
          </div>
        </div>
      ) : selectedProject ? (
        <div className="card text-center py-12 text-gray-400">
          Tidak ada pekerja aktif di proyek ini
        </div>
      ) : null}
    </div>
  );
}
