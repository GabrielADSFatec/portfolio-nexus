// Tipos base do banco de dados
export interface CarouselItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  full_description?: string; // Descrição completa para a página individual
  image_url: string;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
  slug: string; // Para URLs amigáveis
  created_at: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  description?: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Tipos para forms
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  full_description: string;
  image_url: string;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  slug: string;
}

export interface CarouselFormData {
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
}

export interface ClientFormData {
  name: string;
  logo_url: string;
  website_url: string | null;
  description: string | null;
  is_active: boolean;
}

// Tipos para API responses
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}