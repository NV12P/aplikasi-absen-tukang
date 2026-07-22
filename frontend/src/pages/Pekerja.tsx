import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { UserPlus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  project: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    name: string;
  };
}

const Pekerja = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal State
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
      position_id: worker.position?.id ? worker.position.id.toString() : (positions.length > 0 ? positions[0].id.toString() : ''),
      project_id: worker.project?.id ? worker.project.id.toString() : (selectedProject || ''),
      is_active: worker.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Hapus pekerja "${name}"?`)) {
      try {
        await fetchApi(`/workers/${id}`, { method: 'DELETE', token });
        loadData(); 
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus pekerja');
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
        await fetchApi(`/workers/${editingWorker.id}`, {
          method: 'PUT',
          token,
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/workers', {
          method: 'POST',
          token,
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan pekerja');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter workers by selected project in UI
  const displayWorkers = selectedProject 
    ? workers.filter(w => w.project?.id.toString() === selectedProject)
    : workers;

  if (loading && workers.length === 0) {
    return (
      <>
        <Header title="Kelola Pekerja" />
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Loading workers...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Kelola Pekerja" />
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select 
              className="select-field" 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)' }}
            >
              <option value="">Semua Proyek...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={openAddModal}>
            <UserPlus size={18} />
            <span>Tambah Pekerja</span>
          </button>
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
                      {workers.length === 0 ? 'Belum ada data pekerja. Silakan tambahkan pekerja baru.' : 'Tidak ada pekerja di proyek ini.'}
                    </td>
                  </tr>
                ) : (
                  displayWorkers.map(worker => {
                    const workerProject = projects.find(p => p.id === worker.project?.id);
                    return (
                      <tr key={worker.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{worker.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{worker.phone || 'No HP tidak tersedia'}</div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{worker.position?.name || '-'}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{workerProject ? workerProject.name : '-'}</td>
                        <td>
                          {worker.is_active ? 
                            <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Aktif</span> :
                            <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>Nonaktif</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ color: 'var(--text-muted)' }} title="Edit" onClick={() => openEditModal(worker)}><Edit2 size={18} /></button>
                            <button style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(worker.id, worker.name)}><Trash2 size={18} /></button>
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
      </div>

      {/* Modal CRUD */}
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
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>No HP (Opsional)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Jabatan</label>
                    <select 
                      className="select-field" 
                      required
                      value={formData.position_id}
                      onChange={(e) => setFormData({...formData, position_id: e.target.value})}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    >
                      <option value="">Pilih Jabatan...</option>
                      {positions.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Penugasan Proyek</label>
                  <select 
                    className="select-field" 
                    required
                    value={formData.project_id}
                    onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">Pilih Proyek...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="select-field" 
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
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
    </>
  );
};

export default Pekerja;
