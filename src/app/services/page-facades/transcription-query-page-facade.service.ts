import { Injectable, OnDestroy } from '@angular/core';
import { TableFilterQueryParamHandlerService } from '../common/table-filter-query-param-handler.service';
import { DateHandlerService } from '../common/date-handler.service';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import {
  LazyLoadEventFilterFixed,
  LazyLoadEventFixed,
} from '../../interfaces/common/lazyLoadEventExtensions';
import { TranscriptionFilterViewModel } from '../../interfaces/common/filterViewModels/transcriptionFilterViewModel';
import { TranscriptionService } from '../transcription.service';
import { TranscriptionListItemViewModel } from '../../models/view-models/transcription-list-item.view.model';
import { TagService } from '../tag.service';
import { CreateTagResponse } from '../../models/response-interfaces/create-tag-response.interface';
import { TableLazyLoadEvent } from 'primeng/table';

@Injectable({
  providedIn: 'root',
})
export class TranscriptionQueryPageFacadeService implements OnDestroy {
  subs: Subscription = new Subscription();
  // lazyLoadEvent!: TableLazyLoadEvent;

  lazyLoadEvent: TableLazyLoadEvent = {
    first: 0,
    rows: 10,
    filters: {},
  };

  private tagsSubject = new BehaviorSubject<CreateTagResponse[]>([]);
  tags$ = this.tagsSubject.asObservable();

  private entitiesSubject = new BehaviorSubject<
    TranscriptionListItemViewModel[]
  >([]);
  entities$ = this.entitiesSubject.asObservable();

  private totalItemsSubject = new BehaviorSubject<number>(0);
  totalItems$ = this.totalItemsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private tagService: TagService,
    private transcriptionService: TranscriptionService,
    private datesHandlerService: DateHandlerService,
    private tableFilterQueryParamHandlerService: TableFilterQueryParamHandlerService
  ) {}

  resetState(): void {
    this.entitiesSubject.next([]);
    this.totalItemsSubject.next(0);
    this.isLoadingSubject.next(false);
    this.tagsSubject.next([]);

    this.lazyLoadEvent = {
      first: 0,
      rows: 10,
      filters: {},
    };
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

  initialize() {
    this.lazyLoadEvent =
      this.tableFilterQueryParamHandlerService.getLazyLoadEventByQueryParams();
    this.loadGlobalTags();
  }

  loadGlobalTags(): void {
    this.isLoadingSubject.next(true);
    this.subs.add(
      this.tagService.getAllGlobalTags().subscribe({
        next: (tags) => {
          this.tagsSubject.next(tags);
          this.isLoadingSubject.next(false);
        },
        error: (err) => {
          throwError(err);
          this.isLoadingSubject.next(false);
        },
      })
    );
  }

  search(event: TableLazyLoadEvent) {
    const normalizedFilters =
      this.tableFilterQueryParamHandlerService.getNormalizedFiltersToObject(
        event.filters!
      );

    const filtersObj: TranscriptionFilterViewModel = {
      search: normalizedFilters['global']?.value || '',
      tagId: normalizedFilters['tagName']?.value || null,
      createdAtFrom: this.datesHandlerService.convertFromDateISO(
        Array.isArray(normalizedFilters['createdAt']?.value)
          ? normalizedFilters['createdAt']?.value?.[0]
          : undefined
      ),
      createdAtTo: this.datesHandlerService.convertToDateISO(
        Array.isArray(normalizedFilters['createdAt']?.value)
          ? normalizedFilters['createdAt']?.value?.[1]
          : undefined
      ),
      page:
        event.first && event.rows
          ? Math.floor(event.first / event.rows) + 1
          : 1,
      pageSize: event.rows || 10,
    };

    this.tableFilterQueryParamHandlerService.updateQueryParamsByLazyLoadEvent(
      event
    );
    this.loadVisibleTranscriptions(filtersObj);
  }

  loadVisibleTranscriptions(filters: TranscriptionFilterViewModel) {
    this.isLoadingSubject.next(true);
    this.subs.add(
      this.transcriptionService
        .getPaginatedVisibleTranscriptionsRefactor(filters)
        .subscribe({
          next: (result) => {
            this.entitiesSubject.next(result.items);
            this.totalItemsSubject.next(result.total);
            this.isLoadingSubject.next(false);
          },
          error: (err) => {
            this.isLoadingSubject.next(false);
            throwError(err);
          },
        })
    );
  }

  deactivateTranscription(id: string): Observable<void> {
    return this.transcriptionService.invalidateTranscription(id);
  }


}
