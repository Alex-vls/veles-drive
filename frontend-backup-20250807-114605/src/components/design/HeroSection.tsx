import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  onCatalogClick?: () => void;
  backgroundImage?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onCatalogClick,
  backgroundImage = '/images/hero-car.jpg'
}) => {
  return (
    <section className="hero-section">
      {/* Фоновое изображение */}
      <div 
        className="hero-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="hero-overlay"></div>
      </div>

      {/* Контент */}
      <div className="hero-content">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-headline">
              АВТОМОБИЛИ, КОТОРЫЕ<br />
              ГОВОРЯТ ЗА ВАС
            </h1>
            
            <p className="hero-subtext">
              Только официальные дилеры и проверенные автосалоны.<br />
              Исключительное качество. Прозрачные условия.
            </p>
            
            <button 
              className="hero-cta-button"
              onClick={onCatalogClick}
            >
              КАТАЛОГ АВТОМОБИЛЕЙ
            </button>
          </div>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="hero-decoration">
        <div className="hero-glow"></div>
      </div>
    </section>
  );
};

export default HeroSection; 