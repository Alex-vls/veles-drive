from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from cars.models import Car
from companies.models import Company

User = get_user_model()

# Константы для выбора
INVENTORY_STATUS = [
    ('available', 'Доступен'),
    ('reserved', 'Зарезервирован'),
    ('sold', 'Продан'),
    ('maintenance', 'На обслуживании'),
    ('damaged', 'Поврежден'),
]

SALE_STATUS = [
    ('pending', 'В ожидании'),
    ('completed', 'Завершена'),
    ('cancelled', 'Отменена'),
    ('refunded', 'Возврат'),
]

ORDER_STATUS = [
    ('scheduled', 'Запланирован'),
    ('in_progress', 'В работе'),
    ('completed', 'Завершен'),
    ('cancelled', 'Отменен'),
]

OPERATION_TYPES = [
    ('income', 'Доход'),
    ('expense', 'Расход'),
    ('investment', 'Инвестиция'),
    ('loan', 'Кредит'),
    ('refund', 'Возврат'),
]

BOARD_TYPES = [
    ('sales', 'Продажи'),
    ('service', 'Сервис'),
    ('inventory', 'Склад'),
    ('general', 'Общий'),
]

PRIORITY_CHOICES = [
    ('low', 'Низкий'),
    ('medium', 'Средний'),
    ('high', 'Высокий'),
    ('urgent', 'Срочный'),
]

# ERP Core Models
class Inventory(models.Model):
    """Управление складом"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='inventory_items')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='inventory_items')
    quantity = models.PositiveIntegerField(default=1)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=INVENTORY_STATUS, default='available')
    location = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Инвентарь'
        verbose_name_plural = 'Инвентарь'
        unique_together = ['company', 'car']

    def __str__(self):
        return f"{self.car} - {self.company.name} ({self.get_status_display()})"

    @property
    def profit_margin(self):
        """Маржинальность"""
        if self.cost_price > 0:
            return ((self.selling_price - self.cost_price) / self.cost_price) * 100
        return 0

class Sale(models.Model):
    """Продажи"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='sales')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='sales')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sale_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=SALE_STATUS, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Продажа'
        verbose_name_plural = 'Продажи'

    def __str__(self):
        return f"Продажа {self.car} - {self.customer.username}"

    @property
    def total_amount(self):
        """Общая сумма продажи"""
        return self.sale_price + self.commission

class Service(models.Model):
    """Сервисные услуги"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveIntegerField(help_text='Длительность в минутах')
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'

    def __str__(self):
        return f"{self.name} - {self.company.name}"

class ServiceOrder(models.Model):
    """Заказы на обслуживание"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='service_orders')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_orders')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='service_orders')
    services = models.ManyToManyField(Service, through='ServiceOrderItem')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='scheduled')
    scheduled_date = models.DateTimeField()
    completed_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заказ на обслуживание'
        verbose_name_plural = 'Заказы на обслуживание'

    def __str__(self):
        return f"Заказ {self.id} - {self.car}"

    def save(self, *args, **kwargs):
        if self.status == 'completed' and not self.completed_date:
            self.completed_date = timezone.now()
        super().save(*args, **kwargs)

class ServiceOrderItem(models.Model):
    """Элементы заказа на обслуживание"""
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Элемент заказа'
        verbose_name_plural = 'Элементы заказа'

    def __str__(self):
        return f"{self.service.name} x{self.quantity}"

class Financial(models.Model):
    """Финансовые операции"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='financial_operations')
    operation_type = models.CharField(max_length=20, choices=OPERATION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    category = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_financial_operations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Финансовая операция'
        verbose_name_plural = 'Финансовые операции'
        ordering = ['-date']

    def __str__(self):
        return f"{self.get_operation_type_display()} - {self.amount} ({self.company.name})"

# Trello-like Project Management Models
class TaskLabel(models.Model):
    """Метки для задач"""
    board = models.ForeignKey('ProjectBoard', on_delete=models.CASCADE, related_name='labels')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#007bff')  # HEX color
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Метка задачи'
        verbose_name_plural = 'Метки задач'
        unique_together = ['board', 'name']

    def __str__(self):
        return f"{self.name} ({self.board.name})"

class ProjectColumn(models.Model):
    """Колонки досок проектов"""
    board = models.ForeignKey('ProjectBoard', on_delete=models.CASCADE, related_name='columns')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=7, default='#6c757d')  # HEX color
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Колонка проекта'
        verbose_name_plural = 'Колонки проектов'
        ordering = ['board', 'order']
        unique_together = ['board', 'name']

    def __str__(self):
        return f"{self.name} ({self.board.name})"

class ProjectBoard(models.Model):
    """Доски проектов"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='project_boards')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    board_type = models.CharField(max_length=20, choices=BOARD_TYPES, default='general')
    color = models.CharField(max_length=7, default='#007bff')  # HEX color
    is_archived = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_boards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Доска проекта'
        verbose_name_plural = 'Доски проектов'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.company.name})"

class ProjectTask(models.Model):
    """Задачи проектов (связанные с ERP)"""
    column = models.ForeignKey(ProjectColumn, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateTimeField(null=True, blank=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    labels = models.ManyToManyField(TaskLabel, blank=True)
    
    # Связи с ERP объектами
    related_sale = models.ForeignKey(Sale, on_delete=models.SET_NULL, null=True, blank=True)
    related_service_order = models.ForeignKey(ServiceOrder, on_delete=models.SET_NULL, null=True, blank=True)
    related_car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True)
    related_customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_tasks')
    
    is_archived = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Задача проекта'
        verbose_name_plural = 'Задачи проектов'
        ordering = ['order']

    def __str__(self):
        return f"{self.title} - {self.column.board.name}"

    @property
    def is_overdue(self):
        if self.due_date and timezone.now() > self.due_date:
            return True
        return False

class TaskComment(models.Model):
    """Комментарии к задачам"""
    task = models.ForeignKey(ProjectTask, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Комментарий к задаче'
        verbose_name_plural = 'Комментарии к задачам'
        ordering = ['-created_at']

    def __str__(self):
        return f"Комментарий от {self.author.username} к {self.task.title}"

class TaskAttachment(models.Model):
    """Вложения к задачам"""
    task = models.ForeignKey(ProjectTask, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='task_attachments/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_attachments')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Вложение к задаче'
        verbose_name_plural = 'Вложения к задачам'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.filename} - {self.task.title}"

class TaskHistory(models.Model):
    """История изменений задач"""
    task = models.ForeignKey(ProjectTask, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_history_actions')
    action = models.CharField(max_length=100)  # 'created', 'updated', 'moved', etc.
    details = models.JSONField(default=dict)  # Store additional details about the action
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'История задачи'
        verbose_name_plural = 'История задач'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} - {self.task.title} by {self.user.username}"

# Legacy models for backward compatibility
class Project(models.Model):
    """Проект (устаревшая модель)"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    members = models.ManyToManyField(User, through='ProjectMember', related_name='member_projects')
    status = models.CharField(max_length=20, choices=[
        ('active', 'Активный'),
        ('completed', 'Завершен'),
        ('archived', 'Архивирован'),
    ], default='active')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def progress(self):
        """Прогресс проекта"""
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0
        completed_tasks = self.tasks.filter(status='completed').count()
        return (completed_tasks / total_tasks) * 100

class ProjectMember(models.Model):
    """Участник проекта"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_memberships')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=50, choices=[
        ('owner', 'Владелец'),
        ('admin', 'Администратор'),
        ('member', 'Участник'),
        ('viewer', 'Наблюдатель'),
    ], default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Участник проекта'
        verbose_name_plural = 'Участники проектов'
        unique_together = ['user', 'project']
        ordering = ['-joined_at']

    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.role})"

class Board(models.Model):
    """Доска (устаревшая модель)"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='boards')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Доска'
        verbose_name_plural = 'Доски'
        ordering = ['project', 'order']

    def __str__(self):
        return f"{self.name} ({self.project.name})"

class Column(models.Model):
    """Колонка (устаревшая модель)"""
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='columns')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    wip_limit = models.PositiveIntegerField(null=True, blank=True)  # Work in Progress limit
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Колонка'
        verbose_name_plural = 'Колонки'
        ordering = ['board', 'order']

    def __str__(self):
        return f"{self.name} ({self.board.name})"

class Task(models.Model):
    """Задача (устаревшая модель)"""
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_legacy_tasks')
    reporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_tasks')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=[
        ('todo', 'К выполнению'),
        ('in_progress', 'В работе'),
        ('review', 'На проверке'),
        ('done', 'Завершено'),
    ], default='todo')
    due_date = models.DateTimeField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def project(self):
        return self.column.board.project

    @property
    def is_overdue(self):
        if self.due_date and timezone.now() > self.due_date:
            return True
        return False

class TaskLabelAssignment(models.Model):
    """Назначение меток задачам (устаревшая модель)"""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='label_assignments')
    label = models.ForeignKey(TaskLabel, on_delete=models.CASCADE, related_name='task_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Назначение метки'
        verbose_name_plural = 'Назначения меток'
        unique_together = ['task', 'label']

    def __str__(self):
        return f"{self.label.name} -> {self.task.title}"

class Sprint(models.Model):
    """Спринт (устаревшая модель)"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sprints')
    name = models.CharField(max_length=200)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Спринт'
        verbose_name_plural = 'Спринты'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} ({self.project.name})"

class SprintTask(models.Model):
    """Задача в спринте (устаревшая модель)"""
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE, related_name='tasks')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='sprints')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Задача в спринте'
        verbose_name_plural = 'Задачи в спринтах'
        unique_together = ['sprint', 'task']

    def __str__(self):
        return f"{self.task.title} in {self.sprint.name}"

class TimeEntry(models.Model):
    """Запись времени (устаревшая модель)"""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='time_entries')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_entries')
    description = models.TextField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Запись времени'
        verbose_name_plural = 'Записи времени'
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.hours}h on {self.task.title}" 