import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: string;
  styleClass?: string;
}

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule, MenuModule],
  template: `
    <button
      type="button"
      (click)="menu.toggle($event)"
      class="p-2 rounded-lg hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors">
      <span class="material-icons-round text-text-secondary dark:text-text-secondary-dark">
        more_vert
      </span>
    </button>
    <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>
  `
})
export class ActionMenuComponent implements OnInit {
  @Input() actions: ActionMenuItem[] = [];
  @Output() actionSelected = new EventEmitter<string>();

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.menuItems = this.actions.map(action => ({
      label: action.label,
      icon: action.icon,
      styleClass: action.styleClass,
      command: () => this.actionSelected.emit(action.id)
    }));
  }
}
