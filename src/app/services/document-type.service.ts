import { Injectable } from '@angular/core';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { catchError, from, map, Observable, of, throwError } from 'rxjs';
import { DocumentTypeEntity } from '../models/database-models/document-type/document-type.interface';
import { DocumentTypeViewModel } from '../models/view-models/document-type.view.model';
import { DocumentTypeMappers } from '../models/mappers/document-type.mapping';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeService {
  private cachedDocumentTypes: DocumentTypeViewModel[] | null = null;

  constructor(private supabase: SupabaseClientBaseService) {}

  /**
   * Fetches all document types from the database.
   * Results are cached after first load to avoid repeated queries.
   * @returns Observable of document type view models array
   */
  getDocumentTypes(): Observable<DocumentTypeViewModel[]> {
    if (this.cachedDocumentTypes) {
      return of(this.cachedDocumentTypes);
    }

    return from(
      this.supabase
        .getClient()
        .from('document_types')
        .select('*')
        .order('id', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        const viewModels = (response.data as DocumentTypeEntity[]).map(
          DocumentTypeMappers.toViewModel
        );
        this.cachedDocumentTypes = viewModels;
        return viewModels;
      }),
      catchError((err) => {
        console.error('Error fetching document types:', err);
        return throwError(
          () => new Error('No se pudieron cargar los tipos de documento')
        );
      })
    );
  }

  clearCache(): void {
    this.cachedDocumentTypes = null;
  }
}
