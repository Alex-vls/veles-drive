#!/bin/bash

# Конфигурация
BACKUP_DIR="/backups"
DB_NAME="veles_auto"
DB_USER="postgres"
DB_HOST="db"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Проверяем, запущены ли контейнеры
if ! docker-compose ps | grep -q "backend.*running"; then
    echo "❌ Сервис backend не запущен. Запустите docker-compose up -d"
    exit 1
fi

# Создаем директорию для бэкапов, если она не существует
if [ ! -d "$BACKUP_DIR" ]; then
    echo "📁 Создание директории для бэкапов..."
    mkdir -p $BACKUP_DIR
fi

# Бэкап базы данных
echo "💾 Создание бэкапа базы данных..."
docker-compose exec -T db pg_dump -U $DB_USER -h $DB_HOST $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Бэкап статических файлов
echo "📦 Создание бэкапа статических файлов..."
docker-compose exec -T backend tar -czf - /app/static | gzip > $BACKUP_DIR/static_backup_$DATE.tar.gz

# Очистка старых бэкапов
echo "🧹 Очистка старых бэкапов..."
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "static_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Бэкап успешно завершен" 