#!/bin/bash

# VELES AUTO - Скрипт развертывания в продакшн
# Автор: VELES AUTO Team
# Версия: 1.0

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для логирования
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

# Проверка прав администратора
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "Этот скрипт не должен запускаться от root пользователя"
        exit 1
    fi
}

# Проверка зависимостей
check_dependencies() {
    log_info "Проверка зависимостей..."
    
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
    
    # Проверка Git
    if ! command -v git &> /dev/null; then
        log_error "Git не установлен"
        exit 1
    fi
    
    log_success "Все зависимости установлены"
}

# Создание резервной копии
create_backup() {
    log_info "Создание резервной копии..."
    
    BACKUP_DIR="/backups/veles-auto"
    DATE=$(date +%Y%m%d_%H%M%S)
    
    # Создание директории для резервных копий
    sudo mkdir -p $BACKUP_DIR
    
    # Резервное копирование базы данных
    if docker-compose ps | grep -q "db.*Up"; then
        log_info "Резервное копирование базы данных..."
        docker-compose exec -T db pg_dump -U postgres veles_auto > $BACKUP_DIR/db_$DATE.sql
        log_success "База данных сохранена: $BACKUP_DIR/db_$DATE.sql"
    else
        log_warning "База данных не запущена, пропускаем резервное копирование"
    fi
    
    # Резервное копирование файлов
    if [ -d "media" ]; then
        log_info "Резервное копирование файлов..."
        tar -czf $BACKUP_DIR/files_$DATE.tar.gz media/
        log_success "Файлы сохранены: $BACKUP_DIR/files_$DATE.tar.gz"
    fi
    
    # Удаление старых резервных копий (старше 7 дней)
    find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    
    log_success "Резервное копирование завершено"
}

# Обновление кода
update_code() {
    log_info "Обновление кода..."
    
    # Сохранение текущей ветки
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Получение последних изменений
    git fetch origin
    
    # Проверка наличия изменений
    if [ "$(git rev-list HEAD...origin/main --count)" -eq 0 ]; then
        log_info "Нет новых изменений"
        return 0
    fi
    
    # Переключение на main ветку
    git checkout main
    git pull origin main
    
    log_success "Код обновлен"
}

# Проверка переменных окружения
check_environment() {
    log_info "Проверка переменных окружения..."
    
    if [ ! -f ".env" ]; then
        log_error "Файл .env не найден"
        exit 1
    fi
    
    # Проверка обязательных переменных
    required_vars=(
        "POSTGRES_DB"
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "SECRET_KEY"
        "DEBUG"
        "ALLOWED_HOSTS"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            log_error "Переменная $var не найдена в .env"
            exit 1
        fi
    done
    
    log_success "Переменные окружения проверены"
}

# Сборка и запуск контейнеров
build_and_start() {
    log_info "Сборка и запуск контейнеров..."
    
    # Остановка существующих контейнеров
    log_info "Остановка существующих контейнеров..."
    docker-compose down
    
    # Удаление старых образов
    log_info "Очистка старых образов..."
    docker system prune -f
    
    # Сборка новых образов
    log_info "Сборка образов..."
    docker-compose build --no-cache
    
    # Запуск контейнеров
    log_info "Запуск контейнеров..."
    docker-compose up -d
    
    # Ожидание запуска базы данных
    log_info "Ожидание запуска базы данных..."
    sleep 30
    
    log_success "Контейнеры запущены"
}

# Применение миграций
run_migrations() {
    log_info "Применение миграций..."
    
    # Ожидание готовности базы данных
    for i in {1..30}; do
        if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
            break
        fi
        log_info "Ожидание готовности базы данных... ($i/30)"
        sleep 2
    done
    
    # Применение миграций
    docker-compose exec -T backend python manage.py migrate
    
    log_success "Миграции применены"
}

# Сборка статических файлов
collect_static() {
    log_info "Сборка статических файлов..."
    
    docker-compose exec -T backend python manage.py collectstatic --noinput
    
    log_success "Статические файлы собраны"
}

# Проверка здоровья приложения
health_check() {
    log_info "Проверка здоровья приложения..."
    
    # Ожидание запуска приложения
    sleep 10
    
    # Проверка API
    for i in {1..10}; do
        if curl -f http://localhost:8000/api/health/ > /dev/null 2>&1; then
            log_success "Приложение работает корректно"
            return 0
        fi
        log_info "Проверка здоровья приложения... ($i/10)"
        sleep 5
    done
    
    log_error "Приложение не отвечает"
    return 1
}

# Отправка уведомлений
send_notifications() {
    log_info "Отправка уведомлений..."
    
    # Здесь можно добавить отправку уведомлений в Telegram, Slack и т.д.
    # Например:
    # curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    #     -d "chat_id=$TELEGRAM_CHAT_ID" \
    #     -d "text=VELES AUTO успешно развернута!"
    
    log_success "Уведомления отправлены"
}

# Основная функция
main() {
    log_info "Начало развертывания VELES AUTO..."
    
    # Проверки
    check_root
    check_dependencies
    check_environment
    
    # Создание резервной копии
    create_backup
    
    # Обновление кода
    update_code
    
    # Сборка и запуск
    build_and_start
    
    # Применение миграций
    run_migrations
    
    # Сборка статических файлов
    collect_static
    
    # Проверка здоровья
    if health_check; then
        log_success "Развертывание завершено успешно!"
        send_notifications
    else
        log_error "Развертывание завершилось с ошибками"
        exit 1
    fi
}

# Обработка сигналов
trap 'log_error "Развертывание прервано"; exit 1' INT TERM

# Запуск основной функции
main "$@" 