import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

/**
 * Guard que permite el acceso a la ruta de perfil solo si el :id
 * de la ruta coincide con el ID del usuario autenticado.
 */
export const profileAccessGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const profileId = route.paramMap.get('id');
  if (!profileId) {
    router.navigate(['/home']);
    return of(false);
  }

  return authService.getCurrentUser().pipe(
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const isOwnProfile = user.id === profileId;
      if (!isOwnProfile) {
        router.navigate(['/home']);
      }
      return isOwnProfile;
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(false);
    })
  );
};
