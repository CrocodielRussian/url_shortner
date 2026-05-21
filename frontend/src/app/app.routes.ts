import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './login/login';
import { Main } from './main/main';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'main',
    component: Main,
    canActivate: [AuthGuard],
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
