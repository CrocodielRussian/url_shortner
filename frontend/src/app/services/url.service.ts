import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UrlRequest {
  url: string;
}

export interface UrlResponse {
  id: number;
  shortUrl: string;
  longUrl: string;
}

@Injectable({ providedIn: 'root' })
export class UrlService {
  private apiUrl = environment.apiUrl + '/api/url';
  private http = inject(HttpClient);

  shorten(body: UrlRequest): Observable<UrlResponse> {
    return this.http.post<UrlResponse>(this.apiUrl, body);
  }

  getUserUrls(): Observable<UrlResponse[]> {
    return this.http.get<UrlResponse[]>(this.apiUrl);
  }

  deleteUrl(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  clearUrls(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
