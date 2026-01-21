import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-top-bar',
  imports: [
    CommonModule,
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @Input() appTitle: string = 'App';
  @Input() isSidebarCollapsed: boolean = false;
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  isDarkModeActive: boolean = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(mode => {
      this.isDarkModeActive = mode;
    });
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.toggleSidebarEvent.emit();
  }

  logout(): void {
    this.logoutEvent.emit();
  }
}
