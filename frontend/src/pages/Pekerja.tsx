import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CustomSelect } from '../components/ui/CustomSelect';
import { fetchApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
}

interface Worker {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  project: { id: number; name: string };
  position: { id: number; name: string };
}

const Pekerja = () => {
  const { token, logout } = useAuth();
  const { toast, confirm } = useNotification();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    position_id: '',
    project_id: '',
    is_active: true
  });

  const loadData = async () => {
    try {
      const [projectsRes, positionsRes, workersRes] = await Promise.all([
        fetchApi('/projects', { token }),
        fetchApi('/positions', { token }),
        fetchApi('/workers', { token })
      ]);
      setProjects(projectsRes.data);
      setPositions(positionsRes.data);
      setWorkers(workersRes.data);
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        logout();
        navigate('/login');
      }
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, logout, navigate]);

  const openAddModal = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      position_id: positions.length > 0 ? positions[0].id.toString() : '',
      project_id: selectedProject || (projects.length > 0 ? projects[0].id.toString() : ''),
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone || '',
      address: worker.address || '',
      position_id: worker.position?.id ? worker.position.id.toString() : '',
      project_id: worker.project?.id ? worker.project.id.toString() : '',
      is_active: worker.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Pekerja',
      message: `Apakah Anda yakin ingin menghapus pekerja "${name}"? Data pekerja ini beserta riwayatnya akan dihapus.`,
      type: 'danger',
      confirmText: 'Ya, Hapus Pekerja',
      cancelText: 'Batal'
    });

    if (isConfirmed) {
      try {
        await fetchApi(`/workers/${id}`, { method: 'DELETE', token });
        toast.success(`Pekerja "${name}" berhasil dihapus.`);
        loadData();
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus pekerja');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        project_id: parseInt(formData.project_id),
        position_id: parseInt(formData.position_id)
      };
      if (editingWorker) {
        await fetchApi(`/workers/${editingWorker.id}`, { method: 'PUT', token, body: JSON.stringify(payload) });
        toast.success(`Data pekerja "${formData.name}" berhasil diperbarui.`);
      } else {
        await fetchApi('/workers', { method: 'POST', token, body: JSON.stringify(payload) });
        toast.success(`Pekerja baru "${formData.name}" berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan pekerja');
    } finally {
      setSubmitting(false);
    }
  };

  const displayWorkers = selectedProject
    ? workers.filter(w => w.project?.id.toString() === selectedProject)
    : workers;

  if (loading && workers.length === 0) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <p>Loading workers...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <CustomSelect
            value={selectedProject}
            onChange={(val) => setSelectedProject(val)}
            placeholder="Semua Proyek..."
            style={{ minWidth: '200px' }}
            options={[
              { value: '', label: 'Semua Proyek...' },
              ...projects.map((p) => ({ value: p.id, label: p.name }))
            ]}
          />
        </div>
        <div className="page-toolbar-right">
          <button
            className="btn-primary"
            style={{ padding: '10px 20px', borderRadius: '8px' }}
            onClick={openAddModal}
          >
            <UserPlus size={18} />
            <span>Tambah Pekerja</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table className="table">
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                    {workers.length === 0
                      ? 'Belum ada data pekerja. Silakan tambahkan pekerja baru.'
                      : 'Tidak ada pekerja di proyek ini.'}
                  </td>
                </tr>
              ) : (
                displayWorkers.map(worker => {
                  const workerProject = projects.find(p => p.id === worker.project?.id);
                  return (
                    <tr key={worker.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{worker.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {worker.phone || 'No HP tidak tersedia'}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{worker.position?.name || '-'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{workerProject ? workerProject.name : '-'}</td>
                      <td>
                        {worker.is_active
                          ? <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Aktif</span>
                          : <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>Nonaktif</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ color: 'var(--text-muted)' }} title="Edit" onClick={() => openEditModal(worker)}>
                            <Edit2 size={18} />
                          </button>
                          <button style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(worker.id, worker.name)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <h2>{editingWorker ? 'Edit Pekerja' : 'Tambah Pekerja Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
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

                <div className="form-row-2col" style={{ display: 'flex', gap: '16px' }}>
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
                        { value: '', label: 'Pilih Jabatan...' },
                        ...positions.map((p) => ({ value: p.id, label: p.name }))
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
                      { value: '', label: 'Pilih Proyek...' },
                      ...projects.map((p) => ({ value: p.id, label: p.name }))
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <CustomSelect
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(val) => setFormData({ ...formData, is_active: val === 'true' })}
                    options={[
                      { value: 'true', label: 'Aktif' },
                      { value: 'false', label: 'Nonaktif' }
                    ]}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pekerja;
