# 🚗 VELES AUTO - Современная платформа для автомобильного бизнеса

[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

VELES AUTO - это комплексная веб-платформа для покупки, продажи и обслуживания автомобилей с современным дизайном в стиле Apple и мощной ERP системой.

## ✨ Основные возможности

### 🏢 Основные модули
- **Автомобили**: Каталог с детальной информацией, фильтрами и поиском
- **Компании**: Управление автосалонами и сервисными центрами
- **Пользователи**: Система регистрации, профили и роли

### 💼 ERP система
- **Продажи**: Управление продажами, комиссии, аналитика
- **Сервис**: Заказы на обслуживание, услуги, планирование
- **Финансы**: Доходы, расходы, отчетность, прибыль
- **Проекты**: Trello-like доски задач, метки, комментарии
- **Инвентарь**: Управление складом, остатки, стоимость

### 📊 Отчетность и аналитика
- **Расширенные отчеты**: Продажи, сервис, финансы, инвентарь
- **Дашборды**: Интерактивные графики и метрики
- **Экспорт**: PDF, Excel, JSON форматы
- **Уведомления**: Автоматические алерты и уведомления

### 🤖 Telegram интеграция
- **Бот**: Уведомления, команды, быстрые отчеты
- **Mini App**: Мобильное приложение в Telegram
- **Уведомления**: Реальные уведомления о событиях

### 🎨 Современный интерфейс
- **Material-UI**: Красивые компоненты в стиле Google
- **Адаптивный дизайн**: Работает на всех устройствах
- **Темная тема**: Поддержка темной и светлой темы
- **Анимации**: Плавные переходы и эффекты

## 🚀 Быстрый старт

### С Docker (рекомендуется)

```bash
# Клонирование репозитория
git clone https://github.com/your-username/veles-drive.git
cd veles-drive

# Настройка переменных окружения
cp env.example .env
# Отредактируйте .env файл

# Запуск
docker-compose up -d

# Инициализация
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py load_demo_data
docker-compose exec backend python manage.py createsuperuser
```

### Локальная разработка

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm start
```

## 📁 Структура проекта

```
veles-drive/
├── backend/                 # Django backend
│   ├── cars/               # Модуль автомобилей
│   ├── companies/          # Модуль компаний
│   ├── users/              # Модуль пользователей
│   ├── erp/                # ERP система
│   ├── telegram_bot/       # Telegram Bot
│   ├── universal_admin/    # Универсальная админка
│   └── config/             # Настройки Django
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API сервисы
│   │   └── store/          # Redux store
├── docker/                 # Docker конфигурация
└── scripts/                # Скрипты развертывания
```

## 🛠️ Технологический стек

### Backend
- **Django 4.2+** - Веб-фреймворк
- **Django REST Framework** - API
- **PostgreSQL** - База данных
- **Redis** - Кэширование и сессии
- **Celery** - Фоновые задачи
- **MinIO** - Хранение файлов

### Frontend
- **React 18+** - UI библиотека
- **TypeScript** - Типизация
- **Material-UI** - Компоненты
- **Redux Toolkit** - Управление состоянием
- **Recharts** - Графики и диаграммы

### Инфраструктура
- **Docker** - Контейнеризация
- **Nginx** - Веб-сервер
- **Prometheus** - Мониторинг
- **Grafana** - Дашборды
- **AlertManager** - Уведомления

## 📚 Документация

- [Полная документация](DOCUMENTATION.md)
- [API документация](docs/api.md)
- [Руководство по развертыванию](docs/deployment.md)
- [Руководство разработчика](docs/development.md)

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
python manage.py test

# Frontend тесты
cd frontend
npm test

# E2E тесты
npm run test:e2e
```

## 🚀 Развертывание

### Продакшн

```bash
# Автоматическое развертывание
chmod +x scripts/deploy_production.sh
./scripts/deploy_production.sh
```

### Мониторинг

- **Prometheus**: Метрики системы и приложения
- **Grafana**: Дашборды и визуализация
- **AlertManager**: Уведомления о проблемах

## 📊 Демо данные

Проект включает демо данные для тестирования:

- 50+ автомобилей различных марок
- 10+ компаний (автосалоны и сервисы)
- 100+ пользователей
- Примеры продаж, заказов и задач

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для подробностей.

## 📞 Поддержка

- **Email**: support@veles-drive.ru
- **Telegram**: @veles_auto_support
- **Документация**: https://docs.veles-drive.ru
- **Issues**: [GitHub Issues](https://github.com/your-username/veles-drive/issues)

## 🎯 Roadmap

### Версия 2.0 (Q2 2024)
- [ ] Мобильное приложение (React Native)
- [ ] ИИ для анализа данных
- [ ] Интеграция с CRM системами
- [ ] Расширенная аналитика

### Версия 2.1 (Q3 2024)
- [ ] Мультиязычность
- [ ] Интеграция с платежными системами
- [ ] Система лояльности
- [ ] API для партнеров

### Версия 2.2 (Q4 2024)
- [ ] Блокчейн интеграция
- [ ] AR/VR для осмотра автомобилей
- [ ] Автоматические аукционы
- [ ] Система рейтингов

## 🙏 Благодарности

- [Django](https://www.djangoproject.com/) - За отличный веб-фреймворк
- [React](https://reactjs.org/) - За современную UI библиотеку
- [Material-UI](https://mui.com/) - За красивые компоненты
- [Docker](https://www.docker.com/) - За контейнеризацию

---

**VELES AUTO** - Современная платформа для автомобильного бизнеса 🚗

*Сделано с ❤️ командой VELES AUTO* 