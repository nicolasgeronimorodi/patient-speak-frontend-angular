import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthService } from './auth.service';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { RoleEntity } from '../models';
import { ProfileEntity } from '../models/database-models/auth/profile.interface';
import { CreateUserRequest } from '../models/request-interfaces/create-user-request.interface';
import { UserDetailViewModel } from '../models/view-models/user/user-detail.view.model';
import { UserMappers } from '../models/mappers/users/user.mapping';
import { UserListItemViewModel } from '../models/view-models/user/user-list-item-view.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private supabase: SupabaseClient;

  constructor(
    private supabaseBase: SupabaseClientBaseService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.supabase = this.supabaseBase.getClient();
  }

  hasUserPermission(permissionName: string): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          return throwError(() => new Error('Usuario no autenticado'));
        }

        return from(
          this.supabase.rpc('current_user_has_permission', {
            permission_name: permissionName,
          })
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            return response.data as boolean;
          })
        );
      }),
      catchError((error) => {
        console.error('Error verificando permiso:', permissionName, error);
        return of(false); // falla segura: sin permiso
      })
    );
  }

  getCurrentUserDebugInfo(): Observable<{
    user_id: string;
    role_name: string;
  } | null> {
    return from(this.supabase.rpc('current_user_debug_info')).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data?.[0] ?? null;
      }),
      catchError((error) => {
        console.error('Error al obtener debug info del usuario actual:', error);
        return of(null);
      })
    );
  }

  // Verificar si el usuario actual tiene permiso para gestionar usuarios
  hasUserManagePermission(): Observable<boolean> {
    return this.hasUserPermission('user:manage');
  }

  // Obtener todos los roles disponibles
  getRoles(): Observable<RoleEntity[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('Usuario no autenticado'));
        }

        return from(this.supabase.from('roles').select('*').order('id')).pipe(
          map((response) => {
            if (response.error) throw response.error;
            return (response.data as RoleEntity[]) || [];
          })
        );
      }),
      catchError((error) => {
        console.error('Error obteniendo roles:', error);
        return throwError(
          () => new Error(`Error obteniendo roles: ${error.message}`)
        );
      })
    );
  }

  /**
   * Crea un nuevo usuario usando la Edge Function segura.
   * La Edge Function usa service_role key de forma segura en el servidor.
   */
  createUser(userData: CreateUserRequest): Observable<UserDetailViewModel> {
    return this.hasUserManagePermission().pipe(
      switchMap((hasPermission) => {
        if (!hasPermission) {
          return throwError(
            () => new Error('No tienes permiso para gestionar usuarios')
          );
        }

        const headers = {
          Authorization: `Bearer ${this.authService.getAccessToken()}`,
        };

        return this.http
          .post<{ user: any; profile: ProfileEntity; message: string }>(
            `${environment.supabaseFunctionsUrl}/create-user`,
            {
              email: userData.email,
              password: userData.password,
              full_name: userData.full_name,
              role_id: userData.role_id,
            },
            { headers }
          )
          .pipe(
            map((response) => UserMappers.toDetail(response.user, response.profile))
          );
      }),
      catchError((error) => {
        console.error('Error creando usuario:', error);
        const message = error.error?.error || error.message || 'Error desconocido';
        return throwError(() => new Error(`Error creando usuario: ${message}`));
      })
    );
  }

  // Obtener lista de usuarios
  getUsers(
    page: number = 1,
    pageSize: number = 10
  ): Observable<{ users: UserListItemViewModel[]; total: number }> {
    return this.authService.isUserAdmin().pipe(
      switchMap((isAdmin) => {
        if (!isAdmin) {
          return throwError(() => new Error('No autorizado'));
        }

        const fromPage = (page - 1) * pageSize;
        const toPage = fromPage + pageSize - 1;

        return from(
          this.supabase
            .from('profiles')
            .select(
              `
              *,
              role:role_id (
                id,
                name,
                description
              )
            `,
              { count: 'exact' }
            )
            .range(fromPage, toPage)
            .order('created_at', { ascending: false })
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            const profiles = response.data as ProfileEntity[];
            const total = response.count ?? 0;

            return {
              users: profiles.map((profile) =>
                UserMappers.toListItem(
                  { id: profile.id, email: profile.email },
                  profile
                )
              ),
              total,
            };
          })
        );
      }),
      catchError((error) => {
        console.error('Error obteniendo usuarios:', error);
        return throwError(
          () => new Error(`Error obteniendo usuarios: ${error.message}`)
        );
      })
    );
  }


  getOperatorUserById(userId: string): Observable<UserDetailViewModel> {
    return this.authService.isUserAdmin().pipe(
      switchMap((isAdmin) => {
        if (!isAdmin) {
          return throwError(() => new Error('No autorizado'));
        }

        return from(
          this.supabase
            .from('profiles')
            .select(
              `
              *,
              role:role_id (
                id,
                name,
                description
              )
            `
            )
            .eq('id', userId)
            .single()
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            const profile = response.data as ProfileEntity;
            return UserMappers.toDetail(
              { id: profile.id, email: profile.email },
              profile
            );
          })
        );
      }),
      catchError((error) => {
        console.error('Error obteniendo usuario por ID:', error);
        return throwError(
          () => new Error(`Error al obtener usuario: ${error.message}`)
        );
      })
    );
  }

  updateUserName(userId: string, fullName: string): Observable<void> {
    return this.authService.isUserAdmin().pipe(
      switchMap((isAdmin) => {
        if (!isAdmin) {
          return throwError(() => new Error('No autorizado'));
        }

        return from(
          this.supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', userId)
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            return;
          })
        );
      }),
      catchError((error) => {
        console.error('Error actualizando nombre del usuario:', error);
        return throwError(
          () => new Error(`Error al actualizar nombre: ${error.message}`)
        );
      })
    );
  }
}
