from rest_framework import generics, status, permissions, filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from core.decorators import cache_response
from core.services import NotificationService
from .models import (
    Brand, Model, Vehicle, Motorcycle, Boat, Aircraft,
    VehicleImage, VehicleFeature
)
from .serializers import (
    BrandSerializer,
    ModelSerializer,
    VehicleSerializer,
    VehicleCreateSerializer,
    VehicleUpdateSerializer,
    VehicleImageSerializer,
    VehicleImageCreateSerializer,
    VehicleImageUpdateSerializer,
    VehicleFeatureSerializer,
    MotorcycleSerializer,
    BoatSerializer,
    AircraftSerializer
)
from companies.models import Company

class VehicleListView(generics.ListAPIView):
    """Список транспорта"""
    queryset = Vehicle.objects.filter(is_active=True, is_available=True)
    serializer_class = VehicleSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle_type', 'brand', 'model', 'year', 'transmission', 'fuel_type', 'company']
    search_fields = ['brand__name', 'model__name', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']

    @cache_response(timeout=300)  # Кэшируем на 5 минут
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class VehicleDetailView(generics.RetrieveAPIView):
    """Детали транспорта"""
    queryset = Vehicle.objects.filter(is_active=True)
    serializer_class = VehicleSerializer
    permission_classes = (permissions.AllowAny,)

    @cache_response(timeout=300)  # Кэшируем на 5 минут
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class VehicleCreateView(generics.CreateAPIView):
    """Создание транспорта"""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        serializer.save(company=company)
        # Очищаем кэш списка транспорта
        cache.delete_pattern("view_cache_/api/vehicles/*")

class VehicleUpdateView(generics.UpdateAPIView):
    """Обновление транспорта"""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Vehicle.objects.filter(company__user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш для обновленного транспорта
        cache.delete_pattern(f"view_cache_/api/vehicles/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/vehicles/*")

class VehicleDeleteView(generics.DestroyAPIView):
    """Удаление транспорта"""
    queryset = Vehicle.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Vehicle.objects.filter(company__user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш для удаленного транспорта
        cache.delete_pattern(f"view_cache_/api/vehicles/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/vehicles/*")

class VehicleImageListView(generics.ListCreateAPIView):
    """Список изображений транспорта"""
    serializer_class = VehicleImageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        vehicle_id = self.kwargs.get('vehicle_id')
        return VehicleImage.objects.filter(vehicle_id=vehicle_id)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VehicleImageCreateSerializer
        return VehicleImageSerializer

    def perform_create(self, serializer):
        vehicle_id = self.kwargs.get('vehicle_id')
        vehicle = Vehicle.objects.get(id=vehicle_id)
        if vehicle.company.user != self.request.user:
            raise permissions.PermissionDenied("Вы не можете добавлять изображения к чужому транспорту")
        serializer.save(vehicle=vehicle)
        # Очищаем кэш для транспорта
        cache.delete_pattern(f"view_cache_/api/vehicles/{vehicle_id}/*")

class VehicleImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Детали изображения транспорта"""
    serializer_class = VehicleImageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        vehicle_id = self.kwargs.get('vehicle_id')
        return VehicleImage.objects.filter(vehicle_id=vehicle_id)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return VehicleImageUpdateSerializer
        return VehicleImageSerializer

    def get_object(self):
        image = super().get_object()
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if image.vehicle.company.user != self.request.user:
                raise permissions.PermissionDenied("Вы не можете редактировать изображения чужого транспорта")
        return image

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш для транспорта
        cache.delete_pattern(f"view_cache_/api/vehicles/{self.kwargs['vehicle_id']}/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш для транспорта
        cache.delete_pattern(f"view_cache_/api/vehicles/{self.kwargs['vehicle_id']}/*")

class VehicleAvailabilityView(APIView):
    """Изменение статуса доступности транспорта"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            vehicle = Vehicle.objects.get(pk=pk)
            if vehicle.company.user != request.user:
                raise permissions.PermissionDenied("Вы не можете изменять статус чужого транспорта")
            
            vehicle.is_available = not vehicle.is_available
            vehicle.save()
            # Отправляем уведомление об изменении статуса
            NotificationService.notify_vehicle_status(vehicle.company.user, vehicle)
            # Очищаем кэш для транспорта
            cache.delete_pattern(f"view_cache_/api/vehicles/{pk}/*")
            cache.delete_pattern("view_cache_/api/vehicles/*")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Vehicle.DoesNotExist:
            return Response(
                {'error': 'Транспорт не найден'},
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

class VehicleViewSet(viewsets.ModelViewSet):
    """ViewSet for Vehicle model"""
    queryset = Vehicle.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle_type', 'brand', 'model', 'year', 'is_available', 'company']
    search_fields = ['brand__name', 'model__name', 'description', 'vin']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return VehicleCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VehicleUpdateSerializer
        return VehicleSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            company = Company.objects.get(user=self.request.user)
            serializer.save(company=company)
        else:
            serializer.save()

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш
        cache.delete_pattern("view_cache_/api/vehicles/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш
        cache.delete_pattern("view_cache_/api/vehicles/*")

# ============================================================================
# VEHICLE VIEWSETS
# ============================================================================

class MotorcycleViewSet(viewsets.ModelViewSet):
    """ViewSet for Motorcycle model"""
    queryset = Motorcycle.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'model', 'year', 'engine_type', 'is_available', 'company']
    search_fields = ['brand__name', 'model__name', 'description', 'vin']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        return MotorcycleSerializer

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        serializer.save(company=company)
        # Очищаем кэш
        cache.delete_pattern("view_cache_/api/motorcycles/*")

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/motorcycles/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/motorcycles/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/motorcycles/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/motorcycles/*")

class BoatViewSet(viewsets.ModelViewSet):
    """ViewSet for Boat model"""
    queryset = Boat.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'model', 'year', 'boat_type', 'is_available', 'company']
    search_fields = ['brand__name', 'model__name', 'description', 'hull_number']
    ordering_fields = ['price', 'year', 'length', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        return BoatSerializer

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        serializer.save(company=company)
        # Очищаем кэш
        cache.delete_pattern("view_cache_/api/boats/*")

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/boats/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/boats/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/boats/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/boats/*")

class AircraftViewSet(viewsets.ModelViewSet):
    """ViewSet for Aircraft model"""
    queryset = Aircraft.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'model', 'year', 'aircraft_type', 'is_available', 'company']
    search_fields = ['brand__name', 'model__name', 'description', 'registration_number']
    ordering_fields = ['price', 'year', 'flight_hours', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        return AircraftSerializer

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        serializer.save(company=company)
        # Очищаем кэш
        cache.delete_pattern("view_cache_/api/aircraft/*")

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/aircraft/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/aircraft/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/aircraft/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/aircraft/*") 