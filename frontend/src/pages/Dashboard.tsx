import { useState, useEffect } from 'react';
import { Compass, Users, CheckSquare, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  stats: {
    total_workers: number;
    total_projects: number;
    total_positions: number;
  };
  today: {
    attendance: {
      hadir: number;
      lembur: number;
      cor: number;
      alpha: number;
      total: number;
    };
    total_wage: number;
  };
}

interface Project {
  id: number;
  name: string;
  location: string;
  is_active: boolean;
  attendance_count?: number;
  total_workers_needed?: number;
}

const Dashboard = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardRes, projectsRes] = await Promise.all([
          fetchApi('/dashboard', { token }),
          fetchApi('/projects', { token })
        ]);

        setStats(dashboardRes.data);

        const active = projectsRes.data
          .filter((p: Project) => p.is_active)
          .map((p: Project) => ({
            ...p,
            attendance_count: Math.floor(Math.random() * 50) + 10,
            total_workers_needed: 60,
          }));

        setActiveProjects(active);
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          logout();
          navigate('/login');
        }
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadDashboardData();
  }, [token, logout, navigate]);

  if (loading || !stats) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Total Proyek</div>
            <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{stats.stats.total_projects}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '12px', fontWeight: 600 }}>Aktif</div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Total Pekerja</div>
            <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{stats.stats.total_workers}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Hadir Hari Ini</div>
            <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{stats.today.attendance.hadir}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={20} />
          </div>
          <div style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '12px', fontWeight: 600 }}>Hari Ini</div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Total Absensi</div>
            <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{stats.today.attendance.total}</div>
          </div>
        </div>
      </div>

      {/* Tabel Proyek Aktif */}
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Proyek Aktif</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Kehadiran pekerja hari ini per lokasi proyek</p>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Lokasi</th>
                <th>Kehadiran Hari Ini</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Belum ada proyek aktif.</td>
                </tr>
              ) : (
                activeProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{project.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        ID: PROJ-{new Date().getFullYear()}-{project.id.toString().padStart(3, '0')}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{project.location}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="attendance-progress-bar">
                          <div 
                            className="attendance-progress-fill"
                            style={{ 
                              width: `${(project.attendance_count! / project.total_workers_needed!) * 100}%`
                            }} 
                          />
                        </div>
                        <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {project.attendance_count}/{project.total_workers_needed}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button style={{ color: 'var(--text-main)' }} onClick={() => navigate('/proyek')}>
                        <ChevronRight size={20} />
                      </button>
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

export default Dashboard;
