"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

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
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  }

  function openEdit(p: ProjectRow) {
    setForm({
      name: p.name,
      location: p.location,
      description: p.description ?? "",
      start_date: p.startDate ?? "",
      end_date: p.endDate ?? "",
      is_active: p.isActive,
    });
    setEditId(p.id);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        editId ? `/api/projects/${editId}` : "/api/projects",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            location: form.location,
            description: form.description || null,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
            is_active: form.is_active,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error ?? "Gagal menyimpan proyek");
        return;
      }

      const { data } = await res.json();
      setShowModal(false);
      if (editId) {
        setProjects((prev) => prev.map((p) => (p.id === editId ? data : p)));
        toast.success("Proyek berhasil diperbarui");
      } else {
        setProjects((prev) => [data, ...prev]);
        toast.success("Proyek berhasil ditambahkan");
      }
      router.refresh();
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Gagal menghapus proyek");
        return;
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Proyek berhasil dihapus");
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Proyek</h1>
          <p className="page-subtitle">Kelola data proyek konstruksi</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Proyek
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="table-base" aria-label="Daftar proyek">
            <thead className="table-head">
              <tr>
                <th className="table-th">Nama Proyek</th>
                <th className="table-th">Lokasi</th>
                <th className="table-th">Tanggal Mulai</th>
                <th className="table-th">Status</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-td text-center text-gray-400 py-8">
                    Belum ada data proyek
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-td font-medium">{p.name}</td>
                    <td className="table-td text-gray-500">{p.location}</td>
                    <td className="table-td text-gray-500">{p.startDate ?? "-"}</td>
                    <td className="table-td">
                      <span className={p.isActive ? "badge-hadir" : "badge-alpha"}>
                        {p.isActive ? "Aktif" : "Selesai"}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(p)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          aria-label={`Edit ${p.name}`}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-40"
                          aria-label={`Hapus ${p.name}`}>
                          {deleteId === p.id ? "..." : "Hapus"}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !loading && setShowModal(false)} aria-hidden="true" />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              {editId ? "Edit Proyek" : "Tambah Proyek"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="p-name" className="input-label">Nama Proyek *</label>
                <input id="p-name" className="input-field" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="p-location" className="input-label">Lokasi *</label>
                <input id="p-location" className="input-field" required value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label htmlFor="p-desc" className="input-label">Deskripsi</label>
                <textarea id="p-desc" className="input-field resize-none" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="p-start" className="input-label">Tanggal Mulai</label>
                  <input id="p-start" type="date" className="input-field" value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="p-end" className="input-label">Tanggal Selesai</label>
                  <input id="p-end" type="date" className="input-field" value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="p-active" type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="p-active" className="text-sm font-medium text-gray-700">Proyek Aktif</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} disabled={loading}
                  className="btn-secondary">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
