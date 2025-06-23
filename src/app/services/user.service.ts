import { Injectable } from '@angular/core';
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
import { UpdateUserInfoRequest } from '../models/request-interfaces/update-user-info-request.interface';
import { UserRolesEnum } from '../enums/user-roles.enum';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private supabase: SupabaseClient;

  constructor(
    private supabaseBase: SupabaseClientBaseService,
    private authService: AuthService
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

  // Crear un nuevo usuario
  createUser(userData: CreateUserRequest): Observable<UserDetailViewModel> {
    return this.hasUserManagePermission().pipe(
      switchMap((hasPermission) => {
        if (!hasPermission) {
          return throwError(
            () => new Error('No tienes permiso para gestionar usuarios')
          );
        }

        // Paso 1: Crear usuario en auth.users
        return from(
          this.supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
          })
        ).pipe(
          switchMap((userResponse) => {
            if (userResponse.error) throw userResponse.error;
            const newUser = userResponse.data.user;

            if (!newUser || !newUser.id) {
              throw new Error('Error al crear el usuario');
            }

            // Paso 2: Crear perfil en profiles
            return from(
              this.supabase.from('profiles').upsert({
                id: newUser.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                role_id: userData.role_id,
              })
            ).pipe(
              switchMap((profileResponse) => {
                if (profileResponse.error) throw profileResponse.error;

                // Paso 3: Obtener el perfil completo con datos del rol
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
                    .eq('id', newUser.id)
                    .single()
                ).pipe(
                  map((joinResponse) => {
                    if (joinResponse.error) throw joinResponse.error;
                    return UserMappers.toDetail(
                      newUser,
                      joinResponse.data as ProfileEntity
                    );
                  })
                );
              })
            );
          })
        );
      }),
      catchError((error) => {
        console.error('Error creando usuario:', error);
        return throwError(
          () => new Error(`Error creando usuario: ${error.message}`)
        );
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
            ) //
            .range(fromPage, toPage)
            .order('created_at', { ascending: false })
        ).pipe(
          switchMap((profilesResponse) => {
            if (profilesResponse.error) throw profilesResponse.error;
            const profiles = profilesResponse.data as ProfileEntity[];
            const total = profilesResponse.count ?? 0;

            return from(this.supabase.auth.admin.listUsers()).pipe(
              map((usersResponse) => {
                if (usersResponse.error) throw usersResponse.error;
                const users = usersResponse.data.users;

                const viewModels = profiles.map((profile) => {
                  const user = users.find((u) => u.id === profile.id) || {
                    id: profile.id,
                  };
                  return UserMappers.toListItem(user, profile);
                });

                return { users: viewModels, total };
              })
            );
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

  getOperatorUsers(
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
          .eq('role_id', UserRolesEnum.Operator) // ← filtro por operador
          .range(fromPage, toPage)
          .order('created_at', { ascending: false })
      ).pipe(
        switchMap((profilesResponse) => {
          if (profilesResponse.error) throw profilesResponse.error;
          const profiles = profilesResponse.data as ProfileEntity[];
          const total = profilesResponse.count ?? 0;

          return from(this.supabase.auth.admin.listUsers()).pipe(
            map((usersResponse) => {
              if (usersResponse.error) throw usersResponse.error;
              const users = usersResponse.data.users;

              const viewModels = profiles.map((profile) => {
                const user = users.find((u) => u.id === profile.id) || {
                  id: profile.id,
                };
                return UserMappers.toListItem(user, profile);
              });

              return { users: viewModels, total };
            })
          );
        })
      );
    }),
    catchError((error) => {
      console.error('Error obteniendo usuarios operadores:', error);
      return throwError(
        () => new Error(`Error obteniendo usuarios operadores: ${error.message}`)
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
          switchMap((profileResponse) => {
            if (profileResponse.error) throw profileResponse.error;
            const profile = profileResponse.data as ProfileEntity;

            return from(this.supabase.auth.admin.getUserById(userId)).pipe(
              map((userResponse) => {
                if (userResponse.error) throw userResponse.error;
                const user = userResponse.data.user;

                return UserMappers.toDetail(user, profile);
              })
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

  updateUserInfo(userId: string, request: UpdateUserInfoRequest): Observable<void> {
  return this.authService.isUserAdmin().pipe(
    switchMap((isAdmin) => {
      if (!isAdmin) {
        return throwError(() => new Error('No autorizado'));
      }

      return from(
        this.supabase
          .from('profiles')
          .update({
            full_name: `${request.first_name} ${request.last_name}`.trim(),
            first_name: request.first_name,
            last_name: request.last_name,
          })
          .eq('id', userId)
      ).pipe(
        map((response) => {
          if (response.error) throw response.error;
          return;
        })
      );
    }),
    catchError((error) => {
      console.error('Error actualizando datos del usuario:', error);
      return throwError(
        () => new Error(`Error al actualizar datos: ${error.message}`)
      );
    })
  );
}
}
