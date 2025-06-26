import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  catchError,
  forkJoin,
  from,
  map,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthService } from './auth.service';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { TranscriptionEntity } from '../models/database-models/transcription/transcription.interface';

import {
  PaginatedResult,
  PaginationParams,
} from '../interfaces/common/pagination.interface';
import { UserService } from './user.service';
import { TranscriptionListItemViewModel } from '../models/view-models/transcription-list-item.view.model';
import { TranscriptionDetailViewModel } from '../models/view-models/transcription-detail.view.model';
import { TranscriptionFormViewModel } from '../models/view-models/transcription-form.view.model';
import { TranscriptionMappers } from '../models/mappers/transcription.mapping';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TranscriptionFilterViewModel } from '../interfaces/common/filterViewModels/transcriptionFilterViewModel';

@Injectable({
  providedIn: 'root',
})
export class TranscriptionService {
  private supabase: SupabaseClient;

  constructor(
    private supabaseBase: SupabaseClientBaseService,
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient
  ) {
    this.supabase = this.supabaseBase.getClient();
  }

  private generateTitle(content: string): string {
    const words = content.split(' ');
    if (words.length <= 5) return content;
    return words.slice(0, 5).join(' ') + '...';
  }

  saveTranscription(
    formModel: TranscriptionFormViewModel
  ): Observable<TranscriptionDetailViewModel> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () => new Error('Debes iniciar sesión para guardar transcripciones')
          );
        }

        // Convertir de ViewModel a modelo DB
        const dbModel = TranscriptionMappers.fromForm(formModel);
        //debugger;
        return from(
          this.supabase
            .from('transcriptions')
            .insert([
              {
                ...dbModel,
                user_id: user.id,
                // Si no se proporciona título, generarlo a partir del contenido
                title: formModel.title || this.generateTitle(formModel.content),
              },
            ])
            .select()
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            // Convertir respuesta a ViewModel
            return TranscriptionMappers.toDetail(
              response.data[0] as TranscriptionEntity
            );
          })
        );
      }),
      catchError((error) =>
        throwError(
          () => new Error(`Error al guardar la transcripción: ${error.message}`)
        )
      )
    );
  }

  getUserTranscriptions(): Observable<TranscriptionListItemViewModel[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () => new Error('Debes iniciar sesión para ver las transcripciones')
          );
        }

        return from(
          this.supabase
            .from('transcriptions')
            .select('*, tag:tags!transcriptions_tag_id_fkey(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            // Convertir cada elemento a ViewModel
            return ((response.data as TranscriptionEntity[]) || []).map(
              (transcription) => TranscriptionMappers.toListItem(transcription)
            );
          })
        );
      }),
      catchError((error) =>
        throwError(
          () => new Error(`Error al obtener transcripciones: ${error.message}`)
        )
      )
    );
  }

  
  getPaginatedVisibleTranscriptionsRefactor(
    filters: TranscriptionFilterViewModel
  ): Observable<PaginatedResult<TranscriptionListItemViewModel>> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('No autenticado');
        return this.userService
          .hasUserPermission('transcription:read:all')
          .pipe(map((hasAccessToAll) => ({ user, hasAccessToAll })));
      }),
      switchMap(({ user, hasAccessToAll }) => {
        const fromPage = (filters.page - 1) * filters.pageSize;
        const toPage = fromPage + filters.pageSize - 1;

        const search = filters.search?.trim();

        // Si hay búsqueda, usar función RPC optimizada
        if (search) {
          const rpc$ = this.supabase.rpc('search_transcriptions_paginated', {
            p_query: search,
            p_user_id: user.id,
            p_has_access_to_all: hasAccessToAll,
            p_limit: filters.pageSize,
            p_offset: fromPage,
          });

          const count$ = this.supabase.rpc('count_transcriptions_search', {
            p_query: search,
            p_user_id: user.id,
            p_has_access_to_all: hasAccessToAll,
          });

          return forkJoin([from(rpc$), from(count$)]).pipe(
            map(([dataRes, countRes]) => {
              if (dataRes.error) throw dataRes.error;
              if (countRes.error) throw countRes.error;

              return {
                items: (dataRes.data ?? []).map(
                  TranscriptionMappers.toListItem
                ),
                total: countRes.data ?? 0,
                page: filters.page,
                pageSize: filters.pageSize,
              };
            })
          );
        }

        // Sin búsqueda: query tradicional
        let query = this.supabase
          .from('transcriptions')
          .select('*, tag:tags!transcriptions_tag_id_fkey(name)', {
            count: 'exact',
          })
           .eq('is_valid', true)
          .order('created_at', { ascending: false })
          .range(fromPage, toPage);

        if (!hasAccessToAll) {
          query = query.eq('user_id', user.id);
        }

        if(filters.tagId) {
          query = query.eq('tag_id', filters.tagId);
        }

        if (filters.createdAtFrom) {
          query = query.gte('created_at', filters.createdAtFrom);
        }

        if (filters.createdAtTo) {
          query = query.lte('created_at', filters.createdAtTo);
        }

        return from(query).pipe(
          map((response) => {
            if (response.error) throw response.error;

            return {
              items: (response.data ?? []).map(TranscriptionMappers.toListItem),
              total: response.count ?? 0,
              page: filters.page,
              pageSize: filters.pageSize,
            };
          })
        );
      }),
      catchError((error) =>
        throwError(
          () => new Error(`Error al obtener transcripciones: ${error.message}`)
        )
      )
    );
  }

  // getPaginatedVisibleTranscriptions(
  //   params: PaginationParams & { search?: string; tagId?: string; createdAtFrom?: string; createdAtTo?: string; operatorUserId?: string }
  // ): Observable<PaginatedResult<TranscriptionListItemViewModel>> {
  //   return this.authService.getCurrentUser().pipe(
  //     switchMap((user) => {
  //       if (!user) throw new Error('No autenticado');
  //       return this.userService
  //         .hasUserPermission('transcription:read:all')
  //         .pipe(map((hasAccessToAll) => ({ user, hasAccessToAll })));
  //     }),
  //     switchMap(({ user, hasAccessToAll }) => {
  //       const fromPage = (params.page - 1) * params.pageSize;
  //       const toPage = fromPage + params.pageSize - 1;

  //       const search = params.search?.trim();

  //       // Si hay búsqueda, usar función RPC optimizada
  //       if (search) {
  //         const rpc$ = this.supabase.rpc('search_transcriptions_paginated', {
  //           p_query: search,
  //           p_user_id: user.id,
  //           p_has_access_to_all: hasAccessToAll,
  //           p_limit: params.pageSize,
  //           p_offset: fromPage,
  //         });

  //         const count$ = this.supabase.rpc('count_transcriptions_search', {
  //           p_query: search,
  //           p_user_id: user.id,
  //           p_has_access_to_all: hasAccessToAll,
  //         });

  //         return forkJoin([from(rpc$), from(count$)]).pipe(
  //           map(([dataRes, countRes]) => {
  //             if (dataRes.error) throw dataRes.error;
  //             if (countRes.error) throw countRes.error;

  //             return {
  //               items: (dataRes.data ?? []).map(
  //                 TranscriptionMappers.toListItem
  //               ),
  //               total: countRes.data ?? 0,
  //               page: params.page,
  //               pageSize: params.pageSize,
  //             };
  //           })
  //         );
  //       }

  //       // Sin búsqueda: query tradicional
  //       let query = this.supabase
  //         .from('transcriptions')
  //         .select('*, tag:tags!transcriptions_tag_id_fkey(name), profile:profiles(full_name, first_name, last_name)', {
  //           count: 'exact',
  //         })
  //          .eq('is_valid', true)
  //         .order('created_at', { ascending: false })
  //         .range(fromPage, toPage);

  //       if (!hasAccessToAll) {
  //         query = query.eq('user_id', user.id);
  //       }

  //       if (params.operatorUserId) {
  //         query = query.eq('user_id', params.operatorUserId);
  //       }

  //       if(params.tagId) {
  //         query = query.eq('tag_id', params.tagId);
  //       }

  //       if (params.createdAtFrom) {
  //         query = query.gte('created_at', params.createdAtFrom);
  //       }

  //       if (params.createdAtTo) {
  //         query = query.lte('created_at', params.createdAtTo);
  //       }

  //       return from(query).pipe(
  //         map((response) => {
  //           if (response.error) throw response.error;

  //           return {
  //             items: (response.data ?? []).map(TranscriptionMappers.toListItem),
  //             total: response.count ?? 0,
  //             page: params.page,
  //             pageSize: params.pageSize,
  //           };
  //         })
  //       );
  //     }),
  //     catchError((error) =>
  //       throwError(
  //         () => new Error(`Error al obtener transcripciones: ${error.message}`)
  //       )
  //     )
  //   );
  // }

  getPaginatedVisibleTranscriptions(
  params: PaginationParams & {
    search?: string;
    tagId?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    operatorUserId?: string;
  }
): Observable<PaginatedResult<TranscriptionListItemViewModel>> {
  return this.authService.getCurrentUser().pipe(
    switchMap((user) => {
      if (!user) throw new Error('No autenticado');
      return this.userService
        .hasUserPermission('transcription:read:all')
        .pipe(map((hasAccessToAll) => ({ user, hasAccessToAll })));
    }),
    switchMap(({ user, hasAccessToAll }) => {
      const fromPage = (params.page - 1) * params.pageSize;
      const toPage = fromPage + params.pageSize - 1;

      const search = params.search?.trim();

      // Si hay búsqueda, usar función RPC optimizada con filtros adicionales
      if (search) {
        const rpc$ = this.supabase.rpc('search_transcriptions_paginated', {
          p_query: search,
          p_user_id: user.id,
          p_has_access_to_all: hasAccessToAll,
          p_limit: params.pageSize,
          p_offset: fromPage,
          p_tag_id: params.tagId || null,
          p_created_at_from: params.createdAtFrom || null,
          p_created_at_to: params.createdAtTo || null,
          p_operator_user_id: params.operatorUserId || null,
        });

        const count$ = this.supabase.rpc('count_transcriptions_search', {
          p_query: search,
          p_user_id: user.id,
          p_has_access_to_all: hasAccessToAll,
          p_tag_id: params.tagId || null,
          p_created_at_from: params.createdAtFrom || null,
          p_created_at_to: params.createdAtTo || null,
          p_operator_user_id: params.operatorUserId || null,
        });

        return forkJoin([from(rpc$), from(count$)]).pipe(
          map(([dataRes, countRes]) => {
            if (dataRes.error) throw dataRes.error;
            if (countRes.error) throw countRes.error;

            return {
              items: (dataRes.data ?? []).map(
                TranscriptionMappers.toListItem
              ),
              total: countRes.data ?? 0,
              page: params.page,
              pageSize: params.pageSize,
            };
          })
        );
      }

      // Sin búsqueda: query tradicional
      let query = this.supabase
        .from('transcriptions')
        .select(
          '*, tag:tags!transcriptions_tag_id_fkey(name), profile:profiles(full_name, first_name, last_name)',
          { count: 'exact' }
        )
        .eq('is_valid', true)
        .order('created_at', { ascending: false })
        .range(fromPage, toPage);

      if (!hasAccessToAll) {
        query = query.eq('user_id', user.id);
      }

      if (params.operatorUserId) {
        query = query.eq('user_id', params.operatorUserId);
      }

      if (params.tagId) {
        query = query.eq('tag_id', params.tagId);
      }

      if (params.createdAtFrom) {
        query = query.gte('created_at', params.createdAtFrom);
      }

      if (params.createdAtTo) {
        query = query.lte('created_at', params.createdAtTo);
      }

      return from(query).pipe(
        map((response) => {
          if (response.error) throw response.error;

          return {
            items: (response.data ?? []).map(TranscriptionMappers.toListItem),
            total: response.count ?? 0,
            page: params.page,
            pageSize: params.pageSize,
          };
        })
      );
    }),
    catchError((error) =>
      throwError(() => new Error(`Error al obtener transcripciones: ${error.message}`))
    )
  );
}

  getTranscriptionById(id: string): Observable<TranscriptionDetailViewModel> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () => new Error('Debes iniciar sesión para ver la transcripción')
          );
        }

        return from(
          this.supabase
            .from('transcriptions')
            // .select('*, tag:tags!transcriptions_tag_id_fkey(name)')
            .select(`*,tag:tags!transcriptions_tag_id_fkey(name),
                profile:profiles!transcriptions_user_id_fkey(full_name, first_name, last_name)
      `)
            .eq('id', id)
            .single()
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            // Convertir a ViewModel de detalle
            return TranscriptionMappers.toDetailUntyped(
              response.data 
            );
          })
        );
      }),
      catchError((error) =>
        throwError(
          () => new Error(`Error al obtener la transcripción: ${error.message}`)
        )
      )
    );
  }

  updateTranscription(
    id: string,
    formModel: TranscriptionFormViewModel
  ): Observable<TranscriptionDetailViewModel> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () =>
              new Error('Debes iniciar sesión para actualizar la transcripción')
          );
        }

        // Convertir de ViewModel a modelo DB
        const dbModel = TranscriptionMappers.fromForm(formModel);

        return from(
          this.supabase
            .from('transcriptions')
            .update({
              ...dbModel,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id) // Seguridad adicional
            .select()
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            // Convertir a ViewModel
            return TranscriptionMappers.toDetail(
              response.data[0] as TranscriptionEntity
            );
          })
        );
      }),
      catchError((error) =>
        throwError(
          () =>
            new Error(`Error al actualizar la transcripción: ${error.message}`)
        )
      )
    );
  }

  deleteTranscription(id: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () =>
              new Error('Debes iniciar sesión para eliminar la transcripción')
          );
        }

        return from(
          this.supabase
            .from('transcriptions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id) // Seguridad adicional
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            return;
          })
        );
      }),
      catchError((error) =>
        throwError(
          () =>
            new Error(`Error al eliminar la transcripción: ${error.message}`)
        )
      )
    );
  }

  sendTranscriptionToCurrentUserEmail(transcriptionId: string): Observable<any> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user || !user.email)
          throw new Error('Usuario no autenticado o sin email');
        const opt = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.authService.getAccessToken()}`,
          },
        };
        return this.http.post(
          `${environment.supabaseFunctionsUrl}/resend-email-to-user`,
          {
            transcriptionId,
            recipientEmail: user.email,
          },
          opt
        );
      }),
      catchError((error) => {
        console.error('Error enviando transcripción por correo:', error);
        return throwError(
          () => new Error('No se pudo enviar la transcripción por correo.')
        );
      })
    );
  }

  invalidateTranscription(id: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('Debes estar autenticado'));
        }

        return from(
          this.supabase
            .from('transcriptions')
            .update({ is_valid: false })
            .eq('id', id)
            .select()
        ).pipe(
          map((res) => {
            if (res.error) throw res.error;
          })
        );
      }),
      catchError((err) => {
        console.error('Error al invalidar transcripción:', err);
        return throwError(
          () => new Error('No se pudo invalidar la transcripción.')
        );
      })
    );
  }
}
