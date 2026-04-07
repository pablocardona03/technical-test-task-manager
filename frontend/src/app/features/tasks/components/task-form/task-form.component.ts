import { Component, effect, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../../../users/models/user.model';
import { CreateTaskRequest } from '../../models/create-task.request';
import { TaskPriority } from '../../models/task-priority.type';
import { Task } from '../../models/task.model';

type AdditionalItemGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
}>;

type TaskFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  assignedUserId: FormControl<string>;
  createdByUserId: FormControl<string>;
  priority: FormControl<TaskPriority | ''>;
  estimatedEndDate: FormControl<string>;
  tags: FormControl<string>;
  additionalItems: FormArray<AdditionalItemGroup>;
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
  readonly submitLabel = input<string>('Save task');
  readonly task = input<Task | null>(null);
  readonly submitTask = output<CreateTaskRequest>();
  readonly priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  readonly form: TaskFormGroup = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    assignedUserId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    createdByUserId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    priority: new FormControl<TaskPriority | ''>('', { nonNullable: true }),
    estimatedEndDate: new FormControl('', { nonNullable: true }),
    tags: new FormControl('', { nonNullable: true }),
    additionalItems: new FormArray<AdditionalItemGroup>([])
  });

  constructor() {
    effect(() => {
      const task = this.task();
      const activeUsers = this.activeUsers();

      if (task) {
        this.form.controls.title.setValue(task.title, { emitEvent: false });
        this.form.controls.description.setValue(task.description ?? '', { emitEvent: false });
        this.form.controls.assignedUserId.setValue(String(task.assignedUserId), { emitEvent: false });
        this.form.controls.createdByUserId.setValue(String(task.createdByUserId), { emitEvent: false });
        this.form.controls.priority.setValue(task.priority ?? '', { emitEvent: false });
        this.form.controls.estimatedEndDate.setValue(task.estimatedEndDate ?? '', { emitEvent: false });
        this.form.controls.tags.setValue(task.tags.join(', '), { emitEvent: false });
        this.resetAdditionalItems(task.additionalItems);
        return;
      }

      if (!this.form.controls.createdByUserId.value && activeUsers.length) {
        this.form.controls.createdByUserId.setValue(String(activeUsers[0].id), { emitEvent: false });
      }
    });
  }

  get additionalItems(): FormArray<AdditionalItemGroup> {
    return this.form.controls.additionalItems;
  }

  activeUsers(): User[] {
    return this.users().filter((user: User) => user.isActive);
  }

  addAdditionalItem(): void {
    this.additionalItems.push(this.createAdditionalItemGroup());
  }

  removeAdditionalItem(index: number): void {
    this.additionalItems.removeAt(index);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const tags = raw.tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    const additionalItems = raw.additionalItems
      .map((item: { title: string; description: string }) => ({
        title: item.title.trim(),
        description: item.description.trim()
      }))
      .filter((item: { title: string; description: string }) => item.title.length > 0 && item.description.length > 0);

    const additionalData = {
      ...(raw.priority ? { priority: raw.priority } : {}),
      ...(raw.estimatedEndDate ? { estimatedEndDate: raw.estimatedEndDate } : {}),
      ...(tags.length ? { tags } : {}),
      ...(additionalItems.length ? { additionalItems } : {})
    };

    this.submitTask.emit({
      title: raw.title.trim(),
      description: raw.description.trim() ? raw.description.trim() : null,
      assignedUserId: Number(raw.assignedUserId),
      createdByUserId: Number(raw.createdByUserId),
      additionalDataJson: JSON.stringify(additionalData)
    });
  }

  private createAdditionalItemGroup(value?: { title?: string; description?: string }): AdditionalItemGroup {
    return new FormGroup({
      title: new FormControl(value?.title ?? '', { nonNullable: true }),
      description: new FormControl(value?.description ?? '', { nonNullable: true })
    });
  }

  private resetAdditionalItems(items: Task['additionalItems']): void {
    while (this.additionalItems.length) {
      this.additionalItems.removeAt(0);
    }

    if (!items.length) {
      return;
    }

    items.forEach((item) => {
      this.additionalItems.push(this.createAdditionalItemGroup(item));
    });
  }
}
