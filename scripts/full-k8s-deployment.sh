#!/bin/bash

# 🚗 Полный скрипт развертывания Veles Drive в Kubernetes

set -e

echo "🚀 VELES DRIVE - Полное развертывание в Kubernetes"
echo "=================================================="

# Проверка зависимостей
echo "🔍 Проверка зависимостей..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

# Проверка kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl не установлен"
    exit 1
fi

# Проверка подключения к кластеру
echo "🔗 Проверка подключения к Kubernetes кластеру..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Не удается подключиться к Kubernetes кластеру"
    exit 1
fi

echo "✅ Все зависимости проверены"

# Шаг 1: Сборка и загрузка образов
echo ""
echo "📦 Шаг 1: Сборка и загрузка Docker образов"
echo "------------------------------------------"

# Проверка авторизации в Docker Hub
echo "🔐 Проверка авторизации в Docker Hub..."
if ! docker info &> /dev/null; then
    echo "❌ Не удается подключиться к Docker daemon"
    exit 1
fi

# Сборка образов
echo "🔨 Сборка образов..."
./scripts/build-and-push-images.sh

echo "✅ Образы загружены в Docker Hub"

# Шаг 2: Развертывание в Kubernetes
echo ""
echo "🚀 Шаг 2: Развертывание в Kubernetes"
echo "-----------------------------------"

# Развертывание приложения
echo "📋 Применение манифестов..."
./scripts/deploy-to-k8s.sh

echo "✅ Приложение развернуто в Kubernetes"

# Шаг 3: Проверка развертывания
echo ""
echo "🔍 Шаг 3: Проверка развертывания"
echo "-------------------------------"

# Ждем немного для стабилизации
echo "⏳ Ожидание стабилизации развертывания..."
sleep 30

# Проверка статуса
echo "📊 Проверка статуса развертывания..."
./scripts/k8s-monitoring.sh

# Шаг 4: Проверка доступности
echo ""
echo "🌍 Шаг 4: Проверка доступности"
echo "-----------------------------"

echo "🔗 Проверка Frontend..."
if curl -I -k https://veles-drive.ru 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✅ Frontend доступен"
else
    echo "⚠️ Frontend пока недоступен (возможно, DNS еще не обновился)"
fi

echo "🔗 Проверка API..."
if curl -I -k https://api.veles-drive.ru 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✅ API доступен"
else
    echo "⚠️ API пока недоступен (возможно, DNS еще не обновился)"
fi

# Шаг 5: Финальная информация
echo ""
echo "🎉 Шаг 5: Развертывание завершено!"
echo "================================="

echo "📋 Информация о развертывании:"
echo "   - Namespace: veles-drive"
echo "   - Домены: veles-drive.ru, api.veles-drive.ru"
echo "   - SSL: Автоматически через Cert-Manager"
echo "   - Мониторинг: Kubernetes встроенный"

echo ""
echo "🔧 Полезные команды:"
echo "   # Статус подов"
echo "   kubectl get pods -n veles-drive"
echo ""
echo "   # Логи Backend"
echo "   kubectl logs -n veles-drive -l app=veles-drive-backend"
echo ""
echo "   # Логи Frontend"
echo "   kubectl logs -n veles-drive -l app=veles-drive-frontend"
echo ""
echo "   # Мониторинг"
echo "   ./scripts/k8s-monitoring.sh"
echo ""
echo "   # Масштабирование Backend"
echo "   kubectl scale deployment veles-drive-backend -n veles-drive --replicas=3"
echo ""
echo "   # Обновление образа"
echo "   kubectl set image deployment/veles-drive-backend backend=alsx12/veles-drive-backend:latest -n veles-drive"

echo ""
echo "🌐 Приложение будет доступно по адресам:"
echo "   - https://veles-drive.ru"
echo "   - https://www.veles-drive.ru"
echo "   - https://api.veles-drive.ru"

echo ""
echo "⚠️ Важно:"
echo "   - Убедитесь, что DNS записи настроены и указывают на сервер"
echo "   - SSL сертификаты будут получены автоматически"
echo "   - Первый запуск может занять несколько минут"

echo ""
echo "✅ VELES DRIVE успешно развернут в Kubernetes!"
echo "🚀 Готов к использованию!"
