import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientBaseService } from '../supabase-client-base.service';
import { from, map, Observable } from 'rxjs';
import { TranscriptionsPerDay } from '../../models/response-interfaces/transcriptions-per-day-response.interface';
import { TranscriptionsPerDayMapping } from '../../models/mappers/analytics/transcriptions-per-day.mapping';

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

getTranscriptionsGroupedByDay(): Observable<TranscriptionsPerDay[]> {
  return from(this.supabaseBase.getClient().rpc('transcriptions_per_day')).pipe(
    map(res => TranscriptionsPerDayMapping.fromRpcResponseList(res.data ?? []))
  );
}

}
