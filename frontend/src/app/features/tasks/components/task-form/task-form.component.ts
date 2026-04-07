import { Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../../../users/models/user.model';
import { CreateTaskRequest } from '../../models/create-task.request';
import { TaskPriority } from '../../models/task-priority.type';

type TaskFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  assignedUserId: FormControl<string>;
  createdByUserId: FormControl<string>;
  priority: FormControl<TaskPriority | ''>;
  estimatedEndDate: FormControl<string>;
  tags: FormControl<string>;
  freeMetadata: FormControl<string>;
}>;

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent {
  readonly users = input.required<User[]>();
  readonly submitting = input<boolean>(false);
  readonly submitTask = output<CreateTaskRequest>();

  readonly metadataError = signal<string | null>(null);
  readonly priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  readonly form: TaskFormGroup = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    assignedUserId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    createdByUserId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    priority: new FormControl<TaskPriority | ''>('', { nonNullable: true }),
    estimatedEndDate: new FormControl('', { nonNullable: true }),
    tags: new FormControl('', { nonNullable: true }),
    freeMetadata: new FormControl('', { nonNullable: true })
  });

  constructor() {
    effect(() => {
      const users = this.users();

      if (users.length && !this.form.controls.createdByUserId.value) {
        this.form.controls.createdByUserId.setValue(String(users[0].id), { emitEvent: false });
      }
    });
  }

  save(): void {
    this.metadataError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    let freeMetadata: Record<string, unknown> = {};

    if (raw.freeMetadata.trim()) {
      try {
        const parsed = JSON.parse(raw.freeMetadata.trim()) as unknown;

        if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
          throw new Error('Advanced metadata must be a valid JSON object.');
        }

        freeMetadata = parsed as Record<string, unknown>;
      } catch (error) {
        this.metadataError.set(
          error instanceof Error ? error.message : 'Advanced metadata must be valid JSON.'
        );
        return;
      }
    }

    const tags = raw.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const additionalData = {
      ...(raw.priority ? { priority: raw.priority } : {}),
      ...(raw.estimatedEndDate ? { estimatedEndDate: raw.estimatedEndDate } : {}),
      ...(tags.length ? { tags } : {}),
      ...(Object.keys(freeMetadata).length ? { metadata: freeMetadata } : {})
    };

    this.submitTask.emit({
      title: raw.title.trim(),
      description: raw.description.trim() ? raw.description.trim() : null,
      assignedUserId: Number(raw.assignedUserId),
      createdByUserId: Number(raw.createdByUserId),
      additionalDataJson: JSON.stringify(additionalData)
    });
  }
}
