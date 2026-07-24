import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Users, CalendarDays, BarChart2, LogOut, X, Building2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      {/* Header Branding */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Building2 size={22} />
          </div>
          <div className="sidebar-brand-text">
            <h1>CV Fortuna Aeterna</h1>
            <p>Absensi & Kelola Pekerja</p>
          </div>
        </div>

        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-group-label">NAVIGASI UTAMA</div>

        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
          onClick={handleNavClick}
        >
          <div className="nav-item-icon"><LayoutDashboard size={19} /></div>
          <span className="nav-item-text">Dashboard</span>
          <ChevronRight size={15} className="nav-item-arrow" />
        </NavLink>

        <NavLink
          to="/proyek"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <div className="nav-item-icon"><Compass size={19} /></div>
          <span className="nav-item-text">Proyek</span>
          <ChevronRight size={15} className="nav-item-arrow" />
        </NavLink>

        <NavLink
          to="/pekerja"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <div className="nav-item-icon"><Users size={19} /></div>
          <span className="nav-item-text">Kelola Pekerja</span>
          <ChevronRight size={15} className="nav-item-arrow" />
        </NavLink>

        <NavLink
          to="/input-absensi"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <div className="nav-item-icon"><CalendarDays size={19} /></div>
          <span className="nav-item-text">Input Absensi</span>
          <ChevronRight size={15} className="nav-item-arrow" />
        </NavLink>

        <NavLink
          to="/rekap-absensi"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <div className="nav-item-icon"><BarChart2 size={19} /></div>
          <span className="nav-item-text">Rekap Absensi</span>
          <ChevronRight size={15} className="nav-item-arrow" />
        </NavLink>
      </nav>

      {/* Footer Logout & App Version */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Keluar Aplikasi</span>
        </button>
        <div className="sidebar-version">v1.0.0 • Enterprise Edition</div>
      </div>
    </aside>
  );
};

export default Sidebar;
