"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/wage";
import { useToast } from "@/components/ui/Toast";

interface WorkerRow {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  projectId: number;
  positionId: number;
  project: { id: number; name: string } | null;
  position: { id: number; name: string; dailyWage: number; overtimeWage: number; castingWage: number } | null;
}

interface ProjectOption { id: number; name: string }
interface PositionOption { id: number; name: string; dailyWage: number; overtimeWage: number; castingWage: number }

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  project_id: 0,
  position_id: 0,
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

  function openEdit(w: WorkerRow) {
    setForm({
      name: w.name,
      phone: w.phone ?? "",
      address: w.address ?? "",
      project_id: w.projectId,
      position_id: w.positionId,
      is_active: w.isActive,
    });
    setEditId(w.id);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(editId ? `/api/workers/${editId}` : "/api/workers", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          address: form.address || null,
          project_id: Number(form.project_id),
          position_id: Number(form.position_id),
          is_active: form.is_active,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(typeof err?.error === "string" ? err.error : "Gagal menyimpan data pekerja");
        return;
      }

      const { data } = await res.json();
      setShowModal(false);
      if (editId) {
        setWorkers((prev) => prev.map((w) => (w.id === editId ? data : w)));
        toast.success("Data pekerja berhasil diperbarui");
      } else {
        setWorkers((prev) => [...prev, data]);
        toast.success("Pekerja berhasil ditambahkan");
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
      const res = await fetch(`/api/workers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Gagal menghapus pekerja");
        return;
      }
      setWorkers((prev) => prev.filter((w) => w.id !== id));
      toast.success("Pekerja berhasil dihapus");
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
          <h1 className="page-title">Pekerja</h1>
          <p className="page-subtitle">Kelola data pekerja per proyek</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pekerja
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table className="table-base" aria-label="Daftar pekerja">
            <thead className="table-head">
              <tr>
                <th className="table-th">Nama</th>
                <th className="table-th">Jabatan</th>
                <th className="table-th">Proyek</th>
                <th className="table-th">Upah/Hari</th>
                <th className="table-th">Status</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-td text-center text-gray-400 py-8">
                    Belum ada data pekerja
                  </td>
                </tr>
              ) : (
                workers.map((w) => (
                  <tr key={w.id} className="table-row">
                    <td className="table-td font-medium">{w.name}</td>
                    <td className="table-td text-gray-500">{w.position?.name ?? "-"}</td>
                    <td className="table-td text-gray-500">{w.project?.name ?? "-"}</td>
                    <td className="table-td text-gray-500">
                      {w.position ? formatRupiah(w.position.dailyWage) : "-"}
                    </td>
                    <td className="table-td">
                      <span className={w.isActive ? "badge-hadir" : "badge-alpha"}>
                        {w.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(w)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          aria-label={`Edit ${w.name}`}>Edit</button>
                        <button onClick={() => handleDelete(w.id)} disabled={deleteId === w.id}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-40"
                          aria-label={`Hapus ${w.name}`}>
                          {deleteId === w.id ? "..." : "Hapus"}
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
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              {editId ? "Edit Pekerja" : "Tambah Pekerja"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="w-name" className="input-label">Nama *</label>
                <input id="w-name" className="input-field" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="w-phone" className="input-label">No. HP</label>
                <input id="w-phone" type="tel" className="input-field" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label htmlFor="w-address" className="input-label">Alamat</label>
                <textarea id="w-address" className="input-field resize-none" rows={2} value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label htmlFor="w-project" className="input-label">Proyek *</label>
                <select id="w-project" className="input-field" required
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: Number(e.target.value) })}>
                  <option value={0} disabled>Pilih proyek...</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="w-position" className="input-label">Jabatan *</label>
                <select id="w-position" className="input-field" required
                  value={form.position_id}
                  onChange={(e) => setForm({ ...form, position_id: Number(e.target.value) })}>
                  <option value={0} disabled>Pilih jabatan...</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {formatRupiah(p.dailyWage)}/hari</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input id="w-active" type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="w-active" className="text-sm font-medium text-gray-700">Pekerja Aktif</label>
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
