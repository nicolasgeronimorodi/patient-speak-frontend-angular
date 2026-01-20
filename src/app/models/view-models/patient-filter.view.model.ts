import { PaginationParams } from '../../interfaces/pagination.interface';

export interface PatientFilterViewModel extends PaginationParams {
  search?: string;
}
