import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const getTodayLabel = () => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
};

const getPageTitle = (pathname: string): string => {
  if (pathname === '/' || pathname === '') return 'Dashboard';
  if (pathname.startsWith('/proyek')) return 'Manajemen Proyek';
  if (pathname.startsWith('/pekerja')) return 'Kelola Pekerja';
  if (pathname.startsWith('/input-absensi')) return `Input Absensi — ${getTodayLabel()}`;
  if (pathname.startsWith('/rekap-absensi')) return 'Rekap Absensi';
  return '';
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-container">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Navbar
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
