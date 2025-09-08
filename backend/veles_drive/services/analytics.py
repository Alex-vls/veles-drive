from django.db.models import Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta
from ..models import PageView, UserSession, SearchQuery, Conversion

class AnalyticsService:
    @staticmethod
    def get_page_views_stats(days=30):
        """Get page views statistics for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        return PageView.objects.filter(
            timestamp__range=(start_date, end_date)
        ).values('path').annotate(
            views=Count('id'),
            unique_users=Count('user', distinct=True),
            avg_duration=Avg('duration'),
            bounce_rate=Avg('is_bounce') * 100
        ).order_by('-views')

    @staticmethod
    def get_user_sessions_stats(days=30):
        """Get user sessions statistics for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        return UserSession.objects.filter(
            start_time__range=(start_date, end_date)
        ).aggregate(
            total_sessions=Count('id'),
            unique_users=Count('user', distinct=True),
            avg_pages_per_session=Avg('pages_visited'),
            avg_session_duration=Avg('total_duration'),
            bounce_rate=Avg('is_bounce') * 100
        )

    @staticmethod
    def get_search_stats(days=30):
        """Get search statistics for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        return SearchQuery.objects.filter(
            timestamp__range=(start_date, end_date)
        ).aggregate(
            total_searches=Count('id'),
            unique_users=Count('user', distinct=True),
            avg_results=Avg('results_count'),
            success_rate=Avg('is_successful') * 100
        )

    @staticmethod
    def get_conversion_stats(days=30):
        """Get conversion statistics for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        return Conversion.objects.filter(
            timestamp__range=(start_date, end_date)
        ).values('conversion_type').annotate(
            count=Count('id'),
            total_value=Sum('value'),
            unique_users=Count('user', distinct=True)
        ).order_by('-count')

    @staticmethod
    def get_traffic_sources(days=30):
        """Get traffic sources statistics for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        return PageView.objects.filter(
            timestamp__range=(start_date, end_date)
        ).exclude(
            referrer=''
        ).values('referrer').annotate(
            visits=Count('id'),
            unique_users=Count('user', distinct=True)
        ).order_by('-visits')

    @staticmethod
    def get_user_behavior(days=30):
        """Get user behavior statistics for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        return {
            'page_views': PageView.objects.filter(
                timestamp__range=(start_date, end_date)
            ).count(),
            'sessions': UserSession.objects.filter(
                start_time__range=(start_date, end_date)
            ).count(),
            'searches': SearchQuery.objects.filter(
                timestamp__range=(start_date, end_date)
            ).count(),
            'conversions': Conversion.objects.filter(
                timestamp__range=(start_date, end_date)
            ).count()
        }

    @staticmethod
    def get_popular_content(days=30, limit=10):
        """Get most popular content for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        return PageView.objects.filter(
            timestamp__range=(start_date, end_date)
        ).values('path').annotate(
            views=Count('id'),
            avg_duration=Avg('duration')
        ).order_by('-views')[:limit]

    @staticmethod
    def get_user_retention(days=30):
        """Get user retention statistics for the last N days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        return UserSession.objects.filter(
            start_time__range=(start_date, end_date)
        ).values('user').annotate(
            sessions=Count('id'),
            total_duration=Sum('total_duration'),
            pages_visited=Sum('pages_visited')
        ).order_by('-sessions') 