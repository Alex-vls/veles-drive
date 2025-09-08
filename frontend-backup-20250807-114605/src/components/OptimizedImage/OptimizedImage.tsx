import React, { useState, useEffect, memo } from 'react';
import './OptimizedImage.css';

// Оптимизированное изображение - потому что загрузка изображений должна быть быстрой, как кошка, убегающая от пылесоса 🐱
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  // Плейсхолдер по умолчанию - на случай, если изображение решит взять отпуск 🏖️
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiLz48L3N2Zz4=',
  ...props
}) => {
  // Состояния для отслеживания загрузки и ошибок - как система мониторинга для изображений 📊
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Предзагрузка изображения - потому что мы не любим сюрпризы, как баг в продакшене 😅
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  return (
    <div
      className={`optimized-image ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        backgroundImage: `url(${error ? placeholder : src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <img
        src={src}
        alt={alt}
        className={`optimized-image__img ${isLoaded ? 'optimized-image__img--loaded' : ''}`}
        loading="lazy"
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
};

// Мемоизация компонента - чтобы не перерисовывать его чаще, чем программист пьет кофе ☕
export default memo(OptimizedImage); 