import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Compass, Users, CalendarDays, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
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
      // Always clear local state and redirect, even if API fails
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>BuildTrack Pro</h1>
        <p>Enterprise Construction</p>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/proyek" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Compass size={20} />
          <span>Proyek</span>
        </NavLink>
        
        <NavLink 
          to="/pekerja" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={20} />
          <span>Kelola Pekerja</span>
        </NavLink>
        
        <NavLink 
          to="/input-absensi" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <CalendarDays size={20} />
          <span>Input Absensi</span>
        </NavLink>
        
        <NavLink 
          to="/rekap-absensi" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
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
