from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    ChangePasswordView,
    EmailVerificationView,
    ResetPasswordView,
    ResetPasswordConfirmView,
    RoleListView,
    RoleDetailView,
    PermissionListView,
    UserRoleUpdateView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('verify-email/', EmailVerificationView.as_view(), name='verify-email'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('reset-password/confirm/', ResetPasswordConfirmView.as_view(), name='reset-password-confirm'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('roles/', RoleListView.as_view(), name='role-list'),
    path('roles/<int:pk>/', RoleDetailView.as_view(), name='role-detail'),
    path('permissions/', PermissionListView.as_view(), name='permission-list'),
    path('users/<int:pk>/role/', UserRoleUpdateView.as_view(), name='user-role-update'),
] 