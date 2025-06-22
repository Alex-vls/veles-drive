from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from .models import (
    Brand, Company, Car, CarImage, Review, CompanySchedule, CompanyFeature,
    Category, Tag, Article, News, ContentImage, Subscription, ContentView,
    Comment, Reaction, ContentRating, YouTubeChannel, YouTubeVideo, YouTubePlaylist, YouTubePlaylistVideo,
    SEOMetadata, PageView, UserSession, SearchQuery, Conversion, ABTest, ABTestVariant, ABTestResult
)
from .serializers import (
    BrandSerializer, CompanySerializer, CarSerializer,
    CarImageSerializer, ReviewSerializer, CompanyScheduleSerializer,
    CompanyFeatureSerializer, CategorySerializer, TagSerializer,
    ArticleSerializer, NewsSerializer, ContentImageSerializer,
    SubscriptionSerializer, ContentViewSerializer,
    CommentSerializer, ReactionSerializer, ContentRatingSerializer,
    YouTubeChannelSerializer, YouTubeVideoSerializer, YouTubePlaylistSerializer,
    SEOMetadataSerializer, ABTestSerializer, ABTestVariantSerializer, ABTestResultSerializer
)
from .permissions import IsOwnerOrReadOnly, IsCompanyOwnerOrReadOnly, IsAdminUser
from .tasks import send_welcome_email, process_image, send_review_notification
from .services.youtube import YouTubeService
from .services.analytics import AnalyticsService
from .services.seo import RobotsTxtService
from .services.ab_testing import ABTestingService
from django.http import HttpResponse

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Company.objects.all()
        city = self.request.query_params.get('city', None)
        is_verified = self.request.query_params.get('is_verified', None)
        rating = self.request.query_params.get('rating', None)

        if city:
            queryset = queryset.filter(city__iexact=city)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        if rating:
            queryset = queryset.filter(rating__gte=float(rating))

        return queryset

    @action(detail=True, methods=['post'])
    def add_schedule(self, request, pk=None):
        company = self.get_object()
        serializer = CompanyScheduleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_feature(self, request, pk=None):
        company = self.get_object()
        serializer = CompanyFeatureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Car.objects.all()
        brand = self.request.query_params.get('brand', None)
        model = self.request.query_params.get('model', None)
        year_min = self.request.query_params.get('year_min', None)
        year_max = self.request.query_params.get('year_max', None)
        price_min = self.request.query_params.get('price_min', None)
        price_max = self.request.query_params.get('price_max', None)
        transmission = self.request.query_params.get('transmission', None)
        fuel_type = self.request.query_params.get('fuel_type', None)
        company = self.request.query_params.get('company', None)

        if brand:
            queryset = queryset.filter(brand__name__iexact=brand)
        if model:
            queryset = queryset.filter(model__icontains=model)
        if year_min:
            queryset = queryset.filter(year__gte=year_min)
        if year_max:
            queryset = queryset.filter(year__lte=year_max)
        if price_min:
            queryset = queryset.filter(price__gte=price_min)
        if price_max:
            queryset = queryset.filter(price__lte=price_max)
        if transmission:
            queryset = queryset.filter(transmission=transmission)
        if fuel_type:
            queryset = queryset.filter(fuel_type=fuel_type)
        if company:
            queryset = queryset.filter(company_id=company)

        return queryset

    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        car = self.get_object()
        serializer = CarImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(car=car)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.all()
        car = self.request.query_params.get('car', None)
        company = self.request.query_params.get('company', None)
        user = self.request.query_params.get('user', None)

        if car:
            queryset = queryset.filter(car_id=car)
        if company:
            queryset = queryset.filter(company_id=company)
        if user:
            queryset = queryset.filter(user_id=user)

        return queryset

    def perform_create(self, serializer):
        review = serializer.save()
        if review.car:
            # Обновляем рейтинг автомобиля
            avg_rating = Review.objects.filter(car=review.car).aggregate(Avg('rating'))['rating__avg']
            review.car.rating = round(avg_rating, 1) if avg_rating else 0
            review.car.save()
        elif review.company:
            # Обновляем рейтинг компании
            avg_rating = Review.objects.filter(company=review.company).aggregate(Avg('rating'))['rating__avg']
            review.company.rating = round(avg_rating, 1) if avg_rating else 0
            review.company.save()

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']

class ContentImageViewSet(viewsets.ModelViewSet):
    queryset = ContentImage.objects.all()
    serializer_class = ContentImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['content_type', 'object_id']

    def perform_create(self, serializer):
        instance = serializer.save()
        if instance.image:
            process_image.delay(instance.image.path)

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.filter(status='published')
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'author', 'is_featured']
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['created_at', 'updated_at', 'published_at', 'views_count']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Article.objects.all()
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        article = self.get_object()
        ContentView.objects.create(
            content_type=ContentType.objects.get_for_model(article),
            object_id=article.id,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        article.views_count += 1
        article.save()
        return Response({'status': 'views incremented'})

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        article = self.get_object()
        comments = Comment.objects.filter(
            content_type=ContentType.objects.get_for_model(article),
            object_id=article.id,
            parent=None
        )
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def reactions(self, request, pk=None):
        article = self.get_object()
        reactions = Reaction.objects.filter(
            content_type=ContentType.objects.get_for_model(article),
            object_id=article.id
        )
        serializer = ReactionSerializer(reactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ratings(self, request, pk=None):
        article = self.get_object()
        ratings = ContentRating.objects.filter(
            content_type=ContentType.objects.get_for_model(article),
            object_id=article.id
        )
        serializer = ContentRatingSerializer(ratings, many=True)
        return Response(serializer.data)

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.filter(status='published')
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'author']
    search_fields = ['title', 'content', 'excerpt', 'source']
    ordering_fields = ['created_at', 'updated_at', 'published_at', 'views_count']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return News.objects.all()
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        news = self.get_object()
        ContentView.objects.create(
            content_type=ContentType.objects.get_for_model(news),
            object_id=news.id,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        news.views_count += 1
        news.save()
        return Response({'status': 'views incremented'})

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        news = self.get_object()
        comments = Comment.objects.filter(
            content_type=ContentType.objects.get_for_model(news),
            object_id=news.id,
            parent=None
        )
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def reactions(self, request, pk=None):
        news = self.get_object()
        reactions = Reaction.objects.filter(
            content_type=ContentType.objects.get_for_model(news),
            object_id=news.id
        )
        serializer = ReactionSerializer(reactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ratings(self, request, pk=None):
        news = self.get_object()
        ratings = ContentRating.objects.filter(
            content_type=ContentType.objects.get_for_model(news),
            object_id=news.id
        )
        serializer = ContentRatingSerializer(ratings, many=True)
        return Response(serializer.data)

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        subscription = self.get_object()
        subscription.is_active = not subscription.is_active
        subscription.save()
        return Response({'status': 'subscription toggled'})

class ContentViewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContentView.objects.all()
    serializer_class = ContentViewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['content_type', 'object_id', 'user']
    ordering_fields = ['viewed_at']

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        content_type = self.request.query_params.get('content_type', None)
        object_id = self.request.query_params.get('object_id', None)
        
        queryset = Comment.objects.filter(parent=None)  # Only get top-level comments
        
        if content_type and object_id:
            try:
                content_type = ContentType.objects.get(model=content_type)
                queryset = queryset.filter(content_type=content_type, object_id=object_id)
            except ContentType.DoesNotExist:
                return Comment.objects.none()
                
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ReactionViewSet(viewsets.ModelViewSet):
    serializer_class = ReactionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        content_type = self.request.query_params.get('content_type', None)
        object_id = self.request.query_params.get('object_id', None)
        user = self.request.query_params.get('user', None)
        
        queryset = Reaction.objects.all()
        
        if content_type and object_id:
            try:
                content_type = ContentType.objects.get(model=content_type)
                queryset = queryset.filter(content_type=content_type, object_id=object_id)
            except ContentType.DoesNotExist:
                return Reaction.objects.none()
                
        if user:
            queryset = queryset.filter(user_id=user)
            
        return queryset

    def perform_create(self, serializer):
        # Check if user already reacted
        existing_reaction = Reaction.objects.filter(
            content_type=serializer.validated_data['content_type'],
            object_id=serializer.validated_data['object_id'],
            user=self.request.user
        ).first()
        
        if existing_reaction:
            # Update existing reaction
            existing_reaction.reaction_type = serializer.validated_data['reaction_type']
            existing_reaction.save()
            return existing_reaction
            
        return serializer.save(user=self.request.user)

class ContentRatingViewSet(viewsets.ModelViewSet):
    serializer_class = ContentRatingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        content_type = self.request.query_params.get('content_type', None)
        object_id = self.request.query_params.get('object_id', None)
        user = self.request.query_params.get('user', None)
        
        queryset = ContentRating.objects.all()
        
        if content_type and object_id:
            try:
                content_type = ContentType.objects.get(model=content_type)
                queryset = queryset.filter(content_type=content_type, object_id=object_id)
            except ContentType.DoesNotExist:
                return ContentRating.objects.none()
                
        if user:
            queryset = queryset.filter(user_id=user)
            
        return queryset

    def perform_create(self, serializer):
        # Check if user already rated
        existing_rating = ContentRating.objects.filter(
            content_type=serializer.validated_data['content_type'],
            object_id=serializer.validated_data['object_id'],
            user=self.request.user
        ).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = serializer.validated_data['rating']
            existing_rating.save()
            return existing_rating
            
        return serializer.save(user=self.request.user)

class YouTubeChannelViewSet(viewsets.ModelViewSet):
    queryset = YouTubeChannel.objects.all()
    serializer_class = YouTubeChannelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['subscriber_count', 'video_count', 'view_count', 'created_at']

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sync channel data from YouTube"""
        channel = self.get_object()
        youtube = YouTubeService()
        channel_data = youtube.get_channel_details(channel.channel_id)
        
        if channel_data:
            serializer = self.get_serializer(channel, data=channel_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        return Response({'error': 'Failed to sync channel data'}, status=400)

    @action(detail=True, methods=['post'])
    def sync_videos(self, request, pk=None):
        """Sync channel videos from YouTube"""
        channel = self.get_object()
        youtube = YouTubeService()
        videos = youtube.get_channel_videos(channel.channel_id)
        
        for video_data in videos:
            video, created = YouTubeVideo.objects.update_or_create(
                video_id=video_data['id'],
                defaults={
                    'channel': channel,
                    'title': video_data['title'],
                    'description': video_data['description'],
                    'thumbnail_url': video_data['thumbnail_url'],
                    'published_at': video_data['published_at'],
                    'duration': video_data['duration'],
                    'view_count': video_data['view_count'],
                    'like_count': video_data['like_count'],
                    'comment_count': video_data['comment_count']
                }
            )
        
        return Response({'message': f'Synced {len(videos)} videos'})

class YouTubeVideoViewSet(viewsets.ModelViewSet):
    queryset = YouTubeVideo.objects.all()
    serializer_class = YouTubeVideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['published_at', 'view_count', 'like_count', 'comment_count']

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sync video data from YouTube"""
        video = self.get_object()
        youtube = YouTubeService()
        video_data = youtube.get_video_details(video.video_id)
        
        if video_data:
            serializer = self.get_serializer(video, data=video_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        return Response({'error': 'Failed to sync video data'}, status=400)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get video comments from YouTube"""
        video = self.get_object()
        youtube = YouTubeService()
        comments = youtube.get_video_comments(video.video_id)
        return Response(comments)

class YouTubePlaylistViewSet(viewsets.ModelViewSet):
    queryset = YouTubePlaylist.objects.all()
    serializer_class = YouTubePlaylistSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['video_count', 'created_at']

    @action(detail=True, methods=['post'])
    def sync_videos(self, request, pk=None):
        """Sync playlist videos from YouTube"""
        playlist = self.get_object()
        youtube = YouTubeService()
        videos = youtube.get_playlist_videos(playlist.playlist_id)
        
        # Clear existing videos
        YouTubePlaylistVideo.objects.filter(playlist=playlist).delete()
        
        # Add new videos
        for position, video_data in enumerate(videos):
            video, created = YouTubeVideo.objects.update_or_create(
                video_id=video_data['id'],
                defaults={
                    'channel': playlist.channel,
                    'title': video_data['title'],
                    'description': video_data['description'],
                    'thumbnail_url': video_data['thumbnail_url'],
                    'published_at': video_data['published_at'],
                    'duration': video_data['duration'],
                    'view_count': video_data['view_count'],
                    'like_count': video_data['like_count'],
                    'comment_count': video_data['comment_count']
                }
            )
            YouTubePlaylistVideo.objects.create(
                playlist=playlist,
                video=video,
                position=position
            )
        
        return Response({'message': f'Synced {len(videos)} videos'})

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def page_views(self, request):
        """Get page views statistics"""
        days = int(request.query_params.get('days', 30))
        stats = AnalyticsService.get_page_views_stats(days)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def sessions(self, request):
        """Get user sessions statistics"""
        days = int(request.query_params.get('days', 30))
        stats = AnalyticsService.get_user_sessions_stats(days)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def searches(self, request):
        """Get search statistics"""
        days = int(request.query_params.get('days', 30))
        stats = AnalyticsService.get_search_stats(days)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def conversions(self, request):
        """Get conversion statistics"""
        days = int(request.query_params.get('days', 30))
        stats = AnalyticsService.get_conversion_stats(days)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def traffic_sources(self, request):
        """Get traffic sources statistics"""
        days = int(request.query_params.get('days', 30))
        stats = AnalyticsService.get_traffic_sources(days)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def user_behavior(self, request):
        """Get user behavior statistics"""
        days = int(request.query_params.get('days', 30))
        stats = AnalyticsService.get_user_behavior(days)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def popular_content(self, request):
        """Get most popular content"""
        days = int(request.query_params.get('days', 30))
        limit = int(request.query_params.get('limit', 10))
        stats = AnalyticsService.get_popular_content(days, limit)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def user_retention(self, request):
        """Get user retention statistics"""
        days = int(request.query_params.get('days', 30))
        stats = AnalyticsService.get_user_retention(days)
        return Response(stats)

class SEOMetadataViewSet(viewsets.ModelViewSet):
    queryset = SEOMetadata.objects.all()
    serializer_class = SEOMetadataSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'keywords']
    ordering_fields = ['created_at', 'updated_at']

    def get_queryset(self):
        queryset = SEOMetadata.objects.all()
        content_type = self.request.query_params.get('content_type', None)
        object_id = self.request.query_params.get('object_id', None)
        
        if content_type and object_id:
            queryset = queryset.filter(
                content_type__model=content_type,
                object_id=object_id
            )
            
        return queryset

def robots_txt(request):
    """Generate robots.txt content"""
    content = RobotsTxtService.generate_robots_txt()
    return HttpResponse(content, content_type='text/plain')

class ABTestViewSet(viewsets.ModelViewSet):
    queryset = ABTest.objects.all()
    serializer_class = ABTestSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        test = self.get_object()
        stats = ABTestingService.get_test_stats(test)
        return Response(stats)

    @action(detail=True, methods=['post'])
    def adjust_weights(self, request, pk=None):
        test = self.get_object()
        ABTestingService.adjust_variant_weights(test)
        return Response({'status': 'weights adjusted'})

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        test = self.get_object()
        test.is_active = True
        test.start_date = timezone.now()
        test.save()
        return Response({'status': 'test started'})

    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        test = self.get_object()
        test.is_active = False
        test.end_date = timezone.now()
        test.save()
        return Response({'status': 'test stopped'})

class ABTestVariantViewSet(viewsets.ModelViewSet):
    queryset = ABTestVariant.objects.all()
    serializer_class = ABTestVariantSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        variant = self.get_object()
        results = ABTestResult.objects.filter(variant=variant)
        views = results.count()
        conversions = results.filter(conversion_value__gt=0).count()
        conversion_rate = (conversions / views * 100) if views > 0 else 0

        return Response({
            'views': views,
            'conversions': conversions,
            'conversion_rate': conversion_rate,
            'weight': variant.weight
        })

class ABTestResultViewSet(viewsets.ModelViewSet):
    queryset = ABTestResult.objects.all()
    serializer_class = ABTestResultSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def record_conversion(self, request, pk=None):
        result = self.get_object()
        conversion_type = request.data.get('conversion_type')
        conversion_value = float(request.data.get('conversion_value', 1.0))

        ABTestingService.record_conversion(result, conversion_type, conversion_value)
        return Response({'status': 'conversion recorded'}) 