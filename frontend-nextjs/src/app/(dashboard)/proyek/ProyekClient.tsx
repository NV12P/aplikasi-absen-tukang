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
  name: "", location: "", description: "",
  start_date: "", end_date: "", is_active: true,
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

  function openCreate() { setForm(emptyForm); setEditId(null); setShowModal(true); }
  function openEdit(p: ProjectRow) {
    setForm({ name: p.name, location: p.location, description: p.description ?? "",
      start_date: p.startDate ?? "", end_date: p.endDate ?? "", is_active: p.isActive });
    setEditId(p.id); setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(editId ? `/api/projects/${editId}` : "/api/projects", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, location: form.location,
          description: form.description || null, start_date: form.start_date || null,
          end_date: form.end_date || null, is_active: form.is_active }),
      });
      if (!res.ok) { toast.error((await res.json().catch(() => ({}))).error ?? "Gagal menyimpan"); return; }
      const { data } = await res.json();
      setShowModal(false);
      if (editId) { setProjects(prev => prev.map(p => p.id === editId ? data : p)); toast.success("Proyek diperbarui"); }
      else { setProjects(prev => [data, ...prev]); toast.success("Proyek ditambahkan"); }
      router.refresh();
    } catch { toast.error("Tidak dapat terhubung ke server"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus"); return; }
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success("Proyek dihapus");
    } catch { toast.error("Tidak dapat terhubung ke server"); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Proyek</h1>
          <p className="page-subtitle">Kelola data proyek konstruksi</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Tambah Proyek</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* ── Desktop: tabel ── */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base" aria-label="Daftar proyek">
            <thead className="table-head">
              <tr>
                <th className="table-th">Nama Proyek</th>
                <th className="table-th">Lokasi</th>
                <th className="table-th">Mulai</th>
                <th className="table-th">Status</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {projects.length === 0 ? (
                <tr><td colSpan={5} className="table-td text-center text-stone-400 py-10">Belum ada data proyek</td></tr>
              ) : projects.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-td font-semibold">{p.name}</td>
                  <td className="table-td text-stone-500">{p.location}</td>
                  <td className="table-td text-stone-500">{p.startDate ?? "-"}</td>
                  <td className="table-td">
                    <span className={p.isActive ? "badge-hadir" : "badge-alpha"}>{p.isActive ? "Aktif" : "Selesai"}</span>
                  </td>
                  <td className="table-td">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(p)} className="text-amber-600 hover:text-amber-700 text-sm font-semibold">Edit</button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold disabled:opacity-40">
                        {deleteId === p.id ? "..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile: card list ── */}
      <div className="sm:hidden space-y-3">
        {projects.length === 0 ? (
          <div className="card text-center py-10 text-stone-400">Belum ada data proyek</div>
        ) : projects.map((p) => (
          <div key={p.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                <p className="text-sm text-stone-500 mt-0.5 truncate">{p.location}</p>
              </div>
              <span className={`flex-shrink-0 ${p.isActive ? "badge-hadir" : "badge-alpha"}`}>
                {p.isActive ? "Aktif" : "Selesai"}
              </span>
            </div>
            {p.startDate && (
              <p className="text-xs text-stone-400">Mulai: {p.startDate}</p>
            )}
            <div className="flex gap-3 pt-1 border-t border-stone-100">
              <button onClick={() => openEdit(p)}
                className="flex-1 text-center text-sm font-semibold text-amber-600 hover:text-amber-700 py-1">
                Edit
              </button>
              <div className="w-px bg-stone-100" />
              <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id}
                className="flex-1 text-center text-sm font-semibold text-red-500 hover:text-red-700 py-1 disabled:opacity-40">
                {deleteId === p.id ? "..." : "Hapus"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && setShowModal(false)} aria-hidden="true" />
          <div className="relative bg-white w-full sm:max-w-md z-10 rounded-t-3xl sm:rounded-2xl
                          shadow-2xl max-h-[92dvh] flex flex-col">
            <div className="modal-header">
              <h2 className="text-base font-bold text-stone-900">{editId ? "Edit Proyek" : "Tambah Proyek"}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <form id="proyek-form" onSubmit={handleSubmit} className="modal-body">
                <div>
                  <label htmlFor="p-name" className="input-label">Nama Proyek *</label>
                  <input id="p-name" className="input-field" required value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="p-loc" className="input-label">Lokasi *</label>
                  <input id="p-loc" className="input-field" required value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="p-desc" className="input-label">Deskripsi</label>
                  <textarea id="p-desc" className="input-field resize-none" rows={3} value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="p-start" className="input-label">Tgl Mulai</label>
                    <input id="p-start" type="date" className="input-field" value={form.start_date}
                      onChange={(e) => setForm({...form, start_date: e.target.value})} />
                  </div>
                  <div>
                    <label htmlFor="p-end" className="input-label">Tgl Selesai</label>
                    <input id="p-end" type="date" className="input-field" value={form.end_date}
                      onChange={(e) => setForm({...form, end_date: e.target.value})} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-stone-300 accent-amber-500"
                    checked={form.is_active} onChange={(e) => setForm({...form, is_active: e.target.checked})} />
                  <span className="text-sm font-medium text-stone-700">Proyek Aktif</span>
                </label>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} disabled={loading} className="btn-secondary">Batal</button>
              <button type="submit" form="proyek-form" disabled={loading} className="btn-primary">
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
