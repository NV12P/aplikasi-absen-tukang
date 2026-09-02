"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AttendanceStatus } from "@/generated/client";
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
}

interface WorkerAttendanceState {
  status: AttendanceStatus | undefined; // undefined = belum dipilih
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProject, setSelectedProject] = useState<string>(searchParams.get("project") ?? "");
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [attendance, setAttendance] = useState<Record<number, WorkerAttendanceState>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [todayDate, setTodayDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("q") ?? "");

  // Update URL params tanpa reload
  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  function handleProjectChange(val: string) {
    setSelectedProject(val);
    updateParams({ project: val });
  }

  function handleSearchChange(val: string) {
    setSearchTerm(val);
    updateParams({ q: val });
  }

  useEffect(() => {
    setTodayDate(formatDate(new Date()));
  }, []);

  useEffect(() => {
    async function loadWorkers() {
      if (!selectedProject) {
        setWorkers([]);
        setAttendance({});
        setSearchTerm("");
        updateParams({ q: "" }); // clear search dari URL juga
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
        
        // Parse status dari URL (jika ada pilihan sebelumnya)
        const statusParam = searchParams.get("status");
        console.log("🔍 Status from URL:", statusParam);
        let statusFromUrl: Record<number, AttendanceStatus> = {};
        if (statusParam) {
          try {
            const decoded = decodeURIComponent(statusParam);
            console.log("  Decoded:", decoded);
            statusFromUrl = JSON.parse(decoded);
            console.log("  Parsed:", statusFromUrl);
          } catch (e) {
            console.error("  Parse error:", e);
          }
        }

        (data as WorkerRow[]).forEach((w) => {
          initialState[w.worker_id] = {
            // Prioritas: 1. Sudah save (dari DB), 2. Pilihan sementara (dari URL), 3. undefined
            status: w.current_status || statusFromUrl[w.worker_id] || undefined,
          };
        });
        
        console.log("📥 Loaded attendance state:", {
          fromDB: data.filter((w: WorkerRow) => w.current_status).length,
          fromURL: Object.keys(statusFromUrl).length,
          total: Object.keys(initialState).length
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
    setAttendance((prev) => {
      const currentWorkerStatus = prev[workerId]?.status;
      
      // Toggle: jika klik tombol yang sama, unselect (jadi undefined)
      const newStatus = currentWorkerStatus === status ? undefined : status;
      
      console.log("👆 Toggle:", { workerId, from: currentWorkerStatus, to: newStatus });
      
      return {
        ...prev,
        [workerId]: { status: newStatus },
      };
    });
  }

  // Effect untuk sync attendance ke URL (persist pilihan sementara)
  useEffect(() => {
    if (workers.length === 0) return;

    // Hanya simpan worker yang belum diabsen (belum save) dan sudah pilih status
    const tempSelections: Record<number, AttendanceStatus> = {};
    Object.entries(attendance).forEach(([id, state]) => {
      const worker = workers.find(w => w.worker_id === Number(id));
      // Hanya simpan jika: belum diabsen DAN sudah pilih status
      if (worker && !worker.already_attended && state.status) {
        tempSelections[Number(id)] = state.status;
      }
    });

    // Update URL dengan pilihan sementara
    const statusParam = Object.keys(tempSelections).length > 0 
      ? encodeURIComponent(JSON.stringify(tempSelections))
      : "";
    
    // Hanya update jika berbeda dengan URL saat ini
    const currentStatus = searchParams.get("status") || "";
    if (statusParam !== currentStatus) {
      console.log("🔄 Updating URL with temp selections:", tempSelections);
      updateParams({ status: statusParam });
    }
  }, [attendance, workers]);

  async function handleSave() {
    if (!selectedProject) {
      toast.error("Silakan pilih proyek terlebih dahulu!");
      return;
    }

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Filter: hanya worker yang sudah pilih status yang akan di-submit
      const workersToSubmit = workers
        .filter((w) => !w.already_attended) // belum diabsen hari ini
        .filter((w) => attendance[w.worker_id]?.status !== undefined) // sudah pilih status
        .map((w) => ({
          worker_id: w.worker_id,
          status: attendance[w.worker_id].status!,
        }));

      if (workersToSubmit.length === 0) {
        toast.error("Tidak ada pekerja yang dipilih statusnya!");
        setSubmitting(false);
        return;
      }

      const payload = {
        project_id: Number(selectedProject),
        date: today,
        attendances: workersToSubmit,
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

      // Reload data worker dengan status terbaru dari database
      const updatedRes = await fetch(`/api/attendance/project/${selectedProject}?date=${today}`);
      if (updatedRes.ok) {
        const { data } = await updatedRes.json();
        setWorkers(data);
        
        // Update attendance state dengan data terbaru
        const updatedState: Record<number, WorkerAttendanceState> = {};
        (data as WorkerRow[]).forEach((w) => {
          updatedState[w.worker_id] = {
            status: w.current_status || undefined,
          };
        });
        setAttendance(updatedState);
        
        // Clear URL params status karena sudah tersimpan di database
        updateParams({ status: "" });
      }
      
      router.refresh(); // Auto-refresh untuk update UI
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan absensi");
    } finally {
      setSubmitting(false);
    }
  }

  const hasUnsavedChanges = workers.some(
    (w) => !w.already_attended && attendance[w.worker_id]?.status !== undefined && attendance[w.worker_id]?.status !== w.current_status
  );

  // Filter workers berdasarkan search term
  const filteredWorkers = workers.filter((w) =>
    w.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.position.toLowerCase().includes(searchTerm.toLowerCase())
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
            onChange={handleProjectChange}
            placeholder="Pilih Proyek..."
            style={{ minWidth: "220px" }}
            options={[
              { value: "", label: "Pilih Proyek..." },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
        <div className="page-toolbar-right">
          {/* Search input - hanya tampil kalau sudah pilih proyek dan ada pekerja */}
          {selectedProject && workers.length > 0 && (
            <div style={{ position: "relative" }}>
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari pekerja..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  paddingLeft: "32px",
                  paddingRight: searchTerm ? "32px" : "12px",
                  paddingTop: "9px",
                  paddingBottom: "9px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  width: "200px",
                  backgroundColor: "var(--card-bg)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-color)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
              />
              {/* Clear button */}
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange("")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

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

      {/* Filter stats - tampil saat ada search */}
      {searchTerm && workers.length > 0 && (
        <div style={{ 
          marginBottom: "8px", 
          fontSize: "13px", 
          color: "var(--text-muted)",
          paddingLeft: "2px",
        }}>
          Menampilkan <strong>{filteredWorkers.length}</strong> dari <strong>{workers.length}</strong> pekerja
          {filteredWorkers.length === 0 && (
            <span style={{ color: "var(--danger)", marginLeft: "4px" }}>
              — tidak ditemukan
            </span>
          )}
        </div>
      )}

      {/* Table Card */}
      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="table" style={{ minWidth: "640px" }}>
            <thead>
              <tr>
                <th style={{ width: "48px", textAlign: "center" }}>No</th>
                <th style={{ width: "35%" }}>Nama Pekerja</th>
                <th style={{ width: "65%" }}>Kehadiran</th>
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
              ) : filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Tidak ada pekerja dengan nama &quot;{searchTerm}&quot;.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker, index) => {
                  const isAlreadyAttended = !!worker.already_attended;
                  const currentStatus = attendance[worker.worker_id]?.status; // bisa undefined

                  return (
                    <tr key={worker.worker_id}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>{index + 1}</td>
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
                              style={{ opacity: isAlreadyAttended ? 0.5 : 1, cursor: isAlreadyAttended ? 'not-allowed' : 'pointer' }}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isAlreadyAttended) {
                                  handleStatusChange(worker.worker_id, status);
                                }
                              }}
                            >
                              <input
                                type="radio"
                                disabled={isAlreadyAttended}
                                name={`status-${worker.worker_id}`}
                                checked={currentStatus === status}
                                onChange={() => {}} // Dummy onChange untuk controlled component
                                style={{ pointerEvents: 'none' }}
                              />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </label>
                          ))}
                        </div>
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
