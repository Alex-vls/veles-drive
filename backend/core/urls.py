from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NewsListView, NewsDetailView,
    ArticleListView, ArticleDetailView,
    NotificationListView, NotificationDetailView,
    ModerationViewSet,
    CarListView, CarDetailView,
    CarCreateView, CarUpdateView, CarDeleteView,
    health_check, api_status, system_info
)

router = DefaultRouter()
router.register(r'moderation', ModerationViewSet, basename='moderation')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health-check'),
    path('api/status/', api_status, name='api-status'),
    path('api/system/', system_info, name='system-info'),
    path('news/', NewsListView.as_view(), name='news-list'),
    path('news/<int:pk>/', NewsDetailView.as_view(), name='news-detail'),
    path('articles/', ArticleListView.as_view(), name='article-list'),
    path('articles/<int:pk>/', ArticleDetailView.as_view(), name='article-detail'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('cars/', CarListView.as_view(), name='car-list'),
    path('cars/<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('cars/create/', CarCreateView.as_view(), name='car-create'),
    path('cars/<int:pk>/update/', CarUpdateView.as_view(), name='car-update'),
    path('cars/<int:pk>/delete/', CarDeleteView.as_view(), name='car-delete'),
] 