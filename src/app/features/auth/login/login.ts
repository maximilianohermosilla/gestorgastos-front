import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/auth/auth.service';
import { APP_CONSTANTS } from '../../../core/config/app.constants';
import { RegistroUsuarioDialog } from '../registro/registro-usuario-dialog';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly form = this.fb.nonNullable.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  readonly loading = signal(false);
  readonly error = signal('');
  hidePassword = true;

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth
      .login({ ...this.form.getRawValue(), idSistema: APP_CONSTANTS.ID_SISTEMA })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.loading.set(false);
          this.error.set(this.normalizeError(err));
        },
      });
  }

  /** Abre el alta de usuario; al crearlo, se inicia sesión automáticamente. */
  abrirRegistro(): void {
    const ref = this.dialog.open(RegistroUsuarioDialog, { width: '480px' });
    ref.afterClosed().subscribe((creado?: boolean) => {
      if (creado) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private normalizeError(err: unknown): string {
    const e = err as { status?: number; error?: { message?: string } };
    if (e?.status === 0) {
      return 'No es posible conectar con el servidor.';
    }
    if (e?.error?.message) {
      return e.error.message;
    }
    if (e?.status === 401 || e?.status === 403) {
      return 'Usuario o contraseña incorrectos.';
    }
    return 'Ocurrió un error al iniciar sesión.';
  }
}
