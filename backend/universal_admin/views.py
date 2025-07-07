from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta, datetime
from django.db.models.functions import TruncDate, TruncMonth, TruncYear

# Импорты моделей
from veles_auto.models import (
    Company, Car, Review, Article, News, PageView, UserSession, 
    SearchQuery, Conversion, ABTest, ABTestResult
)

from erp.models import (
    Sale, ServiceOrder, Financial, ProjectBoard, ProjectTask
)


@staff_member_required
def analytics_dashboard(request):
    """Расширенная аналитическая панель"""
    
    # Период для анализа
    period = request.GET.get('period', '30')
    if period == '7':
        days = 7
    elif period == '90':
        days = 90
    elif period == '365':
        days = 365
    else:
        days = 30
    
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    # Основная статистика
    stats = get_analytics_stats(start_date, end_date)
    
    # Графики
    charts = get_analytics_charts(start_date, end_date)
    
    # Топ-компании
    top_companies = Company.objects.annotate(
        car_count=Count('cars'),
        sale_count=Count('sales'),
        revenue=Sum('sales__sale_price')
    ).order_by('-revenue')[:10]
    
    # Топ-автомобили
    top_cars = Car.objects.annotate(
        view_count=Count('pageviews'),
        review_count=Count('reviews'),
        avg_rating=Avg('reviews__rating')
    ).order_by('-view_count')[:10]
    
    # Последние активности
    recent_activities = get_recent_activities()
    
    context = {
        'stats': stats,
        'charts': charts,
        'top_companies': top_companies,
        'top_cars': top_cars,
        'recent_activities': recent_activities,
        'period': period,
        'days': days
    }
    
    return render(request, 'universal_admin/analytics.html', context)


@staff_member_required
def api_stats(request):
    """API для получения статистики"""
    period = request.GET.get('period', '30')
    
    if period == '7':
        days = 7
    elif period == '90':
        days = 90
    elif period == '365':
        days = 365
    else:
        days = 30
    
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    stats = get_analytics_stats(start_date, end_date)
    
    return JsonResponse(stats)


@staff_member_required
def api_charts(request):
    """API для получения данных графиков"""
    period = request.GET.get('period', '30')
    chart_type = request.GET.get('type', 'sales')
    
    if period == '7':
        days = 7
    elif period == '90':
        days = 90
    elif period == '365':
        days = 365
    else:
        days = 30
    
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    if chart_type == 'sales':
        data = get_sales_chart_data(start_date, end_date)
    elif chart_type == 'users':
        data = get_users_chart_data(start_date, end_date)
    elif chart_type == 'pageviews':
        data = get_pageviews_chart_data(start_date, end_date)
    elif chart_type == 'revenue':
        data = get_revenue_chart_data(start_date, end_date)
    else:
        data = get_sales_chart_data(start_date, end_date)
    
    return JsonResponse(data)


def get_analytics_stats(start_date, end_date):
    """Получение аналитической статистики"""
    
    # Пользователи
    total_users = User.objects.count()
    new_users = User.objects.filter(date_joined__gte=start_date).count()
    active_users = User.objects.filter(last_login__gte=start_date).count()
    
    # Компании
    total_companies = Company.objects.count()
    new_companies = Company.objects.filter(created_at__gte=start_date).count()
    verified_companies = Company.objects.filter(is_verified=True).count()
    
    # Автомобили
    total_cars = Car.objects.count()
    new_cars = Car.objects.filter(created_at__gte=start_date).count()
    available_cars = Car.objects.filter(is_available=True).count()
    
    # Продажи
    total_sales = Sale.objects.count()
    period_sales = Sale.objects.filter(sale_date__gte=start_date).count()
    total_revenue = Sale.objects.aggregate(total=Sum('sale_price'))['total'] or 0
    period_revenue = Sale.objects.filter(sale_date__gte=start_date).aggregate(total=Sum('sale_price'))['total'] or 0
    
    # Проекты
    total_projects = ProjectBoard.objects.count()
    active_projects = ProjectBoard.objects.filter(is_archived=False).count()
    total_tasks = ProjectTask.objects.count()
    completed_tasks = ProjectTask.objects.filter(status='completed').count()
    
    # Контент
    total_articles = Article.objects.count()
    published_articles = Article.objects.filter(status='published').count()
    total_news = News.objects.count()
    published_news = News.objects.filter(status='published').count()
    
    # Просмотры
    total_pageviews = PageView.objects.count()
    period_pageviews = PageView.objects.filter(timestamp__gte=start_date).count()
    
    return {
        'users': {
            'total': total_users,
            'new': new_users,
            'active': active_users,
            'growth': calculate_growth(User, 'date_joined', start_date, end_date)
        },
        'companies': {
            'total': total_companies,
            'new': new_companies,
            'verified': verified_companies,
            'growth': calculate_growth(Company, 'created_at', start_date, end_date)
        },
        'cars': {
            'total': total_cars,
            'new': new_cars,
            'available': available_cars,
            'growth': calculate_growth(Car, 'created_at', start_date, end_date)
        },
        'sales': {
            'total': total_sales,
            'period': period_sales,
            'revenue': total_revenue,
            'period_revenue': period_revenue,
            'growth': calculate_growth(Sale, 'sale_date', start_date, end_date)
        },
        'projects': {
            'total': total_projects,
            'active': active_projects,
            'tasks': total_tasks,
            'completed': completed_tasks
        },
        'content': {
            'articles': total_articles,
            'published_articles': published_articles,
            'news': total_news,
            'published_news': published_news
        },
        'pageviews': {
            'total': total_pageviews,
            'period': period_pageviews,
            'growth': calculate_growth(PageView, 'timestamp', start_date, end_date)
        }
    }


def get_analytics_charts(start_date, end_date):
    """Получение данных для графиков"""
    return {
        'sales': get_sales_chart_data(start_date, end_date),
        'users': get_users_chart_data(start_date, end_date),
        'pageviews': get_pageviews_chart_data(start_date, end_date),
        'revenue': get_revenue_chart_data(start_date, end_date)
    }


def get_sales_chart_data(start_date, end_date):
    """Данные для графика продаж"""
    sales_data = Sale.objects.filter(
        sale_date__gte=start_date,
        sale_date__lte=end_date
    ).annotate(
        date=TruncDate('sale_date')
    ).values('date').annotate(
        count=Count('id'),
        revenue=Sum('sale_price')
    ).order_by('date')
    
    return {
        'labels': [item['date'].strftime('%d.%m') for item in sales_data],
        'datasets': [
            {
                'label': 'Количество продаж',
                'data': [item['count'] for item in sales_data],
                'borderColor': '#007bff',
                'backgroundColor': 'rgba(0, 123, 255, 0.1)'
            },
            {
                'label': 'Выручка (тыс. ₽)',
                'data': [round(item['revenue'] / 1000, 1) for item in sales_data],
                'borderColor': '#28a745',
                'backgroundColor': 'rgba(40, 167, 69, 0.1)'
            }
        ]
    }


def get_users_chart_data(start_date, end_date):
    """Данные для графика пользователей"""
    users_data = User.objects.filter(
        date_joined__gte=start_date,
        date_joined__lte=end_date
    ).annotate(
        date=TruncDate('date_joined')
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    return {
        'labels': [item['date'].strftime('%d.%m') for item in users_data],
        'datasets': [
            {
                'label': 'Регистрации',
                'data': [item['count'] for item in users_data],
                'backgroundColor': '#28a745'
            }
        ]
    }


def get_pageviews_chart_data(start_date, end_date):
    """Данные для графика просмотров"""
    pageviews_data = PageView.objects.filter(
        timestamp__gte=start_date,
        timestamp__lte=end_date
    ).annotate(
        date=TruncDate('timestamp')
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    return {
        'labels': [item['date'].strftime('%d.%m') for item in pageviews_data],
        'datasets': [
            {
                'label': 'Просмотры',
                'data': [item['count'] for item in pageviews_data],
                'borderColor': '#ffc107',
                'backgroundColor': 'rgba(255, 193, 7, 0.1)'
            }
        ]
    }


def get_revenue_chart_data(start_date, end_date):
    """Данные для графика выручки"""
    revenue_data = Sale.objects.filter(
        sale_date__gte=start_date,
        sale_date__lte=end_date
    ).annotate(
        date=TruncDate('sale_date')
    ).values('date').annotate(
        revenue=Sum('sale_price')
    ).order_by('date')
    
    return {
        'labels': [item['date'].strftime('%d.%m') for item in revenue_data],
        'datasets': [
            {
                'label': 'Выручка (₽)',
                'data': [item['revenue'] for item in revenue_data],
                'borderColor': '#28a745',
                'backgroundColor': 'rgba(40, 167, 69, 0.1)',
                'fill': True
            }
        ]
    }


def get_recent_activities():
    """Получение последних активностей"""
    activities = []
    
    # Последние продажи
    recent_sales = Sale.objects.select_related('car', 'company', 'customer').order_by('-sale_date')[:5]
    for sale in recent_sales:
        activities.append({
            'type': 'sale',
            'icon': '💰',
            'title': f'Продажа {sale.car.title}',
            'description': f'{sale.company.name} - {sale.sale_price} ₽',
            'date': sale.sale_date,
            'user': sale.customer.username
        })
    
    # Последние регистрации
    recent_users = User.objects.order_by('-date_joined')[:5]
    for user in recent_users:
        activities.append({
            'type': 'user',
            'icon': '👤',
            'title': f'Новый пользователь {user.username}',
            'description': user.email,
            'date': user.date_joined,
            'user': user.username
        })
    
    # Последние задачи
    recent_tasks = ProjectTask.objects.select_related('column__board', 'assignee').order_by('-created_at')[:5]
    for task in recent_tasks:
        activities.append({
            'type': 'task',
            'icon': '📋',
            'title': f'Новая задача: {task.title}',
            'description': f'{task.column.board.name} - {task.priority}',
            'date': task.created_at,
            'user': task.assignee.username if task.assignee else 'Не назначен'
        })
    
    # Сортируем по дате
    activities.sort(key=lambda x: x['date'], reverse=True)
    return activities[:10]


def calculate_growth(model, date_field, start_date, end_date):
    """Расчет роста за период"""
    current_period = model.objects.filter(**{f'{date_field}__gte': start_date}).count()
    
    # Предыдущий период такой же длительности
    period_duration = end_date - start_date
    previous_start = start_date - period_duration
    previous_end = start_date
    
    previous_period = model.objects.filter(**{f'{date_field}__gte': previous_start, f'{date_field}__lt': previous_end}).count()
    
    if previous_period == 0:
        return 100 if current_period > 0 else 0
    
    return round(((current_period - previous_period) / previous_period) * 100, 1) 