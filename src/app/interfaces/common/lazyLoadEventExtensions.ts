import {FilterMetadata, LazyLoadEvent, SortMeta} from 'primeng/api';


export interface LazyLoadEventFixed extends Omit<LazyLoadEvent, 'filters'> {
    filters?: {
        [s: string]: FilterMetadata[];
    };
}

// export interface LazyLoadEventFilterFixed extends Omit<LazyLoadEventFixed, 'filters'  > {
//     filters?: {
//         [s: string]: FilterMetadata | FilterMetadata[] | undefined;
//     };
//     rows?: number | null;
//       first?: number | null;
//       last?: number | null;
// }

// export interface LazyLoadEventFilterFixed extends Omit<LazyLoadEvent, 'filters' | 'rows' | 'first' | 'last'> {
//   filters?: {
//     [s: string]: FilterMetadata | FilterMetadata[] | undefined;
//   };
//   rows?: number | null;
//   first?: number | null;
//   last?: number | null;
// }

export interface LazyLoadEventFilterFixed {
  first?: number | null;
  last?: number | null;
  rows?: number | null;
  sortField?: string | string[] | null;
  sortOrder?: number | null;
  filters?: {
    [s: string]: FilterMetadata | FilterMetadata[] | undefined;
  };
  globalFilter?: string | string[] | null;
  multiSortMeta?: SortMeta[] | null;
  forceUpdate?: Function
}