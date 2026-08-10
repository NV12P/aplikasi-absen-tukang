"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Edit2, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface WorkerRow {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  projectId: number;
  positionId: number;
  project: { id: number; name: string } | null;
  position: { id: number; name: string; dailyWage: number } | null;
}

interface ProjectOption {
  id: number;
  name: string;
}

interface PositionOption {
  id: number;
  name: string;
  dailyWage: number;
}

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  project_id: "",
  position_id: "",
  is_active: true,
};

export function PekerjaClient({
  initialWorkers,
  projects,
  positions,
}: {
  initialWorkers: WorkerRow[];
  projects: ProjectOption[];
  positions: PositionOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [workers, setWorkers] = useState(initialWorkers);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerRow | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openAddModal() {
    setEditingWorker(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      position_id: positions.length > 0 ? String(positions[0].id) : "",
      project_id: selectedProject || (projects.length > 0 ? String(projects[0].id) : ""),
      is_active: true,
    });
    setIsModalOpen(true);
  }

  function openEditModal(worker: WorkerRow) {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone || "",
      address: worker.address || "",
      position_id: worker.positionId ? String(worker.positionId) : "",
      project_id: worker.projectId ? String(worker.projectId) : "",
      is_active: worker.isActive,
    });
    setIsModalOpen(true);
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pekerja "${name}"? Data pekerja ini beserta riwayatnya akan dihapus.`)) {
      return;
    }

    setDeleteId(id);
    try {
      const res = await fetch(`/api/workers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Gagal menghapus pekerja");
        return;
      }
      setWorkers((prev) => prev.filter((w) => w.id !== id));
      toast.success(`Pekerja "${name}" berhasil dihapus.`);
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
      const url = editingWorker ? `/api/workers/${editingWorker.id}` : "/api/workers";
      const method = editingWorker ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
          project_id: Number(formData.project_id),
          position_id: Number(formData.position_id),
          is_active: formData.is_active,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Gagal menyimpan pekerja");
        return;
      }

      const { data } = await res.json();
      setIsModalOpen(false);

      if (editingWorker) {
        setWorkers((prev) => prev.map((w) => (w.id === editingWorker.id ? data : w)));
        toast.success(`Data pekerja "${formData.name}" berhasil diperbarui.`);
      } else {
        setWorkers((prev) => [...prev, data]);
        toast.success(`Pekerja baru "${formData.name}" berhasil ditambahkan.`);
      }
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan pekerja");
    } finally {
      setSubmitting(false);
    }
  }

  const displayWorkers = selectedProject
    ? workers.filter((w) => String(w.projectId) === selectedProject)
    : workers;

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <CustomSelect
            value={selectedProject}
            onChange={(val) => setSelectedProject(val)}
            placeholder="Semua Proyek..."
            style={{ minWidth: "200px" }}
            options={[
              { value: "", label: "Semua Proyek..." },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
        <div className="page-toolbar-right">
          <button
            className="btn-primary"
            style={{ padding: "10px 20px", borderRadius: "8px" }}
            onClick={openAddModal}
          >
            <UserPlus size={18} />
            <span>Tambah Pekerja</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="table" style={{ minWidth: "600px" }}>
            <thead>
              <tr>
                <th>Nama Pekerja</th>
                <th>Posisi / Jabatan</th>
                <th>Proyek</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayWorkers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px" }}>
                    {workers.length === 0
                      ? "Belum ada data pekerja. Silakan tambahkan pekerja baru."
                      : "Tidak ada pekerja di proyek ini."}
                  </td>
                </tr>
              ) : (
                displayWorkers.map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>{worker.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        {worker.phone || "No HP tidak tersedia"}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{worker.position?.name || "-"}</td>
                    <td style={{ color: "var(--text-muted)" }}>{worker.project?.name || "-"}</td>
                    <td>
                      {worker.isActive ? (
                        <span className="badge" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>Aktif</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>Nonaktif</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ color: "var(--text-muted)" }} title="Edit" onClick={() => openEditModal(worker)}>
                          <Edit2 size={18} />
                        </button>
                        <button
                          style={{ color: "var(--danger)" }}
                          title="Hapus"
                          disabled={deleteId === worker.id}
                          onClick={() => handleDelete(worker.id, worker.name)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingWorker ? "Edit Pekerja" : "Tambah Pekerja Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Pekerja</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>No HP (Opsional)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Jabatan</label>
                    <CustomSelect
                      value={formData.position_id}
                      onChange={(val) => setFormData({ ...formData, position_id: val })}
                      placeholder="Pilih Jabatan..."
                      options={[
                        { value: "", label: "Pilih Jabatan..." },
                        ...positions.map((p) => ({ value: p.id, label: p.name })),
                      ]}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Penugasan Proyek</label>
                  <CustomSelect
                    value={formData.project_id}
                    onChange={(val) => setFormData({ ...formData, project_id: val })}
                    placeholder="Pilih Proyek..."
                    options={[
                      { value: "", label: "Pilih Proyek..." },
                      ...projects.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <CustomSelect
                    value={formData.is_active ? "true" : "false"}
                    onChange={(val) => setFormData({ ...formData, is_active: val === "true" })}
                    options={[
                      { value: "true", label: "Aktif" },
                      { value: "false", label: "Nonaktif" },
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
