# Архитектура VELES AUTO

## Обзор системы

VELES AUTO - это современная платформа для покупки, продажи и обслуживания автомобилей с Apple-inspired дизайном. Система включает в себя веб-агрегатор, Telegram Bot, Mini App и ERP систему.

## Архитектура

### Backend (Django REST API)

#### Основные приложения:
- **cars** - управление автомобилями и транспортом
- **companies** - управление компаниями и дилерами
- **users** - пользователи и аутентификация
- **erp** - ERP система с Trello-like управлением проектами
- **core** - общие компоненты и утилиты

#### Модели данных:

##### Транспортные средства:
- `Vehicle` - универсальная модель транспорта
- `Car` - автомобили (наследует от Vehicle)
- `Motorcycle` - мотоциклы (наследует от Vehicle)
- `Boat` - лодки и яхты (наследует от Vehicle)
- `Aircraft` - воздушные суда (наследует от Vehicle)

##### Сервисы:
- `Auction` - аукционы
- `LeasingApplication` - заявки на лизинг
- `InsurancePolicy` - страховые полисы

##### ERP система:
- `ProjectBoard` - доски проектов
- `ProjectTask` - задачи
- `ProjectColumn` - колонки (статусы)
- `TaskComment` - комментарии к задачам

#### API Endpoints:
```
/api/cars/ - автомобили
/api/vehicles/ - транспортные средства
/api/motorcycles/ - мотоциклы
/api/boats/ - лодки
/api/aircraft/ - воздушные суда
/api/companies/ - компании
/api/auctions/ - аукционы
/api/leasing/ - лизинг
/api/insurance/ - страхование
/api/erp/ - ERP система
```

### Frontend (React + TypeScript)

#### Структура:
```
src/
├── components/     # Переиспользуемые компоненты
├── pages/         # Страницы приложения
├── services/      # API сервисы
├── store/         # Redux Toolkit store
├── utils/         # Утилиты
└── types/         # TypeScript типы
```

#### Основные компоненты:
- `CarCard` - карточка автомобиля
- `CompanyCard` - карточка компании
- `VehicleCard` - универсальная карточка транспорта
- `SchemaOrg` - компонент для микроразметки

#### Состояние (Redux):
- `authSlice` - аутентификация
- `carSlice` - автомобили
- `companySlice` - компании
- `uiSlice` - UI состояние

### Telegram Bot и Mini App

#### Bot функциональность:
- Поиск автомобилей
- Уведомления о новых объявлениях
- Интеграция с Mini App

#### Mini App:
- Агрегатор автомобилей
- Админка для компаний
- ERP система

### Инфраструктура

#### Docker контейнеры:
- **backend** - Django API
- **frontend** - React приложение
- **tg_frontend** - Telegram Mini App (агрегатор)
- **tg_admin_frontend** - Telegram Mini App (админка)
- **nginx** - reverse proxy
- **postgres** - база данных
- **redis** - кэширование
- **minio** - файловое хранилище
- **prometheus** - мониторинг
- **grafana** - визуализация
- **alertmanager** - уведомления

#### Домены:
- `veles-drive.ru` - основной сайт
- `api.veles-drive.ru` - API
- `tg.veles-drive.ru` - Telegram Mini App
- `admin.veles-drive.ru` - админка

## Безопасность

### Аутентификация:
- JWT токены
- Session-based аутентификация
- Telegram OAuth

### Защита API:
- Rate limiting
- CORS настройки
- Валидация входных данных
- Защита от SQL инъекций

### Файловая безопасность:
- Валидация загружаемых файлов
- Ограничение размеров
- Проверка MIME типов

## Производительность

### Кэширование:
- Redis для кэширования
- Кэширование запросов к API
- Кэширование статических файлов

### Оптимизация:
- Индексы в базе данных
- Пагинация результатов
- Lazy loading изображений
- Gzip сжатие

### Мониторинг:
- Prometheus метрики
- Grafana дашборды
- AlertManager уведомления

## Микроразметка Schema.org

Система включает полную поддержку Schema.org микроразметки:

### Типы разметки:
- `Car` - автомобили
- `AutoDealer` - автосалоны
- `WebSite` - веб-сайт
- `Organization` - организация
- `NewsArticle` - новости
- `BreadcrumbList` - хлебные крошки
- `FAQPage` - FAQ

### Утилиты:
- `generateCarSchema()` - генерация разметки для автомобиля
- `generateCompanySchema()` - генерация разметки для компании
- `generateWebsiteSchema()` - генерация разметки для сайта

## Развертывание

### Требования:
- Docker и Docker Compose
- SSL сертификаты
- Домен и DNS настройки

### Переменные окружения:
```bash
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port
TELEGRAM_BOT_TOKEN=your-bot-token
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
```

### Команды развертывания:
```bash
# Сборка и запуск
docker-compose up -d

# Миграции
docker-compose exec backend python manage.py migrate

# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Сборка статических файлов
docker-compose exec backend python manage.py collectstatic
```

## Масштабирование

### Горизонтальное масштабирование:
- Множественные экземпляры backend
- Load balancer для распределения нагрузки
- Репликация базы данных

### Вертикальное масштабирование:
- Увеличение ресурсов контейнеров
- Оптимизация запросов к БД
- Кэширование на всех уровнях

## Мониторинг и логирование

### Метрики:
- Время ответа API
- Количество запросов
- Использование ресурсов
- Ошибки и исключения

### Логирование:
- Структурированные логи
- Централизованный сбор логов
- Ротация логов

## Безопасность данных

### Шифрование:
- HTTPS для всех соединений
- Шифрование данных в БД
- Безопасное хранение паролей

### Резервное копирование:
- Автоматические бэкапы БД
- Резервное копирование файлов
- Тестирование восстановления 