from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta

from .models import (
    SystemMetric, SystemEvent, IntegrationConfig, DataSync,
    CacheEntry, HealthCheck, SystemAlert, IntegrationLog
)
from .serializers import (
    SystemMetricSerializer, SystemEventSerializer, IntegrationConfigSerializer,
    DataSyncSerializer, CacheEntrySerializer, HealthCheckSerializer,
    SystemAlertSerializer, IntegrationLogSerializer,
    DashboardMetricSerializer, DashboardEventSerializer, DashboardAlertSerializer,
    SystemHealthSerializer, IntegrationStatusSerializer, PerformanceMetricsSerializer,
    ComponentStatusSerializer
)
from .services import (
    MetricsService, EventService, HealthCheckService, AlertService,
    CacheService, DataSyncService, IntegrationLogService, DashboardService
)


class SystemMetricViewSet(viewsets.ModelViewSet):
    """ViewSet для системных метрик"""
    queryset = SystemMetric.objects.all()
    serializer_class = SystemMetricSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = SystemMetric.objects.all()
        metric_type = self.request.query_params.get('metric_type')
        hours = self.request.query_params.get('hours', 24)
        
        if metric_type:
            queryset = queryset.filter(metric_type=metric_type)
        
        if hours:
            try:
                hours = int(hours)
                queryset = queryset.filter(
                    timestamp__gte=timezone.now() - timedelta(hours=hours)
                )
            except ValueError:
                pass
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['get'])
    def performance(self, request):
        """Получить метрики производительности"""
        metrics = MetricsService.get_performance_metrics()
        return Response(metrics)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Получить сводку метрик"""
        hours = int(request.query_params.get('hours', 24))
        
        # Агрегированные метрики
        summary = SystemMetric.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=hours)
        ).values('metric_type').annotate(
            count=Count('id'),
            avg_value=Avg('value')
        )
        
        return Response(summary)


class SystemEventViewSet(viewsets.ModelViewSet):
    """ViewSet для системных событий"""
    queryset = SystemEvent.objects.all()
    serializer_class = SystemEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = SystemEvent.objects.all()
        event_type = self.request.query_params.get('event_type')
        severity = self.request.query_params.get('severity')
        hours = self.request.query_params.get('hours', 24)
        
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        if severity:
            queryset = queryset.filter(severity=severity)
        
        if hours:
            try:
                hours = int(hours)
                queryset = queryset.filter(
                    timestamp__gte=timezone.now() - timedelta(hours=hours)
                )
            except ValueError:
                pass
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['post'])
    def record_event(self, request):
        """Записать событие"""
        event_type = request.data.get('event_type')
        description = request.data.get('description')
        severity = request.data.get('severity', 'medium')
        metadata = request.data.get('metadata', {})
        
        if not event_type or not description:
            return Response(
                {'error': 'event_type и description обязательны'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = EventService.record_event(
            event_type=event_type,
            description=description,
            user=request.user,
            severity=severity,
            metadata=metadata,
            request=request
        )
        
        if success:
            return Response({'status': 'success'})
        else:
            return Response(
                {'error': 'Ошибка записи события'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class IntegrationConfigViewSet(viewsets.ModelViewSet):
    """ViewSet для конфигурации интеграции"""
    queryset = IntegrationConfig.objects.all()
    serializer_class = IntegrationConfigSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = IntegrationConfig.objects.all()
        component = self.request.query_params.get('component')
        is_active = self.request.query_params.get('is_active')
        
        if component:
            queryset = queryset.filter(component=component)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('component', 'key')
    
    @action(detail=False, methods=['get'])
    def by_component(self, request):
        """Получить конфигурацию по компоненту"""
        component = request.query_params.get('component')
        if not component:
            return Response(
                {'error': 'component обязателен'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        configs = IntegrationConfig.objects.filter(
            component=component,
            is_active=True
        )
        
        config_dict = {config.key: config.value for config in configs}
        return Response(config_dict)


class DataSyncViewSet(viewsets.ModelViewSet):
    """ViewSet для синхронизации данных"""
    queryset = DataSync.objects.all()
    serializer_class = DataSyncSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def sync_erp_to_telegram(self, request):
        """Синхронизация ERP → Telegram"""
        success = DataSyncService.sync_erp_to_telegram()
        
        if success:
            return Response({'status': 'sync_started'})
        else:
            return Response(
                {'error': 'Ошибка синхронизации'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def sync_admin_to_erp(self, request):
        """Синхронизация Admin → ERP"""
        success = DataSyncService.sync_admin_to_erp()
        
        if success:
            return Response({'status': 'sync_started'})
        else:
            return Response(
                {'error': 'Ошибка синхронизации'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CacheEntryViewSet(viewsets.ModelViewSet):
    """ViewSet для кэш записей"""
    queryset = CacheEntry.objects.all()
    serializer_class = CacheEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def set_cache(self, request):
        """Установить кэш"""
        key = request.data.get('key')
        value = request.data.get('value')
        expires_in_minutes = request.data.get('expires_in_minutes', 60)
        
        if not key or value is None:
            return Response(
                {'error': 'key и value обязательны'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = CacheService.set_cache_entry(key, value, expires_in_minutes)
        
        if success:
            return Response({'status': 'success'})
        else:
            return Response(
                {'error': 'Ошибка установки кэша'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def get_cache(self, request):
        """Получить кэш"""
        key = request.query_params.get('key')
        
        if not key:
            return Response(
                {'error': 'key обязателен'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        value = CacheService.get_cache_entry(key)
        
        if value is not None:
            return Response({'value': value})
        else:
            return Response(
                {'error': 'Кэш не найден или истек'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def clear_expired(self, request):
        """Очистить истекшие записи"""
        count = CacheService.clear_expired_entries()
        return Response({'cleared_count': count})


class HealthCheckViewSet(viewsets.ModelViewSet):
    """ViewSet для проверок здоровья"""
    queryset = HealthCheck.objects.all()
    serializer_class = HealthCheckSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def run_checks(self, request):
        """Запустить все проверки"""
        results = HealthCheckService.run_all_checks()
        return Response(results)
    
    @action(detail=False, methods=['get'])
    def current_status(self, request):
        """Получить текущий статус здоровья"""
        # Получить последние проверки для каждого компонента
        components = ['database', 'cache', 'telegram', 'erp', 'admin']
        status_data = {}
        
        for component in components:
            latest_check = HealthCheck.objects.filter(
                component=component
            ).order_by('-checked_at').first()
            
            if latest_check:
                status_data[component] = {
                    'status': latest_check.status,
                    'response_time': latest_check.response_time,
                    'last_check': latest_check.checked_at,
                    'error_message': latest_check.error_message
                }
            else:
                status_data[component] = {
                    'status': 'unknown',
                    'response_time': None,
                    'last_check': None,
                    'error_message': None
                }
        
        return Response(status_data)


class SystemAlertViewSet(viewsets.ModelViewSet):
    """ViewSet для системных алертов"""
    queryset = SystemAlert.objects.all()
    serializer_class = SystemAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = SystemAlert.objects.all()
        alert_type = self.request.query_params.get('alert_type')
        severity = self.request.query_params.get('severity')
        is_active = self.request.query_params.get('is_active')
        is_acknowledged = self.request.query_params.get('is_acknowledged')
        
        if alert_type:
            queryset = queryset.filter(alert_type=alert_type)
        
        if severity:
            queryset = queryset.filter(severity=severity)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        if is_acknowledged is not None:
            queryset = queryset.filter(is_acknowledged=is_acknowledged.lower() == 'true')
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Подтвердить алерт"""
        success = AlertService.acknowledge_alert(pk, request.user)
        
        if success:
            return Response({'status': 'acknowledged'})
        else:
            return Response(
                {'error': 'Алерт не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Получить активные алерты"""
        alerts = AlertService.get_active_alerts()
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)


class IntegrationLogViewSet(viewsets.ModelViewSet):
    """ViewSet для логов интеграции"""
    queryset = IntegrationLog.objects.all()
    serializer_class = IntegrationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = IntegrationLog.objects.all()
        component = self.request.query_params.get('component')
        action_name = self.request.query_params.get('action')
        status_filter = self.request.query_params.get('status')
        hours = self.request.query_params.get('hours', 24)
        
        if component:
            queryset = queryset.filter(component=component)
        
        if action_name:
            queryset = queryset.filter(action=action_name)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if hours:
            try:
                hours = int(hours)
                queryset = queryset.filter(
                    created_at__gte=timezone.now() - timedelta(hours=hours)
                )
            except ValueError:
                pass
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def by_component(self, request):
        """Получить логи по компоненту"""
        component = request.query_params.get('component')
        hours = int(request.query_params.get('hours', 24))
        
        if not component:
            return Response(
                {'error': 'component обязателен'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logs = IntegrationLogService.get_component_logs(component, hours)
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)


class DashboardViewSet(viewsets.ViewSet):
    """ViewSet для дашборда"""
    permission_classes = [permissions.IsAuthenticated]
    
    @method_decorator(cache_page(60))  # Кэшировать на 1 минуту
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Обзор системы"""
        dashboard_data = DashboardService.get_dashboard_data()
        
        # Сериализация данных
        performance_serializer = PerformanceMetricsSerializer(dashboard_data['performance_metrics'])
        events_serializer = SystemEventSerializer(dashboard_data['recent_events'], many=True)
        alerts_serializer = SystemAlertSerializer(dashboard_data['active_alerts'], many=True)
        
        return Response({
            'performance_metrics': performance_serializer.data,
            'recent_events': events_serializer.data,
            'active_alerts': alerts_serializer.data,
            'component_status': dashboard_data['component_status']
        })
    
    @action(detail=False, methods=['get'])
    def metrics_summary(self, request):
        """Сводка метрик"""
        hours = int(request.query_params.get('hours', 24))
        
        # Метрики по типам
        metrics_by_type = SystemMetric.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=hours)
        ).values('metric_type').annotate(
            count=Count('id'),
            avg_value=Avg('value'),
            max_value=Avg('value'),
            min_value=Avg('value')
        )
        
        # События по типам
        events_by_type = SystemEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=hours)
        ).values('event_type').annotate(
            count=Count('id')
        )
        
        # Алерты по важности
        alerts_by_severity = SystemAlert.objects.filter(
            created_at__gte=timezone.now() - timedelta(hours=hours)
        ).values('severity').annotate(
            count=Count('id')
        )
        
        return Response({
            'metrics_by_type': list(metrics_by_type),
            'events_by_type': list(events_by_type),
            'alerts_by_severity': list(alerts_by_severity)
        })
    
    @action(detail=False, methods=['get'])
    def system_health(self, request):
        """Здоровье системы"""
        # Запустить проверки здоровья
        health_results = HealthCheckService.run_all_checks()
        
        # Получить последние проверки
        latest_checks = {}
        for component in ['database', 'cache', 'telegram', 'erp', 'admin']:
            check = HealthCheck.objects.filter(
                component=component
            ).order_by('-checked_at').first()
            
            if check:
                latest_checks[component] = {
                    'status': check.status,
                    'response_time': check.response_time,
                    'last_check': check.checked_at,
                    'error_message': check.error_message
                }
        
        return Response({
            'health_results': health_results,
            'latest_checks': latest_checks
        })
    
    @action(detail=False, methods=['get'])
    def integration_status(self, request):
        """Статус интеграции"""
        # Статус синхронизации
        sync_status = DataSync.objects.values('source_component', 'target_component').annotate(
            last_sync=Avg('last_sync'),
            success_count=Count('id', filter=Q(status='completed')),
            total_count=Count('id')
        )
        
        # Статус компонентов
        component_status = {}
        for component in ['erp', 'telegram', 'admin', 'notifications', 'analytics', 'monitoring']:
            # Проверить последние логи
            recent_logs = IntegrationLog.objects.filter(
                component=component
            ).order_by('-created_at')[:10]
            
            success_count = recent_logs.filter(status='success').count()
            error_count = recent_logs.filter(status='error').count()
            total_count = recent_logs.count()
            
            success_rate = (success_count / total_count * 100) if total_count > 0 else 0
            
            component_status[component] = {
                'is_active': True,  # Можно добавить логику проверки
                'last_sync': None,  # Обновить после реализации
                'sync_status': 'unknown',
                'error_count': error_count,
                'success_rate': success_rate
            }
        
        return Response({
            'sync_status': list(sync_status),
            'component_status': component_status
        })


class MonitoringViewSet(viewsets.ViewSet):
    """ViewSet для мониторинга"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def real_time_metrics(self, request):
        """Метрики в реальном времени"""
        # Получить текущие метрики производительности
        performance_metrics = MetricsService.get_performance_metrics()
        
        # Добавить метрики приложения
        from django.contrib.auth.models import User
        from erp.models import Project, Task
        from telegram_bot.models import TelegramUser
        
        app_metrics = {
            'total_users': User.objects.count(),
            'active_projects': Project.objects.filter(status='active').count(),
            'pending_tasks': Task.objects.filter(status='pending').count(),
            'telegram_users': TelegramUser.objects.count(),
        }
        
        return Response({
            'performance': performance_metrics,
            'application': app_metrics,
            'timestamp': timezone.now()
        })
    
    @action(detail=False, methods=['get'])
    def error_summary(self, request):
        """Сводка ошибок"""
        hours = int(request.query_params.get('hours', 24))
        
        # Ошибки в логах интеграции
        integration_errors = IntegrationLog.objects.filter(
            status='error',
            created_at__gte=timezone.now() - timedelta(hours=hours)
        ).values('component', 'action').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Критические события
        critical_events = SystemEvent.objects.filter(
            severity='critical',
            timestamp__gte=timezone.now() - timedelta(hours=hours)
        ).values('event_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Критические алерты
        critical_alerts = SystemAlert.objects.filter(
            severity='critical',
            is_active=True
        ).count()
        
        return Response({
            'integration_errors': list(integration_errors),
            'critical_events': list(critical_events),
            'critical_alerts': critical_alerts
        }) 