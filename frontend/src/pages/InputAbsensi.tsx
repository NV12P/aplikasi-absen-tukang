import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
}

interface Worker {
  id: number;
  name: string;
  position: { name: string };
}

interface AttendanceState {
  [workerId: number]: {
    status: 'hadir' | 'lembur' | 'cor' | 'alpha' | '';
    note: string;
  };
}

const InputAbsensi = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchApi('/projects', { token });
        setProjects(response.data);
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    if (token) loadProjects();
  }, [token, logout, navigate]);

  useEffect(() => {
    const loadWorkers = async () => {
      if (!selectedProject) {
        setWorkers([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetchApi(`/attendance/project/${selectedProject}`, { token });
        setWorkers(response.data);
        const initialState: AttendanceState = {};
        response.data.forEach((w: Worker) => {
          initialState[w.id] = { status: 'hadir', note: '' };
        });
        setAttendance(initialState);
      } catch (error: any) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, [selectedProject, token]);

  const handleStatusChange = (workerId: number, status: 'hadir' | 'lembur' | 'cor' | 'alpha') => {
    setAttendance(prev => ({ ...prev, [workerId]: { ...prev[workerId], status } }));
  };

  const handleNoteChange = (workerId: number, note: string) => {
    setAttendance(prev => ({ ...prev, [workerId]: { ...prev[workerId], note } }));
  };

  const handleSave = async () => {
    if (!selectedProject) {
      alert('Pilih proyek terlebih dahulu!');
      return;
    }
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        project_id: parseInt(selectedProject),
        date: today,
        attendances: workers.map(worker => ({
          worker_id: worker.id,
          status: attendance[worker.id]?.status || 'hadir',
          note: attendance[worker.id]?.note || ''
        }))
      };
      await fetchApi('/attendance/store', { method: 'POST', token, body: JSON.stringify(payload) });
      alert('Absensi berhasil disimpan!');
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan absensi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <select
            className="select-field"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="">Pilih Proyek...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="page-toolbar-right">
          <button
            className="btn-primary"
            style={{ padding: '10px 24px', borderRadius: '8px' }}
            onClick={handleSave}
            disabled={submitting || !selectedProject || workers.length === 0}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Absensi'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Nama Pekerja</th>
                <th style={{ width: '45%' }}>Kehadiran</th>
                <th style={{ width: '30%' }}>Keterangan (Opsional)</th>
              </tr>
            </thead>
            <tbody>
              {loading && !selectedProject ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px' }}>Loading...</td>
                </tr>
              ) : !selectedProject ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Silakan pilih proyek terlebih dahulu.
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Tidak ada pekerja yang ditugaskan di proyek ini.
                  </td>
                </tr>
              ) : (
                workers.map(worker => (
                  <tr key={worker.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{worker.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {worker.position?.name || '-'}
                      </div>
                    </td>
                    <td>
                      <div className="radio-group">
                        {(['hadir', 'lembur', 'cor', 'alpha'] as const).map(status => (
                          <label
                            key={status}
                            className={`radio-label ${attendance[worker.id]?.status === status
                              ? (status === 'alpha' ? 'selected danger' : 'selected')
                              : ''}`}
                          >
                            <input
                              type="radio"
                              name={`status-${worker.id}`}
                              checked={attendance[worker.id]?.status === status}
                              onChange={() => handleStatusChange(worker.id, status)}
                            />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Tambahkan catatan..."
                        className="input-field"
                        value={attendance[worker.id]?.note || ''}
                        onChange={(e) => handleNoteChange(worker.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InputAbsensi;
