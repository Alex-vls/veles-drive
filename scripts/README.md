# 🚗 VELES AUTO - Скрипты развертывания и тестирования

## 📋 Обзор

Этот каталог содержит скрипты для развертывания, тестирования и управления проектом Veles Auto.

## 🛠️ Доступные скрипты

### `local-test.sh`
**Назначение:** Полное локальное развертывание и тестирование проекта

**Функции:**
- Проверка системных требований
- Настройка Docker окружения
- Запуск всех сервисов
- Выполнение миграций
- Создание суперпользователя
- Загрузка демо данных
- Проверка работоспособности

**Использование:**
```bash
chmod +x scripts/local-test.sh
./scripts/local-test.sh
```

**Результат:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin/
- Grafana: http://localhost:3003
- Prometheus: http://localhost:9090

### `test-erp.sh`
**Назначение:** Тестирование всех ERP модулей

**Функции:**
- Тестирование API endpoints
- Проверка базы данных
- Тестирование Redis
- Проверка Celery
- Тестирование frontend
- Проверка мониторинга
- Создание тестовых данных

**Использование:**
```bash
chmod +x scripts/test-erp.sh
./scripts/test-erp.sh
```

## 🔧 Системные требования

### Минимальные требования:
- **RAM:** 8GB
- **CPU:** 4 ядра
- **Диск:** 20GB свободного места
- **Docker:** 20.10+
- **Docker Compose:** 2.0+

### Рекомендуемые требования:
- **RAM:** 16GB
- **CPU:** 8 ядер
- **Диск:** 50GB свободного места
- **Docker:** 24.0+
- **Docker Compose:** 2.20+

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/veles-drive.git
cd veles-drive
```

### 2. Настройка переменных окружения
```bash
cp env.example .env
# Отредактируйте .env файл при необходимости
```

### 3. Запуск локального тестирования
```bash
chmod +x scripts/local-test.sh
./scripts/local-test.sh
```

### 4. Тестирование ERP модулей
```bash
chmod +x scripts/test-erp.sh
./scripts/test-erp.sh
```

## 📊 ERP Модули

### Основные модули:
- **Инвентаризация** - управление складом автомобилей
- **Продажи** - система продаж с комиссиями
- **Сервис** - заказы на обслуживание
- **Финансы** - учет доходов и расходов
- **Проекты** - Trello-like доски задач
- **Отчетность** - расширенная аналитика

### API Endpoints:
- `GET /health/` - проверка работоспособности
- `GET /api/status/` - статус API
- `GET /api/system/` - информация о системе
- `GET /api/erp/inventory/` - инвентаризация
- `GET /api/erp/sales/` - продажи
- `GET /api/erp/services/` - услуги
- `GET /api/erp/financial/` - финансы
- `GET /api/erp/project-boards/` - доски проектов

## 🔑 Учетные данные

### По умолчанию создаются:
- **Админ:** admin/admin123
- **Менеджер 1:** manager1/manager123
- **Менеджер 2:** manager2/manager123
- **Продавец 1:** sales1/sales123
- **Продавец 2:** sales2/sales123
- **Сервис:** service1/service123
- **Клиент 1:** customer1/customer123
- **Клиент 2:** customer2/customer123

## 📈 Демо данные

### Автоматически создаются:
- **10 брендов** автомобилей (BMW, Mercedes, Audi, etc.)
- **300+ автомобилей** различных моделей
- **5 компаний** (автосалоны и сервисы)
- **8 пользователей** с разными ролями
- **50+ продаж** с комиссиями
- **30+ заказов** на обслуживание
- **100+ финансовых операций**
- **20 досок проектов** с задачами

## 🐳 Docker сервисы

### Основные сервисы:
- **backend** - Django API (порт 8000)
- **frontend** - React приложение (порт 3000)
- **db** - PostgreSQL база данных (порт 5432)
- **redis** - Redis кэширование (порт 6380)
- **celery_worker** - Фоновые задачи
- **celery_beat** - Планировщик задач

### Мониторинг:
- **prometheus** - Метрики (порт 9090)
- **grafana** - Дашборды (порт 3003)
- **alertmanager** - Уведомления (порт 9093)

### Дополнительные:
- **nginx** - Веб-сервер (порт 80/443)
- **minio** - Файловое хранилище (порт 9000/9001)

## 🔍 Отладка

### Просмотр логов:
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Подключение к контейнерам:
```bash
# Backend shell
docker-compose exec backend python manage.py shell

# База данных
docker-compose exec db psql -U veles_user -d veles_auto

# Redis
docker-compose exec redis redis-cli
```

### Проверка статуса:
```bash
# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Проверка health check
curl http://localhost:8000/health/
```

## 🚨 Устранение неполадок

### Проблема: Порт уже занят
```bash
# Проверка занятых портов
sudo netstat -tlnp | grep :6379
sudo netstat -tlnp | grep :5432

# Остановка конфликтующих сервисов
sudo systemctl stop redis-server
sudo systemctl stop postgresql
```

### Проблема: Недостаточно памяти
```bash
# Проверка свободной памяти
free -h

# Очистка Docker
docker system prune -a
docker volume prune
```

### Проблема: Ошибки миграций
```bash
# Сброс базы данных
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python manage.py migrate
```

## 📝 Полезные команды

### Управление проектом:
```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Перезапуск конкретного сервиса
docker-compose restart backend

# Обновление образов
docker-compose pull
docker-compose up -d
```

### Работа с данными:
```bash
# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Загрузка демо данных
docker-compose exec backend python manage.py load_demo_data

# Очистка и перезагрузка демо данных
docker-compose exec backend python manage.py load_demo_data --clear
```

### Резервное копирование:
```bash
# Экспорт базы данных
docker-compose exec db pg_dump -U veles_user veles_auto > backup.sql

# Импорт базы данных
docker-compose exec -T db psql -U veles_user -d veles_auto < backup.sql
```

## 🎯 Следующие шаги

После успешного запуска:

1. **Изучите интерфейс** - http://localhost:3000
2. **Проверьте админку** - http://localhost:8000/admin/
3. **Изучите API** - http://localhost:8000/api/status/
4. **Настройте мониторинг** - http://localhost:3003
5. **Протестируйте ERP модули** - используйте скрипт test-erp.sh

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Проверьте ресурсы: `docker stats`
4. Обратитесь к документации: `DOCUMENTATION.md`
5. Создайте issue в репозитории

---

**VELES AUTO** - Современная ERP система для автомобильного бизнеса 🚗 