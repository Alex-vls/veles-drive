from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    TelegramUser, TelegramChat, TelegramMessage, TelegramNotification,
    TelegramBotSettings, TelegramMiniAppSession, TelegramCommand,
    TelegramInlineKeyboard, TelegramUserState
)


@admin.register(TelegramUser)
class TelegramUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'telegram_id', 'username', 'first_name', 'last_name', 'is_active', 'created_at')
    list_filter = ('is_active', 'language_code', 'created_at')
    search_fields = ('user__username', 'user__email', 'telegram_id', 'username', 'first_name', 'last_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'telegram_id', 'username', 'first_name', 'last_name', 'language_code')
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TelegramChat)
class TelegramChatAdmin(admin.ModelAdmin):
    list_display = ('chat_id', 'chat_type', 'title', 'username', 'is_active', 'created_at')
    list_filter = ('chat_type', 'is_active', 'created_at')
    search_fields = ('chat_id', 'title', 'username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('chat_id', 'chat_type', 'title', 'username')
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TelegramMessage)
class TelegramMessageAdmin(admin.ModelAdmin):
    list_display = ('message_id', 'chat', 'from_user', 'message_type', 'text_preview', 'created_at')
    list_filter = ('message_type', 'created_at', 'chat__chat_type')
    search_fields = ('text', 'from_user__user__username', 'chat__title')
    readonly_fields = ('message_id', 'chat', 'from_user', 'created_at')
    ordering = ('-created_at',)
    
    def text_preview(self, obj):
        if obj.text:
            return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
        return '-'
    text_preview.short_description = 'Текст'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('message_id', 'chat', 'from_user', 'text', 'message_type')
        }),
        ('Связи', {
            'fields': ('reply_to_message',),
            'classes': ('collapse',)
        }),
        ('Системная информация', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(TelegramNotification)
class TelegramNotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'is_sent', 'created_at')
    list_filter = ('notification_type', 'is_sent', 'created_at')
    search_fields = ('title', 'message', 'user__user__username')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'notification_type', 'title', 'message')
        }),
        ('Дополнительные данные', {
            'fields': ('data',),
            'classes': ('collapse',)
        }),
        ('Статус отправки', {
            'fields': ('is_sent', 'sent_at')
        }),
        ('Системная информация', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['send_notifications', 'mark_as_sent']
    
    def send_notifications(self, request, queryset):
        from .services import TelegramNotificationService
        
        notification_service = TelegramNotificationService()
        sent_count = 0
        
        for notification in queryset.filter(is_sent=False):
            if notification_service.send_notification(notification):
                sent_count += 1
        
        self.message_user(request, f"Отправлено {sent_count} уведомлений из {queryset.count()}")
    
    def mark_as_sent(self, request, queryset):
        from django.utils import timezone
        
        updated = queryset.update(is_sent=True, sent_at=timezone.now())
        self.message_user(request, f"Отмечено как отправленные: {updated} уведомлений")
    
    send_notifications.short_description = "Отправить выбранные уведомления"
    mark_as_sent.short_description = "Отметить как отправленные"


@admin.register(TelegramBotSettings)
class TelegramBotSettingsAdmin(admin.ModelAdmin):
    list_display = ('bot_username', 'is_active', 'webhook_url', 'created_at')
    list_filter = ('is_active', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('bot_token', 'bot_username')
        }),
        ('Webhook', {
            'fields': ('webhook_url',)
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # При изменении настроек деактивируем другие боты
        if obj.is_active:
            TelegramBotSettings.objects.exclude(id=obj.id).update(is_active=False)
        super().save_model(request, obj, form, change)


@admin.register(TelegramMiniAppSession)
class TelegramMiniAppSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'session_id', 'is_active', 'created_at', 'last_activity')
    list_filter = ('is_active', 'created_at', 'last_activity')
    search_fields = ('session_id', 'user__user__username')
    readonly_fields = ('session_id', 'created_at', 'last_activity')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'session_id', 'is_active')
        }),
        ('Данные инициализации', {
            'fields': ('init_data',),
            'classes': ('collapse',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'last_activity'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TelegramCommand)
class TelegramCommandAdmin(admin.ModelAdmin):
    list_display = ('command', 'description', 'handler_function', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('command', 'description', 'handler_function')
    readonly_fields = ('created_at',)
    ordering = ('command',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('command', 'description', 'handler_function')
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
        ('Системная информация', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(TelegramInlineKeyboard)
class TelegramInlineKeyboardAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)
    ordering = ('name',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'keyboard_data')
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
        ('Системная информация', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(TelegramUserState)
class TelegramUserStateAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_state', 'created_at', 'updated_at')
    list_filter = ('current_state', 'created_at', 'updated_at')
    search_fields = ('user__user__username', 'current_state')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-updated_at',)
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'current_state')
        }),
        ('Данные состояния', {
            'fields': ('state_data',),
            'classes': ('collapse',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Кастомная админка для Telegram бота
class TelegramBotAdminSite(admin.AdminSite):
    site_header = "VELES AUTO - Telegram Bot Administration"
    site_title = "Telegram Bot Admin"
    index_title = "Панель управления Telegram Bot"
    
    def get_app_list(self, request):
        app_list = super().get_app_list(request)
        
        # Добавляем статистику
        stats = {
            'total_users': TelegramUser.objects.count(),
            'active_users': TelegramUser.objects.filter(is_active=True).count(),
            'total_messages': TelegramMessage.objects.count(),
            'pending_notifications': TelegramNotification.objects.filter(is_sent=False).count(),
            'active_sessions': TelegramMiniAppSession.objects.filter(is_active=True).count(),
        }
        
        # Добавляем статистику в контекст
        self.stats = stats
        
        return app_list


# Создаем экземпляр кастомной админки
telegram_admin_site = TelegramBotAdminSite(name='telegram_admin')

# Регистрируем модели в кастомной админке
telegram_admin_site.register(TelegramUser, TelegramUserAdmin)
telegram_admin_site.register(TelegramChat, TelegramChatAdmin)
telegram_admin_site.register(TelegramMessage, TelegramMessageAdmin)
telegram_admin_site.register(TelegramNotification, TelegramNotificationAdmin)
telegram_admin_site.register(TelegramBotSettings, TelegramBotSettingsAdmin)
telegram_admin_site.register(TelegramMiniAppSession, TelegramMiniAppSessionAdmin)
telegram_admin_site.register(TelegramCommand, TelegramCommandAdmin)
telegram_admin_site.register(TelegramInlineKeyboard, TelegramInlineKeyboardAdmin)
telegram_admin_site.register(TelegramUserState, TelegramUserStateAdmin) 