import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from '../../../core/http/spinner.service';

@Component({
  selector: 'app-spinner',
  imports: [MatProgressSpinnerModule],
  template: `
    @if (spinner.loading()) {
      <div class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30">
        <mat-progress-spinner mode="indeterminate" diameter="64" />
      </div>
    }
  `,
})
export class Spinner {
  readonly spinner = inject(SpinnerService);
}
