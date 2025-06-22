from rest_framework import generics, status, permissions, filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from core.decorators import cache_response
from core.services import NotificationService
from .models import Car, CarImage, Brand, Model, CarFeature
from .serializers import (
    CarSerializer,
    CarCreateSerializer,
    CarUpdateSerializer,
    CarImageSerializer,
    CarImageCreateSerializer,
    CarImageUpdateSerializer,
    BrandSerializer,
    ModelSerializer,
    CarListSerializer,
    CarDetailSerializer,
    CarFeatureSerializer
)
from companies.models import Company

class CarListView(generics.ListAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'model', 'year', 'transmission', 'fuel_type', 'is_available']
    search_fields = ['brand', 'model', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']

    @cache_response(timeout=300)  # Кэшируем на 5 минут
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class CarDetailView(generics.RetrieveAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = (permissions.AllowAny,)

    @cache_response(timeout=300)  # Кэшируем на 5 минут
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class CarCreateView(generics.CreateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        serializer.save(company=company)
        # Очищаем кэш списка автомобилей
        cache.delete_pattern("view_cache_/api/cars/*")

class CarUpdateView(generics.UpdateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Car.objects.filter(company__user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш для обновленного автомобиля
        cache.delete_pattern(f"view_cache_/api/cars/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/cars/*")

class CarDeleteView(generics.DestroyAPIView):
    queryset = Car.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Car.objects.filter(company__user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш для удаленного автомобиля
        cache.delete_pattern(f"view_cache_/api/cars/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/cars/*")

class CarImageListView(generics.ListCreateAPIView):
    serializer_class = CarImageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        car_id = self.kwargs.get('car_id')
        return CarImage.objects.filter(car_id=car_id)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CarImageCreateSerializer
        return CarImageSerializer

    def perform_create(self, serializer):
        car_id = self.kwargs.get('car_id')
        car = Car.objects.get(id=car_id)
        if car.company.user != self.request.user:
            raise permissions.PermissionDenied("Вы не можете добавлять изображения к чужому автомобилю")
        serializer.save(car=car)
        # Очищаем кэш для автомобиля
        cache.delete_pattern(f"view_cache_/api/cars/{car_id}/*")

class CarImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CarImageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        car_id = self.kwargs.get('car_id')
        return CarImage.objects.filter(car_id=car_id)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CarImageUpdateSerializer
        return CarImageSerializer

    def get_object(self):
        image = super().get_object()
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if image.car.company.user != self.request.user:
                raise permissions.PermissionDenied("Вы не можете редактировать изображения чужого автомобиля")
        return image

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш для автомобиля
        cache.delete_pattern(f"view_cache_/api/cars/{self.kwargs['car_id']}/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш для автомобиля
        cache.delete_pattern(f"view_cache_/api/cars/{self.kwargs['car_id']}/*")

class CarReviewCreateView(generics.CreateAPIView):
    serializer_class = CarReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        car = Car.objects.get(pk=self.kwargs['car_id'])
        review = serializer.save(user=self.request.user, car=car)
        # Отправляем уведомление владельцу автомобиля
        NotificationService.notify_car_review(car.company.user, car, review)
        # Очищаем кэш для автомобиля
        cache.delete_pattern(f"view_cache_/api/cars/{car.id}/*")

class CarAvailabilityView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            car = Car.objects.get(pk=pk)
            if car.company.user != request.user:
                raise permissions.PermissionDenied("Вы не можете изменять статус чужого автомобиля")
            
            car.is_available = not car.is_available
            car.save()
            # Отправляем уведомление об изменении статуса
            NotificationService.notify_car_status(car.company.user, car)
            # Очищаем кэш для автомобиля
            cache.delete_pattern(f"view_cache_/api/cars/{pk}/*")
            cache.delete_pattern("view_cache_/api/cars/*")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Car.DoesNotExist:
            return Response(
                {'error': 'Автомобиль не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

class BrandViewSet(viewsets.ModelViewSet):
    """ViewSet for Brand model"""
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class ModelViewSet(viewsets.ModelViewSet):
    """ViewSet for Model model"""
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class CarViewSet(viewsets.ModelViewSet):
    """ViewSet for Car model"""
    queryset = Car.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['model', 'company', 'fuel_type', 'transmission',
                       'body_type', 'is_active']
    search_fields = ['model__name', 'model__brand__name', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CarListSerializer
        elif self.action == 'create':
            return CarCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CarUpdateSerializer
        return CarDetailSerializer

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            return queryset.select_related('model', 'model__brand', 'company')
        return queryset.select_related('model', 'model__brand', 'company').prefetch_related(
            'images', 'features'
        )

class CarImageViewSet(viewsets.ModelViewSet):
    """ViewSet for CarImage model"""
    queryset = CarImage.objects.all()
    serializer_class = CarImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return CarImage.objects.filter(car__company=self.request.user.company)

class CarFeatureViewSet(viewsets.ModelViewSet):
    """ViewSet for CarFeature model"""
    queryset = CarFeature.objects.all()
    serializer_class = CarFeatureSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return CarFeature.objects.filter(car__company=self.request.user.company) 