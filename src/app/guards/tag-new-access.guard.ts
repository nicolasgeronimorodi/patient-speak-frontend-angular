import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { catchError, map, Observable, of } from 'rxjs';

export class TagNewAccessGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.userService.hasUserPermission('tags:create:all').pipe(
      map((hasPermission: boolean) => {
        if (!hasPermission) {
          this.router.navigate(['/home']); 
        }
        return hasPermission;
      }),
      catchError(() => {
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}