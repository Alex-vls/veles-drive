#!/bin/bash

# Ждем запуска MinIO
echo "Waiting for MinIO to start..."
sleep 10

# Настройка MinIO Client
mc alias set myminio http://minio:9000 veles_minio_user veles_minio_password_2024

# Создание bucket'ов для разных типов файлов
echo "Creating buckets..."

# Основные bucket'ы
mc mb myminio/veles-auto-media --ignore-existing
mc mb myminio/veles-auto-uploads --ignore-existing
mc mb myminio/veles-auto-backups --ignore-existing
mc mb myminio/veles-auto-temp --ignore-existing

# Bucket'ы для разных типов контента
mc mb myminio/veles-auto-cars --ignore-existing
mc mb myminio/veles-auto-companies --ignore-existing
mc mb myminio/veles-auto-users --ignore-existing
mc mb myminio/veles-auto-news --ignore-existing
mc mb myminio/veles-auto-articles --ignore-existing

# Настройка политик доступа
echo "Setting up access policies..."

# Публичный доступ для медиа файлов
mc policy set public myminio/veles-auto-media
mc policy set public myminio/veles-auto-cars
mc policy set public myminio/veles-auto-companies
mc policy set public myminio/veles-auto-news
mc policy set public myminio/veles-auto-articles

# Приватный доступ для загрузок и бэкапов
mc policy set private myminio/veles-auto-uploads
mc policy set private myminio/veles-auto-backups
mc policy set private myminio/veles-auto-temp
mc policy set private myminio/veles-auto-users

# Настройка lifecycle политик
echo "Setting up lifecycle policies..."

# Удаление временных файлов через 7 дней
mc ilm add myminio/veles-auto-temp --expiry-days 7

# Архивирование старых бэкапов через 30 дней
mc ilm add myminio/veles-auto-backups --transition-days 30 --transition-storage-class STANDARD_IA

# Создание тестовых файлов для проверки
echo "Creating test files..."
echo "VELES AUTO MinIO Setup Complete" > /tmp/test.txt
mc cp /tmp/test.txt myminio/veles-auto-media/

echo "MinIO setup completed successfully!"
echo "Access MinIO Console at: http://localhost:9001"
echo "Username: veles_minio_user"
echo "Password: veles_minio_password_2024" 