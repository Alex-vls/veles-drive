import React from 'react';
import './Header.css';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onFavoritesClick?: () => void;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSearchClick,
  onFavoritesClick,
  onProfileClick
}) => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <div className="header-logo">
          <span className="logo-text">ВЕЛЕС</span>
          <span className="logo-auto">АВТО</span>
        </div>

        {/* Навигация */}
        <nav className="header-navigation">
          <a href="#top-selections" className="nav-link">
            ТОП-ПОДБОРКИ
            <span className="dropdown-arrow">▼</span>
          </a>
          <a href="#favorites" className="nav-link" onClick={onFavoritesClick}>
            ИЗБРАННОЕ
          </a>
          <a href="#about" className="nav-link">
            О НАС
          </a>
          <a href="#platform" className="nav-link">
            О ПЛАТФОРМЕ
          </a>
          <a href="#news" className="nav-link">
            НОВОСТИ
          </a>
        </nav>

        {/* Правые иконки */}
        <div className="header-actions">
          <ThemeToggle size="medium" className="header-theme-toggle" />
          <button className="action-button" onClick={onMenuClick}>
            <span className="hamburger-icon">☰</span>
          </button>
          <button className="action-button notification-button" onClick={onFavoritesClick}>
            <span className="bookmark-icon">🔖</span>
            <span className="notification-badge">3</span>
          </button>
          <button className="action-button notification-button" onClick={onProfileClick}>
            <span className="profile-icon">👤</span>
            <span className="notification-badge">1</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 