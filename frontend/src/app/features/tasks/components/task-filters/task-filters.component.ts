import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { User } from '../../../users/models/user.model';
import { TaskFilters } from '../../models/task-filters.model';
import { TaskPriority } from '../../models/task-priority.type';
import { TaskStatus } from '../../models/task-status.type';

type TaskFiltersForm = FormGroup<{
  status: FormControl<TaskStatus | ''>;
  assignedUserId: FormControl<string>;
  priority: FormControl<TaskPriority | ''>;
  tag: FormControl<string>;
  hideCompleted: FormControl<boolean>;
}>;

@Component({
  selector: 'app-task-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './task-filters.component.html',
  styleUrl: './task-filters.component.css'
})
export class TaskFiltersComponent {
  readonly users = input.required<User[]>();
  readonly value = input.required<TaskFilters>();
  readonly apply = output<TaskFilters>();

  readonly statusOptions: TaskStatus[] = ['Pending', 'InProgress', 'Done'];
  readonly priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  readonly form: TaskFiltersForm = new FormGroup({
    status: new FormControl<TaskStatus | ''>('', { nonNullable: true }),
    assignedUserId: new FormControl('', { nonNullable: true }),
    priority: new FormControl<TaskPriority | ''>('', { nonNullable: true }),
    tag: new FormControl('', { nonNullable: true }),
    hideCompleted: new FormControl(true, { nonNullable: true })
  });

  constructor() {
    effect(() => {
      const currentValue = this.value();

      this.form.setValue(
        {
          status: currentValue.status,
          assignedUserId:
            currentValue.assignedUserId === null ? '' : String(currentValue.assignedUserId),
          priority: currentValue.priority,
          tag: currentValue.tag,
          hideCompleted: currentValue.hideCompleted
        },
        { emitEvent: false }
      );
    });
  }

  submit(): void {
    const raw = this.form.getRawValue();

    this.apply.emit({
      ...this.value(),
      status: raw.status,
      assignedUserId: raw.assignedUserId ? Number(raw.assignedUserId) : null,
      priority: raw.priority,
      tag: raw.tag.trim(),
      hideCompleted: raw.status === 'Done' ? false : raw.hideCompleted
    });
  }

  reset(): void {
    this.form.reset(
      {
        status: '',
        assignedUserId: '',
        priority: '',
        tag: '',
        hideCompleted: true
      },
      { emitEvent: false }
    );

    this.apply.emit({
      ...this.value(),
      status: '',
      assignedUserId: null,
      priority: '',
      tag: '',
      hideCompleted: true
    });
  }
}
