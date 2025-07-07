from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.db.models import Avg

User = get_user_model()

class Brand(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, null=True, blank=True)
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE, null=True, blank=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.car:
            return f"Review for {self.car} by {self.user.username}"
        return f"Review for {self.company} by {self.user.username}"

    class Meta:
        ordering = ['-created_at']

class Category(models.Model):
    """Category for articles and news"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

class Tag(models.Model):
    """Tag for articles and news"""
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['name']

class ContentBase(models.Model):
    """Base model for articles and news"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(Tag, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    featured_image = models.ImageField(upload_to='content/', null=True, blank=True)
    featured_image_webp = models.ImageField(upload_to='content/webp/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    popularity_score = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    comments_count = models.PositiveIntegerField(default=0)
    reactions_count = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True
        ordering = ['-published_at', '-created_at']

    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def update_counts(self):
        """Update comment and reaction counts"""
        content_type = ContentType.objects.get_for_model(self)
        self.comments_count = Comment.objects.filter(
            content_type=content_type,
            object_id=self.id,
            is_approved=True
        ).count()
        self.reactions_count = Reaction.objects.filter(
            content_type=content_type,
            object_id=self.id
        ).count()
        self.save(update_fields=['comments_count', 'reactions_count'])

class Article(ContentBase):
    """Article model"""
    reading_time = models.PositiveIntegerField(help_text='Estimated reading time in minutes')
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

class News(ContentBase):
    """News model"""
    source = models.CharField(max_length=200, blank=True)
    source_url = models.URLField(blank=True)
    views_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

class ContentImage(models.Model):
    """Image model for articles and news"""
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    image = models.ImageField(upload_to='content/')
    image_webp = models.ImageField(upload_to='content/webp/', null=True, blank=True)
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.content_object}"

    class Meta:
        ordering = ['order', 'created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

class Subscription(models.Model):
    """Subscription model for content"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.category:
            return f"{self.user.username} subscribed to {self.category.name}"
        return f"{self.user.username} subscribed to tags"

    class Meta:
        unique_together = ['user', 'category']

class ContentView(models.Model):
    """Model for tracking content views"""
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    viewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"View of {self.content_object} by {self.ip_address}"

    class Meta:
        ordering = ['-viewed_at']

class Comment(models.Model):
    """Comment model for articles and news"""
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    text = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.content_object}"

    class Meta:
        ordering = ['-created_at']

class Reaction(models.Model):
    """Reaction model for content (likes, etc.)"""
    REACTION_TYPES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
        ('love', 'Love'),
        ('laugh', 'Laugh'),
        ('wow', 'Wow'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
    ]

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reaction_type} by {self.user.username} on {self.content_object}"

    class Meta:
        unique_together = ['content_type', 'object_id', 'user']
        ordering = ['-created_at']

class ContentRating(models.Model):
    """Rating model for content"""
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Rating {self.rating} by {self.user.username} on {self.content_object}"

    class Meta:
        unique_together = ['content_type', 'object_id', 'user']
        ordering = ['-created_at']

class YouTubeChannel(models.Model):
    """YouTube channel model"""
    channel_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    thumbnail_url = models.URLField()
    subscriber_count = models.PositiveIntegerField(default=0)
    video_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-subscriber_count']

class YouTubeVideo(models.Model):
    """YouTube video model"""
    video_id = models.CharField(max_length=100, unique=True)
    channel = models.ForeignKey(YouTubeChannel, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    thumbnail_url = models.URLField()
    published_at = models.DateTimeField()
    duration = models.CharField(max_length=20)  # ISO 8601 duration format
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-published_at']

class YouTubePlaylist(models.Model):
    """YouTube playlist model"""
    playlist_id = models.CharField(max_length=100, unique=True)
    channel = models.ForeignKey(YouTubeChannel, on_delete=models.CASCADE, related_name='playlists')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    thumbnail_url = models.URLField()
    video_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class YouTubePlaylistVideo(models.Model):
    """YouTube playlist video model"""
    playlist = models.ForeignKey(YouTubePlaylist, on_delete=models.CASCADE, related_name='videos')
    video = models.ForeignKey(YouTubeVideo, on_delete=models.CASCADE, related_name='playlists')
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.video.title} in {self.playlist.title}"

    class Meta:
        ordering = ['position']
        unique_together = ['playlist', 'video']

class SEOMetadata(models.Model):
    """SEO metadata for content"""
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    title = models.CharField(max_length=200)
    description = models.TextField()
    keywords = models.CharField(max_length=500)
    og_title = models.CharField(max_length=200, blank=True)
    og_description = models.TextField(blank=True)
    og_image = models.URLField(blank=True)
    canonical_url = models.URLField(blank=True)
    robots_meta = models.CharField(max_length=100, default='index,follow')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SEO for {self.content_object}"

    class Meta:
        unique_together = ['content_type', 'object_id']

class PageView(models.Model):
    """Page view analytics"""
    path = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    referrer = models.URLField(blank=True)
    session_id = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    duration = models.PositiveIntegerField(default=0)  # Time spent on page in seconds
    is_bounce = models.BooleanField(default=False)

    def __str__(self):
        return f"Page view: {self.path} by {self.ip_address}"

    class Meta:
        ordering = ['-timestamp']

class UserSession(models.Model):
    """User session analytics"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    pages_visited = models.PositiveIntegerField(default=0)
    total_duration = models.PositiveIntegerField(default=0)  # Total session duration in seconds
    is_bounce = models.BooleanField(default=True)

    def __str__(self):
        return f"Session {self.session_id} by {self.ip_address}"

    class Meta:
        ordering = ['-start_time']

class SearchQuery(models.Model):
    """Search query analytics"""
    query = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    results_count = models.PositiveIntegerField(default=0)
    is_successful = models.BooleanField(default=True)  # Whether user clicked on any result

    def __str__(self):
        return f"Search: {self.query} by {self.ip_address}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Search queries'

class Conversion(models.Model):
    """Conversion tracking"""
    CONVERSION_TYPES = [
        ('signup', 'User Signup'),
        ('purchase', 'Purchase'),
        ('contact', 'Contact Form'),
        ('review', 'Review Submission'),
        ('subscription', 'Newsletter Subscription'),
    ]

    conversion_type = models.CharField(max_length=20, choices=CONVERSION_TYPES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    source = models.CharField(max_length=100, blank=True)  # Traffic source
    campaign = models.CharField(max_length=100, blank=True)  # Marketing campaign
    metadata = models.JSONField(default=dict)  # Additional conversion data

    def __str__(self):
        return f"{self.conversion_type} by {self.ip_address}"

    class Meta:
        ordering = ['-timestamp']

class ABTest(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ABTestVariant(models.Model):
    test = models.ForeignKey(ABTest, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    weight = models.IntegerField(default=50)  # Weight for traffic distribution
    content = models.JSONField()  # Store variant-specific content
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.test.name} - {self.name}"

class ABTestResult(models.Model):
    test = models.ForeignKey(ABTest, on_delete=models.CASCADE, related_name='results')
    variant = models.ForeignKey(ABTestVariant, on_delete=models.CASCADE, related_name='results')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=255)
    conversion_type = models.CharField(max_length=255)
    conversion_value = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.test.name} - {self.variant.name} - {self.conversion_type}"

    class Meta:
        unique_together = ('test', 'variant', 'user', 'session_id', 'conversion_type') 