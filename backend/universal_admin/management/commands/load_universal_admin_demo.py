from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random

# Импорты моделей
from veles_drive.models import (
    Brand, Company, Car, CarImage, Review, Article, News, Category, Tag,
    PageView, UserSession, SearchQuery, Conversion
)

from erp.models import (
    Inventory, Sale, Service, ServiceOrder, ServiceOrderItem, Financial,
    ProjectBoard, ProjectColumn, ProjectTask, TaskLabel
)


class Command(BaseCommand):
    help = 'Загрузка демо-данных для универсальной админки'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=50,
            help='Количество пользователей для создания'
        )
        parser.add_argument(
            '--companies',
            type=int,
            default=20,
            help='Количество компаний для создания'
        )
        parser.add_argument(
            '--cars',
            type=int,
            default=100,
            help='Количество автомобилей для создания'
        )
        parser.add_argument(
            '--sales',
            type=int,
            default=30,
            help='Количество продаж для создания'
        )
        parser.add_argument(
            '--articles',
            type=int,
            default=25,
            help='Количество статей для создания'
        )
        parser.add_argument(
            '--news',
            type=int,
            default=15,
            help='Количество новостей для создания'
        )

    def handle(self, *args, **options):
        self.stdout.write('Начинаем загрузку демо-данных для универсальной админки...')
        
        # Создаем пользователей
        self.create_users(options['users'])
        
        # Создаем компании
        self.create_companies(options['companies'])
        
        # Создаем автомобили
        self.create_cars(options['cars'])
        
        # Создаем продажи
        self.create_sales(options['sales'])
        
        # Создаем контент
        self.create_content(options['articles'], options['news'])
        
        # Создаем аналитику
        self.create_analytics()
        
        # Создаем проекты
        self.create_projects()
        
        self.stdout.write(
            self.style.SUCCESS('Демо-данные для универсальной админки успешно загружены!')
        )

    def create_users(self, count):
        """Создание пользователей"""
        self.stdout.write(f'Создаем {count} пользователей...')
        
        for i in range(count):
            username = f'user_{i+1}'
            email = f'user_{i+1}@example.com'
            
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='password123',
                    first_name=f'Имя_{i+1}',
                    last_name=f'Фамилия_{i+1}',
                    date_joined=timezone.now() - timedelta(days=random.randint(1, 365))
                )
                
                # Случайно делаем некоторых пользователей активными
                if random.choice([True, False]):
                    user.last_login = timezone.now() - timedelta(days=random.randint(1, 30))
                    user.save()

    def create_companies(self, count):
        """Создание компаний"""
        self.stdout.write(f'Создаем {count} компаний...')
        
        cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород']
        
        for i in range(count):
            name = f'Автокомпания {i+1}'
            city = random.choice(cities)
            
            if not Company.objects.filter(name=name).exists():
                company = Company.objects.create(
                    name=name,
                    description=f'Описание компании {i+1}',
                    city=city,
                    address=f'Адрес {i+1}, {city}',
                    phone=f'+7-{random.randint(900, 999)}-{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(10, 99)}',
                    email=f'company_{i+1}@example.com',
                    website=f'https://company{i+1}.ru',
                    rating=random.uniform(3.0, 5.0),
                    review_count=random.randint(0, 50),
                    is_verified=random.choice([True, False]),
                    created_at=timezone.now() - timedelta(days=random.randint(1, 365))
                )

    def create_cars(self, count):
        """Создание автомобилей"""
        self.stdout.write(f'Создаем {count} автомобилей...')
        
        brands = Brand.objects.all()
        companies = Company.objects.all()
        
        if not brands.exists():
            self.stdout.write('Создаем бренды...')
            brand_names = ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Ford', 'Volkswagen', 'Hyundai']
            for name in brand_names:
                Brand.objects.get_or_create(name=name)
            brands = Brand.objects.all()
        
        transmissions = ['manual', 'automatic']
        fuel_types = ['gasoline', 'diesel', 'hybrid', 'electric']
        colors = ['Белый', 'Черный', 'Серебристый', 'Красный', 'Синий', 'Зеленый']
        
        for i in range(count):
            brand = random.choice(brands)
            company = random.choice(companies)
            model = f'Модель {random.randint(1, 10)}'
            year = random.randint(2015, 2024)
            
            car = Car.objects.create(
                brand=brand,
                model=model,
                year=year,
                price=random.randint(500000, 5000000),
                transmission=random.choice(transmissions),
                fuel_type=random.choice(fuel_types),
                engine_volume=random.uniform(1.0, 4.0),
                mileage=random.randint(0, 200000),
                color=random.choice(colors),
                description=f'Описание автомобиля {i+1}',
                company=company,
                is_available=random.choice([True, False]),
                rating=random.uniform(3.0, 5.0),
                created_at=timezone.now() - timedelta(days=random.randint(1, 365))
            )

    def create_sales(self, count):
        """Создание продаж"""
        self.stdout.write(f'Создаем {count} продаж...')
        
        cars = Car.objects.all()
        companies = Company.objects.all()
        users = User.objects.all()
        
        statuses = ['completed', 'pending', 'cancelled']
        
        for i in range(count):
            car = random.choice(cars)
            company = random.choice(companies)
            customer = random.choice(users)
            
            sale_price = car.price + random.randint(-100000, 100000)
            commission = sale_price * random.uniform(0.05, 0.15)
            
            Sale.objects.create(
                car=car,
                company=company,
                customer=customer,
                sale_price=sale_price,
                commission=commission,
                notes=f'Заметки по продаже {i+1}',
                status=random.choice(statuses),
                sale_date=timezone.now() - timedelta(days=random.randint(1, 365))
            )

    def create_content(self, articles_count, news_count):
        """Создание контента"""
        self.stdout.write(f'Создаем {articles_count} статей и {news_count} новостей...')
        
        users = User.objects.all()
        
        # Создаем категории
        categories = []
        category_names = ['Автоновости', 'Обзоры', 'Советы', 'Технологии', 'Безопасность']
        for name in category_names:
            category, _ = Category.objects.get_or_create(name=name)
            categories.append(category)
        
        # Создаем теги
        tags = []
        tag_names = ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Электромобили', 'Гибриды', 'Безопасность', 'Экономия']
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        
        # Создаем статьи
        for i in range(articles_count):
            author = random.choice(users)
            category = random.choice(categories)
            
            article = Article.objects.create(
                title=f'Статья {i+1}: Все об автомобилях',
                content=f'Содержание статьи {i+1}. Это демонстрационная статья для универсальной админки.',
                author=author,
                category=category,
                status=random.choice(['draft', 'published', 'archived']),
                views_count=random.randint(0, 1000),
                created_at=timezone.now() - timedelta(days=random.randint(1, 365))
            )
            
            # Добавляем теги
            article.tags.set(random.sample(tags, random.randint(1, 3)))
        
        # Создаем новости
        sources = ['Авто.ру', 'Дром.ру', 'За рулем', 'Колеса.ру', '5 колесо']
        
        for i in range(news_count):
            author = random.choice(users)
            source = random.choice(sources)
            
            news = News.objects.create(
                title=f'Новость {i+1}: Важные события в мире авто',
                content=f'Содержание новости {i+1}. Это демонстрационная новость для универсальной админки.',
                author=author,
                source=source,
                status=random.choice(['draft', 'published', 'archived']),
                views_count=random.randint(0, 500),
                created_at=timezone.now() - timedelta(days=random.randint(1, 365))
            )

    def create_analytics(self):
        """Создание аналитических данных"""
        self.stdout.write('Создаем аналитические данные...')
        
        cars = Car.objects.all()
        users = User.objects.all()
        
        # Создаем просмотры страниц
        for _ in range(1000):
            car = random.choice(cars)
            user = random.choice(users) if random.choice([True, False]) else None
            
            PageView.objects.create(
                url=f'/cars/{car.id}/',
                user=user,
                ip_address=f'192.168.{random.randint(1, 255)}.{random.randint(1, 255)}',
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                timestamp=timezone.now() - timedelta(days=random.randint(1, 30))
            )
        
        # Создаем сессии пользователей
        for _ in range(500):
            user = random.choice(users)
            
            UserSession.objects.create(
                user=user,
                session_key=f'session_{random.randint(1000, 9999)}',
                ip_address=f'192.168.{random.randint(1, 255)}.{random.randint(1, 255)}',
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                start_time=timezone.now() - timedelta(days=random.randint(1, 30)),
                end_time=timezone.now() - timedelta(days=random.randint(1, 30), hours=random.randint(1, 5))
            )
        
        # Создаем поисковые запросы
        search_queries = ['BMW X5', 'Mercedes C-Class', 'Toyota Camry', 'Honda Civic', 'Ford Focus']
        
        for _ in range(200):
            query = random.choice(search_queries)
            user = random.choice(users) if random.choice([True, False]) else None
            
            SearchQuery.objects.create(
                query=query,
                user=user,
                results_count=random.randint(1, 50),
                timestamp=timezone.now() - timedelta(days=random.randint(1, 30))
            )

    def create_projects(self):
        """Создание проектов и задач"""
        self.stdout.write('Создаем проекты и задачи...')
        
        companies = Company.objects.all()
        users = User.objects.all()
        
        # Создаем метки задач
        labels = []
        label_data = [
            ('Срочно', '#ff0000'),
            ('Важно', '#ff6600'),
            ('Баги', '#ff0000'),
            ('Улучшения', '#00ff00'),
            ('Документация', '#0066ff'),
            ('Тестирование', '#ffff00')
        ]
        
        for name, color in label_data:
            label, _ = TaskLabel.objects.get_or_create(name=name, defaults={'color': color})
            labels.append(label)
        
        # Создаем доски проектов
        for i in range(5):
            company = random.choice(companies)
            board = ProjectBoard.objects.create(
                name=f'Проект {i+1}',
                description=f'Описание проекта {i+1}',
                company=company,
                board_type=random.choice(['kanban', 'scrum', 'simple']),
                color=f'#{random.randint(0, 0xFFFFFF):06x}',
                is_archived=False,
                created_by=random.choice(users)
            )
            
            # Создаем колонки
            column_names = ['К выполнению', 'В работе', 'На проверке', 'Готово']
            for j, name in enumerate(column_names):
                ProjectColumn.objects.create(
                    name=name,
                    board=board,
                    order=j,
                    color=f'#{random.randint(0, 0xFFFFFF):06x}',
                    is_archived=False
                )
            
            # Создаем задачи
            columns = board.columns.all()
            for k in range(random.randint(5, 15)):
                column = random.choice(columns)
                assignee = random.choice(users) if random.choice([True, False]) else None
                
                task = ProjectTask.objects.create(
                    title=f'Задача {k+1} проекта {i+1}',
                    description=f'Описание задачи {k+1}',
                    column=column,
                    assignee=assignee,
                    priority=random.choice(['low', 'medium', 'high', 'urgent']),
                    due_date=timezone.now() + timedelta(days=random.randint(1, 30)),
                    is_archived=False,
                    created_by=random.choice(users)
                )
                
                # Добавляем метки
                task.labels.set(random.sample(labels, random.randint(0, 3))) 