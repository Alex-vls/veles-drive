# 🚗 Veles Drive - Kubernetes Deployment

## 📋 Обзор

Veles Drive - это современная платформа для покупки, продажи и обслуживания автомобилей с Apple-inspired дизайном. Проект развернут в Kubernetes кластере v1.28.15.

## 🏗️ Архитектура

### Компоненты
- **Frontend**: React приложение (nginx:alpine, порт 80)
- **Backend**: Django API (nginx:alpine + Gunicorn, порт 80)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Ingress**: Nginx Ingress Controller
- **SSL**: Cert-Manager с Let's Encrypt

### Домены
- `veles-drive.ru` - основной сайт
- `www.veles-drive.ru` - www версия
- `api.veles-drive.ru` - API

## 🚀 Быстрый старт

### 1. Подготовка образов

```bash
# Сборка и загрузка образов в Docker Hub
./scripts/build-and-push-images.sh
```

### 2. Развертывание в Kubernetes

```bash
# Развертывание всех компонентов
./scripts/deploy-to-k8s.sh
```

### 3. Мониторинг

```bash
# Проверка статуса развертывания
./scripts/k8s-monitoring.sh
```

## 📁 Структура манифестов

```
k8s-manifests/veles-drive/
├── 01-namespace.yaml           # Namespace
├── 02-configmap.yaml          # Конфигурация
├── 03-secret.yaml             # Секреты
├── 04-postgres-pvc.yaml       # PVC для PostgreSQL
├── 05-redis-pvc.yaml          # PVC для Redis
├── 06-static-pvc.yaml         # PVC для статических файлов
├── 07-media-pvc.yaml          # PVC для медиа файлов
├── 08-postgres-deployment.yaml # PostgreSQL Deployment
├── 09-postgres-service.yaml   # PostgreSQL Service
├── 10-redis-deployment.yaml   # Redis Deployment
├── 11-redis-service.yaml      # Redis Service
├── 12-backend-deployment.yaml # Backend Deployment
├── 13-backend-service.yaml    # Backend Service
├── 14-frontend-deployment.yaml # Frontend Deployment
├── 15-frontend-service.yaml   # Frontend Service
├── 16-ingress.yaml            # Ingress
└── 17-init-db-job.yaml        # Инициализация БД
```

## ⚙️ Конфигурация

### Переменные окружения

Основные переменные настраиваются в `02-configmap.yaml`:
- `DJANGO_SETTINGS_MODULE`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `DATABASE_URL`
- `REDIS_URL`

### Секреты

Чувствительные данные в `03-secret.yaml`:
- `SECRET_KEY`
- `POSTGRES_PASSWORD`
- `TELEGRAM_BOT_TOKEN`
- `SENTRY_DSN`

## 🔧 Управление

### Проверка статуса

```bash
# Статус подов
kubectl get pods -n veles-drive

# Статус сервисов
kubectl get services -n veles-drive

# Статус Ingress
kubectl get ingress -n veles-drive
```

### Логи

```bash
# Логи Backend
kubectl logs -n veles-drive -l app=veles-drive-backend

# Логи Frontend
kubectl logs -n veles-drive -l app=veles-drive-frontend

# Логи PostgreSQL
kubectl logs -n veles-drive -l app=veles-drive-postgres
```

### Масштабирование

```bash
# Масштабирование Backend
kubectl scale deployment veles-drive-backend -n veles-drive --replicas=3

# Масштабирование Frontend
kubectl scale deployment veles-drive-frontend -n veles-drive --replicas=3
```

### Обновление

```bash
# Обновление Backend
kubectl set image deployment/veles-drive-backend backend=alsx12/veles-drive-backend:latest -n veles-drive

# Обновление Frontend
kubectl set image deployment/veles-drive-frontend frontend=alsx12/veles-drive-frontend:latest -n veles-drive
```

## 🗄️ База данных

### Миграции

Миграции выполняются автоматически при запуске Job `veles-drive-init-db`.

### Ручное выполнение миграций

```bash
# Подключение к Backend поду
kubectl exec -it -n veles-drive deployment/veles-drive-backend -- python manage.py migrate

# Создание суперпользователя
kubectl exec -it -n veles-drive deployment/veles-drive-backend -- python manage.py createsuperuser
```

### Бэкап

```bash
# Создание бэкапа
kubectl exec -n veles-drive deployment/veles-drive-postgres -- pg_dump -U veles_user veles_auto > backup.sql

# Восстановление
kubectl exec -i -n veles-drive deployment/veles-drive-postgres -- psql -U veles_user veles_auto < backup.sql
```

## 🔒 Безопасность

### SSL сертификаты

Автоматически управляются Cert-Manager с Let's Encrypt.

### Проверка сертификатов

```bash
# Статус сертификатов
kubectl get certificates -n veles-drive

# Детали сертификата
kubectl describe certificate veles-drive-tls -n veles-drive
```

## 📊 Мониторинг

### Метрики

Приложение предоставляет health check endpoints:
- Frontend: `https://veles-drive.ru/health`
- Backend: `https://api.veles-drive.ru/health/`

### Логирование

Логи доступны через kubectl:
```bash
kubectl logs -n veles-drive -l app=veles-drive-backend --tail=100 -f
```

## 🚨 Устранение неполадок

### Проблемы с развертыванием

1. Проверьте статус подов:
```bash
kubectl get pods -n veles-drive
```

2. Проверьте события:
```bash
kubectl get events -n veles-drive --sort-by='.lastTimestamp'
```

3. Проверьте логи:
```bash
kubectl logs -n veles-drive -l app=veles-drive-backend
```

### Проблемы с базой данных

1. Проверьте статус PostgreSQL:
```bash
kubectl get pods -n veles-drive -l app=veles-drive-postgres
```

2. Проверьте логи PostgreSQL:
```bash
kubectl logs -n veles-drive -l app=veles-drive-postgres
```

### Проблемы с SSL

1. Проверьте статус сертификатов:
```bash
kubectl get certificates -n veles-drive
```

2. Проверьте DNS настройки:
```bash
dig veles-drive.ru A
dig api.veles-drive.ru A
```

## 📞 Поддержка

- **Email**: support@veles-drive.ru
- **Telegram**: @veles_drive_support
- **Документация**: https://docs.veles-drive.ru

## 📝 Лицензия

MIT License - см. файл LICENSE в корне проекта.
