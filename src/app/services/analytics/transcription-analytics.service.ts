import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientBaseService } from '../supabase-client-base.service';
import { from, map, Observable } from 'rxjs';
import { TranscriptionsPerDay } from '../../models/response-interfaces/transcriptions-per-day-response.interface';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionAnalyticsService {
  private supabase: SupabaseClient;

  constructor(private supabaseBase: SupabaseClientBaseService) {
    this.supabase = this.supabaseBase.getClient();
  }

  getTranscriptionCountsByCategory(): Observable<{ category: string; count: number }[]> {
    return from(
      this.supabase
        .from('transcriptions')
        .select('tag_id, tags(name)', { count: 'exact' })
    ).pipe(
      map(response => {
        if (response.error) {
          throw response.error;
        }

        const counts: { [key: string]: number } = {};

        (response.data as any[]).forEach(item => {
          const category = item.tags?.name || 'Sin categoría';
          counts[category] = (counts[category] || 0) + 1;
        });

        return Object.entries(counts).map(([category, count]) => ({ category, count }));
      })
    );
  }

  
  getTranscriptionsGroupedByDay() {
    const query = `
      SELECT to_char(created_at, 'YYYY-MM-DD') as date, count(*) as count
      FROM transcriptions
      GROUP BY date
      ORDER BY date
    `;

    return from(this.supabaseBase.getClient().rpc('execute_raw_sql', { sql: query }))
      .pipe(map((res: any) => res.data as TranscriptionsPerDay[]));
  }
}
