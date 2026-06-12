import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loadSession().pipe(
    map(session => session ? true : router.createUrlTree(['/login']))
  );
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loadSession().pipe(
    map(session => session ? router.createUrlTree(['/']) : true)
  );
};

export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loadSession().pipe(
    map(session => {
      if (!session) {
        return router.createUrlTree(['/login']);
      }

      const user = authService.currentUser;
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      const requiredUserTypes = route.data?.['requiredUserTypes'] as string[] | undefined;
      if (requiredUserTypes?.length && !requiredUserTypes.includes(user.userType)) {
        return router.createUrlTree(['/']);
      }

      const requiredPermissions = route.data?.['requiredPermissions'] as string[] | undefined;
      if (user.userType === 'SYSTEM_OWNER') {
        return true;
      }
      if (requiredPermissions?.length && !requiredPermissions.every(permission => user.permissions.includes(permission))) {
        return router.createUrlTree(['/']);
      }

      return true;
    })
  );
};
