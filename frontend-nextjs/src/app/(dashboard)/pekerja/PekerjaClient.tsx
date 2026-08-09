"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/wage";
import { useToast } from "@/components/ui/Toast";

interface WorkerRow {
  id: number; name: string; phone: string | null; address: string | null;
  isActive: boolean; projectId: number; positionId: number;
  project: { id: number; name: string } | null;
  position: { id: number; name: string; dailyWage: number; overtimeWage: number; castingWage: number } | null;
}
interface ProjectOption { id: number; name: string }
interface PositionOption { id: number; name: string; dailyWage: number; overtimeWage: number; castingWage: number }

const emptyForm = { name: "", phone: "", address: "", project_id: 0, position_id: 0, is_active: true };

export function PekerjaClient({
  initialWorkers, projects, positions,
}: { initialWorkers: WorkerRow[]; projects: ProjectOption[]; positions: PositionOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const [workers, setWorkers] = useState(initialWorkers);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openCreate() { setForm(emptyForm); setEditId(null); setShowModal(true); }
  function openEdit(w: WorkerRow) {
    setForm({ name: w.name, phone: w.phone ?? "", address: w.address ?? "",
      project_id: w.projectId, position_id: w.positionId, is_active: w.isActive });
    setEditId(w.id); setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(editId ? `/api/workers/${editId}` : "/api/workers", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone || null,
          address: form.address || null, project_id: Number(form.project_id),
          position_id: Number(form.position_id), is_active: form.is_active }),
      });
      if (!res.ok) { const e = await res.json().catch(()=>({})); toast.error(typeof e?.error==="string"?e.error:"Gagal menyimpan"); return; }
      const { data } = await res.json();
      setShowModal(false);
      if (editId) { setWorkers(p => p.map(w => w.id===editId ? data : w)); toast.success("Data pekerja diperbarui"); }
      else { setWorkers(p => [...p, data]); toast.success("Pekerja ditambahkan"); }
      router.refresh();
    } catch { toast.error("Tidak dapat terhubung ke server"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    try {
      if (!(await fetch(`/api/workers/${id}`,{method:"DELETE"})).ok) { toast.error("Gagal menghapus"); return; }
      setWorkers(p => p.filter(w => w.id !== id)); toast.success("Pekerja dihapus");
    } catch { toast.error("Tidak dapat terhubung ke server"); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Pekerja</h1>
          <p className="page-subtitle">Kelola data pekerja per proyek</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Tambah Pekerja</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Desktop tabel */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <div className="overflow-x-auto">
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
            <tbody className="divide-y divide-stone-100">
              {workers.length === 0 ? (
                <tr><td colSpan={6} className="table-td text-center text-stone-400 py-10">Belum ada data pekerja</td></tr>
              ) : workers.map((w) => (
                <tr key={w.id} className="table-row">
                  <td className="table-td font-semibold">{w.name}</td>
                  <td className="table-td text-stone-500">{w.position?.name ?? "-"}</td>
                  <td className="table-td text-stone-500">{w.project?.name ?? "-"}</td>
                  <td className="table-td text-stone-500">{w.position ? formatRupiah(w.position.dailyWage) : "-"}</td>
                  <td className="table-td"><span className={w.isActive?"badge-hadir":"badge-alpha"}>{w.isActive?"Aktif":"Nonaktif"}</span></td>
                  <td className="table-td">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(w)} className="text-amber-600 hover:text-amber-700 text-sm font-semibold">Edit</button>
                      <button onClick={() => handleDelete(w.id)} disabled={deleteId===w.id}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold disabled:opacity-40">
                        {deleteId===w.id?"...":"Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {workers.length === 0 ? (
          <div className="card text-center py-10 text-stone-400">Belum ada data pekerja</div>
        ) : workers.map((w) => (
          <div key={w.id} className="card space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-stone-900">{w.name}</p>
                <p className="text-sm text-stone-500 mt-0.5">{w.position?.name ?? "-"}</p>
              </div>
              <span className={`flex-shrink-0 ${w.isActive?"badge-hadir":"badge-alpha"}`}>{w.isActive?"Aktif":"Nonaktif"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-400">Proyek</span>
                <p className="font-medium text-stone-700 truncate">{w.project?.name ?? "-"}</p>
              </div>
              <div>
                <span className="text-stone-400">Upah/Hari</span>
                <p className="font-medium text-stone-700">{w.position ? formatRupiah(w.position.dailyWage) : "-"}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-1 border-t border-stone-100">
              <button onClick={() => openEdit(w)} className="flex-1 text-center text-sm font-semibold text-amber-600 hover:text-amber-700 py-1">Edit</button>
              <div className="w-px bg-stone-100"/>
              <button onClick={() => handleDelete(w.id)} disabled={deleteId===w.id}
                className="flex-1 text-center text-sm font-semibold text-red-500 hover:text-red-700 py-1 disabled:opacity-40">
                {deleteId===w.id?"...":"Hapus"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal bottom sheet / centered */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && setShowModal(false)} aria-hidden="true"/>
          <div className="relative bg-white w-full sm:max-w-md z-10 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col">
            <div className="modal-header">
              <h2 className="text-base font-bold text-stone-900">{editId?"Edit Pekerja":"Tambah Pekerja"}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <form id="pekerja-form" onSubmit={handleSubmit} className="modal-body">
                <div>
                  <label htmlFor="w-name" className="input-label">Nama *</label>
                  <input id="w-name" className="input-field" required value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="w-phone" className="input-label">No. HP</label>
                  <input id="w-phone" type="tel" className="input-field" value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="w-address" className="input-label">Alamat</label>
                  <textarea id="w-address" className="input-field resize-none" rows={2} value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="w-project" className="input-label">Proyek *</label>
                  <select id="w-project" className="input-field" required value={form.project_id}
                    onChange={e => setForm({...form, project_id: Number(e.target.value)})}>
                    <option value={0} disabled>Pilih proyek...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="w-position" className="input-label">Jabatan *</label>
                  <select id="w-position" className="input-field" required value={form.position_id}
                    onChange={e => setForm({...form, position_id: Number(e.target.value)})}>
                    <option value={0} disabled>Pilih jabatan...</option>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.name} — {formatRupiah(p.dailyWage)}/hari</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-stone-300 accent-amber-500"
                    checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                  <span className="text-sm font-medium text-stone-700">Pekerja Aktif</span>
                </label>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} disabled={loading} className="btn-secondary">Batal</button>
              <button type="submit" form="pekerja-form" disabled={loading} className="btn-primary">
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
