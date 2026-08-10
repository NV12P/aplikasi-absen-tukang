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

// Form untuk TAMBAH: deskripsi ada, start_date otomatis server, end_date tidak ada
interface AddForm {
  name: string;
  location: string;
  description: string;
  is_active: boolean;
}

// Form untuk EDIT: semua kolom bisa diubah termasuk start_date dan end_date
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

  // ─── State modal tambah ───────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(emptyAddForm);
  const [addLoading, setAddLoading] = useState(false);

  // ─── State modal edit ─────────────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "", location: "", description: "",
    start_date: "", end_date: "", is_active: true,
  });
  const [editLoading, setEditLoading] = useState(false);

  // ─── Helper format tanggal ke dd/mm/yyyy ─────────────────────────────────
  function fmtDate(dateStr: string | null): string {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  // ─── Tambah proyek ────────────────────────────────────────────────────────
  function openAdd() {
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
          // start_date TIDAK dikirim — server yang auto-isi dengan new Date()
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
      toast.success(`Proyek "${addForm.name}" berhasil ditambahkan`);
      router.refresh();
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setAddLoading(false);
    }
  }

  // ─── Edit proyek ──────────────────────────────────────────────────────────
  function openEdit(p: ProjectRow) {
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
      toast.success(`Proyek "${editForm.name}" berhasil diperbarui`);
      router.refresh();
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setEditLoading(false);
    }
  }

  // ─── Hapus proyek ─────────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus proyek"); return; }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Proyek berhasil dihapus");
    } catch {
      toast.error("Tidak dapat terhubung ke server");
    } finally {
      setDeleteId(null);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Proyek</h1>
          <p className="page-subtitle">Kelola data proyek konstruksi</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex-shrink-0">
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
                <th className="table-th">Deskripsi</th>
                <th className="table-th">Tgl Mulai</th>
                <th className="table-th">Tgl Selesai</th>
                <th className="table-th">Status</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-td text-center text-stone-400 py-10">
                    Belum ada data proyek
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-td font-semibold">{p.name}</td>
                    <td className="table-td text-stone-500">{p.location}</td>
                    <td className="table-td text-stone-500 max-w-[180px]">
                      <span className="truncate block" title={p.description ?? undefined}>
                        {p.description || <span className="text-stone-300 italic">-</span>}
                      </span>
                    </td>
                    <td className="table-td text-stone-500">{fmtDate(p.startDate)}</td>
                    <td className="table-td text-stone-500">{fmtDate(p.endDate)}</td>
                    <td className="table-td">
                      <span className={p.isActive ? "badge-hadir" : "badge-alpha"}>
                        {p.isActive ? "Aktif" : "Selesai"}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(p)}
                          className="text-amber-600 hover:text-amber-700 text-sm font-semibold"
                          aria-label={`Edit ${p.name}`}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold disabled:opacity-40"
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

      {/* ── Mobile: card list ── */}
      <div className="sm:hidden space-y-3">
        {projects.length === 0 ? (
          <div className="card text-center py-10 text-stone-400">Belum ada data proyek</div>
        ) : (
          projects.map((p) => (
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

              {p.description && (
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{p.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400">Mulai</span>
                  <p className="font-medium text-stone-700">{fmtDate(p.startDate)}</p>
                </div>
                <div>
                  <span className="text-stone-400">Selesai</span>
                  <p className="font-medium text-stone-700">{fmtDate(p.endDate)}</p>
                </div>
              </div>

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
          ))
        )}
      </div>

      {/* ════════════════════════════════════════════════
          MODAL TAMBAH PROYEK
          - Kolom: Nama, Lokasi, Deskripsi, Status
          - start_date otomatis dari server
          - end_date tidak ada saat tambah
         ════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !addLoading && setShowAddModal(false)} aria-hidden="true" />
          <div className="relative bg-white w-full sm:max-w-md z-10
                          rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col">

            {/* Header */}
            <div className="modal-header">
              <div>
                <h2 className="text-base font-bold text-stone-900">Tambah Proyek</h2>
                <p className="text-xs text-stone-400 mt-0.5">Tanggal mulai otomatis hari ini</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn-ghost p-1" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              <form id="add-proyek-form" onSubmit={handleAdd} className="modal-body">

                {/* Nama */}
                <div>
                  <label htmlFor="add-name" className="input-label">Nama Proyek *</label>
                  <input id="add-name" type="text" className="input-field" required
                    placeholder="contoh: Pembangunan Gedung A"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                </div>

                {/* Lokasi */}
                <div>
                  <label htmlFor="add-location" className="input-label">Lokasi *</label>
                  <input id="add-location" type="text" className="input-field" required
                    placeholder="contoh: Jl. Sudirman No. 10, Jakarta"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} />
                </div>

                {/* Deskripsi */}
                <div>
                  <label htmlFor="add-desc" className="input-label">
                    Deskripsi
                    <span className="text-stone-300 font-normal ml-1">(opsional)</span>
                  </label>
                  <textarea id="add-desc" className="input-field resize-none" rows={3}
                    placeholder="Deskripsikan proyek secara singkat..."
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
                </div>

                {/* Info start_date otomatis */}
                <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200
                                rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Tanggal mulai</span> otomatis diisi hari ini.
                    Tanggal selesai dapat diatur setelah proyek dibuat.
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="add-status" className="input-label">Status</label>
                  <select id="add-status" className="input-field"
                    value={addForm.is_active ? "true" : "false"}
                    onChange={(e) => setAddForm({ ...addForm, is_active: e.target.value === "true" })}>
                    <option value="true">Aktif</option>
                    <option value="false">Selesai</option>
                  </select>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" onClick={() => setShowAddModal(false)}
                disabled={addLoading} className="btn-secondary">
                Batal
              </button>
              <button type="submit" form="add-proyek-form" disabled={addLoading} className="btn-primary">
                {addLoading ? "Menyimpan..." : "Tambah Proyek"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          MODAL EDIT PROYEK
          - Kolom: Nama, Lokasi, Deskripsi, Tgl Mulai, Tgl Selesai, Status
          - Semua bisa diedit
         ════════════════════════════════════════════════ */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !editLoading && setShowEditModal(false)} aria-hidden="true" />
          <div className="relative bg-white w-full sm:max-w-md z-10
                          rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col">

            {/* Header */}
            <div className="modal-header">
              <h2 className="text-base font-bold text-stone-900">Edit Proyek</h2>
              <button onClick={() => setShowEditModal(false)} className="btn-ghost p-1" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              <form id="edit-proyek-form" onSubmit={handleEdit} className="modal-body">

                {/* Nama */}
                <div>
                  <label htmlFor="edit-name" className="input-label">Nama Proyek *</label>
                  <input id="edit-name" type="text" className="input-field" required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>

                {/* Lokasi */}
                <div>
                  <label htmlFor="edit-location" className="input-label">Lokasi *</label>
                  <input id="edit-location" type="text" className="input-field" required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                </div>

                {/* Deskripsi */}
                <div>
                  <label htmlFor="edit-desc" className="input-label">
                    Deskripsi
                    <span className="text-stone-300 font-normal ml-1">(opsional)</span>
                  </label>
                  <textarea id="edit-desc" className="input-field resize-none" rows={3}
                    placeholder="Deskripsikan proyek secara singkat..."
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>

                {/* Tanggal Mulai & Selesai — berdampingan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-start" className="input-label">Tanggal Mulai</label>
                    <input id="edit-start" type="date" className="input-field"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="edit-end" className="input-label">Tanggal Selesai</label>
                    <input id="edit-end" type="date" className="input-field"
                      min={editForm.start_date || undefined}
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="edit-status" className="input-label">Status</label>
                  <select id="edit-status" className="input-field"
                    value={editForm.is_active ? "true" : "false"}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === "true" })}>
                    <option value="true">Aktif</option>
                    <option value="false">Selesai</option>
                  </select>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" onClick={() => setShowEditModal(false)}
                disabled={editLoading} className="btn-secondary">
                Batal
              </button>
              <button type="submit" form="edit-proyek-form" disabled={editLoading} className="btn-primary">
                {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
