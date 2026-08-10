"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const emptyForm = {
  name: "",
  location: "",
  description: "",
  start_date: "",
  end_date: "",
  is_active: true,
};

export function ProyekClient({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();
  const activeCount = projects.filter((p) => p.isActive).length;
  const completedCount = projects.length - activeCount;

  function openAddModal() {
    setEditingProject(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(project: ProjectRow) {
    setEditingProject(project);
    setFormData({
      name: project.name,
      location: project.location,
      description: project.description || "",
      start_date: project.startDate || "",
      end_date: project.endDate || "",
      is_active: project.isActive,
    });
    setIsModalOpen(true);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          description: formData.description || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          is_active: formData.is_active,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Gagal menyimpan proyek");
        return;
      }

      const { data } = await res.json();
      setIsModalOpen(false);

      if (editingProject) {
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? data : p)));
        toast.success(`Proyek "${formData.name}" berhasil diperbarui.`);
      } else {
        setProjects((prev) => [data, ...prev]);
        toast.success(`Proyek "${formData.name}" berhasil ditambahkan.`);
      }
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan proyek");
    } finally {
      setSubmitting(false);
    }
  }

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

      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="table" style={{ minWidth: "550px" }}>
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>
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
                    <td>
                      {project.isActive ? (
                        <span className="badge" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>Aktif</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: "#e2e8f0", color: "#475569" }}>Selesai</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ color: "var(--text-muted)" }} title="Edit" onClick={() => openEditModal(project)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProject ? "Edit Proyek" : "Tambah Proyek Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: "var(--text-muted)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Proyek</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Lokasi</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <CustomSelect
                    value={formData.is_active ? "true" : "false"}
                    onChange={(val) => setFormData({ ...formData, is_active: val === "true" })}
                    options={[
                      { value: "true", label: "Aktif" },
                      { value: "false", label: "Selesai" },
                    ]}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
