from django.urls import path
from . import views

app_name = 'telegram_bot'

urlpatterns = [
    # Webhook для Telegram
    path('webhook/', views.webhook_handler, name='webhook'),
    
    # API для Mini App
    path('api/auth/', views.mini_app_auth, name='mini_app_auth'),
    path('api/data/', views.mini_app_data, name='mini_app_data'),
    path('api/action/', views.mini_app_action, name='mini_app_action'),
    
    # Утилиты
    # path('set-webhook/', views.set_webhook, name='set_webhook'),
    # path('delete-webhook/', views.delete_webhook, name='delete_webhook'),
    # path('bot-info/', views.bot_info, name='bot_info'),
] 