from django.contrib import admin
from .models import Notification, ModerationLog, ModerationStatus

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    ordering = ('-created_at',)

@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'object_id', 'action', 'moderator', 'created_at')
    list_filter = ('action', 'created_at', 'moderator')
    search_fields = ('content_type__model', 'object_id', 'moderator__username')
    ordering = ('-created_at',)

@admin.register(ModerationStatus)
class ModerationStatusAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'object_id', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('content_type__model', 'object_id')
    ordering = ('-created_at',) 