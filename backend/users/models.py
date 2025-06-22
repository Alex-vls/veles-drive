from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _

class Role(models.Model):
    """Модель ролей пользователей"""
    name = models.CharField(_('Название'), max_length=100, unique=True)
    description = models.TextField(_('Описание'), blank=True)
    permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('Разрешения'),
        blank=True,
        related_name='roles'
    )
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Роль')
        verbose_name_plural = _('Роли')
        ordering = ['name']

    def __str__(self):
        return self.name

class User(AbstractUser):
    """Custom user model with additional fields"""
    email = models.EmailField(_('email address'), unique=True, default='unknown@example.com')
    phone = models.CharField(_('phone number'), max_length=15, blank=True, default='0000000000')
    avatar = models.ImageField(_('avatar'), upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(_('bio'), blank=True, default='')
    is_verified = models.BooleanField(_('verified'), default=False)
    vk_id = models.CharField(_('VK ID'), max_length=50, blank=True, default='')
    telegram_id = models.CharField(_('Telegram ID'), max_length=50, blank=True, default='')
    youtube_channel = models.CharField(_('YouTube channel'), max_length=100, blank=True, default='')
    subscription_end = models.DateTimeField(_('Окончание подписки'), null=True, blank=True, default=None)
    role = models.ForeignKey(
        'Role',
        verbose_name=_('Роль'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        default=None
    )
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    # Override username field to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Токен верификации')
        verbose_name_plural = _('Токены верификации')
        ordering = ['-created_at']

    def __str__(self):
        return f"Token for {self.user.email}"

class FavoriteCar(models.Model):
    """Model for storing user's favorite cars"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_cars')
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'car')
        ordering = ['-created_at']

class ViewHistory(models.Model):
    """Model for storing user's car view history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='view_history')
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE, related_name='viewed_by')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'View histories'
        ordering = ['-viewed_at']

class UserReview(models.Model):
    """Model for storing user's reviews"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_reviews')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='user_reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'company')
        ordering = ['-created_at'] 