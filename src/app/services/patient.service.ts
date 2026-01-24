import { Injectable } from '@angular/core';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { AuthService } from './auth.service';
import {
  catchError,
  from,
  map,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { PaginatedResult } from '../interfaces/pagination.interface';
import { PatientEntity } from '../models/database-models/patient/patient.interface';
import { PatientFilterViewModel } from '../models/view-models/patient-filter.view.model';
import { PatientFormViewModel } from '../models/view-models/patient-form.view.model';
import { PatientListItemViewModel } from '../models/view-models/patient-list-item.view.model';
import { PatientDetailViewModel } from '../models/view-models/patient-detail.view.model';
import { PatientMappers } from '../models/mappers/patient.mapping';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  constructor(
    private supabase: SupabaseClientBaseService,
    private authService: AuthService
  ) {}

  /**
   * Creates a new patient with consent tracking.
   * Requires user to be authenticated.
   */
  createPatient(data: PatientFormViewModel): Observable<PatientEntity> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('Usuario no autenticado'));
        }

        const patientData = {
          ...PatientMappers.fromForm(data),
          user_id: user.id,
        };

        return from(
          this.supabase
            .getClient()
            .from('patients')
            .insert(patientData)
            .select()
            .single()
        ).pipe(
          map((response) => {
            if (response.error) throw response.error;
            return response.data as PatientEntity;
          })
        );
      }),
      catchError((err) => {
        console.error('Error creating patient:', err);
        if (err.code === '23505') {
          return throwError(
            () => new Error('Ya existe un paciente con ese documento')
          );
        }
        return throwError(() => new Error('No se pudo crear el paciente'));
      })
    );
  }

  /**
   * Fetches paginated patients with optional search filter.
   * Search matches against first_name, last_name, or document_number.
   */
  getPaginatedPatients(
    filter: PatientFilterViewModel
  ): Observable<PaginatedResult<PatientListItemViewModel>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 10;
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    let query = this.supabase
      .getClient()
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (filter.search?.trim()) {
      const searchTerm = `%${filter.search.trim()}%`;
      query = query.or(
        `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},document_number.ilike.${searchTerm}`
      );
    }

    query = query
      .order('created_at', { ascending: false })
      .range(fromIndex, toIndex);

    return from(query).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return {
          items: (response.data as PatientEntity[]).map(PatientMappers.toListItem),
          total: response.count ?? 0,
          page,
          pageSize,
        };
      }),
      catchError((err) => {
        console.error('Error fetching patients:', err);
        return throwError(() => new Error('No se pudieron cargar los pacientes'));
      })
    );
  }

  /**
   * Searches patients for autocomplete.
   * Returns up to 10 results matching name or document number.
   */
  searchPatients(query: string, limit = 10): Observable<PatientListItemViewModel[]> {
    if (!query?.trim()) {
      return from([[]]);
    }

    const searchTerm = `%${query.trim()}%`;

    return from(
      this.supabase
        .getClient()
        .from('patients')
        .select('*')
        .eq('is_active', true)
        .or(
          `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},document_number.ilike.${searchTerm}`
        )
        .order('last_name', { ascending: true })
        .limit(limit)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return (response.data as PatientEntity[]).map(PatientMappers.toListItem);
      }),
      catchError((err) => {
        console.error('Error searching patients:', err);
        return throwError(() => new Error('Error en la busqueda de pacientes'));
      })
    );
  }

  /**
   * Fetches a single patient by ID with full details.
   */
  getPatientById(id: string): Observable<PatientDetailViewModel> {
    return from(
      this.supabase
        .getClient()
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return PatientMappers.toDetail(response.data as PatientEntity);
      }),
      catchError((err) => {
        console.error('Error fetching patient:', err);
        return throwError(() => new Error('No se pudo cargar el paciente'));
      })
    );
  }

  /**
   * Soft deletes a patient by setting is_active to false.
   */
  deactivatePatient(id: string): Observable<void> {
    return from(
      this.supabase
        .getClient()
        .from('patients')
        .update({ is_active: false })
        .eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
      }),
      catchError((err) => {
        console.error('Error deactivating patient:', err);
        return throwError(() => new Error('No se pudo desactivar el paciente'));
      })
    );
  }
}
