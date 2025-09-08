import { useState, useEffect, useCallback } from 'react';

// Хук для виртуального скроллинга - потому что рендерить 10000 элементов это как пытаться съесть слона целиком 🐘
const useVirtualScroll = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 3, // Буфер элементов - как запасной план на случай, если что-то пойдет не так 🎯
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  // Обработчик скролла - следит за прокруткой как кошка за лазерной указкой 🐱
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll);
      return () => containerRef.removeEventListener('scroll', handleScroll);
    }
  }, [containerRef, handleScroll]);

  // Вычисляем общую высоту - как измеряем рост гигантского списка 📏
  const totalHeight = items.length * itemHeight;
  
  // Определяем видимый диапазон элементов - как выбираем конфеты из коробки 🍬
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Формируем видимые элементы с их стилями - как готовим пиццу, только для DOM 🍕
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    style: {
      position: 'absolute',
      top: (startIndex + index) * itemHeight,
      height: itemHeight,
      width: '100%',
    },
  }));

  return {
    containerRef: setContainerRef,
    totalHeight,
    visibleItems,
  };
};

export default useVirtualScroll; 