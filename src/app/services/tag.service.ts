import { Injectable } from '@angular/core';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { CreateTagResponse } from '../models/response-interfaces/create-tag-response.interface';
import { PaginatedResult } from '../interfaces/pagination.interface';
import { AuthService } from './auth.service';
import { TagFilterViewModel } from '../models/view-models/tag-filter.view.model';

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


  /**
   * Fetches paginated global tags with optional search filter.
   * Results are ordered by creation date descending (newest first).
   */
  getPaginatedGlobalTags(
    filter: TagFilterViewModel
  ): Observable<PaginatedResult<CreateTagResponse>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 10;
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    let query = this.supabase
      .getClient()
      .from('tags')
      .select('id, name, created_at', { count: 'exact' })
      .eq('is_global', true)
      .eq('is_valid', true);

    if (filter.search?.trim()) {
      query = query.ilike('name', `%${filter.search.trim()}%`);
    }

    query = query.order('created_at', { ascending: false }).range(fromIndex, toIndex);

    return from(query).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return {
          items: response.data as CreateTagResponse[],
          total: response.count ?? 0,
          page,
          pageSize,
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

  /**
   * Fetches tags with optional filters for isGlobal and isValid.
   * Conditions are only applied when filter values are defined.
   */
  getTagsByFilter(filter: TagFilterViewModel): Observable<CreateTagResponse[]> {
    let query = this.supabase
      .getClient()
      .from('tags')
      .select('id, name');

    if (filter.isGlobal !== undefined) {
      query = query.eq('is_global', filter.isGlobal);
    }

    if (filter.isValid !== undefined) {
      query = query.eq('is_valid', filter.isValid);
    }

    query = query.order('name', { ascending: true });

    return from(query).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as CreateTagResponse[];
      }),
      catchError((err) => {
        console.error('Error fetching tags:', err);
        return of([]);
      })
    );
  }

  /**
   * Soft delete a tag by setting is_valid to false.
   * @param id The ID of the tag to deactivate
   * @returns Observable that completes on success
   */
  deactivateTag(id: string): Observable<void> {
    return from(
      this.supabase
        .getClient()
        .from('tags')
        .update({ is_valid: false })
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
      }),
      catchError((err) => {
        console.error('Error deactivating tag:', err);
        return throwError(() => new Error('No se pudo desactivar la categoría'));
      })
    );
  }
}
