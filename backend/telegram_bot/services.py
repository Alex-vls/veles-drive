import requests
import json
import hashlib
import hmac
import time
from typing import Dict, List, Optional, Any
from django.conf import settings
from django.utils import timezone
from .models import (
    TelegramBotSettings, TelegramUser, TelegramChat, TelegramMessage,
    TelegramNotification, TelegramInlineKeyboard, TelegramUserState, TelegramMiniAppSession
)


class TelegramBotService:
    """Сервис для работы с Telegram Bot API"""
    
    def __init__(self):
        self.settings = TelegramBotSettings.objects.filter(is_active=True).first()
        if not self.settings:
            raise ValueError("Telegram bot settings not found or inactive")
        
        self.base_url = f"https://api.telegram.org/bot{self.settings.bot_token}"
    
    def send_message(self, chat_id: int, text: str, **kwargs) -> Dict:
        """Отправка сообщения"""
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': kwargs.get('parse_mode', 'HTML')
        }
        
        if 'reply_markup' in kwargs:
            data['reply_markup'] = json.dumps(kwargs['reply_markup'])
        
        if 'reply_to_message_id' in kwargs:
            data['reply_to_message_id'] = kwargs['reply_to_message_id']
        
        response = requests.post(f"{self.base_url}/sendMessage", data=data)
        return response.json()
    
    def send_photo(self, chat_id: int, photo: str, caption: str = None, **kwargs) -> Dict:
        """Отправка фото"""
        data = {
            'chat_id': chat_id,
            'photo': photo
        }
        
        if caption:
            data['caption'] = caption
            data['parse_mode'] = kwargs.get('parse_mode', 'HTML')
        
        if 'reply_markup' in kwargs:
            data['reply_markup'] = json.dumps(kwargs['reply_markup'])
        
        response = requests.post(f"{self.base_url}/sendPhoto", data=data)
        return response.json()
    
    def send_document(self, chat_id: int, document: str, caption: str = None, **kwargs) -> Dict:
        """Отправка документа"""
        data = {
            'chat_id': chat_id,
            'document': document
        }
        
        if caption:
            data['caption'] = caption
            data['parse_mode'] = kwargs.get('parse_mode', 'HTML')
        
        if 'reply_markup' in kwargs:
            data['reply_markup'] = json.dumps(kwargs['reply_markup'])
        
        response = requests.post(f"{self.base_url}/sendDocument", data=data)
        return response.json()
    
    def edit_message(self, chat_id: int, message_id: int, text: str, **kwargs) -> Dict:
        """Редактирование сообщения"""
        data = {
            'chat_id': chat_id,
            'message_id': message_id,
            'text': text,
            'parse_mode': kwargs.get('parse_mode', 'HTML')
        }
        
        if 'reply_markup' in kwargs:
            data['reply_markup'] = json.dumps(kwargs['reply_markup'])
        
        response = requests.post(f"{self.base_url}/editMessageText", data=data)
        return response.json()
    
    def delete_message(self, chat_id: int, message_id: int) -> Dict:
        """Удаление сообщения"""
        data = {
            'chat_id': chat_id,
            'message_id': message_id
        }
        
        response = requests.post(f"{self.base_url}/deleteMessage", data=data)
        return response.json()
    
    def answer_callback_query(self, callback_query_id: str, text: str = None, **kwargs) -> Dict:
        """Ответ на callback query"""
        data = {
            'callback_query_id': callback_query_id
        }
        
        if text:
            data['text'] = text
        
        if 'show_alert' in kwargs:
            data['show_alert'] = kwargs['show_alert']
        
        response = requests.post(f"{self.base_url}/answerCallbackQuery", data=data)
        return response.json()
    
    def get_me(self) -> Dict:
        """Получение информации о боте"""
        response = requests.get(f"{self.base_url}/getMe")
        return response.json()
    
    def set_webhook(self, url: str, **kwargs) -> Dict:
        """Установка webhook"""
        data = {
            'url': url
        }
        
        if 'certificate' in kwargs:
            data['certificate'] = kwargs['certificate']
        
        if 'max_connections' in kwargs:
            data['max_connections'] = kwargs['max_connections']
        
        response = requests.post(f"{self.base_url}/setWebhook", data=data)
        return response.json()
    
    def delete_webhook(self) -> Dict:
        """Удаление webhook"""
        response = requests.post(f"{self.base_url}/deleteWebhook")
        return response.json()
    
    def get_webhook_info(self) -> Dict:
        """Получение информации о webhook"""
        response = requests.get(f"{self.base_url}/getWebhookInfo")
        return response.json()


class TelegramNotificationService:
    """Сервис для отправки уведомлений"""
    
    def __init__(self):
        self.bot_service = TelegramBotService()
    
    def send_notification(self, notification: TelegramNotification) -> bool:
        """Отправка уведомления"""
        try:
            result = self.bot_service.send_message(
                chat_id=notification.user.telegram_id,
                text=f"🔔 <b>{notification.title}</b>\n\n{notification.message}",
                parse_mode='HTML'
            )
            
            if result.get('ok'):
                notification.is_sent = True
                notification.sent_at = timezone.now()
                notification.save()
                return True
            
            return False
        except Exception as e:
            print(f"Error sending notification: {e}")
            return False
    
    def send_task_assigned_notification(self, user: TelegramUser, task_data: Dict) -> bool:
        """Уведомление о назначении задачи"""
        notification = TelegramNotification.objects.create(
            user=user,
            notification_type='task_assigned',
            title='📋 Новая задача назначена',
            message=f"Вам назначена задача: <b>{task_data['title']}</b>\n\n"
                   f"Проект: {task_data['project']}\n"
                   f"Приоритет: {task_data['priority']}\n"
                   f"Срок: {task_data['due_date']}",
            data=task_data
        )
        
        return self.send_notification(notification)
    
    def send_task_completed_notification(self, user: TelegramUser, task_data: Dict) -> bool:
        """Уведомление о завершении задачи"""
        notification = TelegramNotification.objects.create(
            user=user,
            notification_type='task_completed',
            title='✅ Задача завершена',
            message=f"Задача <b>{task_data['title']}</b> была завершена\n\n"
                   f"Проект: {task_data['project']}\n"
                   f"Завершена: {task_data['completed_by']}",
            data=task_data
        )
        
        return self.send_notification(notification)
    
    def send_sale_notification(self, user: TelegramUser, sale_data: Dict) -> bool:
        """Уведомление о продаже"""
        notification = TelegramNotification.objects.create(
            user=user,
            notification_type='sale_created',
            title='💰 Новая продажа',
            message=f"Создана новая продажа: <b>{sale_data['car']}</b>\n\n"
                   f"Сумма: {sale_data['amount']} ₽\n"
                   f"Компания: {sale_data['company']}\n"
                   f"Клиент: {sale_data['customer']}",
            data=sale_data
        )
        
        return self.send_notification(notification)
    
    def send_project_update_notification(self, user: TelegramUser, project_data: Dict) -> bool:
        """Уведомление об обновлении проекта"""
        notification = TelegramNotification.objects.create(
            user=user,
            notification_type='project_update',
            title='📊 Обновление проекта',
            message=f"Проект <b>{project_data['name']}</b> обновлен\n\n"
                   f"Прогресс: {project_data['progress']}%\n"
                   f"Задач: {project_data['tasks_count']}\n"
                   f"Завершено: {project_data['completed_tasks']}",
            data=project_data
        )
        
        return self.send_notification(notification)


class TelegramMiniAppService:
    """Сервис для работы с Telegram Mini App"""
    
    @staticmethod
    def validate_init_data(init_data: str, bot_token: str) -> bool:
        """Валидация init_data от Telegram"""
        try:
            # Разбираем init_data
            data_dict = {}
            for item in init_data.split('&'):
                key, value = item.split('=', 1)
                data_dict[key] = value
            
            # Проверяем hash
            data_check_string = '\n'.join([
                f"{k}={v}" for k, v in sorted(data_dict.items()) 
                if k != 'hash'
            ])
            
            secret_key = hmac.new(
                b"WebAppData",
                bot_token.encode(),
                hashlib.sha256
            ).digest()
            
            calculated_hash = hmac.new(
                secret_key,
                data_check_string.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return calculated_hash == data_dict.get('hash', '')
        except Exception:
            return False
    
    @staticmethod
    def create_session(user: TelegramUser, init_data: str) -> TelegramMiniAppSession:
        """Создание сессии для Mini App"""
        # Деактивируем старые сессии
        TelegramMiniAppSession.objects.filter(
            user=user, 
            is_active=True
        ).update(is_active=False)
        
        # Создаем новую сессию
        session = TelegramMiniAppSession.objects.create(
            user=user,
            session_id=f"session_{user.telegram_id}_{int(time.time())}",
            init_data=json.loads(init_data),
            is_active=True
        )
        
        return session
    
    @staticmethod
    def get_user_from_init_data(init_data: str) -> Optional[TelegramUser]:
        """Получение пользователя из init_data"""
        try:
            data_dict = {}
            for item in init_data.split('&'):
                key, value = item.split('=', 1)
                data_dict[key] = value
            
            user_data = json.loads(data_dict.get('user', '{}'))
            telegram_id = user_data.get('id')
            
            if telegram_id:
                return TelegramUser.objects.filter(
                    telegram_id=telegram_id,
                    is_active=True
                ).first()
            
            return None
        except Exception:
            return None


class TelegramKeyboardService:
    """Сервис для работы с клавиатурами"""
    
    @staticmethod
    def create_inline_keyboard(buttons: List[List[Dict]]) -> Dict:
        """Создание inline клавиатуры"""
        return {
            'inline_keyboard': buttons
        }
    
    @staticmethod
    def create_main_menu_keyboard() -> Dict:
        """Главное меню"""
        return {
            'inline_keyboard': [
                [
                    {'text': '📋 Проекты', 'callback_data': 'projects'},
                    {'text': '💰 Продажи', 'callback_data': 'sales'}
                ],
                [
                    {'text': '🚗 Автомобили', 'callback_data': 'cars'},
                    {'text': '🏢 Компании', 'callback_data': 'companies'}
                ],
                [
                    {'text': '📊 Аналитика', 'callback_data': 'analytics'},
                    {'text': '⚙️ Настройки', 'callback_data': 'settings'}
                ],
                [
                    {'text': '🔗 Открыть Mini App', 'web_app': {'url': f"{settings.FRONTEND_URL}/telegram-app"}}
                ]
            ]
        }
    
    @staticmethod
    def create_projects_keyboard(projects: List[Dict]) -> Dict:
        """Клавиатура проектов"""
        buttons = []
        for project in projects:
            buttons.append([
                {
                    'text': f"📋 {project['name']}",
                    'callback_data': f"project_{project['id']}"
                }
            ])
        
        buttons.append([
            {'text': '🔙 Назад', 'callback_data': 'main_menu'},
            {'text': '➕ Новый проект', 'callback_data': 'new_project'}
        ])
        
        return {
            'inline_keyboard': buttons
        }
    
    @staticmethod
    def create_tasks_keyboard(tasks: List[Dict]) -> Dict:
        """Клавиатура задач"""
        buttons = []
        for task in tasks:
            status_icon = '✅' if task['status'] == 'completed' else '⏳'
            buttons.append([
                {
                    'text': f"{status_icon} {task['title']}",
                    'callback_data': f"task_{task['id']}"
                }
            ])
        
        buttons.append([
            {'text': '🔙 Назад', 'callback_data': 'projects'},
            {'text': '➕ Новая задача', 'callback_data': 'new_task'}
        ])
        
        return {
            'inline_keyboard': buttons
        }
    
    @staticmethod
    def create_sales_keyboard(sales: List[Dict]) -> Dict:
        """Клавиатура продаж"""
        buttons = []
        for sale in sales:
            buttons.append([
                {
                    'text': f"💰 {sale['car']} - {sale['amount']} ₽",
                    'callback_data': f"sale_{sale['id']}"
                }
            ])
        
        buttons.append([
            {'text': '🔙 Назад', 'callback_data': 'main_menu'},
            {'text': '➕ Новая продажа', 'callback_data': 'new_sale'}
        ])
        
        return {
            'inline_keyboard': buttons
        }


class TelegramStateService:
    """Сервис для работы с состояниями пользователей"""
    
    @staticmethod
    def set_state(user: TelegramUser, state: str, data: Dict = None) -> TelegramUserState:
        """Установка состояния пользователя"""
        state_obj, created = TelegramUserState.objects.get_or_create(
            user=user,
            defaults={
                'current_state': state,
                'state_data': data or {}
            }
        )
        
        if not created:
            state_obj.current_state = state
            state_obj.state_data = data or {}
            state_obj.save()
        
        return state_obj
    
    @staticmethod
    def get_state(user: TelegramUser) -> Optional[TelegramUserState]:
        """Получение состояния пользователя"""
        return TelegramUserState.objects.filter(user=user).first()
    
    @staticmethod
    def clear_state(user: TelegramUser) -> bool:
        """Очистка состояния пользователя"""
        try:
            TelegramUserState.objects.filter(user=user).delete()
            return True
        except Exception:
            return False
    
    @staticmethod
    def update_state_data(user: TelegramUser, data: Dict) -> bool:
        """Обновление данных состояния"""
        try:
            state = TelegramUserState.objects.filter(user=user).first()
            if state:
                state.state_data.update(data)
                state.save()
                return True
            return False
        except Exception:
            return False 