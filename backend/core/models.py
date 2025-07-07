from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

class News(models.Model):
    """Модель новостей"""
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='news/', null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='news')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('News')
        verbose_name_plural = _('News')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Создаем запись в логе модерации при создании новости
            ModerationLog.objects.create(
                content_type=ContentType.objects.get_for_model(self),
                object_id=self.id,
                status=ModerationStatus.PENDING
            )

class Article(models.Model):
    """Модель статей для блога"""
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='articles/', null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('Article')
        verbose_name_plural = _('Articles')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Создаем запись в логе модерации при создании статьи
            ModerationLog.objects.create(
                content_type=ContentType.objects.get_for_model(self),
                object_id=self.id,
                status=ModerationStatus.PENDING
            )

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])

class ModerationStatus(models.TextChoices):
    PENDING = 'pending', 'На модерации'
    APPROVED = 'approved', 'Одобрено'
    REJECTED = 'rejected', 'Отклонено'

class ModerationLog(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='moderation_actions')
    status = models.CharField(max_length=20, choices=ModerationStatus.choices, default=ModerationStatus.PENDING)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.content_type.model} #{self.object_id} - {self.status}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            old_status = ModerationLog.objects.get(pk=self.pk).status

        super().save(*args, **kwargs)

        # Обновляем статус публикации контента при изменении статуса модерации
        if not is_new and old_status != self.status:
            content_object = self.content_object
            if hasattr(content_object, 'is_published'):
                content_object.is_published = self.status == ModerationStatus.APPROVED
                content_object.save(update_fields=['is_published'])

class PageView(models.Model):
    """Модель для отслеживания просмотров страниц"""
    path = models.CharField(_('path'), max_length=255)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='page_views')
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.TextField(_('user agent'), blank=True)
    referrer = models.CharField(_('referrer'), max_length=255, blank=True)
    session_id = models.CharField(_('session id'), max_length=100, blank=True)
    timestamp = models.DateTimeField(_('timestamp'), auto_now_add=True)
    duration = models.PositiveIntegerField(_('duration'), default=0, help_text='Duration in seconds')
    is_bounce = models.BooleanField(_('is bounce'), default=False)

    class Meta:
        verbose_name = _('Page View')
        verbose_name_plural = _('Page Views')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['path']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['user']),
            models.Index(fields=['ip_address']),
        ]

    def __str__(self):
        return f"{self.path} - {self.timestamp}" 