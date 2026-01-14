import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  route?: string | null;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$: Observable<BreadcrumbItem[]> = this.breadcrumbsSubject.asObservable();

  /**
   * Establece los breadcrumbs para la página actual
   * @param items Array de items del breadcrumb
   */
  setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(items);
  }

  /**
   * Limpia los breadcrumbs
   */
  clear(): void {
    this.breadcrumbsSubject.next([]);
  }

  /**
   * Obtiene el valor actual de los breadcrumbs
   */
  get currentValue(): BreadcrumbItem[] {
    return this.breadcrumbsSubject.value;
  }
}
