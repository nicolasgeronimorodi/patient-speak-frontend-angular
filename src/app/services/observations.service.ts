import { Injectable } from '@angular/core';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { CreateObservationRequest } from '../models/create-observation-request';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ObservationsService {

    private supabase: SupabaseClient;


    constructor(private supabaseBase: SupabaseClientBaseService, private authService: AuthService) {
    this.supabase = this.supabaseBase.getClient();
  }

  createObservation(transcriptionId: string, content: string): Observable<void> {
    if (!transcriptionId || !content?.trim()) {
      return throwError(() => new Error('Transcription ID and content are required.'));
    }

    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user || !user.id) {
          return throwError(() => new Error('User is not authenticated.'));
        }

        const payload = {
          transcription_id: transcriptionId,  // ← columna de la tabla
          content: content.trim(),
          created_by: user.id  // ← columna de la tabla
        };

        return from(this.supabase.from('observations').insert([payload]));
      }),
      map(response => {
        if (response.error) throw response.error;
        return;
      }),
      catchError(error => {
        console.error('Error al crear observación:', error);
        return throwError(() => new Error('No se pudo guardar la observación.'));
      })
    );
  }
 
}
