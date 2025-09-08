import { useCallback, useRef, useEffect } from 'react';

// Хук для мемоизации колбэков - потому что создавать новые функции каждый раз это как печатать новый код вместо копипасты 😅
const useMemoizedCallback = (callback, dependencies = []) => {
  const ref = useRef();

  // Обновляем ссылку на колбэк - как обновляем статус в LinkedIn, только полезнее 💼
  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  // Возвращаем мемоизированную версию колбэка - как кэшируем пароль в браузере, только безопаснее 🔒
  return useCallback((...args) => {
    return ref.current(...args);
  }, dependencies);
};

export default useMemoizedCallback; 