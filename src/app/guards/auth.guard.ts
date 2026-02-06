import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { from, map, Observable, of, switchMap, take } from 'rxjs';
import { SupabaseClientBaseService } from '../services/supabase-client-base.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private supabaseBase: SupabaseClientBaseService
  ) {}

  /**
   * Validates authentication and checks if the user profile is active.
   * If the profile is inactive, signs out the user and redirects to login.
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          return of(this.router.createUrlTree(['/login']));
        }

        return this.authService.getCurrentUser().pipe(
          switchMap(user => {
            if (!user) {
              return of(this.router.createUrlTree(['/login']));
            }

            return from(
              this.supabaseBase.getClient()
                .from('profiles')
                .select('is_active')
                .eq('id', user.id)
                .single()
            ).pipe(
              switchMap(response => {
                if (response.error || response.data?.is_active === false) {
                  return this.authService.signOut().pipe(
                    map(() => this.router.createUrlTree(['/login']))
                  );
                }
                return of(true as boolean | UrlTree);
              })
            );
          })
        );
      })
    );
  }
}
