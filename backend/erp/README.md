# ERP Система VELES AUTO

## Описание

ERP (Enterprise Resource Planning) система для управления автомобильным бизнесом, включающая в себя:

- **Управление инвентарем** - отслеживание автомобилей на складе
- **Продажи** - управление продажами автомобилей
- **Сервисные услуги** - заказы на обслуживание
- **Финансы** - учет финансовых операций
- **Trello-подобное управление проектами** - доски, колонки, задачи

## Модели данных

### ERP Core Models

#### Inventory (Инвентарь)
- `company` - компания
- `car` - автомобиль
- `quantity` - количество
- `cost_price` - себестоимость
- `selling_price` - цена продажи
- `status` - статус (available, reserved, sold, maintenance, damaged)
- `location` - местоположение
- `notes` - заметки

#### Sale (Продажа)
- `company` - компания
- `car` - автомобиль
- `customer` - клиент
- `sale_price` - цена продажи
- `commission` - комиссия
- `status` - статус (pending, completed, cancelled, refunded)
- `notes` - заметки

#### Service (Услуга)
- `company` - компания
- `name` - название
- `description` - описание
- `price` - цена
- `duration` - длительность
- `category` - категория
- `is_active` - активна ли услуга

#### ServiceOrder (Заказ на обслуживание)
- `company` - компания
- `customer` - клиент
- `car` - автомобиль
- `services` - услуги (ManyToMany)
- `total_price` - общая стоимость
- `status` - статус (scheduled, in_progress, completed, cancelled)
- `scheduled_date` - запланированная дата
- `completed_date` - дата завершения

#### Financial (Финансовая операция)
- `company` - компания
- `operation_type` - тип операции (income, expense, investment, loan, refund)
- `amount` - сумма
- `description` - описание
- `category` - категория
- `created_by` - создатель

### Trello-like Project Management

#### ProjectBoard (Доска проектов)
- `company` - компания
- `name` - название
- `description` - описание
- `board_type` - тип доски (sales, service, inventory, general)
- `color` - цвет
- `is_archived` - архивирована ли
- `created_by` - создатель

#### ProjectColumn (Колонка проекта)
- `board` - доска
- `name` - название
- `order` - порядок
- `color` - цвет
- `is_archived` - архивирована ли

#### ProjectTask (Задача проекта)
- `column` - колонка
- `title` - заголовок
- `description` - описание
- `order` - порядок
- `priority` - приоритет (low, medium, high, urgent)
- `due_date` - срок выполнения
- `assignee` - исполнитель
- `labels` - метки (ManyToMany)
- `related_sale` - связанная продажа
- `related_service_order` - связанный заказ на обслуживание
- `related_car` - связанный автомобиль
- `related_customer` - связанный клиент
- `is_archived` - архивирована ли
- `created_by` - создатель

#### TaskLabel (Метка задачи)
- `board` - доска
- `name` - название
- `color` - цвет

#### TaskComment (Комментарий к задаче)
- `task` - задача
- `author` - автор
- `text` - текст

#### TaskAttachment (Вложение к задаче)
- `task` - задача
- `file` - файл
- `filename` - имя файла
- `file_size` - размер файла
- `uploaded_by` - загрузил

#### TaskHistory (История задачи)
- `task` - задача
- `user` - пользователь
- `action` - действие
- `old_value` - старое значение
- `new_value` - новое значение

## API Endpoints

### ERP Core API

#### Inventory
- `GET /api/erp/inventory/` - список инвентаря
- `POST /api/erp/inventory/` - создать позицию инвентаря
- `GET /api/erp/inventory/{id}/` - детали позиции
- `PUT /api/erp/inventory/{id}/` - обновить позицию
- `DELETE /api/erp/inventory/{id}/` - удалить позицию
- `GET /api/erp/inventory/stats/` - статистика по инвентарю

#### Sales
- `GET /api/erp/sales/` - список продаж
- `POST /api/erp/sales/` - создать продажу
- `GET /api/erp/sales/{id}/` - детали продажи
- `PUT /api/erp/sales/{id}/` - обновить продажу
- `DELETE /api/erp/sales/{id}/` - удалить продажу
- `GET /api/erp/sales/stats/` - статистика по продажам

#### Services
- `GET /api/erp/services/` - список услуг
- `POST /api/erp/services/` - создать услугу
- `GET /api/erp/services/{id}/` - детали услуги
- `PUT /api/erp/services/{id}/` - обновить услугу
- `DELETE /api/erp/services/{id}/` - удалить услугу

#### Service Orders
- `GET /api/erp/service-orders/` - список заказов
- `POST /api/erp/service-orders/` - создать заказ
- `GET /api/erp/service-orders/{id}/` - детали заказа
- `PUT /api/erp/service-orders/{id}/` - обновить заказ
- `DELETE /api/erp/service-orders/{id}/` - удалить заказ
- `GET /api/erp/service-orders/stats/` - статистика по заказам

#### Financial
- `GET /api/erp/financial/` - список операций
- `POST /api/erp/financial/` - создать операцию
- `GET /api/erp/financial/{id}/` - детали операции
- `PUT /api/erp/financial/{id}/` - обновить операцию
- `DELETE /api/erp/financial/{id}/` - удалить операцию
- `GET /api/erp/financial/stats/` - финансовая статистика

### Trello-like Project Management API

#### Project Boards
- `GET /api/erp/project-boards/` - список досок
- `POST /api/erp/project-boards/` - создать доску
- `GET /api/erp/project-boards/{id}/` - детали доски
- `PUT /api/erp/project-boards/{id}/` - обновить доску
- `DELETE /api/erp/project-boards/{id}/` - удалить доску
- `POST /api/erp/project-boards/{id}/duplicate/` - дублировать доску

#### Project Columns
- `GET /api/erp/project-columns/` - список колонок
- `POST /api/erp/project-columns/` - создать колонку
- `GET /api/erp/project-columns/{id}/` - детали колонки
- `PUT /api/erp/project-columns/{id}/` - обновить колонку
- `DELETE /api/erp/project-columns/{id}/` - удалить колонку
- `POST /api/erp/project-columns/{id}/reorder-tasks/` - переупорядочить задачи

#### Project Tasks
- `GET /api/erp/project-tasks/` - список задач
- `POST /api/erp/project-tasks/` - создать задачу
- `GET /api/erp/project-tasks/{id}/` - детали задачи
- `PUT /api/erp/project-tasks/{id}/` - обновить задачу
- `DELETE /api/erp/project-tasks/{id}/` - удалить задачу
- `POST /api/erp/project-tasks/{id}/move/` - переместить задачу
- `POST /api/erp/project-tasks/{id}/assign/` - назначить задачу

#### Task Comments
- `GET /api/erp/task-comments/` - список комментариев
- `POST /api/erp/task-comments/` - создать комментарий
- `GET /api/erp/task-comments/{id}/` - детали комментария
- `PUT /api/erp/task-comments/{id}/` - обновить комментарий
- `DELETE /api/erp/task-comments/{id}/` - удалить комментарий

#### Task Attachments
- `GET /api/erp/task-attachments/` - список вложений
- `POST /api/erp/task-attachments/` - создать вложение
- `GET /api/erp/task-attachments/{id}/` - детали вложения
- `DELETE /api/erp/task-attachments/{id}/` - удалить вложение

#### Task History
- `GET /api/erp/task-history/` - история задач

### Dashboard & Reports API

#### Dashboard
- `GET /api/erp/dashboard/stats/` - общая статистика дашборда

#### Reports
- `GET /api/erp/reports/sales/` - отчет по продажам
- `GET /api/erp/reports/financial/` - финансовый отчет
- `GET /api/erp/reports/tasks/` - отчет по задачам

## Админка

ERP система имеет кастомную админку, доступную по адресу `/erp/admin/`

### Особенности админки:
- Удобное управление всеми ERP объектами
- Цветовая индикация статусов и приоритетов
- Связи между ERP объектами и задачами
- Автоматическое создание истории изменений
- Фильтрация и поиск по всем полям

## Сигналы

Система автоматически создает задачи при определенных событиях:

- **Создание продажи** → задача в доске "Продажи"
- **Создание заказа на обслуживание** → задача в доске "Сервис"
- **Изменение статуса инвентаря на "maintenance"** → задача в доске "Склад"
- **Крупная финансовая операция** → задача в доске "Общие задачи"

## Демо-данные

Для загрузки демо-данных используйте команду:

```bash
python manage.py load_erp_demo_data --company-id 1
```

Опции:
- `--company-id` - ID компании для которой загружать данные
- `--clear` - очистить существующие данные перед загрузкой

## Разработка

### Добавление новых полей в модели

1. Измените модель в `models.py`
2. Создайте миграцию: `python manage.py makemigrations erp`
3. Примените миграцию: `python manage.py migrate`

### Добавление новых API endpoints

1. Добавьте ViewSet в `views.py`
2. Добавьте сериализатор в `serializers.py`
3. Зарегистрируйте маршрут в `urls.py`

### Добавление новых сигналов

1. Добавьте функцию-обработчик в `signals.py`
2. Используйте декоратор `@receiver` для подключения к событию

## Тестирование

Для тестирования API используйте:

```bash
# Тест инвентаря
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/erp/inventory/

# Тест создания задачи
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Тестовая задача","column":1}' \
  http://localhost:8000/api/erp/project-tasks/
``` 