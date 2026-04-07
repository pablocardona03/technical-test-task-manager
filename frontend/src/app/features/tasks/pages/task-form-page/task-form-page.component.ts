import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state.component';
import { getErrorMessage } from '../../../../shared/utils/http-error.utils';
import { UsersApiService } from '../../../users/data-access/users-api.service';
import { User } from '../../../users/models/user.model';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TasksApiService } from '../../data-access/tasks-api.service';
import { CreateTaskRequest } from '../../models/create-task.request';

@Component({
  selector: 'app-task-form-page',
  imports: [PageHeaderComponent, ErrorStateComponent, TaskFormComponent],
  templateUrl: './task-form-page.component.html',
  styleUrl: './task-form-page.component.css'
})
export class TaskFormPageComponent {
  private readonly tasksApi = inject(TasksApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.usersApi
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loadError.set(getErrorMessage(error, 'Unable to load users for the task form.'));
          this.loading.set(false);
        }
      });
  }

  createTask(payload: CreateTaskRequest): void {
    this.loading.set(true);
    this.saveError.set(null);

    this.tasksApi
      .createTask(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/tasks']);
        },
        error: (error: unknown) => {
          this.saveError.set(getErrorMessage(error, 'Unable to create task.'));
          this.loading.set(false);
        }
      });
  }
}
