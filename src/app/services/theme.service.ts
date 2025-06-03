import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'prefers-dark-mode';
const CSS_CLASS = 'app-dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = saved === 'true';

    this.setDarkMode(prefersDark);
  }

  toggleTheme(): void {
    const next = !this.isDarkModeSubject.value;
    this.setDarkMode(next);
  }

  private setDarkMode(isDark: boolean): void {
    const html = document.documentElement;

    if (isDark) {
      html.classList.add(CSS_CLASS);
    } else {
      html.classList.remove(CSS_CLASS);
    }

    this.isDarkModeSubject.next(isDark);
    localStorage.setItem(STORAGE_KEY, String(isDark));
  }

  get currentValue(): boolean {
    return this.isDarkModeSubject.value;
  }
}