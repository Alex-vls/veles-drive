from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# ERP Routes
router.register(r'inventory', views.InventoryViewSet, basename='inventory')
router.register(r'sales', views.SaleViewSet, basename='sale')
router.register(r'services', views.ServiceViewSet, basename='service')
router.register(r'service-orders', views.ServiceOrderViewSet, basename='serviceorder')
router.register(r'financial', views.FinancialViewSet, basename='financial')

# Vehicle Services Routes
router.register(r'auctions', views.AuctionViewSet, basename='auction')
router.register(r'leasing', views.LeasingViewSet, basename='leasing')
router.register(r'insurance', views.InsuranceViewSet, basename='insurance')

# Trello-like Project Management Routes
router.register(r'project-boards', views.ProjectBoardViewSet, basename='projectboard')
router.register(r'project-columns', views.ProjectColumnViewSet, basename='projectcolumn')
router.register(r'project-tasks', views.ProjectTaskViewSet, basename='projecttask')
router.register(r'task-comments', views.TaskCommentViewSet, basename='taskcomment')
router.register(r'task-attachments', views.TaskAttachmentViewSet, basename='taskattachment')
router.register(r'task-history', views.TaskHistoryViewSet, basename='taskhistory')

# Dashboard and Reports
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')
router.register(r'reports', views.ReportViewSet, basename='reports')

urlpatterns = [
    path('api/erp/', include(router.urls)),
] 