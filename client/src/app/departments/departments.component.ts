import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Department, DepartmentPayload } from "../core/models/department.model";
import { DepartmentService } from "../core/services/department.service";

@Component({
  selector: "app-departments",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <h2>Departments</h2>
        <p>Maintain the mall structure and ownership for each business area.</p>
      </div>
      <button class="btn-primary" type="button" (click)="openCreateModal()">Add Department</button>
    </section>

    <section *ngIf="loading" class="saas-card empty-state">
      <div class="empty-state-inner">
        <i class="pi pi-spin pi-spinner"></i>
        <h3>Loading departments</h3>
        <p>Fetching the latest mall department structure.</p>
      </div>
    </section>

    <section *ngIf="!loading && departments.length === 0" class="saas-card empty-state">
      <div class="empty-state-inner">
        <i class="pi pi-building"></i>
        <h3>No departments yet</h3>
        <p>Add your first department to start organizing teams, products, and reporting.</p>
        <button class="btn-primary" type="button" (click)="openCreateModal()">Add your first department</button>
      </div>
    </section>

    <section *ngIf="!loading && departments.length > 0" class="section-grid three-col">
      <article class="saas-card department-card" *ngFor="let department of departments">
        <div class="department-top">
          <div class="department-icon" [ngClass]="categoryClass(department.category)">
            <i class="pi" [class]="categoryIcon(department.category)"></i>
          </div>
          <div>
            <h3>{{ department.name }}</h3>
            <p>{{ department.category || "General" }}</p>
          </div>
        </div>

        <div class="department-stats">
          <div>
            <span>Employee count</span>
            <strong>{{ mockEmployeeCount(department.name) }}</strong>
          </div>
          <div>
            <span>Today's revenue</span>
            <strong>PKR {{ mockRevenue(department.name) }}</strong>
          </div>
          <div>
            <span>Top product</span>
            <strong>{{ mockTopProduct(department.name) }}</strong>
          </div>
        </div>

        <div class="department-footer">
          <div>
            <div class="footer-label">Manager</div>
            <div class="footer-value">{{ department.manager || "Unassigned" }}</div>
          </div>
          <span class="badge" [ngClass]="department.status === 'inactive' ? 'badge-danger' : 'badge-success'">
            {{ department.status || "active" }}
          </span>
          <button class="btn-secondary" type="button" (click)="openEditModal(department)">Edit</button>
        </div>
      </article>
    </section>

    <div class="modal-backdrop" *ngIf="modalOpen">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3>{{ editingId ? "Edit Department" : "Add Department" }}</h3>
            <p class="muted">Configure category, manager, and status for each mall unit.</p>
          </div>
          <button class="icon-button" type="button" (click)="closeModal()">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form class="form-grid" [formGroup]="form" (ngSubmit)="saveDepartment()">
          <div class="field">
            <label>Name</label>
            <input class="input-control" formControlName="name" type="text" />
            <div class="helper-error" *ngIf="isInvalid('name')">Department name is required.</div>
          </div>

          <div class="field">
            <label>Category</label>
            <select class="select-control" formControlName="category">
              <option value="">Select category</option>
              <option value="Fashion">Fashion</option>
              <option value="Food">Food</option>
              <option value="Electronics">Electronics</option>
              <option value="Beauty">Beauty</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div class="field">
            <label>Manager</label>
            <input class="input-control" formControlName="manager" type="text" />
          </div>

          <div class="field">
            <label>Status</label>
            <select class="select-control" formControlName="status">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          <div class="helper-error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <div class="modal-actions">
            <button class="btn-secondary" type="button" (click)="closeModal()">Cancel</button>
            <button class="btn-primary modal-submit" type="submit" [disabled]="form.invalid || saving">
              {{ saving ? "Saving..." : "Save Department" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .department-card {
        padding: 1.5rem;
        display: grid;
        gap: 1.25rem;
      }

      .department-top {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .department-top h3 {
        margin: 0;
      }

      .department-top p {
        margin: 0.3rem 0 0;
        color: var(--text-secondary);
      }

      .department-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        font-size: 1.15rem;
      }

      .category-fashion {
        color: #c084fc;
        background: rgba(168, 85, 247, 0.12);
      }

      .category-food {
        color: #fb923c;
        background: rgba(249, 115, 22, 0.12);
      }

      .category-electronics {
        color: #60a5fa;
        background: rgba(59, 130, 246, 0.12);
      }

      .category-beauty {
        color: #f472b6;
        background: rgba(236, 72, 153, 0.12);
      }

      .category-sports {
        color: #4ade80;
        background: rgba(34, 197, 94, 0.12);
      }

      .department-stats {
        display: grid;
        gap: 0.85rem;
      }

      .department-stats div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .department-stats span {
        color: var(--text-secondary);
        font-size: 0.88rem;
      }

      .department-footer {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 0.75rem;
        align-items: center;
      }

      .footer-label {
        color: var(--text-muted);
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .footer-value {
        margin-top: 0.25rem;
      }

      .modal-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: end;
        margin-top: 0.5rem;
      }

      .modal-submit {
        min-width: 200px;
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
  modalOpen = false;

  readonly form = this.fb.group({
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

  openCreateModal(): void {
    this.editingId = null;
    this.errorMessage = "";
    this.modalOpen = true;
    this.form.reset({
      name: "",
      category: "",
      manager: "",
      status: "active"
    });
  }

  openEditModal(department: Department): void {
    this.editingId = department._id;
    this.errorMessage = "";
    this.modalOpen = true;
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

  closeModal(): void {
    this.modalOpen = false;
    this.saving = false;
    this.editingId = null;
    this.errorMessage = "";
  }

  categoryClass(category?: string): string {
    const value = (category || "").toLowerCase();
    if (value.includes("fashion")) return "category-fashion";
    if (value.includes("food")) return "category-food";
    if (value.includes("electronics")) return "category-electronics";
    if (value.includes("beauty")) return "category-beauty";
    if (value.includes("sports")) return "category-sports";
    return "category-electronics";
  }

  categoryIcon(category?: string): string {
    const value = (category || "").toLowerCase();
    if (value.includes("fashion")) return "pi pi-star";
    if (value.includes("food")) return "pi pi-shopping-bag";
    if (value.includes("electronics")) return "pi pi-bolt";
    if (value.includes("beauty")) return "pi pi-heart";
    if (value.includes("sports")) return "pi pi-trophy";
    return "pi pi-building";
  }

  mockEmployeeCount(name: string): number {
    return ({ Fashion: 12, "Food Court": 9, Electronics: 8, Beauty: 6, Sports: 7 } as Record<string, number>)[name] ?? 5;
  }

  mockRevenue(name: string): string {
    return ({ Fashion: "98,200", "Food Court": "76,400", Electronics: "124,800", Beauty: "58,600", Sports: "64,900" } as Record<string, string>)[name] ?? "41,000";
  }

  mockTopProduct(name: string): string {
    return ({
      Fashion: "Classic Denim Jacket",
      "Food Court": "Burger Combo",
      Electronics: "Wireless Earbuds",
      Beauty: "Face Serum",
      Sports: "Running Shorts"
    } as Record<string, string>)[name] ?? "Store Bundle";
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.invalid && (control.touched || control.dirty));
  }
}
