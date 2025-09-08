import os
from celery import Celery
from celery.schedules import crontab

# Установка переменной окружения для настроек Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'veles_drive.settings')

app = Celery('veles_drive')

# Загрузка конфигурации из настроек Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматическая загрузка задач из всех зарегистрированных приложений Django
app.autodiscover_tasks()

# Настройка периодических задач
app.conf.beat_schedule = {
    'update-company-ratings': {
        'task': 'veles_drive.tasks.update_company_ratings',
        'schedule': crontab(hour='*/6'),  # Каждые 6 часов
    },
    'update-car-ratings': {
        'task': 'veles_drive.tasks.update_car_ratings',
        'schedule': crontab(hour='*/6'),  # Каждые 6 часов
    },
    'cleanup-old-images': {
        'task': 'veles_drive.tasks.cleanup_old_images',
        'schedule': crontab(hour=0, minute=0),  # Каждый день в полночь
        'args': (30,),  # Удаляем изображения старше 30 дней
    },
    'cleanup-old-content-views': {
        'task': 'veles_drive.tasks.cleanup_old_content_views',
        'schedule': crontab(hour=0, minute=0),  # Каждый день в полночь
        'args': (30,),  # Удаляем просмотры старше 30 дней
    },
    'optimize-seo-metadata': {
        'task': 'veles_drive.tasks.optimize_seo_metadata',
        'schedule': crontab(hour=0, minute=0),  # Run daily at midnight
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 