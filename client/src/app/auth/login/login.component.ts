import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { Router } from "@angular/router";
import { finalize, Subscription } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { User } from "../../core/models/user.model";

type AuthTab = "signin" | "register";
type ToastTone = "success" | "error";

interface ToastState {
  visible: boolean;
  message: string;
  tone: ToastTone;
}

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get("password")?.value;
  const confirmPassword = group.get("confirmPassword")?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
};

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css"
})
export class LoginComponent implements OnInit, OnDestroy {
  activeTab: AuthTab = "signin";
  signInSubmitting = false;
  registerSubmitting = false;
  showSignInPassword = false;
  showRegisterPassword = false;
  showConfirmPassword = false;
  toast: ToastState = { visible: false, message: "", tone: "success" };
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private roleSubscription?: Subscription;

  readonly departments = ["Fashion", "Food Court", "Electronics", "Beauty", "Sports", "Other"];
  readonly demoAccounts = [
    { label: "Admin Demo", icon: "pi pi-shield", email: "admin@mallos.com", password: "Admin@123" },
    { label: "Manager Demo", icon: "pi pi-briefcase", email: "manager@mallos.com", password: "Manager@123" },
    { label: "Cashier Demo", icon: "pi pi-wallet", email: "cashier@mallos.com", password: "Cashier@123" }
  ];

  readonly signInForm: FormGroup;
  readonly registerForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.signInForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]]
    });

    this.registerForm = this.fb.group(
      {
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
        role: ["", [Validators.required]],
        department: [""]
      },
      { validators: passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.roleSubscription = this.registerForm.get("role")?.valueChanges.subscribe((role) => {
      const departmentControl = this.registerForm.get("department");
      if (role === "manager" || role === "cashier") {
        departmentControl?.addValidators([Validators.required]);
      } else {
        departmentControl?.clearValidators();
        departmentControl?.setValue("");
      }
      departmentControl?.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.roleSubscription?.unsubscribe();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  setActiveTab(tab: AuthTab): void {
    this.activeTab = tab;
    this.clearToast();
  }

  submitSignIn(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.clearToast();
    this.signInSubmitting = true;
    const { email, password } = this.signInForm.getRawValue();

    this.authService
      .login(email ?? "", password ?? "")
      .pipe(finalize(() => (this.signInSubmitting = false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl("/dashboard");
        },
        error: () => {
          this.showToast("Invalid email or password", "error");
        }
      });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.clearToast();
    this.registerSubmitting = true;
    const { firstName, lastName, email, password, role, department } = this.registerForm.getRawValue();

    this.authService
      .register(
        {
          name: `${firstName} ${lastName}`.trim(),
          email: email ?? "",
          password: password ?? "",
          role: (role as User["role"]) ?? "cashier",
          department: department || "",
          status: "active"
        },
        false
      )
      .pipe(finalize(() => (this.registerSubmitting = false)))
      .subscribe({
        next: () => {
          this.showToast("Account created successfully", "success");
          this.registerForm.reset({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "",
            department: ""
          });
          this.signInForm.patchValue({ email: email ?? "", password: "" });
          this.activeTab = "signin";
        },
        error: (error) => {
          this.showToast(error?.error?.message || "Unable to create account", "error");
        }
      });
  }

  useDemoAccount(account: { email: string; password: string }): void {
    this.activeTab = "signin";
    this.signInForm.patchValue({
      email: account.email,
      password: account.password
    });
    this.submitSignIn();
  }

  getPasswordStrength(): "weak" | "fair" | "strong" {
    const password = String(this.registerForm.get("password")?.value || "");
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return "strong";
    }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return "fair";
    }
    return "weak";
  }

  get shouldShowDepartment(): boolean {
    const role = this.registerForm.get("role")?.value;
    return role === "manager" || role === "cashier";
  }

  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return Boolean(control && control.invalid && (control.touched || control.dirty));
  }

  hasPasswordMismatch(): boolean {
    return Boolean(this.registerForm.errors?.["passwordMismatch"] && this.registerForm.get("confirmPassword")?.touched);
  }

  private showToast(message: string, tone: ToastTone): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toast = { visible: true, message, tone };
    this.toastTimer = setTimeout(() => {
      this.toast = { visible: false, message: "", tone };
    }, 3200);
  }

  private clearToast(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.toast = { visible: false, message: "", tone: "success" };
  }
}
