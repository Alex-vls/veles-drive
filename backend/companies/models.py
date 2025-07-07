from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

class Company(models.Model):
    """Модель компании"""
    owner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='owned_companies', null=True, blank=True, default=None, verbose_name='Владелец')
    name = models.CharField('Название', max_length=200, default='Неизвестно')
    description = models.TextField('Описание', default='Без описания')
    logo = models.ImageField('Логотип', upload_to='companies/logos/', null=True, blank=True)
    address = models.CharField('Адрес', max_length=200, default='Неизвестный адрес')
    city = models.CharField('Город', max_length=100, default='Неизвестно')
    phone = models.CharField('Телефон', max_length=20, default='0000000000')
    email = models.EmailField('Email', default='unknown@example.com')
    website = models.URLField('Веб-сайт', blank=True, default='')
    is_verified = models.BooleanField('Проверена', default=False)
    rating = models.DecimalField(
        'Рейтинг',
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Компания'
        verbose_name_plural = 'Компании'
        ordering = ['-rating', '-created_at']

    def __str__(self):
        return self.name

class CompanyImage(models.Model):
    """Изображение компании"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='images', verbose_name='Компания')
    image = models.ImageField('Изображение', upload_to='companies/images/')
    is_main = models.BooleanField('Главное изображение', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Изображение компании'
        verbose_name_plural = 'Изображения компаний'
        ordering = ['-is_main', '-created_at']

    def __str__(self):
        return f"Изображение для {self.company}"

class CompanyFeature(models.Model):
    """Характеристика компании"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='features', verbose_name='Компания')
    name = models.CharField('Название', max_length=100)
    value = models.CharField('Значение', max_length=100)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Характеристика компании'
        verbose_name_plural = 'Характеристики компаний'
        unique_together = ('company', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name}: {self.value}"

class CompanySchedule(models.Model):
    """Расписание работы компании"""
    DAYS_OF_WEEK = [
        (0, 'Понедельник'),
        (1, 'Вторник'),
        (2, 'Среда'),
        (3, 'Четверг'),
        (4, 'Пятница'),
        (5, 'Суббота'),
        (6, 'Воскресенье'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='schedule', verbose_name='Компания')
    day_of_week = models.PositiveSmallIntegerField(
        'День недели',
        choices=DAYS_OF_WEEK,
        validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    open_time = models.TimeField('Время открытия')
    close_time = models.TimeField('Время закрытия')
    is_closed = models.BooleanField('Закрыто', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Расписание работы'
        verbose_name_plural = 'Расписания работы'
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