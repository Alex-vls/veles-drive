from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from cars.models import Car, Brand, Model, CarImage
from companies.models import Company
from django.core.files import File
from django.conf import settings
import os
import requests
from io import BytesIO
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Загрузка демо-данных из старого сайта'

    def handle(self, *args, **kwargs):
        self.stdout.write('Начинаем загрузку демо-данных...')

        # Создаем суперпользователя
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@veles-auto.ru',
                password='admin123'
            )
            self.stdout.write('Создан суперпользователь admin/admin123')

        # Создаем демо-пользователя
        if not User.objects.filter(username='demo').exists():
            User.objects.create_user(
                username='demo',
                email='demo@veles-auto.ru',
                password='demo123'
            )
            self.stdout.write('Создан демо-пользователь demo/demo123')

        # Создаем компании
        companies_data = [
            {
                'name': 'Автосалон "ВЕЛЕС"',
                'description': 'Официальный дилер автомобилей в Вологде',
                'address': 'г. Вологда, ул. Ленинградская, 71',
                'phone': '+7 (8172) 50-50-50',
                'email': 'info@veles-auto.ru',
                'website': 'https://auto-veles.ru',
                'logo': 'https://auto-veles.ru/static/images/logo.png'
            },
            {
                'name': 'Автоцентр "ВЕЛЕС-Плюс"',
                'description': 'Автомобильный центр полного цикла',
                'address': 'г. Вологда, ул. Можайского, 20',
                'phone': '+7 (8172) 50-50-51',
                'email': 'plus@veles-auto.ru',
                'website': 'https://auto-veles.ru/plus',
                'logo': 'https://auto-veles.ru/static/images/logo-plus.png'
            }
        ]

        for company_data in companies_data:
            company, created = Company.objects.get_or_create(
                name=company_data['name'],
                defaults={
                    'description': company_data['description'],
                    'address': company_data['address'],
                    'phone': company_data['phone'],
                    'email': company_data['email'],
                    'website': company_data['website']
                }
            )
            if created:
                self.stdout.write(f'Создана компания: {company.name}')

        # Создаем бренды и модели
        brands_models = {
            'BMW': ['M5', 'X5', 'X7', 'M8'],
            'Mercedes-Benz': ['S-Class', 'G-Class', 'AMG GT', 'GLS'],
            'Audi': ['RS Q8', 'RS7', 'Q8', 'e-tron GT'],
            'Porsche': ['911', 'Cayenne', 'Taycan', 'Panamera'],
            'Tesla': ['Model S', 'Model X', 'Cybertruck', 'Roadster']
        }

        for brand_name, models in brands_models.items():
            brand, created = Brand.objects.get_or_create(name=brand_name)
            if created:
                self.stdout.write(f'Создан бренд: {brand.name}')

            for model_name in models:
                model, created = Model.objects.get_or_create(
                    brand=brand,
                    name=model_name
                )
                if created:
                    self.stdout.write(f'Создана модель: {brand.name} {model.name}')

        # Создаем автомобили
        cars_data = [
            {
                'brand': 'BMW',
                'model': 'M5',
                'year': 2024,
                'price': 25000000,
                'mileage': 0,
                'transmission': 'automatic',
                'engine_type': 'petrol',
                'engine_volume': 4.4,
                'power': 727,
                'color': 'Черный',
                'description': 'BMW M5 Competition в максимальной комплектации. Мощный двигатель V8, полный привод, спортивный пакет.',
                'images': [
                    'https://auto-veles.ru/static/images/cars/m5-1.jpg',
                    'https://auto-veles.ru/static/images/cars/m5-2.jpg'
                ]
            },
            {
                'brand': 'Porsche',
                'model': 'Macan',
                'year': 2024,
                'price': 18500000,
                'mileage': 0,
                'transmission': 'automatic',
                'engine_type': 'electric',
                'engine_volume': 0,
                'power': 408,
                'color': 'Серый',
                'description': 'Porsche Macan 4 II. Электрический кроссовер с полным приводом и премиальным оснащением.',
                'images': [
                    'https://auto-veles.ru/static/images/cars/macan-1.jpg',
                    'https://auto-veles.ru/static/images/cars/macan-2.jpg'
                ]
            },
            {
                'brand': 'Tesla',
                'model': 'Cybertruck',
                'year': 2024,
                'price': 27500000,
                'mileage': 0,
                'transmission': 'automatic',
                'engine_type': 'electric',
                'engine_volume': 0,
                'power': 600,
                'color': 'Серебристый',
                'description': 'Tesla Cybertruck. Инновационный электрический пикап с футуристическим дизайном.',
                'images': [
                    'https://auto-veles.ru/static/images/cars/cybertruck-1.jpg',
                    'https://auto-veles.ru/static/images/cars/cybertruck-2.jpg'
                ]
            }
        ]

        for car_data in cars_data:
            brand = Brand.objects.get(name=car_data['brand'])
            model = Model.objects.get(brand=brand, name=car_data['model'])
            
            car = Car.objects.create(
                brand=brand,
                model=model,
                year=car_data['year'],
                price=car_data['price'],
                mileage=car_data['mileage'],
                transmission=car_data['transmission'],
                engine_type=car_data['engine_type'],
                engine_volume=car_data['engine_volume'],
                power=car_data['power'],
                color=car_data['color'],
                description=car_data['description'],
                company=Company.objects.first()
            )

            # Загружаем изображения
            for image_url in car_data['images']:
                try:
                    response = requests.get(image_url)
                    if response.status_code == 200:
                        image = CarImage.objects.create(car=car)
                        image.image.save(
                            f"{car.brand.name}_{car.model.name}_{image.id}.jpg",
                            File(BytesIO(response.content))
                        )
                except Exception as e:
                    logger.error(f'Ошибка при загрузке изображения: {e}')

            self.stdout.write(f'Создан автомобиль: {car.brand.name} {car.model.name}')

        self.stdout.write(self.style.SUCCESS('Демо-данные успешно загружены!')) 