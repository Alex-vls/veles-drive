from rest_framework import generics, status, permissions, filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from core.decorators import cache_response
from .models import News, Article, Notification, ModerationLog, ModerationStatus
from cars.models import Car
from .serializers import (
    NewsSerializer,
    NewsCreateSerializer,
    NewsUpdateSerializer,
    ArticleSerializer,
    ArticleCreateSerializer,
    ArticleUpdateSerializer,
    ArticleListSerializer,
    NotificationSerializer,
    NotificationUpdateSerializer,
    ModerationLogSerializer,
    ModerationActionSerializer,
    CarListSerializer,
    CarSerializer,
    CarCreateSerializer,
    CarUpdateSerializer
)
from .permissions import IsModerator
from django.contrib.contenttypes.models import ContentType
from rest_framework.decorators import action
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import connection
import redis
import json
from datetime import datetime

class NewsListView(generics.ListAPIView):
    queryset = News.objects.filter(is_published=True)
    serializer_class = NewsSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_published']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    @cache_response(timeout=300)  # Кэшируем на 5 минут
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class NewsDetailView(generics.RetrieveAPIView):
    queryset = News.objects.filter(is_published=True)
    serializer_class = NewsSerializer
    permission_classes = (permissions.AllowAny,)

    @cache_response(timeout=300)  # Кэшируем на 5 минут
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class NewsCreateView(generics.CreateAPIView):
    queryset = News.objects.all()
    serializer_class = NewsCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        # Очищаем кэш новостей
        cache.delete_pattern("view_cache_/api/news/*")

class NewsUpdateView(generics.UpdateAPIView):
    queryset = News.objects.all()
    serializer_class = NewsUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return News.objects.all()
        return News.objects.filter(author=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш для обновленной новости
        cache.delete_pattern(f"view_cache_/api/news/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/news/*")

class NewsDeleteView(generics.DestroyAPIView):
    queryset = News.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return News.objects.all()
        return News.objects.filter(author=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш для удаленной новости
        cache.delete_pattern(f"view_cache_/api/news/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/news/*")

class ArticleListView(generics.ListAPIView):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleListSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_published']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Убираем фильтр по is_premium, так как такого поля нет в модели Article
        return queryset

    @cache_response(timeout=300)  # Кэшируем на 5 минут
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class ArticleDetailView(generics.RetrieveAPIView):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        queryset = super().get_queryset()
        # Убираем фильтр по is_premium, так как такого поля нет в модели Article
        return queryset

    @cache_response(timeout=300)  # Кэшируем на 5 минут
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class ArticleCreateView(generics.CreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        # Очищаем кэш статей
        cache.delete_pattern("view_cache_/api/articles/*")

class ArticleUpdateView(generics.UpdateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Article.objects.all()
        return Article.objects.filter(author=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш для обновленной статьи
        cache.delete_pattern(f"view_cache_/api/articles/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/articles/*")

class ArticleDeleteView(generics.DestroyAPIView):
    queryset = Article.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Article.objects.all()
        return Article.objects.filter(author=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш для удаленной статьи
        cache.delete_pattern(f"view_cache_/api/articles/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/articles/*")

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @cache_response(timeout=60)  # Кэшируем на 1 минуту
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class NotificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return NotificationUpdateSerializer
        return NotificationSerializer

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш уведомлений пользователя
        cache.delete_pattern(f"view_cache_/api/notifications/*")

class NotificationMarkAllReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        # Очищаем кэш уведомлений пользователя
        cache.delete_pattern(f"view_cache_/api/notifications/*")
        return Response(status=status.HTTP_204_NO_CONTENT)

class NotificationCountView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @cache_response(timeout=60)  # Кэшируем на 1 минуту
    def get(self, request):
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': unread_count})

class ModerationViewSet(viewsets.ModelViewSet):
    queryset = ModerationLog.objects.all()
    serializer_class = ModerationLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsModerator]

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status', None)
        content_type = self.request.query_params.get('content_type', None)

        if status:
            queryset = queryset.filter(status=status)
        if content_type:
            queryset = queryset.filter(content_type__model=content_type)

        return queryset

    @action(detail=True, methods=['post'])
    def moderate(self, request, pk=None):
        moderation_log = self.get_object()
        serializer = ModerationActionSerializer(data=request.data)
        
        if serializer.is_valid():
            status = serializer.validated_data['status']
            comment = serializer.validated_data.get('comment', '')
            
            moderation_log.status = status
            moderation_log.comment = comment
            moderation_log.moderator = request.user
            moderation_log.save()

            # Уведомляем автора контента о решении модерации
            content_object = moderation_log.content_object
            if hasattr(content_object, 'author'):
                Notification.objects.create(
                    user=content_object.author,
                    title='Решение модерации',
                    message=f'Ваш контент "{content_object.title}" был {ModerationStatus(status).label.lower()}',
                    content_type=ContentType.objects.get_for_model(content_object),
                    object_id=content_object.id
                )

            return Response(ModerationLogSerializer(moderation_log).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pending_count(self, request):
        count = self.get_queryset().filter(status=ModerationStatus.PENDING).count()
        return Response({'count': count})

class CarListView(generics.ListAPIView):
    queryset = Car.objects.filter(vehicle__is_available=True)
    serializer_class = CarListSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle__brand', 'vehicle__model', 'vehicle__year', 'vehicle__transmission', 'vehicle__fuel_type', 'vehicle__is_available']
    search_fields = ['vehicle__brand__name', 'vehicle__model__name', 'vehicle__description']
    ordering_fields = ['vehicle__price', 'vehicle__year', 'vehicle__mileage', 'vehicle__created_at']
    ordering = ['-vehicle__created_at']

class CarDetailView(generics.RetrieveAPIView):
    queryset = Car.objects.filter(vehicle__is_available=True)
    serializer_class = CarSerializer
    permission_classes = (permissions.AllowAny,)

class CarCreateView(generics.CreateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save()
        # Очищаем кэш автомобилей
        cache.delete_pattern("view_cache_/api/cars/*")

class CarUpdateView(generics.UpdateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Car.objects.all()
        return Car.objects.filter(company=self.request.user.company)

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш для обновленного автомобиля
        cache.delete_pattern(f"view_cache_/api/cars/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/cars/*")

class CarDeleteView(generics.DestroyAPIView):
    queryset = Car.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Car.objects.all()
        return Car.objects.filter(company=self.request.user.company)

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш для удаленного автомобиля
        cache.delete_pattern(f"view_cache_/api/cars/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/cars/*") 

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Health check endpoint для проверки работоспособности системы
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Проверка базы данных
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status["services"]["database"] = {
                "status": "healthy",
                "message": "PostgreSQL connection successful"
            }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        }
        health_status["status"] = "unhealthy"
    
    # Проверка Redis
    try:
        cache.set("health_check", "ok", 10)
        if cache.get("health_check") == "ok":
            health_status["services"]["redis"] = {
                "status": "healthy",
                "message": "Redis connection successful"
            }
        else:
            raise Exception("Redis cache test failed")
    except Exception as e:
        health_status["services"]["redis"] = {
            "status": "unhealthy",
            "message": f"Redis connection failed: {str(e)}"
        }
        health_status["status"] = "unhealthy"
    
    # Проверка основных модулей
    try:
        from cars.models import Car
        from companies.models import Company
        from users.models import User
        from erp.models import Inventory, Sale, Service
        
        health_status["services"]["modules"] = {
            "status": "healthy",
            "message": "All ERP modules loaded successfully",
            "modules": ["cars", "companies", "users", "erp"]
        }
    except Exception as e:
        health_status["services"]["modules"] = {
            "status": "unhealthy",
            "message": f"Module loading failed: {str(e)}"
        }
        health_status["status"] = "unhealthy"
    
    # Статистика системы
    try:
        car_count = Car.objects.count()
        company_count = Company.objects.count()
        user_count = User.objects.count()
        inventory_count = Inventory.objects.count()
        sale_count = Sale.objects.count()
        service_count = Service.objects.count()
        
        health_status["statistics"] = {
            "cars": car_count,
            "companies": company_count,
            "users": user_count,
            "inventory_items": inventory_count,
            "sales": sale_count,
            "services": service_count
        }
    except Exception as e:
        health_status["statistics"] = {
            "error": f"Failed to get statistics: {str(e)}"
        }
    
    # Версия API
    health_status["version"] = "1.0.0"
    health_status["service"] = "Veles Auto ERP"
    
    return JsonResponse(health_status, status=200 if health_status["status"] == "healthy" else 503)

@csrf_exempt
@require_http_methods(["GET"])
def api_status(request):
    """
    Статус API и доступных endpoints
    """
    api_status = {
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "endpoints": {
            "health": "/health/",
            "api_status": "/api/status/",
            "cars": "/api/cars/",
            "companies": "/api/companies/",
            "users": "/api/users/",
            "erp": {
                "inventory": "/api/erp/inventory/",
                "sales": "/api/erp/sales/",
                "services": "/api/erp/services/",
                "service_orders": "/api/erp/service-orders/",
                "financial": "/api/erp/financial/",
                "project_boards": "/api/erp/project-boards/",
                "project_tasks": "/api/erp/project-tasks/",
                "dashboard": "/api/erp/dashboard/",
                "reports": "/api/erp/reports/"
            },
            "telegram": "/api/telegram/",
            "admin": "/admin/"
        },
        "documentation": {
            "api_docs": "/api/docs/",
            "swagger": "/api/swagger/",
            "redoc": "/api/redoc/"
        }
    }
    
    return JsonResponse(api_status)

@csrf_exempt
@require_http_methods(["GET"])
def system_info(request):
    """
    Информация о системе
    """
    import os
    import platform
    
    system_info = {
        "timestamp": datetime.now().isoformat(),
        "system": {
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "django_version": "4.2+",
            "node": platform.node()
        },
        "environment": {
            "debug": os.getenv("DEBUG", "False"),
            "database_url": os.getenv("DATABASE_URL", "not_set"),
            "redis_url": os.getenv("REDIS_URL", "not_set"),
            "allowed_hosts": os.getenv("ALLOWED_HOSTS", "not_set")
        },
        "services": {
            "postgresql": "15-alpine",
            "redis": "7-alpine",
            "nginx": "alpine",
            "prometheus": "latest",
            "grafana": "latest"
        }
    }
    
    return JsonResponse(system_info) 