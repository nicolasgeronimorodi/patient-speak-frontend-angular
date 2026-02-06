import { Injectable } from '@angular/core';
import { Observable, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SupabaseClientBaseService } from './supabase-client-base.service';
import { PaginatedResult } from '../interfaces/pagination.interface';
import { AuditLogEntity } from '../models/database-models/audit-log/audit-log.interface';
import { AuditLogViewModel } from '../models/view-models/audit-log.view.model';
import { AuditLogMappers } from '../models/mappers/audit-log.mapping';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  constructor(private supabase: SupabaseClientBaseService) {}

  /**
   * Fetches paginated audit logs for a specific patient, including logs from
   * related transcriptions and observations. Uses forkJoin to parallelize
   * the data and count RPC calls.
   */
  getPatientAuditLogs(
    patientId: string,
    page: number,
    pageSize: number
  ): Observable<PaginatedResult<AuditLogViewModel>> {
    const offset = (page - 1) * pageSize;

    const data$ = from(
      this.supabase.getClient().rpc('get_patient_audit_logs', {
        p_patient_id: patientId,
        p_limit: pageSize,
        p_offset: offset,
      })
    );

    const count$ = from(
      this.supabase.getClient().rpc('count_patient_audit_logs', {
        p_patient_id: patientId,
      })
    );

    return forkJoin([data$, count$]).pipe(
      map(([dataResponse, countResponse]) => {
        if (dataResponse.error) throw dataResponse.error;
        if (countResponse.error) throw countResponse.error;

        const items = (dataResponse.data as AuditLogEntity[]).map(
          AuditLogMappers.toViewModel
        );

        return {
          items,
          total: (countResponse.data as number) ?? 0,
          page,
          pageSize,
        };
      }),
      catchError((err) => {
        console.error('Error fetching audit logs:', err);
        return throwError(
          () => new Error('No se pudieron cargar los registros de auditoria')
        );
      })
    );
  }

  logPatientAccess(patientId: string): Observable<void> {
    return from(
      this.supabase
        .getClient()
        .rpc('log_patient_access', { p_patient_id: patientId })
    ).pipe(
      map(() => undefined),
      catchError((err) => {
        console.error('Error logging patient access:', err);
        return of(undefined);
      })
    );
  }
}
