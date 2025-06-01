import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const tagNewAccessGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.hasUserPermission('tags:create:all').pipe(
    map((hasPermission: boolean) => {
      if (!hasPermission) {
        router.navigate(['/home']);
      }
      return hasPermission;
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(false);
    })
  );
};
