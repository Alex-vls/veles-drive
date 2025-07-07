from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
import random

from integration.models import (
    SystemMetric, SystemEvent, IntegrationConfig, DataSync,
    CacheEntry, HealthCheck, SystemAlert, IntegrationLog
)
from integration.services import (
    MetricsService, EventService, HealthCheckService, AlertService,
    CacheService, DataSyncService, IntegrationLogService
)


class Command(BaseCommand):
    help = 'Загрузить демо-данные для интеграции системы'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Очистить существующие данные перед загрузкой',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Очистка существующих данных...')
            SystemMetric.objects.all().delete()
            SystemEvent.objects.all().delete()
            IntegrationConfig.objects.all().delete()
            DataSync.objects.all().delete()
            CacheEntry.objects.all().delete()
            HealthCheck.objects.all().delete()
            SystemAlert.objects.all().delete()
            IntegrationLog.objects.all().delete()

        self.stdout.write('Загрузка демо-данных интеграции...')

        # Создать пользователя для демо-данных
        user, created = User.objects.get_or_create(
            username='demo_admin',
            defaults={
                'email': 'demo@veles-auto.com',
                'first_name': 'Демо',
                'last_name': 'Администратор',
                'is_staff': True,
                'is_superuser': True
            }
        )

        # Загрузить конфигурации интеграции
        self.load_integration_configs()

        # Загрузить метрики
        self.load_system_metrics()

        # Загрузить события
        self.load_system_events(user)

        # Загрузить проверки здоровья
        self.load_health_checks()

        # Загрузить алерты
        self.load_system_alerts(user)

        # Загрузить логи интеграции
        self.load_integration_logs(user)

        # Загрузить синхронизации данных
        self.load_data_syncs()

        # Загрузить кэш записи
        self.load_cache_entries()

        self.stdout.write(
            self.style.SUCCESS('Демо-данные интеграции успешно загружены!')
        )

    def load_integration_configs(self):
        """Загрузить конфигурации интеграции"""
        configs = [
            # ERP конфигурации
            {
                'component': 'erp',
                'key': 'auto_notifications',
                'value': 'true',
                'description': 'Автоматические уведомления для ERP событий'
            },
            {
                'component': 'erp',
                'key': 'sync_interval',
                'value': '300',
                'description': 'Интервал синхронизации в секундах'
            },
            {
                'component': 'erp',
                'key': 'max_tasks_per_user',
                'value': '10',
                'description': 'Максимальное количество задач на пользователя'
            },

            # Telegram конфигурации
            {
                'component': 'telegram',
                'key': 'webhook_url',
                'value': 'https://api.veles-auto.com/telegram/webhook/',
                'description': 'URL для webhook Telegram'
            },
            {
                'component': 'telegram',
                'key': 'auto_replies',
                'value': 'true',
                'description': 'Автоматические ответы бота'
            },
            {
                'component': 'telegram',
                'key': 'notification_delay',
                'value': '5',
                'description': 'Задержка уведомлений в секундах'
            },

            # Admin конфигурации
            {
                'component': 'admin',
                'key': 'dashboard_refresh',
                'value': '30',
                'description': 'Интервал обновления дашборда в секундах'
            },
            {
                'component': 'admin',
                'key': 'audit_logging',
                'value': 'true',
                'description': 'Ведение аудит логов'
            },
            {
                'component': 'admin',
                'key': 'max_sessions',
                'value': '100',
                'description': 'Максимальное количество активных сессий'
            },

            # Уведомления конфигурации
            {
                'component': 'notifications',
                'key': 'email_enabled',
                'value': 'true',
                'description': 'Включить email уведомления'
            },
            {
                'component': 'notifications',
                'key': 'telegram_enabled',
                'value': 'true',
                'description': 'Включить Telegram уведомления'
            },
            {
                'component': 'notifications',
                'key': 'push_enabled',
                'value': 'false',
                'description': 'Включить push уведомления'
            },

            # Аналитика конфигурации
            {
                'component': 'analytics',
                'key': 'tracking_enabled',
                'value': 'true',
                'description': 'Включить отслеживание событий'
            },
            {
                'component': 'analytics',
                'key': 'retention_days',
                'value': '90',
                'description': 'Срок хранения аналитических данных в днях'
            },
            {
                'component': 'analytics',
                'key': 'batch_size',
                'value': '1000',
                'description': 'Размер пакета для обработки данных'
            },

            # Мониторинг конфигурации
            {
                'component': 'monitoring',
                'key': 'health_check_interval',
                'value': '60',
                'description': 'Интервал проверки здоровья в секундах'
            },
            {
                'component': 'monitoring',
                'key': 'alert_threshold',
                'value': '80',
                'description': 'Порог для алертов в процентах'
            },
            {
                'component': 'monitoring',
                'key': 'log_retention',
                'value': '30',
                'description': 'Срок хранения логов в днях'
            },
        ]

        for config_data in configs:
            IntegrationConfig.objects.get_or_create(
                component=config_data['component'],
                key=config_data['key'],
                defaults=config_data
            )

        self.stdout.write(f'Загружено {len(configs)} конфигураций интеграции')

    def load_system_metrics(self):
        """Загрузить системные метрики"""
        # Генерировать метрики за последние 24 часа
        now = timezone.now()
        metrics_data = []

        # Метрики производительности
        for i in range(24):
            timestamp = now - timedelta(hours=i)
            metrics_data.extend([
                {
                    'metric_type': 'performance',
                    'name': 'cpu_usage',
                    'value': random.uniform(20, 80),
                    'unit': '%',
                    'timestamp': timestamp
                },
                {
                    'metric_type': 'performance',
                    'name': 'memory_usage',
                    'value': random.uniform(40, 90),
                    'unit': '%',
                    'timestamp': timestamp
                },
                {
                    'metric_type': 'performance',
                    'name': 'disk_usage',
                    'value': random.uniform(30, 70),
                    'unit': '%',
                    'timestamp': timestamp
                },
                {
                    'metric_type': 'performance',
                    'name': 'response_time',
                    'value': random.uniform(50, 500),
                    'unit': 'ms',
                    'timestamp': timestamp
                },
            ])

        # Метрики пользователей
        for i in range(24):
            timestamp = now - timedelta(hours=i)
            metrics_data.extend([
                {
                    'metric_type': 'users',
                    'name': 'active_users',
                    'value': random.randint(10, 100),
                    'unit': 'users',
                    'timestamp': timestamp
                },
                {
                    'metric_type': 'users',
                    'name': 'new_registrations',
                    'value': random.randint(0, 5),
                    'unit': 'users',
                    'timestamp': timestamp
                },
            ])

        # Метрики транзакций
        for i in range(24):
            timestamp = now - timedelta(hours=i)
            metrics_data.extend([
                {
                    'metric_type': 'transactions',
                    'name': 'requests_per_minute',
                    'value': random.randint(100, 1000),
                    'unit': 'requests',
                    'timestamp': timestamp
                },
                {
                    'metric_type': 'transactions',
                    'name': 'error_rate',
                    'value': random.uniform(0.1, 2.0),
                    'unit': '%',
                    'timestamp': timestamp
                },
            ])

        # Метрики компонентов
        components = ['erp', 'telegram', 'admin', 'notifications']
        for component in components:
            for i in range(24):
                timestamp = now - timedelta(hours=i)
                metrics_data.extend([
                    {
                        'metric_type': component,
                        'name': f'{component}_requests',
                        'value': random.randint(50, 500),
                        'unit': 'requests',
                        'timestamp': timestamp
                    },
                    {
                        'metric_type': component,
                        'name': f'{component}_errors',
                        'value': random.randint(0, 10),
                        'unit': 'errors',
                        'timestamp': timestamp
                    },
                ])

        # Создать метрики
        for metric_data in metrics_data:
            SystemMetric.objects.get_or_create(
                metric_type=metric_data['metric_type'],
                name=metric_data['name'],
                timestamp=metric_data['timestamp'],
                defaults={
                    'value': metric_data['value'],
                    'unit': metric_data['unit']
                }
            )

        self.stdout.write(f'Загружено {len(metrics_data)} системных метрик')

    def load_system_events(self, user):
        """Загрузить системные события"""
        events_data = [
            # События пользователей
            {
                'event_type': 'user_login',
                'description': 'Пользователь admin вошел в систему',
                'user': user,
                'severity': 'low'
            },
            {
                'event_type': 'user_logout',
                'description': 'Пользователь demo_user вышел из системы',
                'severity': 'low'
            },

            # События ERP
            {
                'event_type': 'erp_action',
                'description': 'Создан новый проект "Разработка веб-сайта"',
                'user': user,
                'severity': 'medium'
            },
            {
                'event_type': 'erp_action',
                'description': 'Задача "Дизайн главной страницы" назначена пользователю designer',
                'user': user,
                'severity': 'medium'
            },
            {
                'event_type': 'erp_action',
                'description': 'Продажа завершена: клиент "ООО Технологии" - 150,000 руб.',
                'user': user,
                'severity': 'high'
            },

            # События Telegram
            {
                'event_type': 'telegram_command',
                'description': 'Новый пользователь @ivan_petrov подключился к боту',
                'severity': 'low'
            },
            {
                'event_type': 'telegram_command',
                'description': 'Команда /start выполнена пользователем @maria_sidorova',
                'severity': 'low'
            },

            # События админки
            {
                'event_type': 'admin_action',
                'description': 'Администратор обновил настройки системы',
                'user': user,
                'severity': 'medium'
            },
            {
                'event_type': 'admin_action',
                'description': 'Создан новый пользователь с ролью "Менеджер"',
                'user': user,
                'severity': 'medium'
            },

            # События уведомлений
            {
                'event_type': 'notification_sent',
                'description': 'Отправлено уведомление о новой задаче пользователю designer',
                'user': user,
                'severity': 'low'
            },
            {
                'event_type': 'notification_sent',
                'description': 'Email уведомление отправлено клиенту client@example.com',
                'severity': 'low'
            },

            # События ошибок
            {
                'event_type': 'error_occurred',
                'description': 'Ошибка подключения к базе данных',
                'severity': 'critical'
            },
            {
                'event_type': 'error_occurred',
                'description': 'Timeout при запросе к внешнему API',
                'severity': 'high'
            },
        ]

        # Создать события с разными временными метками
        for i, event_data in enumerate(events_data):
            timestamp = timezone.now() - timedelta(hours=i)
            SystemEvent.objects.get_or_create(
                event_type=event_data['event_type'],
                description=event_data['description'],
                timestamp=timestamp,
                defaults={
                    'user': event_data.get('user'),
                    'severity': event_data['severity']
                }
            )

        self.stdout.write(f'Загружено {len(events_data)} системных событий')

    def load_health_checks(self):
        """Загрузить проверки здоровья"""
        components = ['database', 'cache', 'telegram', 'erp', 'admin']
        check_types = ['database', 'cache', 'external_api', 'file_system']
        statuses = ['healthy', 'warning', 'critical']

        for component in components:
            for check_type in check_types:
                # Создать несколько проверок для каждого компонента
                for i in range(5):
                    timestamp = timezone.now() - timedelta(hours=i)
                    status = random.choice(statuses)
                    
                    HealthCheck.objects.get_or_create(
                        component=component,
                        check_type=check_type,
                        checked_at=timestamp,
                        defaults={
                            'status': status,
                            'response_time': random.uniform(10, 500) if status != 'critical' else None,
                            'error_message': f'Ошибка {component} {check_type}' if status == 'critical' else ''
                        }
                    )

        self.stdout.write(f'Загружено проверок здоровья для {len(components)} компонентов')

    def load_system_alerts(self, user):
        """Загрузить системные алерты"""
        alerts_data = [
            {
                'alert_type': 'performance',
                'title': 'Высокое использование CPU',
                'message': 'Использование CPU превысило 80% в течение последних 10 минут',
                'severity': 'high'
            },
            {
                'alert_type': 'security',
                'title': 'Подозрительная активность',
                'message': 'Обнаружены множественные неудачные попытки входа',
                'severity': 'critical'
            },
            {
                'alert_type': 'error',
                'title': 'Ошибка базы данных',
                'message': 'Превышено время ожидания запроса к базе данных',
                'severity': 'critical'
            },
            {
                'alert_type': 'warning',
                'title': 'Низкое место на диске',
                'message': 'Свободное место на диске менее 10%',
                'severity': 'medium'
            },
            {
                'alert_type': 'info',
                'title': 'Обновление системы',
                'message': 'Запланировано обновление системы на 02:00',
                'severity': 'low'
            },
        ]

        for alert_data in alerts_data:
            SystemAlert.objects.get_or_create(
                alert_type=alert_data['alert_type'],
                title=alert_data['title'],
                defaults={
                    'message': alert_data['message'],
                    'severity': alert_data['severity'],
                    'is_active': True,
                    'is_acknowledged': False
                }
            )

        self.stdout.write(f'Загружено {len(alerts_data)} системных алертов')

    def load_integration_logs(self, user):
        """Загрузить логи интеграции"""
        components = ['erp', 'telegram', 'admin', 'notifications', 'analytics', 'monitoring']
        actions = ['sync_data', 'send_notification', 'process_request', 'update_config', 'health_check']
        statuses = ['success', 'error', 'warning', 'info']

        for component in components:
            for action in actions:
                # Создать несколько логов для каждого компонента и действия
                for i in range(3):
                    timestamp = timezone.now() - timedelta(hours=i)
                    status = random.choice(statuses)
                    
                    IntegrationLog.objects.get_or_create(
                        component=component,
                        action=action,
                        status=status,
                        timestamp=timestamp,
                        defaults={
                            'message': f'{action} для {component}',
                            'user': user if random.choice([True, False]) else None,
                            'execution_time': random.uniform(10, 1000) if status == 'success' else None,
                            'details': {
                                'component': component,
                                'action': action,
                                'timestamp': timestamp.isoformat()
                            }
                        }
                    )

        self.stdout.write(f'Загружено логов интеграции для {len(components)} компонентов')

    def load_data_syncs(self):
        """Загрузить синхронизации данных"""
        syncs_data = [
            {
                'source_component': 'erp',
                'target_component': 'telegram',
                'sync_type': 'incremental',
                'status': 'completed',
                'records_processed': 150,
                'records_synced': 145
            },
            {
                'source_component': 'admin',
                'target_component': 'erp',
                'sync_type': 'full',
                'status': 'completed',
                'records_processed': 50,
                'records_synced': 50
            },
            {
                'source_component': 'telegram',
                'target_component': 'analytics',
                'sync_type': 'realtime',
                'status': 'running',
                'records_processed': 25,
                'records_synced': 20
            },
            {
                'source_component': 'notifications',
                'target_component': 'telegram',
                'sync_type': 'incremental',
                'status': 'failed',
                'records_processed': 30,
                'records_synced': 0,
                'error_message': 'Ошибка подключения к Telegram API'
            },
        ]

        for sync_data in syncs_data:
            DataSync.objects.get_or_create(
                source_component=sync_data['source_component'],
                target_component=sync_data['target_component'],
                sync_type=sync_data['sync_type'],
                defaults={
                    'status': sync_data['status'],
                    'last_sync': timezone.now() - timedelta(hours=random.randint(1, 24)),
                    'records_processed': sync_data['records_processed'],
                    'records_synced': sync_data['records_synced'],
                    'error_message': sync_data.get('error_message', '')
                }
            )

        self.stdout.write(f'Загружено {len(syncs_data)} записей синхронизации данных')

    def load_cache_entries(self):
        """Загрузить кэш записи"""
        cache_data = [
            {
                'key': 'user_session_12345',
                'value': '{"user_id": 12345, "permissions": ["read", "write"]}',
                'expires_in_minutes': 60
            },
            {
                'key': 'api_rate_limit_user_67890',
                'value': '{"requests": 45, "limit": 100, "reset_time": "2024-01-15T10:00:00Z"}',
                'expires_in_minutes': 30
            },
            {
                'key': 'dashboard_data_admin',
                'value': '{"metrics": {"users": 150, "projects": 25}, "last_update": "2024-01-15T09:30:00Z"}',
                'expires_in_minutes': 15
            },
            {
                'key': 'telegram_webhook_token',
                'value': 'abc123def456ghi789',
                'expires_in_minutes': 1440  # 24 часа
            },
            {
                'key': 'erp_project_cache_123',
                'value': '{"project_id": 123, "tasks": [1, 2, 3], "members": [10, 20, 30]}',
                'expires_in_minutes': 120
            },
        ]

        for cache_data_item in cache_data:
            expires_at = timezone.now() + timedelta(minutes=cache_data_item['expires_in_minutes'])
            
            CacheEntry.objects.get_or_create(
                key=cache_data_item['key'],
                defaults={
                    'value': cache_data_item['value'],
                    'expires_at': expires_at,
                    'access_count': random.randint(1, 50)
                }
            )

        self.stdout.write(f'Загружено {len(cache_data)} кэш записей') 