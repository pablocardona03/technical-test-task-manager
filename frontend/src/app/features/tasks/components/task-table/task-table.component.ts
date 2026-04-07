import { Component, input, output } from '@angular/core';

import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { Task } from '../../models/task.model';
import { TaskStatus } from '../../models/task-status.type';

@Component({
  selector: 'app-task-table',
  imports: [StatusBadgeComponent],
  templateUrl: './task-table.component.html',
  styleUrl: './task-table.component.css'
})
export class TaskTableComponent {
  readonly tasks = input.required<Task[]>();
  readonly viewTask = output<Task>();
  readonly changeStatus = output<{ taskId: number; status: TaskStatus }>();

  getNextStatus(status: TaskStatus): TaskStatus | null {
    switch (status) {
      case 'Pending':
        return 'InProgress';
      case 'InProgress':
        return 'Done';
      case 'Done':
        return null;
    }
  }

  getActionLabel(status: TaskStatus): string {
    switch (status) {
      case 'Pending':
        return 'Start';
      case 'InProgress':
        return 'Complete';
      case 'Done':
        return 'Completed';
    }
  }
}
