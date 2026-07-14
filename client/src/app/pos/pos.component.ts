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
  template: `
    <app-page-header
      eyebrow="Operations"
      title="Checkout workspace"
      subtitle="Use a structured checkout workspace for fast sales processing."
    >
      <div actions>
        <button type="button" class="secondary" (click)="suspendCurrentSale()">Suspend Sale</button>
        <button type="button" class="secondary" (click)="openAddProductModal()">Add Product</button>
        <button type="button" class="primary" (click)="completeCurrentSale()">Complete Sale</button>
      </div>
    </app-page-header>

    <section class="pos-shell">
      <article class="surface-panel terminal-panel catalog-panel">
        <div class="section-head">
          <div>
            <div class="eyebrow">Overview</div>
            <h3>Search and add items</h3>
          </div>
          <button type="button" class="ghost" (click)="refreshCatalog()">Scan Barcode</button>
        </div>

        <div class="search-bar">
          <i class="pi pi-search"></i>
          <input [(ngModel)]="searchTerm" (ngModelChange)="refreshCatalog()" type="search" placeholder="Search by product, barcode, or department" />
        </div>

        <div class="chip-row">
          <button type="button" class="chip" [class.active]="departmentFilter === ''" (click)="setDepartmentFilter('')">All</button>
          <button type="button" class="chip" [class.active]="departmentFilter === 'Fashion'" (click)="setDepartmentFilter('Fashion')">Fashion</button>
          <button type="button" class="chip" [class.active]="departmentFilter === 'Food Court'" (click)="setDepartmentFilter('Food Court')">Food Court</button>
          <button type="button" class="chip" [class.active]="departmentFilter === 'Electronics'" (click)="setDepartmentFilter('Electronics')">Electronics</button>
          <button type="button" class="chip" [class.active]="departmentFilter === 'Beauty'" (click)="setDepartmentFilter('Beauty')">Beauty</button>
        </div>

        <div class="product-grid">
          <button type="button" class="surface-panel product-tile interactive-card" *ngFor="let item of catalog" (click)="addProductToCart(item)">
            <div class="tile-top">
              <div class="tile-badge">{{ (item.sku || item._id) | slice : 0 : 4 }}</div>
              <span class="badge" [ngClass]="item.status || stockStatus(item)">{{ item.status || stockStatus(item) }}</span>
            </div>
            <h4>{{ item.name }}</h4>
            <p class="muted">{{ item.department || "Unassigned" }}</p>
            <div class="tile-bottom">
              <strong>{{ item.sellingPrice | currency : "PKR" : "symbol" : "1.0-0" }}</strong>
              <span class="muted">{{ item.stockQuantity || 0 }} in stock</span>
            </div>
          </button>
        </div>
      </article>

      <aside class="surface-panel terminal-panel checkout-panel">
        <div class="section-head">
          <div>
            <div class="eyebrow">Transactions</div>
            <h3>Checkout summary</h3>
          </div>
          <span class="badge badge-default">Dine-in</span>
        </div>

        <label class="field">
          Customer
          <input [(ngModel)]="customerName" (ngModelChange)="syncCustomerName()" type="text" placeholder="Walk-in customer" />
        </label>

        <div class="checkout-card">
          <div *ngIf="cart.length === 0" class="empty-cart">Your cart is empty. Add items from the catalog to begin checkout.</div>
          <div class="checkout-row" *ngFor="let line of cart">
            <div>
              <strong>{{ line.name }}</strong>
              <p class="muted">{{ line.department }} · {{ line.barcode || "No barcode" }}</p>
            </div>
            <div class="qty-controls">
              <button type="button" class="ghost qty-button" (click)="changeQty(line, -1)">-</button>
              <div class="qty-pill">x{{ line.quantity }}</div>
              <button type="button" class="ghost qty-button" (click)="changeQty(line, 1)">+</button>
            </div>
            <strong>{{ lineTotal(line) | currency : "PKR" : "symbol" : "1.0-0" }}</strong>
            <button type="button" class="ghost qty-button" (click)="removeLine(line)" aria-label="Remove item">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <div class="totals-card">
          <div class="total-row">
            <span class="muted">Subtotal</span>
            <strong>{{ subtotal | currency : "PKR" : "symbol" : "1.0-0" }}</strong>
          </div>
          <div class="total-row">
            <span class="muted">Discount</span>
            <strong>- {{ discount | currency : "PKR" : "symbol" : "1.0-0" }}</strong>
          </div>
          <div class="total-row grand-total">
            <span>Total due</span>
            <strong>{{ grandTotal | currency : "PKR" : "symbol" : "1.0-0" }}</strong>
          </div>
        </div>

        <div class="payment-grid">
          <button type="button" class="secondary" [class.active-payment]="paymentMethod === 'cash'" (click)="setPaymentMethod('cash')">Cash</button>
          <button type="button" class="secondary" [class.active-payment]="paymentMethod === 'easypaisa'" (click)="setPaymentMethod('easypaisa')">EasyPaisa</button>
          <button type="button" class="secondary" [class.active-payment]="paymentMethod === 'jazzcash'" (click)="setPaymentMethod('jazzcash')">JazzCash</button>
          <button type="button" class="secondary" [class.active-payment]="paymentMethod === 'raast'" (click)="setPaymentMethod('raast')">Raast</button>
          <button type="button" class="secondary" [class.active-payment]="paymentMethod === 'card'" (click)="setPaymentMethod('card')">Card</button>
          <button type="button" class="secondary" [class.active-payment]="paymentMethod === 'wallet'" (click)="setPaymentMethod('wallet')">Wallet</button>
          <button type="button" class="primary" (click)="chargeCustomer()">Complete Sale</button>
        </div>

        <div class="suspended-list" *ngIf="suspendedSales.length">
          <div class="section-head">
            <div>
              <div class="eyebrow">Suspended</div>
              <h3>Saved sales</h3>
            </div>
          </div>

          <button type="button" class="suspended-item" *ngFor="let sale of suspendedSales" (click)="resumeSale(sale.id)">
            <div>
              <strong>{{ sale.name }}</strong>
              <p class="muted">{{ sale.items.length }} items · {{ sale.subtotal | currency : "PKR" : "symbol" : "1.0-0" }}</p>
            </div>
            <span class="badge badge-default">Resume</span>
          </button>
        </div>
      </aside>
    </section>

    <div class="modal-backdrop" *ngIf="showAddModal" (click)="closeModal()">
      <div class="modal-card surface-panel" (click)="$event.stopPropagation()">
        <button type="button" class="ghost modal-close" (click)="closeModal()" aria-label="Close modal">
          <i class="pi pi-times"></i>
        </button>

        <div class="form-panel">
          <div class="form-head">
            <h3>Add product to cart</h3>
            <p class="muted">Search by name, barcode, or department and add the selected item directly to checkout.</p>
          </div>

          <input [(ngModel)]="modalSearch" (ngModelChange)="refreshModalResults()" type="search" placeholder="Search products" />

          <div class="modal-results">
            <button type="button" class="modal-result" *ngFor="let item of modalResults" (click)="addProductToCart(item)">
              <div>
                <strong>{{ item.name }}</strong>
                <p class="muted">{{ item.department }} · {{ item.barcode || "No barcode" }}</p>
              </div>
              <span class="badge" [ngClass]="item.status || stockStatus(item)">{{ item.status || stockStatus(item) }}</span>
            </button>
          </div>

          <div *ngIf="modalResults.length === 0" class="empty-cart">No products matched the search.</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
      }

      .pos-shell {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
        gap: 1rem;
        align-items: start;
      }

      .terminal-panel {
        padding: 1rem;
        display: grid;
        gap: 1rem;
      }

      .search-bar {
        min-height: 48px;
        padding: 0.85rem 1rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: var(--bg-panel-muted);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-secondary);
      }

      .search-bar input {
        border: 0;
        background: transparent;
        box-shadow: none;
        padding: 0;
        min-height: 0;
      }

      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }

      .chip {
        min-height: 38px;
        padding: 0.5rem 0.9rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--bg-panel);
        color: var(--text-secondary);
        box-shadow: var(--shadow-xs);
      }

      .chip.active,
      .active-payment {
        background: color-mix(in srgb, var(--accent) 14%, var(--bg-panel) 86%);
        color: var(--accent);
        border-color: color-mix(in srgb, var(--accent) 24%, transparent);
      }

      .product-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .product-tile {
        text-align: left;
        padding: 1rem;
        border-radius: var(--radius-lg);
        display: grid;
        gap: 0.55rem;
        cursor: pointer;
      }

      .tile-top,
      .tile-bottom,
      .total-row,
      .checkout-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .tile-top {
        align-items: start;
      }

      .tile-badge,
      .qty-pill {
        min-width: 2.25rem;
        height: 2.25rem;
        padding: 0 0.7rem;
        border-radius: 999px;
        background: var(--bg-panel-muted);
        display: inline-grid;
        place-items: center;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .checkout-card,
      .totals-card {
        display: grid;
        gap: 0.75rem;
      }

      .checkout-card {
        padding: 0.25rem 0;
      }

      .checkout-row,
      .suspended-item {
        padding: 0.85rem;
        border-radius: var(--radius-md);
        background: var(--bg-panel-muted);
      }

      .checkout-row p {
        margin: 0.2rem 0 0;
      }

      .qty-controls {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
      }

      .qty-button {
        width: 34px;
        min-width: 34px;
        min-height: 34px;
        padding: 0;
        border-radius: 10px;
      }

      .totals-card {
        padding: 0.95rem;
        border-radius: var(--radius-lg);
        background: color-mix(in srgb, var(--bg-panel-muted) 65%, transparent);
        border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      }

      .grand-total {
        padding-top: 0.6rem;
        border-top: 1px solid var(--border);
        font-size: 1.05rem;
      }

      .payment-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }

      .checkout-panel {
        position: sticky;
        top: 1rem;
      }

      .field {
        display: grid;
        gap: 0.35rem;
      }

      .field input {
        min-height: 42px;
      }

      .suspended-list {
        display: grid;
        gap: 0.75rem;
      }

      .suspended-item {
        width: 100%;
        border: 1px solid transparent;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: rgba(0, 0, 0, 0.5);
      }

      .modal-card {
        position: relative;
        width: min(100%, 44rem);
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

      .form-panel {
        display: grid;
        gap: 0.9rem;
      }

      .modal-results {
        display: grid;
        gap: 0.75rem;
      }

      .modal-result {
        width: 100%;
        border: 1px solid var(--border);
        background: var(--bg-panel-muted);
        border-radius: 14px;
        padding: 0.9rem 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        cursor: pointer;
        text-align: left;
      }

      .modal-result p,
      .empty-cart {
        margin: 0.25rem 0 0;
      }

      .empty-cart {
        color: var(--muted);
      }

      .badge {
        white-space: nowrap;
      }

      @media (max-width: 1100px) {
        .pos-shell {
          grid-template-columns: 1fr;
        }

        .checkout-panel {
          position: static;
        }
      }

      @media (max-width: 720px) {
        .product-grid,
        .payment-grid {
          grid-template-columns: 1fr;
        }

        .checkout-row {
          grid-template-columns: 1fr;
          align-items: start;
        }
      }
    `
  ]
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
