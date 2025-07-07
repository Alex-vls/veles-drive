from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('erp/admin/', include('erp.admin')),  # ERP админка
    path('universal-admin/', include('universal_admin.urls')),  # Универсальная админка
    path('telegram-admin/', include('telegram_bot.admin')),  # Telegram Bot админка
    path('api/auth/', include('users.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/cars/', include('cars.urls')),
    path('api/', include('core.urls')),
    path('api/erp/', include('erp.urls')),  # ERP API
    path('telegram/', include('telegram_bot.urls')),  # Telegram Bot API
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 