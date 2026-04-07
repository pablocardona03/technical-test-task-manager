import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { TaskPriority } from '../../models/task-priority.type';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  imports: [DatePipe, StatusBadgeComponent],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent {
  readonly task = input.required<Task>();

  getPriorityClass(priority: TaskPriority | null): string {
    switch (priority) {
      case 'Low':
        return 'bg-emerald-100 text-emerald-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Critical':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  getPriorityLabel(priority: TaskPriority | null): string {
    return priority ?? 'No priority';
  }
}
