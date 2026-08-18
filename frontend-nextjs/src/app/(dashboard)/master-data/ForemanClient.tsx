"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface Project {
  id: number;
  name: string;
  location: string;
}

interface Foreman {
  id: number;
  project_id: number;
  name: string;
  phone: string | null;
  project_name: string;
}

interface FormData {
  project_id: number | null;
  name: string;
  phone: string;
}

export function ForemanClient() {
  const toast = useToast();
  const router = useRouter();
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    project_id: null,
    name: "",
    phone: "",
  });

  // Load projects and foremen
  async function loadData() {
    setLoading(true);
    try {
      // Load all projects (tidak filter is_active dulu)
      const projectsRes = await fetch(`/api/projects?_t=${Date.now()}`);
      if (!projectsRes.ok) throw new Error("Gagal memuat data proyek");
      const projectsJson = await projectsRes.json();
      
      // Log untuk debug
      console.log("Projects loaded:", projectsJson.data);
      
      // Ambil semua project (tidak filter is_active)
      const allProjects = projectsJson.data || [];
      setProjects(allProjects);

      // Load all foremen
      const foremenList: Foreman[] = [];
      for (const project of allProjects) {
        const res = await fetch(`/api/foremen?project_id=${project.id}&_t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            foremenList.push(json.data);
          }
        }
      }
      console.log("Foremen loaded:", foremenList);
      setForemen(foremenList);
    } catch (err: any) {
      console.error("Load error:", err);
      toast.error(err.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open modal for create
  function handleCreate() {
    setEditingId(null);
    setFormData({ project_id: null, name: "", phone: "" });
    setShowModal(true);
  }

  // Open modal for edit
  function handleEdit(foreman: Foreman) {
    setEditingId(foreman.id);
    setFormData({
      project_id: foreman.project_id,
      name: foreman.name,
      phone: foreman.phone || "",
    });
    setShowModal(true);
  }

  // Submit form (create or update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.project_id && !editingId) {
      toast.error("Pilih proyek terlebih dahulu");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId ? `/api/foremen/${editingId}` : "/api/foremen";
      const method = editingId ? "PUT" : "POST";

      const body = editingId
        ? { name: formData.name, phone: formData.phone || null }
        : { project_id: formData.project_id, name: formData.name, phone: formData.phone || null };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menyimpan data");
      }

      toast.success(editingId ? "Kepala tukang berhasil diupdate" : "Kepala tukang berhasil ditambahkan");
      setShowModal(false);
      await loadData();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete foreman
  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus kepala tukang ini?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/foremen/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus kepala tukang");

      toast.success("Kepala tukang berhasil dihapus");
      await loadData();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus kepala tukang");
    } finally {
      setDeleting(null);
    }
  }

  // Get available projects (projects without foreman)
  const availableProjects = projects.filter(
    (p) => !foremen.some((f) => f.project_id === p.id)
  );

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <h1 className="page-title">Kepala Tukang</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            Kelola kepala tukang per proyek (tidak ikut absensi, hanya muncul di rekap)
          </p>
        </div>
        <div className="page-toolbar-right">
          <button
            className="btn-primary"
            style={{ padding: "10px 20px", borderRadius: "8px" }}
            onClick={handleCreate}
            disabled={availableProjects.length === 0}
          >
            + Tambah Kepala Tukang
          </button>
        </div>
      </div>



      {/* Table Card */}
      <div className="card" style={{ padding: "0" }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>No</th>
                <th style={{ width: "35%" }}>Nama Proyek</th>
                <th style={{ width: "25%" }}>Nama Kepala Tukang</th>
                <th style={{ width: "20%" }}>No. Telepon</th>
                <th style={{ width: "15%", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px" }}>
                    Loading...
                  </td>
                </tr>
              ) : foremen.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Belum ada data kepala tukang
                  </td>
                </tr>
              ) : (
                foremen.map((foreman, idx) => (
                  <tr key={foreman.id}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{foreman.project_name}</td>
                    <td>{foreman.name}</td>
                    <td>{foreman.phone || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => handleEdit(foreman)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => handleDelete(foreman.id)}
                          disabled={deleting === foreman.id}
                        >
                          {deleting === foreman.id ? "..." : "Hapus"}
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

      {/* Modal Form */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
              {editingId ? "Edit Kepala Tukang" : "Tambah Kepala Tukang"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Proyek (only on create) */}
              {!editingId && (
                <div>
                  <label className="input-label">Proyek</label>
                  <select
                    className="input-field"
                    value={formData.project_id || ""}
                    onChange={(e) => setFormData({ ...formData, project_id: Number(e.target.value) })}
                    required
                  >
                    <option value="">Pilih Proyek</option>
                    {availableProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nama */}
              <div>
                <label className="input-label">Nama Kepala Tukang</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contoh: Pak Budi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="input-label">No. Telepon (Opsional)</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: "10px" }}
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: "10px" }}
                  disabled={submitting}
                >
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
