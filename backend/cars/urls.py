from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Создаем роутеры для ViewSet'ов
router = DefaultRouter()
router.register(r'brands', views.BrandViewSet)
router.register(r'models', views.ModelViewSet)
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'motorcycles', views.MotorcycleViewSet)
router.register(r'boats', views.BoatViewSet)
router.register(r'aircraft', views.AircraftViewSet)

urlpatterns = [
    # ViewSet URLs
    path('api/', include(router.urls)),
    
    # Vehicle URLs
    path('vehicles/', views.VehicleListView.as_view(), name='vehicle-list'),
    path('vehicles/<int:pk>/', views.VehicleDetailView.as_view(), name='vehicle-detail'),
    path('vehicles/create/', views.VehicleCreateView.as_view(), name='vehicle-create'),
    path('vehicles/<int:pk>/update/', views.VehicleUpdateView.as_view(), name='vehicle-update'),
    path('vehicles/<int:pk>/delete/', views.VehicleDeleteView.as_view(), name='vehicle-delete'),
    path('vehicles/<int:pk>/availability/', views.VehicleAvailabilityView.as_view(), name='vehicle-availability'),

    # Vehicle Image URLs
    path('vehicles/<int:vehicle_id>/images/', views.VehicleImageListView.as_view(), name='vehicle-image-list'),
    path('vehicles/<int:vehicle_id>/images/<int:pk>/', views.VehicleImageDetailView.as_view(), name='vehicle-image-detail'),
] 