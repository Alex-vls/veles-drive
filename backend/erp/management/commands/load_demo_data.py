from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta

from cars.models import Car, Brand
from companies.models import Company
from erp.models import (
    Inventory, Sale, Service, ServiceOrder, ServiceOrderItem,
    Financial, ProjectBoard, ProjectColumn, ProjectTask,
    TaskLabel, TaskComment
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Загрузка демо данных для ERP системы'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Очистить существующие данные перед загрузкой',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Очистка существующих данных...')
            self.clear_data()

        self.stdout.write('Загрузка демо данных...')
        
        # Создание брендов
        brands = self.create_brands()
        
        # Создание автомобилей
        cars = self.create_cars(brands)
        
        # Создание компаний
        companies = self.create_companies()
        
        # Создание пользователей
        users = self.create_users()
        
        # Создание инвентаря
        self.create_inventory(cars, companies)
        
        # Создание услуг
        services = self.create_services(companies)
        
        # Создание продаж
        self.create_sales(cars, companies, users)
        
        # Создание заказов на обслуживание
        self.create_service_orders(cars, companies, users, services)
        
        # Создание финансовых операций
        self.create_financial_operations(companies, users)
        
        # Создание проектов и задач
        self.create_projects_and_tasks(companies, users)
        
        self.stdout.write(
            self.style.SUCCESS('Демо данные успешно загружены!')
        )

    def clear_data(self):
        """Очистка существующих данных"""
        ProjectTask.objects.all().delete()
        ProjectColumn.objects.all().delete()
        ProjectBoard.objects.all().delete()
        TaskLabel.objects.all().delete()
        TaskComment.objects.all().delete()
        Financial.objects.all().delete()
        ServiceOrderItem.objects.all().delete()
        ServiceOrder.objects.all().delete()
        Service.objects.all().delete()
        Sale.objects.all().delete()
        Inventory.objects.all().delete()
        Car.objects.all().delete()
        Brand.objects.all().delete()
        Company.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

    def create_brands(self):
        """Создание брендов автомобилей"""
        brands_data = [
            {'name': 'BMW', 'country': 'Германия'},
            {'name': 'Mercedes-Benz', 'country': 'Германия'},
            {'name': 'Audi', 'country': 'Германия'},
            {'name': 'Volkswagen', 'country': 'Германия'},
            {'name': 'Toyota', 'country': 'Япония'},
            {'name': 'Honda', 'country': 'Япония'},
            {'name': 'Nissan', 'country': 'Япония'},
            {'name': 'Ford', 'country': 'США'},
            {'name': 'Chevrolet', 'country': 'США'},
            {'name': 'Hyundai', 'country': 'Южная Корея'},
        ]
        
        brands = []
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                name=brand_data['name'],
                defaults={'country': brand_data['country']}
            )
            brands.append(brand)
            if created:
                self.stdout.write(f'Создан бренд: {brand.name}')
        
        return brands

    def create_cars(self, brands):
        """Создание автомобилей"""
        car_models = [
            {'brand': 'BMW', 'models': ['X5', 'X3', '3 Series', '5 Series', '7 Series']},
            {'brand': 'Mercedes-Benz', 'models': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE']},
            {'brand': 'Audi', 'models': ['A4', 'A6', 'Q5', 'Q7', 'RS6']},
            {'brand': 'Volkswagen', 'models': ['Golf', 'Passat', 'Tiguan', 'Touareg']},
            {'brand': 'Toyota', 'models': ['Camry', 'Corolla', 'RAV4', 'Highlander']},
            {'brand': 'Honda', 'models': ['Civic', 'Accord', 'CR-V', 'Pilot']},
            {'brand': 'Nissan', 'models': ['Altima', 'Maxima', 'Rogue', 'Murano']},
            {'brand': 'Ford', 'models': ['Focus', 'Fusion', 'Escape', 'Explorer']},
            {'brand': 'Chevrolet', 'models': ['Cruze', 'Malibu', 'Equinox', 'Tahoe']},
            {'brand': 'Hyundai', 'models': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe']},
        ]
        
        cars = []
        for car_info in car_models:
            brand = next((b for b in brands if b.name == car_info['brand']), None)
            if brand:
                for model in car_info['models']:
                    for year in range(2018, 2024):
                        car = Car.objects.create(
                            brand=brand,
                            model=model,
                            year=year,
                            price=Decimal(random.randint(20000, 150000)),
                            mileage=random.randint(0, 100000),
                            fuel_type=random.choice(['Бензин', 'Дизель', 'Электро', 'Гибрид']),
                            transmission=random.choice(['Автомат', 'Механика', 'Робот']),
                            color=random.choice(['Белый', 'Черный', 'Серебристый', 'Синий', 'Красный']),
                            description=f'Отличный автомобиль {brand.name} {model} {year} года выпуска'
                        )
                        cars.append(car)
        
        self.stdout.write(f'Создано автомобилей: {len(cars)}')
        return cars

    def create_companies(self):
        """Создание компаний"""
        companies_data = [
            {
                'name': 'Автосалон "Премиум Авто"',
                'description': 'Продажа премиальных автомобилей',
                'address': 'ул. Ленина, 1, Москва',
                'phone': '+7 (495) 123-45-67',
                'email': 'info@premium-auto.ru',
                'website': 'https://premium-auto.ru'
            },
            {
                'name': 'Сервисный центр "АвтоМастер"',
                'description': 'Качественное обслуживание автомобилей',
                'address': 'ул. Пушкина, 10, Москва',
                'phone': '+7 (495) 987-65-43',
                'email': 'service@automaster.ru',
                'website': 'https://automaster.ru'
            },
            {
                'name': 'Автодилер "Столица Авто"',
                'description': 'Официальный дилер ведущих брендов',
                'address': 'пр. Мира, 25, Москва',
                'phone': '+7 (495) 555-12-34',
                'email': 'sales@stolica-auto.ru',
                'website': 'https://stolica-auto.ru'
            },
            {
                'name': 'Автосервис "ТехАвто"',
                'description': 'Специализированный сервис по ремонту',
                'address': 'ул. Гагарина, 15, Москва',
                'phone': '+7 (495) 777-88-99',
                'email': 'repair@techauto.ru',
                'website': 'https://techauto.ru'
            },
            {
                'name': 'Автопарк "Логистик Авто"',
                'description': 'Управление автопарком и логистика',
                'address': 'ул. Транспортная, 5, Москва',
                'phone': '+7 (495) 333-44-55',
                'email': 'fleet@logistic-auto.ru',
                'website': 'https://logistic-auto.ru'
            }
        ]
        
        companies = []
        for company_data in companies_data:
            company, created = Company.objects.get_or_create(
                name=company_data['name'],
                defaults=company_data
            )
            companies.append(company)
            if created:
                self.stdout.write(f'Создана компания: {company.name}')
        
        return companies

    def create_users(self):
        """Создание пользователей"""
        users_data = [
            {
                'username': 'manager1',
                'email': 'manager1@veles-auto.com',
                'first_name': 'Иван',
                'last_name': 'Петров',
                'password': 'manager123'
            },
            {
                'username': 'manager2',
                'email': 'manager2@veles-auto.com',
                'first_name': 'Мария',
                'last_name': 'Сидорова',
                'password': 'manager123'
            },
            {
                'username': 'sales1',
                'email': 'sales1@veles-auto.com',
                'first_name': 'Алексей',
                'last_name': 'Козлов',
                'password': 'sales123'
            },
            {
                'username': 'sales2',
                'email': 'sales2@veles-auto.com',
                'first_name': 'Елена',
                'last_name': 'Новикова',
                'password': 'sales123'
            },
            {
                'username': 'service1',
                'email': 'service1@veles-auto.com',
                'first_name': 'Дмитрий',
                'last_name': 'Волков',
                'password': 'service123'
            },
            {
                'username': 'customer1',
                'email': 'customer1@example.com',
                'first_name': 'Анна',
                'last_name': 'Иванова',
                'password': 'customer123'
            },
            {
                'username': 'customer2',
                'email': 'customer2@example.com',
                'first_name': 'Сергей',
                'last_name': 'Смирнов',
                'password': 'customer123'
            }
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_staff': True
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f'Создан пользователь: {user.username}')
            users.append(user)
        
        return users

    def create_inventory(self, cars, companies):
        """Создание инвентаря"""
        for company in companies:
            for car in random.sample(cars, min(10, len(cars))):
                cost_price = car.price * Decimal('0.7')  # 70% от цены продажи
                selling_price = car.price * Decimal('1.2')  # 120% от цены продажи
                
                Inventory.objects.get_or_create(
                    company=company,
                    car=car,
                    defaults={
                        'quantity': random.randint(1, 5),
                        'cost_price': cost_price,
                        'selling_price': selling_price,
                        'status': random.choice(['available', 'reserved', 'sold']),
                        'location': f'Склад {company.name}',
                        'notes': f'Автомобиль {car.brand.name} {car.model} в инвентаре'
                    }
                )
        
        self.stdout.write(f'Создан инвентарь для {len(companies)} компаний')

    def create_services(self, companies):
        """Создание услуг"""
        services_data = [
            {'name': 'Замена масла', 'price': 2000, 'duration': 60},
            {'name': 'Замена тормозных колодок', 'price': 5000, 'duration': 120},
            {'name': 'Замена ремня ГРМ', 'price': 15000, 'duration': 240},
            {'name': 'Диагностика двигателя', 'price': 3000, 'duration': 90},
            {'name': 'Замена аккумулятора', 'price': 4000, 'duration': 30},
            {'name': 'Замена шин', 'price': 8000, 'duration': 180},
            {'name': 'Покраска кузова', 'price': 25000, 'duration': 480},
            {'name': 'Ремонт кондиционера', 'price': 12000, 'duration': 300},
            {'name': 'Замена сцепления', 'price': 20000, 'duration': 360},
            {'name': 'Компьютерная диагностика', 'price': 1500, 'duration': 45}
        ]
        
        services = []
        for company in companies:
            for service_data in services_data:
                service = Service.objects.create(
                    company=company,
                    name=service_data['name'],
                    description=f'Услуга: {service_data["name"]}',
                    price=Decimal(service_data['price']),
                    duration=service_data['duration'],
                    category=random.choice(['Техобслуживание', 'Ремонт', 'Диагностика', 'Кузовные работы'])
                )
                services.append(service)
        
        self.stdout.write(f'Создано услуг: {len(services)}')
        return services

    def create_sales(self, cars, companies, users):
        """Создание продаж"""
        sales_count = 0
        for company in companies:
            for _ in range(random.randint(5, 15)):
                car = random.choice(cars)
                customer = random.choice([u for u in users if 'customer' in u.username])
                sale_price = car.price * Decimal(random.uniform(0.9, 1.1))
                commission = sale_price * Decimal('0.05')  # 5% комиссия
                
                Sale.objects.create(
                    company=company,
                    car=car,
                    customer=customer,
                    sale_price=sale_price,
                    commission=commission,
                    status=random.choice(['completed', 'pending', 'cancelled']),
                    notes=f'Продажа автомобиля {car.brand.name} {car.model}'
                )
                sales_count += 1
        
        self.stdout.write(f'Создано продаж: {sales_count}')

    def create_service_orders(self, cars, companies, users, services):
        """Создание заказов на обслуживание"""
        orders_count = 0
        for company in companies:
            for _ in range(random.randint(3, 8)):
                car = random.choice(cars)
                customer = random.choice([u for u in users if 'customer' in u.username])
                company_services = [s for s in services if s.company == company]
                
                if company_services:
                    order = ServiceOrder.objects.create(
                        company=company,
                        customer=customer,
                        car=car,
                        total_price=Decimal(0),
                        status=random.choice(['scheduled', 'in_progress', 'completed']),
                        scheduled_date=timezone.now() + timedelta(days=random.randint(1, 30)),
                        notes=f'Заказ на обслуживание {car.brand.name} {car.model}'
                    )
                    
                    # Добавление услуг к заказу
                    order_services = random.sample(company_services, min(3, len(company_services)))
                    total_price = Decimal(0)
                    
                    for service in order_services:
                        ServiceOrderItem.objects.create(
                            service_order=order,
                            service=service,
                            quantity=random.randint(1, 2),
                            price=service.price,
                            notes=f'Услуга: {service.name}'
                        )
                        total_price += service.price
                    
                    order.total_price = total_price
                    order.save()
                    orders_count += 1
        
        self.stdout.write(f'Создано заказов на обслуживание: {orders_count}')

    def create_financial_operations(self, companies, users):
        """Создание финансовых операций"""
        operations_count = 0
        for company in companies:
            for _ in range(random.randint(10, 25)):
                operation_type = random.choice(['income', 'expense', 'investment'])
                
                if operation_type == 'income':
                    amount = Decimal(random.randint(50000, 500000))
                    category = 'Продажи автомобилей'
                    description = 'Доход от продажи автомобилей'
                elif operation_type == 'expense':
                    amount = Decimal(random.randint(10000, 100000))
                    category = random.choice(['Зарплата', 'Аренда', 'Коммунальные услуги', 'Реклама'])
                    description = f'Расход: {category}'
                else:
                    amount = Decimal(random.randint(100000, 1000000))
                    category = 'Инвестиции'
                    description = 'Инвестиции в развитие бизнеса'
                
                Financial.objects.create(
                    company=company,
                    operation_type=operation_type,
                    amount=amount,
                    category=category,
                    description=description,
                    created_by=random.choice([u for u in users if u.is_staff])
                )
                operations_count += 1
        
        self.stdout.write(f'Создано финансовых операций: {operations_count}')

    def create_projects_and_tasks(self, companies, users):
        """Создание проектов и задач"""
        boards_count = 0
        tasks_count = 0
        
        for company in companies:
            # Создание досок проектов
            board_types = ['sales', 'service', 'inventory', 'general']
            
            for board_type in board_types:
                board = ProjectBoard.objects.create(
                    company=company,
                    name=f'Доска {board_type.title()} - {company.name}',
                    description=f'Доска для управления {board_type} проектами',
                    board_type=board_type,
                    color=random.choice(['#007bff', '#28a745', '#ffc107', '#dc3545']),
                    created_by=random.choice([u for u in users if u.is_staff])
                )
                boards_count += 1
                
                # Создание колонок
                columns_data = [
                    {'name': 'К выполнению', 'order': 1, 'color': '#6c757d'},
                    {'name': 'В работе', 'order': 2, 'color': '#007bff'},
                    {'name': 'На проверке', 'order': 3, 'color': '#ffc107'},
                    {'name': 'Завершено', 'order': 4, 'color': '#28a745'}
                ]
                
                columns = []
                for col_data in columns_data:
                    column = ProjectColumn.objects.create(
                        board=board,
                        name=col_data['name'],
                        order=col_data['order'],
                        color=col_data['color']
                    )
                    columns.append(column)
                
                # Создание меток
                labels_data = [
                    {'name': 'Срочно', 'color': '#dc3545'},
                    {'name': 'Важно', 'color': '#fd7e14'},
                    {'name': 'Обычно', 'color': '#6f42c1'},
                    {'name': 'Низкий приоритет', 'color': '#6c757d'}
                ]
                
                labels = []
                for label_data in labels_data:
                    label = TaskLabel.objects.create(
                        board=board,
                        name=label_data['name'],
                        color=label_data['color']
                    )
                    labels.append(label)
                
                # Создание задач
                task_titles = [
                    'Провести инвентаризацию склада',
                    'Подготовить отчет по продажам',
                    'Обновить прайс-лист',
                    'Провести обучение персонала',
                    'Ремонт оборудования',
                    'Закупка запчастей',
                    'Встреча с клиентом',
                    'Анализ конкурентов',
                    'Планирование бюджета',
                    'Маркетинговая кампания'
                ]
                
                for i, title in enumerate(task_titles):
                    column = random.choice(columns)
                    assignee = random.choice([u for u in users if u.is_staff])
                    priority = random.choice(['low', 'medium', 'high', 'urgent'])
                    
                    task = ProjectTask.objects.create(
                        column=column,
                        title=title,
                        description=f'Описание задачи: {title}',
                        order=i + 1,
                        priority=priority,
                        due_date=timezone.now() + timedelta(days=random.randint(1, 30)),
                        assignee=assignee,
                        created_by=random.choice([u for u in users if u.is_staff])
                    )
                    
                    # Добавление меток
                    task.labels.set(random.sample(labels, min(2, len(labels))))
                    
                    # Создание комментариев
                    for _ in range(random.randint(0, 3)):
                        TaskComment.objects.create(
                            task=task,
                            author=random.choice([u for u in users if u.is_staff]),
                            text=f'Комментарий к задаче "{title}": {random.choice(["Выполняется", "Требует внимания", "Готово к проверке"])}'
                        )
                    
                    tasks_count += 1
        
        self.stdout.write(f'Создано досок проектов: {boards_count}')
        self.stdout.write(f'Создано задач: {tasks_count}') 