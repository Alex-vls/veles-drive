from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    SystemMetric, SystemEvent, IntegrationConfig, DataSync,
    CacheEntry, HealthCheck, SystemAlert, IntegrationLog
)


@admin.register(SystemMetric)
class SystemMetricAdmin(admin.ModelAdmin):
    """Админка для системных метрик"""
    list_display = ['name', 'metric_type', 'value', 'unit', 'timestamp']
    list_filter = ['metric_type', 'timestamp']
    search_fields = ['name', 'metric_type']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('metric_type', 'name', 'value', 'unit')
        }),
        ('Дополнительно', {
            'fields': ('timestamp', 'metadata'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SystemEvent)
class SystemEventAdmin(admin.ModelAdmin):
    """Админка для системных событий"""
    list_display = ['event_type', 'description_short', 'user', 'severity', 'timestamp']
    list_filter = ['event_type', 'severity', 'timestamp']
    search_fields = ['description', 'event_type', 'user__username']
    readonly_fields = ['timestamp', 'ip_address', 'user_agent']
    ordering = ['-timestamp']
    
    def description_short(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_short.short_description = 'Описание'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('event_type', 'user', 'description', 'severity')
        }),
        ('Дополнительно', {
            'fields': ('timestamp', 'metadata', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )


@admin.register(IntegrationConfig)
class IntegrationConfigAdmin(admin.ModelAdmin):
    """Админка для конфигурации интеграции"""
    list_display = ['component', 'key', 'value_short', 'is_active', 'updated_at']
    list_filter = ['component', 'is_active', 'created_at']
    search_fields = ['component', 'key', 'value']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['component', 'key']
    
    def value_short(self, obj):
        return obj.value[:50] + '...' if len(obj.value) > 50 else obj.value
    value_short.short_description = 'Значение'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('component', 'key', 'value', 'description', 'is_active')
        }),
        ('Временные метки', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DataSync)
class DataSyncAdmin(admin.ModelAdmin):
    """Админка для синхронизации данных"""
    list_display = ['source_component', 'target_component', 'sync_type', 'status', 'last_sync', 'records_synced']
    list_filter = ['source_component', 'target_component', 'sync_type', 'status']
    search_fields = ['source_component', 'target_component']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('source_component', 'target_component', 'sync_type', 'status')
        }),
        ('Синхронизация', {
            'fields': ('last_sync', 'next_sync', 'records_processed', 'records_synced')
        }),
        ('Ошибки', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        ('Временные метки', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CacheEntry)
class CacheEntryAdmin(admin.ModelAdmin):
    """Админка для кэш записей"""
    list_display = ['key_short', 'is_expired', 'access_count', 'created_at', 'expires_at']
    list_filter = ['created_at', 'expires_at']
    search_fields = ['key', 'value']
    readonly_fields = ['created_at', 'accessed_at', 'access_count']
    ordering = ['-accessed_at']
    
    def key_short(self, obj):
        return obj.key[:50] + '...' if len(obj.key) > 50 else obj.key
    key_short.short_description = 'Ключ'
    
    def is_expired(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: red;">Истек</span>')
        else:
            return format_html('<span style="color: green;">Активен</span>')
    is_expired.short_description = 'Статус'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('key', 'value', 'expires_at')
        }),
        ('Статистика', {
            'fields': ('created_at', 'accessed_at', 'access_count'),
            'classes': ('collapse',)
        }),
    )


@admin.register(HealthCheck)
class HealthCheckAdmin(admin.ModelAdmin):
    """Админка для проверок здоровья"""
    list_display = ['component', 'check_type', 'status_colored', 'response_time', 'checked_at']
    list_filter = ['component', 'check_type', 'status', 'checked_at']
    search_fields = ['component', 'check_type', 'error_message']
    readonly_fields = ['checked_at']
    ordering = ['-checked_at']
    
    def status_colored(self, obj):
        colors = {
            'healthy': 'green',
            'warning': 'orange',
            'critical': 'red',
            'unknown': 'gray'
        }
        color = colors.get(obj.status, 'black')
        return format_html('<span style="color: {};">{}</span>', color, obj.get_status_display())
    status_colored.short_description = 'Статус'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('component', 'check_type', 'status')
        }),
        ('Детали', {
            'fields': ('response_time', 'error_message', 'checked_at')
        }),
    )


@admin.register(SystemAlert)
class SystemAlertAdmin(admin.ModelAdmin):
    """Админка для системных алертов"""
    list_display = ['title', 'alert_type', 'severity_colored', 'is_active', 'is_acknowledged', 'created_at']
    list_filter = ['alert_type', 'severity', 'is_active', 'is_acknowledged', 'created_at']
    search_fields = ['title', 'message']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def severity_colored(self, obj):
        colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red',
            'critical': 'darkred'
        }
        color = colors.get(obj.severity, 'black')
        return format_html('<span style="color: {};">{}</span>', color, obj.get_severity_display())
    severity_colored.short_description = 'Важность'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('alert_type', 'title', 'message', 'severity')
        }),
        ('Статус', {
            'fields': ('is_active', 'is_acknowledged', 'acknowledged_by', 'acknowledged_at')
        }),
        ('Временные метки', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(IntegrationLog)
class IntegrationLogAdmin(admin.ModelAdmin):
    """Админка для логов интеграции"""
    list_display = ['component', 'action', 'status_colored', 'user', 'execution_time', 'created_at']
    list_filter = ['component', 'action', 'status', 'created_at']
    search_fields = ['component', 'action', 'message', 'user__username']
    readonly_fields = ['created_at', 'ip_address', 'user_agent']
    ordering = ['-created_at']
    
    def status_colored(self, obj):
        colors = {
            'success': 'green',
            'error': 'red',
            'warning': 'orange',
            'info': 'blue'
        }
        color = colors.get(obj.status, 'black')
        return format_html('<span style="color: {};">{}</span>', color, obj.get_status_display())
    status_colored.short_description = 'Статус'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('component', 'action', 'status', 'message')
        }),
        ('Детали', {
            'fields': ('details', 'execution_time', 'user')
        }),
        ('Дополнительно', {
            'fields': ('created_at', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )


# Кастомная админка для дашборда
class IntegrationDashboardAdmin(admin.ModelAdmin):
    """Кастомная админка для дашборда интеграции"""
    
    def changelist_view(self, request, extra_context=None):
        """Переопределяем отображение списка для показа дашборда"""
        from .services import DashboardService, HealthCheckService
        
        # Получить данные для дашборда
        dashboard_data = DashboardService.get_dashboard_data()
        health_results = HealthCheckService.run_all_checks()
        
        # Подготовить контекст
        extra_context = extra_context or {}
        extra_context.update({
            'dashboard_data': dashboard_data,
            'health_results': health_results,
            'title': 'Дашборд интеграции системы',
        })
        
        return super().changelist_view(request, extra_context)


# Регистрация кастомной админки
admin.site.register_view('integration/dashboard/', IntegrationDashboardAdmin.as_view(), 'Интеграция - Дашборд') 