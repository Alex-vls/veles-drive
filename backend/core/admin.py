from django.contrib import admin
from .models import Notification, ModerationLog

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    ordering = ('-created_at',)

@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'object_id', 'status', 'moderator', 'created_at')
    list_filter = ('status', 'created_at', 'moderator')
    search_fields = ('content_type__model', 'object_id', 'moderator__username')
    ordering = ('-created_at',)

# ModerationStatus - это TextChoices, а не модель, поэтому не регистрируем в админке 