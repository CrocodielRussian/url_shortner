export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn?: number;
}

export interface ShortenRequest {
  url: string;
}

/**
 * Реальный ответ backend:
 * {
 *   id: 1,
 *   shortUrl: "http://localhost/api/url/58a663ab",
 *   longUrl: "https://example.com"
 * }
 */
export interface UrlApiResponse {
  id: number;
  shortUrl: string;
  longUrl: string;
  createdAt?: string;
  clickCount?: number;
}

/**
 * То, с чем работает frontend.
 */
export interface UrlMapping {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt?: string;
  clickCount?: number;
}

export type ShortenResponse = UrlMapping;
