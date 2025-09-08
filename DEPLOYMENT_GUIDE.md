# Руководство по развертыванию VELES AUTO

## Требования

### Системные требования
- Ubuntu 20.04+ или CentOS 8+
- Docker 20.10+
- Docker Compose 2.0+
- Минимум 4GB RAM
- Минимум 50GB свободного места
- Домен и DNS настройки

### Домены
- `veles-drive.ru` - основной сайт
- `api.veles-drive.ru` - API
- `tg.veles-drive.ru` - Telegram Mini App
- `admin.veles-drive.ru` - админка

## Подготовка сервера

### 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Docker
```bash
# Удаление старых версий
sudo apt remove docker docker-engine docker.io containerd runc

# Установка зависимостей
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Добавление GPG ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
```

### 3. Установка дополнительных инструментов
```bash
sudo apt install git nginx certbot python3-certbot-nginx htop
```

## Клонирование проекта

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/veles-drive.git
cd veles-drive
```

### 2. Настройка переменных окружения
```bash
cp env.example .env
nano .env
```

**Содержимое .env:**
```bash
# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=veles-drive.ru,api.veles-drive.ru,tg.veles-drive.ru,admin.veles-drive.ru

# База данных
DATABASE_URL=postgresql://veles_user:veles_password@postgres:5432/veles_db

# Redis
REDIS_URL=redis://redis:6379/0

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHANNEL_ID=@your-channel
TELEGRAM_CHANNEL_USERNAME=@your-channel

# MinIO
MINIO_ROOT_USER=veles_minio_user
MINIO_ROOT_PASSWORD=veles_minio_password_2024

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Мониторинг
PROMETHEUS_PASSWORD=veles_prometheus_2024
GRAFANA_PASSWORD=veles_grafana_2024
```

### 3. Генерация секретного ключа
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Настройка DNS

### 1. Настройка A записей
```
veles-drive.ru     A    YOUR_SERVER_IP
api.veles-drive.ru A    YOUR_SERVER_IP
tg.veles-drive.ru  A    YOUR_SERVER_IP
admin.veles-drive.ru A  YOUR_SERVER_IP
```

### 2. Настройка CNAME записей
```
www.veles-drive.ru CNAME veles-drive.ru
```

## Развертывание

### 1. Сборка и запуск контейнеров
```bash
# Сборка образов
docker-compose build

# Запуск контейнеров
docker-compose up -d

# Проверка статуса
docker-compose ps
```

### 2. Выполнение миграций
```bash
# Создание миграций
docker-compose exec backend python manage.py makemigrations

# Применение миграций
docker-compose exec backend python manage.py migrate

# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser
```

### 3. Сборка статических файлов
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

### 4. Загрузка демо данных (опционально)
```bash
docker-compose exec backend python manage.py load_demo_data
```

## Настройка SSL сертификатов

### 1. Получение сертификатов Let's Encrypt
```bash
# Остановка nginx контейнера
docker-compose stop nginx

# Получение сертификатов
sudo certbot certonly --standalone \
  -d veles-drive.ru \
  -d www.veles-drive.ru \
  -d api.veles-drive.ru \
  -d tg.veles-drive.ru \
  -d admin.veles-drive.ru \
  --email admin@veles-drive.ru \
  --agree-tos \
  --no-eff-email

# Запуск nginx контейнера
docker-compose start nginx
```

### 2. Настройка автоматического обновления
```bash
# Создание скрипта обновления
sudo nano /etc/cron.d/ssl-renewal

# Содержимое скрипта
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx
```

## Настройка мониторинга

### 1. Настройка Prometheus
```bash
# Проверка конфигурации
docker-compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

### 2. Настройка Grafana
- Откройте http://your-server-ip:3003
- Логин: `admin`
- Пароль: `veles_grafana_2024`
- Настройте источники данных и дашборды

### 3. Настройка AlertManager
```bash
# Проверка конфигурации
docker-compose exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
```

## Настройка резервного копирования

### 1. Создание скрипта бэкапа
```bash
nano scripts/backup.sh
```

**Содержимое скрипта:**
```bash
#!/bin/bash

# Настройки
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="veles_postgres"
MINIO_CONTAINER="veles_minio"

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

# Бэкап базы данных
docker-compose exec -T $DB_CONTAINER pg_dump -U veles_user veles_db > $BACKUP_DIR/db_backup_$DATE.sql

# Бэкап файлов MinIO
docker-compose exec -T $MINIO_CONTAINER mc mirror /data $BACKUP_DIR/minio_backup_$DATE

# Сжатие бэкапов
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/db_backup_$DATE.sql $BACKUP_DIR/minio_backup_$DATE

# Удаление временных файлов
rm -rf $BACKUP_DIR/db_backup_$DATE.sql $BACKUP_DIR/minio_backup_$DATE

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### 2. Настройка автоматического бэкапа
```bash
chmod +x scripts/backup.sh

# Добавление в cron
crontab -e

# Добавить строку для ежедневного бэкапа в 2:00
0 2 * * * /path/to/veles-drive/scripts/backup.sh
```

## Настройка Telegram Bot

### 1. Создание бота
- Обратитесь к @BotFather в Telegram
- Создайте нового бота
- Получите токен

### 2. Настройка вебхука
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.veles-drive.ru/api/telegram/webhook/"}'
```

### 3. Настройка Mini App
- В BotFather настройте команды для Mini App
- Укажите URL: `https://tg.veles-drive.ru`

## Проверка работоспособности

### 1. Проверка основных сервисов
```bash
# Проверка веб-сайта
curl -I https://veles-drive.ru

# Проверка API
curl -I https://api.veles-drive.ru/api/health/

# Проверка Telegram Mini App
curl -I https://tg.veles-drive.ru

# Проверка админки
curl -I https://admin.veles-drive.ru
```

### 2. Проверка логов
```bash
# Логи backend
docker-compose logs backend

# Логи frontend
docker-compose logs frontend

# Логи nginx
docker-compose logs nginx
```

### 3. Проверка мониторинга
```bash
# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3003/api/health
```

## Обновление системы

### 1. Обновление кода
```bash
# Остановка сервисов
docker-compose down

# Обновление кода
git pull origin main

# Пересборка образов
docker-compose build

# Запуск сервисов
docker-compose up -d

# Применение миграций
docker-compose exec backend python manage.py migrate

# Сборка статических файлов
docker-compose exec backend python manage.py collectstatic --noinput
```

### 2. Откат изменений
```bash
# Остановка сервисов
docker-compose down

# Откат к предыдущей версии
git checkout HEAD~1

# Пересборка и запуск
docker-compose build
docker-compose up -d
```

## Устранение неполадок

### 1. Проблемы с базой данных
```bash
# Проверка подключения
docker-compose exec backend python manage.py dbshell

# Сброс миграций
docker-compose exec backend python manage.py migrate --fake-initial
```

### 2. Проблемы с Redis
```bash
# Проверка Redis
docker-compose exec redis redis-cli ping

# Очистка кэша
docker-compose exec backend python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

### 3. Проблемы с MinIO
```bash
# Проверка MinIO
docker-compose exec minio mc admin info local

# Создание bucket
docker-compose exec minio mc mb local/veles-auto
```

### 4. Проблемы с SSL
```bash
# Проверка сертификатов
sudo certbot certificates

# Обновление сертификатов
sudo certbot renew --dry-run
```

## Безопасность

### 1. Настройка файрвола
```bash
# Установка UFW
sudo apt install ufw

# Настройка правил
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Настройка fail2ban
```bash
# Установка fail2ban
sudo apt install fail2ban

# Настройка конфигурации
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Перезапуск
sudo systemctl restart fail2ban
```

### 3. Регулярные обновления
```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Масштабирование

### 1. Горизонтальное масштабирование
```bash
# Увеличение количества backend контейнеров
docker-compose up -d --scale backend=3

# Настройка load balancer
# Добавьте nginx upstream конфигурацию
```

### 2. Вертикальное масштабирование
```bash
# Увеличение ресурсов в docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2'
```

## Контакты и поддержка

- Email: support@veles-drive.ru
- Telegram: @veles_auto_support
- Документация: https://docs.veles-drive.ru
- GitHub Issues: https://github.com/your-username/veles-drive/issues 