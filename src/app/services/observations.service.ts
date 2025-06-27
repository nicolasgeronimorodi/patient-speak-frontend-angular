import { Injectable } from '@angular/core';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import {
  PaginatedResult,
  PaginationParams,
} from '../interfaces/common/pagination.interface';
import { ObservationMappers } from '../models/mappers/observation.mapping';
import { ObservationViewModel } from '../models/view-models/observation.view.model';
import { UserService } from './user.service';
import { CreateObservationRequest } from '../models/request-interfaces/create-observation-request.interface';
import {
  PermissionContextService,
  ActionTypeEnum,
  EntityTypeEnum,
} from './permission-context.service';
import { ObservationActionKey } from '../enums/observation-action-key';

@Injectable({
  providedIn: 'root',
})
export class ObservationsService {
  private supabase: SupabaseClient;

  constructor(
    private supabaseBase: SupabaseClientBaseService,
    private authService: AuthService,
    private userService: UserService,
    private permissionContextService: PermissionContextService
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
          user_id: user.id, // ← columna de la tabla
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

        return from(
          this.supabase
            .from('transcriptions')
            .select('user_id')
            .eq('id', params.transcriptionId)
            .single()
        ).pipe(
          switchMap((response) => {
            if (response.error) throw response.error;

            const transcriptionOwnerId = response.data?.user_id;
            const isOwner = transcriptionOwnerId === user.id;

            const actionId = ActionTypeEnum.ReadObservations;
            const entityId = EntityTypeEnum.Transcription;
            const resourceId = isOwner ? params.transcriptionId : null;

            return this.permissionContextService
              .validateAuthorizationForAction(actionId, entityId, resourceId)
              .pipe(map((canView) => ({ canView })));
          }),
          map(({ canView }) => {
            if (!canView)
              throw new Error('No permission to view these observations');
            return true;
          })
        );
      }),
      switchMap(() => {
        const fromPage = (params.page - 1) * params.pageSize;
        const toPage = fromPage + params.pageSize - 1;

        return from(
          this.supabase
            .from('observations')
            .select(
              `*,profile:profiles!observations_user_id_fkey1(full_name)`,
              { count: 'exact' }
            )
            .eq('transcription_id', params.transcriptionId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .range(fromPage, toPage)
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
               console.log('OBSERVATIONS RAW:', response.data); // <-
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
