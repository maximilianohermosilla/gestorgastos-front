import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpinnerService {
  private count = 0;
  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  show(): void {
    this.count++;
    this._loading.set(true);
  }

  hide(): void {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      this._loading.set(false);
    }
  }
}
