import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state.component';
import { getErrorMessage } from '../../../../shared/utils/http-error.utils';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { UsersApiService } from '../../data-access/users-api.service';
import { CreateUserRequest } from '../../models/create-user.request';

@Component({
  selector: 'app-user-form-page',
  imports: [PageHeaderComponent, ErrorStateComponent, UserFormComponent],
  templateUrl: './user-form-page.component.html',
  styleUrl: './user-form-page.component.css'
})
export class UserFormPageComponent {
  private readonly usersApi = inject(UsersApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  createUser(payload: CreateUserRequest): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersApi
      .createUser(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/users']);
        },
        error: (error: unknown) => {
          this.error.set(getErrorMessage(error, 'Unable to create user.'));
          this.loading.set(false);
        }
      });
  }
}
