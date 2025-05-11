import { Injectable } from '@angular/core';
import {SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, catchError, from, map, Observable, of } from 'rxjs';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { AuthResponse, UserProfile } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null)

  public currentUser$ = this.currentUser.asObservable();
  constructor(private supabaseBaseClient: SupabaseClientBaseService) { 
    this.supabase = this.supabaseBaseClient.getClient();

    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.next(data.session?.user || null);
    });

    this.supabase.auth.onAuthStateChange( (event, session) => {
      this.currentUser.next(session?.user || null);
    });
  }

  signUp(email: string, password: string): Observable<AuthResponse> {
    return from(this.supabase.auth.signUp({ email, password }))
      .pipe(
        map(response => {
          if (response.error) throw response.error;
          return { user: response.data.user as UserProfile };
        }),
        catchError(error => {
          return of({ user: null, error: error.message || 'Error durante el registro' });
        })
      );
  }

  signIn(email: string, password: string): Observable<AuthResponse> {
    return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
      map(response => {
        if (response.error) throw response.error;
        return { user: response.data.user as UserProfile };
      }),
      catchError(error => {
        console.error('Error durante el inicio de sesión:', error);
        return of({ user: null, error: error.message || 'Error durante el inicio de sesión' });
      })
    );
  }

  signOut(): Observable<void> {
    return from(this.supabase.auth.signOut()).pipe(
      map(response => {
        if (response.error) throw response.error;
        return;
      }),
      catchError(error => {
        console.error('Error durante el cierre de sesión:', error);
        throw error;
      })
    );
  }
  
  isAuthenticated(): Observable<boolean> {
    return from(this.supabase.auth.getSession()).pipe(
      map(({ data }) => !!data.session),
      catchError(error => {
        console.error('Error al verificar autenticación:', error);
        return of(false);
      })
    );
  }

  isUserAdmin(): Observable<boolean>{
    return of(false);  

  //TODO: Implementar contra DB.
  }
  
  getCurrentUser(): Observable<User | null> {
    return from(this.supabase.auth.getSession()).pipe(
      map(({ data }) => data.session?.user || null),
      catchError(error => {
        console.error('Error al obtener usuario actual:', error);
        return of(null);
      })
    );
  }




}
