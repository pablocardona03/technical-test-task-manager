import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state.component';
import { getErrorMessage } from '../../../../shared/utils/http-error.utils';
import { UsersApiService } from '../../../users/data-access/users-api.service';
import { User } from '../../../users/models/user.model';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TasksApiService } from '../../data-access/tasks-api.service';
import { CreateTaskRequest } from '../../models/create-task.request';
import { Task } from '../../models/task.model';

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
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly taskId = Number(this.route.snapshot.paramMap.get('id')) || null;

  readonly users = signal<User[]>([]);
  readonly task = signal<Task | null>(null);
  readonly loadingUsers = signal(false);
  readonly loadingTask = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly isEditMode = computed(() => this.taskId !== null);
  readonly pageTitle = computed(() => (this.isEditMode() ? 'Edit task' : 'Create task'));
  readonly pageSubtitle = computed(() =>
    this.isEditMode()
      ? 'Update task details, reassignment and additional information.'
      : 'Register a new task, assign the responsible user and capture the relevant details.'
  );
  readonly submitLabel = computed(() => (this.isEditMode() ? 'Save changes' : 'Create task'));

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loadUsers();

    if (this.taskId !== null) {
      this.loadTask(this.taskId);
    }
  }

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.loadError.set(null);

    this.usersApi
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loadingUsers.set(false);
        },
        error: (error: unknown) => {
          this.loadError.set(getErrorMessage(error, 'Unable to load users for the task form.'));
          this.loadingUsers.set(false);
        }
      });
  }

  loadTask(taskId: number): void {
    this.loadingTask.set(true);
    this.loadError.set(null);

    this.tasksApi
      .getTaskById(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.task.set(task);
          this.loadingTask.set(false);
        },
        error: (error: unknown) => {
          this.loadError.set(getErrorMessage(error, 'Unable to load task details.'));
          this.loadingTask.set(false);
        }
      });
  }

  saveTask(payload: CreateTaskRequest): void {
    this.saving.set(true);
    this.saveError.set(null);

    const request$ = this.taskId === null
      ? this.tasksApi.createTask(payload)
      : this.tasksApi.updateTask(this.taskId, payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/tasks']);
        },
        error: (error: unknown) => {
          this.saveError.set(
            getErrorMessage(
              error,
              this.taskId === null ? 'Unable to create task.' : 'Unable to update task.'
            )
          );
          this.saving.set(false);
        }
      });
  }
}
