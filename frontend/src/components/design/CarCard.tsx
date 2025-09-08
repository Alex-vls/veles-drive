import React, { useState } from 'react';
import './CarCard.css';

interface CarSpecs {
  year: number;
  mileage: number;
  maxSpeed: number;
  power: number;
  acceleration: number;
}

interface CarCardProps {
  id: string;
  brand: string;
  model: string;
  image: string;
  price: number;
  specs: CarSpecs;
  badge?: string;
  isFavorite?: boolean;
  onFavoriteClick?: (id: string) => void;
  onClick?: (id: string) => void;
  images?: string[];
}

const CarCard: React.FC<CarCardProps> = ({
  id,
  brand,
  model,
  image,
  price,
  specs,
  badge,
  isFavorite = false,
  onFavoriteClick,
  onClick,
  images = []
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteClick?.(id);
  };

  const handleCardClick = () => {
    onClick?.(id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const formatMileage = (mileage: number) => {
    if (mileage < 1000) {
      return `${mileage} км`;
    }
    return `${(mileage / 1000).toFixed(0)} тыс. км`;
  };

  return (
    <div 
      className={`car-card ${isHovered ? 'car-card--hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Изображение */}
      <div className="car-card__image-container">
        <img 
          src={image} 
          alt={`${brand} ${model}`}
          className="car-card__image"
        />
        
        {/* Бейдж */}
        {badge && (
          <div className="car-card__badge">
            {badge}
          </div>
        )}
        
        {/* Кнопка избранного */}
        <button 
          className={`car-card__favorite ${isFavorite ? 'car-card__favorite--active' : ''}`}
          onClick={handleFavoriteClick}
        >
          <span className="favorite-icon">❤</span>
        </button>
        
        {/* Слайдер изображений */}
        {images.length > 1 && (
          <div className="car-card__slider">
            <div className="car-card__slider-dots">
              {images.map((_, index) => (
                <div 
                  key={index}
                  className={`car-card__slider-dot ${index === currentImageIndex ? 'car-card__slider-dot--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="car-card__content">
        <h3 className="car-card__title">
          {brand.toUpperCase()} {model.toUpperCase()}
        </h3>
        
        <div className="car-card__specs">
          <div className="car-card__spec">
            <span className="car-card__spec-label">Год выпуска:</span>
            <span className="car-card__spec-value">{specs.year}</span>
          </div>
          
          <div className="car-card__spec">
            <span className="car-card__spec-label">Пробег:</span>
            <span className="car-card__spec-value">{formatMileage(specs.mileage)}</span>
          </div>
        </div>
        
        <div className="car-card__performance">
          <div className="car-card__performance-item">
            <span className="car-card__performance-icon">⚡</span>
            <span className="car-card__performance-text">до {specs.maxSpeed} км/ч</span>
          </div>
          
          <div className="car-card__performance-item">
            <span className="car-card__performance-icon">🏎️</span>
            <span className="car-card__performance-text">{specs.power} л. с.</span>
          </div>
          
          <div className="car-card__performance-item">
            <span className="car-card__performance-icon">🚀</span>
            <span className="car-card__performance-text">Разгон: {specs.acceleration} с</span>
          </div>
        </div>
        
        <div className="car-card__price">
          {formatPrice(price)} ₽
        </div>
      </div>
    </div>
  );
};

export default CarCard; 