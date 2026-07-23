import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Tombol hamburger — hanya tampil di mobile */}
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Buka menu"
        >
          <Menu size={22} />
        </button>
        <div className="page-title">{title || ''}</div>
      </div>

      <div className="header-right">
        <div className="user-profile">
          <span className="user-name">{user?.name || 'Admin'}</span>
          <img
            src="/leon.webp"
            alt="User profile"
            className="user-avatar"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
