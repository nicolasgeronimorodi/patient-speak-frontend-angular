import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { Transcription, CreateTranscriptionRequest } from '../models';
import { 
  TranscriptionListItem, 
  TranscriptionDetail, 
  TranscriptionFormModel,
  TranscriptionMappers 
} from '../models/transcription-view-models';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  private supabase: SupabaseClient;
  
  constructor(
    private supabaseBase: SupabaseClientBaseService, 
    private authService: AuthService
  ) {
    this.supabase = this.supabaseBase.getClient();
  }
  
  private generateTitle(content: string): string {
    const words = content.split(' ');
    if (words.length <= 5) return content;
    return words.slice(0, 5).join(' ') + '...';
  }
  
  saveTranscription(formModel: TranscriptionFormModel): Observable<TranscriptionDetail> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Debes iniciar sesión para guardar transcripciones'));
        }
        
        // Convertir de ViewModel a modelo DB
        const dbModel = TranscriptionMappers.fromForm(formModel);
        
        return from(
          this.supabase
            .from('transcriptions')
            .insert([{
              ...dbModel,
              user_id: user.id,
              // Si no se proporciona título, generarlo a partir del contenido
              title: formModel.title || this.generateTitle(formModel.content)
            }])
            .select()
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            // Convertir respuesta a ViewModel
            return TranscriptionMappers.toDetail(response.data[0] as Transcription);
          })
        );
      }),
      catchError(error => throwError(() => new Error(`Error al guardar la transcripción: ${error.message}`)))
    );
  }
  
  // Sobrecarga del método para mantener compatibilidad con el código existente
  saveTranscriptionSimple(content: string, language: string): Observable<TranscriptionDetail> {
    const formModel: TranscriptionFormModel = {
      content,
      language,
      title: this.generateTitle(content)
    };
    return this.saveTranscription(formModel);
  }
  
  getUserTranscriptions(): Observable<TranscriptionListItem[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Debes iniciar sesión para ver las transcripciones'));
        }
        
        return from(
          this.supabase
            .from('transcriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            // Convertir cada elemento a ViewModel
            return (response.data as Transcription[] || [])
              .map(transcription => TranscriptionMappers.toListItem(transcription));
          })
        );
      }),
      catchError(error => throwError(() => new Error(`Error al obtener transcripciones: ${error.message}`)))
    );
  }
  
  getTranscriptionById(id: string): Observable<TranscriptionDetail> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Debes iniciar sesión para ver la transcripción'));
        }
        
        return from(
          this.supabase
            .from('transcriptions')
            .select('*')
            .eq('id', id)
            .single()
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            // Convertir a ViewModel de detalle
            return TranscriptionMappers.toDetail(response.data as Transcription);
          })
        );
      }),
      catchError(error => throwError(() => new Error(`Error al obtener la transcripción: ${error.message}`)))
    );
  }
  
  updateTranscription(id: string, formModel: TranscriptionFormModel): Observable<TranscriptionDetail> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Debes iniciar sesión para actualizar la transcripción'));
        }
        
        // Convertir de ViewModel a modelo DB
        const dbModel = TranscriptionMappers.fromForm(formModel);
        
        return from(
          this.supabase
            .from('transcriptions')
            .update({ 
              ...dbModel,
              updated_at: new Date().toISOString() 
            })
            .eq('id', id)
            .eq('user_id', user.id) // Seguridad adicional
            .select()
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            // Convertir a ViewModel
            return TranscriptionMappers.toDetail(response.data[0] as Transcription);
          })
        );
      }),
      catchError(error => throwError(() => new Error(`Error al actualizar la transcripción: ${error.message}`)))
    );
  }
  
  deleteTranscription(id: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Debes iniciar sesión para eliminar la transcripción'));
        }
        
        return from(
          this.supabase
            .from('transcriptions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id) // Seguridad adicional
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            return;
          })
        );
      }),
      catchError(error => throwError(() => new Error(`Error al eliminar la transcripción: ${error.message}`)))
    );
  }
}