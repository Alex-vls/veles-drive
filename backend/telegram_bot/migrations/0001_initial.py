# Generated manually for Telegram Bot

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='TelegramBotSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bot_token', models.CharField(max_length=100, unique=True, verbose_name='Bot Token')),
                ('bot_username', models.CharField(max_length=100, verbose_name='Bot Username')),
                ('webhook_url', models.URLField(blank=True, null=True, verbose_name='Webhook URL')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
            ],
            options={
                'verbose_name': 'Telegram Bot Settings',
                'verbose_name_plural': 'Telegram Bot Settings',
                'db_table': 'telegram_bot_settings',
            },
        ),
        migrations.CreateModel(
            name='TelegramUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('telegram_id', models.BigIntegerField(unique=True, verbose_name='Telegram ID')),
                ('username', models.CharField(blank=True, max_length=100, null=True, verbose_name='Username')),
                ('first_name', models.CharField(blank=True, max_length=100, null=True, verbose_name='First Name')),
                ('last_name', models.CharField(blank=True, max_length=100, null=True, verbose_name='Last Name')),
                ('language_code', models.CharField(default='ru', max_length=10, verbose_name='Language Code')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='telegram_profile', to='auth.user')),
            ],
            options={
                'verbose_name': 'Telegram User',
                'verbose_name_plural': 'Telegram Users',
                'db_table': 'telegram_users',
            },
        ),
        migrations.CreateModel(
            name='TelegramChat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat_id', models.BigIntegerField(unique=True, verbose_name='Chat ID')),
                ('chat_type', models.CharField(choices=[('private', 'Private'), ('group', 'Group'), ('supergroup', 'Supergroup'), ('channel', 'Channel')], max_length=20, verbose_name='Chat Type')),
                ('title', models.CharField(blank=True, max_length=255, null=True, verbose_name='Title')),
                ('username', models.CharField(blank=True, max_length=100, null=True, verbose_name='Username')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
            ],
            options={
                'verbose_name': 'Telegram Chat',
                'verbose_name_plural': 'Telegram Chats',
                'db_table': 'telegram_chats',
            },
        ),
        migrations.CreateModel(
            name='TelegramMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message_id', models.BigIntegerField(verbose_name='Message ID')),
                ('text', models.TextField(blank=True, null=True, verbose_name='Text')),
                ('message_type', models.CharField(choices=[('text', 'Text'), ('photo', 'Photo'), ('document', 'Document'), ('video', 'Video'), ('audio', 'Audio'), ('voice', 'Voice'), ('location', 'Location'), ('contact', 'Contact'), ('sticker', 'Sticker')], default='text', max_length=20, verbose_name='Message Type')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('chat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='telegram_bot.telegramchat', verbose_name='Chat')),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to='telegram_bot.telegramuser', verbose_name='From User')),
                ('reply_to_message', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='telegram_bot.telegrammessage', verbose_name='Reply To')),
            ],
            options={
                'verbose_name': 'Telegram Message',
                'verbose_name_plural': 'Telegram Messages',
                'db_table': 'telegram_messages',
                'unique_together': {('message_id', 'chat')},
            },
        ),
        migrations.CreateModel(
            name='TelegramNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('task_assigned', 'Task Assigned'), ('task_completed', 'Task Completed'), ('task_overdue', 'Task Overdue'), ('sale_created', 'Sale Created'), ('sale_completed', 'Sale Completed'), ('project_update', 'Project Update'), ('system_alert', 'System Alert'), ('reminder', 'Reminder')], max_length=50, verbose_name='Notification Type')),
                ('title', models.CharField(max_length=255, verbose_name='Title')),
                ('message', models.TextField(verbose_name='Message')),
                ('data', models.JSONField(blank=True, default=dict, verbose_name='Additional Data')),
                ('is_sent', models.BooleanField(default=False, verbose_name='Is Sent')),
                ('sent_at', models.DateTimeField(blank=True, null=True, verbose_name='Sent At')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='telegram_bot.telegramuser', verbose_name='User')),
            ],
            options={
                'verbose_name': 'Telegram Notification',
                'verbose_name_plural': 'Telegram Notifications',
                'db_table': 'telegram_notifications',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TelegramMiniAppSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.CharField(max_length=100, unique=True, verbose_name='Session ID')),
                ('init_data', models.JSONField(default=dict, verbose_name='Init Data')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('last_activity', models.DateTimeField(auto_now=True, verbose_name='Last Activity')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mini_app_sessions', to='telegram_bot.telegramuser', verbose_name='User')),
            ],
            options={
                'verbose_name': 'Telegram Mini App Session',
                'verbose_name_plural': 'Telegram Mini App Sessions',
                'db_table': 'telegram_mini_app_sessions',
            },
        ),
        migrations.CreateModel(
            name='TelegramCommand',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('command', models.CharField(max_length=50, unique=True, verbose_name='Command')),
                ('description', models.TextField(verbose_name='Description')),
                ('handler_function', models.CharField(max_length=100, verbose_name='Handler Function')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
            ],
            options={
                'verbose_name': 'Telegram Command',
                'verbose_name_plural': 'Telegram Commands',
                'db_table': 'telegram_commands',
            },
        ),
        migrations.CreateModel(
            name='TelegramInlineKeyboard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='Name')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Description')),
                ('keyboard_data', models.JSONField(verbose_name='Keyboard Data')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
            ],
            options={
                'verbose_name': 'Telegram Inline Keyboard',
                'verbose_name_plural': 'Telegram Inline Keyboards',
                'db_table': 'telegram_inline_keyboards',
            },
        ),
        migrations.CreateModel(
            name='TelegramUserState',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current_state', models.CharField(max_length=100, verbose_name='Current State')),
                ('state_data', models.JSONField(default=dict, verbose_name='State Data')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='state', to='telegram_bot.telegramuser', verbose_name='User')),
            ],
            options={
                'verbose_name': 'Telegram User State',
                'verbose_name_plural': 'Telegram User States',
                'db_table': 'telegram_user_states',
            },
        ),
    ] 