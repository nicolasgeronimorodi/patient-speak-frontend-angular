import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BreadcrumbItem, BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
    items: BreadcrumbItem[] = [];

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.items$.subscribe(items => {
      this.items = items;
    });
  }

}
