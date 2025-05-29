import { Injectable } from '@angular/core';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { CreateObservationRequest } from '../models/create-observation-request';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import {
  PaginatedResult,
  PaginationParams,
} from '../interfaces/pagination.interface';
import { ObservationMappers } from '../models/mappers/observation.mapping';
import { ObservationViewModel } from '../models/view-models/observation.view.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ObservationsService {
  private supabase: SupabaseClient;

  constructor(
    private supabaseBase: SupabaseClientBaseService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.supabase = this.supabaseBase.getClient();
  }

  createObservation(
    transcriptionId: string,
    content: string
  ): Observable<void> {
    if (!transcriptionId || !content?.trim()) {
      return throwError(
        () => new Error('Transcription ID and content are required.')
      );
    }

    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user || !user.id) {
          return throwError(() => new Error('User is not authenticated.'));
        }

        const payload = {
          transcription_id: transcriptionId, // ← columna de la tabla
          content: content.trim(),
          created_by: user.id, // ← columna de la tabla
        };

        return from(this.supabase.from('observations').insert([payload]));
      }),
      map((response) => {
        if (response.error) throw response.error;
        return;
      }),
      catchError((error) => {
        console.error('Error al crear observación:', error);
        return throwError(
          () => new Error('No se pudo guardar la observación.')
        );
      })
    );
  }

  getPaginatedObservationsForTranscription(
    params: PaginationParams & { transcriptionId: string }
  ): Observable<PaginatedResult<ObservationViewModel>> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('No autenticado');
        return this.userService
          .hasUserPermission('observation:read:all')
          .pipe(map((hasAccessToAll) => ({ user, hasAccessToAll })));
      }),
      switchMap(({ user, hasAccessToAll }) => {
        const fromPage = (params.page - 1) * params.pageSize;
        const toPage = fromPage + params.pageSize - 1;

        let query = this.supabase
          .from('observations')
          .select('*', { count: 'exact' })
          .eq('transcription_id', params.transcriptionId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .range(fromPage, toPage);

        if (!hasAccessToAll) {
          query = query.eq('created_by', user.id);
        }

        return from(query).pipe(
          map((response) => {
            if (response.error) throw response.error;

            return {
              items: (response.data ?? []).map(ObservationMappers.toViewModel),
              total: response.count ?? 0,
              page: params.page,
              pageSize: params.pageSize,
            };
          })
        );
      }),
      catchError((error) =>
        throwError(
          () => new Error(`Error al obtener observaciones: ${error.message}`)
        )
      )
    );
  }
}
