import { Injectable } from '@angular/core';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { UserService } from './user.service';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { CreateTagResponse } from '../models/response-interfaces/create-tag-response.interface';
import { PaginatedResult } from '../interfaces/pagination.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  constructor(
    private supabase: SupabaseClientBaseService,
    private authService: AuthService
  ) {}

  createGlobalTag(name: string): Observable<CreateTagResponse> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('No autenticado');

        const uid = user.id;
        return from(
          this.supabase
            .getClient()
            .from('tags')
            .insert([{ name, is_global: true, user_id: uid }])
            .select('id, name')
            .single()
        );
      }),
      map((response) => {
        if (response.error) throw response.error;
        return response.data as CreateTagResponse;
      }),
      catchError((err) => {
        console.error('Error creating tag:', err);
        return throwError(() => new Error('No se pudo crear la categoría'));
      })
    );
  }

  // createGlobalTag(name: string): Observable<CreateTagResponse> {

  //   return this.userService.hasUserPermission('tags:create:all').pipe(
  //     switchMap((hasPermission) => {
  //       if (!hasPermission) throw new Error('No permission to create tags');

  //       // 🔽 Obtener UID desde Supabase
  //       const user = this.supabase.getClient().auth.getUser();

  //       return from(user).pipe(
  //         tap((result) => {
  //           const uid = result.data?.user?.id;

  //         }),
  //         switchMap(() =>
  //           from(
  //             this.supabase.getClient()
  //               .from('tags')
  //               .insert([{ name, is_global: true, user_id: uid }])
  //               .select('id, name')
  //               .single()
  //           )
  //         )
  //       );
  //     }),
  //     map((response) => {
  //       if (response.error) throw response.error;
  //       return response.data as CreateTagResponse;
  //     }),
  //     catchError((err) => {
  //       console.error('Error creating tag:', err);
  //       return throwError(() => new Error('No se pudo crear la categoría'));
  //     })
  //   );
  // }

  getPaginatedGlobalTags(params: {
    page: number;
    pageSize: number;
  }): Observable<PaginatedResult<CreateTagResponse>> {
    const fromIndex = (params.page - 1) * params.pageSize;
    const toIndex = fromIndex + params.pageSize - 1;

    return from(
      this.supabase
        .getClient()
        .from('tags')
        .select('id, name', { count: 'exact' })
        .eq('is_global', true)
        .order('name', { ascending: true })
        .range(fromIndex, toIndex)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return {
          items: response.data as CreateTagResponse[],
          total: response.count ?? 0,
          page: params.page,
          pageSize: params.pageSize,
        };
      }),
      catchError((err) => {
        console.error('Error fetching tags:', err);
        return throwError(
          () => new Error('No se pudieron cargar las categorías')
        );
      })
    );
  }

  getAllGlobalTags(): Observable<CreateTagResponse[]> {
    return from(
      this.supabase
        .getClient()
        .from('tags')
        .select('id, name')
        .eq('is_global', true)
        .order('name', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as CreateTagResponse[];
      }),
      catchError((err) => {
        console.error('Error fetching global tags:', err);
        return of([]);
      })
    );
  }
}
