import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  command?: () => void;
}

@Injectable({
  providedIn: 'root'
})


export class BreadcrumbService {

  private itemsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public readonly items$ = this.itemsSubject.asObservable();

  buildBreadcrumb(items: BreadcrumbItem[]) {
    this.itemsSubject.next(items);
  }

  clear() {
    this.itemsSubject.next([]);
  }
}
