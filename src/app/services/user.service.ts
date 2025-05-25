import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { CreateUserRequest, UserListItem, UserDetail, UserMappers } from '../models/user-view-models';
import { Role } from '../models/role.interface';
import { Profile } from '../models/profile.interface';

@Injectable({
  providedIn: 'root'
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
  return this.authService.getCurrentUser().pipe(
    switchMap(user => {
      if (!user) {
        return throwError(() => new Error('Usuario no autenticado'));
      }

      return from(
        this.supabase
          .rpc('has_permission', {
            permission_name: permissionName
          })
      ).pipe(
        map(response => {
          if (response.error) throw response.error;
          return response.data as boolean;
        })
      );
    }),
    catchError(error => {
      console.error('Error verificando permiso:', permissionName, error);
      return of(false); // falla segura: sin permiso
    })
  );
}



  // Verificar si el usuario actual tiene permiso para gestionar usuarios
  hasUserManagePermission(): Observable<boolean> {

    //TODO: Utilizar el método hasUserPermission
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Usuario no autenticado'));
        }

        return from(
          this.supabase
            .rpc('has_permission', { 
              permission_name: 'user:manage'
            })
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            return response.data as boolean;
          })
        );
      }),
      catchError(error => {
        console.error('Error verificando permisos:', error);
        return throwError(() => new Error(`Error verificando permisos: ${error.message}`));
      })
    );
  }

  // Obtener todos los roles disponibles
  getRoles(): Observable<Role[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Usuario no autenticado'));
        }

        return from(
          this.supabase
            .from('roles')
            .select('*')
            .order('id')
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            return response.data as Role[] || [];
          })
        );
      }),
      catchError(error => {
        console.error('Error obteniendo roles:', error);
        return throwError(() => new Error(`Error obteniendo roles: ${error.message}`));
      })
    );
  }

  // Crear un nuevo usuario
  createUser(userData: CreateUserRequest): Observable<UserDetail> {
    return this.hasUserManagePermission().pipe(
      switchMap(hasPermission => {
        if (!hasPermission) {
          return throwError(() => new Error('No tienes permiso para gestionar usuarios'));
        }

        // Paso 1: Crear usuario en auth.users
        return from(
          this.supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true
          })
        ).pipe(
          switchMap(userResponse => {
            if (userResponse.error) throw userResponse.error;
            const newUser = userResponse.data.user;

            if (!newUser || !newUser.id) {
              throw new Error('Error al crear el usuario');
            }

            // Paso 2: Crear perfil en profiles
            return from(
              this.supabase
                .from('profiles')
                .upsert({
                  id: newUser.id,
                  full_name: userData.full_name || '',
                  role_id: userData.role_id
                })
            ).pipe(
              switchMap(profileResponse => {
                if (profileResponse.error) throw profileResponse.error;

                // Paso 3: Obtener el perfil completo con datos del rol
                return from(
                  this.supabase
                    .from('profiles')
                    .select(`
                      *,
                      role:role_id (
                        id,
                        name,
                        description
                      )
                    `)
                    .eq('id', newUser.id)
                    .single()
                ).pipe(
                  map(joinResponse => {
                    if (joinResponse.error) throw joinResponse.error;
                    return UserMappers.toDetail(newUser, joinResponse.data as Profile);
                  })
                );
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('Error creando usuario:', error);
        return throwError(() => new Error(`Error creando usuario: ${error.message}`));
      })
    );
  }

  // Obtener lista de usuarios
  getUsers(): Observable<UserListItem[]> {
    return this.hasUserManagePermission().pipe(
      switchMap(hasPermission => {
        if (!hasPermission) {
          return throwError(() => new Error('No tienes permiso para gestionar usuarios'));
        }

        return from(
          this.supabase
            .from('profiles')
            .select(`
              *,
              role:role_id (
                id,
                name,
                description
              )
            `)
            .order('created_at', { ascending: false })
        ).pipe(
          switchMap(profilesResponse => {
            if (profilesResponse.error) throw profilesResponse.error;
            const profiles = profilesResponse.data as Profile[];

            // Obtener detalles de usuarios desde auth.users
            return from(this.supabase.auth.admin.listUsers()).pipe(
              map(usersResponse => {
                if (usersResponse.error) throw usersResponse.error;
                const users = usersResponse.data.users;

                // Mapear usuarios con sus perfiles
                return profiles.map(profile => {
                  const user = users.find(u => u.id === profile.id) || { id: profile.id };
                  return UserMappers.toListItem(user, profile);
                });
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('Error obteniendo usuarios:', error);
        return throwError(() => new Error(`Error obteniendo usuarios: ${error.message}`));
      })
    );
  }
}
