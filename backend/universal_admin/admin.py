from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django.http import JsonResponse
from django.template.response import TemplateResponse
from django.db.models.functions import TruncDate, TruncMonth
from datetime import timedelta, datetime
import json

# Импорты моделей
from cars.models import Brand, Car, CarImage
from companies.models import Company, Review, CompanySchedule, CompanyFeature
from veles_auto.models import (
    Category, Tag, Article, News, ContentImage,
    Subscription, ContentView, Comment, Reaction, ContentRating,
    YouTubeChannel, YouTubeVideo, YouTubePlaylist, SEOMetadata,
    PageView, UserSession, SearchQuery, Conversion,
    ABTest, ABTestVariant, ABTestResult
)

from erp.models import (
    Inventory, Sale, Service, ServiceOrder, ServiceOrderItem, Financial,
    ProjectBoard, ProjectColumn, ProjectTask, TaskComment, TaskAttachment, TaskHistory, TaskLabel
)

from veles_auto.admin_actions import (
    approve_content, reject_content, verify_companies,
    unverify_companies, delete_spam, ban_users, unban_users,
    export_as_json
)


class VelesAutoUniversalAdminSite(AdminSite):
    """Универсальная админка для VELES AUTO"""
    
    site_header = "VELES AUTO - Универсальная панель управления"
    site_title = "VELES AUTO Admin"
    index_title = "Добро пожаловать в универсальную панель управления"
    
    def get_app_list(self, request):
        """Кастомная структура приложений"""
        app_list = super().get_app_list(request)
        
        # Группируем приложения по категориям
        categorized_apps = {
            'Основные модули': [],
            'ERP система': [],
            'Контент и медиа': [],
            'Аналитика и SEO': [],
            'Пользователи и права': []
        }
        
        for app in app_list:
            app_name = app['name']
            if app_name in ['Cars', 'Companies', 'Users']:
                categorized_apps['Основные модули'].append(app)
            elif app_name in ['Erp']:
                categorized_apps['ERP система'].append(app)
            elif app_name in ['Core']:
                categorized_apps['Контент и медиа'].append(app)
            elif app_name in ['Veles auto']:
                # Разделяем veles_auto на категории
                content_models = []
                analytics_models = []
                user_models = []
                
                for model in app['models']:
                    model_name = model['name']
                    if model_name in ['Articles', 'News', 'Categories', 'Tags', 'YouTube channels', 'YouTube videos']:
                        content_models.append(model)
                    elif model_name in ['SEO metadata', 'Page views', 'User sessions', 'Search queries', 'Conversions', 'A/B tests']:
                        analytics_models.append(model)
                    elif model_name in ['Users', 'Groups']:
                        user_models.append(model)
                
                if content_models:
                    categorized_apps['Контент и медиа'].append({
                        'name': 'Контент',
                        'app_label': 'veles_auto_content',
                        'models': content_models
                    })
                
                if analytics_models:
                    categorized_apps['Аналитика и SEO'].append({
                        'name': 'Аналитика',
                        'app_label': 'veles_auto_analytics',
                        'models': analytics_models
                    })
                
                if user_models:
                    categorized_apps['Пользователи и права'].append({
                        'name': 'Пользователи',
                        'app_label': 'veles_auto_users',
                        'models': user_models
                    })
            else:
                categorized_apps['Основные модули'].append(app)
        
        # Преобразуем обратно в список
        result = []
        for category, apps in categorized_apps.items():
            if apps:
                result.extend(apps)
        
        return result
    
    def index(self, request, extra_context=None):
        """Кастомная главная страница с дашбордом"""
        extra_context = extra_context or {}
        
        # Статистика
        stats = self.get_dashboard_stats()
        extra_context.update(stats)
        
        # Графики
        charts = self.get_dashboard_charts()
        extra_context.update(charts)
        
        # Последние действия
        recent_activities = self.get_recent_activities()
        extra_context['recent_activities'] = recent_activities
        
        # Быстрые действия
        quick_actions = self.get_quick_actions(request)
        extra_context['quick_actions'] = quick_actions
        
        return super().index(request, extra_context)
    
    def get_dashboard_stats(self):
        """Получение статистики для дашборда"""
        now = timezone.now()
        month_ago = now - timedelta(days=30)
        
        # Основная статистика
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        total_companies = Company.objects.count()
        verified_companies = Company.objects.filter(is_verified=True).count()
        total_cars = Car.objects.count()
        available_cars = Car.objects.filter(is_available=True).count()
        
        # ERP статистика
        total_sales = Sale.objects.count()
        monthly_sales = Sale.objects.filter(sale_date__gte=month_ago).count()
        total_revenue = Sale.objects.aggregate(total=Sum('sale_price'))['total'] or 0
        monthly_revenue = Sale.objects.filter(sale_date__gte=month_ago).aggregate(total=Sum('sale_price'))['total'] or 0
        
        total_projects = ProjectBoard.objects.count()
        active_projects = ProjectBoard.objects.filter(is_archived=False).count()
        total_tasks = ProjectTask.objects.count()
        overdue_tasks = ProjectTask.objects.filter(due_date__lt=now, status__in=['todo', 'in_progress']).count()
        
        # Контент статистика
        total_articles = Article.objects.count()
        published_articles = Article.objects.filter(status='published').count()
        total_news = News.objects.count()
        published_news = News.objects.filter(status='published').count()
        
        return {
            'stats': {
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'growth': self.calculate_growth(User, 'date_joined')
                },
                'companies': {
                    'total': total_companies,
                    'verified': verified_companies,
                    'growth': self.calculate_growth(Company, 'created_at')
                },
                'cars': {
                    'total': total_cars,
                    'available': available_cars,
                    'growth': self.calculate_growth(Car, 'created_at')
                },
                'sales': {
                    'total': total_sales,
                    'monthly': monthly_sales,
                    'revenue': total_revenue,
                    'monthly_revenue': monthly_revenue,
                    'growth': self.calculate_growth(Sale, 'sale_date')
                },
                'projects': {
                    'total': total_projects,
                    'active': active_projects,
                    'tasks': total_tasks,
                    'overdue': overdue_tasks
                },
                'content': {
                    'articles': total_articles,
                    'published_articles': published_articles,
                    'news': total_news,
                    'published_news': published_news
                }
            }
        }
    
    def get_dashboard_charts(self):
        """Получение данных для графиков"""
        now = timezone.now()
        month_ago = now - timedelta(days=30)
        
        # Продажи по дням
        sales_data = Sale.objects.filter(
            sale_date__gte=month_ago
        ).annotate(
            date=TruncDate('sale_date')
        ).values('date').annotate(
            count=Count('id'),
            revenue=Sum('sale_price')
        ).order_by('date')
        
        # Регистрации пользователей
        users_data = User.objects.filter(
            date_joined__gte=month_ago
        ).annotate(
            date=TruncDate('date_joined')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # Просмотры страниц
        pageviews_data = PageView.objects.filter(
            timestamp__gte=month_ago
        ).annotate(
            date=TruncDate('timestamp')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        return {
            'charts': {
                'sales': list(sales_data),
                'users': list(users_data),
                'pageviews': list(pageviews_data)
            }
        }
    
    def get_recent_activities(self):
        """Получение последних действий"""
        activities = []
        
        # Последние продажи
        recent_sales = Sale.objects.select_related('car', 'company', 'customer').order_by('-sale_date')[:5]
        for sale in recent_sales:
            activities.append({
                'type': 'sale',
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
                'title': f'Новая задача: {task.title}',
                'description': f'{task.column.board.name} - {task.priority}',
                'date': task.created_at,
                'user': task.assignee.username if task.assignee else 'Не назначен'
            })
        
        # Сортируем по дате
        activities.sort(key=lambda x: x['date'], reverse=True)
        return activities[:10]
    
    def get_quick_actions(self, request):
        """Быстрые действия для админа"""
        actions = [
            {
                'name': 'Добавить автомобиль',
                'url': reverse('admin:cars_car_add'),
                'icon': '🚗',
                'color': 'primary'
            },
            {
                'name': 'Добавить компанию',
                'url': reverse('admin:companies_company_add'),
                'icon': '🏢',
                'color': 'success'
            },
            {
                'name': 'Создать продажу',
                'url': reverse('admin:erp_sale_add'),
                'icon': '💰',
                'color': 'warning'
            },
            {
                'name': 'Новая задача',
                'url': reverse('admin:erp_projecttask_add'),
                'icon': '📋',
                'color': 'info'
            },
            {
                'name': 'Добавить статью',
                'url': reverse('admin:veles_auto_article_add'),
                'icon': '📝',
                'color': 'secondary'
            },
            {
                'name': 'Аналитика',
                'url': reverse('admin:analytics_dashboard'),
                'icon': '📊',
                'color': 'dark'
            }
        ]
        
        return actions
    
    def calculate_growth(self, model, date_field):
        """Расчет роста за месяц"""
        now = timezone.now()
        month_ago = now - timedelta(days=30)
        two_months_ago = now - timedelta(days=60)
        
        current_month = model.objects.filter(**{f'{date_field}__gte': month_ago}).count()
        previous_month = model.objects.filter(**{f'{date_field}__gte': two_months_ago, f'{date_field}__lt': month_ago}).count()
        
        if previous_month == 0:
            return 100 if current_month > 0 else 0
        
        return round(((current_month - previous_month) / previous_month) * 100, 1)


# Создаем экземпляр универсальной админки
universal_admin_site = VelesAutoUniversalAdminSite(name='universal_admin')


# Кастомные админки для моделей
@admin.register(User)
class UniversalUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined', 'last_login')
    list_filter = ('is_staff', 'is_active', 'groups', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    actions = [ban_users, unban_users, export_as_json]
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


# @admin.register(Company)  # Убрано - уже зарегистрировано в companies.admin
class UniversalCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'rating', 'is_verified', 'car_count', 'review_count', 'status_display')
    list_filter = ('is_verified', 'city', 'created_at')
    search_fields = ('name', 'city', 'description')
    ordering = ('-rating',)
    actions = [verify_companies, unverify_companies, export_as_json]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'city', 'address', 'phone', 'email', 'website')
        }),
        ('Статус и рейтинг', {
            'fields': ('is_verified', 'rating', 'review_count')
        }),
        ('Дополнительно', {
            'fields': ('logo', 'banner', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def car_count(self, obj):
        return obj.cars.count()
    car_count.short_description = 'Автомобилей'
    
    def review_count(self, obj):
        return obj.reviews.count()
    review_count.short_description = 'Отзывов'
    
    def status_display(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: green;">✓ Проверена</span>')
        return format_html('<span style="color: orange;">⏳ На модерации</span>')
    status_display.short_description = 'Статус'


# @admin.register(Car)  # Убрано - уже зарегистрировано в cars.admin
class UniversalCarAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'body_type', 'doors', 'seats', 'status_display')
    list_filter = ('body_type', 'doors', 'seats')
    search_fields = ('vehicle__brand__name', 'vehicle__model__name', 'vehicle__company__name')
    ordering = ('-vehicle__created_at',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('brand', 'model', 'year', 'price', 'company')
        }),
        ('Характеристики', {
            'fields': ('transmission', 'fuel_type', 'engine_volume', 'mileage', 'color')
        }),
        ('Описание', {
            'fields': ('description', 'features')
        }),
        ('Статус', {
            'fields': ('is_available', 'rating')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_display(self, obj):
        if obj.is_available:
            return format_html('<span style="color: green;">✓ Доступен</span>')
        return format_html('<span style="color: red;">✗ Недоступен</span>')
    status_display.short_description = 'Статус'


# @admin.register(Sale)  # Убрано - уже зарегистрировано в erp.admin
class UniversalSaleAdmin(admin.ModelAdmin):
    list_display = ('car', 'company', 'customer', 'sale_price', 'commission', 'total_amount_display', 'status', 'sale_date')
    list_filter = ('status', 'company', 'sale_date', 'created_at')
    search_fields = ('car__title', 'customer__username', 'notes')
    readonly_fields = ('total_amount_display', 'sale_date', 'created_at', 'updated_at')
    list_editable = ('status',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('car', 'company', 'customer', 'sale_price', 'commission')
        }),
        ('Дополнительно', {
            'fields': ('notes', 'status', 'sale_date')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_amount_display(self, obj):
        return f"{obj.total_amount} ₽"
    total_amount_display.short_description = 'Общая сумма'


# @admin.register(ProjectTask)  # Убрано - уже зарегистрировано в erp.admin
class UniversalProjectTaskAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'column', 'assignee', 'priority', 'due_date', 'is_overdue_display', 
        'labels_display', 'is_archived'
    ]
    list_filter = ['priority', 'column__board', 'assignee', 'is_archived', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_by', 'created_at', 'updated_at', 'is_overdue_display']
    list_editable = ['priority', 'is_archived']
    filter_horizontal = ['labels']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'column', 'assignee', 'priority', 'due_date')
        }),
        ('Связи с ERP', {
            'fields': ('related_sale', 'related_service_order', 'related_car', 'related_customer'),
            'classes': ('collapse',)
        }),
        ('Дополнительно', {
            'fields': ('labels', 'is_archived', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_overdue_display(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red;">Просрочена</span>')
        return format_html('<span style="color: green;">В срок</span>')
    is_overdue_display.short_description = 'Статус'
    
    def labels_display(self, obj):
        labels = obj.labels.all()
        if labels:
            return format_html(
                ' '.join([
                    f'<span style="background-color: {label.color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">{label.name}</span>'
                    for label in labels
                ])
            )
        return '-'
    labels_display.short_description = 'Метки'


# Регистрируем модели в универсальной админке
universal_admin_site.register(User, UniversalUserAdmin)
universal_admin_site.register(Group, admin.ModelAdmin)
universal_admin_site.register(Company, UniversalCompanyAdmin)
universal_admin_site.register(Car, UniversalCarAdmin)
universal_admin_site.register(Brand, admin.ModelAdmin)
universal_admin_site.register(Review, admin.ModelAdmin)
universal_admin_site.register(Article, admin.ModelAdmin)
universal_admin_site.register(News, admin.ModelAdmin)
universal_admin_site.register(Category, admin.ModelAdmin)
universal_admin_site.register(Tag, admin.ModelAdmin)

# ERP модели
universal_admin_site.register(Inventory, admin.ModelAdmin)
universal_admin_site.register(Sale, UniversalSaleAdmin)
universal_admin_site.register(Service, admin.ModelAdmin)
universal_admin_site.register(ServiceOrder, admin.ModelAdmin)
universal_admin_site.register(ServiceOrderItem, admin.ModelAdmin)
universal_admin_site.register(Financial, admin.ModelAdmin)
universal_admin_site.register(ProjectBoard, admin.ModelAdmin)
universal_admin_site.register(ProjectColumn, admin.ModelAdmin)
universal_admin_site.register(ProjectTask, UniversalProjectTaskAdmin)
universal_admin_site.register(TaskLabel, admin.ModelAdmin)
universal_admin_site.register(TaskComment, admin.ModelAdmin)
universal_admin_site.register(TaskAttachment, admin.ModelAdmin)
universal_admin_site.register(TaskHistory, admin.ModelAdmin) 