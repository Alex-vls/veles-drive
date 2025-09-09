# 🚗 VELES AUTO - Техническое задание на Frontend

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Технические требования](#технические-требования)
3. [Архитектура фронтенда](#архитектура-фронтенда)
4. [Основные модули](#основные-модули)
5. [ERP система](#erp-система)
6. [Админ-панель](#админ-панель)
7. [UI/UX требования](#uiux-требования)
8. [API интеграция](#api-интеграция)
9. [Безопасность](#безопасность)
10. [Тестирование](#тестирование)

---

## 🎯 Обзор проекта

**VELES AUTO** - современная веб-платформа для автомобильного бизнеса с дизайном в стиле Apple. 

### Цель проекта
Создать интуитивно понятный и функциональный фронтенд для комплексной системы управления автомобильным бизнесом.

### Ключевые характеристики
- 🎨 Современный дизайн в стиле Apple
- 📱 Полная адаптивность (desktop, tablet, mobile)
- ⚡ Высокая производительность
- 🔒 Безопасность данных
- 🌐 Многоязычность (RU/EN)

---

## 🛠️ Технические требования

### Основной стек
```json
{
  "framework": "React 18+",
  "language": "TypeScript 5.0+",
  "ui_library": "Material-UI (MUI) v5+",
  "state_management": "Redux Toolkit + RTK Query",
  "routing": "React Router v6+",
  "forms": "React Hook Form + Yup validation",
  "charts": "Recharts / Chart.js",
  "styling": "Emotion (styled-components)",
  "build_tool": "Vite",
  "package_manager": "npm/yarn"
}
```

### Дополнительные библиотеки
```json
{
  "date_handling": "dayjs",
  "drag_and_drop": "@dnd-kit/core (для Trello)",
  "notifications": "react-toastify",
  "icons": "@mui/icons-material + Heroicons",
  "rich_text": "@mui/x-data-grid (таблицы)",
  "file_upload": "react-dropzone",
  "animations": "framer-motion",
  "pdf_generation": "@react-pdf/renderer"
}
```

### Требования к браузерам
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🏗️ Архитектура фронтенда

### Структура проекта
```
src/
├── components/           # Переиспользуемые компоненты
│   ├── common/          # Общие компоненты
│   ├── forms/           # Формы
│   └── charts/          # Графики и диаграммы
├── pages/               # Страницы приложения
│   ├── auth/           # Аутентификация
│   ├── dashboard/      # Главная панель
│   ├── cars/           # Модуль автомобилей
│   ├── companies/      # Модуль компаний
│   ├── erp/            # ERP система
│   └── admin/          # Админ-панель
├── layouts/            # Макеты страниц
├── store/              # Redux store
│   ├── api/            # RTK Query API
│   ├── slices/         # Redux slices
│   └── middleware/     # Middleware
├── services/           # Сервисы и утилиты
├── hooks/              # Кастомные хуки
├── utils/              # Утилиты
├── types/              # TypeScript типы
├── constants/          # Константы
└── assets/             # Статические файлы
```

### State Management
```typescript
// Redux Store Structure
interface RootState {
  auth: AuthState;
  cars: CarsState;
  companies: CompaniesState;
  erp: ERPState;
  ui: UIState;
  notifications: NotificationsState;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
}

interface ERPState {
  sales: Sale[];
  inventory: InventoryItem[];
  services: Service[];
  projects: {
    boards: ProjectBoard[];
    tasks: Task[];
    columns: Column[];
  };
  reports: Report[];
}
```

---

## 🎨 UI/UX требования

### Дизайн-система
- **Цветовая палитра**: Нейтральная с акцентами (в стиле Apple)
- **Типографика**: San Francisco / Inter font family
- **Иконки**: Outline style, консистентный набор
- **Анимации**: Плавные переходы (200-300ms)
- **Shadows**: Мягкие тени для глубины

### Адаптивность
```css
/* Breakpoints */
mobile: 0-768px
tablet: 768-1024px  
desktop: 1024px+

/* Layout principles */
- Mobile-first подход
- Flexible grid system
- Touch-friendly элементы (44px min)
- Readable typography scales
```

### Темы
- 🌞 **Light theme** (по умолчанию)
- 🌙 **Dark theme** (переключение в настройках)

---

## 🚗 Основные модули

### 1. Система аутентификации
```typescript
// Страницы авторизации
pages/auth/
├── LoginPage.tsx           # Вход в систему
├── RegisterPage.tsx        # Регистрация
├── ForgotPasswordPage.tsx  # Восстановление пароля
├── ResetPasswordPage.tsx   # Сброс пароля
└── ProfilePage.tsx         # Профиль пользователя

// Функционал
- JWT аутентификация
- Социальные логины (VK, Google, Telegram)
- Двухфакторная аутентификация
- Управление профилем
- История активности
```

### 2. Модуль автомобилей (Cars)
```typescript
pages/cars/
├── CarsListPage.tsx        # Каталог транспорта
├── CarDetailPage.tsx       # Детали автомобиля
├── CarCreatePage.tsx       # Добавление транспорта
├── CarEditPage.tsx         # Редактирование
└── CarComparisonPage.tsx   # Сравнение автомобилей

// Компоненты
components/cars/
├── CarCard.tsx             # Карточка автомобиля
├── CarFilters.tsx          # Фильтры поиска
├── CarImageGallery.tsx     # Галерея изображений
├── CarSpecifications.tsx   # Характеристики
└── CarPriceCalculator.tsx  # Калькулятор цены

// Функционал
- Расширенные фильтры (тип, марка, год, цена)
- Поиск по всем параметрам
- Галерея изображений с zoom
- Сравнение автомобилей
- Избранное и история просмотров
- Поддержка всех типов транспорта:
  * Автомобили (седан, хэтчбек, SUV, etc.)
  * Мотоциклы
  * Лодки/Яхты
  * Воздушные суда
  * Спецтехника
```

### 3. Модуль компаний (Companies)
```typescript
pages/companies/
├── CompaniesListPage.tsx   # Список компаний
├── CompanyDetailPage.tsx   # Детали компании
├── CompanyCreatePage.tsx   # Создание компании
└── CompanyEditPage.tsx     # Редактирование

// Функционал
- Каталог автосалонов и сервисных центров
- Рейтинги и отзывы
- Расписание работы
- Контактная информация
- Галерея изображений
- Геолокация и карты
```

---

## 💼 ERP система

### 1. Dashboard (Главная панель)
```typescript
pages/erp/DashboardPage.tsx

// Компоненты дашборда
components/erp/dashboard/
├── MetricsCards.tsx        # Карточки метрик
├── SalesChart.tsx          # График продаж
├── RecentActivity.tsx      # Последняя активность
├── TasksSummary.tsx        # Сводка задач
├── FinancialOverview.tsx   # Финансовый обзор
└── InventoryStatus.tsx     # Статус склада

// Метрики
- Общая выручка за период
- Количество продаж
- Активные задачи
- Остатки на складе
- Просроченные задачи
- Топ автомобили по продажам
```

### 2. Управление продажами
```typescript
pages/erp/sales/
├── SalesListPage.tsx       # Список продаж
├── SaleDetailPage.tsx      # Детали продажи
├── SaleCreatePage.tsx      # Новая продажа
└── SalesReportPage.tsx     # Отчет по продажам

// Функционал
- CRUD операции с продажами
- Расчет комиссий
- История продаж клиента
- Аналитика по продавцам
- Экспорт отчетов (PDF, Excel)
```

### 3. Сервисное обслуживание
```typescript
pages/erp/service/
├── ServicesListPage.tsx    # Каталог услуг
├── ServiceOrdersPage.tsx   # Заказы на обслуживание
├── ServiceCreatePage.tsx   # Новая услуга
└── ServiceReportPage.tsx   # Отчет по сервису

// Функционал
- Управление услугами
- Заказы на обслуживание
- Планировщик работ (календарь)
- Отслеживание статусов
- Уведомления клиентов
```

### 4. Финансовый модуль
```typescript
pages/erp/finance/
├── FinanceOverviewPage.tsx # Финансовый обзор
├── TransactionsPage.tsx    # Список операций
├── ReportsPage.tsx         # Финансовые отчеты
└── BudgetPage.tsx          # Бюджет и планирование

// Функционал
- Учет доходов и расходов
- Категоризация операций
- Финансовая отчетность
- Графики прибыли/убытков
- Прогнозирование
- Экспорт в различные форматы
```

### 5. Управление складом
```typescript
pages/erp/inventory/
├── InventoryListPage.tsx   # Список товаров
├── InventoryDetailPage.tsx # Детали позиции
├── StockMovementPage.tsx   # Движение товаров
└── InventoryReportPage.tsx # Отчет по складу

// Функционал
- Управление остатками
- Движение товаров
- Расчет маржинальности
- Уведомления о низких остатках
- ABC-анализ товаров
```

### 6. 📋 Trello-подобная система проектов

```typescript
pages/erp/projects/
├── ProjectBoardsPage.tsx   # Список досок
├── ProjectBoardPage.tsx    # Доска задач (Trello-like)
├── ProjectTaskPage.tsx     # Детали задачи
└── ProjectReportsPage.tsx  # Отчеты по проектам

// Основные компоненты
components/erp/projects/
├── ProjectBoard.tsx        # Главный компонент доски
├── ProjectColumn.tsx       # Колонка задач
├── TaskCard.tsx           # Карточка задачи
├── TaskModal.tsx          # Модалка задачи
├── TaskComments.tsx       # Комментарии
├── TaskAttachments.tsx    # Вложения
├── TaskLabels.tsx         # Метки
└── TaskHistory.tsx        # История изменений

// Функциональность Trello-системы
interface ProjectBoard {
  id: string;
  name: string;
  description: string;
  company: Company;
  boardType: 'sales' | 'service' | 'inventory' | 'general';
  color: string;
  columns: ProjectColumn[];
  labels: TaskLabel[];
  members: User[];
  isArchived: boolean;
}

interface ProjectColumn {
  id: string;
  name: string;
  order: number;
  color: string;
  tasks: ProjectTask[];
  wipLimit?: number; // Work In Progress limit
}

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  assignee?: User;
  labels: TaskLabel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  
  // Связи с ERP
  relatedSale?: Sale;
  relatedServiceOrder?: ServiceOrder;
  relatedCar?: Car;
  relatedCustomer?: User;
  
  // Дополнительные данные
  comments: TaskComment[];
  attachments: TaskAttachment[];
  history: TaskHistory[];
  
  // UI состояния
  order: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Фичи Trello-системы:
1. Drag & Drop задач между колонками
2. Создание/редактирование/удаление:
   - Досок проектов
   - Колонок
   - Задач
3. Система меток с цветами
4. Назначение исполнителей
5. Комментарии к задачам
6. Вложения файлов
7. История изменений
8. Дедлайны и уведомления
9. Поиск и фильтрация
10. Связь с ERP объектами (продажи, сервис, автомобили)

// Типы досок по умолчанию:
- Продажи (Sales) - задачи по продажам
- Сервис (Service) - задачи по обслуживанию  
- Склад (Inventory) - задачи по складу
- Общие (General) - универсальные задачи

// UI особенности:
- Полноэкранный режим доски
- Боковая панель с фильтрами
- Быстрые действия (хоткеи)
- Bulk операции (массовые действия)
- Экспорт досок
- Шаблоны досок
```

---

## 🔧 Админ-панель

### Структура админки
```typescript
pages/admin/
├── AdminDashboardPage.tsx  # Админ дашборд
├── UsersManagementPage.tsx # Управление пользователями
├── CompaniesManagementPage.tsx # Управление компаниями
├── CarsManagementPage.tsx  # Управление автомобилями
├── SystemSettingsPage.tsx  # Системные настройки
├── ReportsPage.tsx         # Системные отчеты
├── LogsPage.tsx           # Логи системы
└── BackupPage.tsx         # Резервное копирование

// Функционал админки
1. Управление пользователями:
   - CRUD операции
   - Роли и разрешения
   - Блокировка/разблокировка
   - История активности
   - Массовые операции

2. Управление компаниями:
   - Модерация новых компаний
   - Верификация компаний
   - Управление подписками
   - Статистика по компаниям

3. Управление контентом:
   - Модерация автомобилей
   - Управление брендами и моделями
   - Системы категорий
   - SEO настройки

4. Системные настройки:
   - Конфигурация приложения
   - Email настройки
   - Настройки уведомлений
   - Настройки безопасности

5. Аналитика и отчеты:
   - Системные метрики
   - Отчеты использования
   - Финансовые отчеты
   - Экспорт данных

6. Системное администрирование:
   - Логи приложения
   - Мониторинг производительности
   - Резервное копирование
   - Управление кэшем
```

---

## 🔌 API интеграция

### RTK Query настройка
```typescript
// store/api/baseApi.ts
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Car', 'Company', 'User', 'Sale', 'Task', 'Report'],
  endpoints: () => ({}),
});

// Примеры API слайсов
// store/api/carsApi.ts
export const carsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCars: builder.query<CarsResponse, CarsFilters>({
      query: (filters) => ({ url: 'cars/', params: filters }),
      providesTags: ['Car'],
    }),
    getCarById: builder.query<Car, string>({
      query: (id) => `cars/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Car', id }],
    }),
    createCar: builder.mutation<Car, CreateCarRequest>({
      query: (car) => ({
        url: 'cars/',
        method: 'POST',
        body: car,
      }),
      invalidatesTags: ['Car'],
    }),
    // ... другие endpoints
  }),
});
```

### API Endpoints покрытие
```typescript
// Полное покрытие backend API
interface APIEndpoints {
  // Аутентификация
  '/auth/login/': 'POST';
  '/auth/register/': 'POST';
  '/auth/refresh/': 'POST';
  '/auth/logout/': 'POST';
  
  // Автомобили
  '/cars/': 'GET | POST';
  '/cars/{id}/': 'GET | PUT | DELETE';
  '/cars/brands/': 'GET | POST';
  '/cars/models/': 'GET | POST';
  
  // Компании  
  '/companies/': 'GET | POST';
  '/companies/{id}/': 'GET | PUT | DELETE';
  '/companies/{id}/reviews/': 'GET | POST';
  
  // ERP система
  '/erp/sales/': 'GET | POST';
  '/erp/inventory/': 'GET | POST';
  '/erp/services/': 'GET | POST';
  '/erp/projects/boards/': 'GET | POST';
  '/erp/projects/tasks/': 'GET | POST';
  '/erp/reports/dashboard/': 'GET';
  '/erp/reports/sales/': 'GET';
  
  // Дополнительные системы
  '/cars/auctions/': 'GET | POST';
  '/cars/leasing/': 'GET | POST';
  '/cars/insurance/': 'GET | POST';
  
  // Админка
  '/admin/users/': 'GET | POST';
  '/admin/system/': 'GET';
  '/admin/logs/': 'GET';
}
```

---

## 🎯 Особенности реализации

### 1. Производительность
```typescript
// Оптимизации
- React.memo для компонентов
- useMemo/useCallback для тяжелых вычислений
- Lazy loading страниц и компонентов
- Виртуализация больших списков
- Оптимизация изображений
- Кэширование API запросов (RTK Query)
- Debounce для поисковых запросов
```

### 2. Пользовательский опыт
```typescript
// UX улучшения
- Loading states для всех асинхронных операций
- Error boundaries с красивой обработкой ошибок
- Toast уведомления для действий пользователя
- Skeleton loaders
- Infinite scroll для длинных списков
- Оптимистичные обновления
- Offline support (частично)
```

### 3. Адаптивность
```typescript
// Responsive компоненты
- Адаптивные таблицы (collapse на мобиле)
- Мобильные меню (drawer)
- Touch-friendly элементы
- Адаптивная типографика
- Flexible layouts
```

---

## 🔒 Безопасность

### Клиентская безопасность
```typescript
// Меры безопасности
- XSS защита (DOMPurify для пользовательского контента)
- CSRF защита
- Валидация всех форм (client + server)
- Безопасное хранение токенов
- Права доступа на уровне роутинга
- Content Security Policy headers
```

### Управление разрешениями
```typescript
// Компонент для проверки разрешений
<PermissionGuard permission="sales.create">
  <CreateSaleButton />
</PermissionGuard>

// Хук для проверки разрешений
const canCreateSale = usePermission('sales.create');
```

---

## 🧪 Тестирование

### Тестовое покрытие
```json
{
  "unit_tests": "Jest + React Testing Library",
  "integration_tests": "MSW для API мocking",
  "e2e_tests": "Cypress/Playwright",
  "coverage_target": "80%+"
}
```

### Тестовая стратегия
```typescript
// Типы тестов
1. Unit тесты:
   - Компоненты
   - Хуки
   - Утилиты
   - Redux slices

2. Integration тесты:
   - API взаимодействие
   - Формы с валидацией
   - Routing

3. E2E тесты:
   - Критические пользовательские сценарии
   - Процессы авторизации
   - CRUD операции
```

---

## 📊 Мониторинг и аналитика

### Error tracking
```typescript
// Sentry интеграция
import * as Sentry from "@sentry/react";

// Обертка для отслеживания ошибок
const withSentryProfiling = Sentry.withProfiler(Component);
```

### Аналитика использования
```typescript
// События для аналитики
interface AnalyticsEvents {
  'car_viewed': { carId: string };
  'sale_created': { saleId: string, amount: number };
  'task_moved': { taskId: string, fromColumn: string, toColumn: string };
  'report_generated': { reportType: string };
}
```

---

## 🚀 Развертывание

### Build конфигурация
```json
{
  "development": {
    "build_tool": "Vite dev server",
    "hot_reload": true,
    "source_maps": true
  },
  "production": {
    "build_tool": "Vite build",
    "minification": true,
    "tree_shaking": true,
    "code_splitting": true,
    "asset_optimization": true
  }
}
```

### Docker конфигурация
```dockerfile
# Multi-stage build для оптимизации размера
FROM node:18-alpine as build
# ... build steps

FROM nginx:alpine
# ... production config
```

---

## 📝 Дополнительные требования

### 1. Интернационализация
```typescript
// i18n настройка
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
return <button>{t('buttons.save')}</button>;

// Поддерживаемые языки: RU, EN
```

### 2. PWA возможности
```typescript
// Progressive Web App
- Service Worker
- Offline caching
- Push notifications
- Add to homescreen
```

### 3. Accessibility (A11y)
```typescript
// Доступность
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management
```

---

## ⏰ Временные рамки

### Фазы разработки
```
Фаза 1 (4-6 недель): Основная структура + Авторизация
- Настройка проекта и инфраструктуры
- Система аутентификации
- Базовая навигация и лейауты
- Основные компоненты UI kit

Фаза 2 (6-8 недель): Основные модули
- Модуль автомобилей (каталог, детали, фильтры)
- Модуль компаний
- Базовый дашборд
- Мобильная адаптация

Фаза 3 (8-10 недель): ERP система
- Управление продажами
- Сервисное обслуживание  
- Финансовый модуль
- Управление складом

Фаза 4 (4-6 недель): Trello-система проектов
- Доски проектов
- Drag & Drop функционал
- Задачи, комментарии, вложения
- Интеграция с ERP модулями

Фаза 5 (4-6 недель): Админ-панель
- Управление пользователями
- Системные настройки
- Отчеты и аналитика
- Логи и мониторинг

Фаза 6 (2-4 недели): Финализация
- Оптимизация производительности
- Тестирование и баг-фиксы
- Документация
- Развертывание
```

### Общий срок: 28-40 недель (7-10 месяцев)

---

## 🎯 Критерии успеха

### Технические критерии
- ✅ Полное покрытие всех API endpoints
- ✅ Адаптивность на всех устройствах
- ✅ Время загрузки страниц < 3 сек
- ✅ Покрытие тестами > 80%
- ✅ Соответствие дизайн-системе

### Функциональные критерии
- ✅ Полнофункциональная ERP система
- ✅ Рабочая Trello-система проектов  
- ✅ Комплексная админ-панель
- ✅ Система отчетов и аналитики
- ✅ Интеграция с Telegram Bot

### Пользовательские критерии
- ✅ Интуитивный интерфейс
- ✅ Быстрая работа системы
- ✅ Стабильность работы
- ✅ Удобство использования на мобильных устройствах

---

## 📞 Техническая поддержка

При возникновении вопросов по техническим деталям реализации обращайтесь к:
- Backend API документации
- Дизайн-системе проекта  
- Техническому архитектору проекта

---

**VELES AUTO Frontend** - Современный, функциональный и красивый интерфейс для комплексной системы управления автомобильным бизнесом! 🚗✨