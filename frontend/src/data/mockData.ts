export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  engine: string;
  color: string;
  condition: 'new' | 'used';
  image: string;
  company: Company;
  description: string;
  features: string[];
  rating: number;
  reviews: number;
  is_available: boolean;
  fuel_type_display: string;
  transmission_display: string;
  main_image: string;
  tags?: string[];
  // Дополнительные поля для совместимости
  created_at?: string;
  engine_volume?: string;
  power?: string;
  fuel_type?: string;
  images?: any[];
}

export interface Company {
  id: string;
  owner?: any; // Упрощенная версия для тестовых данных
  name: string;
  description: string;
  logo: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  is_verified: boolean;
  rating: number;
  images: any[];
  features: any[];
  schedule: any[];
  created_at: string;
  updated_at: string;
  // Дополнительные поля для совместимости
  type?: 'dealer' | 'service' | 'insurance' | 'auction';
  location?: string;
  carsCount?: number;
  established?: number;
  specialties?: string[];
  reviews?: number;
  advantages?: string[];
}

export interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
}

// Тестовые компании (объявляем первыми)
export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'АвтоПремиум',
    description: 'Официальный дилер премиальных автомобильных брендов. BMW, Mercedes-Benz, Audi.',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    address: 'ул. Ленинградская, 45',
    city: 'Москва',
    phone: '+7 (495) 123-45-67',
    email: 'info@autopremium.ru',
    website: 'https://autopremium.ru',
    is_verified: true,
    rating: 4.8,
    images: [],
    features: [],
    schedule: [],
    created_at: '2010-01-01',
    updated_at: '2024-01-01',
    // Дополнительные поля для совместимости
    type: 'dealer',
    location: 'Москва, ул. Ленинградская, 45',
    carsCount: 89,
    established: 2010,
    specialties: ['BMW', 'Mercedes-Benz', 'Audi', 'Tesla'],
    reviews: 156,
    advantages: ['Официальный дилер', 'Большой выбор', 'Гарантия', 'Сервис']
  },
  {
    id: '2',
    name: 'АвтоСервис Про',
    description: 'Сервисный центр для всех марок автомобилей. Качественное обслуживание и ремонт.',
    logo: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop',
    address: 'ул. Сервисная, 12',
    city: 'Москва',
    phone: '+7 (495) 987-65-43',
    email: 'service@autoservice-pro.ru',
    website: 'https://autoservice-pro.ru',
    is_verified: true,
    rating: 4.7,
    images: [],
    features: [],
    schedule: [],
    created_at: '2008-01-01',
    updated_at: '2024-01-01',
    // Дополнительные поля для совместимости
    type: 'service',
    location: 'Москва, ул. Сервисная, 12',
    carsCount: 0,
    established: 2008,
    specialties: ['Диагностика', 'Ремонт двигателей', 'Кузовные работы', 'Электрика'],
    reviews: 234,
    advantages: ['Опытные мастера', 'Гарантия на работы', 'Оригинальные запчасти', 'Быстрое обслуживание']
  },
  {
    id: '3',
    name: 'АвтоСтрах',
    description: 'Страховая компания с 15-летним опытом. Надежная защита вашего автомобиля.',
    logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop',
    address: 'ул. Страховая, 78',
    city: 'Москва',
    phone: '+7 (495) 555-12-34',
    email: 'info@autostrah.ru',
    website: 'https://autostrah.ru',
    is_verified: true,
    rating: 4.6,
    images: [],
    features: [],
    schedule: [],
    created_at: '2009-01-01',
    updated_at: '2024-01-01',
    // Дополнительные поля для совместимости
    type: 'insurance',
    location: 'Москва, ул. Страховая, 78',
    carsCount: 0,
    established: 2009,
    specialties: ['КАСКО', 'ОСАГО', 'Страхование жизни', 'Имущество'],
    reviews: 189,
    advantages: ['15 лет опыта', 'Быстрые выплаты', 'Круглосуточная поддержка', 'Выгодные тарифы']
  },
  {
    id: '4',
    name: 'АвтоАукцион',
    description: 'Онлайн аукцион автомобилей. Уникальные предложения и прозрачные торги.',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    address: 'ул. Аукционная, 33',
    city: 'Москва',
    phone: '+7 (495) 777-88-99',
    email: 'info@autoauction.ru',
    website: 'https://autoauction.ru',
    is_verified: true,
    rating: 4.5,
    images: [],
    features: [],
    schedule: [],
    created_at: '2015-01-01',
    updated_at: '2024-01-01',
    // Дополнительные поля для совместимости
    type: 'auction',
    location: 'Москва, ул. Аукционная, 33',
    carsCount: 156,
    established: 2015,
    specialties: ['Аукционы', 'Оценка', 'Проверка истории', 'Доставка'],
    reviews: 98,
    advantages: ['Прозрачные торги', 'Проверка истории', 'Безопасные сделки', 'Уникальные предложения']
  }
];

// Тестовые автомобили (объявляем после компаний)
export const mockCars: Car[] = [
  {
    id: '1',
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    price: 8500000,
    mileage: 15000,
    fuelType: 'Бензин',
    transmission: 'Автомат',
    engine: '3.0L 340 л.с.',
    color: 'Черный',
    condition: 'used',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    company: mockCompanies[0],
    description: 'Премиальный внедорожник в отличном состоянии. Полный пакет опций, кожаный салон.',
    features: ['Кожаный салон', 'Панорамная крыша', 'Парктроники', 'Круиз-контроль'],
    rating: 4.8,
    reviews: 12,
    is_available: true,
    fuel_type_display: 'Бензин',
    transmission_display: 'Автомат',
    main_image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    tags: ['Премиум', 'Внедорожник', '4x4', 'Кожаный салон'],
    created_at: '2024-01-15',
    engine_volume: '3.0',
    power: '340',
    fuel_type: 'Бензин',
    images: [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
        is_main: true
      }
    ]
  },
  {
    id: '2',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    price: 6500000,
    mileage: 0,
    fuelType: 'Бензин',
    transmission: 'Автомат',
    engine: '2.0L 197 л.с.',
    color: 'Белый',
    condition: 'new',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
    company: mockCompanies[1],
    description: 'Новый Mercedes-Benz C-Class. Современный дизайн и передовые технологии.',
    features: ['LED фары', 'Мультимедиа система', 'Адаптивная подвеска', 'Система безопасности'],
    rating: 4.9,
    reviews: 8,
    is_available: true,
    fuel_type_display: 'Бензин',
    transmission_display: 'Автомат',
    main_image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
    tags: ['Новый', 'Седан', 'Премиум', 'Технологии'],
    created_at: '2024-01-10',
    engine_volume: '2.0',
    power: '197',
    fuel_type: 'Бензин',
    images: [
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
        is_main: true
      }
    ]
  },
  {
    id: '3',
    brand: 'Audi',
    model: 'A6',
    year: 2022,
    price: 7200000,
    mileage: 45000,
    fuelType: 'Дизель',
    transmission: 'Автомат',
    engine: '2.0L 190 л.с.',
    color: 'Серебристый',
    condition: 'used',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    company: mockCompanies[2],
    description: 'Бизнес-седан Audi A6. Экономичный дизельный двигатель, комфортный салон.',
    features: ['Климат-контроль', 'Навигация', 'Кожаный руль', 'Система парковки'],
    rating: 4.7,
    reviews: 15,
    is_available: true,
    fuel_type_display: 'Дизель',
    transmission_display: 'Автомат',
    main_image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    tags: ['Бизнес', 'Седан', 'Экономичный', 'Комфорт'],
    created_at: '2023-12-20',
    engine_volume: '2.0',
    power: '190',
    fuel_type: 'Дизель',
    images: [
      {
        id: '3',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
        is_main: true
      }
    ]
  },
  {
    id: '4',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2024,
    price: 5500000,
    mileage: 5000,
    fuelType: 'Электро',
    transmission: 'Автомат',
    engine: 'Long Range AWD',
    color: 'Красный',
    condition: 'used',
    image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400&h=300&fit=crop',
    company: mockCompanies[0],
    description: 'Электромобиль Tesla Model 3. Высокая производительность и экологичность.',
    features: ['Автопилот', 'Панорамная крыша', 'Премиум аудио', 'Быстрая зарядка'],
    rating: 4.9,
    reviews: 23,
    is_available: true,
    fuel_type_display: 'Электро',
    transmission_display: 'Автомат',
    main_image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400&h=300&fit=crop',
    tags: ['Электро', 'Автопилот', 'Экологичный', 'Спортивный'],
    created_at: '2024-01-05',
    engine_volume: 'Long Range',
    power: '450',
    fuel_type: 'Электро',
    images: [
      {
        id: '4',
        image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400&h=300&fit=crop',
        is_main: true
      }
    ]
  },
  {
    id: '5',
    brand: 'Lexus',
    model: 'RX',
    year: 2023,
    price: 7800000,
    mileage: 25000,
    fuelType: 'Гибрид',
    transmission: 'Автомат',
    engine: '2.5L Hybrid',
    color: 'Темно-синий',
    condition: 'used',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    company: mockCompanies[1],
    description: 'Гибридный кроссовер Lexus RX. Надежность и экономичность в одном автомобиле.',
    features: ['Гибридная система', 'Премиум салон', 'Система безопасности', 'Комфорт'],
    rating: 4.8,
    reviews: 18,
    is_available: true,
    fuel_type_display: 'Гибрид',
    transmission_display: 'Автомат',
    main_image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    tags: ['Гибрид', 'Кроссовер', 'Надежный', 'Экономичный'],
    created_at: '2023-11-15',
    engine_volume: '2.5',
    power: '308',
    fuel_type: 'Гибрид',
    images: [
      {
        id: '5',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
        is_main: true
      }
    ]
  },
  {
    id: '6',
    brand: 'Volkswagen',
    model: 'Tiguan',
    year: 2024,
    price: 4200000,
    mileage: 0,
    fuelType: 'Бензин',
    transmission: 'Автомат',
    engine: '2.0L 150 л.с.',
    color: 'Серый',
    condition: 'new',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    company: mockCompanies[2],
    description: 'Новый Volkswagen Tiguan. Практичный и надежный кроссовер для всей семьи.',
    features: ['Просторный салон', 'Безопасность', 'Экономичность', 'Современный дизайн'],
    rating: 4.6,
    reviews: 7,
    is_available: true,
    fuel_type_display: 'Бензин',
    transmission_display: 'Автомат',
    main_image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    tags: ['Новый', 'Кроссовер', 'Семейный', 'Практичный'],
    created_at: '2024-01-20',
    engine_volume: '2.0',
    power: '150',
    fuel_type: 'Бензин',
    images: [
      {
        id: '6',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
        is_main: true
      }
    ]
  }
];

// Тестовые новости
export const mockNews: News[] = [
  {
    id: '1',
    title: 'Новые электромобили Tesla Model Y поступили в продажу',
    excerpt: 'Компания Tesla объявила о начале продаж нового электромобиля Model Y в России.',
    content: 'Полный текст новости о Tesla Model Y...',
    image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400&h=250&fit=crop',
    category: 'Электромобили',
    author: 'Алексей Петров',
    date: '2024-01-15',
    readTime: 3,
    tags: ['Tesla', 'Электромобили', 'Model Y']
  },
  {
    id: '2',
    title: 'BMW представил новое поколение X5',
    excerpt: 'Немецкий автопроизводитель показал обновленный внедорожник BMW X5.',
    content: 'Полный текст новости о BMW X5...',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop',
    category: 'Новинки',
    author: 'Мария Сидорова',
    date: '2024-01-12',
    readTime: 4,
    tags: ['BMW', 'X5', 'Внедорожники']
  },
  {
    id: '3',
    title: 'Изменения в правилах ОСАГО с 2024 года',
    excerpt: 'С 1 января 2024 года вступили в силу новые правила обязательного страхования.',
    content: 'Полный текст о изменениях в ОСАГО...',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    category: 'Страхование',
    author: 'Дмитрий Козлов',
    date: '2024-01-10',
    readTime: 5,
    tags: ['ОСАГО', 'Страхование', 'Законодательство']
  },
  {
    id: '4',
    title: 'Mercedes-Benz обновил линейку C-Class',
    excerpt: 'Компания Mercedes-Benz представила обновленную версию популярного седана C-Class.',
    content: 'Полный текст о Mercedes-Benz C-Class...',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=250&fit=crop',
    category: 'Новинки',
    author: 'Елена Волкова',
    date: '2024-01-08',
    readTime: 3,
    tags: ['Mercedes-Benz', 'C-Class', 'Седаны']
  },
  {
    id: '5',
    title: 'Топ-10 самых надежных автомобилей 2024 года',
    excerpt: 'Эксперты составили рейтинг самых надежных автомобилей по итогам 2024 года.',
    content: 'Полный текст рейтинга надежности...',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop',
    category: 'Обзоры',
    author: 'Сергей Иванов',
    date: '2024-01-05',
    readTime: 7,
    tags: ['Надежность', 'Рейтинг', 'Обзор']
  },
  {
    id: '6',
    title: 'Новые технологии в автомобильной промышленности',
    excerpt: 'Обзор последних технологических достижений в автомобильной отрасли.',
    content: 'Полный текст о технологиях...',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop',
    category: 'Технологии',
    author: 'Анна Смирнова',
    date: '2024-01-03',
    readTime: 6,
    tags: ['Технологии', 'Инновации', 'Автопром']
  }
];

// Функции для работы с данными
export const getTopCars = (limit: number = 6): Car[] => {
  return mockCars
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getTopCompanies = (limit: number = 4): Company[] => {
  return mockCompanies
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getLatestNews = (limit: number = 6): News[] => {
  return mockNews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getCarsByCompany = (companyId: string): Car[] => {
  return mockCars.filter(car => car.company.id === companyId);
};

export const getCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find(company => company.id === id);
};

export const getCarById = (id: string): Car | undefined => {
  return mockCars.find(car => car.id === id);
};

export const getNewsById = (id: string): News | undefined => {
  return mockNews.find(news => news.id === id);
}; 