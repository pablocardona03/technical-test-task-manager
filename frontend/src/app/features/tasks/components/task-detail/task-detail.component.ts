import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  imports: [DatePipe, StatusBadgeComponent],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent {
  readonly task = input.required<Task>();

  getPrettyJson(json: string): string {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }
}