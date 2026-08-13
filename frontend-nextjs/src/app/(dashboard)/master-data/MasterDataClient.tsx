"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface Position {
  id: number;
  name: string;
  daily_wage: number;
  overtime_wage: number | null;
  casting_wage: number | null;
}

interface FormData {
  name: string;
  daily_wage: number;
  overtime_wage: number | null;
  casting_wage: number | null;
}

export function MasterDataClient() {
  const toast = useToast();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    daily_wage: 0,
    overtime_wage: null,
    casting_wage: null,
  });

  // Load positions
  async function loadPositions() {
    setLoading(true);
    try {
      // Add timestamp to bypass cache
      const res = await fetch(`/api/positions?_t=${Date.now()}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setPositions(json.data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat data jabatan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open modal for create
  function handleCreate() {
    setEditingId(null);
    setFormData({ name: "", daily_wage: 0, overtime_wage: null, casting_wage: null });
    setShowModal(true);
  }

  // Open modal for edit
  function handleEdit(position: Position) {
    setEditingId(position.id);
    setFormData({
      name: position.name,
      daily_wage: position.daily_wage,
      overtime_wage: position.overtime_wage,
      casting_wage: position.casting_wage,
    });
    setShowModal(true);
  }

  // Submit form (create or update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId ? `/api/positions/${editingId}` : "/api/positions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(editingId ? "Gagal mengupdate jabatan" : "Gagal menambah jabatan");

      toast.success(editingId ? "Jabatan berhasil diupdate" : "Jabatan berhasil ditambahkan");
      setShowModal(false);
      await loadPositions();
      router.refresh(); // Auto-refresh untuk update UI
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete position
  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus jabatan ini?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/positions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus jabatan");
      }

      toast.success("Jabatan berhasil dihapus");
      await loadPositions();
      router.refresh(); // Auto-refresh untuk update UI
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus jabatan");
    } finally {
      setDeleting(null);
    }
  }

  // Format currency
  function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <h1 className="page-title">Master Data Jabatan</h1>
        </div>
        <div className="page-toolbar-right">
          <button
            className="btn-primary"
            style={{ padding: "10px 20px", borderRadius: "8px" }}
            onClick={handleCreate}
          >
            + Tambah Jabatan
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
                <th style={{ width: "25%" }}>Nama Jabatan</th>
                <th style={{ width: "20%" }}>Upah Harian</th>
                <th style={{ width: "20%" }}>Upah Lembur</th>
                <th style={{ width: "20%" }}>Upah Cor</th>
                <th style={{ width: "10%", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px" }}>
                    Loading...
                  </td>
                </tr>
              ) : positions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Belum ada data jabatan
                  </td>
                </tr>
              ) : (
                positions.map((position, idx) => (
                  <tr key={position.id}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{position.name}</td>
                    <td>{formatRupiah(position.daily_wage)}</td>
                    <td>{position.overtime_wage !== null ? formatRupiah(position.overtime_wage) : "-"}</td>
                    <td>{position.casting_wage !== null ? formatRupiah(position.casting_wage) : "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => handleEdit(position)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => handleDelete(position.id)}
                          disabled={deleting === position.id}
                        >
                          {deleting === position.id ? "..." : "Hapus"}
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
              {editingId ? "Edit Jabatan" : "Tambah Jabatan"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Nama Jabatan */}
              <div>
                <label className="input-label">Nama Jabatan</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contoh: Mandor, Tukang Batu, Helper"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Upah Harian */}
              <div>
                <label className="input-label">Upah Harian (Rp)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="150000"
                  value={formData.daily_wage || ""}
                  onChange={(e) => setFormData({ ...formData, daily_wage: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>

              {/* Upah Lembur */}
              <div>
                <label className="input-label">Upah Lembur (Rp) - Opsional</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="200000 (kosongkan jika tidak ada)"
                  value={formData.overtime_wage ?? ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    overtime_wage: e.target.value === "" ? null : Number(e.target.value) 
                  })}
                  min="0"
                />
              </div>

              {/* Upah Cor */}
              <div>
                <label className="input-label">Upah Cor (Rp) - Opsional</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="250000 (kosongkan jika tidak ada)"
                  value={formData.casting_wage ?? ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    casting_wage: e.target.value === "" ? null : Number(e.target.value) 
                  })}
                  min="0"
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
