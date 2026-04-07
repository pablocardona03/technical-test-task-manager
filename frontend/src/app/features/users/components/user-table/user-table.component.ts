import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-table',
  imports: [DatePipe],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css'
})
export class UserTableComponent {
  readonly users = input.required<User[]>();

  getRoleClass(role: User['role']): string {
    switch (role) {
      case 'Admin':
        return 'bg-slate-900 text-white';
      case 'Manager':
        return 'bg-sky-100 text-sky-800';
      case 'Collaborator':
        return 'bg-emerald-100 text-emerald-800';
    }
  }
}