import { Component, computed, input } from '@angular/core';

import { TaskStatus } from '../../../features/tasks/models/task-status.type';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css'
})
export class StatusBadgeComponent {
  readonly status = input.required<TaskStatus>();

  readonly toneClass = computed(() => {
    switch (this.status()) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'InProgress':
        return 'bg-sky-100 text-sky-800';
      case 'Done':
        return 'bg-emerald-100 text-emerald-800';
    }
  });

  readonly label = computed(() => {
    switch (this.status()) {
      case 'InProgress':
        return 'In Progress';
      default:
        return this.status();
    }
  });
}
