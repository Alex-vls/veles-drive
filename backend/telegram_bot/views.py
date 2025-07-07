import json
import logging
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import (
    TelegramUser, TelegramChat, TelegramMessage, TelegramNotification,
    TelegramBotSettings, TelegramMiniAppSession, TelegramCommand
)
from .services import (
    TelegramBotService, TelegramNotificationService, TelegramMiniAppService,
    TelegramKeyboardService, TelegramStateService
)

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def webhook_handler(request):
    """Обработчик webhook от Telegram"""
    try:
        data = json.loads(request.body)
        logger.info(f"Received webhook: {data}")
        
        # Обрабатываем различные типы обновлений
        if 'message' in data:
            return handle_message(data['message'])
        elif 'callback_query' in data:
            return handle_callback_query(data['callback_query'])
        elif 'edited_message' in data:
            return handle_edited_message(data['edited_message'])
        else:
            logger.warning(f"Unknown update type: {data}")
            return JsonResponse({'status': 'unknown_update'})
    
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook")
        return JsonResponse({'status': 'invalid_json'}, status=400)
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return JsonResponse({'status': 'error'}, status=500)


def handle_message(message_data):
    """Обработка входящих сообщений"""
    try:
        # Получаем или создаем пользователя
        telegram_user = get_or_create_telegram_user(message_data['from'])
        
        # Получаем или создаем чат
        chat = get_or_create_telegram_chat(message_data['chat'])
        
        # Сохраняем сообщение
        save_telegram_message(message_data, telegram_user, chat)
        
        # Обрабатываем команды
        if 'text' in message_data and message_data['text'].startswith('/'):
            return handle_command(message_data, telegram_user)
        
        # Обрабатываем обычные сообщения
        return handle_text_message(message_data, telegram_user)
    
    except Exception as e:
        logger.error(f"Error handling message: {e}")
        return JsonResponse({'status': 'error'})


def handle_callback_query(callback_data):
    """Обработка callback query"""
    try:
        telegram_user = get_or_create_telegram_user(callback_data['from'])
        callback_data_text = callback_data['data']
        
        # Обрабатываем различные callback_data
        if callback_data_text == 'main_menu':
            return show_main_menu(telegram_user, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text == 'projects':
            return show_projects(telegram_user, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text == 'sales':
            return show_sales(telegram_user, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text == 'cars':
            return show_cars(telegram_user, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text == 'companies':
            return show_companies(telegram_user, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text == 'analytics':
            return show_analytics(telegram_user, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text == 'settings':
            return show_settings(telegram_user, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text.startswith('project_'):
            project_id = callback_data_text.split('_')[1]
            return show_project_details(telegram_user, project_id, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text.startswith('task_'):
            task_id = callback_data_text.split('_')[1]
            return show_task_details(telegram_user, task_id, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        elif callback_data_text.startswith('sale_'):
            sale_id = callback_data_text.split('_')[1]
            return show_sale_details(telegram_user, sale_id, callback_data['message']['chat']['id'], callback_data['message']['message_id'])
        else:
            # Отвечаем на callback query
            bot_service = TelegramBotService()
            bot_service.answer_callback_query(callback_data['id'], "Команда обработана")
            return JsonResponse({'status': 'ok'})
    
    except Exception as e:
        logger.error(f"Error handling callback query: {e}")
        return JsonResponse({'status': 'error'})


def handle_command(message_data, telegram_user):
    """Обработка команд"""
    try:
        command = message_data['text'].split()[0].lower()
        chat_id = message_data['chat']['id']
        
        if command == '/start':
            return handle_start_command(telegram_user, chat_id)
        elif command == '/help':
            return handle_help_command(telegram_user, chat_id)
        elif command == '/projects':
            return show_projects(telegram_user, chat_id)
        elif command == '/sales':
            return show_sales(telegram_user, chat_id)
        elif command == '/cars':
            return show_cars(telegram_user, chat_id)
        elif command == '/companies':
            return show_companies(telegram_user, chat_id)
        elif command == '/analytics':
            return show_analytics(telegram_user, chat_id)
        elif command == '/settings':
            return show_settings(telegram_user, chat_id)
        else:
            return handle_unknown_command(telegram_user, chat_id, command)
    
    except Exception as e:
        logger.error(f"Error handling command: {e}")
        return JsonResponse({'status': 'error'})


def handle_text_message(message_data, telegram_user):
    """Обработка текстовых сообщений"""
    try:
        chat_id = message_data['chat']['id']
        text = message_data['text']
        
        # Получаем текущее состояние пользователя
        state = TelegramStateService.get_state(telegram_user)
        
        if state and state.current_state == 'waiting_for_task_title':
            return handle_task_title_input(telegram_user, text, chat_id)
        elif state and state.current_state == 'waiting_for_task_description':
            return handle_task_description_input(telegram_user, text, chat_id)
        elif state and state.current_state == 'waiting_for_sale_amount':
            return handle_sale_amount_input(telegram_user, text, chat_id)
        else:
            # Отправляем главное меню
            return show_main_menu(telegram_user, chat_id)
    
    except Exception as e:
        logger.error(f"Error handling text message: {e}")
        return JsonResponse({'status': 'error'})


def handle_start_command(telegram_user, chat_id):
    """Обработка команды /start"""
    try:
        bot_service = TelegramBotService()
        
        welcome_text = f"""
🎉 <b>Добро пожаловать в VELES AUTO Bot!</b>

Привет, {telegram_user.first_name or telegram_user.user.username}!

Этот бот поможет вам управлять:
• 📋 Проектами и задачами
• 💰 Продажами и финансами
• 🚗 Автомобилями
• 🏢 Компаниями
• 📊 Аналитикой

Выберите нужный раздел в меню ниже:
        """
        
        keyboard = TelegramKeyboardService.create_main_menu_keyboard()
        
        bot_service.send_message(
            chat_id=chat_id,
            text=welcome_text,
            reply_markup=keyboard
        )
        
        return JsonResponse({'status': 'ok'})
    
    except Exception as e:
        logger.error(f"Error handling start command: {e}")
        return JsonResponse({'status': 'error'})


def show_main_menu(telegram_user, chat_id, message_id=None):
    """Показать главное меню"""
    try:
        bot_service = TelegramBotService()
        keyboard = TelegramKeyboardService.create_main_menu_keyboard()
        
        menu_text = f"""
🏠 <b>Главное меню</b>

Выберите нужный раздел:
        """
        
        if message_id:
            bot_service.edit_message(
                chat_id=chat_id,
                message_id=message_id,
                text=menu_text,
                reply_markup=keyboard
            )
        else:
            bot_service.send_message(
                chat_id=chat_id,
                text=menu_text,
                reply_markup=keyboard
            )
        
        return JsonResponse({'status': 'ok'})
    
    except Exception as e:
        logger.error(f"Error showing main menu: {e}")
        return JsonResponse({'status': 'error'})


def show_projects(telegram_user, chat_id, message_id=None):
    """Показать проекты"""
    try:
        from erp.models import ProjectBoard
        
        # Получаем проекты пользователя
        projects = ProjectBoard.objects.filter(
            created_by=telegram_user.user,
            is_archived=False
        )[:10]  # Ограничиваем 10 проектами
        
        if not projects.exists():
            text = "📋 <b>Проекты</b>\n\nУ вас пока нет активных проектов."
            keyboard = {
                'inline_keyboard': [
                    [{'text': '🔙 Назад', 'callback_data': 'main_menu'}],
                    [{'text': '➕ Создать проект', 'callback_data': 'new_project'}]
                ]
            }
        else:
            text = "📋 <b>Ваши проекты:</b>\n\n"
            for project in projects:
                tasks_count = project.columns.aggregate(
                    total=models.Count('tasks')
                )['total'] or 0
                text += f"• <b>{project.name}</b> ({tasks_count} задач)\n"
            
            keyboard = TelegramKeyboardService.create_projects_keyboard([
                {'id': p.id, 'name': p.name} for p in projects
            ])
        
        bot_service = TelegramBotService()
        
        if message_id:
            bot_service.edit_message(
                chat_id=chat_id,
                message_id=message_id,
                text=text,
                reply_markup=keyboard
            )
        else:
            bot_service.send_message(
                chat_id=chat_id,
                text=text,
                reply_markup=keyboard
            )
        
        return JsonResponse({'status': 'ok'})
    
    except Exception as e:
        logger.error(f"Error showing projects: {e}")
        return JsonResponse({'status': 'error'})


def show_sales(telegram_user, chat_id, message_id=None):
    """Показать продажи"""
    try:
        from erp.models import Sale
        
        # Получаем продажи пользователя
        sales = Sale.objects.filter(
            customer=telegram_user.user
        ).order_by('-sale_date')[:10]
        
        if not sales.exists():
            text = "💰 <b>Продажи</b>\n\nУ вас пока нет продаж."
            keyboard = {
                'inline_keyboard': [
                    [{'text': '🔙 Назад', 'callback_data': 'main_menu'}]
                ]
            }
        else:
            text = "💰 <b>Ваши продажи:</b>\n\n"
            for sale in sales:
                text += f"• <b>{sale.car.title}</b> - {sale.sale_price} ₽\n"
                text += f"  {sale.sale_date.strftime('%d.%m.%Y')}\n\n"
            
            keyboard = TelegramKeyboardService.create_sales_keyboard([
                {'id': s.id, 'car': s.car.title, 'amount': s.sale_price} for s in sales
            ])
        
        bot_service = TelegramBotService()
        
        if message_id:
            bot_service.edit_message(
                chat_id=chat_id,
                message_id=message_id,
                text=text,
                reply_markup=keyboard
            )
        else:
            bot_service.send_message(
                chat_id=chat_id,
                text=text,
                reply_markup=keyboard
            )
        
        return JsonResponse({'status': 'ok'})
    
    except Exception as e:
        logger.error(f"Error showing sales: {e}")
        return JsonResponse({'status': 'error'})


def show_cars(telegram_user, chat_id, message_id=None):
    """Показать автомобили"""
    try:
        from veles_auto.models import Car
        
        # Получаем автомобили пользователя (если он владелец компании)
        cars = Car.objects.filter(
            company__user=telegram_user.user
        )[:10]
        
        if not cars.exists():
            text = "🚗 <b>Автомобили</b>\n\nУ вас пока нет автомобилей."
        else:
            text = "🚗 <b>Ваши автомобили:</b>\n\n"
            for car in cars:
                status = "✅ Доступен" if car.is_available else "❌ Недоступен"
                text += f"• <b>{car.brand.name} {car.model}</b> ({car.year})\n"
                text += f"  {car.price} ₽ - {status}\n\n"
        
        keyboard = {
            'inline_keyboard': [
                [{'text': '🔙 Назад', 'callback_data': 'main_menu'}]
            ]
        }
        
        bot_service = TelegramBotService()
        
        if message_id:
            bot_service.edit_message(
                chat_id=chat_id,
                message_id=message_id,
                text=text,
                reply_markup=keyboard
            )
        else:
            bot_service.send_message(
                chat_id=chat_id,
                text=text,
                reply_markup=keyboard
            )
        
        return JsonResponse({'status': 'ok'})
    
    except Exception as e:
        logger.error(f"Error showing cars: {e}")
        return JsonResponse({'status': 'error'})


def show_analytics(telegram_user, chat_id, message_id=None):
    """Показать аналитику"""
    try:
        from erp.models import ProjectBoard, ProjectTask, Sale
        
        # Собираем статистику
        projects_count = ProjectBoard.objects.filter(created_by=telegram_user.user).count()
        tasks_count = ProjectTask.objects.filter(created_by=telegram_user.user).count()
        completed_tasks = ProjectTask.objects.filter(
            created_by=telegram_user.user,
            status='completed'
        ).count()
        sales_count = Sale.objects.filter(customer=telegram_user.user).count()
        
        text = f"""
📊 <b>Ваша аналитика:</b>

📋 <b>Проекты:</b> {projects_count}
📝 <b>Задачи:</b> {tasks_count} (завершено: {completed_tasks})
💰 <b>Продажи:</b> {sales_count}

Для детальной аналитики используйте Mini App:
        """
        
        keyboard = {
            'inline_keyboard': [
                [{'text': '🔗 Открыть Mini App', 'web_app': {'url': f"{settings.FRONTEND_URL}/telegram-app/analytics"}}],
                [{'text': '🔙 Назад', 'callback_data': 'main_menu'}]
            ]
        }
        
        bot_service = TelegramBotService()
        
        if message_id:
            bot_service.edit_message(
                chat_id=chat_id,
                message_id=message_id,
                text=text,
                reply_markup=keyboard
            )
        else:
            bot_service.send_message(
                chat_id=chat_id,
                text=text,
                reply_markup=keyboard
            )
        
        return JsonResponse({'status': 'ok'})
    
    except Exception as e:
        logger.error(f"Error showing analytics: {e}")
        return JsonResponse({'status': 'error'})


def show_settings(telegram_user, chat_id, message_id=None):
    """Показать настройки"""
    try:
        text = f"""
⚙️ <b>Настройки</b>

👤 <b>Пользователь:</b> {telegram_user.user.username}
📱 <b>Telegram ID:</b> {telegram_user.telegram_id}
🌐 <b>Язык:</b> {telegram_user.language_code}
📅 <b>Регистрация:</b> {telegram_user.created_at.strftime('%d.%m.%Y')}

Настройки уведомлений:
🔔 Уведомления: {'Включены' if telegram_user.is_active else 'Отключены'}
        """
        
        keyboard = {
            'inline_keyboard': [
                [
                    {'text': '🔔 Уведомления', 'callback_data': 'toggle_notifications'},
                    {'text': '🌐 Язык', 'callback_data': 'change_language'}
                ],
                [{'text': '🔙 Назад', 'callback_data': 'main_menu'}]
            ]
        }
        
        bot_service = TelegramBotService()
        
        if message_id:
            bot_service.edit_message(
                chat_id=chat_id,
                message_id=message_id,
                text=text,
                reply_markup=keyboard
            )
        else:
            bot_service.send_message(
                chat_id=chat_id,
                text=text,
                reply_markup=keyboard
            )
        
        return JsonResponse({'status': 'ok'})
    
    except Exception as e:
        logger.error(f"Error showing settings: {e}")
        return JsonResponse({'status': 'error'})


# Вспомогательные функции
def get_or_create_telegram_user(user_data):
    """Получить или создать Telegram пользователя"""
    telegram_id = user_data['id']
    telegram_user = TelegramUser.objects.filter(telegram_id=telegram_id).first()
    
    if not telegram_user:
        # Создаем пользователя Django если его нет
        from django.contrib.auth.models import User
        django_user, created = User.objects.get_or_create(
            username=f"telegram_{telegram_id}",
            defaults={
                'first_name': user_data.get('first_name', ''),
                'last_name': user_data.get('last_name', ''),
                'email': f"telegram_{telegram_id}@example.com"
            }
        )
        
        telegram_user = TelegramUser.objects.create(
            user=django_user,
            telegram_id=telegram_id,
            username=user_data.get('username'),
            first_name=user_data.get('first_name'),
            last_name=user_data.get('last_name'),
            language_code=user_data.get('language_code', 'ru')
        )
    
    return telegram_user


def get_or_create_telegram_chat(chat_data):
    """Получить или создать Telegram чат"""
    chat_id = chat_data['id']
    chat = TelegramChat.objects.filter(chat_id=chat_id).first()
    
    if not chat:
        chat = TelegramChat.objects.create(
            chat_id=chat_id,
            chat_type=chat_data['type'],
            title=chat_data.get('title'),
            username=chat_data.get('username')
        )
    
    return chat


def save_telegram_message(message_data, telegram_user, chat):
    """Сохранить сообщение в базу"""
    message = TelegramMessage.objects.create(
        message_id=message_data['message_id'],
        chat=chat,
        from_user=telegram_user,
        text=message_data.get('text', ''),
        message_type='text'
    )
    
    if 'reply_to_message' in message_data:
        reply_message = TelegramMessage.objects.filter(
            message_id=message_data['reply_to_message']['message_id'],
            chat=chat
        ).first()
        if reply_message:
            message.reply_to_message = reply_message
            message.save()
    
    return message


# API для Mini App
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mini_app_auth(request):
    """Аутентификация для Mini App"""
    try:
        init_data = request.data.get('init_data')
        if not init_data:
            return Response({'error': 'init_data required'}, status=400)
        
        # Получаем настройки бота
        bot_settings = TelegramBotSettings.objects.filter(is_active=True).first()
        if not bot_settings:
            return Response({'error': 'Bot not configured'}, status=500)
        
        # Валидируем init_data
        if not TelegramMiniAppService.validate_init_data(init_data, bot_settings.bot_token):
            return Response({'error': 'Invalid init_data'}, status=400)
        
        # Получаем пользователя
        telegram_user = TelegramMiniAppService.get_user_from_init_data(init_data)
        if not telegram_user:
            return Response({'error': 'User not found'}, status=404)
        
        # Создаем сессию
        session = TelegramMiniAppService.create_session(telegram_user, init_data)
        
        return Response({
            'session_id': session.session_id,
            'user': {
                'id': telegram_user.user.id,
                'username': telegram_user.user.username,
                'telegram_id': telegram_user.telegram_id
            }
        })
    
    except Exception as e:
        logger.error(f"Error in mini_app_auth: {e}")
        return Response({'error': 'Internal server error'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mini_app_data(request):
    """Получение данных для Mini App"""
    try:
        session_id = request.GET.get('session_id')
        if not session_id:
            return Response({'error': 'session_id required'}, status=400)
        
        session = TelegramMiniAppSession.objects.filter(
            session_id=session_id,
            is_active=True
        ).first()
        
        if not session:
            return Response({'error': 'Invalid session'}, status=400)
        
        # Получаем данные пользователя
        user = session.user.user
        
        # Собираем данные для Mini App
        from erp.models import ProjectBoard, ProjectTask, Sale
        from veles_auto.models import Car, Company
        
        data = {
            'user': {
                'id': user.id,
                'username': user.username,
                'telegram_id': session.user.telegram_id
            },
            'projects': [],
            'tasks': [],
            'sales': [],
            'cars': [],
            'companies': []
        }
        
        # Проекты
        projects = ProjectBoard.objects.filter(created_by=user, is_archived=False)
        for project in projects:
            data['projects'].append({
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'board_type': project.board_type,
                'color': project.color,
                'created_at': project.created_at.isoformat()
            })
        
        # Задачи
        tasks = ProjectTask.objects.filter(created_by=user)[:50]
        for task in tasks:
            data['tasks'].append({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status,
                'priority': task.priority,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'project': task.column.board.name if task.column else None
            })
        
        # Продажи
        sales = Sale.objects.filter(customer=user)[:20]
        for sale in sales:
            data['sales'].append({
                'id': sale.id,
                'car': sale.car.title,
                'amount': sale.sale_price,
                'status': sale.status,
                'date': sale.sale_date.isoformat()
            })
        
        # Автомобили
        cars = Car.objects.filter(company__user=user)[:20]
        for car in cars:
            data['cars'].append({
                'id': car.id,
                'brand': car.brand.name,
                'model': car.model,
                'year': car.year,
                'price': car.price,
                'is_available': car.is_available
            })
        
        # Компании
        companies = Company.objects.filter(user=user)
        for company in companies:
            data['companies'].append({
                'id': company.id,
                'name': company.name,
                'city': company.city,
                'is_verified': company.is_verified
            })
        
        return Response(data)
    
    except Exception as e:
        logger.error(f"Error in mini_app_data: {e}")
        return Response({'error': 'Internal server error'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mini_app_action(request):
    """Выполнение действий из Mini App"""
    try:
        action = request.data.get('action')
        data = request.data.get('data', {})
        
        if not action:
            return Response({'error': 'action required'}, status=400)
        
        # Обрабатываем различные действия
        if action == 'create_task':
            return handle_create_task(data)
        elif action == 'update_task':
            return handle_update_task(data)
        elif action == 'create_sale':
            return handle_create_sale(data)
        elif action == 'send_notification':
            return handle_send_notification(data)
        else:
            return Response({'error': 'Unknown action'}, status=400)
    
    except Exception as e:
        logger.error(f"Error in mini_app_action: {e}")
        return Response({'error': 'Internal server error'}, status=500)


def handle_create_task(data):
    """Создание задачи"""
    try:
        from erp.models import ProjectTask, ProjectColumn
        
        column_id = data.get('column_id')
        column = ProjectColumn.objects.get(id=column_id)
        
        task = ProjectTask.objects.create(
            title=data['title'],
            description=data.get('description', ''),
            column=column,
            priority=data.get('priority', 'medium'),
            due_date=data.get('due_date'),
            created_by=request.user
        )
        
        return Response({'success': True, 'task_id': task.id})
    
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        return Response({'error': 'Failed to create task'}, status=500)


def handle_update_task(data):
    """Обновление задачи"""
    try:
        from erp.models import ProjectTask
        
        task = ProjectTask.objects.get(id=data['task_id'])
        task.status = data['status']
        task.save()
        
        return Response({'success': True})
    
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        return Response({'error': 'Failed to update task'}, status=500)


def handle_create_sale(data):
    """Создание продажи"""
    try:
        from erp.models import Sale
        from veles_auto.models import Car
        
        car = Car.objects.get(id=data['car_id'])
        
        sale = Sale.objects.create(
            car=car,
            company=car.company,
            customer=request.user,
            sale_price=data['amount'],
            status='completed',
            sale_date=timezone.now()
        )
        
        return Response({'success': True, 'sale_id': sale.id})
    
    except Exception as e:
        logger.error(f"Error creating sale: {e}")
        return Response({'error': 'Failed to create sale'}, status=500)


def handle_send_notification(data):
    """Отправка уведомления"""
    try:
        notification_service = TelegramNotificationService()
        
        # Здесь можно добавить логику отправки уведомлений
        # в зависимости от типа события
        
        return Response({'success': True})
    
    except Exception as e:
        logger.error(f"Error sending notification: {e}")
        return Response({'error': 'Failed to send notification'}, status=500) 