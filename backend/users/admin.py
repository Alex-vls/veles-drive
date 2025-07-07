from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerificationToken, Role, FavoriteCar, ViewHistory, UserReview

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'groups', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email', 'token')
    ordering = ('-created_at',)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(FavoriteCar)
class FavoriteCarAdmin(admin.ModelAdmin):
    list_display = ('user', 'car', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'car__vehicle__brand__name')
    ordering = ('-created_at',)

@admin.register(ViewHistory)
class ViewHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'car', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('user__username', 'car__vehicle__brand__name')
    ordering = ('-viewed_at',)

@admin.register(UserReview)
class UserReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'company__name', 'comment')
    ordering = ('-created_at',) 