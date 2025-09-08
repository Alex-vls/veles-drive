# Техническое задание для фронтенд-разработчика
## VELES AUTO - Современная платформа для автомобильного бизнеса

---

## 📋 Общая информация

**Проект:** VELES AUTO  
**Тип:** PWA приложение с акцентом на Telegram Mini App  
**Технологии:** React 18+ + TypeScript + Material-UI  
**Целевые платформы:** Web, Telegram Mini App, PWA  
**Время разработки:** С нуля  

---

## 🎯 Цель проекта

Создать современную веб-платформу для покупки, продажи и обслуживания автомобилей с дизайном в стиле Apple, включающую:
- Агрегатор автомобилей и транспорта
- ERP систему для управления бизнесом
- Telegram Mini App интеграцию
- Универсальную админку с ролевой системой

---

## 🏗️ Архитектура системы

### Backend (готовый)
- **Django 4.2+** с Django REST Framework
- **PostgreSQL** - основная БД
- **Redis** - кэширование и сессии
- **MinIO** - файловое хранилище
- **Celery** - фоновые задачи

### Frontend (твоя задача)
- **React 18+** с TypeScript
- **Material-UI** для компонентов
- **Redux Toolkit** для состояния
- **React Router** для маршрутизации
- **PWA** функциональность
- **Telegram Mini App** интеграция

---

## 👥 Роли пользователей

### 1. Гость (неавторизованный)
- Просмотр каталога автомобилей
- Поиск и фильтрация
- Просмотр компаний
- Регистрация/авторизация

### 2. Пользователь (обычный)
- Все функции гостя
- Личный кабинет
- Избранные автомобили
- История просмотров
- Подача заявок на лизинг/страхование

### 3. Владелец компании
- Все функции пользователя
- Управление своей компанией
- Добавление автомобилей
- ERP система (базовая)

### 4. Менеджер компании
- Все функции владельца
- Расширенная ERP система
- Управление продажами
- Управление сервисом

### 5. Администратор
- Полный доступ ко всем функциям
- Универсальная админка
- Модерация контента
- Управление пользователями

---

## 🚗 Основные модули

### 1. Каталог автомобилей
**Модели данных:**
```typescript
interface Vehicle {
  id: number;
  vehicle_type: 'car' | 'motorcycle' | 'truck' | 'bus' | 'boat' | 'yacht' | 'helicopter' | 'airplane' | 'tractor' | 'special';
  brand: Brand;
  model: Model;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'gas' | 'kerosene' | 'aviation_fuel';
  transmission: 'manual' | 'automatic' | 'robot' | 'variator' | 'cvt';
  engine_volume: number;
  power: number;
  color: string;
  vin: string;
  description: string;
  is_active: boolean;
  is_available: boolean;
  company: Company;
  images: VehicleImage[];
  features: VehicleFeature[];
  created_at: string;
  updated_at: string;
}

interface Car extends Vehicle {
  body_type: 'sedan' | 'hatchback' | 'wagon' | 'suv' | 'crossover' | 'coupe' | 'convertible' | 'pickup' | 'van';
  doors: number;
  seats: number;
  trunk_volume: number;
}

interface Motorcycle extends Vehicle {
  engine_type: 'inline' | 'v_twin' | 'boxer' | 'single';
  cylinders: number;
  cooling: 'air' | 'liquid' | 'oil';
  fuel_capacity: number;
}

interface Boat extends Vehicle {
  boat_type: 'motorboat' | 'sailboat' | 'yacht' | 'catamaran' | 'jet_ski';
  length: number;
  beam: number;
  draft: number;
  capacity: number;
}

interface Aircraft extends Vehicle {
  aircraft_type: 'helicopter' | 'airplane' | 'gyrocopter' | 'drone';
  wingspan?: number;
  length: number;
  max_altitude: number;
  range: number;
  flight_hours: number;
}
```

**Функционал:**
- Каталог с фильтрацией по типу транспорта
- Детальные карточки с галереей изображений
- Поиск по марке, модели, году, цене
- Сравнение автомобилей
- Избранное
- История просмотров

### 2. Компании
**Модель данных:**
```typescript
interface Company {
  id: number;
  owner?: User;
  name: string;
  description: string;
  logo?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  is_verified: boolean;
  rating: number;
  images: CompanyImage[];
  features: CompanyFeature[];
  schedule: CompanySchedule[];
  reviews: Review[];
  vehicles_count: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}
```

**Функционал:**
- Список компаний с фильтрацией
- Детальные страницы компаний
- Отзывы и рейтинги
- Расписание работы
- Каталог автомобилей компании

### 3. ERP система
**Основные модули:**

#### 3.1 Управление инвентарем
```typescript
interface Inventory {
  id: number;
  company: Company;
  car: Car;
  quantity: number;
  cost_price: number;
  selling_price: number;
  status: 'available' | 'reserved' | 'sold' | 'maintenance' | 'damaged';
  location: string;
  notes: string;
  created_at: string;
  updated_at: string;
}
```

#### 3.2 Продажи
```typescript
interface Sale {
  id: number;
  company: Company;
  car: Car;
  customer: User;
  sale_price: number;
  commission: number;
  sale_date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes: string;
  created_at: string;
  updated_at: string;
}
```

#### 3.3 Сервисные услуги
```typescript
interface Service {
  id: number;
  company: Company;
  name: string;
  description: string;
  price: number;
  duration: number; // в минутах
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceOrder {
  id: number;
  company: Company;
  customer: User;
  car: Car;
  services: Service[];
  total_price: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  completed_date?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}
```

#### 3.4 Финансы
```typescript
interface Financial {
  id: number;
  company: Company;
  operation_type: 'income' | 'expense' | 'investment' | 'loan' | 'refund';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_by: User;
  created_at: string;
  updated_at: string;
}
```

#### 3.5 Trello-like управление проектами
```typescript
interface ProjectBoard {
  id: number;
  company: Company;
  name: string;
  description: string;
  board_type: 'sales' | 'service' | 'inventory' | 'general';
  color: string;
  is_archived: boolean;
  created_by: User;
  columns: ProjectColumn[];
  created_at: string;
  updated_at: string;
}

interface ProjectColumn {
  id: number;
  board: ProjectBoard;
  name: string;
  order: number;
  color: string;
  is_archived: boolean;
  tasks: ProjectTask[];
  created_at: string;
  updated_at: string;
}

interface ProjectTask {
  id: number;
  column: ProjectColumn;
  title: string;
  description: string;
  order: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assignee?: User;
  labels: TaskLabel[];
  related_sale?: Sale;
  related_service_order?: ServiceOrder;
  related_car?: Car;
  related_customer?: User;
  is_archived: boolean;
  created_by: User;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  history: TaskHistory[];
  created_at: string;
  updated_at: string;
}
```

### 4. Дополнительные сервисы

#### 4.1 Аукционы
```typescript
interface Auction {
  id: number;
  title: string;
  description: string;
  auction_type: 'english' | 'dutch' | 'sealed' | 'reverse';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
  vehicle: Vehicle;
  start_date: string;
  end_date: string;
  min_bid: number;
  reserve_price?: number;
  current_price: number;
  bid_increment: number;
  total_bids: number;
  is_active: boolean;
  created_by: User;
  created_at: string;
  updated_at: string;
}
```

#### 4.2 Лизинг
```typescript
interface LeasingApplication {
  id: number;
  program: LeasingProgram;
  vehicle: Vehicle;
  applicant: User;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  down_payment: number;
  term_months: number;
  monthly_payment?: number;
  total_amount?: number;
  notes: string;
  created_at: string;
  updated_at: string;
}
```

#### 4.3 Страхование
```typescript
interface InsurancePolicy {
  id: number;
  company: InsuranceCompany;
  insurance_type: InsuranceType;
  vehicle: Vehicle;
  policy_number: string;
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  premium_amount: number;
  coverage_amount: number;
  deductible: number;
  insured_person: User;
  created_at: string;
  updated_at: string;
}
```

---

## 📱 Telegram Mini App

### Функционал Mini App:
1. **Агрегатор автомобилей** - просмотр каталога
2. **Админка для компаний** - управление автомобилями
3. **ERP система** - управление продажами и проектами
4. **Уведомления** - push-уведомления о событиях

### Интеграция с Telegram:
```typescript
interface TelegramUser {
  id: number;
  telegram_id: string;
  user: User;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  is_bot: boolean;
  created_at: string;
  updated_at: string;
}

interface TelegramMiniAppSession {
  id: string;
  user: User;
  init_data: string;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}
```

---

## 🎨 Дизайн и UI/UX

### Дизайн-система:
- **Стиль:** Apple-inspired, минималистичный
- **Цветовая схема:** Современная, с акцентом на синий (#007AFF)
- **Типографика:** Системные шрифты (SF Pro, Roboto)
- **Компоненты:** Material-UI с кастомными стилями
- **Анимации:** Плавные переходы, микроанимации

### Адаптивность:
- **Desktop:** 1200px+
- **Tablet:** 768px - 1199px
- **Mobile:** 320px - 767px
- **PWA:** Поддержка установки как приложение

### Темы:
- **Светлая тема** (по умолчанию)
- **Темная тема** (переключатель)
- **Автоматическое переключение** по системным настройкам

---

## 🔧 Технические требования

### Обязательные технологии:
- **React 18+** с TypeScript
- **Material-UI v5** для компонентов
- **Redux Toolkit** для управления состоянием
- **React Router v6** для маршрутизации
- **Axios** для HTTP запросов
- **Formik + Yup** для форм и валидации
- **Date-fns** для работы с датами

### Дополнительные библиотеки:
- **React Query** для кэширования API
- **React Hook Form** для производительных форм
- **Framer Motion** для анимаций
- **React Virtual** для виртуализации списков
- **React Helmet** для SEO
- **Workbox** для PWA

### Структура проекта:
```
src/
├── components/          # Переиспользуемые компоненты
│   ├── ui/             # Базовые UI компоненты
│   ├── forms/          # Формы
│   ├── layout/         # Компоненты макета
│   └── features/       # Компоненты по функциональности
├── pages/              # Страницы приложения
├── hooks/              # Кастомные хуки
├── services/           # API сервисы
├── store/              # Redux store
├── types/              # TypeScript типы
├── utils/              # Утилиты
├── constants/          # Константы
└── styles/             # Глобальные стили
```

---

## 🌐 API интеграция

### Базовый URL:
```
https://api.veles-drive.ru
```

### Аутентификация:
```typescript
// JWT токены
interface AuthTokens {
  access: string;
  refresh: string;
}

// Заголовки
Authorization: Bearer <access_token>
```

### Основные эндпоинты:

#### Транспортные средства:
- `GET /api/vehicles/` - список транспорта
- `GET /api/vehicles/{id}/` - детали транспорта
- `POST /api/vehicles/` - создание транспорта
- `PUT /api/vehicles/{id}/` - обновление транспорта
- `DELETE /api/vehicles/{id}/` - удаление транспорта

#### Компании:
- `GET /api/companies/` - список компаний
- `GET /api/companies/{id}/` - детали компании
- `POST /api/companies/` - создание компании
- `PUT /api/companies/{id}/` - обновление компании

#### ERP система:
- `GET /api/erp/inventory/` - инвентарь
- `GET /api/erp/sales/` - продажи
- `GET /api/erp/services/` - услуги
- `GET /api/erp/service-orders/` - заказы на обслуживание
- `GET /api/erp/financial/` - финансовые операции
- `GET /api/erp/project-boards/` - доски проектов
- `GET /api/erp/project-tasks/` - задачи проектов

#### Аукционы:
- `GET /api/erp/auctions/` - список аукционов
- `POST /api/erp/auctions/{id}/bid/` - размещение ставки

#### Лизинг:
- `GET /api/erp/leasing/` - заявки на лизинг
- `POST /api/erp/leasing/` - создание заявки

#### Страхование:
- `GET /api/erp/insurance/` - страховые полисы
- `POST /api/erp/insurance/` - создание полиса

### WebSocket API:
```typescript
// Подключение
const ws = new WebSocket('wss://api.veles-drive.ru/ws/');

// События
interface WebSocketEvent {
  type: 'vehicle.created' | 'auction.updated' | 'bid.placed' | 'notification';
  data: any;
}
```

---

## 📊 Состояние приложения (Redux)

### Слайсы:
```typescript
// authSlice.ts
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// vehiclesSlice.ts
interface VehiclesState {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  filters: VehicleFilters;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

// companiesSlice.ts
interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  filters: CompanyFilters;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

// erpSlice.ts
interface ERPState {
  inventory: Inventory[];
  sales: Sale[];
  services: Service[];
  serviceOrders: ServiceOrder[];
  financial: Financial[];
  projectBoards: ProjectBoard[];
  projectTasks: ProjectTask[];
  isLoading: boolean;
  error: string | null;
}

// uiSlice.ts
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  modals: ModalState[];
  loading: boolean;
}
```

---

## 🔐 Безопасность и права доступа

### Роли и разрешения:
```typescript
interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  codename: string;
}

// Проверка прав
const hasPermission = (permission: string): boolean => {
  return user?.role?.permissions.some(p => p.codename === permission) || false;
};
```

### Защищенные маршруты:
```typescript
// Компонент для защиты маршрутов
<ProtectedRoute 
  requiredPermissions={['add_vehicle']}
  fallback="/unauthorized"
>
  <VehicleForm />
</ProtectedRoute>
```

---

## 📱 PWA функциональность

### Service Worker:
- Кэширование статических ресурсов
- Офлайн режим для просмотра каталога
- Фоновые уведомления
- Автоматические обновления

### Манифест:
```json
{
  "name": "VELES AUTO",
  "short_name": "VELES",
  "description": "Современная платформа для автомобильного бизнеса",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007AFF",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Тестирование

### Обязательные тесты:
- **Unit тесты** для утилит и хуков
- **Integration тесты** для компонентов
- **E2E тесты** для критических пользовательских сценариев

### Инструменты:
- **Jest** для unit тестов
- **React Testing Library** для тестирования компонентов
- **Cypress** для E2E тестов

---

## 📈 Производительность

### Оптимизации:
- **Lazy loading** для страниц и компонентов
- **Виртуализация** для больших списков
- **Мемоизация** для дорогих вычислений
- **Code splitting** по маршрутам
- **Image optimization** с lazy loading
- **Bundle analysis** и оптимизация размера

### Метрики:
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **First Input Delay** < 100ms

---

## 🔍 SEO и микроразметка

### Schema.org разметка:
```typescript
// Генерация микроразметки для автомобилей
const generateCarSchema = (car: Car) => ({
  "@context": "https://schema.org",
  "@type": "Car",
  "name": `${car.brand.name} ${car.model.name}`,
  "brand": {
    "@type": "Brand",
    "name": car.brand.name
  },
  "model": car.model.name,
  "vehicleModelDate": car.year,
  "mileageFromOdometer": {
    "@type": "QuantitativeValue",
    "value": car.mileage,
    "unitCode": "KMT"
  },
  "offers": {
    "@type": "Offer",
    "price": car.price,
    "priceCurrency": car.currency
  }
});
```

### Мета-теги:
- Динамические title и description
- Open Graph теги для социальных сетей
- Twitter Card теги
- Канонические URL

---

## 🌍 Локализация

### Поддержка языков:
- **Русский** (основной)
- **Английский** (планируется)

### Форматы:
- **Даты:** Московское время (без часовых поясов)
- **Валюта:** Рубли (RUB)
- **Числа:** Русский формат

---

## 📋 Чек-лист разработки

### Этап 1: Настройка проекта (1-2 дня)
- [ ] Создание React приложения с TypeScript
- [ ] Настройка Material-UI и темы
- [ ] Настройка Redux Toolkit
- [ ] Настройка React Router
- [ ] Настройка ESLint и Prettier
- [ ] Настройка структуры папок

### Этап 2: Базовые компоненты (3-5 дней)
- [ ] Layout компоненты (Header, Footer, Sidebar)
- [ ] UI компоненты (Button, Input, Modal, etc.)
- [ ] Формы (с валидацией)
- [ ] Навигация и маршрутизация
- [ ] Аутентификация

### Этап 3: Каталог автомобилей (5-7 дней)
- [ ] Список автомобилей с фильтрацией
- [ ] Детальная страница автомобиля
- [ ] Галерея изображений
- [ ] Поиск и сортировка
- [ ] Избранное и история просмотров

### Этап 4: Компании (3-4 дня)
- [ ] Список компаний
- [ ] Детальная страница компании
- [ ] Отзывы и рейтинги
- [ ] Каталог автомобилей компании

### Этап 5: ERP система (7-10 дней)
- [ ] Дашборд ERP
- [ ] Управление инвентарем
- [ ] Продажи
- [ ] Сервисные услуги
- [ ] Финансы
- [ ] Trello-like доски проектов
- [ ] Задачи и комментарии

### Этап 6: Дополнительные сервисы (4-5 дней)
- [ ] Аукционы
- [ ] Лизинг
- [ ] Страхование

### Этап 7: Telegram Mini App (3-4 дня)
- [ ] Интеграция с Telegram WebApp
- [ ] Адаптация интерфейса для Mini App
- [ ] Обработка Telegram данных

### Этап 8: PWA и оптимизация (2-3 дня)
- [ ] Service Worker
- [ ] Манифест PWA
- [ ] Офлайн режим
- [ ] Оптимизация производительности

### Этап 9: Тестирование и деплой (2-3 дня)
- [ ] Unit тесты
- [ ] Integration тесты
- [ ] E2E тесты
- [ ] Настройка CI/CD
- [ ] Деплой на продакшн

---

## 🚀 Деплой и инфраструктура

### Сборка:
```bash
# Разработка
npm start

# Продакшн сборка
npm run build

# Тесты
npm test
```

### Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Переменные окружения:
```env
REACT_APP_API_URL=https://api.veles-drive.ru
REACT_APP_TELEGRAM_BOT_TOKEN=your_bot_token
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

---

## 📞 Контакты и поддержка

**Backend разработчик:** @alx (ты будешь получать только бэк)  
**Документация API:** https://api.veles-drive.ru/docs/  
**Демо данные:** Доступны в системе  
**Telegram поддержка:** @veles_auto_support  

---

## 🎯 Критерии готовности

### MVP (Минимально жизнеспособный продукт):
- [ ] Каталог автомобилей с базовой фильтрацией
- [ ] Детальные страницы автомобилей
- [ ] Список компаний
- [ ] Базовая аутентификация
- [ ] Адаптивный дизайн

### Полная версия:
- [ ] Все модули ERP системы
- [ ] Telegram Mini App интеграция
- [ ] PWA функциональность
- [ ] Полное тестирование
- [ ] Оптимизация производительности

---

**Удачи в разработке! 🚀**

*Это техническое задание покрывает все аспекты фронтенд разработки. При возникновении вопросов обращайся к backend разработчику или изучай существующий код и API документацию.*
