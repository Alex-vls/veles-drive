#!/bin/bash

# Скрипт для сборки и загрузки Docker образов для Veles Drive

set -e

# Конфигурация
DOCKER_USERNAME="alsx12"
PROJECT_NAME="veles-drive"
VERSION="latest"

echo "🚀 Начинаем сборку и загрузку образов для Veles Drive..."

# Сборка Backend образа
echo "📦 Собираем Backend образ..."
cd backend
docker build -f Dockerfile.k8s -t ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION} .
echo "✅ Backend образ собран"

# Сборка Frontend образа
echo "📦 Собираем Frontend образ..."
cd ../frontend
docker build -f Dockerfile.k8s -t ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION} .
echo "✅ Frontend образ собран"

# Загрузка образов в Docker Hub
echo "📤 Загружаем образы в Docker Hub..."

echo "📤 Загружаем Backend образ..."
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION}

echo "📤 Загружаем Frontend образ..."
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}

echo "✅ Все образы успешно загружены в Docker Hub!"
echo "🎉 Готово к развертыванию в Kubernetes!"
