export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn?: number;
}

export interface ShortenRequest {
  originalUrl: string;
}

export interface ShortenResponse {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
}

export interface UrlMapping {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  clickCount?: number;
}
