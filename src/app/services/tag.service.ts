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
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private supabase: SupabaseClient;
  constructor(
    private supabaseBase: SupabaseClientBaseService,
    private authService: AuthService
  ) {
    this.supabase = this.supabaseBase.getClient();
  }

  createGlobalTag(name: string): Observable<CreateTagResponse> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('No autenticado');

        const uid = user.id;
        return from(
          this.supabase

            .from('tags')
            .insert([{ name, is_global: true, user_id: uid, is_valid: true }])
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

  getPaginatedGlobalTags(params: {
    page: number;
    pageSize: number;
  }): Observable<PaginatedResult<CreateTagResponse>> {
    const fromIndex = (params.page - 1) * params.pageSize;
    const toIndex = fromIndex + params.pageSize - 1;

    return from(
      this.supabase
        .from('tags')
        .select('id, name', { count: 'exact' })
        .eq('is_global', true)
        .eq('is_valid', true)
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

  invalidateGlobalTag(id: string): Observable<void> {
    return from(
      this.supabase
        .from('tags')
        .update({ is_valid: false })
        .eq('id', id)

    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return;
      }),
      catchError((err) => {
        console.error('Error invalidating tag:', err);
        return throwError(() => new Error('No se pudo invalidar la categoría'));
      })
    );
  }


  updateGlobalTag(id: string, name: string): Observable<void> {
    return from(
      this.supabase
        .from('tags')
        .update({ name })
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return;
      }),
      catchError((err) => {
        console.error('Error updating tag:', err);
        return throwError(() => new Error('No se pudo actualizar la categoría'));
      })
    );
  }

  getGlobalTagById(id: string): Observable<CreateTagResponse> {
  return from(
    this.supabase
      .from('tags')
      .select('id, name')
      .eq('id', id)
      .eq('is_global', true)
      .eq('is_valid', true)
      .single()
  ).pipe(
    map((res) => {
      if (res.error) throw res.error;
      return res.data as CreateTagResponse;
    })
  );
}
}
