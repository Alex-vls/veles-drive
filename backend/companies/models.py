from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

class Company(models.Model):
    """Company model"""
    owner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='owned_companies', null=True, blank=True, default=None)
    name = models.CharField(_('name'), max_length=200, default='Unknown')
    description = models.TextField(_('description'), default='No description')
    logo = models.ImageField(_('logo'), upload_to='companies/logos/', null=True, blank=True)
    address = models.CharField(_('address'), max_length=200, default='Unknown address')
    city = models.CharField(_('city'), max_length=100, default='Unknown')
    phone = models.CharField(_('phone'), max_length=20, default='0000000000')
    email = models.EmailField(_('email'), default='unknown@example.com')
    website = models.URLField(_('website'), blank=True, default='')
    is_verified = models.BooleanField(_('verified'), default=False)
    rating = models.DecimalField(
        _('rating'),
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['-rating', '-created_at']

    def __str__(self):
        return self.name

class CompanyImage(models.Model):
    """Company image model"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(_('image'), upload_to='companies/images/')
    is_main = models.BooleanField(_('main image'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_main', '-created_at']

    def __str__(self):
        return f"Image for {self.company}"

class CompanyFeature(models.Model):
    """Company feature model"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='features')
    name = models.CharField(_('name'), max_length=100)
    value = models.CharField(_('value'), max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('company', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name}: {self.value}"

class CompanySchedule(models.Model):
    """Company schedule model"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='schedule')
    day_of_week = models.PositiveSmallIntegerField(
        _('day of week'),
        validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    open_time = models.TimeField(_('open time'))
    close_time = models.TimeField(_('close time'))
    is_closed = models.BooleanField(_('closed'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('company', 'day_of_week')
        ordering = ['day_of_week']

    def __str__(self):
        return f"{self.company} - {self.get_day_of_week_display()}"

class Review(models.Model):
    """Модель отзыва о компании"""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='company_reviews',
        verbose_name='Компания'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='company_reviews',
        verbose_name='Пользователь'
    )
    rating = models.IntegerField(verbose_name='Оценка')
    text = models.TextField(verbose_name='Текст отзыва')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    is_approved = models.BooleanField(default=False, verbose_name='Одобрен')

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']

    def __str__(self):
        return f'Отзыв от {self.user.username} о {self.company.name}' 