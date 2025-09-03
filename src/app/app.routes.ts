import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  {
    path: 'stores',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/stores/stores.module').then(m => m.StoresModule)
  },
  {
    path: 'comparison',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/comparison/comparison.module').then(m => m.ComparisonModule)
  },
  {
    path: 'favorites',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/favorites/favorites.module').then(m => m.FavoritesModule)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
