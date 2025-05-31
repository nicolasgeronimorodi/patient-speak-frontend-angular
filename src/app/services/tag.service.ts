import { Injectable } from '@angular/core';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { UserService } from './user.service';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { CreateTagResponse } from '../models/response-interfaces/create-tag-response.interface';
import { PaginatedResult } from '../interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class TagService {






  constructor(
    private supabase: SupabaseClientBaseService,
    private userService: UserService
  ) {}


  createGlobalTag(name: string): Observable<CreateTagResponse> {
  return this.userService.hasUserPermission('tags:create:all').pipe(
    switchMap((hasPermission) => {
      if (!hasPermission) throw new Error('No permission to create tags');

      return from(
        this.supabase.getClient()
          .from('tags')
          .insert([{ name, is_global: true }])
          .select('id, name') // <- importante: pedimos los campos
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

getPaginatedGlobalTags(params: { page: number; pageSize: number }): Observable<PaginatedResult<CreateTagResponse>> {
  const fromIndex = (params.page - 1) * params.pageSize;
  const toIndex = fromIndex + params.pageSize - 1;

  return from(
    this.supabase.getClient()
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
        pageSize: params.pageSize
      };
    }),
    catchError((err) => {
      console.error('Error fetching tags:', err);
      return throwError(() => new Error('No se pudieron cargar las categorías'));
    })
  );
}

}
