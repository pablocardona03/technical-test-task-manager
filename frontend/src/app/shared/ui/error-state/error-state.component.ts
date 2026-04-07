import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.css'
})
export class ErrorStateComponent {
  readonly title = input<string>('Something went wrong');
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
