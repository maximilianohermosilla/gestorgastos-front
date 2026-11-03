import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center gap-2 px-8 py-6 text-center text-gray-500">
      <mat-icon class="!h-12 !w-12 !text-[3rem] opacity-60">{{ icon() }}</mat-icon>
      <p>{{ message() }}</p>
    </div>
  `,
})
export class EmptyState {
  readonly icon = input<string>('inbox');
  readonly message = input<string>('No hay datos para mostrar');
}
