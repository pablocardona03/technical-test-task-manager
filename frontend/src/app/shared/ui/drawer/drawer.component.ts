import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css'
})
export class DrawerComponent {
  readonly open = input.required<boolean>();
  readonly title = input<string>('');
  readonly close = output<void>();
}
