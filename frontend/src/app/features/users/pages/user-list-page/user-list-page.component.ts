import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state.component';
import { getErrorMessage } from '../../../../shared/utils/http-error.utils';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { UsersApiService } from '../../data-access/users-api.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list-page',
  imports: [PageHeaderComponent, EmptyStateComponent, ErrorStateComponent, UserTableComponent],
  templateUrl: './user-list-page.component.html',
  styleUrl: './user-list-page.component.css'
})
export class UserListPageComponent {
  private readonly usersApi = inject(UsersApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersApi
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(getErrorMessage(error, 'Unable to load users.'));
          this.loading.set(false);
        }
      });
  }
}
