import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly email = signal('');
  readonly password = signal('');
  readonly errorMessage = signal('');
  readonly isLoading = signal(false);

  submit(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Completa tu email y contraseña.');
      return;
    }
    this.errorMessage.set('');
    this.isLoading.set(true);
    this.auth
      .login({ email: this.email().trim(), password: this.password() })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          const message = error?.error?.message || 'No se pudo iniciar sesión.';
          this.errorMessage.set(message);
        },
      });
  }
}
