#!/bin/bash

# ============================================================================
# VELES AUTO - Генерация ключей и паролей
# ============================================================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Проверка наличия Python
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 не установлен"
        exit 1
    fi
}

# Генерация Django SECRET_KEY
generate_django_secret() {
    print_info "Генерация Django SECRET_KEY..."
    
    SECRET_KEY=$(python3 -c "
import secrets
import string
alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
print(''.join(secrets.choice(alphabet) for i in range(50)))
")
    
    echo "DJANGO_SECRET_KEY=$SECRET_KEY"
    echo
}

# Генерация паролей для базы данных
generate_db_passwords() {
    print_info "Генерация паролей для базы данных..."
    
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
    echo "REDIS_PASSWORD=$REDIS_PASSWORD"
    echo
}

# Генерация паролей для MinIO
generate_minio_passwords() {
    print_info "Генерация паролей для MinIO..."
    
    MINIO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    echo "MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD"
    echo
}

# Генерация паролей для мониторинга
generate_monitoring_passwords() {
    print_info "Генерация паролей для мониторинга..."
    
    GRAFANA_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    PROMETHEUS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    echo "GRAFANA_ADMIN_PASSWORD=$GRAFANA_PASSWORD"
    echo "PROMETHEUS_PASSWORD=$PROMETHEUS_PASSWORD"
    echo
}

# Генерация JWT секретов
generate_jwt_secrets() {
    print_info "Генерация JWT секретов..."
    
    JWT_SECRET_KEY=$(openssl rand -base64 64)
    JWT_REFRESH_SECRET_KEY=$(openssl rand -base64 64)
    
    echo "JWT_SECRET_KEY=$JWT_SECRET_KEY"
    echo "JWT_REFRESH_SECRET_KEY=$JWT_REFRESH_SECRET_KEY"
    echo
}

# Генерация API ключей
generate_api_keys() {
    print_info "Генерация API ключей..."
    
    API_KEY=$(openssl rand -hex 32)
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    
    echo "API_KEY=$API_KEY"
    echo "WEBHOOK_SECRET=$WEBHOOK_SECRET"
    echo
}

# Создание файла с ключами
create_keys_file() {
    print_info "Создание файла с ключами..."
    
    cat > generated_keys.txt << EOF
# ============================================================================
# VELES AUTO - Сгенерированные ключи
# ============================================================================
# Создано: $(date)
# ВНИМАНИЕ: Сохраните этот файл в безопасном месте!

$(generate_django_secret)
$(generate_db_passwords)
$(generate_minio_passwords)
$(generate_monitoring_passwords)
$(generate_jwt_secrets)
$(generate_api_keys)

# ============================================================================
# ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ
# ============================================================================

1. Скопируйте нужные переменные в файл .env
2. Удалите этот файл после использования
3. Сохраните копию в безопасном месте
4. Никогда не коммитьте ключи в git

# ============================================================================
# ПРИМЕР ЗАПОЛНЕНИЯ .env
# ============================================================================

# Django
DJANGO_SECRET_KEY=<скопируйте значение выше>

# База данных
POSTGRES_PASSWORD=<скопируйте значение выше>
REDIS_PASSWORD=<скопируйте значение выше>

# MinIO
MINIO_ROOT_PASSWORD=<скопируйте значение выше>

# Мониторинг
GRAFANA_ADMIN_PASSWORD=<скопируйте значение выше>

# JWT
JWT_SECRET_KEY=<скопируйте значение выше>
JWT_REFRESH_SECRET_KEY=<скопируйте значение выше>

# API
API_KEY=<скопируйте значение выше>
WEBHOOK_SECRET=<скопируйте значение выше>
EOF

    print_success "Ключи сохранены в файл generated_keys.txt"
    print_warning "УДАЛИТЕ ЭТОТ ФАЙЛ ПОСЛЕ ИСПОЛЬЗОВАНИЯ!"
}

# Основная функция
main() {
    print_info "Генерация ключей для VELES AUTO..."
    
    check_python
    create_keys_file
    
    print_success "Генерация завершена!"
    print_info "Файл с ключами: generated_keys.txt"
    print_warning "Не забудьте удалить файл после использования!"
}

# Обработка аргументов
case "${1:-}" in
    "django")
        generate_django_secret
        ;;
    "db")
        generate_db_passwords
        ;;
    "minio")
        generate_minio_passwords
        ;;
    "monitoring")
        generate_monitoring_passwords
        ;;
    "jwt")
        generate_jwt_secrets
        ;;
    "api")
        generate_api_keys
        ;;
    *)
        main
        ;;
esac 