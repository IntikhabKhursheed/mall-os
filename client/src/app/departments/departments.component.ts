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
  template: `
    <app-page-header
      eyebrow="Operations"
      title="Departments"
      subtitle="Maintain the mall structure and ownership for each business area."
    >
      <div actions>
        <button class="primary" type="button" (click)="startCreate()">Add Department</button>
      </div>
    </app-page-header>

    <section class="content-grid">
      <div class="cards-grid">
        <div *ngIf="loading" class="surface-panel state loading">
          <div class="state-icon"><i class="pi pi-spin pi-spinner"></i></div>
          <h3 class="state-title">Loading departments</h3>
          <p class="state-copy">Updating the mall structure and ownership data.</p>
        </div>
        <div *ngIf="!loading && departments.length === 0" class="surface-panel state">
          <div class="state-icon"><i class="pi pi-inbox"></i></div>
          <h3 class="state-title">No departments found</h3>
          <p class="state-copy">Add a department to start organizing the mall layout.</p>
        </div>

        <article class="surface-panel dept-card" *ngFor="let department of departments">
          <div class="card-head">
            <div>
              <h3>{{ department.name }}</h3>
              <p class="muted">{{ department.category || "Uncategorized" }}</p>
            </div>
            <span class="badge" [ngClass]="department.status || 'active'">{{ department.status || "active" }}</span>
          </div>
          <div class="muted">Manager: {{ department.manager || "-" }}</div>
          <div class="card-actions action-group">
            <button type="button" class="secondary icon-action" (click)="startEdit(department)" aria-label="Edit department">
              <i class="pi pi-pencil"></i>
              <span class="sr-only">Edit</span>
            </button>
            <button type="button" class="danger icon-action" (click)="removeDepartment(department)" aria-label="Delete department">
              <i class="pi pi-trash"></i>
              <span class="sr-only">Delete</span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <div class="modal-backdrop" *ngIf="showAddModal" (click)="closeModal()">
      <div class="modal-card surface-panel" (click)="$event.stopPropagation()">
        <button type="button" class="ghost modal-close" (click)="closeModal()" aria-label="Close modal">
          <i class="pi pi-times"></i>
        </button>

        <form class="form-panel" [formGroup]="form" (ngSubmit)="saveDepartment()">
          <div class="form-head">
            <h3>{{ editingId ? "Edit Department" : "Add Department" }}</h3>
            <p class="muted">Departments can be reassigned from employee and product forms.</p>
          </div>

          <fieldset class="form-section">
            <legend>Department details</legend>
            <div class="form-grid cols-2">
              <label class="span-2">
                Name
                <input formControlName="name" type="text" />
              </label>

              <label>
                Category
                <input formControlName="category" type="text" />
              </label>

              <label>
                Status
                <select formControlName="status">
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>

              <label class="span-2">
                Manager
                <input formControlName="manager" type="text" />
              </label>
            </div>
          </fieldset>

          <div class="actions">
            <button type="submit" class="primary" [disabled]="form.invalid || saving">{{ saving ? "Saving..." : "Save" }}</button>
            <button type="button" class="secondary" (click)="resetForm()">Clear</button>
          </div>

          <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
      }

      .content-grid {
        display: block;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .dept-card,
      .form-panel,
      .state {
        padding: 1rem;
      }

      .dept-card {
        display: grid;
        gap: 0.8rem;
        box-shadow: var(--shadow-lg);
      }

      .card-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
      }

      .card-actions,
      .actions {
        display: flex;
        gap: 0.75rem;
      }

      label {
        display: grid;
        gap: 0.35rem;
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

      .form-panel {
        display: grid;
        gap: 0.85rem;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: rgba(0, 0, 0, 0.5);
      }

      .modal-card {
        position: relative;
        width: min(100%, 42rem);
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: var(--shadow-xl);
      }

      .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 2.25rem;
        min-width: 2.25rem;
        min-height: 2.25rem;
        padding: 0;
        border-radius: 999px;
        display: inline-grid;
        place-items: center;
      }

      .state {
        color: var(--muted);
      }

      .span-2 {
        grid-column: span 2;
      }

      .error-box {
        padding: 1rem;
        border-radius: 8px;
        background: rgba(127, 29, 29, 0.35);
        border: 1px solid rgba(248, 113, 113, 0.35);
        color: #fecaca;
      }

      .primary,
      .secondary,
      .danger {
        min-height: 40px;
        padding: 0.65rem 0.9rem;
        border-radius: 8px;
        cursor: pointer;
      }

      .primary {
        border: 1px solid transparent;
        background: var(--accent);
        color: #08111f;
        font-weight: 700;
      }

      .secondary {
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text);
      }

      .danger {
        border: 1px solid rgba(248, 113, 113, 0.25);
        background: rgba(248, 113, 113, 0.12);
        color: #fecaca;
      }

      @media (max-width: 720px) {
        .span-2 {
          grid-column: auto;
        }
      }

    `
  ]
})
export class DepartmentsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);

  departments: Department[] = [];
  loading = false;
  saving = false;
  errorMessage = "";
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
    this.showAddModal = true;
    this.resetForm();
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }
}
