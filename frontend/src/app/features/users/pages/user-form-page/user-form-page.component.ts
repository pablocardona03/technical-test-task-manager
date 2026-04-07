import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state.component';
import { getErrorMessage } from '../../../../shared/utils/http-error.utils';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { UsersApiService } from '../../data-access/users-api.service';
import { CreateUserRequest } from '../../models/create-user.request';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form-page',
  imports: [PageHeaderComponent, ErrorStateComponent, UserFormComponent],
  templateUrl: './user-form-page.component.html',
  styleUrl: './user-form-page.component.css'
})
export class UserFormPageComponent {
  private readonly usersApi = inject(UsersApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly userId = Number(this.route.snapshot.paramMap.get('id')) || null;

  readonly loading = signal(false);
  readonly user = signal<User | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly isEditMode = computed(() => this.userId !== null);
  readonly pageTitle = computed(() => (this.isEditMode() ? 'Edit user' : 'Create user'));
  readonly pageSubtitle = computed(() =>
    this.isEditMode()
      ? 'Update user information, role and availability in the workflow.'
      : 'Create a user to assign and manage tasks in the workflow.'
  );
  readonly submitLabel = computed(() => (this.isEditMode() ? 'Save changes' : 'Create user'));

  constructor() {
    if (this.userId !== null) {
      this.loadUser(this.userId);
    }
  }

  reload(): void {
    if (this.userId !== null) {
      this.loadUser(this.userId);
    }
  }

  loadUser(userId: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.usersApi
      .getUserById(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loadError.set(getErrorMessage(error, 'Unable to load user details.'));
          this.loading.set(false);
        }
      });
  }

  saveUser(payload: CreateUserRequest): void {
    this.loading.set(true);
    this.saveError.set(null);

    const request$ = this.userId === null
      ? this.usersApi.createUser(payload)
      : this.usersApi.updateUser(this.userId, payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/users']);
        },
        error: (error: unknown) => {
          this.saveError.set(
            getErrorMessage(
              error,
              this.userId === null ? 'Unable to create user.' : 'Unable to update user.'
            )
          );
          this.loading.set(false);
        }
      });
  }
}
