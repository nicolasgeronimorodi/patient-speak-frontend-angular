import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from '../services/user.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  return userService.hasUserManagePermission().pipe(
    map(hasPermission => {
      if (!hasPermission) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(false);
    })
  );
};
