import { useState, useEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  location: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  workers_count?: number;
}

const Proyek = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetchApi('/projects', { token });
      setProjects(response.data);
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        logout();
        navigate('/login');
      }
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProjects();
  }, [token, logout, navigate]);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({ name: '', location: '', description: '', start_date: '', end_date: '', is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      location: project.location,
      description: project.description || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      is_active: project.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus proyek "${name}"?`)) {
      try {
        await fetchApi(`/projects/${id}`, { method: 'DELETE', token });
        loadProjects();
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus proyek');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProject) {
        await fetchApi(`/projects/${editingProject.id}`, { method: 'PUT', token, body: JSON.stringify(formData) });
      } else {
        await fetchApi('/projects', { method: 'POST', token, body: JSON.stringify(formData) });
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan proyek');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = projects.filter(p => p.is_active).length;
  const completedCount = projects.length - activeCount;

  const getStatusBadge = (project: Project) => {
    if (!project.is_active) {
      return <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>Selesai</span>;
    }
    return <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Aktif</span>;
  };

  if (loading && projects.length === 0) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{activeCount}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Proyek Aktif</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{completedCount}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Proyek Selesai</div>
            </div>
          </div>
        </div>
        <div className="page-toolbar-right">
          <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={openAddModal}>
            + Tambah Proyek Baru
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                    Belum ada data proyek. Silakan tambahkan proyek baru.
                  </td>
                </tr>
              ) : (
                projects.map(project => (
                  <tr key={project.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{project.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        ID: PROJ-{new Date().getFullYear()}-{project.id.toString().padStart(3, '0')}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{project.location}</td>
                    <td>{getStatusBadge(project)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ color: 'var(--text-muted)' }} title="Edit" onClick={() => openEditModal(project)}>
                          <Edit2 size={18} />
                        </button>
                        <button style={{ color: 'var(--danger)' }} title="Hapus" onClick={() => handleDelete(project.id, project.name)}>
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
              <h2>{editingProject ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Proyek</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Lokasi</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="select-field"
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Selesai</option>
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
    </div>
  );
};

export default Proyek;
