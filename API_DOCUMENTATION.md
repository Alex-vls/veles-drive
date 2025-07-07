# API Документация VELES AUTO

## Базовый URL
```
https://api.veles-auto.com
```

## Аутентификация

### JWT токены
```bash
# Получение токена
POST /api/auth/login/
{
    "username": "user@example.com",
    "password": "password"
}

# Обновление токена
POST /api/auth/refresh/
{
    "refresh": "refresh_token"
}
```

### Заголовки авторизации
```bash
Authorization: Bearer <access_token>
```

## Транспортные средства

### Получение списка транспортных средств
```http
GET /api/vehicles/
```

**Параметры:**
- `vehicle_type` - тип транспорта (car, motorcycle, boat, aircraft)
- `brand` - марка
- `model` - модель
- `year_min` - минимальный год
- `year_max` - максимальный год
- `price_min` - минимальная цена
- `price_max` - максимальная цена
- `fuel_type` - тип топлива
- `transmission` - тип трансмиссии
- `search` - поиск по названию
- `ordering` - сортировка (price, year, mileage, created_at)

**Ответ:**
```json
{
    "count": 100,
    "next": "https://api.veles-auto.com/api/vehicles/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "vehicle_type": "car",
            "brand": "Toyota",
            "model": "Camry",
            "year": 2020,
            "mileage": 50000,
            "price": "2000000.00",
            "currency": "RUB",
            "fuel_type": "petrol",
            "transmission": "automatic",
            "engine_volume": "2.5",
            "power": 200,
            "color": "white",
            "vin": "1HGBH41JXMN109186",
            "description": "Отличный автомобиль",
            "is_active": true,
            "company": {
                "id": 1,
                "name": "Автосалон",
                "city": "Москва"
            },
            "images": [
                "https://api.veles-auto.com/media/vehicles/car1.jpg"
            ],
            "created_at": "2024-01-01T10:00:00Z"
        }
    ]
}
```

### Получение транспортного средства
```http
GET /api/vehicles/{id}/
```

### Создание транспортного средства
```http
POST /api/vehicles/
```

**Тело запроса:**
```json
{
    "vehicle_type": "car",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2020,
    "mileage": 50000,
    "price": "2000000.00",
    "fuel_type": "petrol",
    "transmission": "automatic",
    "engine_volume": "2.5",
    "power": 200,
    "color": "white",
    "vin": "1HGBH41JXMN109186",
    "description": "Отличный автомобиль"
}
```

### Обновление транспортного средства
```http
PUT /api/vehicles/{id}/
PATCH /api/vehicles/{id}/
```

### Удаление транспортного средства
```http
DELETE /api/vehicles/{id}/
```

## Автомобили

### Получение списка автомобилей
```http
GET /api/cars/
```

**Параметры:**
- `body_type` - тип кузова
- `doors` - количество дверей
- `seats` - количество мест
- Все параметры от Vehicle

### Получение автомобиля
```http
GET /api/cars/{id}/
```

## Мотоциклы

### Получение списка мотоциклов
```http
GET /api/motorcycles/
```

**Параметры:**
- `engine_type` - тип двигателя
- `cylinders` - количество цилиндров
- `cooling` - тип охлаждения
- Все параметры от Vehicle

## Лодки

### Получение списка лодок
```http
GET /api/boats/
```

**Параметры:**
- `boat_type` - тип судна
- `length` - длина
- `beam` - ширина
- `draft` - осадка
- `capacity` - вместимость

## Воздушные суда

### Получение списка воздушных судов
```http
GET /api/aircraft/
```

**Параметры:**
- `aircraft_type` - тип воздушного судна
- `wingspan` - размах крыльев
- `length` - длина
- `max_altitude` - максимальная высота
- `range` - дальность полета

## Компании

### Получение списка компаний
```http
GET /api/companies/
```

**Параметры:**
- `city` - город
- `is_verified` - проверенная компания
- `rating_min` - минимальный рейтинг
- `search` - поиск по названию

**Ответ:**
```json
{
    "count": 50,
    "results": [
        {
            "id": 1,
            "name": "Автосалон",
            "logo": "https://api.veles-auto.com/media/companies/logo1.jpg",
            "rating": 4.5,
            "is_verified": true,
            "city": "Москва",
            "phone": "+7-999-123-45-67",
            "email": "info@autosalon.ru",
            "address": "ул. Примерная, 1",
            "description": "Автосалон с большим выбором автомобилей",
            "vehicles_count": 25,
            "reviews_count": 15
        }
    ]
}
```

### Получение компании
```http
GET /api/companies/{id}/
```

### Создание компании
```http
POST /api/companies/
```

## Аукционы

### Получение списка аукционов
```http
GET /api/erp/auctions/
```

**Параметры:**
- `auction_type` - тип аукциона
- `status` - статус
- `start_date` - дата начала
- `end_date` - дата окончания

**Ответ:**
```json
{
    "count": 10,
    "results": [
        {
            "id": 1,
            "title": "Аукцион Toyota Camry",
            "description": "Продажа автомобиля",
            "auction_type": "english",
            "status": "active",
            "start_date": "2024-01-01T10:00:00Z",
            "end_date": "2024-01-07T18:00:00Z",
            "min_bid": "100000.00",
            "current_price": "150000.00",
            "bid_increment": "10000.00",
            "total_bids": 5,
            "is_active": true,
            "vehicle": {
                "id": 1,
                "brand": "Toyota",
                "model": "Camry",
                "year": 2020
            }
        }
    ]
}
```

### Создание аукциона
```http
POST /api/erp/auctions/
```

**Тело запроса:**
```json
{
    "title": "Аукцион Toyota Camry",
    "description": "Продажа автомобиля",
    "auction_type": "english",
    "start_date": "2024-01-01T10:00:00Z",
    "end_date": "2024-01-07T18:00:00Z",
    "min_bid": "100000.00",
    "bid_increment": "10000.00",
    "vehicle": 1
}
```

### Размещение ставки
```http
POST /api/erp/auctions/{id}/bid/
```

**Тело запроса:**
```json
{
    "amount": "160000.00"
}
```

## Лизинг

### Получение списка заявок на лизинг
```http
GET /api/erp/leasing/
```

**Параметры:**
- `status` - статус заявки
- `applicant` - заявитель
- `vehicle` - транспортное средство

### Создание заявки на лизинг
```http
POST /api/erp/leasing/
```

**Тело запроса:**
```json
{
    "program": 1,
    "vehicle": 1,
    "down_payment": "400000.00",
    "term_months": 36,
    "notes": "Заявка на лизинг"
}
```

## Страхование

### Получение списка страховых полисов
```http
GET /api/erp/insurance/
```

**Параметры:**
- `status` - статус полиса
- `insured_person` - страхователь
- `vehicle` - транспортное средство
- `company` - страховая компания

### Создание страхового полиса
```http
POST /api/erp/insurance/
```

**Тело запроса:**
```json
{
    "company": 1,
    "insurance_type": 1,
    "vehicle": 1,
    "policy_number": "POL-2024-001",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "premium_amount": "50000.00",
    "coverage_amount": "2000000.00",
    "deductible": "10000.00"
}
```

## ERP система

### Проектные доски
```http
GET /api/erp/project-boards/
POST /api/erp/project-boards/
GET /api/erp/project-boards/{id}/
PUT /api/erp/project-boards/{id}/
DELETE /api/erp/project-boards/{id}/
```

### Задачи
```http
GET /api/erp/project-tasks/
POST /api/erp/project-tasks/
GET /api/erp/project-tasks/{id}/
PUT /api/erp/project-tasks/{id}/
DELETE /api/erp/project-tasks/{id}/
```

### Комментарии к задачам
```http
GET /api/erp/task-comments/
POST /api/erp/task-comments/
GET /api/erp/task-comments/{id}/
PUT /api/erp/task-comments/{id}/
DELETE /api/erp/task-comments/{id}/
```

## Пользователи

### Профиль пользователя
```http
GET /api/users/profile/
PUT /api/users/profile/
```

### Избранные автомобили
```http
GET /api/users/favorites/
POST /api/users/favorites/
DELETE /api/users/favorites/{id}/
```

### История просмотров
```http
GET /api/users/history/
```

## Поиск

### Глобальный поиск
```http
GET /api/search/
```

**Параметры:**
- `q` - поисковый запрос
- `type` - тип (vehicles, companies, news)
- `limit` - ограничение результатов

**Ответ:**
```json
{
    "vehicles": [
        {
            "id": 1,
            "type": "vehicle",
            "title": "Toyota Camry 2020",
            "description": "Отличный автомобиль",
            "url": "/vehicles/1/"
        }
    ],
    "companies": [
        {
            "id": 1,
            "type": "company",
            "title": "Автосалон",
            "description": "Автосалон с большим выбором",
            "url": "/companies/1/"
        }
    ]
}
```

## Ошибки

### Стандартные коды ошибок
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `429` - Слишком много запросов
- `500` - Внутренняя ошибка сервера

### Формат ошибки
```json
{
    "error": "Описание ошибки",
    "code": "ERROR_CODE",
    "details": {
        "field": "Описание проблемы с полем"
    }
}
```

## Rate Limiting

- API: 100 запросов в минуту
- Аутентификация: 5 запросов в минуту
- Загрузка файлов: 10 запросов в минуту

## Пагинация

Все списки поддерживают пагинацию:

```json
{
    "count": 1000,
    "next": "https://api.veles-auto.com/api/vehicles/?page=2",
    "previous": null,
    "results": [...]
}
```

**Параметры пагинации:**
- `page` - номер страницы
- `page_size` - размер страницы (максимум 100)

## Фильтрация и сортировка

### Фильтрация
```http
GET /api/vehicles/?price_min=1000000&year_min=2020&brand=Toyota
```

### Сортировка
```http
GET /api/vehicles/?ordering=price
GET /api/vehicles/?ordering=-price
GET /api/vehicles/?ordering=year,-price
```

## WebSocket API

### Подключение
```javascript
const ws = new WebSocket('wss://api.veles-auto.com/ws/');
```

### События
- `vehicle.created` - создан новый транспорт
- `auction.updated` - обновлен аукцион
- `bid.placed` - размещена ставка
- `notification` - новое уведомление

### Пример использования
```javascript
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    switch(data.type) {
        case 'vehicle.created':
            console.log('Новый транспорт:', data.vehicle);
            break;
        case 'auction.updated':
            console.log('Обновлен аукцион:', data.auction);
            break;
    }
};
``` 