import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DrawerComponent } from '../../../../shared/ui/drawer/drawer.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { getErrorMessage } from '../../../../shared/utils/http-error.utils';
import { UsersApiService } from '../../../users/data-access/users-api.service';
import { User } from '../../../users/models/user.model';
import { TaskDetailComponent } from '../../components/task-detail/task-detail.component';
import { TaskFiltersComponent } from '../../components/task-filters/task-filters.component';
import { TaskTableComponent } from '../../components/task-table/task-table.component';
import { TasksApiService } from '../../data-access/tasks-api.service';
import { TaskFilters } from '../../models/task-filters.model';
import { Task } from '../../models/task.model';
import { TaskSortField } from '../../models/task-sort-field.type';
import { TaskStatus } from '../../models/task-status.type';

@Component({
  selector: 'app-task-list-page',
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    DrawerComponent,
    TaskDetailComponent,
    TaskFiltersComponent,
    TaskTableComponent
  ],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.css'
})
export class TaskListPageComponent {
  private readonly tasksApi = inject(TasksApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly loadingTasks = signal(false);
  readonly loadingUsers = signal(false);
  readonly taskError = signal<string | null>(null);
  readonly usersError = signal<string | null>(null);
  readonly selectedTask = signal<Task | null>(null);
  readonly filters = signal<TaskFilters>({
    status: '',
    assignedUserId: null,
    priority: '',
    tag: '',
    hideCompleted: true,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  readonly hasNoTasks = computed(() => !this.loadingTasks() && !this.taskError() && this.tasks().length === 0);

  constructor() {
    this.loadUsers();
    this.loadTasks();
  }

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.usersError.set(null);

    this.usersApi
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loadingUsers.set(false);
        },
        error: (error: unknown) => {
          this.usersError.set(getErrorMessage(error, 'Unable to load users.'));
          this.loadingUsers.set(false);
        }
      });
  }

  loadTasks(): void {
    this.loadingTasks.set(true);
    this.taskError.set(null);

    this.tasksApi
      .getTasks(this.filters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.loadingTasks.set(false);

          const currentSelection = this.selectedTask();
          if (currentSelection) {
            const updatedSelection = tasks.find((task) => task.id === currentSelection.id) ?? null;
            this.selectedTask.set(updatedSelection);
          }
        },
        error: (error: unknown) => {
          this.taskError.set(getErrorMessage(error, 'Unable to load tasks.'));
          this.loadingTasks.set(false);
        }
      });
  }

  applyFilters(filters: TaskFilters): void {
    this.filters.set(filters);
    this.loadTasks();
  }

  toggleSort(field: TaskSortField): void {
    const current = this.filters();
    const nextDirection = current.sortBy === field && current.sortDirection === 'desc' ? 'asc' : 'desc';

    this.filters.set({
      ...current,
      sortBy: field,
      sortDirection: nextDirection
    });

    this.loadTasks();
  }

  openTask(task: Task): void {
    this.selectedTask.set(task);
  }

  goToEdit(task: Task): void {
    void this.router.navigate(['/tasks', task.id, 'edit']);
  }

  closeTask(): void {
    this.selectedTask.set(null);
  }

  updateStatus(payload: { taskId: number; status: TaskStatus }): void {
    this.tasksApi
      .updateTaskStatus(payload.taskId, payload.status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error: unknown) => {
          this.taskError.set(getErrorMessage(error, 'Unable to update task status.'));
        }
      });
  }

  deleteTask(task: Task): void {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);

    if (!confirmed) {
      return;
    }

    this.tasksApi
      .deleteTask(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.selectedTask()?.id === task.id) {
            this.closeTask();
          }
          this.loadTasks();
        },
        error: (error: unknown) => {
          this.taskError.set(getErrorMessage(error, 'Unable to delete task.'));
        }
      });
  }
}
