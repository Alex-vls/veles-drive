# VELES EMPIRE — ЕДИНЫЕ СТАНДАРТЫ ИНТЕГРАЦИИ

## Обзор

Данный документ описывает единые стандарты интеграции для всей экосистемы VELES EMPIRE. Все проекты должны следовать этим стандартам для обеспечения совместимости и безопасности.

## Arcadia ID — Единая система идентификации

### Логин подписью кошельком

#### Стандарт аутентификации
```typescript
interface AuthRequest {
  wallet: string;           // Адрес кошелька
  nonce: string;           // Уникальный nonce
  signature: string;       // Подпись nonce
  timestamp: number;       // Unix timestamp
  domain: string;          // Домен приложения
}

interface AuthResponse {
  access_token: string;    // JWT токен
  refresh_token: string;   // Refresh токен
  expires_in: number;      // Время жизни токена
  user_id: string;         // DID пользователя
  scopes: string[];        // Разрешения
}
```

#### Процесс аутентификации
1. **Запрос nonce**: `GET /auth/nonce?wallet={address}`
2. **Подпись**: Пользователь подписывает nonce своим кошельком
3. **Верификация**: `POST /auth/verify` с подписью
4. **Получение токенов**: JWT для доступа к API

### OIDC (OpenID Connect)

#### Конфигурация провайдера
```yaml
issuer: https://id.veles-empire.com
authorization_endpoint: https://id.veles-empire.com/auth
token_endpoint: https://id.veles-empire.com/token
userinfo_endpoint: https://id.veles-empire.com/userinfo
jwks_uri: https://id.veles-empire.com/.well-known/jwks.json
```

#### Поддерживаемые flows
- **Authorization Code Flow** (рекомендуется)
- **PKCE** (Proof Key for Code Exchange)
- **Implicit Flow** (для legacy приложений)

### DID (Decentralized Identifiers)

#### Формат DID
```
did:arcadia:1:0x1234567890abcdef...
```

#### DID Document
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:arcadia:1:0x1234567890abcdef...",
  "verificationMethod": [
    {
      "id": "did:arcadia:1:0x1234567890abcdef...#keys-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:arcadia:1:0x1234567890abcdef...",
      "publicKeyHex": "02..."
    }
  ],
  "authentication": ["did:arcadia:1:0x1234567890abcdef...#keys-1"]
}
```

### VC (Verifiable Credentials)

#### Формат VC
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://veles-empire.com/credentials/v1"
  ],
  "id": "urn:uuid:12345678-1234-1234-1234-123456789012",
  "type": ["VerifiableCredential", "DeveloperCredential"],
  "issuer": "did:arcadia:1:0x1234567890abcdef...",
  "issuanceDate": "2025-08-19T10:00:00Z",
  "credentialSubject": {
    "id": "did:arcadia:1:0xabcdef1234567890...",
    "developerLevel": "senior",
    "skills": ["rust", "smart-contracts", "web3"]
  },
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2025-08-19T10:00:00Z",
    "verificationMethod": "did:arcadia:1:0x1234567890abcdef...#keys-1",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJFUzI1NksifQ..."
  }
}
```

## Arcadia Pay — Система платежей

### Инвойсы

#### Создание инвойса
```typescript
interface CreateInvoiceRequest {
  amount: string;          // Сумма в ACD (wei)
  currency: string;        // ACD
  description: string;     // Описание платежа
  metadata?: object;       // Дополнительные данные
  expires_at?: number;     // Время истечения
  webhook_url?: string;    // URL для уведомлений
}

interface InvoiceResponse {
  invoice_id: string;      // Уникальный ID инвойса
  contract_address: string; // Адрес контракта
  amount: string;          // Сумма
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  payment_url: string;     // URL для оплаты
  qr_code: string;         // QR код
}
```

#### Статусы инвойса
- `pending` — ожидает оплаты
- `paid` — оплачен
- `expired` — истёк
- `cancelled` — отменён

### Вебхуки

#### Формат webhook
```typescript
interface WebhookPayload {
  event: 'invoice.paid' | 'invoice.expired' | 'invoice.cancelled';
  invoice_id: string;
  amount: string;
  currency: string;
  timestamp: number;
  signature: string;       // HMAC подпись
  metadata?: object;
}
```

#### Верификация webhook
```typescript
function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### SDK

#### JavaScript/TypeScript
```typescript
import { ArcadiaPay } from '@veles-empire/arcadia-pay';

const pay = new ArcadiaPay({
  contractAddress: '0x...',
  rpcUrl: 'https://api.arcadia.su',
  webhookSecret: 'your_secret'
});

// Создание инвойса
const invoice = await pay.createInvoice({
  amount: '1000000000000000000', // 1 ACD
  description: 'Payment for service'
});

// Проверка статуса
const status = await pay.getInvoiceStatus(invoice.invoice_id);
```

#### Rust
```rust
use arcadia_pay::{ArcadiaPay, InvoiceRequest};

let pay = ArcadiaPay::new(
    "0x...".to_string(),
    "https://api.arcadia.su".to_string(),
    "your_secret".to_string()
);

let invoice = pay.create_invoice(InvoiceRequest {
    amount: "1000000000000000000".to_string(),
    description: "Payment for service".to_string(),
    ..Default::default()
}).await?;
```

## NFT стандарты

### ERC-721 с роялти

#### Контракт
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArcadiaNFT is ERC721, Ownable {
    struct RoyaltyInfo {
        address receiver;
        uint96 royaltyFraction;
    }
    
    mapping(uint256 => RoyaltyInfo) private _royalties;
    
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) {}
    
    function mint(
        address to,
        uint256 tokenId,
        string memory tokenURI,
        address royaltyReceiver,
        uint96 royaltyFraction
    ) external onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _royalties[tokenId] = RoyaltyInfo(royaltyReceiver, royaltyFraction);
    }
    
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external view returns (address receiver, uint256 royaltyAmount)
    {
        RoyaltyInfo memory royalty = _royalties[tokenId];
        receiver = royalty.receiver;
        royaltyAmount = (salePrice * royalty.royaltyFraction) / _feeDenominator();
    }
}
```

### Метаданные

#### Стандарт метаданных
```json
{
  "name": "Arcadia Developer Badge",
  "description": "Proof of contribution to Arcadia ecosystem",
  "image": "https://ipfs.io/ipfs/Qm...",
  "attributes": [
    {
      "trait_type": "Developer Level",
      "value": "Senior"
    },
    {
      "trait_type": "Contributions",
      "value": 42
    },
    {
      "trait_type": "Skills",
      "value": ["Rust", "Smart Contracts", "Web3"]
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "https://ipfs.io/ipfs/Qm...",
        "type": "image/png"
      }
    ],
    "category": "image",
    "royalty_percentage": 10
  }
}
```

## CI/CD стандарты

### Helm Charts

#### Структура чарта
```
chart/
├── Chart.yaml
├── values.yaml
├── values-prod.yaml
├── values-staging.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── secret.yaml
└── charts/
```

#### Пример values.yaml
```yaml
replicaCount: 3

image:
  repository: registry.veles-empire.com/arcadia-forge
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: forge.veles-empire.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi

env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: forge-secrets
        key: database-url
  - name: OIDC_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: forge-secrets
        key: oidc-client-secret
```

### Argo CD

#### Application manifest
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: arcadia-forge
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/veles-empire/arcadia-forge
    targetRevision: HEAD
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: arcadia-forge
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Container Registry

#### Подпись образов (Cosign)
```bash
# Подпись образа
cosign sign -key cosign.key registry.veles-empire.com/arcadia-forge:latest

# Верификация образа
cosign verify -key cosign.pub registry.veles-empire.com/arcadia-forge:latest
```

## Observability

### Prometheus метрики

#### Стандартные метрики
```go
// HTTP метрики
var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )
    
    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration in seconds",
        },
        []string{"method", "endpoint"},
    )
)
```

#### Бизнес метрики
```go
var (
    activeUsers = prometheus.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_users_total",
            Help: "Total number of active users",
        },
    )
    
    transactionsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "transactions_total",
            Help: "Total number of transactions",
        },
        []string{"type", "status"},
    )
)
```

### Grafana дашборды

#### Стандартные панели
- **System**: CPU, Memory, Disk, Network
- **Application**: Request rate, Error rate, Response time
- **Business**: User metrics, Transaction metrics
- **Security**: Failed logins, Suspicious activity

### Loki логирование

#### Формат логов
```json
{
  "timestamp": "2025-08-19T10:00:00Z",
  "level": "info",
  "service": "arcadia-forge",
  "version": "1.0.0",
  "trace_id": "12345678-1234-1234-1234-123456789012",
  "user_id": "did:arcadia:1:0x...",
  "message": "Repository created",
  "metadata": {
    "repo_name": "my-project",
    "repo_id": "12345"
  }
}
```

### Tempo трейсинг

#### OpenTelemetry интеграция
```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/trace"
)

func createRepository(ctx context.Context, name string) error {
    ctx, span := otel.Tracer("").Start(ctx, "createRepository")
    defer span.End()
    
    span.SetAttributes(
        attribute.String("repo.name", name),
        attribute.String("user.id", getUserID(ctx)),
    )
    
    // ... логика создания репозитория
    
    return nil
}
```

## Security

### Cilium Network Policies

#### Пример политики
```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: arcadia-forge-policy
  namespace: arcadia-forge
spec:
  endpointSelector:
    matchLabels:
      app: arcadia-forge
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: nginx-ingress
      toPorts:
        - ports:
            - port: "80"
              protocol: TCP
    - fromEndpoints:
        - matchLabels:
            app: arcadia-id
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
  egress:
    - toEndpoints:
        - matchLabels:
            app: postgres
      toPorts:
        - ports:
            - port: "5432"
              protocol: TCP
```

### Kyverno Policies

#### Pod Security Policy
```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: pod-security-policy
spec:
  validationFailureAction: enforce
  rules:
    - name: check-security-context
      match:
        resources:
          kinds:
            - Pod
      validate:
        message: "Security context is required"
        pattern:
          spec:
            securityContext:
              runAsNonRoot: true
              runAsUser: "1000"
```

#### Image Policy
```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: check-image-signature
spec:
  validationFailureAction: enforce
  rules:
    - name: verify-image
      match:
        resources:
          kinds:
            - Pod
      verifyImages:
        - image: "registry.veles-empire.com/*"
          key: |-
            -----BEGIN PUBLIC KEY-----
            MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
            -----END PUBLIC KEY-----
```

### mTLS

#### Istio mTLS
```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: arcadia-forge
spec:
  mtls:
    mode: STRICT
```

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: arcadia-forge-auth
  namespace: arcadia-forge
spec:
  selector:
    matchLabels:
      app: arcadia-forge
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/arcadia-id/sa/arcadia-id"]
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/api/v1/*"]
```

## Тестирование

### Unit тесты
```typescript
import { ArcadiaPay } from '@veles-empire/arcadia-pay';

describe('ArcadiaPay', () => {
  let pay: ArcadiaPay;

  beforeEach(() => {
    pay = new ArcadiaPay({
      contractAddress: '0x...',
      rpcUrl: 'https://api.arcadia.su',
      webhookSecret: 'test_secret'
    });
  });

  it('should create invoice', async () => {
    const invoice = await pay.createInvoice({
      amount: '1000000000000000000',
      description: 'Test payment'
    });

    expect(invoice.amount).toBe('1000000000000000000');
    expect(invoice.status).toBe('pending');
  });
});
```

### Integration тесты
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OIDC_CLIENT_SECRET: ${{ secrets.OIDC_CLIENT_SECRET }}
```

## Документация

### API документация
- **OpenAPI 3.0** для всех REST API
- **GraphQL schema** для GraphQL API
- **Примеры кода** на JavaScript/TypeScript, Rust, Go
- **Postman коллекции** для тестирования

### SDK документация
- **README.md** с примерами использования
- **API Reference** с полным описанием методов
- **Migration guides** для обновлений
- **Troubleshooting** для решения проблем

---

**Версия**: 1.0  
**Дата**: 19 августа 2025  
**Ответственный**: VELES EMPIRE Architecture Team
