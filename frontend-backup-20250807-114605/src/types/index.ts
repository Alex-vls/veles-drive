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
  banner_image?: string;
  address: string;
  city: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  cars_count: number;
  years_experience: number;
  images: CompanyImage[];
  features: CompanyFeature[];
  schedule: CompanySchedule[];
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

// Vehicle types (новые)
export interface Vehicle {
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
  engine_power: number;
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

export interface VehicleImage {
  id: number;
  image: string;
  is_main: boolean;
  created_at: string;
}

export interface VehicleFeature {
  id: number;
  name: string;
  value: string;
  created_at: string;
}

export interface VehicleFilters {
  vehicle_type: string;
  brand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
  transmission: string;
  fuelType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Car types (legacy)
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
  condition: 'new' | 'used';
  rating: number;
  reviews_count: number;
  engine_power: number;
  main_image: string;
  created_at: string;
  updated_at: string;
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

// ERP types
export interface Project {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date: string;
  created_by: User;
  assigned_to: User[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project: Project;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: User;
  due_date: string;
  created_at: string;
  updated_at: string;
}

// Auction types
export interface Auction {
  id: number;
  title: string;
  description: string;
  auction_type: 'english' | 'dutch' | 'sealed' | 'reverse';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
  vehicle: Vehicle;
  start_date: string;
  end_date: string;
  min_bid: number;
  reserve_price: number;
  current_price: number;
  bid_increment: number;
  created_by: User;
  bids: AuctionBid[];
  created_at: string;
  updated_at: string;
}

export interface AuctionBid {
  id: number;
  auction: Auction;
  bidder: User;
  amount: number;
  is_winning: boolean;
  created_at: string;
}

export interface LeasingProgram {
  id: number;
  company: Company;
  name: string;
  description: string;
  min_down_payment: number;
  max_term: number;
  interest_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface LeasingApplication {
  id: number;
  program: LeasingProgram;
  vehicle: Vehicle;
  applicant: User;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  down_payment: number;
  term_months: number;
  monthly_payment: number;
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicy {
  id: number;
  company: Company;
  insurance_type: string;
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
  excerpt: string;
  image?: string;
  author?: User;
  category: string;
  tags: string[];
  readTime: number;
  date: string;
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
  content_type_name: string;
  content_object_title: string;
}

export interface ModerationAction {
  status: ModerationStatus;
  comment?: string;
} 