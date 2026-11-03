import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';
import { APP_CONSTANTS } from '../../../core/config/app.constants';
import { Usuario } from '../../../core/models/usuario';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-perfil',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly usuario = signal<Usuario | null>(null);
  readonly savingPassword = signal(false);

  readonly passwordForm = this.fb.nonNullable.group({
    password: ['', [Validators.required]],
    passwordNew: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.usuarioService.getCurrent().subscribe({
      next: (u) => this.usuario.set(u),
      error: () => this.snackbar.open('No se pudo cargar el perfil', 'Cerrar'),
    });
  }

  changePassword(): void {
    const u = this.usuario();
    if (!u || this.passwordForm.invalid) {
      return;
    }
    this.savingPassword.set(true);
    this.auth
      .changePassword({
        login: u.login,
        password: this.passwordForm.value.password ?? '',
        passwordNew: this.passwordForm.value.passwordNew ?? '',
        idSistema: APP_CONSTANTS.ID_SISTEMA,
      })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordForm.reset();
          this.snackbar.open('Contraseña actualizada correctamente', 'Cerrar');
        },
        error: (err) => {
          this.savingPassword.set(false);
          this.snackbar.open(this.normalizeError(err), 'Cerrar');
        },
      });
  }

  private normalizeError(err: unknown): string {
    const e = err as { status?: number; error?: { message?: string } };
    if (e?.error?.message) {
      return e.error.message;
    }
    if (e?.status === 400) {
      return 'Verifique los datos ingresados (mínimo 5 caracteres).';
    }
    return 'No se pudo actualizar la contraseña.';
  }
}
