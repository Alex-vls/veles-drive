from django.contrib import admin
from .models import Company, Review, CompanyImage, CompanyFeature, CompanySchedule

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'rating', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'city', 'rating')
    search_fields = ('name', 'city', 'description')
    ordering = ('-created_at',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'company')
    search_fields = ('user__username', 'company__name', 'comment')
    ordering = ('-created_at',)

@admin.register(CompanyImage)
class CompanyImageAdmin(admin.ModelAdmin):
    list_display = ('company', 'image_preview', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('company__name',)

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="50" height="50" />'
        return "No image"
    image_preview.short_description = 'Image'
    image_preview.allow_tags = True

@admin.register(CompanyFeature)
class CompanyFeatureAdmin(admin.ModelAdmin):
    list_display = ('company', 'feature_name', 'feature_value')
    list_filter = ('feature_name',)
    search_fields = ('company__name', 'feature_name')

@admin.register(CompanySchedule)
class CompanyScheduleAdmin(admin.ModelAdmin):
    list_display = ('company', 'day_of_week', 'open_time', 'close_time', 'is_working_day')
    list_filter = ('day_of_week', 'is_working_day', 'company')
    search_fields = ('company__name',) 