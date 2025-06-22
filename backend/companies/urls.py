from django.urls import path
from . import views

urlpatterns = [
    # Company URLs
    path('', views.CompanyListView.as_view(), name='company-list'),
    path('<int:pk>/', views.CompanyDetailView.as_view(), name='company-detail'),
    path('create/', views.CompanyCreateView.as_view(), name='company-create'),
    path('<int:pk>/update/', views.CompanyUpdateView.as_view(), name='company-update'),
    path('<int:pk>/delete/', views.CompanyDeleteView.as_view(), name='company-delete'),
    path('<int:company_id>/reviews/', views.CompanyReviewCreateView.as_view(), name='company-review-create'),
    path('<int:company_id>/reviews/<int:pk>/', views.CompanyReviewDetailView.as_view(), name='company-review-detail'),
] 