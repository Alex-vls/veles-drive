# veles-drive - Интеграция с экосистемой VELES EMPIRE

## Обзор

Автоматизация, интегрированный в экосистему VELES EMPIRE. Проект использует единые стандарты аутентификации, платежей и безопасности.

## Ключевые интеграции

### Arcadia ID
- **SSO/RBAC** - единая аутентификация
- **Ролевой доступ** - admin, analyst, viewer
- **Аудит** - логирование всех действий

### Arcadia Pay
- **ACD токены** - нативная валюта
- **Smart contracts** - автоматизация платежей
- **Usage billing** - оплата по использованию
- **Webhook интеграции** - уведомления

### Arcadia Names
- **Блокчейн-домены** - децентрализованные имена
- **DNS интеграция** - с VELES DNS Intelligence
- **Верификация** - проверка подлинности

### VELES Security Suite
- **Мониторинг** - интеграция с VSS
- **Безопасность** - единые стандарты
- **Алерты** - централизованные уведомления

## Технические стандарты

### Аутентификация
```typescript
interface AuthRequest {
  wallet: string;           // Адрес кошелька
  nonce: string;           // Уникальный nonce
  signature: string;       // Подпись nonce
  timestamp: number;       // Unix timestamp
  domain: string;          // Домен приложения
}
```

### API Endpoints
```yaml
# Основные эндпоинты
api:
  - /api/v1/auth/login
  - /api/v1/auth/logout
  - /api/v1/health
  - /api/v1/metrics
```

## Конфигурация

### Переменные окружения
```bash
# Arcadia ID
ARCADIA_ID_URL=https://id.veles-empire.com
ARCADIA_ID_CLIENT_ID=veles_auto_project_client_id
ARCADIA_ID_CLIENT_SECRET=your_client_secret
ARCADIA_ID_REDIRECT_URI=https://veles-drive.veles-empire.com/callback

# Arcadia Pay
ARCADIA_PAY_URL=https://pay.veles-empire.com
ARCADIA_PAY_CONTRACT=0x...
ARCADIA_PAY_API_KEY=your_api_key

# VELES Security Suite
VSS_API_URL=https://vss.veles-empire.com
VSS_API_KEY=your_vss_api_key

# Мониторинг
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
LOKI_URL=http://loki:3100
```

### Docker конфигурация
```yaml
version: '3.8'
services:
  veles-drive:
    image: registry.veles-empire.com/veles-drive:latest
    environment:
      - ARCADIA_ID_URL=https://id.veles-empire.com
      - ARCADIA_ID_CLIENT_ID=veles_auto_project_client_id
    networks:
      - veles-empire-network
    labels:
      - "veles-empire.project=veles-drive"
      - "veles-empire.version=1.0.0"

networks:
  veles-empire-network:
    external: true
```

## Разработка

### Локальная разработка
```bash
# Клонирование репозитория
git clone https://github.com/veles-empire/veles-drive.git
cd veles-drive

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Редактирование .env с реальными значениями

# Запуск в режиме разработки
npm run dev

# Запуск тестов
npm test
```

## Развёртывание

### Kubernetes (Helm)
```bash
# Добавление репозитория
helm repo add veles-empire https://charts.veles-empire.com
helm repo update

# Установка
helm install veles-drive veles-empire/veles-drive \
  --namespace veles-drive --create-namespace \
  --set auth.oidc.clientSecret=your_real_secret

# Обновление
helm upgrade veles-drive veles-empire/veles-drive \
  --namespace veles-drive \
  --set image.tag=1.0.1
```

### Docker Compose
```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f veles-drive

# Остановка
docker-compose down
```

## Мониторинг

### Метрики Prometheus
```yaml
# Основные метрики
veles_auto_project_requests_total{method="GET",endpoint="/api/v1/health"}
veles_auto_project_response_time_seconds{quantile="0.95"}
veles_auto_project_errors_total{type="api_error"}
```

### Дашборды Grafana
- **Overview** - общий обзор сервиса
- **Performance** - производительность
- **Errors** - ошибки и исключения
- **Business** - бизнес-метрики

### Алерты
```yaml
# Критические алерты
- alert: Veles-auto-projectServiceDown
  expr: up{job="veles-drive"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Veles-auto-project недоступен"

- alert: Veles-auto-projectHighErrorRate
  expr: rate(veles_auto_project_errors_total[5m]) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Высокий процент ошибок в veles-drive"
```

## Поддержка

### Каналы связи
- **Slack**: #veles-drive
- **Email**: veles-drive@veles-empire.com
- **Issues**: https://github.com/veles-empire/veles-drive/issues
- **Documentation**: https://docs.veles-empire.com/veles-drive

### Документация
- **API Reference**: https://docs.veles-empire.com/veles-drive/api
- **User Guide**: https://docs.veles-empire.com/veles-drive/user-guide
- **Developer Guide**: https://docs.veles-empire.com/veles-drive/developer
- **Deployment Guide**: https://docs.veles-empire.com/veles-drive/deployment

## Next steps

1. **Интеграция с Arcadia ID** - настройка SSO
2. **Подключение Arcadia Pay** - интеграция платежей
3. **Настройка мониторинга** - подключение к VSS
4. **Документирование** - создание руководств
5. **Тестирование** - проверка интеграций

---

**Версия**: 1.0  
**Проект**: veles-drive  
**Дата создания**: 19 августа 2025  
**Ответственный**: VELES EMPIRE Team
