"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  daily_wage: number;
  days: Record<string, "hadir" | "lembur" | "cor" | "alpha">;
  total_wage: number;
}

const HARI_PENDEK = ["M", "S", "S", "R", "K", "J", "S"];

const toDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayStr = (): string => toDateStr(new Date());

const getMondayOfWeek = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getWeekDates = (dateStr: string): Date[] => {
  const monday = getMondayOfWeek(dateStr);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const DayCell = ({ status }: { status?: string }) => {
  let bg = "transparent";
  let color = "var(--text-main)";
  let content: React.ReactNode = "";

  const norm = status ? status.toLowerCase().trim() : "";

  if (norm === "hadir" || norm === "lembur") {
    content = "✓";
    color = "#15803d";
  } else if (norm === "alpha") {
    bg = "#ef4444";
    color = "white";
  } else if (norm === "cor") {
    bg = "#9ca3af";
    color = "white";
  }

  return (
    <td
      style={{
        backgroundColor: bg,
        color,
        textAlign: "center",
        fontWeight: 800,
        fontSize: "16px",
        padding: "0",
        width: "44px",
        minWidth: "44px",
        height: "44px",
        verticalAlign: "middle",
        borderBottom: "1px solid var(--border-color)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {content}
    </td>
  );
};

export function RekapAbsensiClient({ projects }: { projects: ProjectOption[] }) {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = getTodayStr();
  const [selectedProject, setSelectedProject] = useState<string>(searchParams.get("project") ?? "");
  const [selectedWeek, setSelectedWeek] = useState<string>(searchParams.get("week") ?? today);
  const [workerRows, setWorkerRows] = useState<WorkerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

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

  function handleWeekChange(val: string) {
    setSelectedWeek(val);
    updateParams({ week: val });
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    updateParams({ q: val });
  }

  const weekDates = getWeekDates(selectedWeek);
  const dateFrom = toDateStr(weekDates[0]);

  useEffect(() => {
    async function loadReport() {
      if (!selectedProject) {
        setWorkerRows([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/report?project_id=${selectedProject}&week=${dateFrom}`);
        if (!res.ok) {
          throw new Error("Gagal memuat rekap");
        }

        const { data } = await res.json();
        const rawWorkers = data?.workers ?? [];

        setWorkerRows(
          rawWorkers.map((item: any) => ({
            worker_id: item.worker_id ?? item.id,
            worker_name: item.worker_name ?? item.name,
            position: item.position,
            daily_wage: item.daily_wage ?? 0,
            days: item.days ?? {},
            total_wage: item.total_wage ?? 0,
          }))
        );
      } catch (err: any) {
        toast.error(err.message || "Error fetching report");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [selectedProject, selectedWeek, dateFrom]);

  async function handleExport() {
    if (!selectedProject) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/attendance/export?project_id=${selectedProject}&date=${selectedWeek}`);
      if (!res.ok) {
        throw new Error("Gagal mengekspor file");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-absensi-${selectedWeek}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File Excel berhasil diunduh");
    } catch {
      toast.error("Gagal mengekspor rekap absensi");
    } finally {
      setExporting(false);
    }
  }

  const filteredRows = workerRows.filter((r) =>
    r.worker_name.toLowerCase().includes(search.toLowerCase())
  );

  const grandTotal = filteredRows.reduce((s, r) => s + r.total_wage, 0);
  const totalPekerja = filteredRows.length;
  const totalCols = 13;

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <CustomSelect
            value={selectedProject}
            onChange={handleProjectChange}
            placeholder="Pilih Proyek..."
            style={{ minWidth: "200px" }}
            options={[
              { value: "", label: "Pilih Proyek..." },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />

          <input
            type="date"
            className="select-field"
            style={{ minWidth: "150px" }}
            value={selectedWeek}
            onChange={(e) => handleWeekChange(e.target.value)}
          />
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
            Periode Minggu
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {weekDates[0].toLocaleDateString("id-ID")} - {weekDates[6].toLocaleDateString("id-ID")}
          </div>
        </div>

        <div className="page-toolbar-right">
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg
              width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari pekerja..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                paddingLeft: "32px",
                paddingRight: search ? "32px" : "12px",
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
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px", display: "flex", alignItems: "center" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            className="btn-outline"
            onClick={handleExport}
            disabled={!selectedProject || exporting}
            style={{
              opacity: !selectedProject || exporting ? 0.6 : 1,
              cursor: !selectedProject || exporting ? "not-allowed" : "pointer",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{exporting ? "Mengunduh..." : "Export"}</span>
          </button>
        </div>
      </div>

      {/* Filter stats - tampil saat ada search */}
      {search && workerRows.length > 0 && (
        <div style={{ marginBottom: "8px", fontSize: "13px", color: "var(--text-muted)", paddingLeft: "2px" }}>
          Menampilkan <strong>{filteredRows.length}</strong> dari <strong>{workerRows.length}</strong> pekerja
          {filteredRows.length === 0 && (
            <span style={{ color: "var(--danger)", marginLeft: "4px" }}>— tidak ditemukan</span>
          )}
        </div>
      )}

      {/* Card Ringkasan Compact */}
      <div className="rekap-summary-grid">
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              flexShrink: 0,
              backgroundColor: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d97706",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
              Total Upah Minggu Ini
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px", whiteSpace: "nowrap" }}>
              Rp {new Intl.NumberFormat("id-ID").format(grandTotal)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              flexShrink: 0,
              backgroundColor: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
              Total Pekerja
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "2px" }}>
              {totalPekerja}
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Rekap Presisi */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div className="table-container">
          <table
            className="table"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: "920px",
            }}
          >
            <colgroup>
              <col style={{ width: "44px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "70px" }} />
              <col style={{ width: "130px" }} />
            </colgroup>

            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th rowSpan={2} style={{ textAlign: "center", verticalAlign: "middle", borderRight: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "10px 4px" }}>
                  NO
                </th>
                <th rowSpan={2} style={{ textAlign: "left", verticalAlign: "middle", borderRight: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "10px 12px" }}>
                  NAMA PEKERJA
                </th>
                <th rowSpan={2} style={{ textAlign: "center", verticalAlign: "middle", borderRight: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "10px 8px" }}>
                  JABATAN
                </th>
                <th rowSpan={2} style={{ textAlign: "right", verticalAlign: "middle", borderRight: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "10px 12px" }}>
                  UPAH/HARI
                </th>
                <th
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid var(--border-color)",
                    borderRight: "1px solid var(--border-color)",
                    letterSpacing: "0.5px",
                    padding: "8px 4px",
                  }}
                >
                  HARI KERJA
                </th>
                <th rowSpan={2} style={{ textAlign: "center", verticalAlign: "middle", lineHeight: 1.2, borderRight: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "10px 4px" }}>
                  JML<br />HARI
                </th>
                <th rowSpan={2} style={{ textAlign: "right", verticalAlign: "middle", borderBottom: "1px solid var(--border-color)", padding: "10px 12px" }}>
                  JUMLAH UPAH
                </th>
              </tr>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {weekDates.map((d, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: "center",
                      padding: "6px 2px",
                      lineHeight: 1.3,
                      borderRight: "1px solid var(--border-color)",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>
                      {HARI_PENDEK[d.getDay()]}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>
                      {d.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={totalCols} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                    Memuat data rekap...
                  </td>
                </tr>
              ) : !selectedProject ? (
                <tr>
                  <td colSpan={totalCols} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                    Pilih proyek untuk melihat rekap absensi.
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                    Tidak ada data pekerja / rekap absensi untuk minggu ini.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const jmlHari = weekDates.reduce((n, d) => {
                    const s = row.days[toDateStr(d)];
                    return n + (s && s !== "alpha" ? 1 : 0);
                  }, 0);

                  return (
                    <tr key={row.worker_id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", borderRight: "1px solid var(--border-color)", padding: "8px 4px" }}>
                        {idx + 1}
                      </td>

                      <td style={{ borderRight: "1px solid var(--border-color)", padding: "8px 12px" }}>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>
                          {row.worker_name}
                        </div>
                      </td>

                      <td style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", borderRight: "1px solid var(--border-color)", padding: "8px 8px" }}>
                        {row.position}
                      </td>

                      <td style={{ textAlign: "right", fontWeight: 600, fontSize: "13px", borderRight: "1px solid var(--border-color)", padding: "8px 12px" }}>
                        {row.daily_wage ? new Intl.NumberFormat("id-ID").format(row.daily_wage) : "-"}
                      </td>

                      {weekDates.map((d) => (
                        <DayCell key={toDateStr(d)} status={row.days[toDateStr(d)]} />
                      ))}

                      <td style={{ textAlign: "center", fontWeight: 700, fontSize: "15px", borderRight: "1px solid var(--border-color)", padding: "8px 4px" }}>
                        {jmlHari}
                      </td>

                      <td style={{ textAlign: "right", fontWeight: 700, whiteSpace: "nowrap", fontSize: "14px", padding: "8px 12px" }}>
                        {new Intl.NumberFormat("id-ID").format(row.total_wage)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda */}
      <div
        style={{
          marginTop: "14px",
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          fontSize: "13px",
          color: "var(--text-muted)",
        }}
      >
        {[
          { color: "transparent", border: "1px solid var(--border-color)", label: "Hadir / Lembur", symbol: "✓" },
          { color: "#ef4444", label: "Alpha (Tidak Hadir)" },
          { color: "#9ca3af", label: "Cor" },
          { color: "transparent", border: "1px solid var(--border-color)", label: "Tidak Ada Data" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "22px",
                backgroundColor: item.color,
                border: item.border,
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 700,
                color: item.color === "transparent" ? "var(--text-main)" : "white",
                flexShrink: 0,
              }}
            >
              {item.symbol ?? ""}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
