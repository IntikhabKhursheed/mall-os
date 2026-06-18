import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgIf } from "@angular/common";
import { finalize } from "rxjs";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <section class="login-panel surface-panel">
      <h2>MallOS Login</h2>
      <p class="muted">Sign in to manage the mall operations workspace.</p>

      <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Email
          <input type="email" formControlName="email" />
          <small *ngIf="form.controls['email']?.touched && form.controls['email']?.invalid">
            Enter a valid email.
          </small>
        </label>

        <label>
          Password
          <input type="password" formControlName="password" />
          <small *ngIf="form.controls['password']?.touched && form.controls['password']?.invalid">
            Password is required.
          </small>
        </label>

        <button type="submit" [disabled]="form.invalid || submitting">
          {{ submitting ? "Signing in..." : "Login" }}
        </button>
      </form>
    </section>
  `,
  styles: [
    `
      .login-panel {
        width: min(100%, 420px);
        padding: 1.5rem;
        display: grid;
        gap: 1rem;
      }

      form {
        display: grid;
        gap: 0.9rem;
      }

      label {
        display: grid;
        gap: 0.35rem;
      }

      small {
        color: #fca5a5;
      }

      input,
      button {
        min-height: 42px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--surface-1);
        color: var(--text);
        padding: 0.75rem 0.9rem;
      }

      button {
        background: var(--accent);
        color: #0b1120;
        font-weight: 700;
        cursor: pointer;
      }

      .error-box {
        border: 1px solid rgba(248, 113, 113, 0.35);
        background: rgba(127, 29, 29, 0.35);
        color: #fecaca;
        border-radius: 8px;
        padding: 0.75rem 0.9rem;
      }
    `
  ]
})
export class LoginComponent {
  form: FormGroup;
  submitting = false;
  errorMessage = "";

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.errorMessage = "";
    this.submitting = true;
    const { email, password } = this.form.getRawValue();
    this.authService
      .login(email ?? "", password ?? "")
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (user) => {
          const target = user.role === "admin" ? "/dashboard/admin" : user.role === "manager" ? "/dashboard/manager" : "/pos";
          this.router.navigateByUrl(target);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || "Login failed. Check your credentials.";
        }
      });
  }
}
