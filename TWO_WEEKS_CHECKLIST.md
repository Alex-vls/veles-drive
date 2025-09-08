# VELES EMPIRE — ЧЕКЛИСТ НА 2 НЕДЕЛИ

## Обзор

Данный документ содержит детальные чеклисты для запуска ключевых проектов экосистемы VELES EMPIRE в течение 2 недель.

## Неделя 1: Инфраструктура и безопасность

### День 1-2: Безопасность серверов

#### Критические задачи безопасности
- [ ] **Смена всех паролей** на всех 41 сервере
  - [ ] SmartApe серверы (23 шт.)
  - [ ] THE.Hosting серверы (18 шт.)
  - [ ] Документирование новых паролей в безопасном месте

- [ ] **Настройка SSH ключей**
  ```bash
  # Генерация SSH ключей
  ssh-keygen -t ed25519 -C "veles-empire@veles-empire.com"
  
  # Копирование ключей на все серверы
  for server in $(cat servers.txt); do
    ssh-copy-id -i ~/.ssh/id_ed25519.pub root@$server
  done
  ```

- [ ] **Отключение root SSH**
  ```bash
  # На всех серверах
  sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
  sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
  systemctl restart sshd
  ```

- [ ] **Установка базовой безопасности**
  ```bash
  # UFW firewall
  apt update && apt install -y ufw
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow ssh
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  
  # Fail2ban
  apt install -y fail2ban
  systemctl enable fail2ban
  systemctl start fail2ban
  
  # Auditd
  apt install -y auditd
  systemctl enable auditd
  systemctl start auditd
  ```

#### Мониторинг безопасности
- [ ] Настройка алертов на подозрительную активность
- [ ] Настройка логирования всех действий
- [ ] Создание дашборда безопасности в Grafana

### День 3-4: Kubernetes кластер

#### Настройка master nodes
- [ ] **k8s-master-1.veles-empire.com** (103.35.188.181)
  ```bash
  # Установка Docker
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  
  # Установка Kubernetes
  apt-get update && apt-get install -y apt-transport-https ca-certificates curl
  curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
  echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" > /etc/apt/sources.list.d/kubernetes.list
  apt-get update && apt-get install -y kubelet kubeadm kubectl
  ```

- [ ] **k8s-master-2.veles-empire.com** (45.14.247.8)
- [ ] **k8s-master-3.veles-empire.com** (45.82.252.244)

#### Инициализация кластера
- [ ] Инициализация первого master
  ```bash
  kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=103.35.188.181
  ```

- [ ] Присоединение остальных master nodes
- [ ] Настройка worker nodes из резервных серверов

#### Сетевые политики
- [ ] Установка Cilium
  ```bash
  helm repo add cilium https://helm.cilium.io/
  helm install cilium cilium/cilium --namespace kube-system --set kubeProxyReplacement=strict
  ```

- [ ] Настройка базовых network policies
- [ ] Тестирование сетевой изоляции

### День 5-7: Инфраструктурные сервисы

#### Мониторинг (monitor.veles-empire.com)
- [ ] **Prometheus + Grafana**
  ```bash
  # Установка через Helm
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --create-namespace
  ```

- [ ] Настройка дашбордов
  - [ ] System metrics (CPU, Memory, Disk)
  - [ ] Application metrics
  - [ ] Business metrics
  - [ ] Security alerts

#### Логирование (logs.veles-empire.com)
- [ ] **Loki + Promtail**
  ```bash
  helm repo add grafana https://grafana.github.io/helm-charts
  helm install loki grafana/loki --namespace logging --create-namespace
  helm install promtail grafana/promtail --namespace logging
  ```

- [ ] Настройка централизованного логирования
- [ ] Создание дашбордов для логов

#### Container Registry (registry.veles-empire.com)
- [ ] **Harbor Registry**
  ```bash
  # Установка Harbor
  helm repo add harbor https://helm.goharbor.io
  helm install harbor harbor/harbor \
    --namespace harbor \
    --create-namespace \
    --set harborAdminPassword=admin123
  ```

- [ ] Настройка SSL сертификатов
- [ ] Настройка подписи образов (Cosign)
- [ ] Интеграция с CI/CD

#### Бэкапы
- [ ] **backup-eu.com** (45.87.153.226)
  - [ ] Настройка автоматических бэкапов
  - [ ] Тестирование восстановления
  - [ ] Мониторинг бэкапов

- [ ] **backup-eu2.com** (92.61.70.119)
  - [ ] Резервное копирование
  - [ ] Географическое распределение

## Неделя 2: Запуск новых проектов

### День 8-10: Arcadia ID MVP

#### Деплой OIDC провайдера
- [ ] **Keycloak установка**
  ```bash
  helm repo add codecentric https://codecentric.github.io/helm-charts
  helm install keycloak codecentric/keycloak \
    --namespace arcadia-id \
    --create-namespace \
    --set keycloak.adminPassword=admin123
  ```

- [ ] Настройка OIDC конфигурации
  - [ ] Issuer: https://id.veles-empire.com
  - [ ] Authorization endpoint
  - [ ] Token endpoint
  - [ ] Userinfo endpoint

#### DID resolver
- [ ] Разработка DID resolver сервиса
  ```rust
  // Пример структуры
  pub struct DidResolver {
      blockchain_client: ArcadiaClient,
      cache: RedisCache,
  }
  
  impl DidResolver {
      pub async fn resolve(&self, did: &str) -> Result<DidDocument> {
          // Логика резолва DID
      }
  }
  ```

- [ ] Интеграция с блокчейном Arcadia
- [ ] Кэширование DID документов

#### Интеграция с кошельком
- [ ] Разработка wallet connector
- [ ] Поддержка подписи сообщений
- [ ] Верификация подписей

#### Базовые тесты
- [ ] Unit тесты для DID resolver
- [ ] Integration тесты для OIDC
- [ ] E2E тесты для wallet login

### День 11-12: Arcadia Pay v0.1

#### Деплой контракта инвойсов
- [ ] **Smart Contract разработка**
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.0;
  
  contract InvoiceContract {
      struct Invoice {
          string invoiceId;
          address payer;
          uint256 amount;
          string description;
          InvoiceStatus status;
          uint256 createdAt;
          uint256 expiresAt;
      }
      
      enum InvoiceStatus { Pending, Paid, Expired, Cancelled }
      
      mapping(string => Invoice) public invoices;
      
      function createInvoice(
          string memory invoiceId,
          uint256 amount,
          string memory description,
          uint256 expiresAt
      ) external returns (bool) {
          // Логика создания инвойса
      }
      
      function payInvoice(string memory invoiceId) external payable {
          // Логика оплаты
      }
  }
  ```

- [ ] Деплой в testnet
- [ ] Аудит безопасности
- [ ] Деплой в mainnet

#### Создание базового виджета
- [ ] **Web Component разработка**
  ```typescript
  class ArcadiaPayWidget extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({ mode: 'open' });
      }
      
      connectedCallback() {
          this.render();
          this.setupEventListeners();
      }
      
      async createInvoice(amount: string, description: string) {
          // Логика создания инвойса
      }
  }
  
  customElements.define('arcadia-pay', ArcadiaPayWidget);
  ```

- [ ] Интеграция с контрактом
- [ ] UI/UX дизайн
- [ ] Тестирование в браузерах

#### Настройка webhook системы
- [ ] **Webhook сервис**
  ```typescript
  interface WebhookService {
      registerWebhook(url: string, events: string[]): Promise<void>;
      sendWebhook(event: string, payload: any): Promise<void>;
      verifySignature(payload: string, signature: string): boolean;
  }
  ```

- [ ] HMAC подписи
- [ ] Retry логика
- [ ] Мониторинг доставки

#### Демо-приложение
- [ ] Next.js приложение
- [ ] Интеграция виджета
- [ ] Тестирование полного flow

### День 13-14: Arcadia Forge MVP

#### Деплой Forgejo на k8s
- [ ] **Helm chart для Forgejo**
  ```yaml
  # values.yaml
  replicaCount: 3
  
  image:
    repository: registry.veles-empire.com/forgejo
    tag: latest
  
  ingress:
    enabled: true
    hosts:
      - host: forge.veles-empire.com
        paths:
          - path: /
            pathType: Prefix
  
  env:
    - name: FORGEJO__database__DB_TYPE
      value: postgres
    - name: FORGEJO__database__HOST
      value: postgres:5432
  ```

- [ ] Настройка PostgreSQL
- [ ] Настройка Redis
- [ ] SSL сертификаты

#### Настройка SSO через Arcadia ID
- [ ] **OIDC интеграция**
  ```yaml
  # Forgejo OIDC конфигурация
  FORGEJO__oauth2__ENABLED: true
  FORGEJO__oauth2__PROVIDER: oidc
  FORGEJO__oauth2__CLIENT_ID: forge
  FORGEJO__oauth2__CLIENT_SECRET: your_secret
  FORGEJO__oauth2__OPENID_CONNECT_AUTO_DISCOVERY: true
  FORGEJO__oauth2__OPENID_CONNECT_SCOPES: openid profile email
  ```

- [ ] Настройка OIDC провайдера
- [ ] Тестирование SSO
- [ ] Автоматическое создание пользователей

#### Создание шаблонов репозиториев
- [ ] **Базовые шаблоны**
  - [ ] Rust проект
  - [ ] TypeScript проект
  - [ ] Python проект
  - [ ] Unity проект

- [ ] CI/CD конфигурации
- [ ] Документация шаблонов

#### Настройка CI/CD раннеров
- [ ] **Actions runners**
  ```yaml
  # runner-config.yaml
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: forgejo-runner-config
  data:
    config.yaml: |
      listen: :3000
      log:
        level: debug
      runners:
        - name: "k8s-runner"
          token: "your_token"
          labels: ["ubuntu-latest", "self-hosted"]
  ```

- [ ] Kubernetes runner
- [ ] Docker runner
- [ ] Тестирование CI/CD

## Приоритетные задачи

### Критически важные (должны быть выполнены)
1. **Безопасность серверов** - защита всей инфраструктуры
2. **Arcadia ID MVP** - основа для всех остальных сервисов
3. **Kubernetes кластер** - платформа для деплоя
4. **Мониторинг и логирование** - observability

### Важные (желательно выполнить)
1. **Arcadia Pay v0.1** - для монетизации
2. **Arcadia Forge MVP** - для сообщества разработчиков
3. **Container Registry** - для CI/CD
4. **Бэкапы** - для безопасности данных

### Опциональные (если останется время)
1. **Расширенная безопасность** - дополнительные меры
2. **Дополнительные дашборды** - расширенная аналитика
3. **Автоматизация** - скрипты для повторяющихся задач

## Метрики успеха

### Количественные метрики
- [ ] 100% серверов защищены (SSH ключи, UFW, Fail2ban)
- [ ] Kubernetes кластер работает стабильно (uptime > 99%)
- [ ] Arcadia ID MVP запущен и протестирован
- [ ] Arcadia Pay v0.1 интегрирован в 1-2 проекта
- [ ] Arcadia Forge MVP доступен для разработчиков

### Качественные метрики
- [ ] Все критические уязвимости безопасности устранены
- [ ] Инфраструктура готова к масштабированию
- [ ] Разработчики могут начать работу с новыми сервисами
- [ ] Документация актуальна и полна

## Риски и митигация

### Технические риски
- **Сложность настройки Kubernetes** → Использование готовых Helm charts
- **Проблемы с безопасностью** → Поэтапное тестирование
- **Интеграционные проблемы** → Модульный подход

### Временные риски
- **Нехватка времени** → Приоритизация критических задач
- **Зависимости между проектами** → Параллельная разработка
- **Тестирование** → Автоматизированные тесты

### Ресурсные риски
- **Нехватка разработчиков** → Фокус на MVP
- **Сложность инфраструктуры** → Использование managed сервисов
- **Бюджет** → Оптимизация ресурсов

## Следующие шаги (после 2 недель)

### Неделя 3-4
- [ ] Arcadia Mesh MVP
- [ ] Arcadia Grants MVP
- [ ] Arcadia Names MVP
- [ ] Games Economy спецификация

### Неделя 5-6
- [ ] Интеграция всех сервисов
- [ ] Расширенное тестирование
- [ ] Оптимизация производительности
- [ ] Подготовка к production

---

**Дата создания**: 19 августа 2025  
**Версия**: 1.0  
**Ответственный**: VELES EMPIRE Team
