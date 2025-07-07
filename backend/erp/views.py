from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
import pytz
from django.core.cache import cache

from .models import (
    Inventory, Sale, Service, ServiceOrder, ServiceOrderItem, Financial,
    ProjectBoard, ProjectColumn, ProjectTask, TaskComment, TaskAttachment, TaskHistory, TaskLabel
)
from cars.models import (
    Auction, AuctionBid,
    LeasingCompany, LeasingProgram, LeasingApplication,
    InsuranceCompany, InsuranceType, InsurancePolicy, InsuranceClaim
)
from .serializers import (
    InventorySerializer, SaleSerializer, ServiceSerializer, ServiceOrderSerializer,
    ServiceOrderItemSerializer, FinancialSerializer,
    ProjectBoardSerializer, ProjectColumnSerializer, ProjectTaskSerializer,
    TaskCommentSerializer, TaskAttachmentSerializer, TaskHistorySerializer,
    DashboardStatsSerializer, SalesReportSerializer, FinancialReportSerializer, TaskReportSerializer,
    AuctionSerializer,
    AuctionCreateSerializer,
    AuctionUpdateSerializer,
    LeasingApplicationSerializer,
    LeasingCreateSerializer,
    LeasingUpdateSerializer,
    InsurancePolicySerializer,
    InsuranceCreateSerializer,
    InsuranceUpdateSerializer
)
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
User = get_user_model()


from .reports import ERPReportGenerator, DashboardMetrics
from companies.models import Company

# ERP Views
class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company', 'car']
    search_fields = ['car__title', 'location', 'notes']
    ordering_fields = ['created_at', 'selling_price', 'cost_price']

    def get_queryset(self):
        return Inventory.objects.filter(company__members=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Статистика по инвентарю"""
        queryset = self.get_queryset()
        
        stats = {
            'total_items': queryset.count(),
            'available_items': queryset.filter(status='available').count(),
            'reserved_items': queryset.filter(status='reserved').count(),
            'sold_items': queryset.filter(status='sold').count(),
            'total_value': queryset.aggregate(Sum('selling_price'))['selling_price__sum'] or 0,
            'total_cost': queryset.aggregate(Sum('cost_price'))['cost_price__sum'] or 0,
        }
        
        return Response(stats)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company', 'car', 'customer']
    search_fields = ['car__title', 'customer__username', 'notes']
    ordering_fields = ['sale_date', 'sale_price', 'commission']

    def get_queryset(self):
        return Sale.objects.filter(company__members=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Статистика по продажам"""
        queryset = self.get_queryset()
        
        # Фильтр по периоду
        period = request.query_params.get('period', 'month')
        if period == 'week':
            start_date = timezone.now() - timedelta(days=7)
        elif period == 'month':
            start_date = timezone.now() - timedelta(days=30)
        elif period == 'year':
            start_date = timezone.now() - timedelta(days=365)
        else:
            start_date = timezone.now() - timedelta(days=30)
        
        period_queryset = queryset.filter(sale_date__gte=start_date)
        
        stats = {
            'total_sales': period_queryset.count(),
            'total_revenue': period_queryset.aggregate(Sum('sale_price'))['sale_price__sum'] or 0,
            'total_commission': period_queryset.aggregate(Sum('commission'))['commission__sum'] or 0,
            'average_sale_price': period_queryset.aggregate(Avg('sale_price'))['sale_price__avg'] or 0,
            'completed_sales': period_queryset.filter(status='completed').count(),
            'pending_sales': period_queryset.filter(status='pending').count(),
        }
        
        return Response(stats)

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'company', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        return Service.objects.filter(company__members=self.request.user)

class ServiceOrderViewSet(viewsets.ModelViewSet):
    queryset = ServiceOrder.objects.all()
    serializer_class = ServiceOrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company', 'customer', 'car']
    search_fields = ['car__title', 'customer__username', 'notes']
    ordering_fields = ['scheduled_date', 'total_price', 'created_at']

    def get_queryset(self):
        return ServiceOrder.objects.filter(company__members=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Статистика по заказам на обслуживание"""
        queryset = self.get_queryset()
        
        stats = {
            'total_orders': queryset.count(),
            'scheduled_orders': queryset.filter(status='scheduled').count(),
            'in_progress_orders': queryset.filter(status='in_progress').count(),
            'completed_orders': queryset.filter(status='completed').count(),
            'total_revenue': queryset.aggregate(Sum('total_price'))['total_price__sum'] or 0,
        }
        
        return Response(stats)

class FinancialViewSet(viewsets.ModelViewSet):
    queryset = Financial.objects.all()
    serializer_class = FinancialSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['operation_type', 'company', 'category']
    search_fields = ['description']
    ordering_fields = ['amount', 'date', 'created_at']

    def get_queryset(self):
        return Financial.objects.filter(company__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Финансовая статистика"""
        queryset = self.get_queryset()
        
        # Фильтр по периоду
        period = request.query_params.get('period', 'month')
        if period == 'week':
            start_date = timezone.now() - timedelta(days=7)
        elif period == 'month':
            start_date = timezone.now() - timedelta(days=30)
        elif period == 'year':
            start_date = timezone.now() - timedelta(days=365)
        else:
            start_date = timezone.now() - timedelta(days=30)
        
        period_queryset = queryset.filter(date__gte=start_date)
        
        income = period_queryset.filter(operation_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        expenses = period_queryset.filter(operation_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        
        stats = {
            'total_operations': period_queryset.count(),
            'total_income': income,
            'total_expenses': expenses,
            'net_profit': income - expenses,
            'profit_margin': ((income - expenses) / income * 100) if income > 0 else 0,
        }
        
        return Response(stats)

# Trello-like Project Management Views
class ProjectBoardViewSet(viewsets.ModelViewSet):
    queryset = ProjectBoard.objects.all()
    serializer_class = ProjectBoardSerializer
    permission_classes = [IsAuthenticated, ]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['board_type', 'company', 'is_archived']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at']

    def get_queryset(self):
        return ProjectBoard.objects.filter(company__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Дублировать доску"""
        board = self.get_object()
        new_board = ProjectBoard.objects.create(
            company=board.company,
            name=f"{board.name} (копия)",
            description=board.description,
            board_type=board.board_type,
            color=board.color,
            created_by=request.user
        )
        
        # Дублируем колонки
        for column in board.columns.all():
            new_column = ProjectColumn.objects.create(
                board=new_board,
                name=column.name,
                order=column.order,
                color=column.color
            )
        
        # Дублируем метки
        for label in board.labels.all():
            TaskLabel.objects.create(
                board=new_board,
                name=label.name,
                color=label.color
            )
        
        serializer = self.get_serializer(new_board)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProjectColumnViewSet(viewsets.ModelViewSet):
    queryset = ProjectColumn.objects.all()
    serializer_class = ProjectColumnSerializer
    permission_classes = [IsAuthenticated, ]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['board', 'is_archived']
    ordering_fields = ['order', 'created_at']

    def get_queryset(self):
        return ProjectColumn.objects.filter(board__company__members=self.request.user)

    @action(detail=True, methods=['post'])
    def reorder_tasks(self, request, pk=None):
        """Переупорядочить задачи в колонке"""
        column = self.get_object()
        task_ids = request.data.get('task_ids', [])
        
        for index, task_id in enumerate(task_ids):
            try:
                task = ProjectTask.objects.get(id=task_id, column=column)
                task.order = index
                task.save()
            except ProjectTask.DoesNotExist:
                pass
        
        return Response({'status': 'success'})

class ProjectTaskViewSet(viewsets.ModelViewSet):
    queryset = ProjectTask.objects.all()
    serializer_class = ProjectTaskSerializer
    permission_classes = [IsAuthenticated, ]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['column', 'assignee', 'priority', 'is_archived']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'due_date', 'created_at']

    def get_queryset(self):
        return ProjectTask.objects.filter(column__board__company__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Переместить задачу в другую колонку"""
        task = self.get_object()
        column_id = request.data.get('column_id')
        order = request.data.get('order', 0)
        
        try:
            new_column = ProjectColumn.objects.get(
                id=column_id,
                board__company__members=request.user
            )
            task.column = new_column
            task.order = order
            task.save()
            
            # Обновляем порядок остальных задач
            tasks = ProjectTask.objects.filter(column=new_column).exclude(id=task.id)
            for index, t in enumerate(tasks):
                if t.order >= order:
                    t.order = index + 1
                    t.save()
            
            serializer = self.get_serializer(task)
            return Response(serializer.data)
        except ProjectColumn.DoesNotExist:
            return Response(
                {'error': 'Колонка не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Назначить задачу пользователю"""
        task = self.get_object()
        assignee_id = request.data.get('assignee_id')
        
        if assignee_id:
            try:
                assignee = User.objects.get(id=assignee_id)
                task.assignee = assignee
                task.save()
            except User.DoesNotExist:
                return Response(
                    {'error': 'Пользователь не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            task.assignee = None
            task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)

class TaskCommentViewSet(viewsets.ModelViewSet):
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated, ]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['task']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return TaskComment.objects.filter(task__column__board__company__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class TaskAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TaskAttachment.objects.all()
    serializer_class = TaskAttachmentSerializer
    permission_classes = [IsAuthenticated, ]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['task']
    ordering_fields = ['uploaded_at']

    def get_queryset(self):
        return TaskAttachment.objects.filter(task__column__board__company__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class TaskHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TaskHistory.objects.all()
    serializer_class = TaskHistorySerializer
    permission_classes = [IsAuthenticated, ]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['task', 'user', 'action']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return TaskHistory.objects.filter(task__column__board__company__members=self.request.user)

# Dashboard Views
class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, ]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Общая статистика дашборда"""
        user = request.user
        company = user.company
        
        # Инвентарь
        inventory = Inventory.objects.filter(company=company)
        available_inventory = inventory.filter(status='available')
        
        # Продажи
        sales = Sale.objects.filter(company=company)
        total_sales = sales.aggregate(Sum('sale_price'))['sale_price__sum'] or 0
        
        # Услуги
        services = Service.objects.filter(company=company)
        service_orders = ServiceOrder.objects.filter(company=company)
        active_service_orders = service_orders.filter(status='in_progress')
        
        # Финансы
        financial = Financial.objects.filter(company=company)
        total_revenue = financial.filter(operation_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = financial.filter(operation_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        profit_margin = (total_revenue - total_expenses) / total_revenue * 100 if total_revenue > 0 else 0
        
        # Задачи
        tasks = ProjectTask.objects.filter(column__board__company=company)
        completed_tasks = tasks.filter(column__name__icontains='завершено').count()
        overdue_tasks = tasks.filter(due_date__lt=timezone.now()).count()
        
        stats = {
            'total_inventory': inventory.count(),
            'available_inventory': available_inventory.count(),
            'total_sales': total_sales,
            'total_revenue': total_revenue,
            'total_services': services.count(),
            'active_service_orders': active_service_orders.count(),
            'total_financial_operations': financial.count(),
            'profit_margin': round(profit_margin, 2),
            'total_tasks': tasks.count(),
            'completed_tasks': completed_tasks,
            'overdue_tasks': overdue_tasks,
        }
        
        return Response(stats)

# Report Views
class ReportViewSet(viewsets.ViewSet):
    """API для отчетов ERP системы"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def sales(self, request):
        """Отчет по продажам"""
        company = request.query_params.get('company')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Парсим даты
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        
        generator = ERPReportGenerator(
            company=company,
            start_date=start_date,
            end_date=end_date
        )
        
        report = generator.get_sales_report()
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def service(self, request):
        """Отчет по сервисным услугам"""
        company = request.query_params.get('company')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        
        generator = ERPReportGenerator(
            company=company,
            start_date=start_date,
            end_date=end_date
        )
        
        report = generator.get_service_report()
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def financial(self, request):
        """Финансовый отчет"""
        company = request.query_params.get('company')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        
        generator = ERPReportGenerator(
            company=company,
            start_date=start_date,
            end_date=end_date
        )
        
        report = generator.get_financial_report()
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def inventory(self, request):
        """Отчет по инвентарю"""
        company = request.query_params.get('company')
        
        generator = ERPReportGenerator(company=company)
        report = generator.get_inventory_report()
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def projects(self, request):
        """Отчет по проектам"""
        company = request.query_params.get('company')
        
        generator = ERPReportGenerator(company=company)
        report = generator.get_project_report()
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def comprehensive(self, request):
        """Комплексный отчет"""
        company = request.query_params.get('company')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        
        generator = ERPReportGenerator(
            company=company,
            start_date=start_date,
            end_date=end_date
        )
        
        report = generator.get_comprehensive_report()
        return Response(report)

class DashboardViewSet(viewsets.ViewSet):
    """API для дашборда"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """Метрики для дашборда"""
        days = int(request.query_params.get('days', 30))
        
        revenue_trend = DashboardMetrics.get_revenue_trend(days)
        top_performers = DashboardMetrics.get_top_performers()
        recent_activities = DashboardMetrics.get_recent_activities()
        
        return Response({
            'revenue_trend': revenue_trend,
            'top_performers': top_performers,
            'recent_activities': recent_activities
        })
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Краткая сводка"""
        # Общая статистика
        total_sales = Sale.objects.count()
        total_revenue = Sale.objects.aggregate(total=Sum('sale_price'))['total'] or 0
        total_orders = ServiceOrder.objects.count()
        total_tasks = ProjectTask.objects.count()
        overdue_tasks = ProjectTask.objects.filter(
            due_date__lt=timezone.now(),
            column__name__icontains='в работе'
        ).count()
        
        # Статистика за сегодня
        today = timezone.now().date()
        today_sales = Sale.objects.filter(sale_date__date=today).count()
        today_revenue = Sale.objects.filter(sale_date__date=today).aggregate(total=Sum('sale_price'))['total'] or 0
        
        return Response({
            'total_sales': total_sales,
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'total_tasks': total_tasks,
            'overdue_tasks': overdue_tasks,
            'today_sales': today_sales,
            'today_revenue': today_revenue
        }) 

# ============================================================================
# AUCTION VIEWSETS
# ============================================================================

class AuctionViewSet(viewsets.ModelViewSet):
    """ViewSet for Auction model"""
    queryset = Auction.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle', 'status', 'auction_type', 'company']
    search_fields = ['vehicle__brand__name', 'vehicle__model__name', 'description']
    ordering_fields = ['start_price', 'current_price', 'start_date', 'end_date', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AuctionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AuctionUpdateSerializer
        return AuctionSerializer

    def perform_create(self, serializer):
        company = Company.objects.get(user=self.request.user)
        serializer.save(company=company)
        # Очищаем кэш
        cache.delete_pattern("view_cache_/api/auctions/*")

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/auctions/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/auctions/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/auctions/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/auctions/*")

# ============================================================================
# LEASING VIEWSETS
# ============================================================================

class LeasingViewSet(viewsets.ModelViewSet):
    """ViewSet for LeasingApplication model"""
    queryset = LeasingApplication.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'program', 'vehicle', 'applicant']
    search_fields = ['program__name', 'vehicle__brand__name', 'applicant__username']
    ordering_fields = ['down_payment', 'term_months', 'monthly_payment', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return LeasingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LeasingUpdateSerializer
        return LeasingApplicationSerializer

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)
        # Очищаем кэш
        cache.delete_pattern("view_cache_/api/leasing/*")

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/leasing/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/leasing/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/leasing/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/leasing/*")

# ============================================================================
# INSURANCE VIEWSETS
# ============================================================================

class InsuranceViewSet(viewsets.ModelViewSet):
    """ViewSet for InsurancePolicy model"""
    queryset = InsurancePolicy.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company', 'vehicle', 'insured_person']
    search_fields = ['policy_number', 'company__name', 'vehicle__brand__name']
    ordering_fields = ['premium_amount', 'coverage_amount', 'start_date', 'end_date', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return InsuranceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return InsuranceUpdateSerializer
        return InsurancePolicySerializer

    def perform_create(self, serializer):
        serializer.save(insured_person=self.request.user)
        # Очищаем кэш
        cache.delete_pattern("view_cache_/api/insurance/*")

    def perform_update(self, serializer):
        serializer.save()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/insurance/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/insurance/*")

    def perform_destroy(self, instance):
        instance.delete()
        # Очищаем кэш
        cache.delete_pattern(f"view_cache_/api/insurance/{self.kwargs['pk']}/*")
        cache.delete_pattern("view_cache_/api/insurance/*") 