import time
import psutil
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from .models import (
    SystemMetric, SystemEvent, IntegrationConfig, DataSync,
    CacheEntry, HealthCheck, SystemAlert, IntegrationLog
)

logger = logging.getLogger(__name__)


class MetricsService:
    """Сервис для работы с метриками"""
    
    @staticmethod
    def record_metric(metric_type, name, value, unit=None, metadata=None):
        """Записать метрику"""
        try:
            SystemMetric.objects.create(
                metric_type=metric_type,
                name=name,
                value=value,
                unit=unit,
                metadata=metadata or {}
            )
            return True
        except Exception as e:
            logger.error(f"Ошибка записи метрики: {e}")
            return False
    
    @staticmethod
    def get_metrics(metric_type=None, hours=24):
        """Получить метрики за период"""
        queryset = SystemMetric.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=hours)
        )
        if metric_type:
            queryset = queryset.filter(metric_type=metric_type)
        return queryset.order_by('-timestamp')
    
    @staticmethod
    def get_performance_metrics():
        """Получить метрики производительности"""
        # Системные метрики
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Метрики базы данных
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM information_schema.tables")
            db_tables = cursor.fetchone()[0]
        
        # Метрики кэша
        cache_hits = cache.get('cache_hits', 0)
        cache_misses = cache.get('cache_misses', 0)
        cache_hit_rate = cache_hits / (cache_hits + cache_misses) if (cache_hits + cache_misses) > 0 else 0
        
        return {
            'cpu_usage': cpu_percent,
            'memory_usage': memory.percent,
            'disk_usage': disk.percent,
            'db_tables': db_tables,
            'cache_hit_rate': cache_hit_rate * 100
        }


class EventService:
    """Сервис для работы с событиями"""
    
    @staticmethod
    def record_event(event_type, description, user=None, severity='medium', metadata=None, request=None):
        """Записать событие"""
        try:
            ip_address = None
            user_agent = None
            
            if request:
                ip_address = request.META.get('REMOTE_ADDR')
                user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            SystemEvent.objects.create(
                event_type=event_type,
                user=user,
                description=description,
                severity=severity,
                metadata=metadata or {},
                ip_address=ip_address,
                user_agent=user_agent
            )
            return True
        except Exception as e:
            logger.error(f"Ошибка записи события: {e}")
            return False
    
    @staticmethod
    def get_recent_events(hours=24, event_type=None):
        """Получить недавние события"""
        queryset = SystemEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=hours)
        )
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        return queryset.order_by('-timestamp')[:100]


class HealthCheckService:
    """Сервис для проверки здоровья системы"""
    
    @staticmethod
    def check_database():
        """Проверить базу данных"""
        start_time = time.time()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            response_time = (time.time() - start_time) * 1000
            
            HealthCheck.objects.create(
                component='database',
                check_type='database',
                status='healthy',
                response_time=response_time
            )
            return True, response_time
        except Exception as e:
            HealthCheck.objects.create(
                component='database',
                check_type='database',
                status='critical',
                error_message=str(e)
            )
            return False, None
    
    @staticmethod
    def check_cache():
        """Проверить кэш"""
        start_time = time.time()
        try:
            test_key = 'health_check_test'
            cache.set(test_key, 'test_value', 60)
            value = cache.get(test_key)
            cache.delete(test_key)
            
            if value == 'test_value':
                response_time = (time.time() - start_time) * 1000
                HealthCheck.objects.create(
                    component='cache',
                    check_type='cache',
                    status='healthy',
                    response_time=response_time
                )
                return True, response_time
            else:
                raise Exception("Cache test failed")
        except Exception as e:
            HealthCheck.objects.create(
                component='cache',
                check_type='cache',
                status='critical',
                error_message=str(e)
            )
            return False, None
    
    @staticmethod
    def check_external_apis():
        """Проверить внешние API"""
        # Проверка Telegram API
        try:
            from telegram_bot.services import TelegramService
            start_time = time.time()
            bot_info = TelegramService.get_bot_info()
            response_time = (time.time() - start_time) * 1000
            
            HealthCheck.objects.create(
                component='telegram',
                check_type='external_api',
                status='healthy',
                response_time=response_time
            )
        except Exception as e:
            HealthCheck.objects.create(
                component='telegram',
                check_type='external_api',
                status='critical',
                error_message=str(e)
            )
    
    @staticmethod
    def run_all_checks():
        """Запустить все проверки"""
        results = {}
        
        # Проверка базы данных
        db_ok, db_time = HealthCheckService.check_database()
        results['database'] = {'status': 'healthy' if db_ok else 'critical', 'response_time': db_time}
        
        # Проверка кэша
        cache_ok, cache_time = HealthCheckService.check_cache()
        results['cache'] = {'status': 'healthy' if cache_ok else 'critical', 'response_time': cache_time}
        
        # Проверка внешних API
        HealthCheckService.check_external_apis()
        
        return results


class AlertService:
    """Сервис для работы с алертами"""
    
    @staticmethod
    def create_alert(alert_type, title, message, severity='medium'):
        """Создать алерт"""
        try:
            SystemAlert.objects.create(
                alert_type=alert_type,
                title=title,
                message=message,
                severity=severity
            )
            return True
        except Exception as e:
            logger.error(f"Ошибка создания алерта: {e}")
            return False
    
    @staticmethod
    def get_active_alerts():
        """Получить активные алерты"""
        return SystemAlert.objects.filter(is_active=True).order_by('-created_at')
    
    @staticmethod
    def acknowledge_alert(alert_id, user):
        """Подтвердить алерт"""
        try:
            alert = SystemAlert.objects.get(id=alert_id)
            alert.is_acknowledged = True
            alert.acknowledged_by = user
            alert.acknowledged_at = timezone.now()
            alert.save()
            return True
        except SystemAlert.DoesNotExist:
            return False


class CacheService:
    """Сервис для работы с кэшем"""
    
    @staticmethod
    def set_cache_entry(key, value, expires_in_minutes=60):
        """Установить запись в кэш"""
        try:
            expires_at = timezone.now() + timedelta(minutes=expires_in_minutes)
            
            # Обновить или создать запись
            cache_entry, created = CacheEntry.objects.get_or_create(
                key=key,
                defaults={
                    'value': value,
                    'expires_at': expires_at
                }
            )
            
            if not created:
                cache_entry.value = value
                cache_entry.expires_at = expires_at
                cache_entry.save()
            
            return True
        except Exception as e:
            logger.error(f"Ошибка установки кэша: {e}")
            return False
    
    @staticmethod
    def get_cache_entry(key):
        """Получить запись из кэша"""
        try:
            cache_entry = CacheEntry.objects.get(key=key)
            
            if cache_entry.is_expired:
                cache_entry.delete()
                return None
            
            # Увеличить счетчик обращений
            cache_entry.access_count += 1
            cache_entry.save()
            
            return cache_entry.value
        except CacheEntry.DoesNotExist:
            return None
    
    @staticmethod
    def clear_expired_entries():
        """Очистить истекшие записи"""
        expired_entries = CacheEntry.objects.filter(expires_at__lt=timezone.now())
        count = expired_entries.count()
        expired_entries.delete()
        return count


class DataSyncService:
    """Сервис для синхронизации данных"""
    
    @staticmethod
    def sync_erp_to_telegram():
        """Синхронизация данных ERP в Telegram"""
        try:
            sync_record = DataSync.objects.create(
                source_component='erp',
                target_component='telegram',
                sync_type='incremental',
                status='running'
            )
            
            # Здесь будет логика синхронизации
            # Например, отправка уведомлений о новых задачах
            
            sync_record.status = 'completed'
            sync_record.last_sync = timezone.now()
            sync_record.records_synced = 0  # Обновить после реализации
            sync_record.save()
            
            return True
        except Exception as e:
            logger.error(f"Ошибка синхронизации ERP → Telegram: {e}")
            return False
    
    @staticmethod
    def sync_admin_to_erp():
        """Синхронизация данных Admin в ERP"""
        try:
            sync_record = DataSync.objects.create(
                source_component='admin',
                target_component='erp',
                sync_type='incremental',
                status='running'
            )
            
            # Здесь будет логика синхронизации
            
            sync_record.status = 'completed'
            sync_record.last_sync = timezone.now()
            sync_record.records_synced = 0
            sync_record.save()
            
            return True
        except Exception as e:
            logger.error(f"Ошибка синхронизации Admin → ERP: {e}")
            return False


class IntegrationLogService:
    """Сервис для логирования интеграции"""
    
    @staticmethod
    def log_action(component, action, status, message, user=None, details=None, execution_time=None, request=None):
        """Записать действие в лог"""
        try:
            ip_address = None
            user_agent = None
            
            if request:
                ip_address = request.META.get('REMOTE_ADDR')
                user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            IntegrationLog.objects.create(
                component=component,
                action=action,
                status=status,
                message=message,
                user=user,
                details=details or {},
                execution_time=execution_time,
                ip_address=ip_address,
                user_agent=user_agent
            )
            return True
        except Exception as e:
            logger.error(f"Ошибка записи лога интеграции: {e}")
            return False
    
    @staticmethod
    def get_component_logs(component, hours=24):
        """Получить логи компонента"""
        return IntegrationLog.objects.filter(
            component=component,
            created_at__gte=timezone.now() - timedelta(hours=hours)
        ).order_by('-created_at')


class DashboardService:
    """Сервис для дашборда"""
    
    @staticmethod
    def get_dashboard_data():
        """Получить данные для дашборда"""
        # Метрики производительности
        performance_metrics = MetricsService.get_performance_metrics()
        
        # Недавние события
        recent_events = EventService.get_recent_events(hours=1)
        
        # Активные алерты
        active_alerts = AlertService.get_active_alerts()
        
        # Статус компонентов
        component_status = {
            'erp': {'status': 'healthy', 'last_check': timezone.now()},
            'telegram': {'status': 'healthy', 'last_check': timezone.now()},
            'admin': {'status': 'healthy', 'last_check': timezone.now()},
            'notifications': {'status': 'healthy', 'last_check': timezone.now()},
            'analytics': {'status': 'healthy', 'last_check': timezone.now()},
            'monitoring': {'status': 'healthy', 'last_check': timezone.now()},
        }
        
        return {
            'performance_metrics': performance_metrics,
            'recent_events': recent_events,
            'active_alerts': active_alerts,
            'component_status': component_status
        } 