import { PaginationParams } from '../../interfaces/pagination.interface';

export interface TagFilterViewModel extends PaginationParams {
  search?: string;
  isGlobal?: boolean;
  isValid?: boolean;
}
