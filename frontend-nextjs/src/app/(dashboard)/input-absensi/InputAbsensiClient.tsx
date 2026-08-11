"use client";

import { useState, useEffect } from "react";
import type { AttendanceStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface ProjectOption {
  id: number;
  name: string;
}

interface WorkerRow {
  worker_id: number;
  worker_name: string;
  position: string;
  already_attended?: boolean;
  current_status: AttendanceStatus | null;
  current_note?: string;
}

interface WorkerAttendanceState {
  status: AttendanceStatus | "";
  note: string;
}

// Helper: format tanggal ke format Indonesia
function formatDate(date: Date): string {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayName = dayNames[date.getDay()];
  const dateStr = date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  return `${dayName}, ${dateStr}`;
}

export function InputAbsensiClient({ projects }: { projects: ProjectOption[] }) {
  const toast = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [attendance, setAttendance] = useState<Record<number, WorkerAttendanceState>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [todayDate, setTodayDate] = useState<string>("");

  useEffect(() => {
    setTodayDate(formatDate(new Date()));
  }, []);

  useEffect(() => {
    async function loadWorkers() {
      if (!selectedProject) {
        setWorkers([]);
        setAttendance({});
        return;
      }

      setLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/attendance/project/${selectedProject}?date=${today}`);

        if (!res.ok) {
          throw new Error("Gagal memuat data pekerja");
        }

        const { data } = await res.json();
        setWorkers(data);

        const initialState: Record<number, WorkerAttendanceState> = {};
        (data as WorkerRow[]).forEach((w) => {
          initialState[w.worker_id] = {
            status: w.current_status || "hadir",
            note: w.current_note || "",
          };
        });
        setAttendance(initialState);
      } catch (err: any) {
        toast.error(err.message || "Gagal memuat data pekerja");
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    }

    loadWorkers();
  }, [selectedProject]);

  function handleStatusChange(workerId: number, status: AttendanceStatus) {
    setAttendance((prev) => ({
      ...prev,
      [workerId]: { ...(prev[workerId] || { note: "" }), status },
    }));
  }

  function handleNoteChange(workerId: number, note: string) {
    setAttendance((prev) => ({
      ...prev,
      [workerId]: { ...(prev[workerId] || { status: "hadir" }), note },
    }));
  }

  async function handleSave() {
    if (!selectedProject) {
      toast.error("Silakan pilih proyek terlebih dahulu!");
      return;
    }

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const payload = {
        project_id: Number(selectedProject),
        date: today,
        attendances: workers
          .filter((w) => !w.already_attended)
          .map((w) => ({
            worker_id: w.worker_id,
            status: attendance[w.worker_id]?.status || "hadir",
            note: attendance[w.worker_id]?.note || "",
          })),
      };

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan absensi");
      }

      toast.success("Data absensi berhasil disimpan!");

      const updatedRes = await fetch(`/api/attendance/project/${selectedProject}?date=${today}`);
      if (updatedRes.ok) {
        const { data } = await updatedRes.json();
        setWorkers(data);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan absensi");
    } finally {
      setSubmitting(false);
    }
  }

  const hasUnsavedChanges = workers.some(
    (w) => !w.already_attended && attendance[w.worker_id]?.status !== w.current_status
  );

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          {/* Card Hari & Tanggal */}
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginRight: "12px",
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ flexShrink: 0, color: "#64748b" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>
              {todayDate}
            </span>
          </div>

          <CustomSelect
            value={selectedProject}
            onChange={(val) => setSelectedProject(val)}
            placeholder="Pilih Proyek..."
            style={{ minWidth: "220px" }}
            options={[
              { value: "", label: "Pilih Proyek..." },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
        <div className="page-toolbar-right">
          <button
            className="btn-primary"
            style={{ padding: "10px 24px", borderRadius: "8px" }}
            onClick={handleSave}
            disabled={submitting || !selectedProject || workers.length === 0 || !hasUnsavedChanges}
          >
            {submitting ? "Menyimpan..." : "Simpan Absensi"}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="table" style={{ minWidth: "640px" }}>
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Nama Pekerja</th>
                <th style={{ width: "42%" }}>Kehadiran</th>
                <th style={{ width: "28%" }}>Keterangan (Opsional)</th>
              </tr>
            </thead>
            <tbody>
              {loading && !selectedProject ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "32px" }}>Loading...</td>
                </tr>
              ) : !selectedProject ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Silakan pilih proyek terlebih dahulu.
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Tidak ada pekerja yang ditugaskan di proyek ini.
                  </td>
                </tr>
              ) : (
                workers.map((worker) => {
                  const isAlreadyAttended = !!worker.already_attended;
                  const currentStatus = attendance[worker.worker_id]?.status || "hadir";

                  return (
                    <tr key={worker.worker_id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 600, fontSize: "14px" }}>
                              {worker.worker_name}
                            </span>
                            {isAlreadyAttended && (
                              <span
                                style={{
                                  background: "#dcfce7",
                                  color: "#166534",
                                  fontSize: "10px",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  border: "1px solid #bbf7d0",
                                }}
                              >
                                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Sudah Diabsen
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {worker.position || "-"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="radio-group">
                          {(["hadir", "lembur", "cor", "alpha"] as const).map((status) => (
                            <label
                              key={status}
                              className={`radio-label ${
                                currentStatus === status
                                  ? status === "alpha"
                                    ? "selected danger"
                                    : "selected"
                                  : ""
                              }`}
                              style={{ opacity: isAlreadyAttended ? 0.5 : 1 }}
                            >
                              <input
                                type="radio"
                                disabled={isAlreadyAttended}
                                name={`status-${worker.worker_id}`}
                                checked={currentStatus === status}
                                onChange={() => handleStatusChange(worker.worker_id, status)}
                              />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          disabled={isAlreadyAttended}
                          placeholder="Tambahkan catatan..."
                          className="input-field"
                          value={attendance[worker.worker_id]?.note || ""}
                          onChange={(e) => handleNoteChange(worker.worker_id, e.target.value)}
                          style={{ opacity: isAlreadyAttended ? 0.6 : 1 }}
                        />
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
