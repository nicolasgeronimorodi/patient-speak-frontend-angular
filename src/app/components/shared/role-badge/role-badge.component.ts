import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { RoleDisplayName } from '../../../models/enums/role.enum';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [TagModule],
  template: `<p-tag [value]="displayName" [severity]="severity"></p-tag>`
})
export class RoleBadgeComponent {
  @Input() role!: RoleDisplayName;

  get displayName(): string {
    return this.role;
  }

  get severity(): 'success' | 'info' | 'secondary' {
    switch (this.role) {
      case RoleDisplayName.Admin:
        return 'success';
      case RoleDisplayName.Operator:
        return 'info';
      default:
        return 'secondary';
    }
  }
}
