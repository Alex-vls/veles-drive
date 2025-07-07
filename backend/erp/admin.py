from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from django.utils.translation import gettext_lazy as _
from .models import (
    Inventory, Sale, Service, ServiceOrder, ServiceOrderItem, Financial,
    ProjectBoard, ProjectColumn, ProjectTask, TaskComment, TaskAttachment, TaskHistory, TaskLabel,
    Project, ProjectMember, Board, Column, Task, TaskLabelAssignment,
    Sprint, SprintTask, TimeEntry
)

# ERP Admin
@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ['car', 'company', 'quantity', 'cost_price', 'selling_price', 'status', 'profit_margin_display', 'location']
    list_filter = ['status', 'company', 'created_at']
    search_fields = ['car__title', 'location', 'notes']
    readonly_fields = ['profit_margin_display', 'created_at', 'updated_at']
    list_editable = ['quantity', 'cost_price', 'selling_price', 'status']
    
    def profit_margin_display(self, obj):
        margin = obj.profit_margin
        color = 'green' if margin > 0 else 'red'
        return format_html('<span style="color: {};">{:.1f}%</span>', color, margin)
    profit_margin_display.short_description = 'Маржинальность'

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['car', 'company', 'customer', 'sale_price', 'commission', 'total_amount_display', 'status', 'sale_date']
    list_filter = ['status', 'company', 'sale_date']
    search_fields = ['car__title', 'customer__username', 'notes']
    readonly_fields = ['total_amount_display', 'sale_date', 'created_at', 'updated_at']
    list_editable = ['status']
    
    def total_amount_display(self, obj):
        return f"{obj.total_amount} ₽"
    total_amount_display.short_description = 'Общая сумма'

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'price', 'duration', 'category', 'is_active']
    list_filter = ['category', 'company', 'is_active']
    search_fields = ['name', 'description']
    list_editable = ['price', 'is_active']

@admin.register(ServiceOrder)
class ServiceOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'company', 'customer', 'car', 'total_price', 'status', 'scheduled_date', 'completed_date']
    list_filter = ['status', 'company', 'scheduled_date']
    search_fields = ['car__title', 'customer__username', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['status']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('company', 'customer', 'car')

@admin.register(ServiceOrderItem)
class ServiceOrderItemAdmin(admin.ModelAdmin):
    list_display = ['service_order', 'service', 'quantity', 'price', 'total_price']
    list_filter = ['service__category']
    search_fields = ['service__name']
    
    def total_price(self, obj):
        return obj.quantity * obj.price
    total_price.short_description = 'Общая стоимость'

@admin.register(Financial)
class FinancialAdmin(admin.ModelAdmin):
    list_display = ['operation_type', 'company', 'amount', 'category', 'description', 'date', 'created_by']
    list_filter = ['operation_type', 'company', 'category', 'date']
    search_fields = ['description']
    readonly_fields = ['date', 'created_by', 'created_at', 'updated_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Только при создании
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

# Trello-like Project Management Admin
@admin.register(TaskLabel)
class TaskLabelAdmin(admin.ModelAdmin):
    list_display = ['name', 'board', 'color_display', 'created_at']
    list_filter = ['board']
    search_fields = ['name']
    
    def color_display(self, obj):
        return format_html(
            '<div style="background-color: {}; width: 20px; height: 20px; border-radius: 3px;"></div>',
            obj.color
        )
    color_display.short_description = 'Цвет'

@admin.register(ProjectColumn)
class ProjectColumnAdmin(admin.ModelAdmin):
    list_display = ['name', 'board', 'order', 'color_display', 'tasks_count', 'is_archived']
    list_filter = ['board', 'is_archived']
    search_fields = ['name']
    list_editable = ['order', 'is_archived']
    ordering = ['board', 'order']
    
    def color_display(self, obj):
        return format_html(
            '<div style="background-color: {}; width: 20px; height: 20px; border-radius: 3px;"></div>',
            obj.color
        )
    color_display.short_description = 'Цвет'
    
    def tasks_count(self, obj):
        return obj.tasks.count()
    tasks_count.short_description = 'Задач'

@admin.register(ProjectBoard)
class ProjectBoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'board_type', 'color_display', 'columns_count', 'tasks_count', 'is_archived', 'created_by']
    list_filter = ['board_type', 'company', 'is_archived', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    list_editable = ['is_archived']
    
    def color_display(self, obj):
        return format_html(
            '<div style="background-color: {}; width: 20px; height: 20px; border-radius: 3px;"></div>',
            obj.color
        )
    color_display.short_description = 'Цвет'
    
    def columns_count(self, obj):
        return obj.columns.count()
    columns_count.short_description = 'Колонок'
    
    def tasks_count(self, obj):
        return ProjectTask.objects.filter(column__board=obj).count()
    tasks_count.short_description = 'Задач'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Только при создании
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ProjectTask)
class ProjectTaskAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'column', 'assignee', 'priority', 'due_date', 'is_overdue_display', 
        'labels_display', 'is_archived'
    ]
    list_filter = ['priority', 'column__board', 'assignee', 'is_archived', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_by', 'created_at', 'updated_at', 'is_overdue_display']
    list_editable = ['priority', 'is_archived']
    filter_horizontal = ['labels']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'column', 'assignee', 'priority', 'due_date')
        }),
        ('Связи с ERP', {
            'fields': ('related_sale', 'related_service_order', 'related_car', 'related_customer'),
            'classes': ('collapse',)
        }),
        ('Дополнительно', {
            'fields': ('labels', 'is_archived', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_overdue_display(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red;">Просрочена</span>')
        return format_html('<span style="color: green;">В срок</span>')
    is_overdue_display.short_description = 'Статус'
    
    def labels_display(self, obj):
        labels = obj.labels.all()
        if labels:
            return format_html(
                ' '.join([
                    f'<span style="background-color: {label.color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">{label.name}</span>'
                    for label in labels
                ])
            )
        return '-'
    labels_display.short_description = 'Метки'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Только при создании
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'text_preview', 'created_at']
    list_filter = ['task__column__board', 'author', 'created_at']
    search_fields = ['text', 'task__title']
    readonly_fields = ['created_at', 'updated_at']
    
    def text_preview(self, obj):
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    text_preview.short_description = 'Текст'

@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):
    list_display = ['filename', 'task', 'uploaded_by', 'file_size', 'uploaded_at']
    list_filter = ['task__column__board', 'uploaded_by', 'uploaded_at']
    search_fields = ['filename', 'task__title']
    readonly_fields = ['uploaded_by', 'uploaded_at']

@admin.register(TaskHistory)
class TaskHistoryAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'action', 'created_at']
    list_filter = ['action', 'task__column__board', 'user', 'created_at']
    search_fields = ['task__title', 'action']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

# Кастомная админка для ERP
class VelesAutoERPAdminSite(admin.AdminSite):
    site_header = "VELES AUTO - ERP Система"
    site_title = "VELES AUTO ERP"
    index_title = "Панель управления ERP"
    
    def get_app_list(self, request):
        app_list = super().get_app_list(request)
        
        # Добавляем ERP модули
        erp_app = {
            'name': 'ERP Система',
            'app_label': 'erp',
            'models': [
                {'name': 'Инвентарь', 'object_name': 'inventory', 'admin_url': '/admin/erp/inventory/'},
                {'name': 'Продажи', 'object_name': 'sale', 'admin_url': '/admin/erp/sale/'},
                {'name': 'Услуги', 'object_name': 'service', 'admin_url': '/admin/erp/service/'},
                {'name': 'Заказы на обслуживание', 'object_name': 'serviceorder', 'admin_url': '/admin/erp/serviceorder/'},
                {'name': 'Финансовые операции', 'object_name': 'financial', 'admin_url': '/admin/erp/financial/'},
            ]
        }
        
        # Добавляем Trello модули
        trello_app = {
            'name': 'Управление проектами',
            'app_label': 'trello',
            'models': [
                {'name': 'Доски проектов', 'object_name': 'projectboard', 'admin_url': '/admin/erp/projectboard/'},
                {'name': 'Колонки проектов', 'object_name': 'projectcolumn', 'admin_url': '/admin/erp/projectcolumn/'},
                {'name': 'Задачи проектов', 'object_name': 'projecttask', 'admin_url': '/admin/erp/projecttask/'},
                {'name': 'Метки задач', 'object_name': 'tasklabel', 'admin_url': '/admin/erp/tasklabel/'},
                {'name': 'Комментарии к задачам', 'object_name': 'taskcomment', 'admin_url': '/admin/erp/taskcomment/'},
                {'name': 'Вложения к задачам', 'object_name': 'taskattachment', 'admin_url': '/admin/erp/taskattachment/'},
                {'name': 'История задач', 'object_name': 'taskhistory', 'admin_url': '/admin/erp/taskhistory/'},
            ]
        }
        
        app_list.append(erp_app)
        app_list.append(trello_app)
        return app_list

# Создаем экземпляр кастомной админки
erp_admin_site = VelesAutoERPAdminSite(name='erp_admin')

# Регистрируем модели в кастомной админке
erp_admin_site.register(Inventory, InventoryAdmin)
erp_admin_site.register(Sale, SaleAdmin)
erp_admin_site.register(Service, ServiceAdmin)
erp_admin_site.register(ServiceOrder, ServiceOrderAdmin)
erp_admin_site.register(ServiceOrderItem, ServiceOrderItemAdmin)
erp_admin_site.register(Financial, FinancialAdmin)
erp_admin_site.register(ProjectBoard, ProjectBoardAdmin)
erp_admin_site.register(ProjectColumn, ProjectColumnAdmin)
erp_admin_site.register(ProjectTask, ProjectTaskAdmin)
erp_admin_site.register(TaskLabel, TaskLabelAdmin)
erp_admin_site.register(TaskComment, TaskCommentAdmin)
erp_admin_site.register(TaskAttachment, TaskAttachmentAdmin)
erp_admin_site.register(TaskHistory, TaskHistoryAdmin)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'status', 'progress', 'member_count', 'task_count', 'created_at']
    list_filter = ['status', 'created_at', 'start_date', 'end_date']
    search_fields = ['name', 'description', 'owner__username', 'owner__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Основная информация'), {
            'fields': ('name', 'description', 'owner', 'status')
        }),
        (_('Даты'), {
            'fields': ('start_date', 'end_date')
        }),
        (_('Системная информация'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = _('Участников')

    def task_count(self, obj):
        return Task.objects.filter(column__board__project=obj).count()
    task_count.short_description = _('Задач')

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'joined_at']
    list_filter = ['role', 'joined_at', 'project']
    search_fields = ['user__username', 'user__email', 'project__name']
    readonly_fields = ['joined_at']

@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'order', 'task_count', 'is_archived', 'created_at']
    list_filter = ['is_archived', 'created_at', 'project']
    search_fields = ['name', 'description', 'project__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['project', 'order']

    def task_count(self, obj):
        return Task.objects.filter(column__board=obj, is_archived=False).count()
    task_count.short_description = _('Задач')

@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    list_display = ['name', 'board', 'order', 'task_count', 'wip_limit', 'is_archived']
    list_filter = ['is_archived', 'created_at', 'board__project']
    search_fields = ['name', 'board__name']
    readonly_fields = ['created_at']
    ordering = ['board', 'order']

    def task_count(self, obj):
        return obj.tasks.filter(is_archived=False).count()
    task_count.short_description = _('Задач')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'project', 'column', 'assignee', 'reporter', 
        'priority', 'status', 'due_date', 'is_overdue', 'is_archived'
    ]
    list_filter = [
        'priority', 'status', 'is_archived', 'created_at', 
        'due_date', 'column__board__project'
    ]
    search_fields = ['title', 'description', 'assignee__username', 'reporter__username']
    readonly_fields = ['created_at', 'updated_at', 'is_overdue']
    
    fieldsets = (
        (_('Основная информация'), {
            'fields': ('title', 'description', 'column', 'assignee', 'reporter')
        }),
        (_('Статус и приоритет'), {
            'fields': ('priority', 'status', 'due_date')
        }),
        (_('Системная информация'), {
            'fields': ('order', 'is_archived', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def project(self, obj):
        return obj.column.board.project.name
    project.short_description = _('Проект')

    def is_overdue(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red;">Да</span>')
        return format_html('<span style="color: green;">Нет</span>')
    is_overdue.short_description = _('Просрочена')

@admin.register(TaskLabelAssignment)
class TaskLabelAssignmentAdmin(admin.ModelAdmin):
    list_display = ['task', 'label', 'assigned_at']
    list_filter = ['label', 'assigned_at', 'task__column__board']
    search_fields = ['task__title', 'label__name']
    readonly_fields = ['assigned_at']