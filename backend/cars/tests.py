from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

from .models import (
    Vehicle, Car, Motorcycle, Boat, Aircraft, Brand, Model,
    Auction, AuctionLot, AuctionBid,
    LeasingCompany, LeasingProgram, LeasingApplication,
    InsuranceCompany, InsuranceType, InsurancePolicy
)
from companies.models import Company

User = get_user_model()

class VehicleModelTest(TestCase):
    """Тесты для модели Vehicle"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.company = Company.objects.create(
            name='Test Company',
            user=self.user,
            city='Moscow'
        )
        
    def test_vehicle_creation(self):
        """Тест создания транспортного средства"""
        vehicle = Vehicle.objects.create(
            vehicle_type='car',
            brand='Toyota',
            model='Camry',
            year=2020,
            mileage=50000,
            price=Decimal('2000000.00'),
            fuel_type='petrol',
            transmission='automatic',
            engine_volume=Decimal('2.5'),
            power=200,
            color='white',
            vin='1HGBH41JXMN109186',
            description='Отличный автомобиль',
            company=self.company
        )
        
        self.assertEqual(vehicle.brand, 'Toyota')
        self.assertEqual(vehicle.model, 'Camry')
        self.assertEqual(vehicle.year, 2020)
        self.assertEqual(vehicle.price, Decimal('2000000.00'))
        self.assertTrue(vehicle.is_active)
        
    def test_vin_validation(self):
        """Тест валидации VIN номера"""
        # Неверная длина VIN
        with self.assertRaises(Exception):
            Vehicle.objects.create(
                vehicle_type='car',
                brand='Toyota',
                model='Camry',
                year=2020,
                vin='12345',  # Неверная длина
                company=self.company
            )
            
        # Неверные символы в VIN
        with self.assertRaises(Exception):
            Vehicle.objects.create(
                vehicle_type='car',
                brand='Toyota',
                model='Camry',
                year=2020,
                vin='1HGBH41JXMN10918I',  # Содержит I
                company=self.company
            )

class AuctionModelTest(TestCase):
    """Тесты для модели Auction"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.company = Company.objects.create(
            name='Test Company',
            user=self.user,
            city='Moscow'
        )
        self.vehicle = Vehicle.objects.create(
            vehicle_type='car',
            brand='Toyota',
            model='Camry',
            year=2020,
            vin='1HGBH41JXMN109186',
            company=self.company
        )
        
    def test_auction_creation(self):
        """Тест создания аукциона"""
        auction = Auction.objects.create(
            title='Аукцион Toyota Camry',
            description='Продажа автомобиля',
            auction_type='english',
            status='scheduled',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=7),
            min_bid=Decimal('100000.00'),
            current_price=Decimal('100000.00'),
            bid_increment=Decimal('10000.00'),
            created_by=self.user
        )
        
        self.assertEqual(auction.title, 'Аукцион Toyota Camry')
        self.assertEqual(auction.status, 'scheduled')
        self.assertFalse(auction.is_active)
        
    def test_auction_lot_creation(self):
        """Тест создания лота аукциона"""
        auction = Auction.objects.create(
            title='Аукцион Toyota Camry',
            description='Продажа автомобиля',
            auction_type='english',
            status='active',
            start_date=timezone.now() - timedelta(hours=1),
            end_date=timezone.now() + timedelta(days=6),
            min_bid=Decimal('100000.00'),
            current_price=Decimal('100000.00'),
            bid_increment=Decimal('10000.00'),
            created_by=self.user
        )
        
        lot = AuctionLot.objects.create(
            auction=auction,
            vehicle=self.vehicle,
            lot_number=1,
            starting_price=Decimal('100000.00'),
            current_price=Decimal('100000.00')
        )
        
        self.assertEqual(lot.lot_number, 1)
        self.assertEqual(lot.vehicle, self.vehicle)
        self.assertFalse(lot.is_sold)

class LeasingModelTest(TestCase):
    """Тесты для моделей лизинга"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.company = Company.objects.create(
            name='Test Company',
            user=self.user,
            city='Moscow'
        )
        self.vehicle = Vehicle.objects.create(
            vehicle_type='car',
            brand='Toyota',
            model='Camry',
            year=2020,
            vin='1HGBH41JXMN109186',
            company=self.company
        )
        self.leasing_company = LeasingCompany.objects.create(
            name='Test Leasing',
            description='Лизинговая компания',
            phone='+7-999-123-45-67',
            email='leasing@test.com',
            address='Moscow, Russia'
        )
        
    def test_leasing_program_creation(self):
        """Тест создания лизинговой программы"""
        program = LeasingProgram.objects.create(
            company=self.leasing_company,
            name='Стандартная программа',
            description='Лизинг на выгодных условиях',
            min_down_payment=Decimal('20.00'),
            max_term=60,
            interest_rate=Decimal('12.50')
        )
        
        self.assertEqual(program.name, 'Стандартная программа')
        self.assertEqual(program.min_down_payment, Decimal('20.00'))
        self.assertEqual(program.max_term, 60)
        
    def test_leasing_application_creation(self):
        """Тест создания заявки на лизинг"""
        program = LeasingProgram.objects.create(
            company=self.leasing_company,
            name='Стандартная программа',
            description='Лизинг на выгодных условиях',
            min_down_payment=Decimal('20.00'),
            max_term=60,
            interest_rate=Decimal('12.50')
        )
        
        application = LeasingApplication.objects.create(
            program=program,
            vehicle=self.vehicle,
            applicant=self.user,
            status='submitted',
            down_payment=Decimal('400000.00'),
            term_months=36
        )
        
        self.assertEqual(application.status, 'submitted')
        self.assertEqual(application.down_payment, Decimal('400000.00'))
        self.assertEqual(application.term_months, 36)

class InsuranceModelTest(TestCase):
    """Тесты для моделей страхования"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.company = Company.objects.create(
            name='Test Company',
            user=self.user,
            city='Moscow'
        )
        self.vehicle = Vehicle.objects.create(
            vehicle_type='car',
            brand='Toyota',
            model='Camry',
            year=2020,
            vin='1HGBH41JXMN109186',
            company=self.company
        )
        self.insurance_company = InsuranceCompany.objects.create(
            name='Test Insurance',
            description='Страховая компания',
            phone='+7-999-123-45-67',
            email='insurance@test.com',
            address='Moscow, Russia',
            license_number='1234567890'
        )
        
    def test_insurance_type_creation(self):
        """Тест создания типа страхования"""
        insurance_type = InsuranceType.objects.create(
            name='КАСКО',
            description='Полное страхование автомобиля',
            is_mandatory=False
        )
        
        self.assertEqual(insurance_type.name, 'КАСКО')
        self.assertFalse(insurance_type.is_mandatory)
        
    def test_insurance_policy_creation(self):
        """Тест создания страхового полиса"""
        insurance_type = InsuranceType.objects.create(
            name='КАСКО',
            description='Полное страхование автомобиля',
            is_mandatory=False
        )
        
        policy = InsurancePolicy.objects.create(
            company=self.insurance_company,
            insurance_type=insurance_type,
            vehicle=self.vehicle,
            policy_number='POL-2024-001',
            status='active',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=365),
            premium_amount=Decimal('50000.00'),
            coverage_amount=Decimal('2000000.00'),
            deductible=Decimal('10000.00'),
            insured_person=self.user
        )
        
        self.assertEqual(policy.policy_number, 'POL-2024-001')
        self.assertEqual(policy.status, 'active')
        self.assertTrue(policy.is_active)

class VehicleAPITest(APITestCase):
    """Тесты API для транспортных средств"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.company = Company.objects.create(
            name='Test Company',
            user=self.user,
            city='Moscow'
        )
        self.client.force_authenticate(user=self.user)
        
    def test_vehicle_list_api(self):
        """Тест API списка транспортных средств"""
        Vehicle.objects.create(
            vehicle_type='car',
            brand='Toyota',
            model='Camry',
            year=2020,
            vin='1HGBH41JXMN109186',
            company=self.company
        )
        
        url = reverse('vehicle-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_vehicle_create_api(self):
        """Тест API создания транспортного средства"""
        url = reverse('vehicle-list')
        data = {
            'vehicle_type': 'car',
            'brand': 'Toyota',
            'model': 'Camry',
            'year': 2020,
            'mileage': 50000,
            'price': '2000000.00',
            'fuel_type': 'petrol',
            'transmission': 'automatic',
            'engine_volume': '2.5',
            'power': 200,
            'color': 'white',
            'vin': '1HGBH41JXMN109186',
            'description': 'Отличный автомобиль'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vehicle.objects.count(), 1)
        self.assertEqual(Vehicle.objects.first().brand, 'Toyota')

class AuctionAPITest(APITestCase):
    """Тесты API для аукционов"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.company = Company.objects.create(
            name='Test Company',
            user=self.user,
            city='Moscow'
        )
        self.vehicle = Vehicle.objects.create(
            vehicle_type='car',
            brand='Toyota',
            model='Camry',
            year=2020,
            vin='1HGBH41JXMN109186',
            company=self.company
        )
        self.client.force_authenticate(user=self.user)
        
    def test_auction_create_api(self):
        """Тест API создания аукциона"""
        url = reverse('auction-list')
        data = {
            'title': 'Аукцион Toyota Camry',
            'description': 'Продажа автомобиля',
            'auction_type': 'english',
            'status': 'scheduled',
            'start_date': (timezone.now() + timedelta(days=1)).isoformat(),
            'end_date': (timezone.now() + timedelta(days=7)).isoformat(),
            'min_bid': '100000.00',
            'current_price': '100000.00',
            'bid_increment': '10000.00'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Auction.objects.count(), 1)
        self.assertEqual(Auction.objects.first().title, 'Аукцион Toyota Camry') 