import { useEffect, useRef } from 'react';

// Хук для анимаций - потому что анимации должны быть плавными, как кошка, крадущаяся за мышкой 🐱
const useAnimationFrame = (callback) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  // Функция анимации - как дирижер оркестра, только для кадров 🎭
  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      // Вычисляем разницу во времени - как измеряем, сколько кофе выпил программист ☕
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Запускаем анимацию - как включаем двигатель у гоночной машины 🏎️
    requestRef.current = requestAnimationFrame(animate);
    // Очистка при размонтировании - как уборка после вечеринки 🧹
    return () => cancelAnimationFrame(requestRef.current);
  }, [callback]);
};

export default useAnimationFrame; 