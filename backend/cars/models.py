from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
import re
from django.utils import timezone

def validate_vin(value):
    """Валидация VIN номера"""
    if not value:
        return
    
    # Проверяем длину VIN (может быть 17 символов или короче для старых автомобилей)
    if len(value) > 17:
        raise ValidationError(_('VIN номер не может быть длиннее 17 символов'))
    
    # Проверяем, что VIN содержит только буквы и цифры
    if not re.match(r'^[A-HJ-NPR-Z0-9]+$', value.upper()):
        raise ValidationError(_('VIN номер может содержать только буквы (кроме I, O, Q) и цифры'))
    
    # Проверяем контрольную цифру только для 17-значных VIN
    if len(value) == 17:
        weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
        values = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
            'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9, 'S': 2,
            'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
        }
        
        vin_upper = value.upper()
        total = 0
        
        for i, char in enumerate(vin_upper):
            if char.isdigit():
                weight = int(char)
            else:
                weight = values.get(char, 0)
            
            total += weight * weights[i]
        
        check_digit = total % 11
        if check_digit == 10:
            check_digit = 'X'
        
        if str(check_digit) != vin_upper[8]:
            raise ValidationError(_('Неверная контрольная цифра VIN номера'))

class Brand(models.Model):
    """Модель марки автомобиля"""
    name = models.CharField('Название', max_length=100, unique=True)
    logo = models.ImageField('Логотип', upload_to='brands/', null=True, blank=True)
    description = models.TextField('Описание', blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Марка'
        verbose_name_plural = 'Марки'
        ordering = ['name']

    def __str__(self):
        return self.name

class Model(models.Model):
    """Модель автомобиля"""
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='models', verbose_name='Марка')
    name = models.CharField('Название', max_length=100)
    description = models.TextField('Описание', blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Модель'
        verbose_name_plural = 'Модели'
        unique_together = ('brand', 'name')
        ordering = ['brand', 'name']

    def __str__(self):
        return f"{self.brand.name} {self.name}"

class Vehicle(models.Model):
    """Универсальная модель транспорта"""
    VEHICLE_TYPES = [
        ('car', 'Автомобиль'),
        ('motorcycle', 'Мотоцикл'),
        ('truck', 'Грузовик'),
        ('bus', 'Автобус'),
        ('boat', 'Лодка'),
        ('yacht', 'Яхта'),
        ('helicopter', 'Вертолет'),
        ('airplane', 'Самолет'),
        ('tractor', 'Трактор'),
        ('special', 'Спецтехника'),
    ]

    FUEL_TYPES = [
        ('petrol', 'Бензин'),
        ('diesel', 'Дизель'),
        ('electric', 'Электро'),
        ('hybrid', 'Гибрид'),
        ('gas', 'Газ'),
        ('kerosene', 'Керосин'),
        ('aviation_fuel', 'Авиационное топливо'),
    ]

    TRANSMISSION_TYPES = [
        ('manual', 'Механика'),
        ('automatic', 'Автомат'),
        ('robot', 'Робот'),
        ('variator', 'Вариатор'),
        ('cvt', 'Бесступенчатая'),
    ]

    vehicle_type = models.CharField('Тип транспорта', max_length=20, choices=VEHICLE_TYPES, default='car')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='vehicles', verbose_name='Марка')
    model = models.ForeignKey(Model, on_delete=models.CASCADE, related_name='vehicles', verbose_name='Модель')
    year = models.PositiveIntegerField('Год выпуска', default=2000)
    mileage = models.PositiveIntegerField('Пробег', default=0)
    price = models.DecimalField('Цена', max_digits=15, decimal_places=2, default=0)
    currency = models.CharField('Валюта', max_length=3, default='RUB')
    fuel_type = models.CharField('Тип топлива', max_length=20, choices=FUEL_TYPES, default='petrol')
    transmission = models.CharField('Трансмиссия', max_length=20, choices=TRANSMISSION_TYPES, default='manual')
    engine_volume = models.DecimalField('Объем двигателя', max_digits=5, decimal_places=2, default=1.0)
    power = models.PositiveIntegerField('Мощность', default=100)
    color = models.CharField('Цвет', max_length=50, default='white')
    vin = models.CharField('VIN/Серийный номер', max_length=50, unique=True, validators=[validate_vin], null=True, blank=True)
    description = models.TextField('Описание', default='Без описания')
    is_active = models.BooleanField('Активен', default=True)
    is_available = models.BooleanField('Доступен', default=True)
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='vehicles', null=True, blank=True, default=None, verbose_name='Компания')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Транспорт'
        verbose_name_plural = 'Транспорт'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['vehicle_type']),
            models.Index(fields=['vin']),
            models.Index(fields=['year']),
            models.Index(fields=['price']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_available']),
            models.Index(fields=['company']),
            models.Index(fields=['brand']),
            models.Index(fields=['model']),
        ]

    def __str__(self):
        return f"{self.brand.name} {self.model.name} ({self.year})"

    def clean(self):
        """Дополнительная валидация"""
        super().clean()
        
        # Проверяем год выпуска
        if self.year < 1900 or self.year > 2030:
            raise ValidationError(_('Год выпуска должен быть между 1900 и 2030'))
        
        # Проверяем пробег
        if self.mileage > 1000000:
            raise ValidationError(_('Пробег не может превышать 1,000,000 км'))
        
        # Проверяем цену
        if self.price < 0:
            raise ValidationError(_('Цена не может быть отрицательной'))

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class Car(models.Model):
    """Автомобиль (наследует от Vehicle)"""
    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='car_details', verbose_name='Транспорт', null=True, blank=True)
    
    BODY_TYPES = [
        ('sedan', 'Седан'),
        ('hatchback', 'Хэтчбек'),
        ('wagon', 'Универсал'),
        ('suv', 'Внедорожник'),
        ('crossover', 'Кроссовер'),
        ('coupe', 'Купе'),
        ('convertible', 'Кабриолет'),
        ('pickup', 'Пикап'),
        ('van', 'Минивэн'),
    ]

    body_type = models.CharField('Тип кузова', max_length=20, choices=BODY_TYPES, default='sedan')
    doors = models.PositiveIntegerField('Количество дверей', default=4)
    seats = models.PositiveIntegerField('Количество мест', default=5)
    trunk_volume = models.PositiveIntegerField('Объем багажника (л)', default=400)
    
    class Meta:
        verbose_name = 'Автомобиль'
        verbose_name_plural = 'Автомобили'

    def __str__(self):
        return str(self.vehicle)

class Motorcycle(models.Model):
    """Мотоцикл (наследует от Vehicle)"""
    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='motorcycle_details', verbose_name='Транспорт')
    
    ENGINE_TYPES = [
        ('inline', 'Рядный'),
        ('v_twin', 'V-образный'),
        ('boxer', 'Оппозитный'),
        ('single', 'Одноцилиндровый'),
    ]
    
    engine_type = models.CharField('Тип двигателя', max_length=20, choices=ENGINE_TYPES, default='inline')
    cylinders = models.PositiveIntegerField('Количество цилиндров', default=2)
    cooling = models.CharField('Охлаждение', max_length=20, choices=[
        ('air', 'Воздушное'),
        ('liquid', 'Жидкостное'),
        ('oil', 'Масляное'),
    ], default='air')
    fuel_capacity = models.PositiveIntegerField('Объем топливного бака (л)', default=15)
    
    class Meta:
        verbose_name = 'Мотоцикл'
        verbose_name_plural = 'Мотоциклы'

    def __str__(self):
        return str(self.vehicle)

class Boat(models.Model):
    """Лодка/Яхта (наследует от Vehicle)"""
    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='boat_details', verbose_name='Транспорт')
    
    BOAT_TYPES = [
        ('motorboat', 'Моторная лодка'),
        ('sailboat', 'Парусная лодка'),
        ('yacht', 'Яхта'),
        ('catamaran', 'Катамаран'),
        ('jet_ski', 'Гидроцикл'),
    ]
    
    boat_type = models.CharField('Тип судна', max_length=20, choices=BOAT_TYPES, default='motorboat')
    length = models.DecimalField('Длина (м)', max_digits=5, decimal_places=2, default=5.0)
    beam = models.DecimalField('Ширина (м)', max_digits=4, decimal_places=2, default=2.0)
    draft = models.DecimalField('Осадка (м)', max_digits=3, decimal_places=2, default=0.5)
    capacity = models.PositiveIntegerField('Вместимость (чел)', default=4)
    
    class Meta:
        verbose_name = 'Судно'
        verbose_name_plural = 'Судна'

    def __str__(self):
        return str(self.vehicle)

class Aircraft(models.Model):
    """Воздушное судно (наследует от Vehicle)"""
    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='aircraft_details', verbose_name='Транспорт')
    
    AIRCRAFT_TYPES = [
        ('helicopter', 'Вертолет'),
        ('airplane', 'Самолет'),
        ('gyrocopter', 'Автожир'),
        ('drone', 'Дрон'),
    ]
    
    aircraft_type = models.CharField('Тип воздушного судна', max_length=20, choices=AIRCRAFT_TYPES, default='helicopter')
    wingspan = models.DecimalField('Размах крыльев (м)', max_digits=5, decimal_places=2, null=True, blank=True)
    length = models.DecimalField('Длина (м)', max_digits=5, decimal_places=2, default=5.0)
    max_altitude = models.PositiveIntegerField('Максимальная высота (м)', default=1000)
    range = models.PositiveIntegerField('Дальность полета (км)', default=100)
    flight_hours = models.PositiveIntegerField('Налет часов', default=0)
    
    class Meta:
        verbose_name = 'Воздушное судно'
        verbose_name_plural = 'Воздушные суда'

    def __str__(self):
        return str(self.vehicle)

class VehicleImage(models.Model):
    """Изображение транспорта"""
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='images', verbose_name='Транспорт')
    image = models.ImageField('Изображение', upload_to='vehicles/')
    is_main = models.BooleanField('Главное изображение', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Изображение транспорта'
        verbose_name_plural = 'Изображения транспорта'
        ordering = ['-is_main', '-created_at']
        indexes = [
            models.Index(fields=['vehicle']),
            models.Index(fields=['is_main']),
        ]

    def __str__(self):
        return f"Изображение {self.vehicle}"

class VehicleFeature(models.Model):
    """Характеристика транспорта"""
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='features', verbose_name='Транспорт')
    name = models.CharField('Название', max_length=100)
    value = models.CharField('Значение', max_length=100, default='')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True, default=timezone.now)

    class Meta:
        verbose_name = 'Характеристика транспорта'
        verbose_name_plural = 'Характеристики транспорта'
        unique_together = ('vehicle', 'name')
        ordering = ['name']
        indexes = [
            models.Index(fields=['vehicle']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"{self.name}: {self.value}"

# Auction System
class Auction(models.Model):
    """Аукцион"""
    AUCTION_TYPES = [
        ('english', 'Английский'),
        ('dutch', 'Голландский'),
        ('sealed', 'Закрытый'),
        ('reverse', 'Обратный'),
    ]
    
    AUCTION_STATUS = [
        ('draft', 'Черновик'),
        ('scheduled', 'Запланирован'),
        ('active', 'Активен'),
        ('paused', 'Приостановлен'),
        ('ended', 'Завершен'),
        ('cancelled', 'Отменен'),
    ]
    
    title = models.CharField('Название', max_length=200)
    description = models.TextField('Описание')
    auction_type = models.CharField('Тип аукциона', max_length=20, choices=AUCTION_TYPES, default='english')
    status = models.CharField('Статус', max_length=20, choices=AUCTION_STATUS, default='draft')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='auctions', verbose_name='Транспорт')
    start_date = models.DateTimeField('Дата начала')
    end_date = models.DateTimeField('Дата окончания')
    min_bid = models.DecimalField('Минимальная ставка', max_digits=10, decimal_places=2)
    reserve_price = models.DecimalField('Резервная цена', max_digits=10, decimal_places=2, null=True, blank=True)
    current_price = models.DecimalField('Текущая цена', max_digits=10, decimal_places=2, default=0)
    bid_increment = models.DecimalField('Шаг ставки', max_digits=10, decimal_places=2, default=1000)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_auctions', verbose_name='Создатель')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Аукцион'
        verbose_name_plural = 'Аукционы'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['auction_type']),
            models.Index(fields=['start_date']),
            models.Index(fields=['end_date']),
            models.Index(fields=['created_by']),
            models.Index(fields=['vehicle']),
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['status', 'end_date']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_active(self):
        return self.status == 'active' and self.start_date <= timezone.now() <= self.end_date

    @property
    def total_bids(self):
        return self.bids.count()

# Удаляем AuctionLot и AuctionBid, заменяем на прямую связь
class AuctionBid(models.Model):
    """Ставка на аукционе"""
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids', verbose_name='Аукцион')
    bidder = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='auction_bids', verbose_name='Ставщик')
    amount = models.DecimalField('Сумма ставки', max_digits=10, decimal_places=2)
    is_winning = models.BooleanField('Победная ставка', default=False)
    created_at = models.DateTimeField('Дата ставки', auto_now_add=True)

    class Meta:
        verbose_name = 'Ставка'
        verbose_name_plural = 'Ставки'
        ordering = ['-amount', 'created_at']
        indexes = [
            models.Index(fields=['auction']),
            models.Index(fields=['bidder']),
            models.Index(fields=['amount']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Ставка {self.amount} от {self.bidder.username}"

# Leasing System
class LeasingCompany(models.Model):
    """Лизинговая компания"""
    name = models.CharField('Название', max_length=200)
    description = models.TextField('Описание')
    logo = models.ImageField('Логотип', upload_to='leasing_companies/', null=True, blank=True)
    website = models.URLField('Веб-сайт', blank=True)
    phone = models.CharField('Телефон', max_length=20)
    email = models.EmailField('Email')
    address = models.TextField('Адрес')
    is_active = models.BooleanField('Активна', default=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Лизинговая компания'
        verbose_name_plural = 'Лизинговые компании'
        ordering = ['name']

    def __str__(self):
        return self.name

class LeasingProgram(models.Model):
    """Лизинговая программа"""
    company = models.ForeignKey(LeasingCompany, on_delete=models.CASCADE, related_name='programs', verbose_name='Компания')
    name = models.CharField('Название программы', max_length=200)
    description = models.TextField('Описание')
    min_down_payment = models.DecimalField('Минимальный первоначальный взнос (%)', max_digits=5, decimal_places=2)
    max_term = models.PositiveIntegerField('Максимальный срок (мес)', default=60)
    interest_rate = models.DecimalField('Процентная ставка (%)', max_digits=5, decimal_places=2)
    is_active = models.BooleanField('Активна', default=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Лизинговая программа'
        verbose_name_plural = 'Лизинговые программы'
        ordering = ['company', 'name']

    def __str__(self):
        return f"{self.company.name} - {self.name}"

class LeasingApplication(models.Model):
    """Заявка на лизинг"""
    APPLICATION_STATUS = [
        ('draft', 'Черновик'),
        ('submitted', 'Подана'),
        ('under_review', 'На рассмотрении'),
        ('approved', 'Одобрена'),
        ('rejected', 'Отклонена'),
        ('cancelled', 'Отменена'),
    ]
    
    program = models.ForeignKey(LeasingProgram, on_delete=models.CASCADE, related_name='applications', verbose_name='Программа')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='leasing_applications', verbose_name='Транспорт')
    applicant = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='leasing_applications', verbose_name='Заявитель')
    status = models.CharField('Статус', max_length=20, choices=APPLICATION_STATUS, default='draft')
    down_payment = models.DecimalField('Первоначальный взнос', max_digits=10, decimal_places=2)
    term_months = models.PositiveIntegerField('Срок лизинга (мес)', default=36)
    monthly_payment = models.DecimalField('Ежемесячный платеж', max_digits=10, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField('Общая сумма', max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField('Примечания', blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Заявка на лизинг'
        verbose_name_plural = 'Заявки на лизинг'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['applicant']),
            models.Index(fields=['vehicle']),
            models.Index(fields=['program']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"Заявка {self.id} - {self.applicant.username}"

# Insurance System
class InsuranceCompany(models.Model):
    """Страховая компания"""
    name = models.CharField('Название', max_length=200)
    description = models.TextField('Описание')
    logo = models.ImageField('Логотип', upload_to='insurance_companies/', null=True, blank=True)
    website = models.URLField('Веб-сайт', blank=True)
    phone = models.CharField('Телефон', max_length=20)
    email = models.EmailField('Email')
    address = models.TextField('Адрес')
    license_number = models.CharField('Номер лицензии', max_length=50)
    is_active = models.BooleanField('Активна', default=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Страховая компания'
        verbose_name_plural = 'Страховые компании'
        ordering = ['name']

    def __str__(self):
        return self.name

class InsuranceType(models.Model):
    """Тип страхования"""
    name = models.CharField('Название', max_length=100)
    description = models.TextField('Описание')
    is_mandatory = models.BooleanField('Обязательное', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Тип страхования'
        verbose_name_plural = 'Типы страхования'
        ordering = ['name']

    def __str__(self):
        return self.name

class InsurancePolicy(models.Model):
    """Страховой полис"""
    POLICY_STATUS = [
        ('draft', 'Черновик'),
        ('active', 'Активен'),
        ('expired', 'Истек'),
        ('cancelled', 'Отменен'),
    ]
    
    company = models.ForeignKey(InsuranceCompany, on_delete=models.CASCADE, related_name='policies', verbose_name='Компания')
    insurance_type = models.ForeignKey(InsuranceType, on_delete=models.CASCADE, related_name='policies', verbose_name='Тип страхования')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='insurance_policies', verbose_name='Транспорт')
    policy_number = models.CharField('Номер полиса', max_length=50, unique=True)
    status = models.CharField('Статус', max_length=20, choices=POLICY_STATUS, default='draft')
    start_date = models.DateField('Дата начала')
    end_date = models.DateField('Дата окончания')
    premium_amount = models.DecimalField('Сумма премии', max_digits=10, decimal_places=2)
    coverage_amount = models.DecimalField('Сумма покрытия', max_digits=15, decimal_places=2)
    deductible = models.DecimalField('Франшиза', max_digits=10, decimal_places=2, default=0)
    insured_person = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='insurance_policies', verbose_name='Страхователь')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Страховой полис'
        verbose_name_plural = 'Страховые полисы'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['policy_number']),
            models.Index(fields=['insured_person']),
            models.Index(fields=['vehicle']),
            models.Index(fields=['company']),
            models.Index(fields=['start_date']),
            models.Index(fields=['end_date']),
            models.Index(fields=['status', 'end_date']),
        ]

    def __str__(self):
        return f"Полис {self.policy_number}"

    @property
    def is_active(self):
        return self.status == 'active' and self.start_date <= timezone.now().date() <= self.end_date

class InsuranceClaim(models.Model):
    """Страховой случай"""
    CLAIM_STATUS = [
        ('filed', 'Подано'),
        ('under_review', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
        ('paid', 'Выплачено'),
    ]
    
    policy = models.ForeignKey(InsurancePolicy, on_delete=models.CASCADE, related_name='claims', verbose_name='Полис')
    claim_number = models.CharField('Номер случая', max_length=50, unique=True)
    status = models.CharField('Статус', max_length=20, choices=CLAIM_STATUS, default='filed')
    incident_date = models.DateTimeField('Дата происшествия')
    description = models.TextField('Описание происшествия')
    damage_amount = models.DecimalField('Сумма ущерба', max_digits=10, decimal_places=2)
    claim_amount = models.DecimalField('Сумма к выплате', max_digits=10, decimal_places=2, null=True, blank=True)
    filed_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='filed_claims', verbose_name='Заявитель')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Страховой случай'
        verbose_name_plural = 'Страховые случаи'
        ordering = ['-created_at']

    def __str__(self):
        return f"Случай {self.claim_number} - {self.policy.vehicle}" 

class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images', verbose_name='Автомобиль')
    image = models.ImageField('Изображение', upload_to='cars/images/')
    is_main = models.BooleanField('Главное изображение', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Изображение автомобиля'
        verbose_name_plural = 'Изображения автомобилей'
        ordering = ['-is_main', '-created_at']

    def __str__(self):
        return f"Изображение для {self.car}"

class CarFeature(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='features', verbose_name='Автомобиль')
    name = models.CharField('Название', max_length=100)
    value = models.CharField('Значение', max_length=100)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Характеристика автомобиля'
        verbose_name_plural = 'Характеристики автомобилей'
        unique_together = ('car', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name}: {self.value}" 