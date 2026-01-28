import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientBaseService } from '../supabase-client-base.service';
import { from, map, Observable } from 'rxjs';
import { TranscriptionsPerDay } from '../../models/response-interfaces/transcriptions-per-day-response.interface';

export interface AnalyticsDateFilter {
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptionAnalyticsService {
  private supabase: SupabaseClient;

  constructor(private supabaseBase: SupabaseClientBaseService) {
    this.supabase = this.supabaseBase.getClient();
  }

  /**
   * Retrieves transcription counts grouped by category (tag).
   * Only includes valid transcriptions (is_valid = true).
   * Supports optional date range filtering.
   */
  getTranscriptionCountsByCategory(
    filter?: AnalyticsDateFilter
  ): Observable<{ category: string; count: number }[]> {
    let query = this.supabase
      .from('transcriptions')
      .select('tag_id, tags(name)', { count: 'exact' })
      .eq('is_valid', true);

    if (filter?.dateFrom) {
      query = query.gte('created_at', filter.dateFrom.toISOString());
    }
    if (filter?.dateTo) {
      const endOfDay = new Date(filter.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endOfDay.toISOString());
    }

    return from(query).pipe(
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

  /**
   * Retrieves transcription counts grouped by day.
   * Only includes valid transcriptions (is_valid = true).
   * Supports optional date range filtering.
   */
  getTranscriptionsGroupedByDay(
    filter?: AnalyticsDateFilter
  ): Observable<TranscriptionsPerDay[]> {
    let query = this.supabase
      .from('transcriptions')
      .select('created_at')
      .eq('is_valid', true);

    if (filter?.dateFrom) {
      query = query.gte('created_at', filter.dateFrom.toISOString());
    }
    if (filter?.dateTo) {
      const endOfDay = new Date(filter.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endOfDay.toISOString());
    }

    query = query.order('created_at', { ascending: true });

    return from(query).pipe(
      map(response => {
        if (response.error) {
          throw response.error;
        }

        const countsByDay: { [key: string]: number } = {};

        (response.data as any[]).forEach(item => {
          const date = item.created_at.split('T')[0];
          countsByDay[date] = (countsByDay[date] || 0) + 1;
        });

        return Object.entries(countsByDay).map(([date, count]) => ({
          date,
          count
        }));
      })
    );
  }
}
