import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

type Theme = 'light' | 'dark';

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'medium' 
}) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isAnimating, setIsAnimating] = useState(false);

  // Инициализация темы при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Применение темы к документу
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  // Переключение темы
  const toggleTheme = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Анимация завершена
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      className={`theme-toggle theme-toggle--${size} ${className} ${isAnimating ? 'theme-toggle--animating' : ''}`}
      onClick={toggleTheme}
      aria-label={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
      title={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
    >
      <div className="theme-toggle__container">
        <div className="theme-toggle__icon theme-toggle__icon--sun">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>
        
        <div className="theme-toggle__icon theme-toggle__icon--moon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
        
        <div className="theme-toggle__slider" />
      </div>
    </button>
  );
};

export default ThemeToggle; 