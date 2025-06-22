from rest_framework import serializers
from .models import Company, Review, CompanyImage, CompanyFeature, CompanySchedule
from users.serializers import UserProfileSerializer

class ReviewSerializer(serializers.ModelSerializer):
    """Сериализатор для отзывов"""
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'rating', 'text', 'created_at', 'is_approved')
        read_only_fields = ('id', 'user', 'created_at', 'is_approved')

class CompanySerializer(serializers.ModelSerializer):
    """Сериализатор для компаний"""
    user = UserProfileSerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = (
            'id', 'name', 'description', 'address', 'logo',
            'rating', 'is_verified', 'created_at', 'updated_at',
            'user', 'reviews', 'average_rating'
        )
        read_only_fields = ('id', 'rating', 'is_verified', 'created_at', 'updated_at', 'user')

    def get_average_rating(self, obj):
        approved_reviews = obj.reviews.filter(is_approved=True)
        if not approved_reviews:
            return 0
        return sum(review.rating for review in approved_reviews) / approved_reviews.count()

class CompanyImageSerializer(serializers.ModelSerializer):
    """Serializer for CompanyImage model"""
    class Meta:
        model = CompanyImage
        fields = ('id', 'image', 'is_main', 'created_at')
        read_only_fields = ('id', 'created_at')

class CompanyFeatureSerializer(serializers.ModelSerializer):
    """Serializer for CompanyFeature model"""
    class Meta:
        model = CompanyFeature
        fields = ('id', 'name', 'value', 'created_at')
        read_only_fields = ('id', 'created_at')

class CompanyScheduleSerializer(serializers.ModelSerializer):
    """Serializer for CompanySchedule model"""
    class Meta:
        model = CompanySchedule
        fields = ('id', 'day_of_week', 'open_time', 'close_time',
                 'is_closed', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class CompanyListSerializer(serializers.ModelSerializer):
    """Serializer for Company model (list view)"""
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ('id', 'name', 'city', 'phone', 'email', 'website',
                 'is_verified', 'rating', 'main_image', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_main_image(self, obj):
        image = obj.images.filter(is_main=True).first()
        if image:
            return CompanyImageSerializer(image).data
        return None

class CompanyDetailSerializer(serializers.ModelSerializer):
    """Serializer for Company model (detail view)"""
    owner = serializers.SerializerMethodField()
    images = CompanyImageSerializer(many=True, read_only=True)
    features = CompanyFeatureSerializer(many=True, read_only=True)
    schedule = CompanyScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ('id', 'owner', 'name', 'description', 'logo', 'address',
                 'city', 'phone', 'email', 'website', 'is_verified',
                 'rating', 'images', 'features', 'schedule',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_owner(self, obj):
        from users.serializers import UserSerializer
        return UserSerializer(obj.owner).data

class CompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Company"""
    images = CompanyImageSerializer(many=True, required=False)
    features = CompanyFeatureSerializer(many=True, required=False)
    schedule = CompanyScheduleSerializer(many=True, required=False)

    class Meta:
        model = Company
        fields = ('name', 'description', 'logo', 'address', 'city',
                 'phone', 'email', 'website', 'images', 'features',
                 'schedule')

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        features_data = validated_data.pop('features', [])
        schedule_data = validated_data.pop('schedule', [])
        company = Company.objects.create(owner=self.context['request'].user,
                                       **validated_data)

        for image_data in images_data:
            CompanyImage.objects.create(company=company, **image_data)

        for feature_data in features_data:
            CompanyFeature.objects.create(company=company, **feature_data)

        for schedule_item in schedule_data:
            CompanySchedule.objects.create(company=company, **schedule_item)

        return company

class CompanyUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Company"""
    images = CompanyImageSerializer(many=True, required=False)
    features = CompanyFeatureSerializer(many=True, required=False)
    schedule = CompanyScheduleSerializer(many=True, required=False)

    class Meta:
        model = Company
        fields = ('name', 'description', 'logo', 'address', 'city',
                 'phone', 'email', 'website', 'images', 'features',
                 'schedule', 'is_verified')

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        features_data = validated_data.pop('features', None)
        schedule_data = validated_data.pop('schedule', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                CompanyImage.objects.create(company=instance, **image_data)

        if features_data is not None:
            instance.features.all().delete()
            for feature_data in features_data:
                CompanyFeature.objects.create(company=instance, **feature_data)

        if schedule_data is not None:
            instance.schedule.all().delete()
            for schedule_item in schedule_data:
                CompanySchedule.objects.create(company=instance, **schedule_item)

        return instance

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('rating', 'text')

    def validate(self, attrs):
        user = self.context['request'].user
        company = self.context['company']
        
        # Проверяем, не оставлял ли пользователь уже отзыв
        if Review.objects.filter(user=user, company=company).exists():
            raise serializers.ValidationError("Вы уже оставили отзыв для этой компании")
        
        # Проверяем, не пытается ли компания оставить отзыв сама себе
        if user == company.user:
            raise serializers.ValidationError("Компания не может оставить отзыв сама себе")
        
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        company = self.context['company']
        return Review.objects.create(user=user, company=company, **validated_data) 