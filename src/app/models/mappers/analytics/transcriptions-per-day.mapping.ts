import { TranscriptionsPerDay } from "../../response-interfaces/transcriptions-per-day-response.interface";

export class TranscriptionsPerDayMapping {
  static fromRpcResponse(row: any): TranscriptionsPerDay {
    return {
      date: row.created_at,
      count: row.total
    };
  }

  static fromRpcResponseList(rows: any[]): TranscriptionsPerDay[] {
    return rows.map(this.fromRpcResponse);
  }
}