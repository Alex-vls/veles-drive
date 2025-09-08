# Универсальная админка VELES AUTO

Универсальная админка объединяет управление всеми модулями проекта VELES AUTO в единой панели с расширенной аналитикой и дашбордом.

## Возможности

### 🎯 Основные функции
- **Единая панель управления** - управление всеми модулями из одного места
- **Расширенная аналитика** - детальная статистика и графики
- **Дашборд в реальном времени** - актуальные данные о состоянии системы
- **Быстрые действия** - быстрый доступ к основным операциям
- **Кэширование** - оптимизация производительности

### 📊 Аналитика и отчеты
- Статистика пользователей, компаний, автомобилей
- Анализ продаж и выручки
- Отслеживание проектов и задач
- Анализ контента и просмотров
- Графики роста и трендов
- Топ-рейтинги компаний и автомобилей

### 🔧 Управление модулями
- **Основные модули**: Пользователи, Компании, Автомобили
- **ERP система**: Продажи, Услуги, Финансы, Проекты
- **Контент и медиа**: Статьи, Новости, Категории, Теги
- **Аналитика и SEO**: Просмотры, Сессии, Поисковые запросы

## Структура проекта

```
universal_admin/
├── __init__.py
├── admin.py              # Универсальная админка
├── apps.py               # Конфигурация приложения
├── urls.py               # URL-маршруты
├── views.py              # Views для аналитики
├── signals.py            # Signals для кэширования
├── management/           # Management команды
│   └── commands/
│       └── load_universal_admin_demo.py
└── templates/            # Шаблоны
    ├── admin/
    │   └── index.html    # Главная страница админки
    └── universal_admin/
        └── analytics.html # Аналитическая панель
```

## Установка и настройка

### 1. Добавление в INSTALLED_APPS

```python
INSTALLED_APPS = [
    # ... другие приложения
    'universal_admin',  # Универсальная админка
]
```

### 2. Настройка URL-маршрутов

```python
urlpatterns = [
    # ... другие маршруты
    path('universal-admin/', include('universal_admin.urls')),
]
```

### 3. Настройка кэширования

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

## Использование

### Доступ к админке

- **Главная админка**: `/admin/` - стандартная Django админка
- **ERP админка**: `/erp/admin/` - специализированная ERP админка
- **Универсальная админка**: `/universal-admin/` - универсальная панель

### Аналитическая панель

- **URL**: `/universal-admin/analytics/`
- **Периоды**: 7 дней, 30 дней, 90 дней, 1 год
- **Графики**: Продажи, Пользователи, Просмотры, Выручка

### API для аналитики

- **Статистика**: `/universal-admin/api/stats/?period=30`
- **Графики**: `/universal-admin/api/charts/?type=sales&period=30`

## Демо-данные

### Загрузка демо-данных

```bash
python manage.py load_universal_admin_demo
```

### Параметры команды

```bash
python manage.py load_universal_admin_demo \
    --users 50 \
    --companies 20 \
    --cars 100 \
    --sales 30 \
    --articles 25 \
    --news 15
```

## Кастомные админки

### UniversalUserAdmin
- Расширенное отображение пользователей
- Фильтры по активности и группам
- Действия: бан/разбан пользователей

### UniversalCompanyAdmin
- Статистика по автомобилям и отзывам
- Статус верификации
- Действия: верификация компаний

### UniversalCarAdmin
- Детальная информация об автомобилях
- Статус доступности
- Связи с компаниями

### UniversalSaleAdmin
- Анализ продаж и выручки
- Расчет общей суммы
- Статусы продаж

### UniversalProjectTaskAdmin
- Управление задачами проектов
- Цветные метки и приоритеты
- Связи с ERP системой

## Кэширование

### Автоматическая инвалидация
- При изменении пользователей
- При изменении компаний
- При изменении автомобилей
- При изменении продаж
- При изменении проектов
- При изменении контента

### Кэш-ключи
- `analytics_stats_{period}` - статистика за период
- `analytics_charts_{period}` - данные графиков
- `recent_activities` - последние активности
- `top_companies_revenue` - топ компаний
- `top_cars_views` - топ автомобилей

### Очистка кэша

```python
from universal_admin.signals import clear_all_analytics_cache

clear_all_analytics_cache()
```

## Шаблоны

### Главная страница админки
- **Файл**: `templates/admin/index.html`
- **Функции**: Дашборд, статистика, быстрые действия

### Аналитическая панель
- **Файл**: `templates/universal_admin/analytics.html`
- **Функции**: Расширенная аналитика, графики, топ-рейтинги

## API Endpoints

### GET /universal-admin/api/stats/
Получение статистики за период

**Параметры:**
- `period` (int): Период в днях (7, 30, 90, 365)

**Ответ:**
```json
{
    "users": {
        "total": 150,
        "new": 25,
        "active": 120,
        "growth": 15.5
    },
    "companies": {
        "total": 45,
        "new": 8,
        "verified": 35,
        "growth": 8.2
    },
    "sales": {
        "total": 89,
        "period": 12,
        "revenue": 15000000,
        "period_revenue": 2500000,
        "growth": 22.1
    }
}
```

### GET /universal-admin/api/charts/
Получение данных для графиков

**Параметры:**
- `type` (string): Тип графика (sales, users, pageviews, revenue)
- `period` (int): Период в днях

**Ответ:**
```json
{
    "labels": ["01.12", "02.12", "03.12"],
    "datasets": [
        {
            "label": "Продажи",
            "data": [5, 8, 12],
            "borderColor": "#007bff"
        }
    ]
}
```

## Разработка

### Добавление новых метрик

1. Добавить функцию в `views.py`
2. Обновить `get_analytics_stats()`
3. Добавить отображение в шаблон
4. Настроить кэширование в `signals.py`

### Добавление новых графиков

1. Создать функцию получения данных
2. Добавить в `get_analytics_charts()`
3. Обновить шаблон аналитики
4. Добавить JavaScript для отображения

### Кастомизация админки

1. Создать класс админки в `admin.py`
2. Настроить `list_display`, `list_filter`, `search_fields`
3. Добавить кастомные методы
4. Зарегистрировать в `universal_admin_site`

## Мониторинг и производительность

### Метрики производительности
- Время загрузки страниц
- Время выполнения запросов
- Использование кэша
- Количество запросов к БД

### Оптимизация
- Использование `select_related()` и `prefetch_related()`
- Кэширование тяжелых запросов
- Пагинация больших списков
- Индексы в базе данных

## Безопасность

### Права доступа
- Только для персонала (`@staff_member_required`)
- Проверка прав на уровне views
- Логирование действий администраторов

### Защита данных
- Валидация входных данных
- Защита от SQL-инъекций
- Безопасная передача данных

## Логирование

### События для логирования
- Вход в админку
- Изменение данных
- Экспорт данных
- Массовые операции

### Настройка логов
```python
LOGGING = {
    'handlers': {
        'admin_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/admin.log',
        },
    },
    'loggers': {
        'universal_admin': {
            'handlers': ['admin_file'],
            'level': 'INFO',
        },
    },
}
```

## Тестирование

### Unit тесты
- Тестирование views
- Тестирование API endpoints
- Тестирование кэширования
- Тестирование signals

### Интеграционные тесты
- Тестирование полного цикла
- Тестирование производительности
- Тестирование безопасности

## Развертывание

### Требования
- Django 4.2+
- Redis для кэширования
- PostgreSQL для базы данных
- Chart.js для графиков

### Переменные окружения
```bash
REDIS_URL=redis://redis:6379/1
DATABASE_URL=postgresql://user:pass@host:port/db
DEBUG=False
```

### Docker
```dockerfile
# Добавить в Dockerfile
COPY universal_admin/ /app/universal_admin/
```

## Поддержка

### Документация
- [Django Admin](https://docs.djangoproject.com/en/stable/ref/contrib/admin/)
- [Django Cache](https://docs.djangoproject.com/en/stable/topics/cache/)
- [Chart.js](https://www.chartjs.org/docs/)

### Контакты
- Разработчик: VELES AUTO Team
- Email: support@veles-drive.ru
- Документация: https://docs.veles-drive.ru 