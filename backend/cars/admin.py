from django.contrib import admin
from .models import Brand, Model, Car, CarImage, CarFeature, Vehicle, VehicleImage, VehicleFeature, Motorcycle, Boat, Aircraft

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'logo_preview', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

    def logo_preview(self, obj):
        if obj.logo:
            return f'<img src="{obj.logo.url}" width="50" height="50" />'
        return "No logo"
    logo_preview.short_description = 'Logo'
    logo_preview.allow_tags = True

@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'created_at')
    list_filter = ('brand',)
    search_fields = ('name', 'brand__name')
    ordering = ('brand__name', 'name')

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'body_type', 'doors', 'seats')
    list_filter = ('body_type', 'doors', 'seats')
    search_fields = ('vehicle__brand__name', 'vehicle__model__name', 'vehicle__vin')
    ordering = ('-vehicle__created_at',)

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('brand', 'model', 'vehicle_type', 'year', 'price', 'company', 'is_available')
    list_filter = ('vehicle_type', 'brand', 'year', 'is_available', 'company')
    search_fields = ('brand__name', 'model__name', 'vin')
    ordering = ('-created_at',)

@admin.register(Motorcycle)
class MotorcycleAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'engine_type', 'cylinders')
    list_filter = ('engine_type',)
    search_fields = ('vehicle__brand__name', 'vehicle__model__name')

@admin.register(Boat)
class BoatAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'boat_type', 'length', 'beam')
    list_filter = ('boat_type',)
    search_fields = ('vehicle__brand__name', 'vehicle__model__name')

@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'aircraft_type', 'wingspan', 'length')
    list_filter = ('aircraft_type',)
    search_fields = ('vehicle__brand__name', 'vehicle__model__name')

@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    list_display = ('car', 'image_preview', 'is_main', 'created_at')
    list_filter = ('is_main', 'created_at')
    search_fields = ('car__vehicle__brand__name',)

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="50" height="50" />'
        return "No image"
    image_preview.short_description = 'Image'
    image_preview.allow_tags = True

@admin.register(VehicleImage)
class VehicleImageAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'image_preview', 'is_main', 'created_at')
    list_filter = ('is_main', 'created_at')
    search_fields = ('vehicle__brand__name', 'vehicle__model__name')

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="50" height="50" />'
        return "No image"
    image_preview.short_description = 'Image'
    image_preview.allow_tags = True

@admin.register(CarFeature)
class CarFeatureAdmin(admin.ModelAdmin):
    list_display = ('car', 'name', 'value')
    list_filter = ('name',)
    search_fields = ('car__vehicle__brand__name', 'name')

@admin.register(VehicleFeature)
class VehicleFeatureAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'name', 'value')
    list_filter = ('name',)
    search_fields = ('vehicle__brand__name', 'name') 