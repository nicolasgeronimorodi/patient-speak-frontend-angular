import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { CreateTranscriptionRequest, Transcription } from '../models';

@Injectable({
  providedIn: 'root'
})

export class SupabaseClientService {

  private supabase: SupabaseClient;

  constructor(private supabaseBase: SupabaseClientBaseService, private authService : AuthService) {
    this.supabase = this.supabaseBase.getClient();

  
   }

   private generateTitle(content: string): string {
    // Limitar a las primeras 5-8 palabras o 50 caracteres
    const words = content.split(' ');
    if (words.length <= 5) return content;
    return words.slice(0, 5).join(' ') + '...';
  }

   private async getUserId(): Promise<string> {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (!session || !session.user) {
      throw new Error('Usuario no autenticado');
    }
    
    return session.user.id;
  }

  
  saveTranscription(content: string, language: string): Observable<Transcription>{
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Debes iniciar sesión para guardar transcripciones'));
        }

        const transcriptionData: CreateTranscriptionRequest = {
          content,
          language,
          title: this.generateTitle(content)
        };
        
        
        return from(
          this.supabase
            .from('transcriptions')
            .insert([
              { 
                 transcriptionData,
                title: this.generateTitle(content),
              }
            ])
            .select()
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            console.log('response.error: ', response?.error)
            return response.data[0] as Transcription;
          })
        );
      }),
      catchError(error => throwError(() => new Error(`Error al guardar la transcripción: ${error.message}`)))
    );
  }

  getUserTranscriptions(): Observable<Transcription[]> {
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
            return response.data as Transcription[] || [];
          })
        );
      }),
      catchError(error => throwError(() => new Error(`Error al obtener transcripciones: ${error.message}`)))
    );

}

}














