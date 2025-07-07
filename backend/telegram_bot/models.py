from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class TelegramUser(models.Model):
    """Модель для связи пользователей с Telegram"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='telegram_profile')
    telegram_id = models.BigIntegerField(unique=True, verbose_name=_('Telegram ID'))
    username = models.CharField(max_length=100, blank=True, null=True, verbose_name=_('Username'))
    first_name = models.CharField(max_length=100, blank=True, null=True, verbose_name=_('First Name'))
    last_name = models.CharField(max_length=100, blank=True, null=True, verbose_name=_('Last Name'))
    language_code = models.CharField(max_length=10, default='ru', verbose_name=_('Language Code'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Telegram User')
        verbose_name_plural = _('Telegram Users')
        db_table = 'telegram_users'
    
    def __str__(self):
        return f"{self.user.username} ({self.telegram_id})"


class TelegramChat(models.Model):
    """Модель для групповых чатов"""
    chat_id = models.BigIntegerField(unique=True, verbose_name=_('Chat ID'))
    chat_type = models.CharField(max_length=20, choices=[
        ('private', _('Private')),
        ('group', _('Group')),
        ('supergroup', _('Supergroup')),
        ('channel', _('Channel')),
    ], verbose_name=_('Chat Type'))
    title = models.CharField(max_length=255, blank=True, null=True, verbose_name=_('Title'))
    username = models.CharField(max_length=100, blank=True, null=True, verbose_name=_('Username'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Telegram Chat')
        verbose_name_plural = _('Telegram Chats')
        db_table = 'telegram_chats'
    
    def __str__(self):
        return f"{self.title or self.chat_id} ({self.chat_type})"


class TelegramMessage(models.Model):
    """Модель для хранения сообщений"""
    message_id = models.BigIntegerField(verbose_name=_('Message ID'))
    chat = models.ForeignKey(TelegramChat, on_delete=models.CASCADE, related_name='messages', verbose_name=_('Chat'))
    from_user = models.ForeignKey(TelegramUser, on_delete=models.CASCADE, related_name='sent_messages', verbose_name=_('From User'))
    text = models.TextField(blank=True, null=True, verbose_name=_('Text'))
    message_type = models.CharField(max_length=20, choices=[
        ('text', _('Text')),
        ('photo', _('Photo')),
        ('document', _('Document')),
        ('video', _('Video')),
        ('audio', _('Audio')),
        ('voice', _('Voice')),
        ('location', _('Location')),
        ('contact', _('Contact')),
        ('sticker', _('Sticker')),
    ], default='text', verbose_name=_('Message Type'))
    reply_to_message = models.ForeignKey('self', on_delete=models.SET_NULL, blank=True, null=True, verbose_name=_('Reply To'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    
    class Meta:
        verbose_name = _('Telegram Message')
        verbose_name_plural = _('Telegram Messages')
        db_table = 'telegram_messages'
        unique_together = ['message_id', 'chat']
    
    def __str__(self):
        return f"Message {self.message_id} from {self.from_user}"


class TelegramNotification(models.Model):
    """Модель для уведомлений"""
    user = models.ForeignKey(TelegramUser, on_delete=models.CASCADE, related_name='notifications', verbose_name=_('User'))
    notification_type = models.CharField(max_length=50, choices=[
        ('task_assigned', _('Task Assigned')),
        ('task_completed', _('Task Completed')),
        ('task_overdue', _('Task Overdue')),
        ('sale_created', _('Sale Created')),
        ('sale_completed', _('Sale Completed')),
        ('project_update', _('Project Update')),
        ('system_alert', _('System Alert')),
        ('reminder', _('Reminder')),
    ], verbose_name=_('Notification Type'))
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    message = models.TextField(verbose_name=_('Message'))
    data = models.JSONField(default=dict, blank=True, verbose_name=_('Additional Data'))
    is_sent = models.BooleanField(default=False, verbose_name=_('Is Sent'))
    sent_at = models.DateTimeField(blank=True, null=True, verbose_name=_('Sent At'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    
    class Meta:
        verbose_name = _('Telegram Notification')
        verbose_name_plural = _('Telegram Notifications')
        db_table = 'telegram_notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type}: {self.title}"


class TelegramBotSettings(models.Model):
    """Настройки бота"""
    bot_token = models.CharField(max_length=100, unique=True, verbose_name=_('Bot Token'))
    bot_username = models.CharField(max_length=100, verbose_name=_('Bot Username'))
    webhook_url = models.URLField(blank=True, null=True, verbose_name=_('Webhook URL'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Telegram Bot Settings')
        verbose_name_plural = _('Telegram Bot Settings')
        db_table = 'telegram_bot_settings'
    
    def __str__(self):
        return f"Bot: {self.bot_username}"


class TelegramMiniAppSession(models.Model):
    """Сессии для Mini App"""
    user = models.ForeignKey(TelegramUser, on_delete=models.CASCADE, related_name='mini_app_sessions', verbose_name=_('User'))
    session_id = models.CharField(max_length=100, unique=True, verbose_name=_('Session ID'))
    init_data = models.JSONField(default=dict, verbose_name=_('Init Data'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    last_activity = models.DateTimeField(auto_now=True, verbose_name=_('Last Activity'))
    
    class Meta:
        verbose_name = _('Telegram Mini App Session')
        verbose_name_plural = _('Telegram Mini App Sessions')
        db_table = 'telegram_mini_app_sessions'
    
    def __str__(self):
        return f"Session {self.session_id} for {self.user}"


class TelegramCommand(models.Model):
    """Команды бота"""
    command = models.CharField(max_length=50, unique=True, verbose_name=_('Command'))
    description = models.TextField(verbose_name=_('Description'))
    handler_function = models.CharField(max_length=100, verbose_name=_('Handler Function'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    
    class Meta:
        verbose_name = _('Telegram Command')
        verbose_name_plural = _('Telegram Commands')
        db_table = 'telegram_commands'
    
    def __str__(self):
        return f"/{self.command}"


class TelegramInlineKeyboard(models.Model):
    """Inline клавиатуры"""
    name = models.CharField(max_length=100, unique=True, verbose_name=_('Name'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    keyboard_data = models.JSONField(verbose_name=_('Keyboard Data'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    
    class Meta:
        verbose_name = _('Telegram Inline Keyboard')
        verbose_name_plural = _('Telegram Inline Keyboards')
        db_table = 'telegram_inline_keyboards'
    
    def __str__(self):
        return self.name


class TelegramUserState(models.Model):
    """Состояния пользователей для FSM"""
    user = models.OneToOneField(TelegramUser, on_delete=models.CASCADE, related_name='state', verbose_name=_('User'))
    current_state = models.CharField(max_length=100, verbose_name=_('Current State'))
    state_data = models.JSONField(default=dict, verbose_name=_('State Data'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Telegram User State')
        verbose_name_plural = _('Telegram User States')
        db_table = 'telegram_user_states'
    
    def __str__(self):
        return f"State {self.current_state} for {self.user}" 