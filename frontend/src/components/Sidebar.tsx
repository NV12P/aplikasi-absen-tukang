import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Compass, Users, CalendarDays, BarChart2, LogOut, X } from 'lucide-react';
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

  // Tutup sidebar saat nav-item diklik (untuk mobile)
  const handleNavClick = () => {
    onClose();
  };

  return (
    <div className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <h1>CV Fortuna Aeterna</h1>
        <p>Enterprise Construction</p>
        {/* Tombol close hanya muncul di mobile */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
          onClick={handleNavClick}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/proyek"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <Compass size={20} />
          <span>Proyek</span>
        </NavLink>

        <NavLink
          to="/pekerja"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <Users size={20} />
          <span>Kelola Pekerja</span>
        </NavLink>

        <NavLink
          to="/input-absensi"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <CalendarDays size={20} />
          <span>Input Absensi</span>
        </NavLink>

        <NavLink
          to="/rekap-absensi"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <BarChart2 size={20} />
          <span>Rekap Absensi</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
