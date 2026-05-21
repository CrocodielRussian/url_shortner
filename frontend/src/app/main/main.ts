import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { UrlService } from '../services/url.service';
import { AuthService } from '../services/auth.service';
import { UrlMapping, ShortenResponse } from '../services/auth';

@Component({
  selector: 'app-main',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main implements OnInit {
  private fb = inject(FormBuilder);
  private urlSvc = inject(UrlService);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    originalUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
  });

  urls = signal<UrlMapping[]>([]);
  shortening = signal(false);
  loadingUrls = signal(false);
  shortenError = signal<string | null>(null);
  newShortUrl = signal<string | null>(null);
  copiedId = signal<number | 'new' | null>(null);
  deletingId = signal<number | null>(null);

  get originalUrl() {
    return this.form.get('originalUrl')!;
  }

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls(): void {
    this.loadingUrls.set(true);

    this.urlSvc.getUserUrls().subscribe({
      next: (data: UrlMapping[]) => {
        this.urls.set(data);
        this.loadingUrls.set(false);
      },
      error: () => {
        this.loadingUrls.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.shortening()) {
      return;
    }

    const originalUrl = this.originalUrl.value;

    if (!originalUrl) {
      return;
    }

    this.shortenError.set(null);
    this.newShortUrl.set(null);
    this.shortening.set(true);

    this.urlSvc.shortenUrl(originalUrl).subscribe({
      next: (res: ShortenResponse) => {
        this.newShortUrl.set(res.shortUrl);
        this.shortening.set(false);
        this.form.reset();
        this.loadUrls();
      },
      error: (err: HttpErrorResponse) => {
        this.shortening.set(false);

        this.shortenError.set(
          err.status === 400
            ? 'Некорректный URL. Проверьте формат.'
            : err.error?.message ?? 'Не удалось сократить ссылку.'
        );
      }
    });
  }

  copy(text: string, id: number | 'new'): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(id);

      setTimeout(() => {
        this.copiedId.set(null);
      }, 2000);
    });
  }

  delete(id: number): void {
    this.deletingId.set(id);

    this.urlSvc.deleteUrl(id).subscribe({
      next: () => {
        this.urls.update(urls => urls.filter(url => url.id !== id));
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
      }
    });
  }

  open(url: string): void {
    window.open(url, '_blank');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  truncate(url?: string | null, max = 55): string {
    if (!url) {
      return '—';
    }

    return url.length > max ? url.slice(0, max) + '…' : url;
  }

  fmtDate(value?: string | null): string {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
