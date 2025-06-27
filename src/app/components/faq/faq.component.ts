import { Component } from '@angular/core';
import { BreadcrumbService } from '../../services/common/breadcrumb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  imports: [],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent {
  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.buildBreadcrumb();
  }
  buildBreadcrumb() {
    this.breadcrumbService.buildBreadcrumb([
      {
        label: 'Home',
        command: () => this.router.navigate(['/home']),
      },
      {
        label: 'Ayuda',
      }
    ]);
  }
}
