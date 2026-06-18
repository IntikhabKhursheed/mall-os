import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { EmployeeService } from "../core/services/employee.service";
import { DepartmentService } from "../core/services/department.service";
import { Department } from "../core/models/department.model";
import { Employee, EmployeePayload } from "../core/models/employee.model";

@Component({
  selector: "app-employees",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, ReactiveFormsModule],
  template: `
    <section class="page-head">
      <div>
        <h2>Employees</h2>
        <p class="muted">Manage staff accounts, roles, and department assignment.</p>
      </div>
    </section>

    <section class="toolbar surface-panel">
      <input [(ngModel)]="searchTerm" (ngModelChange)="loadEmployees()" type="search" placeholder="Search by name or email" />
      <select [(ngModel)]="departmentFilter" (ngModelChange)="loadEmployees()">
        <option value="">All departments</option>
        <option *ngFor="let department of departments" [value]="department.name">{{ department.name }}</option>
      </select>
      <button class="secondary" type="button" (click)="resetFilters()">Reset</button>
      <button class="primary" type="button" (click)="startCreate()">Add Employee</button>
    </section>

    <section class="content-grid">
      <div class="surface-panel panel">
        <div *ngIf="loading" class="state">Loading employees...</div>
        <div *ngIf="!loading && employees.length === 0" class="state">No employees found.</div>

        <div *ngIf="!loading && employees.length > 0" class="record-list">
          <article class="record-card employee-card" *ngFor="let employee of employees">
            <div class="record-avatar">{{ initials(employee.fullName) }}</div>
            <div class="record-main">
              <div class="record-title-row">
                <strong>{{ employee.fullName }}</strong>
                <span class="badge" [class.active]="employee.status === 'active'">{{ employee.status || "active" }}</span>
              </div>
              <div class="record-meta">{{ employee.email }}</div>
              <div class="record-tags">
                <span>{{ employee.phone || "No phone" }}</span>
                <span>{{ employee.role || "No role" }}</span>
                <span>{{ employee.department || "No department" }}</span>
              </div>
            </div>
            <div class="action-group">
              <button type="button" class="secondary icon-action" (click)="startEdit(employee)" aria-label="Edit employee">
                <i class="pi pi-pencil"></i>
                <span class="sr-only">Edit</span>
              </button>
              <button type="button" class="danger icon-action" (click)="removeEmployee(employee)" aria-label="Delete employee">
                <i class="pi pi-trash"></i>
                <span class="sr-only">Delete</span>
              </button>
            </div>
          </article>
        </div>

        <div class="pagination">
          <button type="button" class="secondary" [disabled]="page === 1" (click)="changePage(page - 1)">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button type="button" class="secondary" [disabled]="page >= totalPages" (click)="changePage(page + 1)">Next</button>
        </div>
      </div>

      <form class="surface-panel panel form-panel" [formGroup]="form" (ngSubmit)="saveEmployee()">
        <div class="form-head">
          <h3>{{ editingId ? "Edit Employee" : "Add Employee" }}</h3>
          <p class="muted">Validation is enabled before data is stored in MongoDB.</p>
        </div>

        <label>
          Full Name
          <input formControlName="fullName" type="text" />
        </label>

        <label>
          Email
          <input formControlName="email" type="email" />
        </label>

        <label>
          Phone
          <input formControlName="phone" type="text" />
        </label>

        <label>
          Role
          <input formControlName="role" type="text" />
        </label>

        <label>
          Department
          <select formControlName="department">
            <option value="">Select department</option>
            <option *ngFor="let department of departments" [value]="department.name">{{ department.name }}</option>
          </select>
        </label>

        <label>
          Status
          <select formControlName="status">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>

        <div class="actions">
          <button type="submit" class="primary" [disabled]="form.invalid || saving">{{ saving ? "Saving..." : "Save" }}</button>
          <button type="button" class="secondary" (click)="resetForm()">Clear</button>
        </div>

        <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>
      </form>
    </section>
  `,
  styles: [
    `
      .page-head {
        padding-bottom: 1rem;
      }

      .content-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.9fr);
        gap: 1rem;
      }

      .panel {
        padding: 1rem;
        box-shadow: var(--shadow-lg);
      }

      .toolbar {
        display: grid;
        grid-template-columns: 1fr 220px auto auto;
        gap: 0.75rem;
        padding: 1rem;
        margin-bottom: 1rem;
      }

      input,
      select {
        min-height: 42px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--surface-1);
        color: var(--text);
        padding: 0.7rem 0.85rem;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 86px;
        padding: 0.35rem 0.65rem;
        border-radius: 999px;
        background: rgba(248, 113, 113, 0.12);
        color: #fca5a5;
      }

      .badge.active {
        background: rgba(74, 222, 128, 0.12);
        color: #86efac;
      }

      .form-panel {
        display: grid;
        gap: 0.85rem;
        align-self: start;
        box-shadow: var(--shadow-xl);
      }

      .record-list {
        display: grid;
        gap: 0.85rem;
      }

      .employee-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.85rem;
        align-items: center;
        padding: 1rem;
        border-radius: var(--radius-lg);
        background: color-mix(in srgb, var(--bg-panel-muted) 64%, transparent);
        border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
      }

      .record-avatar {
        width: 2.7rem;
        height: 2.7rem;
        border-radius: 14px;
        background: rgba(20, 184, 166, 0.12);
        color: var(--accent);
        display: grid;
        place-items: center;
        font-weight: 800;
      }

      .record-main {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
      }

      .record-title-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .record-meta {
        color: var(--text-secondary);
      }

      .record-tags {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        color: var(--muted);
        font-size: 0.85rem;
      }

      .record-tags span {
        padding: 0.28rem 0.55rem;
        border-radius: 999px;
        background: var(--bg-panel);
        border: 1px solid var(--border);
      }

      .form-head {
        padding-bottom: 0.25rem;
      }

      label {
        display: grid;
        gap: 0.35rem;
      }

      .actions,
      .pagination {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .pagination {
        justify-content: space-between;
        padding-top: 1rem;
      }

      .state,
      .error-box {
        padding: 1rem;
        border-radius: 8px;
      }

      .state {
        background: rgba(15, 23, 42, 0.5);
        color: var(--muted);
      }

      .error-box {
        background: rgba(127, 29, 29, 0.35);
        border: 1px solid rgba(248, 113, 113, 0.35);
        color: #fecaca;
      }

      .primary,
      .secondary,
      .danger {
        min-height: 40px;
        padding: 0.65rem 0.9rem;
        border: 1px solid transparent;
        border-radius: 8px;
        cursor: pointer;
      }

      .primary {
        background: var(--accent);
        color: #08111f;
        font-weight: 700;
      }

      .secondary {
        background: transparent;
        border-color: var(--border);
        color: var(--text);
      }

      .danger {
        background: rgba(248, 113, 113, 0.12);
        border-color: rgba(248, 113, 113, 0.25);
        color: #fecaca;
      }

      @media (max-width: 1100px) {
        .content-grid,
        .toolbar {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .employee-card {
          grid-template-columns: 1fr;
        }

        .action-group {
          justify-content: flex-start;
        }
      }
    `
  ]
})
export class EmployeesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);

  employees: Employee[] = [];
  departments: Department[] = [];
  loading = false;
  saving = false;
  errorMessage = "";
  editingId: string | null = null;
  searchTerm = "";
  departmentFilter = "";
  page = 1;
  limit = 10;
  totalPages = 1;

  form = this.fb.group({
    fullName: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    phone: [""],
    role: [""],
    department: [""],
    status: ["active", [Validators.required]]
  });

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments(): void {
    this.departmentService.list().subscribe({
      next: (response) => {
        this.departments = response.data.items;
      }
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService
      .list({
        page: this.page,
        limit: this.limit,
        search: this.searchTerm,
        department: this.departmentFilter
      })
      .subscribe({
        next: (response) => {
          this.employees = response.data.items;
          this.page = response.data.page;
          this.limit = response.data.limit;
          this.totalPages = response.data.totalPages;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = "Unable to load employees.";
          this.loading = false;
        }
      });
  }

  changePage(nextPage: number): void {
    this.page = nextPage;
    this.loadEmployees();
  }

  resetFilters(): void {
    this.searchTerm = "";
    this.departmentFilter = "";
    this.page = 1;
    this.loadEmployees();
  }

  startCreate(): void {
    this.editingId = null;
    this.errorMessage = "";
    this.form.reset({
      fullName: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      status: "active"
    });
  }

  startEdit(employee: Employee): void {
    this.editingId = employee._id;
    this.errorMessage = "";
    this.form.reset({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone || "",
      role: employee.role || "",
      department: employee.department || "",
      status: employee.status || "active"
    });
  }

  saveEmployee(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = "";
    const payload = this.form.getRawValue() as EmployeePayload;

    const request$ = this.editingId
      ? this.employeeService.update(this.editingId, payload)
      : this.employeeService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.resetForm();
        this.loadEmployees();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.error?.message || "Unable to save employee.";
      }
    });
  }

  removeEmployee(employee: Employee): void {
    if (!confirm(`Delete ${employee.fullName}?`)) {
      return;
    }

    this.employeeService.delete(employee._id).subscribe({
      next: () => this.loadEmployees(),
      error: (error) => {
        this.errorMessage = error?.error?.message || "Unable to delete employee.";
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      fullName: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      status: "active"
    });
  }

  initials(name: string): string {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
}
