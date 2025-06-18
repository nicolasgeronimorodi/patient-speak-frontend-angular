import { TranscriptionsPerDay } from "../../response-interfaces/transcriptions-per-day-response.interface";
import { format, parseISO } from 'date-fns';

export class TranscriptionsPerDayMapping {
  static fromRpcResponse(row: any): TranscriptionsPerDay {

      const dateObj = parseISO(row.created_at);
      const localDate = format(dateObj, 'dd-MM-yyyy');

      
      return {
      date: localDate,
      count: row.total
    };
  }

  static fromRpcResponseList(rows: any[]): TranscriptionsPerDay[] {
    return rows.map(this.fromRpcResponse);
  }
}