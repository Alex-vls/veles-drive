from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.utils import timezone
from .models import SystemEvent, SystemMetric, IntegrationLog
from .services import EventService, MetricsService, IntegrationLogService


# Сигналы для пользователей
@receiver(post_save, sender=User)
def user_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении пользователя"""
    if created:
        EventService.record_event(
            event_type='data_created',
            description=f'Создан новый пользователь: {instance.username}',
            user=instance,
            severity='low'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='users',
            name='total_users',
            value=User.objects.count(),
            unit='users'
        )
    else:
        EventService.record_event(
            event_type='data_updated',
            description=f'Обновлен пользователь: {instance.username}',
            user=instance,
            severity='low'
        )


@receiver(post_delete, sender=User)
def user_deleted(sender, instance, **kwargs):
    """Событие при удалении пользователя"""
    EventService.record_event(
        event_type='data_deleted',
        description=f'Удален пользователь: {instance.username}',
        severity='medium'
    )


# Сигналы для ERP системы
@receiver(post_save, sender='erp.Project')
def project_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении проекта"""
    if created:
        EventService.record_event(
            event_type='erp_action',
            description=f'Создан новый проект: {instance.name}',
            user=getattr(instance, 'created_by', None),
            severity='medium'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='erp',
            name='total_projects',
            value=sender.objects.count(),
            unit='projects'
        )
    else:
        EventService.record_event(
            event_type='erp_action',
            description=f'Обновлен проект: {instance.name}',
            user=getattr(instance, 'updated_by', None),
            severity='low'
        )


@receiver(post_save, sender='erp.Task')
def task_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении задачи"""
    if created:
        EventService.record_event(
            event_type='erp_action',
            description=f'Создана новая задача: {instance.title}',
            user=getattr(instance, 'assigned_to', None),
            severity='medium'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='erp',
            name='total_tasks',
            value=sender.objects.count(),
            unit='tasks'
        )
    else:
        EventService.record_event(
            event_type='erp_action',
            description=f'Обновлена задача: {instance.title}',
            user=getattr(instance, 'updated_by', None),
            severity='low'
        )


@receiver(post_save, sender='erp.Sale')
def sale_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении продажи"""
    if created:
        EventService.record_event(
            event_type='erp_action',
            description=f'Создана новая продажа: {instance.customer_name} - {instance.amount}',
            user=getattr(instance, 'created_by', None),
            severity='high'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='erp',
            name='total_sales',
            value=sender.objects.count(),
            unit='sales'
        )
        
        # Метрика по сумме продаж
        total_amount = sender.objects.aggregate(total=models.Sum('amount'))['total'] or 0
        MetricsService.record_metric(
            metric_type='erp',
            name='total_sales_amount',
            value=total_amount,
            unit='currency'
        )


# Сигналы для Telegram Bot
@receiver(post_save, sender='telegram_bot.TelegramUser')
def telegram_user_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении пользователя Telegram"""
    if created:
        EventService.record_event(
            event_type='telegram_command',
            description=f'Новый пользователь Telegram: {instance.username}',
            severity='low'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='telegram',
            name='total_telegram_users',
            value=sender.objects.count(),
            unit='users'
        )


@receiver(post_save, sender='telegram_bot.TelegramMessage')
def telegram_message_created(sender, instance, created, **kwargs):
    """Событие при создании сообщения Telegram"""
    if created:
        EventService.record_event(
            event_type='telegram_command',
            description=f'Новое сообщение Telegram от {instance.user.username}',
            severity='low'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='telegram',
            name='total_telegram_messages',
            value=sender.objects.count(),
            unit='messages'
        )


# Сигналы для Universal Admin
@receiver(post_save, sender='universal_admin.AdminAction')
def admin_action_created(sender, instance, created, **kwargs):
    """Событие при создании действия админки"""
    if created:
        EventService.record_event(
            event_type='admin_action',
            description=f'Действие админки: {instance.action_type} - {instance.description}',
            user=instance.user,
            severity='medium'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='admin',
            name='total_admin_actions',
            value=sender.objects.count(),
            unit='actions'
        )


# Сигналы для уведомлений
@receiver(post_save, sender='core.Notification')
def notification_created(sender, instance, created, **kwargs):
    """Событие при создании уведомления"""
    if created:
        EventService.record_event(
            event_type='notification_sent',
            description=f'Отправлено уведомление: {instance.title}',
            user=instance.user,
            severity='low'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='notifications',
            name='total_notifications',
            value=sender.objects.count(),
            unit='notifications'
        )


# Сигналы для системных событий
@receiver(post_save, sender=SystemEvent)
def system_event_created(sender, instance, created, **kwargs):
    """Событие при создании системного события"""
    if created:
        # Записать метрику
        MetricsService.record_metric(
            metric_type='events',
            name='total_system_events',
            value=sender.objects.count(),
            unit='events'
        )


# Сигналы для алертов
@receiver(post_save, sender='integration.SystemAlert')
def system_alert_created(sender, instance, created, **kwargs):
    """Событие при создании системного алерта"""
    if created:
        EventService.record_event(
            event_type='error_occurred',
            description=f'Создан алерт: {instance.title}',
            severity=instance.severity
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='alerts',
            name='total_system_alerts',
            value=sender.objects.count(),
            unit='alerts'
        )


# Сигналы для логов интеграции
@receiver(post_save, sender=IntegrationLog)
def integration_log_created(sender, instance, created, **kwargs):
    """Событие при создании лога интеграции"""
    if created:
        # Записать метрику
        MetricsService.record_metric(
            metric_type='logs',
            name='total_integration_logs',
            value=sender.objects.count(),
            unit='logs'
        )


# Сигналы для метрик
@receiver(post_save, sender=SystemMetric)
def system_metric_created(sender, instance, created, **kwargs):
    """Событие при создании системной метрики"""
    if created:
        # Логировать создание метрики
        IntegrationLogService.log_action(
            component='metrics',
            action='metric_created',
            status='success',
            message=f'Создана метрика: {instance.name} = {instance.value} {instance.unit or ""}',
            details={
                'metric_type': instance.metric_type,
                'name': instance.name,
                'value': instance.value,
                'unit': instance.unit
            }
        )


# Сигналы для проверок здоровья
@receiver(post_save, sender='integration.HealthCheck')
def health_check_created(sender, instance, created, **kwargs):
    """Событие при создании проверки здоровья"""
    if created:
        if instance.status == 'critical':
            EventService.record_event(
                event_type='error_occurred',
                description=f'Критическая ошибка здоровья системы: {instance.component} - {instance.error_message}',
                severity='critical'
            )
        elif instance.status == 'warning':
            EventService.record_event(
                event_type='error_occurred',
                description=f'Предупреждение здоровья системы: {instance.component}',
                severity='high'
            )


# Сигналы для синхронизации данных
@receiver(post_save, sender='integration.DataSync')
def data_sync_updated(sender, instance, **kwargs):
    """Событие при обновлении синхронизации данных"""
    if instance.status == 'failed':
        EventService.record_event(
            event_type='error_occurred',
            description=f'Ошибка синхронизации: {instance.source_component} → {instance.target_component}',
            severity='high'
        )
    elif instance.status == 'completed':
        EventService.record_event(
            event_type='data_updated',
            description=f'Синхронизация завершена: {instance.source_component} → {instance.target_component} ({instance.records_synced} записей)',
            severity='low'
        )


# Сигналы для кэша
@receiver(post_save, sender='integration.CacheEntry')
def cache_entry_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении записи кэша"""
    if created:
        # Записать метрику
        MetricsService.record_metric(
            metric_type='cache',
            name='total_cache_entries',
            value=sender.objects.count(),
            unit='entries'
        )


@receiver(post_delete, sender='integration.CacheEntry')
def cache_entry_deleted(sender, instance, **kwargs):
    """Событие при удалении записи кэша"""
    # Записать метрику
    MetricsService.record_metric(
        metric_type='cache',
        name='total_cache_entries',
        value=sender.objects.count(),
        unit='entries'
    )


# Сигналы для конфигурации интеграции
@receiver(post_save, sender='integration.IntegrationConfig')
def integration_config_updated(sender, instance, **kwargs):
    """Событие при обновлении конфигурации интеграции"""
    EventService.record_event(
        event_type='admin_action',
        description=f'Обновлена конфигурация интеграции: {instance.component}.{instance.key}',
        severity='low'
    )


# Сигналы для автомобилей
@receiver(post_save, sender='cars.Car')
def car_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении автомобиля"""
    if created:
        EventService.record_event(
            event_type='data_created',
            description=f'Добавлен новый автомобиль: {instance.brand} {instance.model}',
            severity='medium'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='cars',
            name='total_cars',
            value=sender.objects.count(),
            unit='cars'
        )


# Сигналы для компаний
@receiver(post_save, sender='companies.Company')
def company_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении компании"""
    if created:
        EventService.record_event(
            event_type='data_created',
            description=f'Добавлена новая компания: {instance.name}',
            severity='medium'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='companies',
            name='total_companies',
            value=sender.objects.count(),
            unit='companies'
        )


# Сигналы для отзывов
@receiver(post_save, sender='core.Review')
def review_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении отзыва"""
    if created:
        EventService.record_event(
            event_type='data_created',
            description=f'Добавлен новый отзыв от {instance.user.username}',
            user=instance.user,
            severity='low'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='reviews',
            name='total_reviews',
            value=sender.objects.count(),
            unit='reviews'
        )


# Сигналы для новостей
@receiver(post_save, sender='core.News')
def news_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении новости"""
    if created:
        EventService.record_event(
            event_type='data_created',
            description=f'Опубликована новость: {instance.title}',
            severity='medium'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='news',
            name='total_news',
            value=sender.objects.count(),
            unit='articles'
        )


# Сигналы для ошибок
@receiver(post_save, sender='core.ErrorLog')
def error_log_created(sender, instance, created, **kwargs):
    """Событие при создании лога ошибки"""
    if created:
        EventService.record_event(
            event_type='error_occurred',
            description=f'Зафиксирована ошибка: {instance.error_type}',
            severity='high'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='errors',
            name='total_errors',
            value=sender.objects.count(),
            unit='errors'
        )


# Сигналы для аналитики
@receiver(post_save, sender='core.AnalyticsEvent')
def analytics_event_created(sender, instance, created, **kwargs):
    """Событие при создании события аналитики"""
    if created:
        # Записать метрику
        MetricsService.record_metric(
            metric_type='analytics',
            name='total_analytics_events',
            value=sender.objects.count(),
            unit='events'
        )


# Сигналы для SEO
@receiver(post_save, sender='core.SEOMetric')
def seo_metric_created(sender, instance, created, **kwargs):
    """Событие при создании SEO метрики"""
    if created:
        EventService.record_event(
            event_type='data_created',
            description=f'Обновлена SEO метрика: {instance.metric_name}',
            severity='low'
        )


# Сигналы для YouTube
@receiver(post_save, sender='core.YouTubeVideo')
def youtube_video_created_updated(sender, instance, created, **kwargs):
    """Событие при создании/обновлении видео YouTube"""
    if created:
        EventService.record_event(
            event_type='data_created',
            description=f'Добавлено видео YouTube: {instance.title}',
            severity='medium'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='youtube',
            name='total_youtube_videos',
            value=sender.objects.count(),
            unit='videos'
        )


# Сигналы для Telegram уведомлений
@receiver(post_save, sender='telegram_bot.TelegramNotification')
def telegram_notification_created(sender, instance, created, **kwargs):
    """Событие при создании уведомления Telegram"""
    if created:
        EventService.record_event(
            event_type='notification_sent',
            description=f'Отправлено уведомление Telegram: {instance.title}',
            severity='low'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='telegram',
            name='total_telegram_notifications',
            value=sender.objects.count(),
            unit='notifications'
        )


# Сигналы для Mini App сессий
@receiver(post_save, sender='telegram_bot.MiniAppSession')
def mini_app_session_created(sender, instance, created, **kwargs):
    """Событие при создании сессии Mini App"""
    if created:
        EventService.record_event(
            event_type='telegram_command',
            description=f'Создана сессия Mini App для пользователя {instance.user.username}',
            severity='low'
        )
        
        # Записать метрику
        MetricsService.record_metric(
            metric_type='telegram',
            name='total_mini_app_sessions',
            value=sender.objects.count(),
            unit='sessions'
        ) 