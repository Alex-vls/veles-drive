from django.apps import AppConfig


class UniversalAdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'universal_admin'
    verbose_name = 'Универсальная админка'
    
    def ready(self):
        import universal_admin.signals 