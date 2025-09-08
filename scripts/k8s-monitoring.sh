#!/bin/bash

# Скрипт для мониторинга и диагностики Veles Drive в Kubernetes

NAMESPACE="veles-drive"

echo "🔍 Мониторинг Veles Drive в Kubernetes"
echo "======================================"

# Статус всех подов
echo "📊 Статус подов:"
kubectl get pods -n ${NAMESPACE} -o wide

echo ""

# Статус сервисов
echo "🔗 Статус сервисов:"
kubectl get services -n ${NAMESPACE}

echo ""

# Статус Ingress
echo "🌐 Статус Ingress:"
kubectl get ingress -n ${NAMESPACE}

echo ""

# Статус сертификатов
echo "🔒 Статус сертификатов:"
kubectl get certificates -n ${NAMESPACE} 2>/dev/null || echo "Cert-manager не установлен"

echo ""

# Использование ресурсов
echo "💾 Использование ресурсов:"
kubectl top pods -n ${NAMESPACE} 2>/dev/null || echo "Metrics server не установлен"

echo ""

# Логи последних событий
echo "📝 Последние события:"
kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp' | tail -10

echo ""

# Проверка готовности endpoints
echo "🔗 Проверка endpoints:"
kubectl get endpoints -n ${NAMESPACE}

echo ""

# Проверка PersistentVolumeClaims
echo "💾 Статус PersistentVolumeClaims:"
kubectl get pvc -n ${NAMESPACE}

echo ""

# Проверка доступности приложений
echo "🌍 Проверка доступности приложений:"

# Проверка Frontend
echo "Frontend (veles-drive.ru):"
curl -I -k https://veles-drive.ru 2>/dev/null | head -1 || echo "❌ Недоступен"

# Проверка API
echo "API (api.veles-drive.ru):"
curl -I -k https://api.veles-drive.ru 2>/dev/null | head -1 || echo "❌ Недоступен"

echo ""

# Проверка DNS
echo "🌐 Проверка DNS:"
echo "veles-drive.ru:"
dig veles-drive.ru A +short 2>/dev/null || echo "❌ DNS не настроен"

echo "api.veles-drive.ru:"
dig api.veles-drive.ru A +short 2>/dev/null || echo "❌ DNS не настроен"

echo ""

echo "✅ Мониторинг завершен!"
