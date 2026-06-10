import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './services/auth.guard';

export const routes: Routes = [
    {
        path: '', 
        canActivate: [authGuard],
        loadChildren: () => import('./pages/pages.routes').then(p => p.routes)
    },
    { 
        path: 'login', 
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent),
    },
    { 
        path: 'error', 
        loadComponent: () => import('./pages/errors/error/error.component').then(c => c.ErrorComponent),
        data: { breadcrumb: 'Error' }  
    },
    { 
        path: '**', 
        loadComponent: () => import('./pages/errors/not-found/not-found.component').then(c => c.NotFoundComponent)  
    }
];
