# Настройка Insomnia для работы с Veles Auto API

## Установка Insomnia

1. Скачайте и установите Insomnia с официального сайта: https://insomnia.rest/download
2. Запустите приложение

## Импорт коллекции

1. Откройте Insomnia
2. Нажмите `Ctrl+Shift+I` (или `Cmd+Shift+I` на Mac) для импорта
3. Выберите файл `veles-auto-insomnia-collection.json`
4. Коллекция будет импортирована с именем "Veles Auto API"

## Настройка окружения

В коллекции есть два предустановленных окружения:

### Development (для локальной разработки)
- `base_url`: http://localhost:8000
- `api_url`: http://localhost:8000/api
- `erp_url`: http://localhost:8000/api/erp
- `auth_url`: http://localhost:8000/api/auth

### Production (для продакшена)
- `base_url`: https://api.veles-drive.ru
- `api_url`: https://api.veles-drive.ru/api
- `erp_url`: https://api.veles-drive.ru/api/erp
- `auth_url`: https://api.veles-drive.ru/api/auth

## Аутентификация

Для работы с защищенными эндпоинтами нужно получить токен:

1. Выполните запрос "User Login" с вашими учетными данными
2. В ответе получите `access` и `refresh` токены
3. Добавьте переменные окружения:
   - `auth_token`: значение `access` токена
   - `refresh_token`: значение `refresh` токена

## Основные эндпоинты

### Системные
- **Health Check** - проверка состояния API
- **API Status** - информация о доступных эндпоинтах
- **System Info** - системная информация

### Аутентификация
- **User Login** - вход в систему
- **User Registration** - регистрация
- **User Profile** - профиль пользователя
- **Refresh Token** - обновление токена

### Автомобили
- **Get Cars List** - список автомобилей
- **Get Car Detail** - детали автомобиля
- **Create Car** - создание автомобиля
- **Get Vehicles List** - список транспортных средств
- **Get Brands List** - список брендов
- **Get Models List** - список моделей

### Компании
- **Get Companies List** - список компаний
- **Get Company Detail** - детали компании
- **Create Company** - создание компании

### Контент
- **Get News List** - список новостей
- **Get News Detail** - детали новости
- **Get Articles List** - список статей
- **Get Article Detail** - детали статьи

### ERP система
- **ERP - Get Inventory** - складские остатки
- **ERP - Get Sales** - продажи
- **ERP - Get Services** - услуги
- **ERP - Get Service Orders** - заказы на услуги
- **ERP - Get Financial** - финансы
- **ERP - Get Project Boards** - доски проектов
- **ERP - Get Project Tasks** - задачи проектов
- **ERP - Get Dashboard** - дашборд
- **ERP - Get Reports** - отчеты

### Интеграции
- **Integration - Get Metrics** - метрики системы
- **Integration - Get Events** - события системы
- **Integration - Health Check** - проверка интеграций

### Telegram Bot
- **Telegram - Webhook** - вебхук для бота
- **Telegram - Mini App Auth** - аутентификация мини-приложения
- **Telegram - Mini App Data** - данные мини-приложения

### Уведомления и модерация
- **Get Notifications List** - список уведомлений
- **Get Notification Detail** - детали уведомления
- **Get Moderation List** - список на модерации

## Полезные советы

1. **Переключение окружений**: Используйте выпадающий список в правом верхнем углу для переключения между Development и Production

2. **Автоматическое обновление токенов**: После логина токены автоматически сохраняются в переменных окружения

3. **Тестирование**: Начните с запросов Health Check и API Status для проверки доступности API

4. **Ошибки**: Если получаете 401 ошибку, проверьте правильность токена и при необходимости обновите его через Refresh Token

5. **Локальная разработка**: Убедитесь, что Django сервер запущен на порту 8000 для работы с Development окружением

## Структура API

```
/api/
├── auth/           # Аутентификация пользователей
├── cars/           # API автомобилей
├── companies/      # API компаний
├── erp/            # ERP система
├── news/           # Новости
├── articles/       # Статьи
├── notifications/  # Уведомления
├── moderation/     # Модерация
└── metrics/        # Метрики и мониторинг
```

## Поддержка

При возникновении проблем:
1. Проверьте логи Django сервера
2. Убедитесь в правильности URL и портов
3. Проверьте статус API через Health Check
4. Обратитесь к документации проекта
