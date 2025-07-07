from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'metrics', views.SystemMetricViewSet)
router.register(r'events', views.SystemEventViewSet)
router.register(r'configs', views.IntegrationConfigViewSet)
router.register(r'syncs', views.DataSyncViewSet)
router.register(r'cache', views.CacheEntryViewSet)
router.register(r'health', views.HealthCheckViewSet)
router.register(r'alerts', views.SystemAlertViewSet)
router.register(r'logs', views.IntegrationLogViewSet)
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')
router.register(r'monitoring', views.MonitoringViewSet, basename='monitoring')

app_name = 'integration'

urlpatterns = [
    # API маршруты
    path('api/', include(router.urls)),
    
    # Специальные маршруты
    path('api/health-check/', views.HealthCheckViewSet.as_view({'post': 'run_checks'}), name='health_check'),
    path('api/system-status/', views.DashboardViewSet.as_view({'get': 'overview'}), name='system_status'),
    path('api/real-time-metrics/', views.MonitoringViewSet.as_view({'get': 'real_time_metrics'}), name='real_time_metrics'),
    
    # Маршруты для синхронизации
    path('api/sync/erp-to-telegram/', views.DataSyncViewSet.as_view({'post': 'sync_erp_to_telegram'}), name='sync_erp_to_telegram'),
    path('api/sync/admin-to-erp/', views.DataSyncViewSet.as_view({'post': 'sync_admin_to_erp'}), name='sync_admin_to_erp'),
    
    # Маршруты для кэша
    path('api/cache/set/', views.CacheEntryViewSet.as_view({'post': 'set_cache'}), name='cache_set'),
    path('api/cache/get/', views.CacheEntryViewSet.as_view({'get': 'get_cache'}), name='cache_get'),
    path('api/cache/clear-expired/', views.CacheEntryViewSet.as_view({'post': 'clear_expired'}), name='cache_clear_expired'),
    
    # Маршруты для алертов
    path('api/alerts/<int:pk>/acknowledge/', views.SystemAlertViewSet.as_view({'post': 'acknowledge'}), name='alert_acknowledge'),
    path('api/alerts/active/', views.SystemAlertViewSet.as_view({'get': 'active'}), name='alerts_active'),
    
    # Маршруты для дашборда
    path('api/dashboard/metrics-summary/', views.DashboardViewSet.as_view({'get': 'metrics_summary'}), name='dashboard_metrics_summary'),
    path('api/dashboard/system-health/', views.DashboardViewSet.as_view({'get': 'system_health'}), name='dashboard_system_health'),
    path('api/dashboard/integration-status/', views.DashboardViewSet.as_view({'get': 'integration_status'}), name='dashboard_integration_status'),
    
    # Маршруты для мониторинга
    path('api/monitoring/error-summary/', views.MonitoringViewSet.as_view({'get': 'error_summary'}), name='monitoring_error_summary'),
] 