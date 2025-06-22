#!/bin/bash

# 🚀 VELES AUTO - Скрипт автоматического развертывания на VPS
# Автор: VELES AUTO Team
# Версия: 1.0

set -e  # Остановка при ошибке

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

# Проверка прав администратора
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "Этот скрипт не должен запускаться от root пользователя"
        exit 1
    fi
}

# Проверка операционной системы
check_os() {
    print_info "Проверка операционной системы..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "Не удалось определить операционную систему"
        exit 1
    fi
    
    print_success "Обнаружена ОС: $OS $VER"
}

# Установка Docker
install_docker() {
    print_info "Установка Docker..."
    
    if command -v docker &> /dev/null; then
        print_warning "Docker уже установлен"
        return
    fi
    
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    
    print_success "Docker установлен успешно"
}

# Установка Docker Compose
install_docker_compose() {
    print_info "Установка Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose уже установлен"
        return
    fi
    
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose установлен успешно"
}

# Установка дополнительных инструментов
install_tools() {
    print_info "Установка дополнительных инструментов..."
    
    sudo apt update
    sudo apt install -y git curl wget htop nginx certbot python3-certbot-nginx
    
    print_success "Инструменты установлены успешно"
}

# Настройка переменных окружения
setup_env() {
    print_info "Настройка переменных окружения..."
    
    if [[ ! -f .env ]]; then
        if [[ -f .env.example ]]; then
            cp .env.example .env
            print_warning "Файл .env создан из .env.example. Пожалуйста, отредактируйте его!"
        else
            print_error "Файл .env.example не найден"
            exit 1
        fi
    else
        print_warning "Файл .env уже существует"
    fi
}

# Настройка Nginx
setup_nginx() {
    print_info "Настройка Nginx..."
    
    read -p "Введите ваш домен (например: example.com): " DOMAIN
    
    if [[ -z "$DOMAIN" ]]; then
        print_warning "Домен не указан, пропускаем настройку Nginx"
        return
    fi
    
    # Создание конфигурации Nginx
    sudo tee /etc/nginx/sites-available/veles-auto > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Активация конфигурации
    sudo ln -sf /etc/nginx/sites-available/veles-auto /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    
    print_success "Nginx настроен для домена: $DOMAIN"
    
    # Получение SSL сертификата
    read -p "Получить SSL сертификат для $DOMAIN? (y/n): " GET_SSL
    if [[ $GET_SSL =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN
        print_success "SSL сертификат получен"
    fi
}

# Настройка файрвола
setup_firewall() {
    print_info "Настройка файрвола..."
    
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw allow 3001  # Grafana
    sudo ufw --force enable
    
    print_success "Файрвол настроен"
}

# Запуск приложения
start_application() {
    print_info "Запуск приложения..."
    
    # Остановка существующих контейнеров
    docker-compose down 2>/dev/null || true
    
    # Сборка и запуск
    docker-compose up -d --build
    
    # Ожидание запуска
    print_info "Ожидание запуска сервисов..."
    sleep 30
    
    # Проверка статуса
    if docker-compose ps | grep -q "Up"; then
        print_success "Приложение запущено успешно"
    else
        print_error "Ошибка запуска приложения"
        docker-compose logs
        exit 1
    fi
}

# Инициализация базы данных
init_database() {
    print_info "Инициализация базы данных..."
    
    # Ожидание готовности базы данных
    print_info "Ожидание готовности базы данных..."
    sleep 10
    
    # Применение миграций
    docker-compose exec -T backend python manage.py migrate
    
    # Сборка статических файлов
    docker-compose exec -T backend python manage.py collectstatic --noinput
    
    print_success "База данных инициализирована"
}

# Создание суперпользователя
create_superuser() {
    print_info "Создание суперпользователя..."
    
    read -p "Создать суперпользователя Django? (y/n): " CREATE_SUPERUSER
    if [[ $CREATE_SUPERUSER =~ ^[Yy]$ ]]; then
        docker-compose exec -T backend python manage.py createsuperuser
        print_success "Суперпользователь создан"
    fi
}

# Настройка мониторинга
setup_monitoring() {
    print_info "Настройка мониторинга..."
    
    # Создание директории для бэкапов
    sudo mkdir -p /backups/database
    sudo chown $USER:$USER /backups/database
    
    # Создание скрипта бэкапа
    sudo tee /usr/local/bin/backup-veles-auto.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
cd /path/to/veles-auto

# Бэкап базы данных
docker-compose exec -T db pg_dump -U veles_user veles_auto > $BACKUP_DIR/backup_$DATE.sql

# Бэкап конфигурации
tar -czf /backups/config_$DATE.tar.gz .env docker-compose.yml

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
find /backups -name "config_*.tar.gz" -mtime +30 -delete
EOF
    
    sudo chmod +x /usr/local/bin/backup-veles-auto.sh
    
    print_success "Мониторинг настроен"
}

# Вывод информации о доступе
show_access_info() {
    print_success "=== VELES AUTO УСПЕШНО РАЗВЕРНУТ! ==="
    echo
    print_info "Доступ к приложению:"
    echo "  🌐 Frontend: http://localhost:3000"
    echo "  🔧 Backend API: http://localhost:8000"
    echo "  👨‍💼 Admin Panel: http://localhost:8000/admin/"
    echo "  📊 Grafana: http://localhost:3001"
    echo "  📈 Prometheus: http://localhost:9090"
    echo "  🚨 AlertManager: http://localhost:9093"
    echo
    print_info "Полезные команды:"
    echo "  📋 Статус: docker-compose ps"
    echo "  📝 Логи: docker-compose logs -f"
    echo "  🔄 Перезапуск: docker-compose restart"
    echo "  🛑 Остановка: docker-compose down"
    echo "  💾 Бэкап: /usr/local/bin/backup-veles-auto.sh"
    echo
    print_warning "Не забудьте отредактировать файл .env!"
}

# Главная функция
main() {
    echo "🚀 VELES AUTO - Автоматическое развертывание на VPS"
    echo "=================================================="
    echo
    
    check_root
    check_os
    
    # Установка компонентов
    install_docker
    install_docker_compose
    install_tools
    
    # Настройка
    setup_env
    setup_nginx
    setup_firewall
    
    # Запуск приложения
    start_application
    init_database
    create_superuser
    setup_monitoring
    
    # Результат
    show_access_info
    
    print_success "Развертывание завершено успешно! 🎉"
}

# Запуск скрипта
main "$@" 