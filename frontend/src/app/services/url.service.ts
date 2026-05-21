import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ShortenResponse, UrlMapping } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private apiUrl = environment.apiUrl + '/api/url';

  constructor(private http: HttpClient) {}

  shortenUrl(url: string): Observable<ShortenResponse> {
    return this.http.post<ShortenResponse>(`${this.apiUrl}/add`, {
      url
    });
  }

  getUserUrls(): Observable<UrlMapping[]> {
    return this.http.get<UrlMapping[]>(`${this.apiUrl}/my`);
  }

  deleteUrl(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  clearUrls(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
