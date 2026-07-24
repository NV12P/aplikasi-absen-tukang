import { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
}

interface WorkerReport {
  id: number;
  name: string;
  position: string;
  days: { [date: string]: string };
  total_wage: number;
}

const RekapAbsensi = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

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
        const response = await fetchApi(
          `/attendance/report?project_id=${selectedProject}&week=${selectedWeek}`,
          { token }
        );
        setReports(response.data?.workers ?? []);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [selectedProject, selectedWeek, token]);

  const filteredReports = reports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const countStatus = (days: { [date: string]: string }, statusToCount: string) => {
    if (!days) return 0;
    return Object.values(days).filter(s => s === statusToCount).length;
  };

  return (
    <div className="page-container">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <CustomSelect
            value={selectedProject}
            onChange={(val) => setSelectedProject(val)}
            placeholder="Pilih Proyek..."
            style={{ minWidth: '180px' }}
            options={[
              { value: '', label: 'Pilih Proyek...' },
              ...projects.map((p) => ({ value: p.id, label: p.name }))
            ]}
          />

          <input
            type="date"
            className="select-field"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{ minWidth: '140px' }}
          />
        </div>

        <div className="page-toolbar-right">
          <div className="input-group" style={{ width: '200px' }}>
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder="Cari pekerja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontSize: '14px', whiteSpace: 'nowrap' }}>
            <Download size={16} />
            <span>Export</span>
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
                <th style={{ textAlign: 'right' }}>Total Upah</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Memuat data rekap...</td>
                </tr>
              ) : !selectedProject ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Pilih proyek untuk melihat rekap.
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>
                    Tidak ada rekap absensi untuk minggu ini.
                  </td>
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
                    <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>
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
  );
};

export default RekapAbsensi;
