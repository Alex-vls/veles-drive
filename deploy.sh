#!/bin/bash

# ============================================================================
# VELES AUTO - Скрипт развертывания
# ============================================================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия Docker и Docker Compose
check_dependencies() {
    print_info "Проверка зависимостей..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker не установлен. Установите Docker и попробуйте снова."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
        exit 1
    fi
    
    print_success "Все зависимости установлены"
}

# Создание файла .env
setup_environment() {
    print_info "Настройка переменных окружения..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Создан файл .env из примера. Отредактируйте его перед запуском!"
        else
            print_error "Файл env.example не найден!"
            exit 1
        fi
    else
        print_info "Файл .env уже существует"
    fi
}

# Создание необходимых директорий
create_directories() {
    print_info "Создание необходимых директорий..."
    
    mkdir -p docker/nginx/ssl
    mkdir -p docker/nginx/www
    mkdir -p docker/grafana/provisioning/datasources
    mkdir -p docker/grafana/provisioning/dashboards
    mkdir -p docker/grafana/dashboards
    mkdir -p docker/prometheus/rules
    mkdir -p docker/minio/scripts
    
    print_success "Директории созданы"
}

# Настройка SSL сертификатов
setup_ssl() {
    print_info "Настройка SSL сертификатов..."
    
    if [ ! -f docker/nginx/ssl/veles-auto.com/fullchain.pem ]; then
        print_warning "SSL сертификаты не найдены. Запускаем Certbot..."
        docker-compose run --rm certbot
    else
        print_success "SSL сертификаты уже существуют"
    fi
}

# Сборка и запуск контейнеров
build_and_start() {
    print_info "Сборка и запуск контейнеров..."
    
    # Остановка существующих контейнеров
    docker-compose down
    
    # Удаление старых образов (опционально)
    read -p "Удалить старые образы? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down --rmi all
        docker system prune -f
    fi
    
    # Сборка образов
    print_info "Сборка Docker образов..."
    docker-compose build --no-cache
    
    # Запуск контейнеров
    print_info "Запуск контейнеров..."
    docker-compose up -d
    
    print_success "Контейнеры запущены"
}

# Ожидание готовности сервисов
wait_for_services() {
    print_info "Ожидание готовности сервисов..."
    
    # Ожидание базы данных
    print_info "Ожидание PostgreSQL..."
    docker-compose exec -T db pg_isready -U veles_user -d veles_auto || sleep 10
    
    # Ожидание Redis
    print_info "Ожидание Redis..."
    docker-compose exec -T redis redis-cli ping || sleep 5
    
    # Ожидание backend
    print_info "Ожидание Django backend..."
    until docker-compose exec -T backend curl -f http://localhost:8000/health/; do
        sleep 5
    done
    
    print_success "Все сервисы готовы"
}

# Выполнение миграций
run_migrations() {
    print_info "Выполнение миграций базы данных..."
    
    docker-compose exec -T backend python manage.py migrate
    
    print_success "Миграции выполнены"
}

# Создание суперпользователя
create_superuser() {
    print_info "Создание суперпользователя..."
    
    read -p "Создать суперпользователя? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose exec -T backend python manage.py createsuperuser
    fi
}

# Сборка статических файлов
collect_static() {
    print_info "Сборка статических файлов..."
    
    docker-compose exec -T backend python manage.py collectstatic --noinput
    
    print_success "Статические файлы собраны"
}

# Загрузка тестовых данных
load_demo_data() {
    print_info "Загрузка тестовых данных..."
    
    read -p "Загрузить тестовые данные? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose exec -T backend python manage.py load_demo_data
    fi
}

# Настройка мониторинга
setup_monitoring() {
    print_info "Настройка мониторинга..."
    
    # Создание конфигурации Prometheus
    if [ ! -f docker/prometheus/prometheus.yml ]; then
        cat > docker/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'veles-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics/'

  - job_name: 'veles-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/health'

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
EOF
    fi
    
    print_success "Мониторинг настроен"
}

# Проверка статуса сервисов
check_status() {
    print_info "Проверка статуса сервисов..."
    
    docker-compose ps
    
    print_info "URL'ы сервисов:"
    echo "🌐 Основной сайт: https://veles-auto.com"
    echo "🔧 API: https://api.veles-auto.com"
    echo "📱 Telegram Mini App: https://tg.veles-auto.com"
    echo "⚙️ Админка + ERP: https://admin.veles-auto.com"
    echo "📊 Grafana: http://localhost:3001 (admin/veles_admin_2024)"
    echo "📈 Prometheus: http://localhost:9090"
    echo "🚨 AlertManager: http://localhost:9093"
    echo "🗄️ MinIO Console: http://localhost:9001 (veles_minio_user/veles_minio_password_2024)"
}

# Основная функция
main() {
    print_info "Запуск развертывания VELES AUTO..."
    
    check_dependencies
    setup_environment
    create_directories
    setup_ssl
    build_and_start
    wait_for_services
    run_migrations
    collect_static
    create_superuser
    load_demo_data
    setup_monitoring
    check_status
    
    print_success "Развертывание VELES AUTO завершено успешно!"
    print_info "Не забудьте настроить DNS записи для домена veles-auto.com"
}

# Обработка аргументов командной строки
case "${1:-}" in
    "build")
        check_dependencies
        build_and_start
        ;;
    "migrate")
        run_migrations
        ;;
    "static")
        collect_static
        ;;
    "status")
        check_status
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "restart")
        docker-compose restart
        ;;
    "stop")
        docker-compose down
        ;;
    "clean")
        docker-compose down -v --rmi all
        docker system prune -f
        ;;
    *)
        main
        ;;
esac 