import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

/** Diálogo de alta de usuario desde la pantalla de login. */
@Component({
  selector: 'app-registro-usuario-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './registro-usuario-dialog.html',
})
export class RegistroUsuarioDialog {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly snackbar = inject(MatSnackBar);
  readonly ref = inject(MatDialogRef<RegistroUsuarioDialog>);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    login: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    passwordConfirm: ['', [Validators.required]],
  });

  hidePassword = true;

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, login, correo, password, passwordConfirm } = this.form.getRawValue();
    if (password !== passwordConfirm) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.auth.registrar({ nombre, login, correo, password }).subscribe({
      next: () => {
        this.snackbar.open('Usuario creado correctamente', 'Cerrar');
        this.ref.close(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.normalizeError(err));
      },
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
    if (e?.status === 409 || e?.status === 400) {
      return 'El usuario ya existe o los datos no son válidos.';
    }
    return 'Ocurrió un error al crear el usuario.';
  }
}
