import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { EmployeeService } from "../core/services/employee.service";
import { DepartmentService } from "../core/services/department.service";
import { Department } from "../core/models/department.model";
import { Employee, EmployeePayload } from "../core/models/employee.model";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-employees",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
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
  serverErrors: Record<string, string> = {};
  editingId: string | null = null;
  showAddModal = false;
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
    this.serverErrors = {};
    this.showAddModal = true;
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
    this.serverErrors = {};
    this.showAddModal = true;
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
    this.serverErrors = {};
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
        this.serverErrors = error?.error?.errors || {};
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
    this.serverErrors = {};
    this.form.reset({
      fullName: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      status: "active"
    });
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
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
