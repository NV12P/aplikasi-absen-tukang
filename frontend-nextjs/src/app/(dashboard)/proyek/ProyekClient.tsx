"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, X } from "lucide-react";
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
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
    setAddForm(emptyAddForm);
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
      setProjects((prev) => [data, ...prev]);
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
          start_date: editForm.start_date || null,
          end_date: editForm.end_date || null,
          is_active: editForm.is_active,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(typeof err?.error === "string" ? err.error : "Gagal menyimpan perubahan");
        return;
      }

      const { data } = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === editId ? data : p)));
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
          <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: "8px" }} onClick={openAddModal}>
            + Tambah Proyek Baru
          </button>
        </div>
      </div>

      {/* Tabel Proyek */}
      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="table" style={{ minWidth: "650px" }}>
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Lokasi</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px" }}>
                    Belum ada data proyek. Silakan tambahkan proyek baru.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
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
                    <td>{getStatusBadge(project)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ color: "var(--text-muted)" }} title="Edit" onClick={() => openEditModal(project)}>
                          <Edit2 size={18} />
                        </button>
                        <button
                          style={{ color: "var(--danger)" }}
                          title="Hapus"
                          disabled={deleteId === project.id}
                          onClick={() => handleDelete(project.id, project.name)}
                        >
                          <Trash2 size={18} />
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
                <X size={20} />
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
                <X size={20} />
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

                <div style={{ display: "flex", gap: "16px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Tgl Mulai</label>
                    <input
                      type="date"
                      className="input-field"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Tgl Selesai</label>
                    <input
                      type="date"
                      className="input-field"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <CustomSelect
                    value={editForm.is_active ? "true" : "false"}
                    onChange={(val) => setEditForm({ ...editForm, is_active: val === "true" })}
                    options={[
                      { value: "true", label: "Aktif" },
                      { value: "false", label: "Selesai" },
                    ]}
                  />
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
