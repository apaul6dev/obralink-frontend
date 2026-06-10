import { Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { permissionGuard } from '../services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./blank/blank.component').then(c => c.BlankComponent),
        data: { breadcrumb: 'nav.home' }
      },
      {
        path: 'blank',
        loadComponent: () => import('./blank/blank.component').then(c => c.BlankComponent),
        data: { breadcrumb: 'Blank' }
      },
      {
        path: 'companies',
        canActivate: [permissionGuard],
        loadComponent: () => import('./companies/companies.component').then(c => c.CompaniesComponent),
        data: { breadcrumb: 'nav.companies', requiredUserTypes: ['SYSTEM_OWNER'] }
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        loadComponent: () => import('./users/users.component').then(c => c.UsersComponent),
        data: { breadcrumb: 'nav.users', requiredPermissions: ['ui.users.view'] }
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        loadComponent: () => import('./roles/roles.component').then(c => c.RolesComponent),
        data: { breadcrumb: 'nav.roles', requiredPermissions: ['ui.roles.view'] }
      },
    ]
  }
];
