import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEventFilterFixed } from '../../interfaces/common/lazyLoadEventExtensions';
import { FilterMetadata } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

@Injectable({
  providedIn: 'root',
})
export class TableFilterQueryParamHandlerService {
  constructor(private route: ActivatedRoute, private router: Router) {}

  getLazyLoadEventByQueryParams(
    defaultFilters: { [s: string]: any } = {},
    pageSize: number = 10
  ): TableLazyLoadEvent {
    let queryParams = this.route.snapshot.queryParams;
    const filters: { [s: string]: FilterMetadata | FilterMetadata[] | undefined } = {};

    queryParams = { ...defaultFilters, ...queryParams };

    Object.keys(queryParams).forEach((key) => {
      const value = this.getValueByJson(queryParams[key]);

      if (!value) return;

      if (Array.isArray(value) && value.some((p) => this.isDate(p))) {
        filters[key] = [
          { value: value.map((p) => (this.isDate(p) ? new Date(p) : p)) }
        ];
      } else if (this.isDate(value)) {
        filters[key] = [{ value: new Date(value) }];
      } else if (key === 'global') {
        filters[key] = { value: value };
      } else {
        filters[key] = [{ value: value }];
      }
    });

    return {
      first: this.isNumber(queryParams['first']) ? Number(queryParams['first']) : 0,
      rows: this.isNumber(queryParams['rows']) ? Number(queryParams['rows']) : pageSize,
      filters,
      multiSortMeta: queryParams['multiSortMeta'],
      sortField: queryParams['sortField'],
      sortOrder: queryParams['sortOrder'],
    };
  }

  getNormalizedFiltersToObject(filters: {
    [s: string]: FilterMetadata | FilterMetadata[] | undefined;
  }): { [s: string]: FilterMetadata } {
    const normalizedFilters: { [s: string]: FilterMetadata } = {};

    Object.keys(filters).forEach((key) => {
      const val = filters[key];
      if (val === undefined) return;
      normalizedFilters[key] = this.getNormalizedFilterValue(
        filters as { [s: string]: FilterMetadata | FilterMetadata[] },
        key
      );
    });

    return normalizedFilters;
  }

  updateQueryParamsByLazyLoadEvent(event: TableLazyLoadEvent) {
    const queryParams: any = {};

    Object.keys(event).forEach((key) => {
      const value = (event as any)[key];

      if (key === 'forceUpdate' || key === 'globalFilter' || key === 'sortOrder') return;

      if (key === 'filters') {
        Object.keys(value || {}).forEach((filterKey) => {
          if (event.hasOwnProperty(filterKey)) return;

          const filter = value[filterKey];
          const filterValue =
            Array.isArray(filter) && filter.length > 0
              ? filter[0].value
              : (filter as FilterMetadata).value;

          if (Array.isArray(filterValue)) {
            queryParams[filterKey] =
              filterValue.length > 0 ? JSON.stringify(filterValue) : undefined;
          } else if (filterValue !== null && filterValue !== undefined) {
            queryParams[filterKey] = JSON.stringify(filterValue);
          } else {
            queryParams[filterKey] = undefined;
          }
        });
      } else if (value !== null && value !== undefined) {
        queryParams[key] = value;
      } else {
        queryParams[key] = undefined;
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });

    return queryParams;
  }

  private getNormalizedFilterValue(
    filters: { [s: string]: FilterMetadata | FilterMetadata[] },
    key: string
  ): FilterMetadata {
    const filter = filters[key];
    if (Array.isArray(filter)) {
      return filter[0];
    }
    return filter;
  }

  private isNumber(value: any): boolean {
    return (
      typeof value === 'number' ||
      (!isNaN(Number(value)) && this.isInteger(Number(value)))
    );
  }

  private isInteger(number: number): boolean {
    return number % 1 === 0;
  }

  private isDate(value?: string): boolean {
    if (!value || !isNaN(Number(value))) return false;

    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  private getValueByJson(property?: any): any {
    if (!property) return undefined;

    try {
      return JSON.parse(property);
    } catch {
      return this.isValidType(property) ? property : undefined;
    }
  }

  private isValidType(value: any): boolean {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      return true;
    }
    return false;
  }
}