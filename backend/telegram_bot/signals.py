from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import TelegramUser, TelegramNotification
from .services import TelegramNotificationService


@receiver(post_save, sender='erp.ProjectTask')
def notify_task_assigned(sender, instance, created, **kwargs):
    """Уведомление о назначении задачи"""
    if created and instance.assigned_to:
        try:
            # Проверяем, есть ли у пользователя Telegram профиль
            telegram_user = TelegramUser.objects.filter(
                user=instance.assigned_to,
                is_active=True
            ).first()
            
            if telegram_user:
                notification_service = TelegramNotificationService()
                
                task_data = {
                    'title': instance.title,
                    'project': instance.column.board.name if instance.column else 'Без проекта',
                    'priority': instance.get_priority_display(),
                    'due_date': instance.due_date.strftime('%d.%m.%Y') if instance.due_date else 'Не указан'
                }
                
                notification_service.send_task_assigned_notification(telegram_user, task_data)
        
        except Exception as e:
            print(f"Error sending task assignment notification: {e}")


@receiver(post_save, sender='erp.ProjectTask')
def notify_task_completed(sender, instance, **kwargs):
    """Уведомление о завершении задачи"""
    if instance.status == 'completed' and instance.assigned_to:
        try:
            # Проверяем, есть ли у пользователя Telegram профиль
            telegram_user = TelegramUser.objects.filter(
                user=instance.assigned_to,
                is_active=True
            ).first()
            
            if telegram_user:
                notification_service = TelegramNotificationService()
                
                task_data = {
                    'title': instance.title,
                    'project': instance.column.board.name if instance.column else 'Без проекта',
                    'completed_by': instance.assigned_to.username
                }
                
                notification_service.send_task_completed_notification(telegram_user, task_data)
        
        except Exception as e:
            print(f"Error sending task completion notification: {e}")


@receiver(post_save, sender='erp.Sale')
def notify_sale_created(sender, instance, created, **kwargs):
    """Уведомление о создании продажи"""
    if created and instance.customer:
        try:
            # Проверяем, есть ли у пользователя Telegram профиль
            telegram_user = TelegramUser.objects.filter(
                user=instance.customer,
                is_active=True
            ).first()
            
            if telegram_user:
                notification_service = TelegramNotificationService()
                
                sale_data = {
                    'car': instance.car.title,
                    'amount': instance.sale_price,
                    'company': instance.company.name,
                    'customer': instance.customer.username
                }
                
                notification_service.send_sale_notification(telegram_user, sale_data)
        
        except Exception as e:
            print(f"Error sending sale notification: {e}")


@receiver(post_save, sender='erp.ProjectBoard')
def notify_project_update(sender, instance, **kwargs):
    """Уведомление об обновлении проекта"""
    try:
        # Получаем всех участников проекта
        from erp.models import ProjectTask
        
        participants = ProjectTask.objects.filter(
            column__board=instance
        ).values_list('assigned_to', flat=True).distinct()
        
        for user_id in participants:
            if user_id:
                telegram_user = TelegramUser.objects.filter(
                    user_id=user_id,
                    is_active=True
                ).first()
                
                if telegram_user:
                    notification_service = TelegramNotificationService()
                    
                    # Подсчитываем статистику
                    total_tasks = ProjectTask.objects.filter(column__board=instance).count()
                    completed_tasks = ProjectTask.objects.filter(
                        column__board=instance,
                        status='completed'
                    ).count()
                    
                    progress = int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
                    
                    project_data = {
                        'name': instance.name,
                        'progress': progress,
                        'tasks_count': total_tasks,
                        'completed_tasks': completed_tasks
                    }
                    
                    notification_service.send_project_update_notification(telegram_user, project_data)
    
    except Exception as e:
        print(f"Error sending project update notification: {e}")


@receiver(post_save, sender='erp.ServiceOrder')
def notify_service_order(sender, instance, created, **kwargs):
    """Уведомление о заказе на обслуживание"""
    if created and instance.customer:
        try:
            telegram_user = TelegramUser.objects.filter(
                user=instance.customer,
                is_active=True
            ).first()
            
            if telegram_user:
                notification = TelegramNotification.objects.create(
                    user=telegram_user,
                    notification_type='service_order',
                    title='🔧 Новый заказ на обслуживание',
                    message=f"Создан заказ на обслуживание: <b>{instance.service.name}</b>\n\n"
                           f"Автомобиль: {instance.car.title}\n"
                           f"Статус: {instance.get_status_display()}\n"
                           f"Дата: {instance.created_at.strftime('%d.%m.%Y')}",
                    data={
                        'service_order_id': instance.id,
                        'service_name': instance.service.name,
                        'car': instance.car.title,
                        'status': instance.status
                    }
                )
                
                notification_service = TelegramNotificationService()
                notification_service.send_notification(notification)
        
        except Exception as e:
            print(f"Error sending service order notification: {e}")


@receiver(post_save, sender='erp.Financial')
def notify_large_transaction(sender, instance, created, **kwargs):
    """Уведомление о крупных финансовых операциях"""
    if created and abs(instance.amount) > 100000:  # Уведомления для операций больше 100k
        try:
            # Уведомляем владельца компании
            if instance.company and instance.company.user:
                telegram_user = TelegramUser.objects.filter(
                    user=instance.company.user,
                    is_active=True
                ).first()
                
                if telegram_user:
                    transaction_type = "Поступление" if instance.amount > 0 else "Расход"
                    
                    notification = TelegramNotification.objects.create(
                        user=telegram_user,
                        notification_type='financial',
                        title=f'💰 Крупная финансовая операция',
                        message=f"<b>{transaction_type}</b>: {abs(instance.amount)} ₽\n\n"
                               f"Описание: {instance.description}\n"
                               f"Дата: {instance.date.strftime('%d.%m.%Y')}\n"
                               f"Тип: {instance.get_transaction_type_display()}",
                        data={
                            'amount': instance.amount,
                            'description': instance.description,
                            'transaction_type': instance.transaction_type,
                            'date': instance.date.isoformat()
                        }
                    )
                    
                    notification_service = TelegramNotificationService()
                    notification_service.send_notification(notification)
        
        except Exception as e:
            print(f"Error sending financial notification: {e}")


@receiver(post_save, sender='veles_auto.Car')
def notify_car_status_change(sender, instance, **kwargs):
    """Уведомление об изменении статуса автомобиля"""
    try:
        if instance.company and instance.company.user:
            telegram_user = TelegramUser.objects.filter(
                user=instance.company.user,
                is_active=True
            ).first()
            
            if telegram_user:
                status_text = "доступен" if instance.is_available else "недоступен"
                
                notification = TelegramNotification.objects.create(
                    user=telegram_user,
                    notification_type='car_status',
                    title='🚗 Изменение статуса автомобиля',
                    message=f"Автомобиль <b>{instance.brand.name} {instance.model}</b> теперь {status_text}\n\n"
                           f"Год: {instance.year}\n"
                           f"Цена: {instance.price} ₽",
                    data={
                        'car_id': instance.id,
                        'brand': instance.brand.name,
                        'model': instance.model,
                        'is_available': instance.is_available
                    }
                )
                
                notification_service = TelegramNotificationService()
                notification_service.send_notification(notification)
    
    except Exception as e:
        print(f"Error sending car status notification: {e}")


@receiver(post_save, sender='companies.Company')
def notify_company_verification(sender, instance, **kwargs):
    """Уведомление о верификации компании"""
    if instance.is_verified and instance.user:
        try:
            telegram_user = TelegramUser.objects.filter(
                user=instance.user,
                is_active=True
            ).first()
            
            if telegram_user:
                notification = TelegramNotification.objects.create(
                    user=telegram_user,
                    notification_type='company_verified',
                    title='✅ Компания верифицирована',
                    message=f"Ваша компания <b>{instance.name}</b> успешно верифицирована!\n\n"
                           f"Теперь вы можете публиковать автомобили и получать заявки от клиентов.",
                    data={
                        'company_id': instance.id,
                        'company_name': instance.name
                    }
                )
                
                notification_service = TelegramNotificationService()
                notification_service.send_notification(notification)
        
        except Exception as e:
            print(f"Error sending company verification notification: {e}")


# Сигнал для отправки напоминаний о просроченных задачах
def send_overdue_task_reminders():
    """Отправка напоминаний о просроченных задачах"""
    try:
        from erp.models import ProjectTask
        
        overdue_tasks = ProjectTask.objects.filter(
            due_date__lt=timezone.now().date(),
            status__in=['pending', 'in_progress'],
            assigned_to__isnull=False
        )
        
        for task in overdue_tasks:
            telegram_user = TelegramUser.objects.filter(
                user=task.assigned_to,
                is_active=True
            ).first()
            
            if telegram_user:
                notification = TelegramNotification.objects.create(
                    user=telegram_user,
                    notification_type='task_overdue',
                    title='⚠️ Задача просрочена',
                    message=f"Задача <b>{task.title}</b> просрочена!\n\n"
                           f"Срок выполнения: {task.due_date.strftime('%d.%m.%Y')}\n"
                           f"Проект: {task.column.board.name if task.column else 'Без проекта'}",
                    data={
                        'task_id': task.id,
                        'task_title': task.title,
                        'due_date': task.due_date.isoformat()
                    }
                )
                
                notification_service = TelegramNotificationService()
                notification_service.send_notification(notification)
    
    except Exception as e:
        print(f"Error sending overdue task reminders: {e}")


# Сигнал для отправки ежедневных отчетов
def send_daily_reports():
    """Отправка ежедневных отчетов"""
    try:
        from erp.models import ProjectTask, Sale, ServiceOrder
        from django.db.models import Count
        from django.utils import timezone
        
        today = timezone.now().date()
        
        # Получаем всех активных пользователей с Telegram
        telegram_users = TelegramUser.objects.filter(is_active=True)
        
        for telegram_user in telegram_users:
            user = telegram_user.user
            
            # Статистика за день
            tasks_created = ProjectTask.objects.filter(
                created_by=user,
                created_at__date=today
            ).count()
            
            tasks_completed = ProjectTask.objects.filter(
                assigned_to=user,
                status='completed',
                updated_at__date=today
            ).count()
            
            sales_created = Sale.objects.filter(
                customer=user,
                sale_date__date=today
            ).count()
            
            service_orders = ServiceOrder.objects.filter(
                customer=user,
                created_at__date=today
            ).count()
            
            # Отправляем отчет только если есть активность
            if tasks_created > 0 or tasks_completed > 0 or sales_created > 0 or service_orders > 0:
                notification = TelegramNotification.objects.create(
                    user=telegram_user,
                    notification_type='daily_report',
                    title='📊 Ежедневный отчет',
                    message=f"<b>Отчет за {today.strftime('%d.%m.%Y')}:</b>\n\n"
                           f"📋 Создано задач: {tasks_created}\n"
                           f"✅ Завершено задач: {tasks_completed}\n"
                           f"💰 Продаж: {sales_created}\n"
                           f"🔧 Заказов на обслуживание: {service_orders}",
                    data={
                        'date': today.isoformat(),
                        'tasks_created': tasks_created,
                        'tasks_completed': tasks_completed,
                        'sales_created': sales_created,
                        'service_orders': service_orders
                    }
                )
                
                notification_service = TelegramNotificationService()
                notification_service.send_notification(notification)
    
    except Exception as e:
        print(f"Error sending daily reports: {e}") 