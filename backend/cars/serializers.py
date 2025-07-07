from rest_framework import serializers
from .models import Brand, Model, Car, VehicleImage, VehicleFeature
from .models import CarImage, CarFeature
from companies.serializers import CompanySerializer
from .models import (
    Vehicle, Motorcycle, Boat, Aircraft,
    Auction, AuctionBid,
    LeasingCompany, LeasingProgram, LeasingApplication,
    InsuranceCompany, InsuranceType, InsurancePolicy, InsuranceClaim
)

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

class VehicleImageSerializer(serializers.ModelSerializer):
    """Serializer for VehicleImage model"""
    class Meta:
        model = VehicleImage
        fields = ('id', 'image', 'is_main', 'created_at')
        read_only_fields = ('id', 'created_at')

class VehicleFeatureSerializer(serializers.ModelSerializer):
    """Serializer for VehicleFeature model"""
    class Meta:
        model = VehicleFeature
        fields = ('id', 'name', 'value', 'created_at')
        read_only_fields = ('id', 'created_at')

class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model"""
    brand = BrandSerializer(read_only=True)
    model = ModelSerializer(read_only=True)
    images = VehicleImageSerializer(many=True, read_only=True)
    features = VehicleFeatureSerializer(many=True, read_only=True)
    company = serializers.SerializerMethodField()
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = (
            'id', 'vehicle_type', 'brand', 'model', 'year', 'mileage', 'price', 'currency',
            'fuel_type', 'transmission', 'engine_volume', 'power', 'color', 'vin',
            'description', 'is_active', 'is_available', 'company', 'images', 'features', 
            'main_image', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_company(self, obj):
        from companies.serializers import CompanyListSerializer
        return CompanyListSerializer(obj.company).data if obj.company else None

    def get_main_image(self, obj):
        image = obj.images.filter(is_main=True).first()
        if image:
            return VehicleImageSerializer(image).data
        return None

class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Vehicle"""
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        write_only=True,
        source='brand'
    )
    model_id = serializers.PrimaryKeyRelatedField(
        queryset=Model.objects.all(),
        write_only=True,
        source='model'
    )
    images = VehicleImageSerializer(many=True, required=False)
    features = VehicleFeatureSerializer(many=True, required=False)

    class Meta:
        model = Vehicle
        fields = (
            'vehicle_type', 'brand_id', 'model_id', 'year', 'mileage', 'price', 'currency',
            'fuel_type', 'transmission', 'engine_volume', 'power', 'color', 'vin',
            'description', 'is_active', 'is_available', 'images', 'features'
        )

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        features_data = validated_data.pop('features', [])
        vehicle = Vehicle.objects.create(**validated_data)

        for image_data in images_data:
            VehicleImage.objects.create(vehicle=vehicle, **image_data)

        for feature_data in features_data:
            VehicleFeature.objects.create(vehicle=vehicle, **feature_data)

        return vehicle

class VehicleUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Vehicle"""
    images = VehicleImageSerializer(many=True, required=False)
    features = VehicleFeatureSerializer(many=True, required=False)

    class Meta:
        model = Vehicle
        fields = (
            'year', 'mileage', 'price', 'currency', 'fuel_type', 'transmission',
            'engine_volume', 'power', 'color', 'vin', 'description', 'is_active',
            'is_available', 'images', 'features'
        )

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        features_data = validated_data.pop('features', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                VehicleImage.objects.create(vehicle=instance, **image_data)

        if features_data is not None:
            instance.features.all().delete()
            for feature_data in features_data:
                VehicleFeature.objects.create(vehicle=instance, **feature_data)

        return instance

class VehicleImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ('image', 'is_main')

    def validate(self, attrs):
        vehicle = self.context['vehicle']
        if attrs.get('is_main', False):
            # Если это главное изображение, сбрасываем флаг is_main у других изображений
            vehicle.images.filter(is_main=True).update(is_main=False)
        return attrs

    def create(self, validated_data):
        return VehicleImage.objects.create(vehicle=self.context['vehicle'], **validated_data)

class VehicleImageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ('is_main',)

    def update(self, instance, validated_data):
        if validated_data.get('is_main', False):
            # Если это главное изображение, сбрасываем флаг is_main у других изображений
            instance.vehicle.images.filter(is_main=True).update(is_main=False)
        return super().update(instance, validated_data)

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

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ('id', 'image', 'is_main', 'created_at')
        read_only_fields = ('id', 'created_at')

class CarFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarFeature
        fields = ('id', 'name', 'value', 'created_at')
        read_only_fields = ('id', 'created_at')

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

class CarDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = ('id', 'body_type', 'doors', 'seats', 'trunk_volume')
        read_only_fields = ('id',)

class MotorcycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Motorcycle
        fields = ('id', 'engine_type', 'cylinders', 'cooling')
        read_only_fields = ('id',)

class BoatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Boat
        fields = ('id', 'boat_type', 'length', 'beam', 'draft', 'capacity')
        read_only_fields = ('id',)

class AircraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aircraft
        fields = ('id', 'aircraft_type', 'wingspan', 'length', 'max_altitude', 'range')
        read_only_fields = ('id',)

# Аукцион
class AuctionBidSerializer(serializers.ModelSerializer):
    bidder = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = AuctionBid
        fields = ('id', 'lot', 'bidder', 'amount', 'is_winning', 'created_at')
        read_only_fields = ('id', 'created_at', 'is_winning')

class AuctionSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Auction
        fields = ('id', 'title', 'description', 'auction_type', 'status', 'start_date', 'end_date',
                  'min_bid', 'reserve_price', 'current_price', 'bid_increment', 'created_by',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

# Лизинг
class LeasingCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeasingCompany
        fields = ('id', 'name', 'description', 'logo', 'website', 'phone', 'email', 'address', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

class LeasingProgramSerializer(serializers.ModelSerializer):
    company = LeasingCompanySerializer(read_only=True)
    class Meta:
        model = LeasingProgram
        fields = ('id', 'company', 'name', 'description', 'min_down_payment', 'max_term', 'interest_rate', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

class LeasingApplicationSerializer(serializers.ModelSerializer):
    program = LeasingProgramSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    applicant = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = LeasingApplication
        fields = ('id', 'program', 'vehicle', 'applicant', 'status', 'down_payment', 'term_months',
                  'monthly_payment', 'total_amount', 'notes', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

# Страхование
class InsuranceCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceCompany
        fields = ('id', 'name', 'description', 'logo', 'website', 'phone', 'email', 'address', 'license_number', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

class InsuranceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceType
        fields = ('id', 'name', 'description', 'is_mandatory', 'created_at')
        read_only_fields = ('id', 'created_at')

class InsurancePolicySerializer(serializers.ModelSerializer):
    company = InsuranceCompanySerializer(read_only=True)
    insurance_type = InsuranceTypeSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    insured_person = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = InsurancePolicy
        fields = ('id', 'company', 'insurance_type', 'vehicle', 'policy_number', 'status', 'start_date',
                  'end_date', 'premium_amount', 'coverage_amount', 'deductible', 'insured_person',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class InsuranceClaimSerializer(serializers.ModelSerializer):
    policy = InsurancePolicySerializer(read_only=True)
    filed_by = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = InsuranceClaim
        fields = ('id', 'policy', 'claim_number', 'status', 'incident_date', 'description',
                  'damage_amount', 'claim_amount', 'filed_by', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at') 

# Универсальный CarSerializer для совместимости
CarSerializer = CarDetailSerializer 