from rest_framework import serializers
from .models import News, Article, Notification, ModerationLog, ModerationStatus, CarImage, Car
from users.serializers import UserProfileSerializer

class NewsSerializer(serializers.ModelSerializer):
    """Сериализатор для новостей"""
    author = UserProfileSerializer(read_only=True)

    class Meta:
        model = News
        fields = ('id', 'title', 'content', 'image', 'author', 'is_published', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

class NewsCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания новости"""
    class Meta:
        model = News
        fields = ('title', 'content', 'image', 'is_published')

    def create(self, validated_data):
        return News.objects.create(author=self.context['request'].user, **validated_data)

class NewsUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления новости"""
    class Meta:
        model = News
        fields = ('title', 'content', 'image', 'is_published')

    def validate(self, attrs):
        if self.instance.author != self.context['request'].user and not self.context['request'].user.is_staff:
            raise serializers.ValidationError("Вы не можете редактировать чужую новость")
        return attrs

class ArticleSerializer(serializers.ModelSerializer):
    """Сериализатор для статей"""
    author = UserProfileSerializer(read_only=True)

    class Meta:
        model = Article
        fields = ('id', 'title', 'content', 'image', 'author', 'is_published', 'is_premium', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

class ArticleCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания статьи"""
    class Meta:
        model = Article
        fields = ('title', 'content', 'image', 'is_published', 'is_premium')

    def create(self, validated_data):
        return Article.objects.create(author=self.context['request'].user, **validated_data)

class ArticleUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления статьи"""
    class Meta:
        model = Article
        fields = ('title', 'content', 'image', 'is_published', 'is_premium')

    def validate(self, attrs):
        if self.instance.author != self.context['request'].user and not self.context['request'].user.is_staff:
            raise serializers.ValidationError("Вы не можете редактировать чужую статью")
        return attrs

class ArticleListSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    preview_content = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'preview_content', 'image', 'author',
            'is_published', 'is_premium', 'created_at'
        )
        read_only_fields = ('id', 'author', 'created_at')

    def get_preview_content(self, obj):
        # Возвращаем первые 200 символов контента
        return obj.content[:200] + '...' if len(obj.content) > 200 else obj.content

class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'type', 'type_display', 'title', 'message', 'is_read', 'created_at', 'data']
        read_only_fields = ['type', 'title', 'message', 'created_at', 'data']

class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read']

class ModerationLogSerializer(serializers.ModelSerializer):
    moderator_name = serializers.SerializerMethodField()
    content_type_name = serializers.SerializerMethodField()
    content_object_title = serializers.SerializerMethodField()

    class Meta:
        model = ModerationLog
        fields = [
            'id', 'content_type', 'object_id', 'moderator', 'moderator_name',
            'status', 'comment', 'created_at', 'updated_at',
            'content_type_name', 'content_object_title'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_moderator_name(self, obj):
        return obj.moderator.username if obj.moderator else None

    def get_content_type_name(self, obj):
        return obj.content_type.model

    def get_content_object_title(self, obj):
        content_object = obj.content_object
        if hasattr(content_object, 'title'):
            return content_object.title
        elif hasattr(content_object, 'name'):
            return content_object.name
        return str(content_object)

class ModerationActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ModerationStatus.choices)
    comment = serializers.CharField(required=False, allow_blank=True)

class CarImageSerializer(serializers.ModelSerializer):
    """Сериализатор для изображений автомобиля"""
    class Meta:
        model = CarImage
        fields = ('id', 'image', 'is_main', 'created_at')
        read_only_fields = ('id', 'created_at')

class CarSerializer(serializers.ModelSerializer):
    """Сериализатор для автомобилей"""
    company = CompanySerializer(read_only=True)
    images = CarImageSerializer(many=True, read_only=True)
    transmission_display = serializers.CharField(source='get_transmission_display', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)

    class Meta:
        model = Car
        fields = (
            'id', 'brand', 'model', 'year', 'mileage', 'transmission',
            'transmission_display', 'fuel_type', 'fuel_type_display',
            'engine_volume', 'power', 'color', 'price', 'description',
            'is_available', 'company', 'images', 'is_published',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'company', 'created_at', 'updated_at')

class CarCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания автомобиля"""
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Car
        fields = (
            'brand', 'model', 'year', 'mileage', 'transmission',
            'fuel_type', 'engine_volume', 'power', 'color', 'price',
            'description', 'is_available', 'images'
        )

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        car = Car.objects.create(company=self.context['request'].user.company, **validated_data)
        
        # Создаем изображения
        for i, image in enumerate(images):
            CarImage.objects.create(
                car=car,
                image=image,
                is_main=i == 0  # Первое изображение становится главным
            )
        
        return car

class CarUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления автомобиля"""
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Car
        fields = (
            'brand', 'model', 'year', 'mileage', 'transmission',
            'fuel_type', 'engine_volume', 'power', 'color', 'price',
            'description', 'is_available', 'images'
        )

    def validate(self, attrs):
        if self.instance.company != self.context['request'].user.company and not self.context['request'].user.is_staff:
            raise serializers.ValidationError("Вы не можете редактировать чужое объявление")
        return attrs

    def update(self, instance, validated_data):
        images = validated_data.pop('images', None)
        
        # Обновляем основные поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Обновляем изображения, если они предоставлены
        if images is not None:
            # Удаляем старые изображения
            instance.images.all().delete()
            
            # Создаем новые изображения
            for i, image in enumerate(images):
                CarImage.objects.create(
                    car=instance,
                    image=image,
                    is_main=i == 0
                )
        
        return instance

class CarListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка автомобилей"""
    company = CompanySerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    transmission_display = serializers.CharField(source='get_transmission_display', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)

    class Meta:
        model = Car
        fields = (
            'id', 'brand', 'model', 'year', 'mileage', 'transmission',
            'transmission_display', 'fuel_type', 'fuel_type_display',
            'engine_volume', 'power', 'color', 'price', 'is_available',
            'company', 'main_image', 'created_at'
        )
        read_only_fields = ('id', 'company', 'created_at')

    def get_main_image(self, obj):
        main_image = obj.images.filter(is_main=True).first()
        if main_image:
            return main_image.image.url
        return None 