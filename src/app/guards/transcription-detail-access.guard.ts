import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { SupabaseClientBaseService } from '../services/supabase-client-base.service';
import { catchError, from, map, of, switchMap } from 'rxjs';


export const TranscriptionDetailAccessGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const authService = inject(AuthService);
  const supabase = inject(SupabaseClientBaseService).getClient();
  const router = inject(Router);

  const transcriptionId = route.paramMap.get('id');
  if (!transcriptionId) {
    router.navigate(['/home']);
    return of(false);
  }

  return authService.getCurrentUser().pipe(
    switchMap(user => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }

      return userService.hasUserPermission('transcription:read:all').pipe(
        switchMap(hasTranscriptionReadAllPermission => {
          if (hasTranscriptionReadAllPermission) return of(true);

          return from(
            supabase
              .from('transcriptions')
              .select('user_id')
              .eq('id', transcriptionId)
              .single()
          ).pipe(
            map(result => {
              if (result.error) throw result.error;
              const isOwner = result.data?.user_id === user.id;
              return isOwner;
            }),
            catchError(() => of(false))
          );
        })
      );
    }),
    map(allowed => {
      if (!allowed) {
        router.navigate(['/home']);
      }
      return allowed;
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(false);
    })
  );
};
