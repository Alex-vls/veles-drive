from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from erp.models import (
    Inventory, Sale, Service, ServiceOrder, ServiceOrderItem, Financial,
    ProjectBoard, ProjectColumn, ProjectTask, TaskLabel
)
from cars.models import Car, Company

User = get_user_model()

class Command(BaseCommand):
    help = 'Загружает демо-данные для ERP системы'

    def add_arguments(self, parser):
        parser.add_argument(
            '--company-id',
            type=int,
            help='ID компании для которой загружать данные'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Очистить существующие данные перед загрузкой'
        )

    def handle(self, *args, **options):
        company_id = options.get('company_id')
        clear = options.get('clear')

        if clear:
            self.stdout.write('Очистка существующих данных...')
            self.clear_data(company_id)

        self.stdout.write('Загрузка демо-данных для ERP системы...')

        # Получаем компанию
        if company_id:
            try:
                company = Company.objects.get(id=company_id)
            except Company.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Компания с ID {company_id} не найдена'))
                return
        else:
            company = Company.objects.first()
            if not company:
                self.stdout.write(self.style.ERROR('Компании не найдены. Создайте компанию сначала.'))
                return

        # Получаем пользователей
        users = User.objects.filter(is_active=True)[:5]
        if not users:
            self.stdout.write(self.style.ERROR('Пользователи не найдены'))
            return

        # Получаем автомобили
        cars = Car.objects.filter(company=company)[:10]
        if not cars:
            self.stdout.write(self.style.ERROR('Автомобили не найдены'))
            return

        # Создаем услуги
        services = self.create_services(company)
        self.stdout.write(f'Создано {len(services)} услуг')

        # Создаем инвентарь
        inventory_items = self.create_inventory(company, cars)
        self.stdout.write(f'Создано {len(inventory_items)} позиций инвентаря')

        # Создаем продажи
        sales = self.create_sales(company, cars, users)
        self.stdout.write(f'Создано {len(sales)} продаж')

        # Создаем заказы на обслуживание
        service_orders = self.create_service_orders(company, cars, users, services)
        self.stdout.write(f'Создано {len(service_orders)} заказов на обслуживание')

        # Создаем финансовые операции
        financial_operations = self.create_financial_operations(company, users)
        self.stdout.write(f'Создано {len(financial_operations)} финансовых операций')

        # Создаем доски проектов
        boards = self.create_project_boards(company, users[0])
        self.stdout.write(f'Создано {len(boards)} досок проектов')

        # Создаем задачи
        tasks = self.create_project_tasks(boards, users, sales, service_orders, cars)
        self.stdout.write(f'Создано {len(tasks)} задач')

        self.stdout.write(self.style.SUCCESS('Демо-данные успешно загружены!'))

    def clear_data(self, company_id=None):
        """Очистка существующих данных"""
        if company_id:
            company = Company.objects.get(id=company_id)
            Inventory.objects.filter(company=company).delete()
            Sale.objects.filter(company=company).delete()
            Service.objects.filter(company=company).delete()
            ServiceOrder.objects.filter(company=company).delete()
            Financial.objects.filter(company=company).delete()
            ProjectBoard.objects.filter(company=company).delete()
        else:
            Inventory.objects.all().delete()
            Sale.objects.all().delete()
            Service.objects.all().delete()
            ServiceOrder.objects.all().delete()
            Financial.objects.all().delete()
            ProjectBoard.objects.all().delete()

    def create_services(self, company):
        """Создание услуг"""
        services_data = [
            {'name': 'Замена масла', 'price': 2000, 'duration': timedelta(hours=1), 'category': 'Техобслуживание'},
            {'name': 'Замена тормозных колодок', 'price': 5000, 'duration': timedelta(hours=2), 'category': 'Тормозная система'},
            {'name': 'Диагностика двигателя', 'price': 1500, 'duration': timedelta(minutes=30), 'category': 'Диагностика'},
            {'name': 'Замена аккумулятора', 'price': 3000, 'duration': timedelta(hours=1), 'category': 'Электрика'},
            {'name': 'Замена ремня ГРМ', 'price': 8000, 'duration': timedelta(hours=3), 'category': 'Двигатель'},
            {'name': 'Покраска бампера', 'price': 15000, 'duration': timedelta(days=2), 'category': 'Кузовные работы'},
            {'name': 'Замена стекла', 'price': 12000, 'duration': timedelta(hours=2), 'category': 'Кузовные работы'},
            {'name': 'Замена подвески', 'price': 25000, 'duration': timedelta(hours=4), 'category': 'Подвеска'},
        ]

        services = []
        for data in services_data:
            service = Service.objects.create(
                company=company,
                name=data['name'],
                description=f'Услуга: {data["name"]}',
                price=data['price'],
                duration=data['duration'],
                category=data['category'],
                is_active=True
            )
            services.append(service)

        return services

    def create_inventory(self, company, cars):
        """Создание инвентаря"""
        inventory_items = []
        statuses = ['available', 'reserved', 'sold', 'maintenance']
        
        for car in cars:
            status = random.choice(statuses)
            cost_price = car.price * 0.7  # Себестоимость 70% от цены
            selling_price = car.price * 1.1  # Цена продажи 110% от цены
            
            inventory = Inventory.objects.create(
                company=company,
                car=car,
                quantity=random.randint(1, 3),
                cost_price=cost_price,
                selling_price=selling_price,
                status=status,
                location=random.choice(['Склад А', 'Склад Б', 'Выставочный зал', 'Сервис']),
                notes=f'Демо-запись для {car.title}'
            )
            inventory_items.append(inventory)

        return inventory_items

    def create_sales(self, company, cars, users):
        """Создание продаж"""
        sales = []
        statuses = ['pending', 'completed', 'cancelled']
        
        for _ in range(15):
            car = random.choice(cars)
            customer = random.choice(users)
            status = random.choice(statuses)
            
            sale_price = car.price
            commission = sale_price * 0.05  # 5% комиссия
            
            sale = Sale.objects.create(
                company=company,
                car=car,
                customer=customer,
                sale_price=sale_price,
                commission=commission,
                status=status,
                notes=f'Демо-продажа {car.title}'
            )
            sales.append(sale)

        return sales

    def create_service_orders(self, company, cars, users, services):
        """Создание заказов на обслуживание"""
        service_orders = []
        statuses = ['scheduled', 'in_progress', 'completed']
        
        for _ in range(10):
            car = random.choice(cars)
            customer = random.choice(users)
            status = random.choice(statuses)
            
            # Выбираем случайные услуги
            selected_services = random.sample(services, random.randint(1, 3))
            total_price = sum(service.price for service in selected_services)
            
            scheduled_date = timezone.now() + timedelta(days=random.randint(1, 30))
            completed_date = None
            if status == 'completed':
                completed_date = scheduled_date + timedelta(hours=random.randint(1, 8))

            service_order = ServiceOrder.objects.create(
                company=company,
                customer=customer,
                car=car,
                total_price=total_price,
                status=status,
                scheduled_date=scheduled_date,
                completed_date=completed_date,
                notes=f'Демо-заказ на обслуживание {car.title}'
            )

            # Создаем элементы заказа
            for service in selected_services:
                ServiceOrderItem.objects.create(
                    service_order=service_order,
                    service=service,
                    quantity=1,
                    price=service.price
                )

            service_orders.append(service_order)

        return service_orders

    def create_financial_operations(self, company, users):
        """Создание финансовых операций"""
        operations = []
        operation_types = ['income', 'expense', 'investment']
        categories = ['Продажи', 'Закупки', 'Зарплата', 'Аренда', 'Реклама', 'Инвестиции']
        
        for _ in range(20):
            operation_type = random.choice(operation_types)
            category = random.choice(categories)
            amount = random.randint(10000, 500000)
            created_by = random.choice(users)
            
            operation = Financial.objects.create(
                company=company,
                operation_type=operation_type,
                amount=amount,
                description=f'Демо-операция: {operation_type} - {category}',
                category=category,
                created_by=created_by
            )
            operations.append(operation)

        return operations

    def create_project_boards(self, company, created_by):
        """Создание досок проектов"""
        boards_data = [
            {'name': 'Продажи', 'board_type': 'sales', 'color': '#ff6b6b'},
            {'name': 'Сервис', 'board_type': 'service', 'color': '#4ecdc4'},
            {'name': 'Склад', 'board_type': 'inventory', 'color': '#feca57'},
            {'name': 'Общие задачи', 'board_type': 'general', 'color': '#48dbfb'},
        ]

        boards = []
        for data in boards_data:
            board = ProjectBoard.objects.create(
                company=company,
                name=data['name'],
                description=f'Доска для {data["name"].lower()}',
                board_type=data['board_type'],
                color=data['color'],
                created_by=created_by
            )

            # Создаем колонки для доски
            if data['board_type'] == 'sales':
                columns_data = [
                    {'name': 'Новые продажи', 'order': 1, 'color': '#ff6b6b'},
                    {'name': 'В работе', 'order': 2, 'color': '#ffa726'},
                    {'name': 'Завершено', 'order': 3, 'color': '#66bb6a'},
                ]
            elif data['board_type'] == 'service':
                columns_data = [
                    {'name': 'Запланированные', 'order': 1, 'color': '#4ecdc4'},
                    {'name': 'В работе', 'order': 2, 'color': '#ffa726'},
                    {'name': 'Завершено', 'order': 3, 'color': '#66bb6a'},
                ]
            elif data['board_type'] == 'inventory':
                columns_data = [
                    {'name': 'Доступно', 'order': 1, 'color': '#66bb6a'},
                    {'name': 'На обслуживании', 'order': 2, 'color': '#feca57'},
                    {'name': 'Зарезервировано', 'order': 3, 'color': '#ffa726'},
                ]
            else:  # general
                columns_data = [
                    {'name': 'К выполнению', 'order': 1, 'color': '#48dbfb'},
                    {'name': 'В работе', 'order': 2, 'color': '#ffa726'},
                    {'name': 'На проверке', 'order': 3, 'color': '#feca57'},
                    {'name': 'Завершено', 'order': 4, 'color': '#66bb6a'},
                ]

            for col_data in columns_data:
                ProjectColumn.objects.create(
                    board=board,
                    name=col_data['name'],
                    order=col_data['order'],
                    color=col_data['color']
                )

            # Создаем метки для доски
            labels_data = [
                {'name': 'Срочно', 'color': '#ff4757'},
                {'name': 'Важно', 'color': '#ffa502'},
                {'name': 'Обычно', 'color': '#2ed573'},
                {'name': 'Низкий приоритет', 'color': '#747d8c'},
            ]

            for label_data in labels_data:
                TaskLabel.objects.create(
                    board=board,
                    name=label_data['name'],
                    color=label_data['color']
                )

            boards.append(board)

        return boards

    def create_project_tasks(self, boards, users, sales, service_orders, cars):
        """Создание задач проектов"""
        tasks = []
        priorities = ['low', 'medium', 'high', 'urgent']
        
        # Создаем задачи для продаж
        sales_board = next((b for b in boards if b.board_type == 'sales'), None)
        if sales_board:
            for sale in sales[:5]:
                column = random.choice(sales_board.columns.all())
                assignee = random.choice(users)
                priority = random.choice(priorities)
                
                task = ProjectTask.objects.create(
                    column=column,
                    title=f'Продажа {sale.car.title}',
                    description=f'Клиент: {sale.customer.username}\nСумма: {sale.sale_price} ₽\nКомиссия: {sale.commission} ₽',
                    order=random.randint(0, 10),
                    priority=priority,
                    due_date=timezone.now() + timedelta(days=random.randint(1, 30)),
                    assignee=assignee,
                    related_sale=sale,
                    related_car=sale.car,
                    related_customer=sale.customer,
                    created_by=sale.customer
                )
                tasks.append(task)

        # Создаем задачи для сервиса
        service_board = next((b for b in boards if b.board_type == 'service'), None)
        if service_board:
            for order in service_orders[:5]:
                column = random.choice(service_board.columns.all())
                assignee = random.choice(users)
                priority = random.choice(priorities)
                
                task = ProjectTask.objects.create(
                    column=column,
                    title=f'Обслуживание {order.car.title}',
                    description=f'Клиент: {order.customer.username}\nДата: {order.scheduled_date.strftime("%d.%m.%Y %H:%M")}\nСумма: {order.total_price} ₽',
                    order=random.randint(0, 10),
                    priority=priority,
                    due_date=order.scheduled_date,
                    assignee=assignee,
                    related_service_order=order,
                    related_car=order.car,
                    related_customer=order.customer,
                    created_by=order.customer
                )
                tasks.append(task)

        # Создаем общие задачи
        general_board = next((b for b in boards if b.board_type == 'general'), None)
        if general_board:
            general_tasks = [
                {'title': 'Проверить склад', 'description': 'Инвентаризация склада'},
                {'title': 'Обновить прайс-лист', 'description': 'Обновить цены на услуги'},
                {'title': 'Провести встречу с клиентом', 'description': 'Обсуждение условий сотрудничества'},
                {'title': 'Подготовить отчет', 'description': 'Ежемесячный отчет по продажам'},
                {'title': 'Заказать запчасти', 'description': 'Заказ необходимых запчастей'},
            ]

            for task_data in general_tasks:
                column = random.choice(general_board.columns.all())
                assignee = random.choice(users)
                priority = random.choice(priorities)
                
                task = ProjectTask.objects.create(
                    column=column,
                    title=task_data['title'],
                    description=task_data['description'],
                    order=random.randint(0, 10),
                    priority=priority,
                    due_date=timezone.now() + timedelta(days=random.randint(1, 30)),
                    assignee=assignee,
                    created_by=random.choice(users)
                )
                tasks.append(task)

        return tasks 