from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from telegram_bot.models import (
    TelegramBotSettings, TelegramUser, TelegramChat, TelegramCommand,
    TelegramInlineKeyboard, TelegramNotification
)
from telegram_bot.services import TelegramKeyboardService


class Command(BaseCommand):
    help = 'Загружает демо-данные для Telegram бота'

    def handle(self, *args, **options):
        self.stdout.write('Загрузка демо-данных для Telegram бота...')
        
        # Создаем настройки бота
        self.create_bot_settings()
        
        # Создаем команды бота
        self.create_bot_commands()
        
        # Создаем inline клавиатуры
        self.create_inline_keyboards()
        
        # Создаем демо-пользователей с Telegram профилями
        self.create_demo_telegram_users()
        
        # Создаем демо-чаты
        self.create_demo_chats()
        
        # Создаем демо-уведомления
        self.create_demo_notifications()
        
        self.stdout.write(
            self.style.SUCCESS('Демо-данные для Telegram бота успешно загружены!')
        )

    def create_bot_settings(self):
        """Создание настроек бота"""
        bot_settings, created = TelegramBotSettings.objects.get_or_create(
            bot_username='veles_drive_bot',
            defaults={
                'bot_token': '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',  # Демо токен
                'webhook_url': 'https://api.veles-auto.com/telegram/webhook/',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f'Созданы настройки бота: {bot_settings.bot_username}')
        else:
            self.stdout.write(f'Настройки бота уже существуют: {bot_settings.bot_username}')

    def create_bot_commands(self):
        """Создание команд бота"""
        commands_data = [
            {
                'command': 'start',
                'description': 'Запустить бота и показать главное меню',
                'handler_function': 'handle_start_command'
            },
            {
                'command': 'help',
                'description': 'Показать справку по командам',
                'handler_function': 'handle_help_command'
            },
            {
                'command': 'projects',
                'description': 'Показать список проектов',
                'handler_function': 'show_projects'
            },
            {
                'command': 'sales',
                'description': 'Показать продажи',
                'handler_function': 'show_sales'
            },
            {
                'command': 'cars',
                'description': 'Показать автомобили',
                'handler_function': 'show_cars'
            },
            {
                'command': 'companies',
                'description': 'Показать компании',
                'handler_function': 'show_companies'
            },
            {
                'command': 'analytics',
                'description': 'Показать аналитику',
                'handler_function': 'show_analytics'
            },
            {
                'command': 'settings',
                'description': 'Настройки пользователя',
                'handler_function': 'show_settings'
            }
        ]
        
        for cmd_data in commands_data:
            command, created = TelegramCommand.objects.get_or_create(
                command=cmd_data['command'],
                defaults={
                    'description': cmd_data['description'],
                    'handler_function': cmd_data['handler_function'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Создана команда: /{command.command}')
            else:
                self.stdout.write(f'Команда уже существует: /{command.command}')

    def create_inline_keyboards(self):
        """Создание inline клавиатур"""
        keyboards_data = [
            {
                'name': 'main_menu',
                'description': 'Главное меню бота',
                'keyboard_data': TelegramKeyboardService.create_main_menu_keyboard()
            },
            {
                'name': 'project_actions',
                'description': 'Действия с проектами',
                'keyboard_data': {
                    'inline_keyboard': [
                        [
                            {'text': '📋 Список проектов', 'callback_data': 'projects'},
                            {'text': '➕ Новый проект', 'callback_data': 'new_project'}
                        ],
                        [
                            {'text': '📊 Статистика', 'callback_data': 'project_stats'},
                            {'text': '🔙 Назад', 'callback_data': 'main_menu'}
                        ]
                    ]
                }
            },
            {
                'name': 'task_actions',
                'description': 'Действия с задачами',
                'keyboard_data': {
                    'inline_keyboard': [
                        [
                            {'text': '📝 Создать задачу', 'callback_data': 'new_task'},
                            {'text': '✅ Завершить', 'callback_data': 'complete_task'}
                        ],
                        [
                            {'text': '📅 Сроки', 'callback_data': 'task_deadlines'},
                            {'text': '🔙 Назад', 'callback_data': 'projects'}
                        ]
                    ]
                }
            },
            {
                'name': 'sales_actions',
                'description': 'Действия с продажами',
                'keyboard_data': {
                    'inline_keyboard': [
                        [
                            {'text': '💰 Новая продажа', 'callback_data': 'new_sale'},
                            {'text': '📊 Отчеты', 'callback_data': 'sales_reports'}
                        ],
                        [
                            {'text': '📈 Аналитика', 'callback_data': 'sales_analytics'},
                            {'text': '🔙 Назад', 'callback_data': 'main_menu'}
                        ]
                    ]
                }
            }
        ]
        
        for kb_data in keyboards_data:
            keyboard, created = TelegramInlineKeyboard.objects.get_or_create(
                name=kb_data['name'],
                defaults={
                    'description': kb_data['description'],
                    'keyboard_data': kb_data['keyboard_data'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Создана клавиатура: {keyboard.name}')
            else:
                self.stdout.write(f'Клавиатура уже существует: {keyboard.name}')

    def create_demo_telegram_users(self):
        """Создание демо-пользователей с Telegram профилями"""
        demo_users = [
            {
                'username': 'demo_manager',
                'email': 'manager@veles-auto.com',
                'first_name': 'Менеджер',
                'last_name': 'Демо',
                'telegram_id': 123456789,
                'telegram_username': 'demo_manager',
                'telegram_first_name': 'Менеджер',
                'telegram_last_name': 'Демо'
            },
            {
                'username': 'demo_sales',
                'email': 'sales@veles-auto.com',
                'first_name': 'Продавец',
                'last_name': 'Демо',
                'telegram_id': 987654321,
                'telegram_username': 'demo_sales',
                'telegram_first_name': 'Продавец',
                'telegram_last_name': 'Демо'
            },
            {
                'username': 'demo_developer',
                'email': 'dev@veles-auto.com',
                'first_name': 'Разработчик',
                'last_name': 'Демо',
                'telegram_id': 555666777,
                'telegram_username': 'demo_dev',
                'telegram_first_name': 'Разработчик',
                'telegram_last_name': 'Демо'
            },
            {
                'username': 'demo_customer',
                'email': 'customer@example.com',
                'first_name': 'Клиент',
                'last_name': 'Демо',
                'telegram_id': 111222333,
                'telegram_username': 'demo_customer',
                'telegram_first_name': 'Клиент',
                'telegram_last_name': 'Демо'
            }
        ]
        
        for user_data in demo_users:
            # Создаем Django пользователя
            django_user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_active': True
                }
            )
            
            # Создаем Telegram профиль
            telegram_user, created = TelegramUser.objects.get_or_create(
                telegram_id=user_data['telegram_id'],
                defaults={
                    'user': django_user,
                    'username': user_data['telegram_username'],
                    'first_name': user_data['telegram_first_name'],
                    'last_name': user_data['telegram_last_name'],
                    'language_code': 'ru',
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Создан Telegram пользователь: {telegram_user.user.username}')
            else:
                self.stdout.write(f'Telegram пользователь уже существует: {telegram_user.user.username}')

    def create_demo_chats(self):
        """Создание демо-чатов"""
        demo_chats = [
            {
                'chat_id': -1001234567890,
                'chat_type': 'supergroup',
                'title': 'VELES AUTO - Общие вопросы',
                'username': 'veles_drive_general'
            },
            {
                'chat_id': -1009876543210,
                'chat_type': 'supergroup',
                'title': 'VELES AUTO - Продажи',
                'username': 'veles_drive_sales'
            },
            {
                'chat_id': -1005556667770,
                'chat_type': 'supergroup',
                'title': 'VELES AUTO - Разработка',
                'username': 'veles_drive_dev'
            },
            {
                'chat_id': 123456789,
                'chat_type': 'private',
                'title': None,
                'username': 'demo_manager'
            }
        ]
        
        for chat_data in demo_chats:
            chat, created = TelegramChat.objects.get_or_create(
                chat_id=chat_data['chat_id'],
                defaults={
                    'chat_type': chat_data['chat_type'],
                    'title': chat_data['title'],
                    'username': chat_data['username'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Создан чат: {chat.title or chat.chat_id}')
            else:
                self.stdout.write(f'Чат уже существует: {chat.title or chat.chat_id}')

    def create_demo_notifications(self):
        """Создание демо-уведомлений"""
        # Получаем демо-пользователей
        demo_users = TelegramUser.objects.filter(is_active=True)[:3]
        
        if not demo_users.exists():
            self.stdout.write('Нет пользователей для создания уведомлений')
            return
        
        demo_notifications = [
            {
                'notification_type': 'task_assigned',
                'title': '📋 Новая задача назначена',
                'message': 'Вам назначена задача: <b>Разработка нового функционала</b>\n\n'
                          'Проект: VELES AUTO Platform\n'
                          'Приоритет: Высокий\n'
                          'Срок: 15.12.2024'
            },
            {
                'notification_type': 'sale_created',
                'title': '💰 Новая продажа',
                'message': 'Создана новая продажа: <b>Toyota Camry 2023</b>\n\n'
                          'Сумма: 2,500,000 ₽\n'
                          'Компания: VELES AUTO\n'
                          'Клиент: Иван Петров'
            },
            {
                'notification_type': 'project_update',
                'title': '📊 Обновление проекта',
                'message': 'Проект <b>VELES AUTO Platform</b> обновлен\n\n'
                          'Прогресс: 75%\n'
                          'Задач: 24\n'
                          'Завершено: 18'
            },
            {
                'notification_type': 'system_alert',
                'title': '⚠️ Системное уведомление',
                'message': 'Система будет недоступна с 02:00 до 04:00 для проведения технических работ.'
            },
            {
                'notification_type': 'reminder',
                'title': '⏰ Напоминание',
                'message': 'Напоминаем о встрече с клиентом завтра в 14:00.'
            }
        ]
        
        for i, notification_data in enumerate(demo_notifications):
            user = demo_users[i % len(demo_users)]
            
            notification, created = TelegramNotification.objects.get_or_create(
                user=user,
                title=notification_data['title'],
                defaults={
                    'notification_type': notification_data['notification_type'],
                    'message': notification_data['message'],
                    'is_sent': False,
                    'data': {
                        'demo': True,
                        'created_at': timezone.now().isoformat()
                    }
                }
            )
            
            if created:
                self.stdout.write(f'Создано уведомление: {notification.title}')
            else:
                self.stdout.write(f'Уведомление уже существует: {notification.title}') 