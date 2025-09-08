#!/bin/bash

# Скрипт для развертывания Veles Drive в Kubernetes

set -e

NAMESPACE="veles-drive"
MANIFESTS_DIR="k8s-manifests/veles-drive"

echo "🚀 Начинаем развертывание Veles Drive в Kubernetes..."

# Проверяем подключение к кластеру
echo "🔍 Проверяем подключение к Kubernetes кластеру..."
kubectl cluster-info

# Создаем namespace если не существует
echo "📁 Создаем namespace ${NAMESPACE}..."
kubectl apply -f ${MANIFESTS_DIR}/01-namespace.yaml

# Применяем конфигурацию
echo "⚙️ Применяем конфигурацию..."
kubectl apply -f ${MANIFESTS_DIR}/02-configmap.yaml
kubectl apply -f ${MANIFESTS_DIR}/03-secret.yaml

# Создаем PersistentVolumeClaims
echo "💾 Создаем PersistentVolumeClaims..."
kubectl apply -f ${MANIFESTS_DIR}/04-postgres-pvc.yaml
kubectl apply -f ${MANIFESTS_DIR}/05-redis-pvc.yaml
kubectl apply -f ${MANIFESTS_DIR}/06-static-pvc.yaml
kubectl apply -f ${MANIFESTS_DIR}/07-media-pvc.yaml

# Развертываем базу данных
echo "🗄️ Развертываем PostgreSQL..."
kubectl apply -f ${MANIFESTS_DIR}/08-postgres-deployment.yaml
kubectl apply -f ${MANIFESTS_DIR}/09-postgres-service.yaml

# Развертываем Redis
echo "🔴 Развертываем Redis..."
kubectl apply -f ${MANIFESTS_DIR}/10-redis-deployment.yaml
kubectl apply -f ${MANIFESTS_DIR}/11-redis-service.yaml

# Ждем готовности базы данных
echo "⏳ Ждем готовности базы данных..."
kubectl wait --for=condition=ready pod -l app=veles-drive-postgres -n ${NAMESPACE} --timeout=300s

# Инициализируем базу данных
echo "🔧 Инициализируем базу данных..."
kubectl apply -f ${MANIFESTS_DIR}/17-init-db-job.yaml

# Ждем завершения инициализации
echo "⏳ Ждем завершения инициализации базы данных..."
kubectl wait --for=condition=complete job/veles-drive-init-db -n ${NAMESPACE} --timeout=600s

# Развертываем Backend
echo "🔧 Развертываем Backend..."
kubectl apply -f ${MANIFESTS_DIR}/12-backend-deployment.yaml
kubectl apply -f ${MANIFESTS_DIR}/13-backend-service.yaml

# Развертываем Frontend
echo "🎨 Развертываем Frontend..."
kubectl apply -f ${MANIFESTS_DIR}/14-frontend-deployment.yaml
kubectl apply -f ${MANIFESTS_DIR}/15-frontend-service.yaml

# Ждем готовности приложений
echo "⏳ Ждем готовности приложений..."
kubectl wait --for=condition=ready pod -l app=veles-drive-backend -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=ready pod -l app=veles-drive-frontend -n ${NAMESPACE} --timeout=300s

# Применяем Ingress
echo "🌐 Настраиваем Ingress..."
kubectl apply -f ${MANIFESTS_DIR}/16-ingress.yaml

echo "✅ Развертывание завершено!"
echo "📊 Статус развертывания:"
kubectl get pods -n ${NAMESPACE}
kubectl get services -n ${NAMESPACE}
kubectl get ingress -n ${NAMESPACE}

echo "🌍 Приложение доступно по адресам:"
echo "   - https://veles-drive.ru"
echo "   - https://www.veles-drive.ru"
echo "   - https://api.veles-drive.ru"
