from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.models import Permission
from .models import Role, FavoriteCar, ViewHistory, UserReview

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'user_type', 'phone')
        extra_kwargs = {
            'email': {'required': True},
            'user_type': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type', 'phone', 'is_verified', 'subscription_end')
        read_only_fields = ('id', 'is_verified', 'subscription_end')

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Пароли не совпадают"})
        return attrs

class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class ResetPasswordConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Пароли не совпадают"})
        return attrs

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'codename')

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permissions_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Role
        fields = ('id', 'name', 'description', 'permissions', 'permissions_ids', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        permissions_ids = validated_data.pop('permissions_ids', [])
        role = Role.objects.create(**validated_data)
        if permissions_ids:
            role.permissions.set(permissions_ids)
        return role

    def update(self, instance, validated_data):
        permissions_ids = validated_data.pop('permissions_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if permissions_ids is not None:
            instance.permissions.set(permissions_ids)
        return instance

class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'role_id')
        read_only_fields = ('id', 'username', 'email')

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'phone', 'avatar', 'bio',
                 'is_verified', 'vk_id', 'telegram_id', 'youtube_channel',
                 'date_joined', 'last_login')
        read_only_fields = ('id', 'date_joined', 'last_login')

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating User"""
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'phone')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating User"""
    class Meta:
        model = User
        fields = ('username', 'phone', 'avatar', 'bio',
                 'vk_id', 'telegram_id', 'youtube_channel')

class FavoriteCarSerializer(serializers.ModelSerializer):
    """Serializer for FavoriteCar model"""
    car = serializers.SerializerMethodField()

    class Meta:
        model = FavoriteCar
        fields = ('id', 'car', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_car(self, obj):
        from cars.serializers import CarListSerializer
        return CarListSerializer(obj.car).data

class ViewHistorySerializer(serializers.ModelSerializer):
    """Serializer for ViewHistory model"""
    car = serializers.SerializerMethodField()

    class Meta:
        model = ViewHistory
        fields = ('id', 'car', 'viewed_at')
        read_only_fields = ('id', 'viewed_at')

    def get_car(self, obj):
        from cars.serializers import CarListSerializer
        return CarListSerializer(obj.car).data

class UserReviewSerializer(serializers.ModelSerializer):
    """Serializer for UserReview model"""
    user = UserSerializer(read_only=True)
    company = serializers.SerializerMethodField()

    class Meta:
        model = UserReview
        fields = ('id', 'user', 'company', 'rating', 'comment',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def get_company(self, obj):
        from companies.serializers import CompanyListSerializer
        return CompanyListSerializer(obj.company).data 