from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

class Brand(models.Model):
    """Car brand model"""
    name = models.CharField(_('name'), max_length=100, unique=True)
    logo = models.ImageField(_('logo'), upload_to='brands/', null=True, blank=True)
    description = models.TextField(_('description'), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Model(models.Model):
    """Car model model"""
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('brand', 'name')
        ordering = ['brand', 'name']

    def __str__(self):
        return f"{self.brand.name} {self.name}"

class Car(models.Model):
    """Car model"""
    FUEL_TYPES = [
        ('petrol', _('Petrol')),
        ('diesel', _('Diesel')),
        ('electric', _('Electric')),
        ('hybrid', _('Hybrid')),
        ('gas', _('Gas')),
    ]

    TRANSMISSION_TYPES = [
        ('manual', _('Manual')),
        ('automatic', _('Automatic')),
        ('robot', _('Robot')),
        ('variator', _('Variator')),
    ]

    BODY_TYPES = [
        ('sedan', _('Sedan')),
        ('hatchback', _('Hatchback')),
        ('wagon', _('Wagon')),
        ('suv', _('SUV')),
        ('crossover', _('Crossover')),
        ('coupe', _('Coupe')),
        ('convertible', _('Convertible')),
        ('pickup', _('Pickup')),
        ('van', _('Van')),
    ]

    model = models.ForeignKey('Model', on_delete=models.CASCADE, related_name='cars', null=True, blank=True, default=None)
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='cars', null=True, blank=True, default=None)
    year = models.PositiveIntegerField(_('year'), default=2000)
    mileage = models.PositiveIntegerField(_('mileage'), default=0)
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(_('currency'), max_length=3, default='RUB')
    fuel_type = models.CharField(_('fuel type'), max_length=20, choices=FUEL_TYPES, default='petrol')
    transmission = models.CharField(_('transmission'), max_length=20, choices=TRANSMISSION_TYPES, default='manual')
    body_type = models.CharField(_('body type'), max_length=20, choices=BODY_TYPES, default='sedan')
    engine_volume = models.DecimalField(_('engine volume'), max_digits=3, decimal_places=1, default=1.0)
    power = models.PositiveIntegerField(_('power'), default=100)
    color = models.CharField(_('color'), max_length=50, default='white')
    vin = models.CharField(_('VIN'), max_length=17, unique=True, default='TEMPVIN000000000')
    description = models.TextField(_('description'), default='No description')
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.model} {self.year}"

class CarImage(models.Model):
    """Car image model"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(_('image'), upload_to='cars/')
    is_main = models.BooleanField(_('main image'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_main', '-created_at']

    def __str__(self):
        return f"Image for {self.car}"

class CarFeature(models.Model):
    """Car feature model"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='features')
    name = models.CharField(_('name'), max_length=100)
    value = models.CharField(_('value'), max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('car', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name}: {self.value}" 