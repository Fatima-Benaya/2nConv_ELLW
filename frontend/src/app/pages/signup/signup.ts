import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly errorMessage = signal('');
  readonly isLoading = signal(false);

  submit(): void {
    if (!this.name() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Completa todos los campos.');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }
    this.errorMessage.set('');
    this.isLoading.set(true);
    this.auth
      .register({
        name: this.name().trim(),
        email: this.email().trim(),
        password: this.password(),
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          const message = error?.error?.message || 'No se pudo crear la cuenta.';
          this.errorMessage.set(message);
        },
      });
  }
}
