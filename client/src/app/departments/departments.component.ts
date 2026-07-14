import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { DepartmentService } from "../core/services/department.service";
import { Department, DepartmentPayload } from "../core/models/department.model";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-departments",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss'
})
export class DepartmentsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);

  departments: Department[] = [];
  loading = false;
  saving = false;
  errorMessage = "";
  serverErrors: Record<string, string> = {};
  editingId: string | null = null;
  showAddModal = false;

  form = this.fb.group({
    name: ["", [Validators.required]],
    category: [""],
    manager: [""],
    status: ["active", [Validators.required]]
  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.list().subscribe({
      next: (response) => {
        this.departments = response.data.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = "Unable to load departments.";
      }
    });
  }

  startEdit(department: Department): void {
    this.editingId = department._id;
    this.errorMessage = "";
    this.serverErrors = {};
    this.showAddModal = true;
    this.form.reset({
      name: department.name,
      category: department.category || "",
      manager: department.manager || "",
      status: department.status || "active"
    });
  }

  saveDepartment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = "";
    this.serverErrors = {};
    const payload = this.form.getRawValue() as DepartmentPayload;
    const request$ = this.editingId
      ? this.departmentService.update(this.editingId, payload)
      : this.departmentService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadDepartments();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.error?.message || "Unable to save department.";
        this.serverErrors = error?.error?.errors || {};
      }
    });
  }

  removeDepartment(department: Department): void {
    if (!confirm(`Delete ${department.name}?`)) {
      return;
    }

    this.departmentService.delete(department._id).subscribe({
      next: () => this.loadDepartments(),
      error: (error) => {
        this.errorMessage = error?.error?.message || "Unable to delete department.";
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.serverErrors = {};
    this.form.reset({
      name: "",
      category: "",
      manager: "",
      status: "active"
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.errorMessage = "";
    this.serverErrors = {};
    this.showAddModal = true;
    this.resetForm();
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }
}
