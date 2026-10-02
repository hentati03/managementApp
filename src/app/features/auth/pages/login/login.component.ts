import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div>
      <h2 class="text-2xl font-bold text-secondary-900 mb-2">Welcome back</h2>
      <p class="text-secondary-500 mb-6">Sign in to your account to continue</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <!-- Email -->
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-secondary-700 mb-1">
            Email address
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="input-field"
            placeholder="you@example.com"
            [class.border-red-500]="showError('email')"
          />
          <p *ngIf="showError('email')" class="mt-1 text-sm text-red-500">
            <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
          </p>
        </div>

        <!-- Password -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-secondary-700 mb-1">
            Password
          </label>
          <div class="relative">
            <input
              [type]="showPassword ? 'text' : 'password'"
              id="password"
              formControlName="password"
              class="input-field pr-10"
              placeholder="••••••••"
              [class.border-red-500]="showError('password')"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              (click)="showPassword = !showPassword"
            >
              <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg *ngIf="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <p *ngIf="showError('password')" class="mt-1 text-sm text-red-500">
            <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
          </p>
        </div>

        <!-- Remember me -->
        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center">
            <input
              type="checkbox"
              formControlName="rememberMe"
              class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-secondary-600">Remember me</span>
          </label>
          <a href="#" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Forgot password?
          </a>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full btn-primary py-3 flex items-center justify-center"
          [disabled]="isLoading"
        >
          <svg
            *ngIf="isLoading"
            class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <!-- Footer -->
      <p class="mt-6 text-center text-sm text-secondary-500">
        Don't have an account? 
        <span class="text-secondary-700">Contact your administrator</span>
      </p>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  showError(field: string): boolean {
    const control = this.loginForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('Welcome back!', 'Login successful');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Invalid credentials';
        this.toastr.error(message, 'Login failed');
      },
    });
  }
}
