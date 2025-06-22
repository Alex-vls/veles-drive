from rest_framework import serializers
from .models import Brand, Model, Car, CarImage, CarFeature
from companies.serializers import CompanySerializer

class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand model"""
    class Meta:
        model = Brand
        fields = ('id', 'name', 'logo', 'description', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class ModelSerializer(serializers.ModelSerializer):
    """Serializer for Model model"""
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        write_only=True,
        source='brand'
    )

    class Meta:
        model = Model
        fields = ('id', 'brand', 'brand_id', 'name', 'description',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class CarImageSerializer(serializers.ModelSerializer):
    """Serializer for CarImage model"""
    class Meta:
        model = CarImage
        fields = ('id', 'image', 'is_main', 'created_at')
        read_only_fields = ('id', 'created_at')

class CarFeatureSerializer(serializers.ModelSerializer):
    """Serializer for CarFeature model"""
    class Meta:
        model = CarFeature
        fields = ('id', 'name', 'value', 'created_at')
        read_only_fields = ('id', 'created_at')

class CarListSerializer(serializers.ModelSerializer):
    """Serializer for Car model (list view)"""
    model = ModelSerializer(read_only=True)
    company = serializers.SerializerMethodField()
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = ('id', 'model', 'company', 'year', 'price', 'currency',
                 'mileage', 'fuel_type', 'transmission', 'body_type',
                 'main_image', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_company(self, obj):
        from companies.serializers import CompanyListSerializer
        return CompanyListSerializer(obj.company).data

    def get_main_image(self, obj):
        image = obj.images.filter(is_main=True).first()
        if image:
            return CarImageSerializer(image).data
        return None

class CarDetailSerializer(serializers.ModelSerializer):
    """Serializer for Car model (detail view)"""
    model = ModelSerializer(read_only=True)
    company = serializers.SerializerMethodField()
    images = CarImageSerializer(many=True, read_only=True)
    features = CarFeatureSerializer(many=True, read_only=True)

    class Meta:
        model = Car
        fields = ('id', 'model', 'company', 'year', 'mileage', 'price',
                 'currency', 'fuel_type', 'transmission', 'body_type',
                 'engine_volume', 'power', 'color', 'vin', 'description',
                 'images', 'features', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_company(self, obj):
        from companies.serializers import CompanyDetailSerializer
        return CompanyDetailSerializer(obj.company).data

class CarCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Car"""
    images = CarImageSerializer(many=True, required=False)
    features = CarFeatureSerializer(many=True, required=False)

    class Meta:
        model = Car
        fields = ('model', 'company', 'year', 'mileage', 'price', 'currency',
                 'fuel_type', 'transmission', 'body_type', 'engine_volume',
                 'power', 'color', 'vin', 'description', 'images', 'features')

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        features_data = validated_data.pop('features', [])
        car = Car.objects.create(**validated_data)

        for image_data in images_data:
            CarImage.objects.create(car=car, **image_data)

        for feature_data in features_data:
            CarFeature.objects.create(car=car, **feature_data)

        return car

class CarUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Car"""
    images = CarImageSerializer(many=True, required=False)
    features = CarFeatureSerializer(many=True, required=False)

    class Meta:
        model = Car
        fields = ('year', 'mileage', 'price', 'currency', 'fuel_type',
                 'transmission', 'body_type', 'engine_volume', 'power',
                 'color', 'vin', 'description', 'images', 'features',
                 'is_active')

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        features_data = validated_data.pop('features', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                CarImage.objects.create(car=instance, **image_data)

        if features_data is not None:
            instance.features.all().delete()
            for feature_data in features_data:
                CarFeature.objects.create(car=instance, **feature_data)

        return instance

class CarImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ('image', 'is_main')

    def validate(self, attrs):
        car = self.context['car']
        if attrs.get('is_main', False):
            # Если это главное изображение, сбрасываем флаг is_main у других изображений
            car.images.filter(is_main=True).update(is_main=False)
        return attrs

    def create(self, validated_data):
        return CarImage.objects.create(car=self.context['car'], **validated_data)

class CarImageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ('is_main',)

    def update(self, instance, validated_data):
        if validated_data.get('is_main', False):
            # Если это главное изображение, сбрасываем флаг is_main у других изображений
            instance.car.images.filter(is_main=True).update(is_main=False)
        return super().update(instance, validated_data) 