from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.contrib.auth.models import Permission
from .models import User, EmailVerificationToken, Role, FavoriteCar, ViewHistory, UserReview
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    SubscriptionUpdateSerializer,
    RoleSerializer,
    PermissionSerializer,
    UserRoleSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    FavoriteCarSerializer,
    ViewHistorySerializer,
    UserReviewSerializer
)
from django.core.cache import cache
from core.decorators import cache_response
from core.services import NotificationService
from rest_framework.decorators import action

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        token = get_random_string(length=32)
        EmailVerificationToken.objects.create(user=user, token=token)
        
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
        send_mail(
            'Подтверждение email',
            f'Для подтверждения email перейдите по ссылке: {verification_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

class UserLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                login(request, user)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            return Response(
                {'error': 'Неверные учетные данные'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

class PasswordChangeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Неверный текущий пароль'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                token = EmailVerificationToken.objects.get(
                    token=serializer.validated_data['token']
                )
                user = token.user
                user.is_verified = True
                user.save()
                token.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except EmailVerificationToken.DoesNotExist:
                return Response(
                    {'error': 'Недействительный токен'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ResetPasswordRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                token = get_random_string(length=32)
                EmailVerificationToken.objects.create(user=user, token=token)
                
                reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
                send_mail(
                    'Сброс пароля',
                    f'Для сброса пароля перейдите по ссылке: {reset_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                return Response(status=status.HTTP_204_NO_CONTENT)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Пользователь с таким email не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                token = EmailVerificationToken.objects.get(
                    token=serializer.validated_data['token']
                )
                user = token.user
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                token.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except EmailVerificationToken.DoesNotExist:
                return Response(
                    {'error': 'Недействительный токен'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class RoleListView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = (IsAdminUser,)

class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = (IsAdminUser,)

class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = (IsAdminUser,)

class UserRoleUpdateView(generics.UpdateAPIView):
    serializer_class = UserRoleSerializer
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        return User.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class SubscriptionUpdateView(generics.UpdateAPIView):
    serializer_class = SubscriptionUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = serializer.save()
        # Отправляем уведомление об обновлении подписки
        NotificationService.notify_subscription(
            user=user,
            subscription_type=user.subscription_type,
            end_date=user.subscription_end
        )
        # Очищаем кэш профиля пользователя
        cache.delete_pattern(f"view_cache_/api/users/profile/*")

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return self.serializer_class

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user"""
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = UserUpdateSerializer(user, data=request.data,
                                           partial=request.method == 'PATCH')
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class FavoriteCarViewSet(viewsets.ModelViewSet):
    """ViewSet for FavoriteCar model"""
    serializer_class = FavoriteCarSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteCar.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ViewHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet for ViewHistory model"""
    serializer_class = ViewHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ViewHistory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for UserReview model"""
    serializer_class = UserReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserReview.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user) 