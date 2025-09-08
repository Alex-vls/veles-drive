#!/bin/bash

echo "🚗 VELES AUTO - ЛОКАЛЬНОЕ ТЕСТИРОВАНИЕ"
echo "======================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка системных требований
log_info "Проверка системных требований..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker не установлен"
    exit 1
fi

# Проверка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose не установлен"
    exit 1
fi

# Проверка свободного места
FREE_DISK=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
if [ $FREE_DISK -lt 10 ]; then
    log_warning "Мало свободного места: ${FREE_DISK}GB (требуется минимум 10GB)"
fi

log_success "Системные требования выполнены"

# Остановка существующих контейнеров
log_info "Остановка существующих контейнеров..."
docker-compose down -v 2>/dev/null || true

# Очистка Docker
log_info "Очистка Docker..."
docker system prune -f
docker volume prune -f

# Создание .env файла если не существует
if [ ! -f .env ]; then
    log_info "Создание .env файла..."
    cp env.example .env
    log_success ".env файл создан"
fi

# Запуск базовых сервисов
log_info "Запуск базовых сервисов..."
docker-compose up -d db redis

# Ожидание готовности баз данных
log_info "Ожидание готовности баз данных..."
sleep 30

# Проверка готовности PostgreSQL
log_info "Проверка PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U veles_user -d veles_auto >/dev/null 2>&1; then
        log_success "PostgreSQL готов"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "PostgreSQL не готов после 30 попыток"
        exit 1
    fi
    sleep 2
done

# Проверка готовности Redis
log_info "Проверка Redis..."
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        log_success "Redis готов"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Redis не готов после 30 попыток"
        exit 1
    fi
    sleep 2
done

# Запуск backend
log_info "Запуск Django Backend..."
docker-compose up -d backend

# Ожидание готовности backend
log_info "Ожидание готовности Backend..."
sleep 20

# Проверка готовности backend
log_info "Проверка Backend..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health/ >/dev/null 2>&1; then
        log_success "Backend готов"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Backend не готов после 30 попыток"
        exit 1
    fi
    sleep 2
done

# Выполнение миграций
log_info "Выполнение миграций..."
docker-compose exec -T backend python manage.py migrate

# Создание суперпользователя
log_info "Создание суперпользователя..."
docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@veles-auto.com', 'admin123')
    print('Суперпользователь создан: admin/admin123')
else:
    print('Суперпользователь уже существует')
"

# Загрузка демо данных
log_info "Загрузка демо данных..."
docker-compose exec -T backend python manage.py load_demo_data 2>/dev/null || log_warning "Демо данные не загружены"

# Запуск Celery
log_info "Запуск Celery..."
docker-compose up -d celery_worker celery_beat

# Запуск frontend
log_info "Запуск Frontend..."
docker-compose up -d frontend

# Ожидание готовности frontend
log_info "Ожидание готовности Frontend..."
sleep 30

# Проверка готовности frontend
log_info "Проверка Frontend..."
for i in {1..30}; do
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        log_success "Frontend готов"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Frontend не готов после 30 попыток"
        exit 1
    fi
    sleep 2
done

# Запуск мониторинга
log_info "Запуск мониторинга..."
docker-compose up -d prometheus grafana

# Финальная проверка
log_info "Финальная проверка сервисов..."
docker-compose ps

echo ""
echo "🎉 VELES AUTO УСПЕШНО ЗАПУЩЕН ЛОКАЛЬНО!"
echo "======================================"
echo ""
echo "📱 Доступные сервисы:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - Admin Panel: http://localhost:8000/admin/"
echo "  - API Documentation: http://localhost:8000/api/docs/"
echo "  - Grafana: http://localhost:3003 (admin/veles_admin_2024)"
echo "  - Prometheus: http://localhost:9090"
echo ""
echo "🔑 Учетные данные:"
echo "  - Админ: admin/admin123"
echo "  - Email: admin@veles-auto.com"
echo ""
echo "📊 ERP Модули:"
echo "  - Инвентаризация: http://localhost:3000/inventory"
echo "  - Продажи: http://localhost:3000/sales"
echo "  - Сервис: http://localhost:3000/service"
echo "  - Финансы: http://localhost:3000/finance"
echo "  - Проекты: http://localhost:3000/projects"
echo ""
echo "🛠️ Полезные команды:"
echo "  - Остановить: docker-compose down"
echo "  - Логи: docker-compose logs -f [service]"
echo "  - Перезапуск: docker-compose restart [service]"
echo "  - Shell: docker-compose exec backend python manage.py shell"
echo ""
echo "✅ Тестирование завершено успешно!" 