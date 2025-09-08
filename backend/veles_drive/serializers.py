from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Brand, Company, Car, CarImage, Review, CompanySchedule, CompanyFeature,
    Category, Tag, Article, News, ContentImage, Subscription, ContentView, Comment, Reaction, ContentRating,
    YouTubeChannel, YouTubeVideo, YouTubePlaylist, YouTubePlaylistVideo,
    SEOMetadata, PageView, UserSession, SearchQuery, Conversion,
    ABTest, ABTestVariant, ABTestResult
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class CompanyScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySchedule
        fields = '__all__'

class CompanyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyFeature
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    schedule = CompanyScheduleSerializer(many=True, read_only=True)
    features = CompanyFeatureSerializer(many=True, read_only=True)
    cars_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = '__all__'

    def get_cars_count(self, obj):
        return obj.cars.count()

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = '__all__'

class CarSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        write_only=True,
        source='brand'
    )
    images = CarImageSerializer(many=True, read_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        write_only=True,
        source='company'
    )

    class Meta:
        model = Car
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    car = CarSerializer(read_only=True)
    car_id = serializers.PrimaryKeyRelatedField(
        queryset=Car.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='car'
    )
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='company'
    )

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user',)

    def validate(self, data):
        if not data.get('car') and not data.get('company'):
            raise serializers.ValidationError(
                "Необходимо указать либо автомобиль, либо компанию"
            )
        if data.get('car') and data.get('company'):
            raise serializers.ValidationError(
                "Нельзя указать и автомобиль, и компанию одновременно"
            )
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'created_at', 'updated_at']
        read_only_fields = ['slug']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'created_at']
        read_only_fields = ['slug']

class ContentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentImage
        fields = ['id', 'image', 'image_webp', 'caption', 'order', 'created_at']
        read_only_fields = ['image_webp']

class ContentBaseSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    featured_image = ContentImageSerializer(read_only=True)
    views_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    reactions_count = serializers.IntegerField(read_only=True)
    popularity_score = serializers.IntegerField(read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=1, read_only=True)

    class Meta:
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'author', 'category',
            'tags', 'status', 'featured_image', 'views_count', 'created_at',
            'updated_at', 'published_at', 'comments_count', 'reactions_count',
            'popularity_score', 'average_rating'
        ]
        read_only_fields = ['slug', 'views_count', 'published_at', 'comments_count',
                           'reactions_count', 'popularity_score', 'average_rating']

class ArticleSerializer(ContentBaseSerializer):
    class Meta(ContentBaseSerializer.Meta):
        model = Article
        fields = ContentBaseSerializer.Meta.fields + ['reading_time', 'is_featured']

class NewsSerializer(ContentBaseSerializer):
    class Meta(ContentBaseSerializer.Meta):
        model = News
        fields = ContentBaseSerializer.Meta.fields + ['source', 'source_url']

class SubscriptionSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'category', 'tags', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['user']

class ContentViewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ContentView
        fields = ['id', 'content_type', 'object_id', 'user', 'ip_address', 'viewed_at']
        read_only_fields = ['ip_address', 'viewed_at']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    content_type = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'parent', 'replies', 'is_approved', 
                 'created_at', 'updated_at', 'content_type', 'object_id']
        read_only_fields = ['user', 'is_approved']

    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = Comment.objects.filter(parent=obj)
            return CommentSerializer(replies, many=True).data
        return []

    def get_content_type(self, obj):
        return f"{obj.content_type.app_label}.{obj.content_type.model}"

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    content_type = serializers.SerializerMethodField()

    class Meta:
        model = Reaction
        fields = ['id', 'user', 'reaction_type', 'created_at', 
                 'content_type', 'object_id']
        read_only_fields = ['user']

    def get_content_type(self, obj):
        return f"{obj.content_type.app_label}.{obj.content_type.model}"

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ContentRatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    content_type = serializers.SerializerMethodField()

    class Meta:
        model = ContentRating
        fields = ['id', 'user', 'rating', 'created_at', 'updated_at',
                 'content_type', 'object_id']
        read_only_fields = ['user']

    def get_content_type(self, obj):
        return f"{obj.content_type.app_label}.{obj.content_type.model}"

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class YouTubeChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = YouTubeChannel
        fields = ['id', 'channel_id', 'title', 'description', 'thumbnail_url',
                 'subscriber_count', 'video_count', 'view_count', 'is_active',
                 'created_at', 'updated_at']
        read_only_fields = ['subscriber_count', 'video_count', 'view_count']

class YouTubeVideoSerializer(serializers.ModelSerializer):
    channel = YouTubeChannelSerializer(read_only=True)

    class Meta:
        model = YouTubeVideo
        fields = ['id', 'video_id', 'channel', 'title', 'description',
                 'thumbnail_url', 'published_at', 'duration', 'view_count',
                 'like_count', 'comment_count', 'is_featured', 'created_at',
                 'updated_at']
        read_only_fields = ['view_count', 'like_count', 'comment_count']

class YouTubePlaylistSerializer(serializers.ModelSerializer):
    channel = YouTubeChannelSerializer(read_only=True)
    videos = serializers.SerializerMethodField()

    class Meta:
        model = YouTubePlaylist
        fields = ['id', 'playlist_id', 'channel', 'title', 'description',
                 'thumbnail_url', 'video_count', 'is_active', 'videos',
                 'created_at', 'updated_at']
        read_only_fields = ['video_count']

    def get_videos(self, obj):
        videos = YouTubeVideo.objects.filter(
            playlists__playlist=obj
        ).order_by('playlists__position')
        return YouTubeVideoSerializer(videos, many=True).data 

class SEOMetadataSerializer(serializers.ModelSerializer):
    content_type = serializers.SerializerMethodField()

    class Meta:
        model = SEOMetadata
        fields = ['id', 'content_type', 'object_id', 'title', 'description',
                 'keywords', 'og_title', 'og_description', 'og_image',
                 'canonical_url', 'robots_meta', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_content_type(self, obj):
        return f"{obj.content_type.app_label}.{obj.content_type.model}"

class PageViewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PageView
        fields = ['id', 'path', 'user', 'ip_address', 'user_agent',
                 'referrer', 'session_id', 'timestamp', 'duration', 'is_bounce']
        read_only_fields = ['timestamp']

class UserSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserSession
        fields = ['id', 'user', 'session_id', 'ip_address', 'user_agent',
                 'start_time', 'end_time', 'pages_visited', 'total_duration',
                 'is_bounce']
        read_only_fields = ['start_time', 'end_time']

class SearchQuerySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SearchQuery
        fields = ['id', 'query', 'user', 'ip_address', 'timestamp',
                 'results_count', 'is_successful']
        read_only_fields = ['timestamp']

class ConversionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Conversion
        fields = ['id', 'conversion_type', 'user', 'ip_address', 'timestamp',
                 'value', 'source', 'campaign', 'metadata']
        read_only_fields = ['timestamp']

class ABTestVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABTestVariant
        fields = ['id', 'test', 'name', 'description', 'weight', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ABTestSerializer(serializers.ModelSerializer):
    variants = ABTestVariantSerializer(many=True, read_only=True)

    class Meta:
        model = ABTest
        fields = ['id', 'name', 'description', 'start_date', 'end_date', 'is_active', 'variants', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ABTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABTestResult
        fields = ['id', 'test', 'variant', 'user', 'session_id', 'conversion_type', 'conversion_value', 'created_at']
        read_only_fields = ['created_at'] 