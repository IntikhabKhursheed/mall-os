import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="login-panel surface-panel">
      <h2>MallOS Login</h2>
      <p class="muted">Sign in to manage the mall operations workspace.</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Email
          <input type="email" formControlName="email" />
        </label>

        <label>
          Password
          <input type="password" formControlName="password" />
        </label>

        <button type="submit" [disabled]="form.invalid">Login</button>
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
    `
  ]
})
export class LoginComponent {
  form: FormGroup;

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

    const { email, password } = this.form.getRawValue();
    this.authService.login(email ?? "", password ?? "").subscribe((user) => {
      const target =
        user.role === "admin" ? "/dashboard/admin" : user.role === "manager" ? "/dashboard/manager" : "/dashboard/cashier";
      this.router.navigateByUrl(target);
    });
  }
}
