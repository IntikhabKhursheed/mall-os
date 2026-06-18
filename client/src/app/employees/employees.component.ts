import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { Department } from "../core/models/department.model";
import { Employee, EmployeePayload } from "../core/models/employee.model";
import { DepartmentService } from "../core/services/department.service";
import { EmployeeService } from "../core/services/employee.service";

@Component({
  selector: "app-employees",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <h2>Employees</h2>
        <p>Manage staff accounts, roles, and department assignment.</p>
      </div>
      <button class="btn-primary" type="button" (click)="openCreateModal()">Add Employee</button>
    </section>

    <section class="saas-card panel-section">
      <div class="toolbar-row table-toolbar">
        <input
          class="input-control search-control"
          [(ngModel)]="searchTerm"
          (ngModelChange)="handleFilterChange()"
          type="search"
          placeholder="Search by name or email"
        />
        <select class="select-control filter-control" [(ngModel)]="departmentFilter" (ngModelChange)="handleFilterChange()">
          <option value="">All departments</option>
          <option *ngFor="let department of departments" [value]="department.name">{{ department.name }}</option>
        </select>
        <button class="btn-secondary" type="button" (click)="resetFilters()">Reset</button>
      </div>

      <div *ngIf="loading" class="empty-state">
        <div class="empty-state-inner">
          <i class="pi pi-spin pi-spinner"></i>
          <h3>Loading employees</h3>
          <p>Pulling the latest staff records from MallOS.</p>
        </div>
      </div>

      <div *ngIf="!loading && employees.length === 0" class="empty-state">
        <div class="empty-state-inner">
          <i class="pi pi-users"></i>
          <h3>No employees found</h3>
          <p>Add your first employee or widen the current search filters.</p>
          <button class="btn-primary" type="button" (click)="openCreateModal()">Add Employee</button>
        </div>
      </div>

      <div *ngIf="!loading && employees.length > 0" class="table-wrap">
        <table class="saas-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of employees">
              <td>
                <div class="employee-cell">
                  <div class="employee-avatar">{{ initials(employee.fullName) }}</div>
                  <div>
                    <div class="employee-name">{{ employee.fullName }}</div>
                    <div class="employee-phone">{{ employee.phone || "No phone number" }}</div>
                  </div>
                </div>
              </td>
              <td>{{ employee.email }}</td>
              <td><span class="badge" [ngClass]="roleBadgeClass(employee.role)">{{ employee.role || "cashier" }}</span></td>
              <td><span class="badge badge-cashier">{{ employee.department || "Unassigned" }}</span></td>
              <td>
                <span class="badge" [ngClass]="employee.status === 'inactive' ? 'badge-danger' : 'badge-success'">
                  {{ employee.status || "active" }}
                </span>
              </td>
              <td class="actions-col">
                <div class="row-actions">
                  <button class="icon-button" type="button" (click)="openEditModal(employee)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button class="icon-button" type="button" (click)="toggleStatus(employee)">
                    <i class="pi" [class.pi-lock]="employee.status === 'active'" [class.pi-lock-open]="employee.status === 'inactive'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-row">
        <button class="btn-secondary" type="button" [disabled]="page === 1" (click)="changePage(page - 1)">Previous</button>
        <span class="muted">Page {{ page }} of {{ totalPages }}</span>
        <button class="btn-secondary" type="button" [disabled]="page >= totalPages" (click)="changePage(page + 1)">Next</button>
      </div>
    </section>

    <div class="modal-backdrop" *ngIf="modalOpen">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3>{{ editingId ? "Edit Employee" : "Add Employee" }}</h3>
            <p class="muted">Capture core identity, role, and department details.</p>
          </div>
          <button class="icon-button" type="button" (click)="closeModal()">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form class="form-grid" [formGroup]="form" (ngSubmit)="saveEmployee()">
          <div class="field">
            <label>Full Name</label>
            <input class="input-control" formControlName="fullName" type="text" />
            <div class="helper-error" *ngIf="isInvalid('fullName')">Full name is required.</div>
          </div>

          <div class="field">
            <label>Email</label>
            <input class="input-control" formControlName="email" type="email" />
            <div class="helper-error" *ngIf="isInvalid('email')">Enter a valid email address.</div>
          </div>

          <div class="form-grid two-col">
            <div class="field">
              <label>Phone</label>
              <input class="input-control" formControlName="phone" type="text" />
            </div>

            <div class="field">
              <label>Role</label>
              <select class="select-control" formControlName="role">
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
          </div>

          <div class="form-grid two-col">
            <div class="field">
              <label>Department</label>
              <select class="select-control" formControlName="department">
                <option value="">Select department</option>
                <option *ngFor="let department of departments" [value]="department.name">{{ department.name }}</option>
              </select>
            </div>

            <div class="field">
              <label>Status</label>
              <select class="select-control" formControlName="status">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>

          <div class="helper-error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <div class="modal-actions">
            <button class="btn-secondary" type="button" (click)="closeModal()">Cancel</button>
            <button class="btn-primary modal-submit" type="submit" [disabled]="form.invalid || saving">
              {{ saving ? "Saving..." : "Save Employee" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .table-toolbar {
        margin-bottom: 1.25rem;
      }

      .search-control {
        min-width: min(360px, 100%);
        flex: 1 1 320px;
      }

      .filter-control {
        min-width: 220px;
      }

      .employee-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .employee-avatar {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: rgba(20, 184, 166, 0.14);
        color: #5eead4;
        font-weight: 700;
      }

      .employee-name {
        font-weight: 600;
      }

      .employee-phone {
        color: var(--text-secondary);
        font-size: 0.84rem;
      }

      .actions-col {
        width: 120px;
      }

      .row-actions {
        display: flex;
        gap: 0.5rem;
      }

      .pagination-row {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .modal-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: end;
        margin-top: 0.5rem;
      }

      .modal-submit {
        min-width: 180px;
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
  modalOpen = false;
  searchTerm = "";
  departmentFilter = "";
  page = 1;
  limit = 10;
  totalPages = 1;

  readonly form = this.fb.group({
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

  handleFilterChange(): void {
    this.page = 1;
    this.loadEmployees();
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

  openCreateModal(): void {
    this.editingId = null;
    this.errorMessage = "";
    this.modalOpen = true;
    this.form.reset({
      fullName: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      status: "active"
    });
  }

  openEditModal(employee: Employee): void {
    this.editingId = employee._id;
    this.errorMessage = "";
    this.modalOpen = true;
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
        this.closeModal();
        this.loadEmployees();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.error?.message || "Unable to save employee.";
      }
    });
  }

  toggleStatus(employee: Employee): void {
    this.employeeService
      .update(employee._id, {
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone || "",
        role: employee.role || "",
        department: employee.department || "",
        status: employee.status === "active" ? "inactive" : "active"
      })
      .subscribe({
        next: () => this.loadEmployees(),
        error: (error) => {
          this.errorMessage = error?.error?.message || "Unable to update employee status.";
        }
      });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.saving = false;
    this.editingId = null;
    this.errorMessage = "";
  }

  initials(name: string): string {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  roleBadgeClass(role?: string): string {
    return role === "manager" ? "badge-manager" : role === "cashier" ? "badge-cashier" : "badge-admin";
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.invalid && (control.touched || control.dirty));
  }
}
