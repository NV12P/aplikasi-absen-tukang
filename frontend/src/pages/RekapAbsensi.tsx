import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Download, Printer, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
}

interface WorkerReport {
  id: number;
  name: string;
  position: string;
  days: {
    [date: string]: string; // e.g., "hadir", "alpha", etc.
  };
  total_wage: number;
}

const RekapAbsensi = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  // Weekly default to today
  const today = new Date().toISOString().split('T')[0];
  const [selectedWeek, setSelectedWeek] = useState<string>(today);
  
  const [reports, setReports] = useState<WorkerReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

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
      }
    };
    if (token) loadProjects();
  }, [token, logout, navigate]);

  useEffect(() => {
    const loadReport = async () => {
      if (!selectedProject || !selectedWeek) {
        setReports([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetchApi(`/attendance/report?project_id=${selectedProject}&week=${selectedWeek}`, { token });
        // The backend returns { success: true, data: { summary: {...}, workers: [...] } }
        if (response.data && response.data.workers) {
          setReports(response.data.workers);
        } else {
          setReports([]);
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [selectedProject, selectedWeek, token]);

  const filteredReports = reports.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  // Helper function to count statuses from the 'days' object
  const countStatus = (days: { [date: string]: string }, statusToCount: string) => {
    if (!days) return 0;
    return Object.values(days).filter(status => status === statusToCount).length;
  };

  return (
    <>
      <Header title="Rekap Absensi" />
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select 
              className="select-field"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)' }}
            >
              <option value="">Pilih Proyek...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <input 
              type="date" 
              className="select-field"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="input-group" style={{ width: '250px' }}>
              <Search className="input-icon" size={18} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Cari nama pekerja..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '10px 10px 10px 40px' }}
              />
            </div>
            
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
              <Download size={18} />
              <span>Export Excel</span>
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
              <Printer size={18} />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '0' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Pekerja</th>
                  <th style={{ textAlign: 'center' }}>Hadir</th>
                  <th style={{ textAlign: 'center' }}>Lembur</th>
                  <th style={{ textAlign: 'center' }}>Cor</th>
                  <th style={{ textAlign: 'center' }}>Alpha</th>
                  <th style={{ textAlign: 'right' }}>Total Upah Mingguan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Memuat data rekap...</td>
                  </tr>
                ) : !selectedProject ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Pilih proyek untuk melihat rekap.</td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Tidak ada rekap absensi untuk minggu ini.</td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{report.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{report.position}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{countStatus(report.days, 'hadir')}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{countStatus(report.days, 'lembur')}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{countStatus(report.days, 'cor')}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--danger)' }}>{countStatus(report.days, 'alpha')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                        Rp {new Intl.NumberFormat('id-ID').format(report.total_wage || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default RekapAbsensi;
