import { PaginationParams } from '../pagination.interface';

export interface TranscriptionFilterViewModel extends PaginationParams {
  search?: string;
  tagId?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}
