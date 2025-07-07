# 🚀 Развертывание VELES AUTO на VPS

## 📋 Текущее состояние проекта

### ✅ Что работает:
- **Frontend**: React + TypeScript + Material-UI (Apple-style дизайн)
- **Backend**: Django + Django REST Framework
- **Database**: PostgreSQL
- **Monitoring**: Prometheus + Grafana + AlertManager
- **Cache**: Redis
- **Containerization**: Docker + Docker Compose
- **Test Data**: Полные тестовые данные для всех сущностей

### 🎨 Дизайн:
- Современный Apple-style интерфейс
- Адаптивная верстка
- Плавные анимации и переходы
- Оптимизированная типографика

## 🖥️ Требования к VPS

### Минимальные требования:
- **CPU**: 2 ядра
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+

### Рекомендуемые требования:
- **CPU**: 4 ядра
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

## 📦 Подготовка VPS

### 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Docker и Docker Compose
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезагрузка для применения изменений
sudo reboot
```

### 3. Установка дополнительных инструментов
```bash
sudo apt install -y git curl wget htop nginx certbot python3-certbot-nginx
```

## 🚀 Развертывание

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/veles-auto.git
cd veles-auto
```

### 2. Настройка переменных окружения
```bash
# Создание .env файла
cp .env.example .env

# Редактирование .env файла
nano .env
```

#### Основные переменные для продакшена:
```env
# Django
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
POSTGRES_DB=veles_auto
POSTGRES_USER=veles_user
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_PASSWORD=your-redis-password

# Monitoring
GRAFANA_ADMIN_PASSWORD=your-grafana-password
```

### 3. Настройка домена и SSL
```bash
# Настройка Nginx
sudo nano /etc/nginx/sites-available/veles-auto
```

#### Конфигурация Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/veles-auto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 4. Запуск приложения
```bash
# Сборка и запуск контейнеров
docker-compose up -d --build

# Проверка статуса
docker-compose ps
```

### 5. Инициализация базы данных
```bash
# Создание миграций
docker-compose exec backend python manage.py makemigrations

# Применение миграций
docker-compose exec backend python manage.py migrate

# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Сборка статических файлов
docker-compose exec backend python manage.py collectstatic --noinput
```

## 🔧 Настройка мониторинга

### 1. Доступ к Grafana
- URL: `https://your-domain.com:3001`
- Логин: `admin`
- Пароль: из переменной `GRAFANA_ADMIN_PASSWORD`

### 2. Настройка дашбордов
```bash
# Импорт дашбордов (если есть)
# Скопировать JSON файлы дашбордов в Grafana
```

### 3. Настройка алертов
- Prometheus: `https://your-domain.com:9090`
- AlertManager: `https://your-domain.com:9093`

## 🔒 Безопасность

### 1. Настройка файрвола
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001  # Grafana
sudo ufw enable
```

### 2. Регулярные обновления
```bash
# Создание скрипта для автоматических обновлений
sudo nano /usr/local/bin/update-veles-auto.sh
```

```bash
#!/bin/bash
cd /path/to/veles-auto
git pull
docker-compose down
docker-compose up -d --build
docker system prune -f
```

```bash
sudo chmod +x /usr/local/bin/update-veles-auto.sh

# Добавление в cron для еженедельных обновлений
sudo crontab -e
# Добавить строку: 0 2 * * 0 /usr/local/bin/update-veles-auto.sh
```

## 📊 Мониторинг и логи

### Просмотр логов:
```bash
# Все контейнеры
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Мониторинг ресурсов:
```bash
# Использование ресурсов
docker stats

# Дисковое пространство
df -h

# Использование памяти
free -h
```

## 🔄 Резервное копирование

### 1. База данных
```bash
# Создание скрипта бэкапа
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose exec -T db pg_dump -U veles_user veles_auto > $BACKUP_DIR/backup_$DATE.sql

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### 2. Файлы приложения
```bash
# Бэкап конфигурации
tar -czf /backups/config_$(date +%Y%m%d).tar.gz .env docker-compose.yml
```

## 🚨 Устранение неполадок

### Частые проблемы:

#### 1. Контейнеры не запускаются
```bash
# Проверка логов
docker-compose logs

# Пересборка образов
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 2. Проблемы с базой данных
```bash
# Проверка подключения
docker-compose exec db psql -U veles_user -d veles_auto

# Сброс базы данных (осторожно!)
docker-compose down
docker volume rm veles-auto_postgres_data
docker-compose up -d
```

#### 3. Проблемы с SSL
```bash
# Обновление сертификатов
sudo certbot renew

# Проверка конфигурации Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## 📈 Масштабирование

### Горизонтальное масштабирование:
```bash
# Увеличение количества экземпляров backend
docker-compose up -d --scale backend=3
```

### Вертикальное масштабирование:
- Увеличение ресурсов VPS
- Настройка лимитов в docker-compose.yml

## 📞 Поддержка

### Полезные команды:
```bash
# Перезапуск всех сервисов
docker-compose restart

# Обновление только frontend
docker-compose up -d --build frontend

# Просмотр использования ресурсов
docker system df

# Очистка неиспользуемых ресурсов
docker system prune -a
```

### Контакты:
- Документация: [GitHub Wiki]
- Issues: [GitHub Issues]
- Поддержка: [Email/Telegram]

---

## ✅ Чек-лист развертывания

- [ ] VPS настроен и обновлен
- [ ] Docker и Docker Compose установлены
- [ ] Домен настроен и SSL получен
- [ ] Переменные окружения настроены
- [ ] Контейнеры запущены
- [ ] База данных инициализирована
- [ ] Суперпользователь создан
- [ ] Мониторинг настроен
- [ ] Бэкапы настроены
- [ ] Файрвол настроен
- [ ] Тестирование завершено

**🎉 Поздравляем! VELES AUTO успешно развернут на VPS!** 