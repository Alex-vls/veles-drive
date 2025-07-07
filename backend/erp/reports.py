from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
from .models import (
    Sale, ServiceOrder, Financial, Inventory, 
    ProjectBoard, ProjectTask, Service
)

class ERPReportGenerator:
    """Генератор отчетов для ERP системы"""
    
    def __init__(self, company=None, start_date=None, end_date=None):
        self.company = company
        self.start_date = start_date or (timezone.now() - timedelta(days=30))
        self.end_date = end_date or timezone.now()
    
    def get_sales_report(self):
        """Отчет по продажам"""
        queryset = Sale.objects.filter(
            sale_date__range=(self.start_date, self.end_date)
        )
        
        if self.company:
            queryset = queryset.filter(company=self.company)
        
        # Общая статистика
        total_sales = queryset.count()
        total_revenue = queryset.aggregate(total=Sum('sale_price'))['total'] or Decimal('0')
        total_commission = queryset.aggregate(total=Sum('commission'))['total'] or Decimal('0')
        avg_sale_price = queryset.aggregate(avg=Avg('sale_price'))['avg'] or Decimal('0')
        
        # Статистика по статусам
        status_stats = queryset.values('status').annotate(
            count=Count('id'),
            revenue=Sum('sale_price')
        )
        
        # Статистика по дням
        daily_stats = queryset.annotate(
            date=TruncDate('sale_date')
        ).values('date').annotate(
            sales_count=Count('id'),
            revenue=Sum('sale_price'),
            commission=Sum('commission')
        ).order_by('date')
        
        # Топ автомобилей по продажам
        top_cars = queryset.values('car__model__brand__name', 'car__model__name').annotate(
            sales_count=Count('id'),
            total_revenue=Sum('sale_price')
        ).order_by('-sales_count')[:10]
        
        # Топ клиентов
        top_customers = queryset.values('customer__username', 'customer__email').annotate(
            purchases_count=Count('id'),
            total_spent=Sum('sale_price')
        ).order_by('-total_spent')[:10]
        
        return {
            'period': {
                'start': self.start_date,
                'end': self.end_date
            },
            'summary': {
                'total_sales': total_sales,
                'total_revenue': total_revenue,
                'total_commission': total_commission,
                'avg_sale_price': avg_sale_price,
                'net_revenue': total_revenue - total_commission
            },
            'status_stats': status_stats,
            'daily_stats': daily_stats,
            'top_cars': top_cars,
            'top_customers': top_customers
        }
    
    def get_service_report(self):
        """Отчет по сервисным услугам"""
        queryset = ServiceOrder.objects.filter(
            created_at__range=(self.start_date, self.end_date)
        )
        
        if self.company:
            queryset = queryset.filter(company=self.company)
        
        # Общая статистика
        total_orders = queryset.count()
        completed_orders = queryset.filter(status='completed').count()
        total_revenue = queryset.aggregate(total=Sum('total_price'))['total'] or Decimal('0')
        avg_order_price = queryset.aggregate(avg=Avg('total_price'))['avg'] or Decimal('0')
        
        # Статистика по статусам
        status_stats = queryset.values('status').annotate(
            count=Count('id'),
            revenue=Sum('total_price')
        )
        
        # Статистика по услугам
        service_stats = queryset.values('services__name').annotate(
            orders_count=Count('id'),
            total_revenue=Sum('total_price')
        ).order_by('-total_revenue')
        
        # Статистика по дням
        daily_stats = queryset.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            orders_count=Count('id'),
            revenue=Sum('total_price')
        ).order_by('date')
        
        # Топ клиентов по сервису
        top_customers = queryset.values('customer__username', 'customer__email').annotate(
            orders_count=Count('id'),
            total_spent=Sum('total_price')
        ).order_by('-total_spent')[:10]
        
        return {
            'period': {
                'start': self.start_date,
                'end': self.end_date
            },
            'summary': {
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'completion_rate': (completed_orders / total_orders * 100) if total_orders > 0 else 0,
                'total_revenue': total_revenue,
                'avg_order_price': avg_order_price
            },
            'status_stats': status_stats,
            'service_stats': service_stats,
            'daily_stats': daily_stats,
            'top_customers': top_customers
        }
    
    def get_financial_report(self):
        """Финансовый отчет"""
        queryset = Financial.objects.filter(
            date__range=(self.start_date, self.end_date)
        )
        
        if self.company:
            queryset = queryset.filter(company=self.company)
        
        # Общая статистика
        total_operations = queryset.count()
        
        # Статистика по типам операций
        operation_stats = queryset.values('operation_type').annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        )
        
        # Доходы и расходы
        income = queryset.filter(operation_type='income').aggregate(total=Sum('amount'))['total'] or Decimal('0')
        expenses = queryset.filter(operation_type='expense').aggregate(total=Sum('amount'))['total'] or Decimal('0')
        net_income = income - expenses
        
        # Статистика по категориям
        category_stats = queryset.values('category').annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-total_amount')
        
        # Статистика по дням
        daily_stats = queryset.annotate(
            date=TruncDate('date')
        ).values('date').annotate(
            operations_count=Count('id'),
            income=Sum('amount', filter=Q(operation_type='income')),
            expenses=Sum('amount', filter=Q(operation_type='expense'))
        ).order_by('date')
        
        return {
            'period': {
                'start': self.start_date,
                'end': self.end_date
            },
            'summary': {
                'total_operations': total_operations,
                'total_income': income,
                'total_expenses': expenses,
                'net_income': net_income,
                'profit_margin': (net_income / income * 100) if income > 0 else 0
            },
            'operation_stats': operation_stats,
            'category_stats': category_stats,
            'daily_stats': daily_stats
        }
    
    def get_inventory_report(self):
        """Отчет по инвентарю"""
        queryset = Inventory.objects.all()
        
        if self.company:
            queryset = queryset.filter(company=self.company)
        
        # Общая статистика
        total_items = queryset.count()
        total_quantity = queryset.aggregate(total=Sum('quantity'))['total'] or 0
        total_cost = queryset.aggregate(total=Sum(F('cost_price') * F('quantity')))['total'] or Decimal('0')
        total_value = queryset.aggregate(total=Sum(F('selling_price') * F('quantity')))['total'] or Decimal('0')
        
        # Статистика по статусам
        status_stats = queryset.values('status').annotate(
            items_count=Count('id'),
            total_quantity=Sum('quantity'),
            total_cost=Sum(F('cost_price') * F('quantity')),
            total_value=Sum(F('selling_price') * F('quantity'))
        )
        
        # Топ автомобилей по стоимости
        top_cars = queryset.values('car__model__brand__name', 'car__model__name').annotate(
            items_count=Count('id'),
            total_quantity=Sum('quantity'),
            total_cost=Sum(F('cost_price') * F('quantity')),
            total_value=Sum(F('selling_price') * F('quantity'))
        ).order_by('-total_value')[:10]
        
        # Автомобили с низким запасом
        low_stock = queryset.filter(quantity__lte=2).values(
            'car__model__brand__name', 'car__model__name', 'quantity', 'status'
        )
        
        return {
            'summary': {
                'total_items': total_items,
                'total_quantity': total_quantity,
                'total_cost': total_cost,
                'total_value': total_value,
                'potential_profit': total_value - total_cost
            },
            'status_stats': status_stats,
            'top_cars': top_cars,
            'low_stock': low_stock
        }
    
    def get_project_report(self):
        """Отчет по проектам"""
        queryset = ProjectBoard.objects.all()
        
        if self.company:
            queryset = queryset.filter(company=self.company)
        
        # Общая статистика
        total_boards = queryset.count()
        active_boards = queryset.filter(is_archived=False).count()
        
        # Статистика по задачам
        all_tasks = ProjectTask.objects.filter(column__board__in=queryset)
        total_tasks = all_tasks.count()
        completed_tasks = all_tasks.filter(column__name__icontains='завершено').count()
        overdue_tasks = all_tasks.filter(
            due_date__lt=timezone.now(),
            column__name__icontains='в работе'
        ).count()
        
        # Статистика по приоритетам
        priority_stats = all_tasks.values('priority').annotate(
            count=Count('id')
        )
        
        # Статистика по исполнителям
        assignee_stats = all_tasks.values('assignee__username').annotate(
            tasks_count=Count('id'),
            completed_count=Count('id', filter=Q(column__name__icontains='завершено'))
        ).order_by('-tasks_count')[:10]
        
        # Статистика по доскам
        board_stats = queryset.annotate(
            tasks_count=Count('columns__tasks'),
            completed_tasks=Count('columns__tasks', filter=Q(columns__name__icontains='завершено'))
        ).values('name', 'tasks_count', 'completed_tasks')
        
        return {
            'summary': {
                'total_boards': total_boards,
                'active_boards': active_boards,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'overdue_tasks': overdue_tasks,
                'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            },
            'priority_stats': priority_stats,
            'assignee_stats': assignee_stats,
            'board_stats': board_stats
        }
    
    def get_comprehensive_report(self):
        """Комплексный отчет"""
        return {
            'sales': self.get_sales_report(),
            'service': self.get_service_report(),
            'financial': self.get_financial_report(),
            'inventory': self.get_inventory_report(),
            'projects': self.get_project_report(),
            'generated_at': timezone.now()
        }

class DashboardMetrics:
    """Метрики для дашборда"""
    
    @staticmethod
    def get_revenue_trend(days=30):
        """Тренд выручки за последние дни"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        sales_data = Sale.objects.filter(
            sale_date__range=(start_date, end_date)
        ).annotate(
            date=TruncDate('sale_date')
        ).values('date').annotate(
            revenue=Sum('sale_price')
        ).order_by('date')
        
        service_data = ServiceOrder.objects.filter(
            created_at__range=(start_date, end_date)
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('total_price')
        ).order_by('date')
        
        return {
            'sales': list(sales_data),
            'service': list(service_data)
        }
    
    @staticmethod
    def get_top_performers():
        """Топ исполнители"""
        return ProjectTask.objects.values('assignee__username').annotate(
            tasks_count=Count('id'),
            completed_count=Count('id', filter=Q(column__name__icontains='завершено'))
        ).order_by('-completed_count')[:5]
    
    @staticmethod
    def get_recent_activities(limit=10):
        """Последние активности"""
        activities = []
        
        # Последние продажи
        recent_sales = Sale.objects.select_related('car', 'customer', 'company').order_by('-sale_date')[:limit//2]
        for sale in recent_sales:
            activities.append({
                'type': 'sale',
                'title': f'Продажа {sale.car}',
                'description': f'Клиент: {sale.customer.username}, Сумма: {sale.sale_price} ₽',
                'date': sale.sale_date,
                'company': sale.company.name
            })
        
        # Последние задачи
        recent_tasks = ProjectTask.objects.select_related('assignee', 'column__board').order_by('-created_at')[:limit//2]
        for task in recent_tasks:
            activities.append({
                'type': 'task',
                'title': f'Задача: {task.title}',
                'description': f'Исполнитель: {task.assignee.username if task.assignee else "Не назначен"}',
                'date': task.created_at,
                'company': task.column.board.company.name if task.column.board.company else "Общая"
            })
        
        # Сортируем по дате
        activities.sort(key=lambda x: x['date'], reverse=True)
        return activities[:limit] 