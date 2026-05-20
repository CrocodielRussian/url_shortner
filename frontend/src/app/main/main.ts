import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { UrlResponse, UrlService } from '../services/url.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class MainComponent implements OnInit {
  private fb = inject(FormBuilder);
  private urlSvc = inject(UrlService);
  private auth = inject(AuthService);

  form = this.fb.group({
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
  });

  urls = signal<UrlResponse[]>([]);
  shortening = signal(false);
  loadingUrls = signal(false);
  shortenError = signal<string | null>(null);
  loadError = signal<string | null>(null);
  newShortUrl = signal<string | null>(null);
  copiedId = signal<number | 'new' | null>(null);
  deletingId = signal<number | null>(null);
  clearing = signal(false);

  get url() { return this.form.get('url')!; }

  ngOnInit() { this.loadUrls(); }

  loadUrls() {
    this.loadingUrls.set(true);
    this.loadError.set(null);
    this.urlSvc.getUserUrls().subscribe({
      next: data => {
        this.urls.set([...data].sort((a, b) => b.id - a.id));
        this.loadingUrls.set(false);
      },
      error: () => {
        this.loadError.set('Не удалось загрузить ваши ссылки.');
        this.loadingUrls.set(false);
      }
    });
  }

  submit() {
    if (this.shortening()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.shortenError.set(null);
    this.newShortUrl.set(null);
    this.shortening.set(true);

    this.urlSvc.shorten({ url: this.url.value! }).subscribe({
      next: res => {
        this.newShortUrl.set(res.shortUrl);
        this.shortening.set(false);
        this.form.reset();
        this.urls.update(urls => [res, ...urls.filter(url => url.id !== res.id)]);
      },
      error: (err: HttpErrorResponse) => {
        this.shortening.set(false);
        this.shortenError.set(
          err.status === 400
            ? 'Некорректный URL. Проверьте формат.'
            : (err.error?.message ?? 'Не удалось сократить ссылку.')
        );
      }
    });
  }

  copy(text: string, id: number | 'new') {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(id);
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }

  deleteUrl(id: number) {
    this.deletingId.set(id);
    this.urlSvc.deleteUrl(id).subscribe({
      next: () => { this.urls.update(l => l.filter(u => u.id !== id)); this.deletingId.set(null); },
      error: () => this.deletingId.set(null)
    });
  }

  clear() {
    if (this.urls().length === 0 || this.clearing()) return;
    this.clearing.set(true);
    this.urlSvc.clearUrls().subscribe({
      next: () => {
        this.urls.set([]);
        this.clearing.set(false);
      },
      error: () => this.clearing.set(false)
    });
  }

  open(url: string) { window.open(url, '_blank'); }

  logout() { this.auth.logout(); }

  truncate(url: string, max = 55) {
    return url.length > max ? `${url.slice(0, max)}...` : url;
  }
}
