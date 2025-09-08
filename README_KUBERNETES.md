# 🚗 VELES DRIVE - Kubernetes Deployment

## 🎯 Обзор

Veles Drive - это современная платформа для покупки, продажи и обслуживания автомобилей с Apple-inspired дизайном. Проект полностью готов к развертыванию в Kubernetes кластере v1.28.15.

## ✅ Статус проекта

**🚀 ГОТОВ К ПРОДАКШЕНУ**

- ✅ Все компоненты стандартизированы
- ✅ Встроенные мониторинги удалены
- ✅ Kubernetes манифесты созданы
- ✅ Автоматизация настроена
- ✅ Документация готова

## 🏗️ Архитектура

### Компоненты
- **Frontend**: React + TypeScript + nginx:alpine (порт 80)
- **Backend**: Django + Gunicorn + nginx:alpine (порт 80)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Ingress**: Nginx Ingress Controller
- **SSL**: Cert-Manager + Let's Encrypt

### Домены
- `veles-drive.ru` - основной сайт
- `www.veles-drive.ru` - www версия
- `api.veles-drive.ru` - API

## 🚀 Быстрый старт

### Полное развертывание (рекомендуется)

```bash
# Один скрипт для всего
./scripts/full-k8s-deployment.sh
```

### Пошаговое развертывание

```bash
# 1. Сборка и загрузка образов
./scripts/build-and-push-images.sh

# 2. Развертывание в Kubernetes
./scripts/deploy-to-k8s.sh

# 3. Мониторинг
./scripts/k8s-monitoring.sh
```

## 📁 Структура проекта

```
veles-drive/
├── k8s-manifests/veles-drive/     # Kubernetes манифесты
│   ├── 01-namespace.yaml         # Namespace
│   ├── 02-configmap.yaml        # Конфигурация
│   ├── 03-secret.yaml           # Секреты
│   ├── 04-07-*-pvc.yaml         # PersistentVolumeClaims
│   ├── 08-11-*-deployment.yaml  # Deployments и Services
│   ├── 12-15-*-deployment.yaml  # Backend и Frontend
│   ├── 16-ingress.yaml          # Ingress
│   ├── 17-init-db-job.yaml      # Инициализация БД
│   └── README.md                # Документация
├── scripts/                      # Скрипты автоматизации
│   ├── build-and-push-images.sh # Сборка образов
│   ├── deploy-to-k8s.sh         # Развертывание
│   ├── k8s-monitoring.sh        # Мониторинг
│   └── full-k8s-deployment.sh   # Полное развертывание
├── backend/
│   ├── Dockerfile.k8s           # Backend образ для K8s
│   └── ...                      # Django код
├── frontend/
│   ├── Dockerfile.k8s           # Frontend образ для K8s
│   └── ...                      # React код
└── README_KUBERNETES.md         # Этот файл
```

## 🔧 Управление

### Проверка статуса

```bash
# Статус всех компонентов
kubectl get pods -n veles-drive

# Статус сервисов
kubectl get services -n veles-drive

# Статус Ingress
kubectl get ingress -n veles-drive

# Мониторинг
./scripts/k8s-monitoring.sh
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

### Автоматическая инициализация

База данных инициализируется автоматически при первом развертывании:
- ✅ Миграции выполняются
- ✅ Статические файлы собираются
- ✅ Суперпользователь создается

### Ручное управление

```bash
# Подключение к Backend поду
kubectl exec -it -n veles-drive deployment/veles-drive-backend -- python manage.py shell

# Выполнение миграций
kubectl exec -it -n veles-drive deployment/veles-drive-backend -- python manage.py migrate

# Создание суперпользователя
kubectl exec -it -n veles-drive deployment/veles-drive-backend -- python manage.py createsuperuser
```

### Бэкап и восстановление

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

### Health Checks

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

## 📈 Ресурсы

### Требования к кластеру

- **CPU**: 1.1 cores (requests), 2.2 cores (limits)
- **Memory**: 1.5GB (requests), 3GB (limits)
- **Storage**: 40GB (PostgreSQL + Redis + Static + Media)
- **Kubernetes**: v1.28.15+
- **NodeSelector**: node2.alx

### Компоненты

- **Namespace**: 1
- **ConfigMap**: 1
- **Secret**: 1
- **PVC**: 4
- **Deployment**: 4
- **Service**: 4
- **Ingress**: 1
- **Job**: 1

## 🌐 Доступ

После развертывания приложение будет доступно по адресам:
- **Frontend**: https://veles-drive.ru
- **API**: https://api.veles-drive.ru
- **Admin**: https://api.veles-drive.ru/admin/

## 📞 Поддержка

- **Email**: support@veles-drive.ru
- **Telegram**: @veles_drive_support
- **Документация**: https://docs.veles-drive.ru

## 📝 Лицензия

MIT License - см. файл LICENSE в корне проекта.

---

**🚀 VELES DRIVE готов к развертыванию в Kubernetes!**

Просто запустите `./scripts/full-k8s-deployment.sh` и наслаждайтесь!
