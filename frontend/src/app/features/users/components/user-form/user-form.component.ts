import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateUserRequest } from '../../models/create-user.request';
import { UserRole } from '../../models/user-role.type';
import { User } from '../../models/user.model';

type UserFormGroup = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  role: FormControl<UserRole>;
  isActive: FormControl<boolean>;
}>;

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  readonly submitting = input<boolean>(false);
  readonly submitLabel = input<string>('Save user');
  readonly user = input<User | null>(null);
  readonly submitUser = output<CreateUserRequest>();
  readonly roleOptions: UserRole[] = ['Admin', 'Manager', 'Collaborator'];

  readonly form: UserFormGroup = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    role: new FormControl<UserRole>('Collaborator', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    isActive: new FormControl(true, { nonNullable: true })
  });

  constructor() {
    effect(() => {
      const user = this.user();

      if (!user) {
        return;
      }

      this.form.setValue(
        {
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        },
        { emitEvent: false }
      );
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.submitUser.emit({
      name: raw.name.trim(),
      email: raw.email.trim(),
      role: raw.role,
      isActive: raw.isActive
    });
  }
}
