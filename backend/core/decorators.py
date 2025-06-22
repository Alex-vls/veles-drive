from functools import wraps
from django.core.cache import cache
from django.conf import settings

def cache_response(timeout=None):
    """
    Декоратор для кэширования ответов представлений.
    
    Args:
        timeout (int): Время жизни кэша в секундах. Если не указано,
                      используется значение CACHE_TTL из настроек.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(view_instance, request, *args, **kwargs):
            # Генерируем ключ кэша на основе URL и параметров запроса
            cache_key = f"view_cache_{request.path}_{request.GET.urlencode()}"
            
            # Проверяем кэш
            response = cache.get(cache_key)
            if response is not None:
                return response
            
            # Если нет в кэше, выполняем представление
            response = view_func(view_instance, request, *args, **kwargs)
            
            # Кэшируем ответ
            cache_timeout = timeout or getattr(settings, 'CACHE_TTL', 60 * 15)
            cache.set(cache_key, response, cache_timeout)
            
            return response
        return _wrapped_view
    return decorator

def cache_method(timeout=None):
    """
    Декоратор для кэширования методов моделей.
    
    Args:
        timeout (int): Время жизни кэша в секундах. Если не указано,
                      используется значение CACHE_TTL из настроек.
    """
    def decorator(method):
        @wraps(method)
        def _wrapped_method(self, *args, **kwargs):
            # Генерируем ключ кэша на основе имени метода и аргументов
            cache_key = f"method_cache_{self.__class__.__name__}_{method.__name__}_{str(args)}_{str(kwargs)}"
            
            # Проверяем кэш
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Если нет в кэше, выполняем метод
            result = method(self, *args, **kwargs)
            
            # Кэшируем результат
            cache_timeout = timeout or getattr(settings, 'CACHE_TTL', 60 * 15)
            cache.set(cache_key, result, cache_timeout)
            
            return result
        return _wrapped_method
    return decorator 