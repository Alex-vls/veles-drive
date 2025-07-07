from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

# Импорты моделей
from veles_auto.models import (
    User, Company, Car, Sale, Article, News, PageView
)

from erp.models import (
    Sale as ERPSale, ProjectTask, ProjectBoard
)


@receiver([post_save, post_delete], sender=User)
def invalidate_user_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики пользователей"""
    cache_keys = [
        'user_stats_total',
        'user_stats_growth',
        'user_stats_active',
        'recent_activities'
    ]
    for key in cache_keys:
        cache.delete(key)


@receiver([post_save, post_delete], sender=Company)
def invalidate_company_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики компаний"""
    cache_keys = [
        'company_stats_total',
        'company_stats_verified',
        'company_stats_growth',
        'top_companies_revenue',
        'recent_activities'
    ]
    for key in cache_keys:
        cache.delete(key)


@receiver([post_save, post_delete], sender=Car)
def invalidate_car_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики автомобилей"""
    cache_keys = [
        'car_stats_total',
        'car_stats_available',
        'car_stats_growth',
        'top_cars_views',
        'recent_activities'
    ]
    for key in cache_keys:
        cache.delete(key)


@receiver([post_save, post_delete], sender=ERPSale)
def invalidate_sale_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики продаж"""
    cache_keys = [
        'sale_stats_total',
        'sale_stats_revenue',
        'sale_stats_growth',
        'sales_chart_data',
        'revenue_chart_data',
        'recent_activities'
    ]
    for key in cache_keys:
        cache.delete(key)


@receiver([post_save, post_delete], sender=ProjectTask)
def invalidate_project_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики проектов"""
    cache_keys = [
        'project_stats_total',
        'project_stats_tasks',
        'project_stats_completed',
        'recent_activities'
    ]
    for key in cache_keys:
        cache.delete(key)


@receiver([post_save, post_delete], sender=ProjectBoard)
def invalidate_board_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики досок проектов"""
    cache_keys = [
        'project_stats_total',
        'project_stats_active',
        'recent_activities'
    ]
    for key in cache_keys:
        cache.delete(key)


@receiver([post_save, post_delete], sender=Article)
def invalidate_content_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики контента"""
    cache_keys = [
        'content_stats_articles',
        'content_stats_published',
        'recent_activities'
    ]
    for key in cache_keys:
        cache.delete(key)


@receiver([post_save, post_delete], sender=News)
def invalidate_news_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики новостей"""
    cache_keys = [
        'content_stats_news',
        'content_stats_published_news',
        'recent_activities'
    ]
    for key in cache_keys:
        cache.delete(key)


@receiver([post_save, post_delete], sender=PageView)
def invalidate_pageview_stats(sender, instance, **kwargs):
    """Инвалидация кэша статистики просмотров"""
    cache_keys = [
        'pageview_stats_total',
        'pageview_stats_growth',
        'pageviews_chart_data',
        'top_cars_views'
    ]
    for key in cache_keys:
        cache.delete(key)


def get_cached_stats(period_days=30):
    """Получение кэшированной статистики"""
    cache_key = f'analytics_stats_{period_days}'
    stats = cache.get(cache_key)
    
    if stats is None:
        # Если кэш пустой, вычисляем статистику
        from .views import get_analytics_stats
        end_date = timezone.now()
        start_date = end_date - timedelta(days=period_days)
        stats = get_analytics_stats(start_date, end_date)
        
        # Кэшируем на 5 минут
        cache.set(cache_key, stats, 300)
    
    return stats


def get_cached_charts(period_days=30):
    """Получение кэшированных данных графиков"""
    cache_key = f'analytics_charts_{period_days}'
    charts = cache.get(cache_key)
    
    if charts is None:
        # Если кэш пустой, вычисляем данные графиков
        from .views import get_analytics_charts
        end_date = timezone.now()
        start_date = end_date - timedelta(days=period_days)
        charts = get_analytics_charts(start_date, end_date)
        
        # Кэшируем на 5 минут
        cache.set(cache_key, charts, 300)
    
    return charts


def get_cached_recent_activities():
    """Получение кэшированных последних активностей"""
    cache_key = 'recent_activities'
    activities = cache.get(cache_key)
    
    if activities is None:
        # Если кэш пустой, получаем последние активности
        from .views import get_recent_activities
        activities = get_recent_activities()
        
        # Кэшируем на 2 минуты
        cache.set(cache_key, activities, 120)
    
    return activities


def clear_all_analytics_cache():
    """Очистка всего кэша аналитики"""
    cache_keys = [
        'analytics_stats_7',
        'analytics_stats_30',
        'analytics_stats_90',
        'analytics_stats_365',
        'analytics_charts_7',
        'analytics_charts_30',
        'analytics_charts_90',
        'analytics_charts_365',
        'recent_activities',
        'top_companies_revenue',
        'top_cars_views',
        'user_stats_total',
        'user_stats_growth',
        'user_stats_active',
        'company_stats_total',
        'company_stats_verified',
        'company_stats_growth',
        'car_stats_total',
        'car_stats_available',
        'car_stats_growth',
        'sale_stats_total',
        'sale_stats_revenue',
        'sale_stats_growth',
        'sales_chart_data',
        'revenue_chart_data',
        'project_stats_total',
        'project_stats_tasks',
        'project_stats_completed',
        'project_stats_active',
        'content_stats_articles',
        'content_stats_published',
        'content_stats_news',
        'content_stats_published_news',
        'pageview_stats_total',
        'pageview_stats_growth',
        'pageviews_chart_data'
    ]
    
    for key in cache_keys:
        cache.delete(key) 