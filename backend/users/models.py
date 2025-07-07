from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _

class Role(models.Model):
    """Модель ролей пользователей"""
    name = models.CharField('Название', max_length=100, unique=True)
    description = models.TextField('Описание', blank=True)
    permissions = models.ManyToManyField(
        Permission,
        verbose_name='Разрешения',
        blank=True,
        related_name='roles'
    )
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Роль'
        verbose_name_plural = 'Роли'
        ordering = ['name']

    def __str__(self):
        return self.name

class User(AbstractUser):
    """Пользователь с дополнительными полями"""
    email = models.EmailField('Email адрес', unique=True, default='unknown@example.com')
    phone = models.CharField('Номер телефона', max_length=15, blank=True, default='0000000000')
    avatar = models.ImageField('Аватар', upload_to='avatars/', null=True, blank=True)
    bio = models.TextField('О себе', blank=True, default='')
    is_verified = models.BooleanField('Подтвержден', default=False)
    vk_id = models.CharField('VK ID', max_length=50, blank=True, default='')
    telegram_id = models.CharField('Telegram ID', max_length=50, blank=True, default='')
    youtube_channel = models.CharField('YouTube канал', max_length=100, blank=True, default='')
    subscription_end = models.DateTimeField('Окончание подписки', null=True, blank=True, default=None)
    role = models.ForeignKey(
        'Role',
        verbose_name='Роль',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        default=None
    )
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    # Override username field to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    def has_permission(self, permission_codename):
        """Проверяет наличие разрешения у пользователя"""
        if self.is_superuser:
            return True
        if self.role:
            return self.role.permissions.filter(codename=permission_codename).exists()
        return False

class EmailVerificationToken(models.Model):
    """Модель для токенов верификации email"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    token = models.CharField('Токен', max_length=100, unique=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Токен верификации'
        verbose_name_plural = 'Токены верификации'
        ordering = ['-created_at']

    def __str__(self):
        return f"Токен для {self.user.email}"

class FavoriteCar(models.Model):
    """Избранные автомобили пользователя"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_cars', verbose_name='Пользователь')
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE, related_name='favorited_by', verbose_name='Автомобиль')
    created_at = models.DateTimeField('Дата добавления', auto_now_add=True)

    class Meta:
        verbose_name = 'Избранный автомобиль'
        verbose_name_plural = 'Избранные автомобили'
        unique_together = ('user', 'car')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.car}"

class ViewHistory(models.Model):
    """История просмотров автомобилей пользователем"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='view_history', verbose_name='Пользователь')
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE, related_name='viewed_by', verbose_name='Автомобиль')
    viewed_at = models.DateTimeField('Дата просмотра', auto_now_add=True)

    class Meta:
        verbose_name = 'История просмотров'
        verbose_name_plural = 'Истории просмотров'
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.user.email} - {self.car} ({self.viewed_at})"

class UserReview(models.Model):
    """Отзывы пользователей о компаниях"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_reviews', verbose_name='Пользователь')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='user_reviews', verbose_name='Компания')
    rating = models.PositiveSmallIntegerField('Оценка')
    comment = models.TextField('Комментарий')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Отзыв пользователя'
        verbose_name_plural = 'Отзывы пользователей'
        unique_together = ('user', 'company')
        ordering = ['-created_at']

    def __str__(self):
        return f"Отзыв от {self.user.email} о {self.company.name}" 