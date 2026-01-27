import { PaginationParams } from '../../interfaces/pagination.interface';

/**
 * Filter model for querying transcriptions.
 * Extends PaginationParams for page/pageSize support.
 */
export interface TranscriptionFilterViewModel extends PaginationParams {
  /** Full-text search query (optional) */
  search?: string;

  /** Filter by validity status */
  isValid: boolean;

  /** Filter by tag ID (optional) */
  tagId?: string;

  /** Filter by operator user ID (optional) */
  operatorUserId?: string;

  /** Filter by patient ID (optional) */
  patientId?: string;

  /** Filter by creation date from (optional) */
  createdAtFrom?: Date;

  /** Filter by creation date to (optional) */
  createdAtTo?: Date;

  // Props populated internally by the service
  /** Current user ID (populated by service) */
  userId?: string;

  /** Whether user has access to all transcriptions (populated by service) */
  hasAccessToAll?: boolean;
}
