from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import (
    ProjectTask, TaskHistory, TaskComment, TaskAttachment,
    Sale, ServiceOrder, Inventory, Financial
)

User = get_user_model()

@receiver(post_save, sender=ProjectTask)
def create_task_history(sender, instance, created, **kwargs):
    """Создание записи в истории при изменении задачи"""
    if created:
        # Запись о создании задачи
        TaskHistory.objects.create(
            task=instance,
            user=instance.created_by,
            action='created',
            new_value=f'Задача "{instance.title}" создана'
        )
    else:
        # Получаем старые значения из базы данных
        try:
            old_instance = ProjectTask.objects.get(pk=instance.pk)
            
            # Проверяем изменения в основных полях
            if old_instance.title != instance.title:
                TaskHistory.objects.create(
                    task=instance,
                    user=instance.created_by,
                    action='updated',
                    old_value=f'Название: {old_instance.title}',
                    new_value=f'Название: {instance.title}'
                )
            
            if old_instance.description != instance.description:
                TaskHistory.objects.create(
                    task=instance,
                    user=instance.created_by,
                    action='updated',
                    old_value=f'Описание: {old_instance.description[:50]}...',
                    new_value=f'Описание: {instance.description[:50]}...'
                )
            
            if old_instance.priority != instance.priority:
                TaskHistory.objects.create(
                    task=instance,
                    user=instance.created_by,
                    action='updated',
                    old_value=f'Приоритет: {old_instance.get_priority_display()}',
                    new_value=f'Приоритет: {instance.get_priority_display()}'
                )
            
            if old_instance.due_date != instance.due_date:
                old_date = old_instance.due_date.strftime('%d.%m.%Y %H:%M') if old_instance.due_date else 'Не установлен'
                new_date = instance.due_date.strftime('%d.%m.%Y %H:%M') if instance.due_date else 'Не установлен'
                TaskHistory.objects.create(
                    task=instance,
                    user=instance.created_by,
                    action='updated',
                    old_value=f'Срок: {old_date}',
                    new_value=f'Срок: {new_date}'
                )
            
            if old_instance.assignee != instance.assignee:
                old_assignee = old_instance.assignee.username if old_instance.assignee else 'Не назначен'
                new_assignee = instance.assignee.username if instance.assignee else 'Не назначен'
                TaskHistory.objects.create(
                    task=instance,
                    user=instance.created_by,
                    action='assigned',
                    old_value=f'Исполнитель: {old_assignee}',
                    new_value=f'Исполнитель: {new_assignee}'
                )
            
            if old_instance.column != instance.column:
                TaskHistory.objects.create(
                    task=instance,
                    user=instance.created_by,
                    action='moved',
                    old_value=f'Колонка: {old_instance.column.name}',
                    new_value=f'Колонка: {instance.column.name}'
                )
            
            if old_instance.is_archived != instance.is_archived:
                action = 'archived' if instance.is_archived else 'restored'
                TaskHistory.objects.create(
                    task=instance,
                    user=instance.created_by,
                    action=action,
                    old_value=f'Архивирована: {old_instance.is_archived}',
                    new_value=f'Архивирована: {instance.is_archived}'
                )
                
        except ProjectTask.DoesNotExist:
            pass

@receiver(post_save, sender=TaskComment)
def create_comment_history(sender, instance, created, **kwargs):
    """Создание записи в истории при добавлении комментария"""
    if created:
        TaskHistory.objects.create(
            task=instance.task,
            user=instance.author,
            action='commented',
            new_value=f'Добавлен комментарий: {instance.text[:50]}...'
        )

@receiver(post_save, sender=TaskAttachment)
def create_attachment_history(sender, instance, created, **kwargs):
    """Создание записи в истории при добавлении вложения"""
    if created:
        TaskHistory.objects.create(
            task=instance.task,
            user=instance.uploaded_by,
            action='attachment_added',
            new_value=f'Добавлено вложение: {instance.filename}'
        )

@receiver(post_delete, sender=TaskAttachment)
def create_attachment_delete_history(sender, instance, **kwargs):
    """Создание записи в истории при удалении вложения"""
    TaskHistory.objects.create(
        task=instance.task,
        user=instance.uploaded_by,
        action='attachment_deleted',
        old_value=f'Удалено вложение: {instance.filename}'
    )

# Сигналы для ERP объектов
@receiver(post_save, sender=Sale)
def create_sale_task(sender, instance, created, **kwargs):
    """Автоматическое создание задачи при создании продажи"""
    if created and instance.status == 'pending':
        # Ищем доску для продаж
        try:
            sales_board = instance.company.project_boards.filter(
                board_type='sales',
                is_archived=False
            ).first()
            
            if sales_board:
                # Ищем колонку "Новые продажи" или создаем её
                new_sales_column, _ = sales_board.columns.get_or_create(
                    name='Новые продажи',
                    defaults={'order': 1, 'color': '#ff6b6b'}
                )
                
                # Создаем задачу
                ProjectTask.objects.create(
                    column=new_sales_column,
                    title=f'Продажа {instance.car.title}',
                    description=f'Клиент: {instance.customer.username}\nСумма: {instance.sale_price} ₽\nКомиссия: {instance.commission} ₽',
                    order=0,
                    priority='high',
                    related_sale=instance,
                    related_car=instance.car,
                    related_customer=instance.customer,
                    created_by=instance.customer
                )
        except Exception as e:
            print(f"Ошибка при создании задачи для продажи: {e}")

@receiver(post_save, sender=ServiceOrder)
def create_service_task(sender, instance, created, **kwargs):
    """Автоматическое создание задачи при создании заказа на обслуживание"""
    if created and instance.status == 'scheduled':
        # Ищем доску для сервиса
        try:
            service_board = instance.company.project_boards.filter(
                board_type='service',
                is_archived=False
            ).first()
            
            if service_board:
                # Ищем колонку "Запланированные" или создаем её
                scheduled_column, _ = service_board.columns.get_or_create(
                    name='Запланированные',
                    defaults={'order': 1, 'color': '#4ecdc4'}
                )
                
                # Создаем задачу
                ProjectTask.objects.create(
                    column=scheduled_column,
                    title=f'Обслуживание {instance.car.title}',
                    description=f'Клиент: {instance.customer.username}\nДата: {instance.scheduled_date.strftime("%d.%m.%Y %H:%M")}\nСумма: {instance.total_price} ₽',
                    order=0,
                    priority='medium',
                    due_date=instance.scheduled_date,
                    related_service_order=instance,
                    related_car=instance.car,
                    related_customer=instance.customer,
                    created_by=instance.customer
                )
        except Exception as e:
            print(f"Ошибка при создании задачи для заказа на обслуживание: {e}")

@receiver(pre_save, sender=Inventory)
def check_inventory_status(sender, instance, **kwargs):
    """Проверка статуса инвентаря и создание задач при необходимости"""
    try:
        old_instance = Inventory.objects.get(pk=instance.pk)
        
        # Если статус изменился на "maintenance"
        if old_instance.status != 'maintenance' and instance.status == 'maintenance':
            # Ищем доску для инвентаря
            inventory_board = instance.company.project_boards.filter(
                board_type='inventory',
                is_archived=False
            ).first()
            
            if inventory_board:
                # Ищем колонку "На обслуживании" или создаем её
                maintenance_column, _ = inventory_board.columns.get_or_create(
                    name='На обслуживании',
                    defaults={'order': 2, 'color': '#feca57'}
                )
                
                # Создаем задачу
                ProjectTask.objects.create(
                    column=maintenance_column,
                    title=f'Обслуживание {instance.car.title}',
                    description=f'Автомобиль отправлен на обслуживание\nМестоположение: {instance.location}\nЗаметки: {instance.notes}',
                    order=0,
                    priority='medium',
                    related_car=instance.car,
                    created_by=User.objects.filter(is_staff=True).first()
                )
    except Inventory.DoesNotExist:
        pass

@receiver(post_save, sender=Financial)
def create_financial_task(sender, instance, created, **kwargs):
    """Создание задачи для крупных финансовых операций"""
    if created and instance.amount > 100000:  # Для операций больше 100k
        try:
            # Ищем общую доску
            general_board = instance.company.project_boards.filter(
                board_type='general',
                is_archived=False
            ).first()
            
            if general_board:
                # Ищем колонку "Финансы" или создаем её
                finance_column, _ = general_board.columns.get_or_create(
                    name='Финансы',
                    defaults={'order': 3, 'color': '#48dbfb'}
                )
                
                # Создаем задачу
                ProjectTask.objects.create(
                    column=finance_column,
                    title=f'Финансовая операция: {instance.get_operation_type_display()}',
                    description=f'Сумма: {instance.amount} ₽\nКатегория: {instance.category}\nОписание: {instance.description}',
                    order=0,
                    priority='high' if instance.amount > 500000 else 'medium',
                    related_sale=None,  # Можно связать с продажей если есть
                    created_by=instance.created_by
                )
        except Exception as e:
            print(f"Ошибка при создании задачи для финансовой операции: {e}")

# Сигналы для обновления статусов
@receiver(post_save, sender=ProjectTask)
def update_related_objects_status(sender, instance, **kwargs):
    """Обновление статусов связанных ERP объектов при изменении задачи"""
    try:
        # Если задача перемещена в колонку "Завершено"
        if 'завершено' in instance.column.name.lower():
            # Обновляем статус продажи
            if instance.related_sale and instance.related_sale.status == 'pending':
                instance.related_sale.status = 'completed'
                instance.related_sale.save()
            
            # Обновляем статус заказа на обслуживание
            if instance.related_service_order and instance.related_service_order.status == 'in_progress':
                instance.related_service_order.status = 'completed'
                instance.related_service_order.save()
                
    except Exception as e:
        print(f"Ошибка при обновлении статусов связанных объектов: {e}") 