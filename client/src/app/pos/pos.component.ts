import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject, HostListener } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { CartLine, PosState } from "../core/services/mall-data.service";
import { Product } from "../core/models/product.model";
import { ProductService } from "../core/services/product.service";
import { PosService } from "../core/services/pos.service";

@Component({
  selector: "app-pos",
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, PageHeaderComponent],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly posService = inject(PosService);
  private readonly router = inject(Router);

  catalog: Product[] = [];
  cart: CartLine[] = [];
  suspendedSales: PosState["suspendedSales"] = [];
  paymentMethod: PosState["paymentMethod"] = "cash";
  customerName = "Walk-in customer";
  discountValue = 0;
  searchTerm = "";
  departmentFilter = "";
  modalSearch = "";
  modalResults: Product[] = [];
  showAddModal = false;
  loading = false;

  ngOnInit(): void {
    this.refreshCatalog();
  }

  @HostListener("window:keydown", ["$event"])
  handleShortcut(event: KeyboardEvent): void {
    if (event.key === "F2") {
      event.preventDefault();
      this.setPaymentMethod("cash");
      this.completeCurrentSale();
    }
  }

  get subtotal(): number {
    return this.cart.reduce((sum, line) => sum + this.lineTotal(line), 0);
  }

  get discount(): number {
    return Math.min(this.discountValue, this.subtotal);
  }

  get grandTotal(): number {
    return Math.max(0, this.subtotal - this.discount);
  }

  refreshCatalog(): void {
    this.loading = true;
    this.productService
      .list({
        page: 1,
        limit: 100,
        search: this.searchTerm,
        department: this.departmentFilter
      })
      .subscribe({
        next: (response) => {
          this.catalog = response.data.items;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  setDepartmentFilter(filter: string): void {
    this.departmentFilter = filter;
    this.refreshCatalog();
  }

  addProductToCart(product: Product): void {
    if ((product.stockQuantity ?? 0) <= 0) {
      return;
    }

    const index = this.cart.findIndex((line) => line.productId === product._id);
    if (index >= 0) {
      this.cart[index].quantity += 1;
    } else {
      this.cart.unshift({
        productId: product._id,
        name: product.name,
        department: product.department || "Unassigned",
        barcode: product.barcode,
        quantity: 1,
        unitPrice: Number(product.sellingPrice ?? 0),
        stockQuantity: Number(product.stockQuantity ?? 0),
        status: product.status || this.stockStatus(product)
      });
    }

    this.closeModal();
  }

  changeQty(line: CartLine, delta: number): void {
    const index = this.cart.findIndex((item) => item.productId === line.productId);
    if (index >= 0) {
      const nextQuantity = this.cart[index].quantity + delta;
      if (nextQuantity <= 0) {
        this.cart.splice(index, 1);
      } else {
        this.cart[index].quantity = nextQuantity;
      }
    }
  }

  removeLine(line: CartLine): void {
    this.cart = this.cart.filter((item) => item.productId !== line.productId);
  }

  setPaymentMethod(method: PosState["paymentMethod"]): void {
    this.paymentMethod = method;
  }

  syncCustomerName(): void {
    this.customerName = this.customerName || "Walk-in customer";
  }

  suspendCurrentSale(): void {
    if (!this.cart.length) {
      return;
    }

    this.suspendedSales.unshift({
      id: `susp-${Date.now()}`,
      name: this.customerName || "Suspended sale",
      items: this.cart.map((item) => ({ ...item })),
      subtotal: this.subtotal,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
    this.cart = [];
    this.discountValue = 0;
  }

  completeCurrentSale(): void {
    this.posService
      .completeSale({
        items: this.cart.map((line) => ({
          productId: line.productId,
          quantity: line.quantity
        })),
        discount: this.discount,
        tax: 0,
        paymentMethod: this.paymentMethod,
        timestamp: new Date().toISOString()
      })
      .subscribe({
        next: () => {
          this.cart = [];
          this.discountValue = 0;
          this.refreshCatalog();
          void this.router.navigateByUrl("/sales");
        }
      });
  }

  chargeCustomer(): void {
    this.completeCurrentSale();
  }

  resumeSale(id: string): void {
    const index = this.suspendedSales.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.cart = this.suspendedSales[index].items.map((item) => ({ ...item }));
      this.suspendedSales.splice(index, 1);
    }
  }

  openAddProductModal(): void {
    this.showAddModal = true;
    this.modalSearch = "";
    this.refreshModalResults();
  }

  refreshModalResults(): void {
    this.productService
      .list({
        page: 1,
        limit: 100,
        search: this.modalSearch
      })
      .subscribe((response) => {
        this.modalResults = response.data.items;
      });
  }

  closeModal(): void {
    this.showAddModal = false;
  }

  stockStatus(item: Product): Product["status"] {
    if ((item.stockQuantity ?? 0) <= 0) {
      return "out_of_stock";
    }
    if ((item.stockQuantity ?? 0) <= (item.reorderLevel ?? 0)) {
      return "low_stock";
    }
    return "healthy";
  }

  lineTotal(line: CartLine): number {
    return line.quantity * line.unitPrice;
  }

  refreshCatalogAndState(): void {
    this.refreshCatalog();
  }
}
