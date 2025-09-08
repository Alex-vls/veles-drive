import React from 'react';
import './Loading.css';

export interface LoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'bars';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false,
  className = ''
}) => {
  const loadingClasses = [
    'loading',
    `loading--${type}`,
    `loading--${size}`,
    `loading--${color}`,
    fullScreen ? 'loading--full-screen' : '',
    className
  ].filter(Boolean).join(' ');

  const renderSpinner = () => (
    <div className="loading__spinner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeDasharray="31.416" strokeDashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite" />
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );

  const renderDots = () => (
    <div className="loading__dots">
      <div className="loading__dot"></div>
      <div className="loading__dot"></div>
      <div className="loading__dot"></div>
    </div>
  );

  const renderPulse = () => (
    <div className="loading__pulse">
      <div className="loading__pulse-circle"></div>
    </div>
  );

  const renderBars = () => (
    <div className="loading__bars">
      <div className="loading__bar"></div>
      <div className="loading__bar"></div>
      <div className="loading__bar"></div>
      <div className="loading__bar"></div>
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={loadingClasses}>
      {renderLoader()}
      {text && (
        <div className="loading__text">
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading; 