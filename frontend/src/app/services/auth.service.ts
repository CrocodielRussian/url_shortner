import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from './auth';

export interface User {
  id?: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  register(username: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, {
      username,
      password
    });
  }

  login(username: string, password: string): Observable<LoginResponse>;
  login(credentials: LoginRequest): Observable<LoginResponse>;
  login(credentialsOrUsername: LoginRequest | string, password?: string): Observable<LoginResponse> {
    const credentials: LoginRequest =
      typeof credentialsOrUsername === 'string'
        ? { username: credentialsOrUsername, password: password ?? '' }
        : credentialsOrUsername;

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    const payload = this.parseJwt(token);

    if (!payload) {
      this.logout();
      return false;
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      this.logout();
      return false;
    }

    return true;
  }

  private handleAuthResponse(response: LoginResponse): void {
    localStorage.setItem('token', response.token);

    const user = this.getUserFromToken(response.token);
    this.currentUserSubject.next(user);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();

    if (!token) {
      return;
    }

    if (!this.isAuthenticated()) {
      return;
    }

    const user = this.getUserFromToken(token);
    this.currentUserSubject.next(user);
  }

  private getUserFromToken(token: string): User | null {
    const payload = this.parseJwt(token);

    if (!payload) {
      return null;
    }

    const username = payload.username ?? payload.sub;

    if (!username) {
      return null;
    }

    return {
      id: payload.id ?? payload.userId ?? payload.sub,
      username
    };
  }

  private parseJwt(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];

      if (!base64Url) {
        return null;
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
