from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from .models import (
    Project, ProjectMember, Board, Column, Task, TaskLabel, 
    TaskLabelAssignment, TaskComment, TaskAttachment, TaskHistory,
    Sprint, SprintTask, TimeEntry,
    Inventory, Sale, Service, ServiceOrder, ServiceOrderItem, Financial,
    ProjectBoard, ProjectColumn, ProjectTask, TaskComment, TaskAttachment, TaskHistory, TaskLabel
)
from cars.models import (
    Auction, AuctionBid,
    LeasingCompany, LeasingProgram, LeasingApplication,
    InsuranceCompany, InsuranceType, InsurancePolicy, InsuranceClaim
)
from cars.serializers import CarSerializer, CompanySerializer
from users.serializers import UserSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar']

class ProjectMemberSerializer(serializers.ModelSerializer):
    """Сериализатор участника проекта"""
    user = UserSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'role', 'role_display', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    """Сериализатор проекта"""
    owner = UserSerializer(read_only=True)
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    member_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    overdue_task_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'status', 'status_display', 'owner',
            'start_date', 'end_date', 'budget', 'progress', 'members',
            'member_count', 'task_count', 'overdue_task_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.members.count()

    def get_task_count(self, obj):
        return Task.objects.filter(column__board__project=obj).count()

    def get_overdue_task_count(self, obj):
        return Task.objects.filter(
            column__board__project=obj,
            due_date__lt=timezone.now(),
            status__in=['todo', 'in_progress', 'review']
        ).count()

class ColumnSerializer(serializers.ModelSerializer):
    """Сериализатор колонки"""
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Column
        fields = [
            'id', 'name', 'order', 'color', 'wip_limit', 'is_archived',
            'task_count', 'created_at'
        ]

    def get_task_count(self, obj):
        return obj.tasks.filter(is_archived=False).count()

class TaskLabelSerializer(serializers.ModelSerializer):
    """Сериализатор метки задачи"""
    class Meta:
        model = TaskLabel
        fields = ['id', 'name', 'color', 'created_at']

class TaskCommentSerializer(serializers.ModelSerializer):
    """Сериализатор комментария к задаче"""
    author = UserSerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']

class TaskAttachmentSerializer(serializers.ModelSerializer):
    """Сериализатор вложения к задаче"""
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TaskAttachment
        fields = [
            'id', 'file', 'filename', 'file_size', 'uploaded_by',
            'file_url', 'uploaded_at'
        ]
        read_only_fields = ['uploaded_by', 'uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            return self.context['request'].build_absolute_uri(obj.file.url)
        return None

class TaskSerializer(serializers.ModelSerializer):
    """Сериализатор задачи"""
    assignee = UserSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)
    column = ColumnSerializer(read_only=True)
    labels = TaskLabelSerializer(many=True, read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    comment_count = serializers.SerializerMethodField()
    attachment_count = serializers.SerializerMethodField()
    time_spent = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'column', 'assignee', 'reporter',
            'priority', 'priority_display', 'status', 'status_display',
            'story_points', 'due_date', 'order', 'is_archived',
            'labels', 'comments', 'attachments', 'comment_count',
            'attachment_count', 'time_spent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['reporter', 'created_at', 'updated_at']

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_attachment_count(self, obj):
        return obj.attachments.count()

    def get_time_spent(self, obj):
        total_minutes = obj.time_entries.aggregate(
            total=models.Sum('duration_minutes')
        )['total'] or 0
        return total_minutes

class BoardSerializer(serializers.ModelSerializer):
    """Сериализатор доски"""
    columns = ColumnSerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = [
            'id', 'name', 'description', 'project', 'order', 'is_archived',
            'columns', 'task_count', 'created_at', 'updated_at'
        ]

    def get_task_count(self, obj):
        return Task.objects.filter(column__board=obj, is_archived=False).count()

class TaskHistorySerializer(serializers.ModelSerializer):
    """Сериализатор истории задачи"""
    user = UserSerializer(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = TaskHistory
        fields = [
            'id', 'task', 'user', 'action', 'action_display',
            'old_value', 'new_value', 'timestamp'
        ]
        read_only_fields = ['user', 'timestamp']

class SprintSerializer(serializers.ModelSerializer):
    """Сериализатор спринта"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_task_count = serializers.SerializerMethodField()

    class Meta:
        model = Sprint
        fields = [
            'id', 'name', 'project', 'start_date', 'end_date', 'goal',
            'status', 'status_display', 'task_count', 'completed_task_count',
            'created_at'
        ]

    def get_task_count(self, obj):
        return obj.sprint_tasks.count()

    def get_completed_task_count(self, obj):
        return obj.sprint_tasks.filter(task__status='done').count()

class TimeEntrySerializer(serializers.ModelSerializer):
    """Сериализатор учета времени"""
    user = UserSerializer(read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    duration_hours = serializers.SerializerMethodField()

    class Meta:
        model = TimeEntry
        fields = [
            'id', 'task', 'task_title', 'user', 'description',
            'start_time', 'end_time', 'duration_minutes', 'duration_hours',
            'created_at'
        ]
        read_only_fields = ['user', 'created_at']

    def get_duration_hours(self, obj):
        if obj.duration_minutes:
            return round(obj.duration_minutes / 60, 2)
        return 0

# Сериализаторы для создания/обновления
class ProjectCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания проекта"""
    class Meta:
        model = Project
        fields = ['name', 'description', 'start_date', 'end_date', 'budget']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

class TaskCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания задачи"""
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'column', 'assignee', 'priority',
            'story_points', 'due_date'
        ]

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)

class TaskUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления задачи"""
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'column', 'assignee', 'priority',
            'status', 'story_points', 'due_date', 'order'
        ]

class BoardCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания доски"""
    class Meta:
        model = Board
        fields = ['name', 'description', 'project']

class ColumnCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания колонки"""
    class Meta:
        model = Column
        fields = ['name', 'board', 'color', 'wip_limit']

class SprintCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания спринта"""
    class Meta:
        model = Sprint
        fields = ['name', 'project', 'start_date', 'end_date', 'goal']

# Сериализаторы для статистики
class ProjectStatsSerializer(serializers.Serializer):
    """Сериализатор статистики проекта"""
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    total_time_spent = serializers.IntegerField()  # в минутах
    progress_percentage = serializers.FloatField()
    tasks_by_status = serializers.DictField()
    tasks_by_priority = serializers.DictField()

class UserStatsSerializer(serializers.Serializer):
    """Сериализатор статистики пользователя"""
    total_tasks_assigned = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    total_time_spent = serializers.IntegerField()  # в минутах
    tasks_by_project = serializers.DictField()

# ERP Serializers
class InventorySerializer(serializers.ModelSerializer):
    car = CarSerializer(read_only=True)
    car_id = serializers.IntegerField(write_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    profit_margin = serializers.ReadOnlyField()

    class Meta:
        model = Inventory
        fields = [
            'id', 'company', 'company_id', 'car', 'car_id', 'quantity', 
            'cost_price', 'selling_price', 'status', 'location', 'notes',
            'profit_margin', 'created_at', 'updated_at'
        ]

class SaleSerializer(serializers.ModelSerializer):
    car = CarSerializer(read_only=True)
    car_id = serializers.IntegerField(write_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    customer = UserSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = Sale
        fields = [
            'id', 'company', 'company_id', 'car', 'car_id', 'customer', 'customer_id',
            'sale_price', 'commission', 'sale_date', 'status', 'notes', 'total_amount',
            'created_at', 'updated_at'
        ]

class ServiceSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'company', 'company_id', 'name', 'description', 'price',
            'duration', 'category', 'is_active', 'created_at', 'updated_at'
        ]

class ServiceOrderItemSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ServiceOrderItem
        fields = ['id', 'service', 'service_id', 'quantity', 'price']

class ServiceOrderSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    customer = UserSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    car = CarSerializer(read_only=True)
    car_id = serializers.IntegerField(write_only=True)
    services = ServiceOrderItemSerializer(source='serviceorderitem_set', many=True, read_only=True)
    service_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = ServiceOrder
        fields = [
            'id', 'company', 'company_id', 'customer', 'customer_id', 'car', 'car_id',
            'services', 'service_ids', 'total_price', 'status', 'scheduled_date',
            'completed_date', 'notes', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        service_ids = validated_data.pop('service_ids', [])
        service_order = ServiceOrder.objects.create(**validated_data)
        
        # Добавляем услуги
        for service_id in service_ids:
            try:
                service = Service.objects.get(id=service_id)
                ServiceOrderItem.objects.create(
                    service_order=service_order,
                    service=service,
                    price=service.price
                )
            except Service.DoesNotExist:
                pass
        
        return service_order

class FinancialSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Financial
        fields = [
            'id', 'company', 'company_id', 'operation_type', 'amount', 'description',
            'category', 'date', 'created_by', 'created_at', 'updated_at'
        ]

# Project Board Serializers (Trello-like)
class ProjectColumnSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = ProjectColumn
        fields = [
            'id', 'board', 'name', 'order', 'color', 'is_archived',
            'task_count', 'created_at', 'updated_at'
        ]

    def get_task_count(self, obj):
        return obj.tasks.filter(is_archived=False).count()

class ProjectTaskSerializer(serializers.ModelSerializer):
    column = ProjectColumnSerializer(read_only=True)
    column_id = serializers.IntegerField(write_only=True)
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    labels = TaskLabelSerializer(many=True, read_only=True)
    label_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    related_sale = SaleSerializer(read_only=True)
    related_service_order = ServiceOrderSerializer(read_only=True)
    related_car = CarSerializer(read_only=True)
    related_customer = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = ProjectTask
        fields = [
            'id', 'column', 'column_id', 'title', 'description', 'order',
            'priority', 'due_date', 'assignee', 'assignee_id', 'labels', 'label_ids',
            'related_sale', 'related_service_order', 'related_car', 'related_customer',
            'is_archived', 'created_by', 'is_overdue', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        label_ids = validated_data.pop('label_ids', [])
        task = ProjectTask.objects.create(**validated_data)
        
        # Добавляем метки
        for label_id in label_ids:
            try:
                label = TaskLabel.objects.get(id=label_id)
                task.labels.add(label)
            except TaskLabel.DoesNotExist:
                pass
        
        return task

    def update(self, instance, validated_data):
        label_ids = validated_data.pop('label_ids', None)
        
        # Обновляем основные поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Обновляем метки если переданы
        if label_ids is not None:
            instance.labels.clear()
            for label_id in label_ids:
                try:
                    label = TaskLabel.objects.get(id=label_id)
                    instance.labels.add(label)
                except TaskLabel.DoesNotExist:
                    pass
        
        return instance

class ProjectBoardSerializer(serializers.ModelSerializer):
    columns = ProjectColumnSerializer(many=True, read_only=True)
    labels = TaskLabelSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = ProjectBoard
        fields = [
            'id', 'company', 'company_id', 'name', 'description', 'board_type',
            'color', 'is_archived', 'created_by', 'columns', 'labels',
            'task_count', 'created_at', 'updated_at'
        ]

    def get_task_count(self, obj):
        return ProjectTask.objects.filter(
            column__board=obj,
            is_archived=False
        ).count()

class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    task = ProjectTaskSerializer(read_only=True)
    task_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TaskComment
        fields = [
            'id', 'task', 'task_id', 'author', 'text', 'created_at', 'updated_at'
        ]

class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    task = ProjectTaskSerializer(read_only=True)
    task_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TaskAttachment
        fields = [
            'id', 'task', 'task_id', 'file', 'filename', 'file_size',
            'uploaded_by', 'uploaded_at'
        ]

class TaskHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    task = ProjectTaskSerializer(read_only=True)

    class Meta:
        model = TaskHistory
        fields = [
            'id', 'task', 'user', 'action', 'old_value', 'new_value', 'created_at'
        ]

# Dashboard and Report Serializers
class DashboardStatsSerializer(serializers.Serializer):
    total_inventory = serializers.IntegerField()
    available_inventory = serializers.IntegerField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_services = serializers.IntegerField()
    active_service_orders = serializers.IntegerField()
    total_financial_operations = serializers.IntegerField()
    profit_margin = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()

class SalesReportSerializer(serializers.Serializer):
    period = serializers.CharField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_sale_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    top_selling_cars = serializers.ListField()
    sales_by_month = serializers.ListField()

class FinancialReportSerializer(serializers.Serializer):
    period = serializers.CharField()
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    profit_margin = serializers.DecimalField(max_digits=5, decimal_places=2)
    operations_by_category = serializers.ListField()
    operations_by_month = serializers.ListField()

class TaskReportSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    tasks_by_priority = serializers.ListField()
    tasks_by_assignee = serializers.ListField()
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2) 

# ============================================================================
# AUCTION SERIALIZERS
# ============================================================================

class AuctionBidSerializer(serializers.ModelSerializer):
    bidder = UserSerializer(read_only=True)
    auction = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AuctionBid
        fields = ['id', 'auction', 'bidder', 'amount', 'is_winning', 'created_at']
        read_only_fields = ['bidder', 'is_winning', 'created_at']

class AuctionSerializer(serializers.ModelSerializer):
    vehicle = CarSerializer(read_only=True)
    vehicle_id = serializers.IntegerField(write_only=True)
    created_by = UserSerializer(read_only=True)
    bids = AuctionBidSerializer(many=True, read_only=True)
    total_bids = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()

    class Meta:
        model = Auction
        fields = [
            'id', 'title', 'description', 'auction_type', 'status',
            'vehicle', 'vehicle_id', 'start_date', 'end_date',
            'min_bid', 'reserve_price', 'current_price', 'bid_increment',
            'created_by', 'bids', 'total_bids', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'current_price', 'created_at', 'updated_at']

class AuctionCreateSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Auction
        fields = [
            'title', 'description', 'auction_type', 'vehicle_id',
            'start_date', 'end_date', 'min_bid', 'reserve_price', 'bid_increment'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class AuctionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = [
            'title', 'description', 'auction_type', 'status',
            'start_date', 'end_date', 'min_bid', 'reserve_price', 'bid_increment'
        ]

# ============================================================================
# LEASING SERIALIZERS
# ============================================================================

class LeasingCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeasingCompany
        fields = [
            'id', 'name', 'description', 'logo', 'website', 'phone',
            'email', 'address', 'is_active', 'created_at'
        ]

class LeasingProgramSerializer(serializers.ModelSerializer):
    company = LeasingCompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = LeasingProgram
        fields = [
            'id', 'company', 'company_id', 'name', 'description',
            'min_down_payment', 'max_term', 'interest_rate', 'is_active', 'created_at'
        ]

class LeasingApplicationSerializer(serializers.ModelSerializer):
    program = LeasingProgramSerializer(read_only=True)
    program_id = serializers.IntegerField(write_only=True)
    vehicle = CarSerializer(read_only=True)
    vehicle_id = serializers.IntegerField(write_only=True)
    applicant = UserSerializer(read_only=True)

    class Meta:
        model = LeasingApplication
        fields = [
            'id', 'program', 'program_id', 'vehicle', 'vehicle_id',
            'applicant', 'status', 'down_payment', 'term_months',
            'monthly_payment', 'total_amount', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['applicant', 'monthly_payment', 'total_amount', 'created_at', 'updated_at']

class LeasingCreateSerializer(serializers.ModelSerializer):
    program_id = serializers.IntegerField(write_only=True)
    vehicle_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = LeasingApplication
        fields = [
            'program_id', 'vehicle_id', 'down_payment', 'term_months', 'notes'
        ]

    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)

class LeasingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeasingApplication
        fields = ['status', 'notes']

# ============================================================================
# INSURANCE SERIALIZERS
# ============================================================================

class InsuranceCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceCompany
        fields = [
            'id', 'name', 'description', 'logo', 'website', 'phone',
            'email', 'address', 'license_number', 'is_active', 'created_at'
        ]

class InsuranceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceType
        fields = ['id', 'name', 'description', 'is_mandatory', 'created_at']

class InsurancePolicySerializer(serializers.ModelSerializer):
    company = InsuranceCompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    insurance_type = InsuranceTypeSerializer(read_only=True)
    insurance_type_id = serializers.IntegerField(write_only=True)
    vehicle = CarSerializer(read_only=True)
    vehicle_id = serializers.IntegerField(write_only=True)
    insured_person = UserSerializer(read_only=True)

    class Meta:
        model = InsurancePolicy
        fields = [
            'id', 'company', 'company_id', 'insurance_type', 'insurance_type_id',
            'vehicle', 'vehicle_id', 'policy_number', 'status',
            'start_date', 'end_date', 'premium_amount', 'coverage_amount',
            'deductible', 'insured_person', 'created_at', 'updated_at'
        ]
        read_only_fields = ['insured_person', 'created_at', 'updated_at']

class InsuranceCreateSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(write_only=True)
    insurance_type_id = serializers.IntegerField(write_only=True)
    vehicle_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = InsurancePolicy
        fields = [
            'company_id', 'insurance_type_id', 'vehicle_id', 'policy_number',
            'start_date', 'end_date', 'premium_amount', 'coverage_amount', 'deductible'
        ]

    def create(self, validated_data):
        validated_data['insured_person'] = self.context['request'].user
        return super().create(validated_data)

class InsuranceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsurancePolicy
        fields = ['status', 'premium_amount', 'coverage_amount', 'deductible'] 