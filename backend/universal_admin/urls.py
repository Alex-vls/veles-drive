from django.urls import path, include
from .admin import universal_admin_site
from . import views

urlpatterns = [
    path('', universal_admin_site.urls),
    path('analytics/', views.analytics_dashboard, name='analytics_dashboard'),
    path('api/stats/', views.api_stats, name='api_stats'),
    path('api/charts/', views.api_charts, name='api_charts'),
] 