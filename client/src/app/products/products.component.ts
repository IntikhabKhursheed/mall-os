import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ProductService } from "../core/services/product.service";
import { DepartmentService } from "../core/services/department.service";
import { Product, ProductPayload } from "../core/models/product.model";
import { Department } from "../core/models/department.model";

@Component({
  selector: "app-products",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, ReactiveFormsModule],
  template: `
    <section class="page-head">
      <div>
        <p class="muted">Track stock levels, pricing, and department assignment.</p>
      </div>
    </section>

    <section class="toolbar surface-panel">
      <input [(ngModel)]="searchTerm" (ngModelChange)="loadProducts()" type="search" placeholder="Search by name, SKU, or barcode" />
      <select [(ngModel)]="departmentFilter" (ngModelChange)="loadProducts()">
        <option value="">All departments</option>
        <option *ngFor="let department of departments" [value]="department.name">{{ department.name }}</option>
      </select>
      <button class="secondary" type="button" (click)="resetFilters()">Reset</button>
      <button class="primary" type="button" (click)="startCreate()">Add Product</button>
    </section>

    <section class="content-grid">
      <div class="surface-panel panel">
        <div *ngIf="loading" class="state">Loading products...</div>
        <div *ngIf="!loading && products.length === 0" class="state">No products found.</div>

        <div *ngIf="!loading && products.length > 0" class="record-list">
          <article class="record-card product-card" *ngFor="let product of products">
            <div class="record-avatar">{{ product.name.slice(0, 2).toUpperCase() }}</div>
            <div class="record-main">
              <div class="record-title-row">
                <strong>{{ product.name }}</strong>
                <span class="badge" [ngClass]="product.status || 'healthy'">{{ product.status || "healthy" }}</span>
              </div>
              <div class="record-meta">{{ product.department || "Unassigned department" }}</div>
              <div class="record-tags">
                <span>Sell {{ product.sellingPrice | currency : "USD" : "symbol" : "1.0-0" }}</span>
                <span>Cost {{ product.costPrice | currency : "USD" : "symbol" : "1.0-0" }}</span>
                <span>Stock {{ product.stockQuantity }}</span>
              </div>
            </div>
            <div class="action-group">
              <button type="button" class="secondary icon-action" (click)="startEdit(product)" aria-label="Edit product">
                <i class="pi pi-pencil"></i>
                <span class="sr-only">Edit</span>
              </button>
              <button type="button" class="danger icon-action" (click)="removeProduct(product)" aria-label="Delete product">
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
    </section>

    <div class="modal-backdrop" *ngIf="showAddModal" (click)="closeModal()">
      <div class="modal-card surface-panel" (click)="$event.stopPropagation()">
        <button type="button" class="ghost modal-close" (click)="closeModal()" aria-label="Close modal">
          <i class="pi pi-times"></i>
        </button>

        <form class="form-panel" [formGroup]="form" (ngSubmit)="saveProduct()">
          <div class="form-head">
            <h3>{{ editingId ? "Edit Product" : "Add Product" }}</h3>
            <p class="muted">Stock status is derived from quantity and reorder level.</p>
          </div>

          <label>
            Name
            <input formControlName="name" type="text" />
          </label>

          <label>
            SKU
            <input formControlName="sku" type="text" />
          </label>

          <label>
            Barcode
            <input formControlName="barcode" type="text" />
          </label>

          <label>
            Category
            <input formControlName="category" type="text" />
          </label>

          <label>
            Department
            <select formControlName="department">
              <option value="">Select department</option>
              <option *ngFor="let department of departments" [value]="department.name">{{ department.name }}</option>
            </select>
          </label>

          <label>
            Selling Price
            <input formControlName="sellingPrice" type="number" min="0" />
          </label>

          <label>
            Cost Price
            <input formControlName="costPrice" type="number" min="0" />
          </label>

          <label>
            Stock Quantity
            <input formControlName="stockQuantity" type="number" min="0" />
          </label>

          <label>
            Reorder Level
            <input formControlName="reorderLevel" type="number" min="0" />
          </label>

          <label>
            Image URL
            <input formControlName="image" type="text" />
          </label>

          <div class="hint">
            Status will be recalculated on save: healthy, low_stock, or out_of_stock.
          </div>

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
      .page-head {
        padding-bottom: 1rem;
      }

      .toolbar {
        display: grid;
        grid-template-columns: 1fr 220px auto auto;
        gap: 0.75rem;
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .content-grid {
        display: block;
      }

      .panel {
        padding: 1rem;
        box-shadow: var(--shadow-lg);
      }

      .badge {
        display: inline-flex;
        padding: 0.35rem 0.65rem;
        border-radius: 999px;
        font-size: 0.82rem;
      }

      .badge.healthy {
        background: rgba(74, 222, 128, 0.12);
        color: #86efac;
      }

      .badge.low_stock {
        background: rgba(251, 191, 36, 0.12);
        color: #fde68a;
      }

      .badge.out_of_stock {
        background: rgba(248, 113, 113, 0.12);
        color: #fca5a5;
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

      .record-list {
        display: grid;
        gap: 0.85rem;
      }

      .product-card {
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

      .hint,
      .state {
        color: var(--muted);
      }

      .hint {
        font-size: 0.9rem;
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

      @media (max-width: 1100px) {
        .toolbar {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .product-card {
          grid-template-columns: 1fr;
        }

        .action-group {
          justify-content: flex-start;
        }
      }
    `
  ]
})
export class ProductsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly departmentService = inject(DepartmentService);

  products: Product[] = [];
  departments: Department[] = [];
  loading = false;
  saving = false;
  errorMessage = "";
  editingId: string | null = null;
  showAddModal = false;
  searchTerm = "";
  departmentFilter = "";
  page = 1;
  limit = 10;
  totalPages = 1;

  form = this.fb.group({
    name: ["", [Validators.required]],
    sku: [""],
    barcode: [""],
    category: [""],
    department: [""],
    sellingPrice: [0, [Validators.required, Validators.min(0)]],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    reorderLevel: [0, [Validators.required, Validators.min(0)]],
    image: [""]
  });

  ngOnInit(): void {
    this.loadDepartments();
    this.loadProducts();
  }

  loadDepartments(): void {
    this.departmentService.list().subscribe({
      next: (response) => {
        this.departments = response.data.items;
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService
      .list({
        page: this.page,
        limit: this.limit,
        search: this.searchTerm,
        department: this.departmentFilter
      })
      .subscribe({
        next: (response) => {
          this.products = response.data.items;
          this.page = response.data.page;
          this.limit = response.data.limit;
          this.totalPages = response.data.totalPages;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = "Unable to load products.";
        }
      });
  }

  changePage(nextPage: number): void {
    this.page = nextPage;
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = "";
    this.departmentFilter = "";
    this.page = 1;
    this.loadProducts();
  }

  startCreate(): void {
    this.editingId = null;
    this.errorMessage = "";
    this.showAddModal = true;
    this.form.reset({
      name: "",
      sku: "",
      barcode: "",
      category: "",
      department: "",
      sellingPrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      reorderLevel: 0,
      image: ""
    });
  }

  startEdit(product: Product): void {
    this.editingId = product._id;
    this.errorMessage = "";
    this.showAddModal = true;
    this.form.reset({
      name: product.name,
      sku: product.sku || "",
      barcode: product.barcode || "",
      category: product.category || "",
      department: product.department || "",
      sellingPrice: product.sellingPrice || 0,
      costPrice: product.costPrice || 0,
      stockQuantity: product.stockQuantity || 0,
      reorderLevel: product.reorderLevel || 0,
      image: product.image || ""
    });
  }

  saveProduct(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = "";
    const payload = this.form.getRawValue() as ProductPayload;
    const request$ = this.editingId
      ? this.productService.update(this.editingId, payload)
      : this.productService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadProducts();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.error?.message || "Unable to save product.";
      }
    });
  }

  removeProduct(product: Product): void {
    if (!confirm(`Delete ${product.name}?`)) {
      return;
    }

    this.productService.delete(product._id).subscribe({
      next: () => this.loadProducts(),
      error: (error) => {
        this.errorMessage = error?.error?.message || "Unable to delete product.";
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      name: "",
      sku: "",
      barcode: "",
      category: "",
      department: "",
      sellingPrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      reorderLevel: 0,
      image: ""
    });
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }
}
