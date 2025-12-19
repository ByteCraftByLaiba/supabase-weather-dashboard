export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface WeatherReading {
  id: string;
  location_id: string;
  recorded_at: string;
  temperature_c: number;
  humidity_percent: number;
  pressure_hpa: number;
  wind_speed_ms: number;
  wind_direction_deg: number;
  precipitation_mm: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}