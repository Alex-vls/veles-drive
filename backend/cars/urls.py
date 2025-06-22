from django.urls import path
from . import views

urlpatterns = [
    # Car URLs
    path('', views.CarListView.as_view(), name='car-list'),
    path('<int:pk>/', views.CarDetailView.as_view(), name='car-detail'),
    path('create/', views.CarCreateView.as_view(), name='car-create'),
    path('<int:pk>/update/', views.CarUpdateView.as_view(), name='car-update'),
    path('<int:pk>/delete/', views.CarDeleteView.as_view(), name='car-delete'),
    path('<int:pk>/availability/', views.CarAvailabilityView.as_view(), name='car-availability'),

    # Car Image URLs
    path('<int:car_id>/images/', views.CarImageListView.as_view(), name='car-image-list'),
    path('<int:car_id>/images/<int:pk>/', views.CarImageDetailView.as_view(), name='car-image-detail'),

    # Car Review URLs
    path('<int:car_id>/reviews/', views.CarReviewCreateView.as_view(), name='car-review-create'),
] 