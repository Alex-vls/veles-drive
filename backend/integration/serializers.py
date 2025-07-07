from rest_framework import serializers
from .models import (
    SystemMetric, SystemEvent, IntegrationConfig, DataSync,
    CacheEntry, HealthCheck, SystemAlert, IntegrationLog
)


class SystemMetricSerializer(serializers.ModelSerializer):
    """Сериализатор для системных метрик"""
    
    class Meta:
        model = SystemMetric
        fields = '__all__'
        read_only_fields = ['timestamp']


class SystemEventSerializer(serializers.ModelSerializer):
    """Сериализатор для системных событий"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SystemEvent
        fields = '__all__'
        read_only_fields = ['timestamp']


class IntegrationConfigSerializer(serializers.ModelSerializer):
    """Сериализатор для конфигурации интеграции"""
    
    class Meta:
        model = IntegrationConfig
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class DataSyncSerializer(serializers.ModelSerializer):
    """Сериализатор для синхронизации данных"""
    
    class Meta:
        model = DataSync
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class CacheEntrySerializer(serializers.ModelSerializer):
    """Сериализатор для кэш записей"""
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = CacheEntry
        fields = '__all__'
        read_only_fields = ['created_at', 'accessed_at', 'access_count']


class HealthCheckSerializer(serializers.ModelSerializer):
    """Сериализатор для проверок здоровья"""
    
    class Meta:
        model = HealthCheck
        fields = '__all__'
        read_only_fields = ['checked_at']


class SystemAlertSerializer(serializers.ModelSerializer):
    """Сериализатор для системных алертов"""
    acknowledged_by_username = serializers.CharField(source='acknowledged_by.username', read_only=True)
    
    class Meta:
        model = SystemAlert
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class IntegrationLogSerializer(serializers.ModelSerializer):
    """Сериализатор для логов интеграции"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = IntegrationLog
        fields = '__all__'
        read_only_fields = ['created_at']


# Сериализаторы для дашборда
class DashboardMetricSerializer(serializers.Serializer):
    """Сериализатор для метрик дашборда"""
    metric_type = serializers.CharField()
    name = serializers.CharField()
    value = serializers.FloatField()
    unit = serializers.CharField(allow_blank=True)
    trend = serializers.CharField(allow_blank=True)  # up, down, stable
    change_percent = serializers.FloatField(allow_null=True)


class DashboardEventSerializer(serializers.Serializer):
    """Сериализатор для событий дашборда"""
    event_type = serializers.CharField()
    description = serializers.CharField()
    severity = serializers.CharField()
    timestamp = serializers.DateTimeField()
    user_username = serializers.CharField(allow_blank=True)


class DashboardAlertSerializer(serializers.Serializer):
    """Сериализатор для алертов дашборда"""
    alert_type = serializers.CharField()
    title = serializers.CharField()
    message = serializers.CharField()
    severity = serializers.CharField()
    is_acknowledged = serializers.BooleanField()
    created_at = serializers.DateTimeField()


class SystemHealthSerializer(serializers.Serializer):
    """Сериализатор для здоровья системы"""
    component = serializers.CharField()
    status = serializers.CharField()
    response_time = serializers.FloatField(allow_null=True)
    last_check = serializers.DateTimeField()
    error_message = serializers.CharField(allow_blank=True)


class IntegrationStatusSerializer(serializers.Serializer):
    """Сериализатор для статуса интеграции"""
    component = serializers.CharField()
    is_active = serializers.BooleanField()
    last_sync = serializers.DateTimeField(allow_null=True)
    sync_status = serializers.CharField()
    error_count = serializers.IntegerField()
    success_rate = serializers.FloatField()


class PerformanceMetricsSerializer(serializers.Serializer):
    """Сериализатор для метрик производительности"""
    avg_response_time = serializers.FloatField()
    requests_per_minute = serializers.FloatField()
    error_rate = serializers.FloatField()
    active_users = serializers.IntegerField()
    memory_usage = serializers.FloatField()
    cpu_usage = serializers.FloatField()
    disk_usage = serializers.FloatField()


class ComponentStatusSerializer(serializers.Serializer):
    """Сериализатор для статуса компонентов"""
    erp = serializers.DictField()
    telegram = serializers.DictField()
    admin = serializers.DictField()
    notifications = serializers.DictField()
    analytics = serializers.DictField()
    monitoring = serializers.DictField() 