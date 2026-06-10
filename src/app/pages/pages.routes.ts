import { Routes } from '@angular/router';
import { PagesComponent } from './pages.component';

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
        loadComponent: () => import('./companies/companies.component').then(c => c.CompaniesComponent),
        data: { breadcrumb: 'nav.companies' }
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(c => c.UsersComponent),
        data: { breadcrumb: 'nav.users' }
      },
      {
        path: 'roles',
        loadComponent: () => import('./roles/roles.component').then(c => c.RolesComponent),
        data: { breadcrumb: 'nav.roles' }
      },
    ]
  }
];
