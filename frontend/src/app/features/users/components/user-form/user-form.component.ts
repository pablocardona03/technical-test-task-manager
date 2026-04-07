import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateUserRequest } from '../../models/create-user.request';
import { UserRole } from '../../models/user-role.type';

type UserFormGroup = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  role: FormControl<UserRole>;
}>;

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  readonly submitting = input<boolean>(false);
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
    })
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.submitUser.emit({
      name: raw.name.trim(),
      email: raw.email.trim(),
      role: raw.role
    });
  }
}
