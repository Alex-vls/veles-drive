from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Avg, Sum
from .models import (
    User, Brand, Review, Category, Tag, Article, News, ContentImage,
    Subscription, ContentView, Comment, Reaction, ContentRating,
    YouTubeChannel, YouTubeVideo, YouTubePlaylist, SEOMetadata,
    PageView, UserSession, SearchQuery, Conversion,
    ABTest, ABTestVariant, ABTestResult
)
from cars.models import (
    Vehicle, Motorcycle, Boat, Aircraft, Model,
    Auction, AuctionBid,
    LeasingCompany, LeasingProgram, LeasingApplication,
    InsuranceCompany, InsuranceType, InsurancePolicy, InsuranceClaim
)
from companies.models import (
    Company, CompanySchedule, CompanyFeature
)

from .admin_actions import (
    approve_content, reject_content, verify_companies,
    unverify_companies, delete_spam, ban_users, unban_users,
    export_as_json
)

# @admin.register(User)  # Убрано - уже зарегистрировано в universal_admin.admin
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'groups')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    actions = [ban_users, unban_users, export_as_json]
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

# @admin.register(Brand)  # Убрано - уже зарегистрировано в universal_admin.admin
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'logo_preview', 'car_count', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="50" height="50" />', obj.logo.url)
        return "No logo"
    logo_preview.short_description = 'Logo'

    def car_count(self, obj):
        return obj.cars.count()
    car_count.short_description = 'Cars'

# @admin.register(Company)  # Убрано - уже зарегистрировано в universal_admin.admin
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'rating', 'is_verified', 'car_count', 'review_count')
    list_filter = ('is_verified', 'city')
    search_fields = ('name', 'city')
    ordering = ('-rating',)
    actions = [verify_companies, unverify_companies, export_as_json]

    def car_count(self, obj):
        return obj.cars.count()
    car_count.short_description = 'Cars'

    def review_count(self, obj):
        return obj.reviews.count()
    review_count.short_description = 'Reviews'



# @admin.register(Review)  # Убрано - уже зарегистрировано в universal_admin.admin
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'car', 'company', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'car__model', 'company__name')
    ordering = ('-created_at',)
    actions = [delete_spam, export_as_json]

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'views_count', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('title',)}
    actions = [approve_content, reject_content, delete_spam, export_as_json]

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'source', 'status', 'views_count', 'created_at')
    list_filter = ('status', 'source', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('title',)}
    actions = [approve_content, reject_content, delete_spam, export_as_json]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'parent', 'created_at')
    list_filter = ('content_type', 'created_at')
    search_fields = ('user__username', 'content')
    ordering = ('-created_at',)
    actions = [delete_spam, export_as_json]

@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'reaction_type', 'created_at')
    list_filter = ('reaction_type', 'content_type', 'created_at')
    search_fields = ('user__username',)
    ordering = ('-created_at',)

@admin.register(ContentRating)
class ContentRatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'rating', 'created_at')
    list_filter = ('rating', 'content_type', 'created_at')
    search_fields = ('user__username',)
    ordering = ('-created_at',)

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_active', 'category', 'created_at')
    list_filter = ('is_active', 'category', 'created_at')
    search_fields = ('user__username',)
    ordering = ('-created_at',)

@admin.register(SEOMetadata)
class SEOMetadataAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'object_id', 'title', 'created_at')
    list_filter = ('content_type', 'created_at')
    search_fields = ('title', 'description', 'keywords')
    ordering = ('-created_at',)

@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ('path', 'user', 'ip_address', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('path', 'user__username', 'ip_address')
    ordering = ('-timestamp',)

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'ip_address', 'start_time', 'end_time', 'pages_visited')
    list_filter = ('start_time',)
    search_fields = ('user__username', 'ip_address')
    ordering = ('-start_time',)

@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ('query', 'user', 'ip_address', 'timestamp', 'is_successful')
    list_filter = ('is_successful', 'timestamp')
    search_fields = ('query', 'user__username', 'ip_address')
    ordering = ('-timestamp',)

@admin.register(Conversion)
class ConversionAdmin(admin.ModelAdmin):
    list_display = ('conversion_type', 'user', 'value', 'timestamp')
    list_filter = ('conversion_type', 'timestamp')
    search_fields = ('user__username', 'conversion_type')
    ordering = ('-timestamp',)

@admin.register(YouTubeChannel)
class YouTubeChannelAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel_id', 'subscriber_count', 'video_count', 'view_count')
    search_fields = ('title', 'channel_id')
    ordering = ('-subscriber_count',)

@admin.register(YouTubeVideo)
class YouTubeVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel', 'published_at', 'view_count', 'like_count')
    list_filter = ('channel', 'published_at')
    search_fields = ('title', 'description')
    ordering = ('-published_at',)

@admin.register(YouTubePlaylist)
class YouTubePlaylistAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel', 'video_count', 'created_at')
    list_filter = ('channel', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)

class ABTestVariantInline(admin.TabularInline):
    model = ABTestVariant
    extra = 1

@admin.register(ABTest)
class ABTestAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'start_date', 'end_date', 'variant_count', 'conversion_rate')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    inlines = [ABTestVariantInline]
    actions = [export_as_json]

    def variant_count(self, obj):
        return obj.variants.count()
    variant_count.short_description = 'Variants'

    def conversion_rate(self, obj):
        total_views = ABTestResult.objects.filter(test=obj).count()
        if total_views == 0:
            return '0%'
        conversions = ABTestResult.objects.filter(test=obj, conversion_value__gt=0).count()
        rate = (conversions / total_views) * 100
        return f'{rate:.1f}%'
    conversion_rate.short_description = 'Conversion Rate'

@admin.register(ABTestVariant)
class ABTestVariantAdmin(admin.ModelAdmin):
    list_display = ('test', 'name', 'weight', 'view_count', 'conversion_count', 'conversion_rate')
    list_filter = ('test',)
    search_fields = ('name', 'description')
    ordering = ('test', 'name')
    actions = [export_as_json]

    def view_count(self, obj):
        return ABTestResult.objects.filter(variant=obj).count()
    view_count.short_description = 'Views'

    def conversion_count(self, obj):
        return ABTestResult.objects.filter(variant=obj, conversion_value__gt=0).count()
    conversion_count.short_description = 'Conversions'

    def conversion_rate(self, obj):
        views = self.view_count(obj)
        if views == 0:
            return '0%'
        conversions = self.conversion_count(obj)
        rate = (conversions / views) * 100
        return f'{rate:.1f}%'
    conversion_rate.short_description = 'Conversion Rate'

@admin.register(ABTestResult)
class ABTestResultAdmin(admin.ModelAdmin):
    list_display = ('test', 'variant', 'user', 'conversion_type', 'conversion_value', 'created_at')
    list_filter = ('test', 'variant', 'conversion_type', 'created_at')
    search_fields = ('test__name', 'variant__name', 'user__username')
    ordering = ('-created_at',)
    actions = [export_as_json]

# ============================================================================
# VEHICLE ADMIN
# ============================================================================

# @admin.register(Vehicle)  # Убрано - уже зарегистрировано в cars.admin
# @admin.register(Motorcycle)  # Убрано - уже зарегистрировано в cars.admin
# @admin.register(Boat)  # Убрано - уже зарегистрировано в cars.admin
# @admin.register(Aircraft)  # Убрано - уже зарегистрировано в cars.admin
# @admin.register(Model)  # Убрано - уже зарегистрировано в cars.admin

# ============================================================================
# VEHICLE SERVICES ADMIN
# ============================================================================

# Удаляю регистрацию AuctionAdmin, LeasingAdmin, InsuranceAdmin, если они есть ниже по файлу

# Настройка админ-панели
admin.site.site_header = 'VELES AUTO Administration'
admin.site.site_title = 'VELES AUTO Admin'
admin.site.index_title = 'Welcome to VELES AUTO Admin Panel' 

# ============================================================================
# AUCTION ADMIN
# ============================================================================

# @admin.register(Auction)  # Убрано - уже зарегистрировано в cars.admin
class AuctionAdmin(admin.ModelAdmin):
    list_display = ('title', 'vehicle', 'auction_type', 'status', 'current_price', 'start_date', 'end_date')
    list_filter = ('auction_type', 'status', 'start_date', 'end_date', 'created_at')
    search_fields = ('title', 'vehicle__brand__name', 'vehicle__model__name', 'description')
    ordering = ('-created_at',)
    raw_id_fields = ('vehicle', 'created_by')
    list_per_page = 25

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('vehicle__brand', 'vehicle__model', 'created_by')

# @admin.register(AuctionBid)  # Убрано - уже зарегистрировано в cars.admin
class AuctionBidAdmin(admin.ModelAdmin):
    list_display = ('auction', 'bidder', 'amount', 'is_winning', 'created_at')
    list_filter = ('is_winning', 'created_at')
    search_fields = ('auction__title', 'bidder__username')
    ordering = ('-created_at',)
    raw_id_fields = ('auction', 'bidder')

# ============================================================================
# LEASING ADMIN
# ============================================================================

# @admin.register(LeasingCompany)  # Убрано - уже зарегистрировано в cars.admin
class LeasingCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'phone', 'email')
    ordering = ('name',)

# @admin.register(LeasingProgram)  # Убрано - уже зарегистрировано в cars.admin
class LeasingProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'min_down_payment', 'max_term', 'interest_rate', 'is_active')
    list_filter = ('is_active', 'max_term', 'created_at')
    search_fields = ('name', 'company__name')
    ordering = ('company__name', 'name')
    raw_id_fields = ('company',)

# @admin.register(LeasingApplication)  # Убрано - уже зарегистрировано в cars.admin
class LeasingApplicationAdmin(admin.ModelAdmin):
    list_display = ('program', 'vehicle', 'applicant', 'status', 'down_payment', 'term_months', 'monthly_payment')
    list_filter = ('status', 'term_months', 'created_at')
    search_fields = ('program__name', 'vehicle__brand__name', 'applicant__username')
    ordering = ('-created_at',)
    raw_id_fields = ('program', 'vehicle', 'applicant')

# ============================================================================
# INSURANCE ADMIN
# ============================================================================

# @admin.register(InsuranceCompany)  # Убрано - уже зарегистрировано в cars.admin
class InsuranceCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'license_number', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'phone', 'email', 'license_number')
    ordering = ('name',)

# @admin.register(InsuranceType)  # Убрано - уже зарегистрировано в cars.admin
class InsuranceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_mandatory', 'created_at')
    list_filter = ('is_mandatory', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)

# @admin.register(InsurancePolicy)  # Убрано - уже зарегистрировано в cars.admin
class InsurancePolicyAdmin(admin.ModelAdmin):
    list_display = ('policy_number', 'company', 'vehicle', 'status', 'premium_amount', 'start_date', 'end_date')
    list_filter = ('status', 'start_date', 'end_date', 'created_at')
    search_fields = ('policy_number', 'company__name', 'vehicle__brand__name')
    ordering = ('-created_at',)
    raw_id_fields = ('company', 'insurance_type', 'vehicle', 'insured_person')

# @admin.register(InsuranceClaim)  # Убрано - уже зарегистрировано в cars.admin
class InsuranceClaimAdmin(admin.ModelAdmin):
    list_display = ('claim_number', 'policy', 'status', 'damage_amount', 'claim_amount', 'incident_date')
    list_filter = ('status', 'incident_date', 'created_at')
    search_fields = ('claim_number', 'policy__policy_number')
    ordering = ('-created_at',)
    raw_id_fields = ('policy', 'filed_by') 