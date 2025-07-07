from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class SystemMetric(models.Model):
    """Модель для хранения системных метрик"""
    metric_type = models.CharField(max_length=50, choices=[
        ('performance', _('Производительность')),
        ('users', _('Пользователи')),
        ('transactions', _('Транзакции')),
        ('errors', _('Ошибки')),
        ('telegram', _('Telegram')),
        ('erp', _('ERP')),
        ('admin', _('Админка')),
    ], verbose_name=_('Тип метрики'))
    
    name = models.CharField(max_length=100, verbose_name=_('Название'))
    value = models.FloatField(verbose_name=_('Значение'))
    unit = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Единица измерения'))
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_('Время'))
    metadata = models.JSONField(default=dict, blank=True, verbose_name=_('Дополнительные данные'))
    
    class Meta:
        verbose_name = _('Системная метрика')
        verbose_name_plural = _('Системные метрики')
        db_table = 'system_metrics'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['metric_type', 'timestamp']),
            models.Index(fields=['name', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.name}: {self.value} {self.unit or ''}"


class SystemEvent(models.Model):
    """Модель для хранения системных событий"""
    event_type = models.CharField(max_length=50, choices=[
        ('user_login', _('Вход пользователя')),
        ('user_logout', _('Выход пользователя')),
        ('data_created', _('Создание данных')),
        ('data_updated', _('Обновление данных')),
        ('data_deleted', _('Удаление данных')),
        ('error_occurred', _('Произошла ошибка')),
        ('notification_sent', _('Уведомление отправлено')),
        ('telegram_command', _('Команда Telegram')),
        ('erp_action', _('Действие ERP')),
        ('admin_action', _('Действие админки')),
    ], verbose_name=_('Тип события'))
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, verbose_name=_('Пользователь'))
    description = models.TextField(verbose_name=_('Описание'))
    severity = models.CharField(max_length=20, choices=[
        ('low', _('Низкий')),
        ('medium', _('Средний')),
        ('high', _('Высокий')),
        ('critical', _('Критический')),
    ], default='medium', verbose_name=_('Важность'))
    
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_('Время'))
    metadata = models.JSONField(default=dict, blank=True, verbose_name=_('Дополнительные данные'))
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name=_('IP адрес'))
    user_agent = models.TextField(blank=True, null=True, verbose_name=_('User Agent'))
    
    class Meta:
        verbose_name = _('Системное событие')
        verbose_name_plural = _('Системные события')
        db_table = 'system_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['severity', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.event_type}: {self.description[:50]}"


class IntegrationConfig(models.Model):
    """Конфигурация интеграции компонентов"""
    component = models.CharField(max_length=50, choices=[
        ('erp', _('ERP система')),
        ('telegram', _('Telegram Bot')),
        ('admin', _('Universal Admin')),
        ('notifications', _('Уведомления')),
        ('analytics', _('Аналитика')),
        ('monitoring', _('Мониторинг')),
    ], verbose_name=_('Компонент'))
    
    key = models.CharField(max_length=100, verbose_name=_('Ключ'))
    value = models.TextField(verbose_name=_('Значение'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Описание'))
    is_active = models.BooleanField(default=True, verbose_name=_('Активно'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Создано'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Обновлено'))
    
    class Meta:
        verbose_name = _('Конфигурация интеграции')
        verbose_name_plural = _('Конфигурации интеграции')
        db_table = 'integration_configs'
        unique_together = ['component', 'key']
        ordering = ['component', 'key']
    
    def __str__(self):
        return f"{self.component}.{self.key}"


class DataSync(models.Model):
    """Модель для синхронизации данных между компонентами"""
    source_component = models.CharField(max_length=50, verbose_name=_('Источник'))
    target_component = models.CharField(max_length=50, verbose_name=_('Цель'))
    sync_type = models.CharField(max_length=50, choices=[
        ('full', _('Полная синхронизация')),
        ('incremental', _('Инкрементальная')),
        ('realtime', _('В реальном времени')),
    ], verbose_name=_('Тип синхронизации'))
    
    last_sync = models.DateTimeField(blank=True, null=True, verbose_name=_('Последняя синхронизация'))
    next_sync = models.DateTimeField(blank=True, null=True, verbose_name=_('Следующая синхронизация'))
    status = models.CharField(max_length=20, choices=[
        ('pending', _('Ожидает')),
        ('running', _('Выполняется')),
        ('completed', _('Завершено')),
        ('failed', _('Ошибка')),
    ], default='pending', verbose_name=_('Статус'))
    
    records_processed = models.IntegerField(default=0, verbose_name=_('Обработано записей'))
    records_synced = models.IntegerField(default=0, verbose_name=_('Синхронизировано записей'))
    error_message = models.TextField(blank=True, null=True, verbose_name=_('Сообщение об ошибке'))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Создано'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Обновлено'))
    
    class Meta:
        verbose_name = _('Синхронизация данных')
        verbose_name_plural = _('Синхронизации данных')
        db_table = 'data_syncs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.source_component} → {self.target_component}"


class CacheEntry(models.Model):
    """Модель для кэширования данных"""
    key = models.CharField(max_length=255, unique=True, verbose_name=_('Ключ'))
    value = models.TextField(verbose_name=_('Значение'))
    expires_at = models.DateTimeField(verbose_name=_('Истекает'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Создано'))
    accessed_at = models.DateTimeField(auto_now=True, verbose_name=_('Последний доступ'))
    access_count = models.IntegerField(default=0, verbose_name=_('Количество обращений'))
    
    class Meta:
        verbose_name = _('Кэш запись')
        verbose_name_plural = _('Кэш записи')
        db_table = 'cache_entries'
        ordering = ['-accessed_at']
        indexes = [
            models.Index(fields=['expires_at']),
            models.Index(fields=['access_count']),
        ]
    
    def __str__(self):
        return f"{self.key} (истекает: {self.expires_at})"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class HealthCheck(models.Model):
    """Модель для проверки здоровья системы"""
    component = models.CharField(max_length=50, verbose_name=_('Компонент'))
    check_type = models.CharField(max_length=50, choices=[
        ('database', _('База данных')),
        ('cache', _('Кэш')),
        ('external_api', _('Внешний API')),
        ('file_system', _('Файловая система')),
        ('memory', _('Память')),
        ('disk', _('Диск')),
        ('network', _('Сеть')),
    ], verbose_name=_('Тип проверки'))
    
    status = models.CharField(max_length=20, choices=[
        ('healthy', _('Здоров')),
        ('warning', _('Предупреждение')),
        ('critical', _('Критично')),
        ('unknown', _('Неизвестно')),
    ], verbose_name=_('Статус'))
    
    response_time = models.FloatField(blank=True, null=True, verbose_name=_('Время ответа (мс)'))
    error_message = models.TextField(blank=True, null=True, verbose_name=_('Сообщение об ошибке'))
    checked_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Проверено'))
    
    class Meta:
        verbose_name = _('Проверка здоровья')
        verbose_name_plural = _('Проверки здоровья')
        db_table = 'health_checks'
        ordering = ['-checked_at']
        indexes = [
            models.Index(fields=['component', 'check_type']),
            models.Index(fields=['status', 'checked_at']),
        ]
    
    def __str__(self):
        return f"{self.component} - {self.check_type}: {self.status}"


class SystemAlert(models.Model):
    """Модель для системных алертов"""
    alert_type = models.CharField(max_length=50, choices=[
        ('performance', _('Производительность')),
        ('security', _('Безопасность')),
        ('error', _('Ошибка')),
        ('warning', _('Предупреждение')),
        ('info', _('Информация')),
    ], verbose_name=_('Тип алерта'))
    
    title = models.CharField(max_length=200, verbose_name=_('Заголовок'))
    message = models.TextField(verbose_name=_('Сообщение'))
    severity = models.CharField(max_length=20, choices=[
        ('low', _('Низкий')),
        ('medium', _('Средний')),
        ('high', _('Высокий')),
        ('critical', _('Критический')),
    ], default='medium', verbose_name=_('Важность'))
    
    is_active = models.BooleanField(default=True, verbose_name=_('Активно'))
    is_acknowledged = models.BooleanField(default=False, verbose_name=_('Подтверждено'))
    acknowledged_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, verbose_name=_('Подтвердил'))
    acknowledged_at = models.DateTimeField(blank=True, null=True, verbose_name=_('Подтверждено в'))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Создано'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Обновлено'))
    
    class Meta:
        verbose_name = _('Системный алерт')
        verbose_name_plural = _('Системные алерты')
        db_table = 'system_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['alert_type', 'severity']),
            models.Index(fields=['is_active', 'is_acknowledged']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.severity})"


class IntegrationLog(models.Model):
    """Модель для логирования интеграции"""
    component = models.CharField(max_length=50, verbose_name=_('Компонент'))
    action = models.CharField(max_length=100, verbose_name=_('Действие'))
    status = models.CharField(max_length=20, choices=[
        ('success', _('Успешно')),
        ('error', _('Ошибка')),
        ('warning', _('Предупреждение')),
        ('info', _('Информация')),
    ], verbose_name=_('Статус'))
    
    message = models.TextField(verbose_name=_('Сообщение'))
    details = models.JSONField(default=dict, blank=True, verbose_name=_('Детали'))
    execution_time = models.FloatField(blank=True, null=True, verbose_name=_('Время выполнения (мс)'))
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, verbose_name=_('Пользователь'))
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name=_('IP адрес'))
    user_agent = models.TextField(blank=True, null=True, verbose_name=_('User Agent'))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Создано'))
    
    class Meta:
        verbose_name = _('Лог интеграции')
        verbose_name_plural = _('Логи интеграции')
        db_table = 'integration_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['component', 'action']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.component} - {self.action}: {self.status}" 