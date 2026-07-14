import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ProductService } from "../core/services/product.service";
import { DepartmentService } from "../core/services/department.service";
import { Product, ProductPayload } from "../core/models/product.model";
import { Department } from "../core/models/department.model";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-products",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
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
  serverErrors: Record<string, string> = {};
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
    this.serverErrors = {};
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
    this.serverErrors = {};
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
    this.serverErrors = {};
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
        this.serverErrors = error?.error?.errors || {};
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
    this.serverErrors = {};
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
