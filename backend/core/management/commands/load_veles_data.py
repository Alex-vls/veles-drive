from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils import timezone
from cars.models import Brand, Model, Vehicle, Car, VehicleImage, VehicleFeature
from companies.models import Company
from users.models import User
import requests
import os
from decimal import Decimal

class Command(BaseCommand):
    help = 'Загружает реальные данные с сайта auto-veles.ru'

    def handle(self, *args, **options):
        self.stdout.write('Начинаем загрузку данных с auto-veles.ru...')
        
        # Создаем компанию ВЕЛЕС АВТО
        company, created = Company.objects.get_or_create(
            name='ВЕЛЕС АВТО',
            defaults={
                'description': 'ВЕЛЕС АВТО предоставляет гибкие финансовые решения, включая программы кредитования и лизинга, а также премиальный сервис, что делает покупку автомобиля комфортной и безопасной.',
                'phone': '+7 (937) 669-88-88',
                'email': 'info@auto-veles.ru',
                'website': 'https://auto-veles.ru',
                'address': 'Москва, Россия',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f'Создана компания: {company.name}')
        
        # Создаем бренды
        brands_data = [
            {'name': 'BMW', 'description': 'Немецкий производитель премиальных автомобилей'},
            {'name': 'PORSCHE', 'description': 'Немецкий производитель спортивных автомобилей'},
            {'name': 'TESLA', 'description': 'Американский производитель электромобилей'},
            {'name': 'AUDI', 'description': 'Немецкий производитель премиальных автомобилей'},
            {'name': 'BENTLEY', 'description': 'Британский производитель роскошных автомобилей'},
        ]
        
        brands = {}
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                name=brand_data['name'],
                defaults=brand_data
            )
            brands[brand.name] = brand
            if created:
                self.stdout.write(f'Создан бренд: {brand.name}')
        
        # Создаем модели
        models_data = [
            {'brand': 'BMW', 'name': 'M5 4.4 AT', 'description': 'Мощный седан M-серии'},
            {'brand': 'PORSCHE', 'name': 'Macan 4 II', 'description': 'Электрический кроссовер'},
            {'brand': 'PORSCHE', 'name': 'Macan Turbo', 'description': 'Турбо версия кроссовера'},
            {'brand': 'TESLA', 'name': 'Cybertruck', 'description': 'Электрический пикап'},
            {'brand': 'AUDI', 'name': 'RSQ8', 'description': 'Спортивный внедорожник'},
            {'brand': 'BENTLEY', 'name': 'Continental Beluga', 'description': 'Роскошный седан'},
            {'brand': 'BENTLEY', 'name': 'Continental GT Speed IV', 'description': 'Спортивный купе'},
        ]
        
        models = {}
        for model_data in models_data:
            model, created = Model.objects.get_or_create(
                brand=brands[model_data['brand']],
                name=model_data['name'],
                defaults=model_data
            )
            models[f"{model_data['brand']} {model_data['name']}"] = model
            if created:
                self.stdout.write(f'Создана модель: {model}')
        
        # Создаем автомобили на основе данных с сайта
        vehicles_data = [
            {
                'brand': 'BMW', 'model': 'M5 4.4 AT', 'year': 2024,
                'price': Decimal('25000000'), 'original_price': Decimal('25900000'),
                'power': 727, 'engine_volume': Decimal('4.395'),
                'body_type': 'sedan', 'transmission': 'automatic',
                'fuel_type': 'petrol', 'color': 'white',
                'description': 'Коммерческий утильсбор оплачен',
                'features': {
                    'Кузов': 'Седан',
                    'Объем': '4395 см³',
                    'Мощность': '727 л.с.',
                    'Привод': 'Полный',
                    'Разгон': '3.6 с',
                    'Длина': '4983 мм',
                    'Ширина': '1903 мм',
                    'Высота': '1473 мм'
                }
            },
            {
                'brand': 'PORSCHE', 'model': 'Macan 4 II', 'year': 2024,
                'price': Decimal('18500000'), 'original_price': Decimal('19000000'),
                'power': 408, 'engine_volume': Decimal('0'),
                'body_type': 'suv', 'transmission': 'automatic',
                'fuel_type': 'electric', 'color': 'white',
                'description': 'Растаможен на РФ',
                'features': {
                    'Кузов': 'Внедорожник 5 дв',
                    'Объем': '-',
                    'Мощность': '408 л.с. / 300 кВт / Электро',
                    'Привод': 'Полный',
                    'Разгон': '5.2 с',
                    'Длина': '4784 мм',
                    'Ширина': '1938 мм',
                    'Высота': '1622 мм'
                }
            },
            {
                'brand': 'PORSCHE', 'model': 'Macan Turbo', 'year': 2024,
                'price': Decimal('25000000'), 'original_price': Decimal('26500000'),
                'power': 639, 'engine_volume': Decimal('0'),
                'body_type': 'suv', 'transmission': 'automatic',
                'fuel_type': 'electric', 'color': 'white',
                'description': 'Растаможен на РФ',
                'features': {
                    'Кузов': 'Внедорожник 5 дв',
                    'Объем': '-',
                    'Мощность': '639 л.с.',
                    'Привод': 'Полный',
                    'Разгон': '3.3 с',
                    'Длина': '4784 мм',
                    'Ширина': '1938 мм',
                    'Высота': '1622 мм'
                }
            },
            {
                'brand': 'TESLA', 'model': 'Cybertruck', 'year': 2024,
                'price': Decimal('27500000'), 'original_price': Decimal('28000000'),
                'power': 600, 'engine_volume': Decimal('0'),
                'body_type': 'pickup', 'transmission': 'automatic',
                'fuel_type': 'electric', 'color': 'silver',
                'description': 'Растаможен на РФ',
                'features': {
                    'Кузов': 'Пикап (двойная кабина)',
                    'Объем': 'Электрический',
                    'Мощность': '600 л.с. / 448 кВт',
                    'Привод': 'Полный',
                    'Разгон': '4.1 с',
                    'Длина': '5683 мм',
                    'Ширина': '2201 мм',
                    'Высота': '1791 мм'
                }
            },
            {
                'brand': 'AUDI', 'model': 'RSQ8', 'year': 2024,
                'price': Decimal('26500000'), 'original_price': Decimal('28900000'),
                'power': 640, 'engine_volume': Decimal('4.0'),
                'body_type': 'suv', 'transmission': 'automatic',
                'fuel_type': 'petrol', 'color': 'black',
                'description': 'Коммерческий утильсбор оплачен!!!',
                'features': {
                    'Кузов': 'Внедорожник 5 дв',
                    'Объем': '4000 см³',
                    'Мощность': '640 л.с.',
                    'Привод': 'Полный',
                    'Разгон': '3,6 с',
                    'Длина': '5022 мм',
                    'Ширина': '2007 мм',
                    'Высота': '1699 мм'
                }
            },
            {
                'brand': 'BENTLEY', 'model': 'Continental Beluga', 'year': 2024,
                'price': Decimal('56999000'), 'original_price': Decimal('59999000'),
                'power': 782, 'engine_volume': Decimal('3.996'),
                'body_type': 'sedan', 'transmission': 'automatic',
                'fuel_type': 'petrol', 'color': 'black',
                'description': '',
                'features': {
                    'Кузов': 'Седан 3 дв',
                    'Объем': '3996 см³',
                    'Мощность': '782 л.с.',
                    'Привод': 'Полный',
                    'Разгон': '3.2 с',
                    'Длина': '4895 мм',
                    'Ширина': '1966 мм',
                    'Высота': '1397 мм'
                }
            },
            {
                'brand': 'BENTLEY', 'model': 'Continental GT Speed IV', 'year': 2024,
                'price': Decimal('65000000'), 'original_price': Decimal('65900000'),
                'power': 782, 'engine_volume': Decimal('3.996'),
                'body_type': 'suv', 'transmission': 'automatic',
                'fuel_type': 'petrol', 'color': 'white',
                'description': '',
                'features': {
                    'Кузов': 'Внедорожник 5 дв',
                    'Объем': '3996 см³',
                    'Мощность': '782 л.с. (575 кВт)',
                    'Привод': 'Полный',
                    'Разгон': '3.2 с',
                    'Длина': '4895 мм',
                    'Ширина': '1966 мм',
                    'Высота': '1397 мм'
                }
            },
        ]
        
        for vehicle_data in vehicles_data:
            model_key = f"{vehicle_data['brand']} {vehicle_data['model']}"
            model = models[model_key]
            brand = brands[vehicle_data['brand']]
            
            # Создаем транспорт
            vehicle, created = Vehicle.objects.get_or_create(
                brand=brand,
                model=model,
                year=vehicle_data['year'],
                defaults={
                    'vehicle_type': 'car',
                    'mileage': 0,
                    'price': vehicle_data['price'],
                    'currency': 'RUB',
                    'fuel_type': vehicle_data['fuel_type'],
                    'transmission': vehicle_data['transmission'],
                    'engine_volume': vehicle_data['engine_volume'],
                    'power': vehicle_data['power'],
                    'color': vehicle_data['color'],
                    'description': vehicle_data['description'],
                    'is_active': True,
                    'is_available': True,
                    'company': company
                }
            )
            
            if created:
                self.stdout.write(f'Создан транспорт: {vehicle}')
                
                # Создаем автомобиль
                car, car_created = Car.objects.get_or_create(
                    vehicle=vehicle,
                    defaults={
                        'body_type': vehicle_data['body_type'],
                        'doors': 4 if vehicle_data['body_type'] != 'pickup' else 2,
                        'seats': 5 if vehicle_data['body_type'] != 'pickup' else 6,
                        'trunk_volume': 400
                    }
                )
                
                if car_created:
                    self.stdout.write(f'Создан автомобиль: {car}')
                
                # Создаем характеристики
                for feature_name, feature_value in vehicle_data['features'].items():
                    VehicleFeature.objects.get_or_create(
                        vehicle=vehicle,
                        name=feature_name,
                        defaults={'value': feature_value}
                    )
                
                # Добавляем характеристику "Старая цена"
                if 'original_price' in vehicle_data:
                    VehicleFeature.objects.get_or_create(
                        vehicle=vehicle,
                        name='Старая цена',
                        defaults={'value': f"{vehicle_data['original_price']:,} ₽"}
                    )
        
        self.stdout.write(self.style.SUCCESS('Данные успешно загружены!')) 