# VELES EMPIRE — Быстрый старт для разработчиков

## 🚀 Быстрый старт

Добро пожаловать в экосистему VELES EMPIRE! Этот документ поможет вам быстро начать работу с нашими проектами.

## 📋 Что нужно знать

### Основные сервисы экосистемы
- **Arcadia ID** - единая аутентификация через подпись кошельком
- **Arcadia Pay** - система платежей в ACD токенах
- **Arcadia Names** - именные хэндлы @username.acd
- **Arcadia Forge** - Git-платформа с баунти
- **Arcadia Mesh** - гибридный мессенджер
- **Arcadia Grants** - портал грантов и баунти

### Технологический стек
- **Frontend**: React, Next.js, Flutter
- **Backend**: Node.js, Rust, Go
- **Blockchain**: Arcadia (Rust)
- **Infrastructure**: Kubernetes, Docker, Helm
- **Monitoring**: Prometheus, Grafana, Loki

## 🛠️ Настройка окружения

### 1. Установка зависимостей
```bash
# Node.js (версия 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### 2. Настройка SSH ключей
```bash
# Генерация SSH ключа
ssh-keygen -t ed25519 -C "your-email@example.com"

# Добавление в SSH агент
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 3. Настройка Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## 🔐 Аутентификация

### Получение доступа к серверам
1. Отправьте ваш публичный SSH ключ администратору
2. Получите доступ к серверам разработки
3. Настройте доступ к container registry

### Настройка Arcadia ID
```bash
# Получение client_id для вашего проекта
curl -X POST https://id.veles-empire.com/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "your-project",
    "redirect_uris": ["http://localhost:3000/callback"]
  }'
```

## 📁 Структура проектов

### Клонирование репозиториев
```bash
# Основные проекты
git clone https://github.com/veles-empire/arcadia-id.git
git clone https://github.com/veles-empire/arcadia-pay.git
git clone https://github.com/veles-empire/arcadia-forge.git

# Ваш проект
git clone https://github.com/veles-empire/your-project.git
cd your-project
```

### Переменные окружения
```bash
# Создание .env файла
cp .env.example .env

# Основные переменные
ARCADIA_ID_URL=https://id.veles-empire.com
ARCADIA_PAY_CONTRACT=0x...
ARCADIA_NAMES_RESOLVER=https://names.veles-empire.com
```

## 🏗️ Разработка

### Локальный запуск
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск тестов
npm test
```

### Интеграция с Arcadia ID
```javascript
import { ArcadiaID } from '@veles-empire/arcadia-id';

const arcadiaID = new ArcadiaID({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback'
});

// Аутентификация пользователя
const user = await arcadiaID.authenticate();
```

### Интеграция с Arcadia Pay
```javascript
import { ArcadiaPay } from '@veles-empire/arcadia-pay';

const arcadiaPay = new ArcadiaPay({
  contractAddress: '0x...',
  rpcUrl: 'https://api.arcadia.su'
});

// Создание инвойса
const invoice = await arcadiaPay.createInvoice({
  amount: '1000000000000000000', // 1 ACD
  description: 'Payment for service'
});
```

## 🚀 Деплой

### Локальное тестирование
```bash
# Сборка Docker образа
docker build -t your-project:latest .

# Запуск контейнера
docker run -p 3000:3000 your-project:latest
```

### Деплой в staging
```bash
# Логин в registry
docker login registry.veles-empire.com

# Пуш образа
docker tag your-project:latest registry.veles-empire.com/your-project:latest
docker push registry.veles-empire.com/your-project:latest

# Деплой через Helm
helm upgrade --install your-project ./helm \
  --namespace staging \
  --set image.tag=latest
```

### Деплой в production
```bash
# Только через CI/CD pipeline
git push origin main
# Автоматический деплой через Argo CD
```

## 📊 Мониторинг

### Доступ к дашбордам
- **Grafana**: https://monitor.veles-empire.com
- **Prometheus**: https://monitor.veles-empire.com/prometheus
- **Loki**: https://logs.veles-empire.com

### Полезные команды
```bash
# Проверка статуса сервисов
kubectl get pods -n your-project

# Просмотр логов
kubectl logs -f deployment/your-project -n your-project

# Проверка метрик
curl http://localhost:9090/metrics
```

## 🐛 Отладка

### Частые проблемы
1. **Ошибки аутентификации** - проверьте client_id и redirect_uri
2. **Проблемы с сетью** - убедитесь в доступности серверов
3. **Ошибки деплоя** - проверьте права доступа к registry

### Полезные команды
```bash
# Проверка подключения к серверам
ssh -T git@github.com
ssh user@server.veles-empire.com

# Проверка Docker
docker ps
docker logs container-name

# Проверка Kubernetes
kubectl cluster-info
kubectl get nodes
```

## 📚 Документация

### Основные документы
- **INTEGRATION_STANDARDS.md** - стандарты интеграции
- **TWO_WEEKS_CHECKLIST.md** - чеклист разработки
- **ECOSYSTEM_INTEGRATION.md** - интеграция с экосистемой
- **README.md** - документация проекта

### Полезные ссылки
- **GitHub**: https://github.com/veles-empire
- **Документация API**: https://api.veles-empire.com/docs
- **Slack**: #veles-empire
- **Email**: dev@veles-empire.com

## 🆘 Поддержка

### Каналы связи
- **Slack**: #general, #dev-help, #your-project
- **Email**: dev@veles-empire.com
- **Issues**: GitHub Issues в репозитории проекта

### Процесс получения помощи
1. Проверьте документацию проекта
2. Поищите в существующих Issues
3. Создайте новый Issue с подробным описанием
4. Обратитесь в Slack канал #dev-help

## 🎯 Следующие шаги

1. **Изучите документацию** вашего проекта
2. **Настройте локальное окружение**
3. **Запустите проект** в режиме разработки
4. **Изучите интеграции** с экосистемой
5. **Начните разработку** новых функций

---

**Удачи в разработке! 🚀**

**Дата создания**: 19 августа 2025  
**Версия**: 1.0  
**Для**: Разработчики VELES EMPIRE
