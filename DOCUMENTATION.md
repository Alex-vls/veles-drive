# VELES AUTO - Документация проекта

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Установка и настройка](#установка-и-настройка)
4. [API документация](#api-документация)
5. [ERP система](#erp-система)
6. [Telegram Bot](#telegram-bot)
7. [Фронтенд](#фронтенд)
8. [Тестирование](#тестирование)
9. [Развертывание](#развертывание)
10. [Мониторинг](#мониторинг)

## 🚗 Обзор проекта

VELES AUTO - это современная веб-платформа для покупки, продажи и обслуживания автомобилей с дизайном в стиле Apple. Проект включает в себя:

- **Основные модули**: Автомобили, компании, пользователи
- **ERP система**: Управление продажами, сервисом, финансами, проектами
- **Telegram Bot**: Интеграция с Telegram для уведомлений и Mini App
- **Универсальная админка**: Кастомная панель управления
- **Система отчетов**: Расширенная аналитика и отчетность
- **Мониторинг**: Prometheus, Grafana, AlertManager

### Технологический стек

**Backend:**
- Django 4.2+ с Django REST Framework
- PostgreSQL для основной БД
- Redis для кэширования и сессий
- Celery для фоновых задач
- MinIO для хранения файлов

**Frontend:**
- React 18+ с TypeScript
- Material-UI для компонентов
- Redux Toolkit для управления состоянием
- Recharts для графиков и диаграмм

**Инфраструктура:**
- Docker и Docker Compose
- Nginx с SSL
- Prometheus + Grafana
- AlertManager для уведомлений

## 🏗️ Архитектура

### Структура проекта

```
veles-drive/
├── backend/                 # Django backend
│   ├── cars/               # Модуль автомобилей
│   ├── companies/          # Модуль компаний
│   ├── users/              # Модуль пользователей
│   ├── erp/                # ERP система
│   ├── telegram_bot/       # Telegram Bot
│   ├── universal_admin/    # Универсальная админка
│   ├── integration/        # Система интеграций
│   └── config/             # Настройки Django
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API сервисы
│   │   ├── store/          # Redux store
│   │   └── utils/          # Утилиты
├── docker/                 # Docker конфигурация
└── scripts/                # Скрипты развертывания
```

### Модульная архитектура

Проект построен на модульной архитектуре, где каждый модуль содержит:
- `models.py` - модели данных
- `serializers.py` - сериализаторы для API
- `views.py` - представления и API endpoints
- `admin.py` - админка Django
- `urls.py` - маршрутизация
- `tests.py` - тесты

## 🚀 Установка и настройка

### Предварительные требования

- Docker и Docker Compose
- Node.js 18+
- Python 3.11+

### Быстрый старт

1. **Клонирование репозитория:**
```bash
git clone https://github.com/your-username/veles-drive.git
cd veles-drive
```

2. **Настройка переменных окружения:**
```bash
cp env.example .env
# Отредактируйте .env файл
```

3. **Запуск с Docker:**
```bash
docker-compose up -d
```

4. **Инициализация данных:**
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py load_demo_data
docker-compose exec backend python manage.py createsuperuser
```

### Локальная разработка

1. **Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

2. **Frontend:**
```bash
cd frontend
npm install
npm start
```

## 📚 API документация

### Базовый URL
```
https://api.veles-drive.ru/api/v1/
```

### Аутентификация
API использует JWT токены для аутентификации:

```bash
# Получение токена
POST /auth/login/
{
    "email": "user@example.com",
    "password": "password"
}

# Использование токена
Authorization: Bearer <token>
```

### Основные endpoints

#### Автомобили
```
GET    /cars/                    # Список автомобилей
POST   /cars/                    # Создание автомобиля
GET    /cars/{id}/              # Детали автомобиля
PUT    /cars/{id}/              # Обновление автомобиля
DELETE /cars/{id}/              # Удаление автомобиля
```

#### Компании
```
GET    /companies/               # Список компаний
POST   /companies/               # Создание компании
GET    /companies/{id}/          # Детали компании
PUT    /companies/{id}/          # Обновление компании
DELETE /companies/{id}/          # Удаление компании
```

#### ERP система
```
GET    /erp/sales/               # Продажи
GET    /erp/reports/sales/       # Отчет по продажам
GET    /erp/dashboard/metrics/   # Метрики дашборда
GET    /erp/project-tasks/       # Задачи проектов
```

## 💼 ERP система

### Модули ERP

1. **Управление продажами**
   - Создание и отслеживание продаж
   - Расчет комиссий
   - История продаж
   - Аналитика по продажам

2. **Сервисное обслуживание**
   - Заказы на обслуживание
   - Управление услугами
   - Планирование работ
   - Отчеты по сервису

3. **Финансовый учет**
   - Доходы и расходы
   - Категории операций
   - Финансовая отчетность
   - Аналитика прибыли

4. **Управление проектами (Trello-like)**
   - Доски проектов
   - Задачи и подзадачи
   - Метки и приоритеты
   - Комментарии и вложения
   - История изменений

5. **Инвентаризация**
   - Управление складом
   - Отслеживание остатков
   - Стоимость и маржинальность
   - Уведомления о низком запасе

### Отчеты

Система включает расширенные отчеты:

- **Отчет по продажам**: динамика, топ автомобилей, клиенты
- **Сервисный отчет**: заказы, услуги, исполнители
- **Финансовый отчет**: доходы, расходы, прибыль
- **Отчет по инвентарю**: остатки, стоимость, маржинальность
- **Отчет по проектам**: задачи, исполнители, сроки

## 🤖 Telegram Bot

### Функциональность

1. **Уведомления**
   - Новые продажи
   - Заказы на сервис
   - Просроченные задачи
   - Финансовые операции

2. **Команды бота**
   - `/start` - Приветствие и меню
   - `/sales` - Статистика продаж
   - `/tasks` - Мои задачи
   - `/reports` - Быстрые отчеты

3. **Mini App**
   - Просмотр автомобилей
   - Создание заказов
   - Управление задачами
   - Просмотр отчетов

### Настройка

1. Создайте бота через @BotFather
2. Добавьте токен в переменные окружения
3. Настройте webhook URL
4. Запустите бота

## 🎨 Фронтенд

### Структура компонентов

```
src/components/
├── erp/                    # ERP компоненты
│   ├── Dashboard.tsx       # Дашборд
│   ├── Reports.tsx         # Отчеты
│   ├── TaskBoard.tsx       # Доска задач
│   └── TestSuite.tsx       # Тестирование
├── cars/                   # Компоненты автомобилей
├── companies/              # Компоненты компаний
└── common/                 # Общие компоненты
```

### Основные страницы

1. **Главная страница** - Обзор платформы
2. **Каталог автомобилей** - Поиск и фильтрация
3. **Компании** - Список и детали компаний
4. **ERP дашборд** - Панель управления
5. **Отчеты** - Аналитика и отчеты
6. **Проекты** - Управление задачами

### Состояние приложения

Redux store структура:

```typescript
{
  auth: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
  };
  cars: {
    items: Car[];
    loading: boolean;
    filters: CarFilters;
  };
  companies: {
    items: Company[];
    loading: boolean;
  };
  erp: {
    sales: Sale[];
    tasks: Task[];
    reports: Report[];
  };
}
```

## 🧪 Тестирование

### Типы тестов

1. **Unit тесты** - Тестирование отдельных функций
2. **Integration тесты** - Тестирование API endpoints
3. **E2E тесты** - Тестирование пользовательских сценариев
4. **Performance тесты** - Тестирование производительности

### Запуск тестов

```bash
# Backend тесты
cd backend
python manage.py test

# Frontend тесты
cd frontend
npm test

# E2E тесты
npm run test:e2e
```

### Покрытие тестами

- Backend: 85%+
- Frontend: 80%+
- API: 90%+

## 🚀 Развертывание

### Продакшн развертывание

1. **Подготовка сервера:**
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Настройка SSL:**
```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d veles-drive.ru -d www.veles-drive.ru
```

3. **Запуск приложения:**
```bash
# Клонирование проекта
git clone https://github.com/your-username/veles-drive.git
cd veles-drive

# Настройка переменных окружения
cp env.example .env
# Отредактируйте .env для продакшна

# Запуск
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # Скрипт развертывания
```

## 📊 Мониторинг

### Prometheus метрики

- **Системные метрики**: CPU, RAM, диск
- **Прикладные метрики**: HTTP запросы, ошибки
- **Бизнес метрики**: продажи, пользователи, задачи

### Grafana дашборды

1. **Системный дашборд** - Мониторинг инфраструктуры
2. **Прикладной дашборд** - Метрики приложения
3. **Бизнес дашборд** - KPI и аналитика

### AlertManager

Настройка алертов для:
- Высокая нагрузка на сервер
- Ошибки в приложении
- Проблемы с базой данных
- Критические бизнес-метрики

## 🔧 Обслуживание

### Резервное копирование

```bash
# Автоматическое резервное копирование
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Резервное копирование PostgreSQL
docker-compose exec -T db pg_dump -U postgres veles_auto > $BACKUP_DIR/db_$DATE.sql

# Резервное копирование файлов
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /app/media

# Удаление старых резервных копий (старше 30 дней)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Обновления

```bash
# Обновление приложения
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

## 📞 Поддержка

### Контакты

- **Email**: support@veles-drive.ru
- **Telegram**: @veles_auto_support
- **Документация**: https://docs.veles-drive.ru

### Полезные команды

```bash
# Просмотр логов
docker-compose logs -f backend

# Подключение к базе данных
docker-compose exec db psql -U postgres -d veles_auto

# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Загрузка демо-данных
docker-compose exec backend python manage.py load_demo_data

# Проверка статуса сервисов
docker-compose ps
```

## 📝 Лицензия

Проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для подробностей.

---

**VELES AUTO** - Современная платформа для автомобильного бизнеса 🚗 