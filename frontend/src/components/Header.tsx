import React from 'react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="top-header">
      <div className="page-title">{title || ''}</div>
      <div className="header-right">
        <div className="user-profile">
          <span className="user-name">Admin Leon</span>
          <img 
            src="leon.webp" 
            alt="User profile" 
            className="user-avatar" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
