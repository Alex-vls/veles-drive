from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
import random
from datetime import timedelta

from cars.models import (
    Brand, Model, Vehicle, Car, Motorcycle, Boat, Aircraft,
    VehicleImage, VehicleFeature, Auction, AuctionBid,
    LeasingCompany, LeasingProgram, LeasingApplication,
    InsuranceCompany, InsuranceType, InsurancePolicy, InsuranceClaim
)
from companies.models import Company, CompanyImage, CompanyFeature, CompanySchedule, Review
from users.models import Role, User, FavoriteCar, ViewHistory, UserReview
from erp.models import (
    Inventory, Sale, Service, ServiceOrder, ServiceOrderItem, Financial,
    TaskLabel, ProjectColumn, ProjectBoard, ProjectTask, TaskComment,
    TaskAttachment, TaskHistory, Project, ProjectMember, Board, Column,
    Task, TaskLabelAssignment, Sprint, SprintTask, TimeEntry
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Генерирует тестовые данные для всех моделей'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Очистить существующие данные перед генерацией',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Очистка существующих данных...')
            self.clear_data()

        self.stdout.write('Генерация тестовых данных...')
        
        with transaction.atomic():
            # Создаем роли
            roles = self.create_roles()
            
            # Создаем пользователей
            users = self.create_users(roles)
            
            # Создаем компании
            companies = self.create_companies(users)
            
            # Создаем бренды и модели
            brands, models = self.create_brands_and_models()
            
            # Создаем транспорт
            vehicles = self.create_vehicles(brands, models, companies)
            
            # Создаем специальные типы транспорта
            self.create_special_vehicles(vehicles)
            
            # Создаем изображения и характеристики
            self.create_vehicle_details(vehicles)
            
            # Создаем аукционы
            self.create_auctions(vehicles, users)
            
            # Создаем лизинг
            self.create_leasing(vehicles, users)
            
            # Создаем страхование
            self.create_insurance(vehicles, users)
            
            # Создаем отзывы
            self.create_reviews(companies, users)
            
            # Создаем ERP данные
            self.create_erp_data(users, companies)
            
            # Создаем пользовательские данные
            self.create_user_data(users, vehicles, companies)

        self.stdout.write(
            self.style.SUCCESS('Тестовые данные успешно созданы!')
        )

    def clear_data(self):
        """Очищает все данные"""
        models_to_clear = [
            TimeEntry, SprintTask, Sprint, TaskLabelAssignment, Task, Column, Board,
            ProjectMember, Project, TaskHistory, TaskAttachment, TaskComment,
            ProjectTask, ProjectColumn, ProjectBoard, TaskLabel, Financial,
            ServiceOrderItem, ServiceOrder, Service, Sale, Inventory,
            InsuranceClaim, InsurancePolicy, InsuranceType, InsuranceCompany,
            LeasingApplication, LeasingProgram, LeasingCompany, AuctionBid, Auction,
            VehicleFeature, VehicleImage, Aircraft, Boat, Motorcycle, Car,
            Vehicle, Model, Brand, Review, CompanySchedule, CompanyFeature,
            CompanyImage, Company, ViewHistory, FavoriteCar, UserReview,
            EmailVerificationToken, User, Role
        ]
        
        for model in models_to_clear:
            model.objects.all().delete()

    def create_roles(self):
        """Создает роли пользователей"""
        roles_data = [
            {'name': 'Администратор', 'description': 'Полный доступ к системе'},
            {'name': 'Менеджер', 'description': 'Управление компанией и транспортом'},
            {'name': 'Продавец', 'description': 'Продажа транспорта'},
            {'name': 'Покупатель', 'description': 'Просмотр и покупка транспорта'},
            {'name': 'Сервисный центр', 'description': 'Обслуживание транспорта'},
        ]
        
        roles = []
        for role_data in roles_data:
            role, created = Role.objects.get_or_create(
                name=role_data['name'],
                defaults=role_data
            )
            roles.append(role)
            if created:
                self.stdout.write(f'Создана роль: {role.name}')
        
        return roles

    def create_users(self, roles):
        """Создает пользователей"""
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@veles-auto.ru',
                'password': 'admin123',
                'first_name': 'Администратор',
                'last_name': 'Системы',
                'is_staff': True,
                'is_superuser': True,
                'role': roles[0]
            },
            {
                'username': 'manager1',
                'email': 'manager1@veles-auto.ru',
                'password': 'manager123',
                'first_name': 'Иван',
                'last_name': 'Петров',
                'role': roles[1]
            },
            {
                'username': 'seller1',
                'email': 'seller1@veles-auto.ru',
                'password': 'seller123',
                'first_name': 'Мария',
                'last_name': 'Сидорова',
                'role': roles[2]
            },
            {
                'username': 'buyer1',
                'email': 'buyer1@veles-auto.ru',
                'password': 'buyer123',
                'first_name': 'Алексей',
                'last_name': 'Козлов',
                'role': roles[3]
            },
            {
                'username': 'service1',
                'email': 'service1@veles-auto.ru',
                'password': 'service123',
                'first_name': 'Дмитрий',
                'last_name': 'Волков',
                'role': roles[4]
            },
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=user_data
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f'Создан пользователь: {user.email}')
            users.append(user)
        
        return users

    def create_companies(self, users):
        """Создает компании"""
        companies_data = [
            {
                'name': 'АвтоПремиум',
                'description': 'Официальный дилер премиальных автомобильных брендов. BMW, Mercedes-Benz, Audi.',
                'address': 'ул. Ленинградская, 45',
                'city': 'Москва',
                'phone': '+7 (495) 123-45-67',
                'email': 'info@autopremium.ru',
                'website': 'https://autopremium.ru',
                'is_verified': True,
                'rating': Decimal('4.8'),
                'owner': users[1]
            },
            {
                'name': 'Мото-Эксперт',
                'description': 'Специализированный магазин мотоциклов и мототехники.',
                'address': 'ул. Тверская, 12',
                'city': 'Москва',
                'phone': '+7 (495) 234-56-78',
                'email': 'info@moto-expert.ru',
                'website': 'https://moto-expert.ru',
                'is_verified': True,
                'rating': Decimal('4.6'),
                'owner': users[2]
            },
            {
                'name': 'Морская Техника',
                'description': 'Продажа и обслуживание лодок, яхт и морской техники.',
                'address': 'наб. Москвы-реки, 78',
                'city': 'Москва',
                'phone': '+7 (495) 345-67-89',
                'email': 'info@marine-tech.ru',
                'website': 'https://marine-tech.ru',
                'is_verified': True,
                'rating': Decimal('4.7'),
                'owner': users[3]
            },
            {
                'name': 'Авиа-Сервис',
                'description': 'Продажа и обслуживание воздушных судов.',
                'address': 'аэропорт Домодедово, 15',
                'city': 'Москва',
                'phone': '+7 (495) 456-78-90',
                'email': 'info@avia-service.ru',
                'website': 'https://avia-service.ru',
                'is_verified': True,
                'rating': Decimal('4.9'),
                'owner': users[4]
            },
            {
                'name': 'Авто-Сервис Центр',
                'description': 'Комплексное обслуживание и ремонт автомобилей.',
                'address': 'ул. Автозаводская, 23',
                'city': 'Москва',
                'phone': '+7 (495) 567-89-01',
                'email': 'info@auto-service.ru',
                'website': 'https://auto-service.ru',
                'is_verified': True,
                'rating': Decimal('4.5'),
                'owner': users[4]
            },
        ]
        
        companies = []
        for company_data in companies_data:
            company, created = Company.objects.get_or_create(
                name=company_data['name'],
                defaults=company_data
            )
            if created:
                self.stdout.write(f'Создана компания: {company.name}')
            companies.append(company)
        
        return companies

    def create_brands_and_models(self):
        """Создает бренды и модели"""
        brands_data = [
            {
                'name': 'BMW',
                'description': 'Немецкий производитель премиальных автомобилей',
                'models': ['X5', 'X6', 'X7', '5 Series', '7 Series', 'M3', 'M5']
            },
            {
                'name': 'Mercedes-Benz',
                'description': 'Немецкий производитель люксовых автомобилей',
                'models': ['S-Class', 'E-Class', 'C-Class', 'GLE', 'GLS', 'AMG GT']
            },
            {
                'name': 'Audi',
                'description': 'Немецкий производитель автомобилей премиум-класса',
                'models': ['A6', 'A8', 'Q7', 'Q8', 'RS6', 'RS7']
            },
            {
                'name': 'Harley-Davidson',
                'description': 'Американский производитель мотоциклов',
                'models': ['Sportster', 'Softail', 'Touring', 'CVO']
            },
            {
                'name': 'Yamaha',
                'description': 'Японский производитель мотоциклов',
                'models': ['YZF-R1', 'MT-09', 'TMAX', 'XSR900']
            },
            {
                'name': 'Azimut',
                'description': 'Итальянский производитель яхт',
                'models': ['55', '66', '78', '100']
            },
            {
                'name': 'Princess',
                'description': 'Британский производитель яхт',
                'models': ['V58', 'V65', 'V78', 'F55']
            },
            {
                'name': 'Robinson',
                'description': 'Американский производитель вертолетов',
                'models': ['R22', 'R44', 'R66']
            },
            {
                'name': 'Cessna',
                'description': 'Американский производитель самолетов',
                'models': ['172', '182', '206', 'Citation']
            },
        ]
        
        brands = []
        models = []
        
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                name=brand_data['name'],
                defaults={'description': brand_data['description']}
            )
            if created:
                self.stdout.write(f'Создан бренд: {brand.name}')
            brands.append(brand)
            
            for model_name in brand_data['models']:
                model, created = Model.objects.get_or_create(
                    brand=brand,
                    name=model_name,
                    defaults={'description': f'Модель {model_name} от {brand.name}'}
                )
                if created:
                    self.stdout.write(f'Создана модель: {brand.name} {model_name}')
                models.append(model)
        
        return brands, models

    def create_vehicles(self, brands, models, companies):
        """Создает транспортные средства"""
        vehicles = []
        
        # Создаем автомобили
        car_models = [m for m in models if m.brand.name in ['BMW', 'Mercedes-Benz', 'Audi']]
        for i in range(10):
            model = random.choice(car_models)
            company = random.choice(companies)
            
            vehicle = Vehicle.objects.create(
                vehicle_type='car',
                brand=model.brand,
                model=model,
                year=random.randint(2018, 2024),
                mileage=random.randint(1000, 100000),
                price=Decimal(random.randint(2000000, 15000000)),
                currency='RUB',
                fuel_type=random.choice(['petrol', 'diesel', 'hybrid']),
                transmission=random.choice(['manual', 'automatic']),
                engine_volume=Decimal(random.randint(15, 50)) / 10,
                power=random.randint(100, 500),
                color=random.choice(['white', 'black', 'silver', 'blue', 'red']),
                description=f'Отличный автомобиль {model.brand.name} {model.name}',
                company=company,
                is_active=True,
                is_available=True
            )
            vehicles.append(vehicle)
            self.stdout.write(f'Создан автомобиль: {vehicle}')
        
        # Создаем мотоциклы
        motorcycle_models = [m for m in models if m.brand.name in ['Harley-Davidson', 'Yamaha']]
        for i in range(5):
            model = random.choice(motorcycle_models)
            company = random.choice(companies)
            
            vehicle = Vehicle.objects.create(
                vehicle_type='motorcycle',
                brand=model.brand,
                model=model,
                year=random.randint(2019, 2024),
                mileage=random.randint(100, 50000),
                price=Decimal(random.randint(500000, 3000000)),
                currency='RUB',
                fuel_type='petrol',
                transmission='manual',
                engine_volume=Decimal(random.randint(10, 20)) / 10,
                power=random.randint(50, 200),
                color=random.choice(['black', 'red', 'blue', 'silver']),
                description=f'Мощный мотоцикл {model.brand.name} {model.name}',
                company=company,
                is_active=True,
                is_available=True
            )
            vehicles.append(vehicle)
            self.stdout.write(f'Создан мотоцикл: {vehicle}')
        
        # Создаем лодки
        boat_models = [m for m in models if m.brand.name in ['Azimut', 'Princess']]
        for i in range(3):
            model = random.choice(boat_models)
            company = random.choice(companies)
            
            vehicle = Vehicle.objects.create(
                vehicle_type='boat',
                brand=model.brand,
                model=model,
                year=random.randint(2020, 2024),
                mileage=random.randint(10, 1000),
                price=Decimal(random.randint(50000000, 200000000)),
                currency='RUB',
                fuel_type='petrol',
                transmission='manual',
                engine_volume=Decimal(random.randint(50, 100)) / 10,
                power=random.randint(500, 2000),
                color=random.choice(['white', 'blue', 'gray']),
                description=f'Роскошная яхта {model.brand.name} {model.name}',
                company=company,
                is_active=True,
                is_available=True
            )
            vehicles.append(vehicle)
            self.stdout.write(f'Создана лодка: {vehicle}')
        
        # Создаем воздушные суда
        aircraft_models = [m for m in models if m.brand.name in ['Robinson', 'Cessna']]
        for i in range(2):
            model = random.choice(aircraft_models)
            company = random.choice(companies)
            
            vehicle = Vehicle.objects.create(
                vehicle_type='helicopter' if model.brand.name == 'Robinson' else 'airplane',
                brand=model.brand,
                model=model,
                year=random.randint(2021, 2024),
                mileage=random.randint(1, 500),
                price=Decimal(random.randint(100000000, 500000000)),
                currency='RUB',
                fuel_type='kerosene' if model.brand.name == 'Cessna' else 'aviation_fuel',
                transmission='manual',
                engine_volume=Decimal(random.randint(100, 300)) / 10,
                power=random.randint(1000, 5000),
                color=random.choice(['white', 'blue', 'red']),
                description=f'Воздушное судно {model.brand.name} {model.name}',
                company=company,
                is_active=True,
                is_available=True
            )
            vehicles.append(vehicle)
            self.stdout.write(f'Создано воздушное судно: {vehicle}')
        
        return vehicles

    def create_special_vehicles(self, vehicles):
        """Создает специальные типы транспорта"""
        for vehicle in vehicles:
            if vehicle.vehicle_type == 'car':
                Car.objects.get_or_create(
                    vehicle=vehicle,
                    defaults={
                        'body_type': random.choice(['sedan', 'suv', 'coupe', 'hatchback']),
                        'doors': random.choice([2, 4, 5]),
                        'seats': random.choice([2, 4, 5, 7]),
                        'trunk_volume': random.randint(300, 800)
                    }
                )
            elif vehicle.vehicle_type == 'motorcycle':
                Motorcycle.objects.get_or_create(
                    vehicle=vehicle,
                    defaults={
                        'engine_type': random.choice(['inline', 'v_twin', 'boxer']),
                        'cylinders': random.choice([1, 2, 4]),
                        'cooling': random.choice(['air', 'liquid']),
                        'fuel_capacity': random.randint(10, 25)
                    }
                )
            elif vehicle.vehicle_type == 'boat':
                Boat.objects.get_or_create(
                    vehicle=vehicle,
                    defaults={
                        'boat_type': random.choice(['motorboat', 'yacht', 'sailboat']),
                        'length': Decimal(random.randint(50, 200)) / 10,
                        'beam': Decimal(random.randint(20, 80)) / 10,
                        'draft': Decimal(random.randint(5, 30)) / 10,
                        'capacity': random.randint(4, 12)
                    }
                )
            elif vehicle.vehicle_type in ['helicopter', 'airplane']:
                Aircraft.objects.get_or_create(
                    vehicle=vehicle,
                    defaults={
                        'aircraft_type': vehicle.vehicle_type,
                        'wingspan': Decimal(random.randint(100, 500)) / 10 if vehicle.vehicle_type == 'airplane' else None,
                        'length': Decimal(random.randint(50, 200)) / 10,
                        'max_altitude': random.randint(1000, 10000),
                        'range': random.randint(100, 5000),
                        'flight_hours': random.randint(0, 1000)
                    }
                )

    def create_vehicle_details(self, vehicles):
        """Создает изображения и характеристики транспорта"""
        for vehicle in vehicles:
            # Создаем изображения
            for i in range(random.randint(1, 3)):
                VehicleImage.objects.get_or_create(
                    vehicle=vehicle,
                    image=f'vehicles/{vehicle.brand.name.lower()}_{vehicle.model.name.lower()}_{i}.jpg',
                    defaults={'is_main': i == 0}
                )
            
            # Создаем характеристики
            features = [
                ('Климат-контроль', 'Да'),
                ('Навигация', 'Да'),
                ('Кожаный салон', 'Да'),
                ('Парктроники', 'Да'),
                ('Круиз-контроль', 'Да'),
            ]
            
            for name, value in random.sample(features, random.randint(2, 4)):
                VehicleFeature.objects.get_or_create(
                    vehicle=vehicle,
                    name=name,
                    defaults={'value': value}
                )

    def create_auctions(self, vehicles, users):
        """Создает аукционы"""
        for i in range(3):
            vehicle = random.choice(vehicles)
            user = random.choice(users)
            
            auction = Auction.objects.create(
                title=f'Аукцион {vehicle.brand.name} {vehicle.model.name}',
                description=f'Продажа {vehicle} на аукционе',
                auction_type=random.choice(['english', 'dutch']),
                status='active',
                vehicle=vehicle,
                start_date=timezone.now(),
                end_date=timezone.now() + timedelta(days=7),
                min_bid=vehicle.price * Decimal('0.8'),
                reserve_price=vehicle.price * Decimal('0.9'),
                current_price=vehicle.price * Decimal('0.8'),
                bid_increment=Decimal('10000'),
                created_by=user
            )
            
            # Создаем ставки
            for j in range(random.randint(1, 5)):
                bidder = random.choice(users)
                AuctionBid.objects.create(
                    auction=auction,
                    bidder=bidder,
                    amount=auction.current_price + Decimal(j * 10000),
                    is_winning=j == 0
                )
            
            self.stdout.write(f'Создан аукцион: {auction.title}')

    def create_leasing(self, vehicles, users):
        """Создает лизинговые компании и программы"""
        leasing_companies = [
            {
                'name': 'АвтоЛизинг',
                'description': 'Лизинговая компания для автомобилей',
                'phone': '+7 (495) 111-11-11',
                'email': 'info@autoleasing.ru',
                'address': 'ул. Лизинговая, 1, Москва'
            },
            {
                'name': 'Мото-Лизинг',
                'description': 'Лизинг мотоциклов и мототехники',
                'phone': '+7 (495) 222-22-22',
                'email': 'info@motoleasing.ru',
                'address': 'ул. Мотоциклетная, 2, Москва'
            }
        ]
        
        for company_data in leasing_companies:
            company, created = LeasingCompany.objects.get_or_create(
                name=company_data['name'],
                defaults=company_data
            )
            if created:
                self.stdout.write(f'Создана лизинговая компания: {company.name}')
            
            # Создаем программы
            for i in range(2):
                program = LeasingProgram.objects.create(
                    company=company,
                    name=f'Программа {i+1}',
                    description=f'Лизинговая программа {i+1} от {company.name}',
                    min_down_payment=Decimal('10.00'),
                    max_term=60,
                    interest_rate=Decimal('8.50')
                )
                
                # Создаем заявки
                for j in range(random.randint(1, 3)):
                    vehicle = random.choice(vehicles)
                    user = random.choice(users)
                    LeasingApplication.objects.create(
                        program=program,
                        vehicle=vehicle,
                        applicant=user,
                        status=random.choice(['submitted', 'under_review', 'approved']),
                        down_payment=vehicle.price * Decimal('0.1'),
                        term_months=36,
                        monthly_payment=vehicle.price * Decimal('0.03'),
                        total_amount=vehicle.price * Decimal('1.1')
                    )

    def create_insurance(self, vehicles, users):
        """Создает страховые компании и полисы"""
        insurance_companies = [
            {
                'name': 'АвтоСтрах',
                'description': 'Страхование автомобилей',
                'phone': '+7 (495) 333-33-33',
                'email': 'info@autostrah.ru',
                'address': 'ул. Страховая, 3, Москва',
                'license_number': 'СБ-1234567890'
            },
            {
                'name': 'МорСтрах',
                'description': 'Страхование морской техники',
                'phone': '+7 (495) 444-44-44',
                'email': 'info@morstrah.ru',
                'address': 'ул. Морская, 4, Москва',
                'license_number': 'СБ-0987654321'
            }
        ]
        
        for company_data in insurance_companies:
            company, created = InsuranceCompany.objects.get_or_create(
                name=company_data['name'],
                defaults=company_data
            )
            if created:
                self.stdout.write(f'Создана страховая компания: {company.name}')
            
            # Создаем типы страхования
            insurance_types = [
                {'name': 'ОСАГО', 'description': 'Обязательное страхование', 'is_mandatory': True},
                {'name': 'КАСКО', 'description': 'Добровольное страхование', 'is_mandatory': False},
                {'name': 'Страхование жизни', 'description': 'Страхование жизни водителя', 'is_mandatory': False},
            ]
            
            for type_data in insurance_types:
                insurance_type, created = InsuranceType.objects.get_or_create(
                    name=type_data['name'],
                    defaults=type_data
                )
                
                # Создаем полисы
                for j in range(random.randint(1, 3)):
                    vehicle = random.choice(vehicles)
                    user = random.choice(users)
                    policy = InsurancePolicy.objects.create(
                        company=company,
                        insurance_type=insurance_type,
                        vehicle=vehicle,
                        policy_number=f'POL-{company.id}-{insurance_type.id}-{j+1}',
                        status=random.choice(['active', 'expired']),
                        start_date=timezone.now().date(),
                        end_date=timezone.now().date() + timedelta(days=365),
                        premium_amount=vehicle.price * Decimal('0.05'),
                        coverage_amount=vehicle.price * Decimal('1.2'),
                        deductible=Decimal('50000'),
                        insured_person=user
                    )
                    
                    # Создаем страховые случаи
                    if random.choice([True, False]):
                        InsuranceClaim.objects.create(
                            policy=policy,
                            claim_number=f'CLM-{policy.id}-{j+1}',
                            status=random.choice(['filed', 'under_review', 'approved']),
                            incident_date=timezone.now() - timedelta(days=random.randint(1, 30)),
                            description='Описание страхового случая',
                            damage_amount=Decimal(random.randint(50000, 500000)),
                            claim_amount=Decimal(random.randint(30000, 400000)),
                            filed_by=user
                        )

    def create_reviews(self, companies, users):
        """Создает отзывы о компаниях"""
        for company in companies:
            for i in range(random.randint(2, 5)):
                user = random.choice(users)
                review, created = Review.objects.get_or_create(
                    company=company,
                    user=user,
                    defaults={
                        'rating': random.randint(3, 5),
                        'text': f'Отличная компания! Рекомендую всем.',
                        'is_approved': True
                    }
                )
                if created:
                    self.stdout.write(f'Создан отзыв для {company.name}')

    def create_erp_data(self, users, companies):
        """Создает ERP данные"""
        # Создаем проекты
        for i in range(3):
            project = Project.objects.create(
                name=f'Проект {i+1}',
                description=f'Описание проекта {i+1}',
                status=random.choice(['active', 'completed', 'on_hold']),
                start_date=timezone.now() - timedelta(days=random.randint(1, 30)),
                end_date=timezone.now() + timedelta(days=random.randint(30, 90)),
                budget=Decimal(random.randint(1000000, 10000000)),
                created_by=random.choice(users)
            )
            
            # Создаем участников проекта
            for j in range(random.randint(2, 5)):
                ProjectMember.objects.create(
                    project=project,
                    user=random.choice(users),
                    role=random.choice(['manager', 'developer', 'tester'])
                )
            
            # Создаем задачи
            for k in range(random.randint(3, 8)):
                task = Task.objects.create(
                    title=f'Задача {k+1} проекта {i+1}',
                    description=f'Описание задачи {k+1}',
                    status=random.choice(['todo', 'in_progress', 'done']),
                    priority=random.choice(['low', 'medium', 'high']),
                    project=project,
                    assignee=random.choice(users),
                    created_by=random.choice(users),
                    due_date=timezone.now() + timedelta(days=random.randint(1, 30))
                )
                
                # Создаем комментарии к задачам
                for l in range(random.randint(1, 3)):
                    TaskComment.objects.create(
                        task=task,
                        author=random.choice(users),
                        content=f'Комментарий {l+1} к задаче {task.title}'
                    )
        
        # Создаем продажи
        for i in range(5):
            Sale.objects.create(
                customer_name=f'Клиент {i+1}',
                customer_email=f'client{i+1}@example.com',
                customer_phone=f'+7 (495) {random.randint(1000000, 9999999)}',
                amount=Decimal(random.randint(100000, 5000000)),
                status=random.choice(['pending', 'completed', 'cancelled']),
                created_by=random.choice(users),
                company=random.choice(companies)
            )
        
        # Создаем услуги
        services = [
            {'name': 'Техническое обслуживание', 'price': Decimal('5000')},
            {'name': 'Ремонт двигателя', 'price': Decimal('15000')},
            {'name': 'Замена масла', 'price': Decimal('2000')},
            {'name': 'Диагностика', 'price': Decimal('3000')},
        ]
        
        for service_data in services:
            service = Service.objects.create(
                name=service_data['name'],
                description=f'Услуга: {service_data["name"]}',
                price=service_data['price'],
                duration_hours=random.randint(1, 8),
                company=random.choice(companies)
            )
            
            # Создаем заказы на услуги
            for j in range(random.randint(1, 3)):
                ServiceOrder.objects.create(
                    customer_name=f'Клиент услуги {j+1}',
                    customer_phone=f'+7 (495) {random.randint(1000000, 9999999)}',
                    total_amount=service.price,
                    status=random.choice(['pending', 'in_progress', 'completed']),
                    service=service,
                    created_by=random.choice(users)
                )

    def create_user_data(self, users, vehicles, companies):
        """Создает пользовательские данные"""
        # Создаем избранные автомобили
        for user in users:
            for i in range(random.randint(1, 3)):
                vehicle = random.choice(vehicles)
                FavoriteCar.objects.get_or_create(
                    user=user,
                    car=vehicle.car_details if hasattr(vehicle, 'car_details') else None
                )
        
        # Создаем историю просмотров
        for user in users:
            for i in range(random.randint(2, 5)):
                vehicle = random.choice(vehicles)
                ViewHistory.objects.get_or_create(
                    user=user,
                    car=vehicle.car_details if hasattr(vehicle, 'car_details') else None,
                    defaults={'viewed_at': timezone.now() - timedelta(days=random.randint(1, 30))}
                )
        
        # Создаем отзывы пользователей
        for user in users:
            for i in range(random.randint(1, 2)):
                company = random.choice(companies)
                UserReview.objects.get_or_create(
                    user=user,
                    company=company,
                    defaults={
                        'rating': random.randint(3, 5),
                        'comment': f'Отличная компания! Рекомендую всем.'
                    }
                ) 