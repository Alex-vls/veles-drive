export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  avatar: string;
  role: 'user' | 'company' | 'admin';
  is_active: boolean;
  date_joined: string;
  last_login: string;
}

export interface Company {
  id: number;
  owner: User;
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
  images: CompanyImage[];
  features: CompanyFeature[];
  schedule: CompanySchedule[];
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: number;
  brand: Brand;
  model: Model;
  year: number;
  price: number;
  mileage: number;
  transmission: 'manual' | 'automatic';
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  body_type: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon';
  color: string;
  description: string;
  features: CarFeature[];
  images: CarImage[];
  company: Company;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  logo: string;
  created_at: string;
}

export interface Model {
  id: number;
  brand: Brand;
  name: string;
  description: string;
  created_at: string;
}

export interface CarFeature {
  id: number;
  name: string;
  value: string;
  created_at: string;
}

export interface CarImage {
  id: number;
  image: string;
  is_main: boolean;
  created_at: string;
}

export interface CompanyImage {
  id: number;
  image: string;
  is_main: boolean;
  created_at: string;
}

export interface CompanyFeature {
  id: number;
  name: string;
  value: string;
  created_at: string;
}

export interface CompanySchedule {
  id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user: User;
  company: Company;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  image?: string;
  author?: User;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  image?: string;
  author?: User;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  content_type: string;
  object_id: number;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface CarFilters {
  brand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CompanyFilters {
  city: string;
  isVerified: string;
  rating: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ModerationLog {
  id: number;
  content_type: string;
  object_id: number;
  moderator?: User;
  moderator_name?: string;
  status: ModerationStatus;
  comment: string;
  created_at: string;
  updated_at: string;
  content_type_name: string;
  content_object_title: string;
}

export interface ModerationAction {
  status: ModerationStatus;
  comment?: string;
} 