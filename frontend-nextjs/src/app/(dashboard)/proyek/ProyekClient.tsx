"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface ProjectRow {
  id: number;
  name: string;
  location: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddForm {
  name: string;
  location: string;
  description: string;
  is_active: boolean;
}

interface EditForm {
  name: string;
  location: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const emptyAddForm: AddForm = {
  name: "",
  location: "",
  description: "",
  is_active: true,
};

export function ProyekClient({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("q") ?? "");
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get("status") ?? "all");

  // Update URL params tanpa reload
  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val && val !== "all") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  function handleSearchChange(val: string) {
    setSearchTerm(val);
    updateParams({ q: val });
  }

  function handleStatusChange(val: string) {
    setFilterStatus(val);
    updateParams({ status: val });
  }

  // ─── Modal Tambah State ──────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(emptyAddForm);
  const [addLoading, setAddLoading] = useState(false);

  // ─── Modal Edit State ────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    location: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });
  const [editLoading, setEditLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const activeCount = projects.filter((p) => p.isActive).length;
  const completedCount = projects.length - activeCount;

  function fmtDate(dateStr: string | null): string {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function openAddModal() {
    // Force fresh form dengan spread baru, pastikan is_active = true
    setAddForm({
      name: "",
      location: "",
      description: "",
      is_active: true,
    });
    setShowAddModal(true);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          location: addForm.location,
          description: addForm.description || null,
          is_active: addForm.is_active,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(typeof err?.error === "string" ? err.error : "Gagal menambahkan proyek");
        return;
      }

      const { data } = await res.json();
      const normalized = {
        id: data.id,
        name: data.name,
        location: data.location,
        description: data.description,
        startDate: data.start_date ? String(data.start_date).split("T")[0] : null,
        endDate: data.end_date ? String(data.end_date).split("T")[0] : null,
        isActive: data.is_active,
        createdAt: data.created_at ? String(data.created_at) : "",
        updatedAt: data.updated_at ? String(data.updated_at) : "",
      };
      setProjects((prev) => [normalized, ...prev]);
      setShowAddModal(false);
      toast.success(`Proyek "${addForm.name}" berhasil ditambahkan.`);
      router.refresh();
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setAddLoading(false);
    }
  }

  function openEditModal(p: ProjectRow) {
    setEditId(p.id);
    setEditForm({
      name: p.name,
      location: p.location,
      description: p.description ?? "",
      start_date: p.startDate ?? "",
      end_date: p.endDate ?? "",
      is_active: p.isActive,
    });
    setShowEditModal(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/projects/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          location: editForm.location,
          description: editForm.description || null,
          // start_date tidak dikirim karena readonly — tidak boleh diubah dari client
          // end_date: kirim jika diisi, null jika dikosongkan manual, undefined jika biarkan server auto-fill
          ...(editForm.end_date
            ? { end_date: editForm.end_date }
            : editForm.is_active
            ? { end_date: null }  // aktif → hapus end_date
            : {}),                 // selesai + kosong → server auto-fill hari ini
          is_active: editForm.is_active,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(typeof err?.error === "string" ? err.error : "Gagal menyimpan perubahan");
        return;
      }

      const { data } = await res.json();

      // Normalize snake_case dari API ke camelCase untuk state
      const normalized = {
        id: data.id,
        name: data.name,
        location: data.location,
        description: data.description,
        startDate: data.start_date ? String(data.start_date).split("T")[0] : null,
        endDate: data.end_date ? String(data.end_date).split("T")[0] : null,
        isActive: data.is_active,
        createdAt: data.created_at ? String(data.created_at) : "",
        updatedAt: data.updated_at ? String(data.updated_at) : "",
      };

      setProjects((prev) => prev.map((p) => (p.id === editId ? normalized : p)));
      setShowEditModal(false);
      toast.success(`Proyek "${editForm.name}" berhasil diperbarui.`);
      router.refresh();
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus proyek "${name}"? Data yang dihapus tidak dapat dikembalikan.`)) {
      return;
    }

    setDeleteId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Gagal menghapus proyek");
        return;
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Proyek "${name}" berhasil dihapus.`);
      router.refresh();
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setDeleteId(null);
    }
  }

  const getStatusBadge = (project: ProjectRow) => {
    if (!project.isActive) {
      return <span className="badge" style={{ backgroundColor: "#e2e8f0", color: "#475569" }}>Selesai</span>;
    }
    return <span className="badge" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>Aktif</span>;
  };

  const displayProjects = projects
    .filter((p) => filterStatus === "all" || (filterStatus === "active" ? p.isActive : !p.isActive))
    .filter((p) =>
      searchTerm === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700 }}>{activeCount}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Proyek Aktif</div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700 }}>{completedCount}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Proyek Selesai</div>
            </div>
          </div>
        </div>
        <div className="page-toolbar-right">
          {/* Filter Status */}
          <CustomSelect
            value={filterStatus}
            onChange={handleStatusChange}
            style={{ minWidth: "150px" }}
            options={[
              { value: "all", label: "Semua Status" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Selesai" },
            ]}
          />

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
              placeholder="Cari nama / lokasi..."
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
            {searchTerm && (
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

          <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: "8px" }} onClick={openAddModal}>
            + Tambah Proyek Baru
          </button>
        </div>
      </div>

      {/* Filter stats */}
      {(searchTerm || filterStatus !== "all") && (
        <div style={{ marginBottom: "8px", fontSize: "13px", color: "var(--text-muted)", paddingLeft: "2px" }}>
          Menampilkan <strong>{displayProjects.length}</strong> dari <strong>{projects.length}</strong> proyek
          {displayProjects.length === 0 && (
            <span style={{ color: "var(--danger)", marginLeft: "4px" }}>— tidak ditemukan</span>
          )}
        </div>
      )}

      {/* Tabel Proyek */}
      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="table" style={{ minWidth: "650px" }}>
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Lokasi</th>
                <th>Deskripsi</th>
                <th>Tgl Mulai</th>
                <th>Tgl Selesai</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                    {projects.length === 0
                      ? "Belum ada data proyek. Silakan tambahkan proyek baru."
                      : searchTerm
                      ? `Tidak ada proyek dengan nama "${searchTerm}".`
                      : "Tidak ada proyek yang sesuai filter."}
                  </td>
                </tr>
              ) : (
                displayProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>{project.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        ID: PROJ-{currentYear}-{String(project.id).padStart(3, "0")}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{project.location}</td>
                    <td style={{ color: "var(--text-muted)", maxWidth: "200px" }}>
                      <span className="truncate block" title={project.description ?? undefined}>
                        {project.description || <span style={{ color: "var(--text-light)", fontStyle: "italic" }}>-</span>}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {fmtDate(project.startDate)}
                    </td>
                    <td style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {fmtDate(project.endDate)}
                    </td>
                    <td>{getStatusBadge(project)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ color: "var(--text-muted)" }} title="Edit" onClick={() => openEditModal(project)}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          style={{ color: "var(--danger)" }}
                          title="Hapus"
                          disabled={deleteId === project.id}
                          onClick={() => handleDelete(project.id, project.name)}
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Tambah Proyek Baru ── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Tambah Proyek Baru</h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: "var(--text-muted)" }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Proyek</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    placeholder="Contoh: Pembangunan Ruko Graha"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Lokasi</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    placeholder="Contoh: Jl. Ahmad Yani No. 12"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi (Opsional)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Catatan tambahan mengenai proyek..."
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <CustomSelect
                    value={addForm.is_active ? "true" : "false"}
                    onChange={(val) => setAddForm({ ...addForm, is_active: val === "true" })}
                    options={[
                      { value: "true", label: "Aktif" },
                      { value: "false", label: "Selesai" },
                    ]}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={addLoading}>
                  {addLoading ? "Menyimpan..." : "Simpan Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Edit Proyek ── */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Proyek</h2>
              <button onClick={() => setShowEditModal(false)} style={{ color: "var(--text-muted)" }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Proyek</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Lokasi</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi (Opsional)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>

                {/* Tanggal Mulai — readonly, hanya info */}
                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Tanggal Mulai
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      background: "#fef3c7",
                      color: "#92400e",
                      padding: "1px 6px",
                      borderRadius: "999px",
                      border: "1px solid #fde68a",
                    }}>
                      otomatis
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    readOnly
                    disabled
                    value={editForm.start_date ? fmtDate(editForm.start_date) : "Belum diset"}
                    style={{ backgroundColor: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
                  />
                  <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                    Tanggal mulai ditetapkan otomatis saat proyek pertama kali dibuat.
                  </p>
                </div>

                {/* Tanggal Selesai — editable, auto-set saat status jadi Selesai */}
                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Tanggal Selesai
                    {!editForm.is_active && (
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        background: "#f1f5f9",
                        color: "#475569",
                        padding: "1px 6px",
                        borderRadius: "999px",
                        border: "1px solid #e2e8f0",
                      }}>
                        auto saat status &quot;Selesai&quot;
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    min={editForm.start_date || undefined}
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                  />
                  <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                    Kosongkan untuk mengisi otomatis saat status proyek diubah ke &quot;Selesai&quot;.
                  </p>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <CustomSelect
                    value={editForm.is_active ? "true" : "false"}
                    onChange={(val) => {
                      const isActive = val === "true";
                      setEditForm((prev) => ({
                        ...prev,
                        is_active: isActive,
                        // Kalau diubah ke Aktif → clear end_date di form
                        end_date: isActive ? "" : prev.end_date,
                      }));
                    }}
                    options={[
                      { value: "true", label: "Aktif" },
                      { value: "false", label: "Selesai" },
                    ]}
                  />
                  {!editForm.is_active && !editForm.end_date && (
                    <p style={{ fontSize: "11px", color: "#d97706", marginTop: "6px" }}>
                      ⚡ Tanggal selesai akan otomatis diisi hari ini saat disimpan.
                    </p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={editLoading}>
                  {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
