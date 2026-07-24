import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

// Helper: format tanggal hari ini dalam Bahasa Indonesia
const getTodayLabel = () => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
};

// Map route path → judul halaman
const getPageTitle = (pathname: string): string => {
  if (pathname === '/' || pathname === '') return 'Dashboard';
  if (pathname.startsWith('/proyek')) return 'Manajemen Proyek';
  if (pathname.startsWith('/pekerja')) return 'Kelola Pekerja';
  if (pathname.startsWith('/input-absensi')) return `Input Absensi — ${getTodayLabel()}`;
  if (pathname.startsWith('/rekap-absensi')) return 'Rekap Absensi';
  return '';
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-container">
      {/* Overlay gelap saat sidebar terbuka di mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Satu-satunya Header di seluruh app */}
        <Header
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
