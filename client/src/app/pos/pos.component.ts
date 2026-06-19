import { CommonModule, NgFor } from "@angular/common";
import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-pos",
  standalone: true,
  imports: [CommonModule, NgFor, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Operations"
      title="POS Terminal"
      subtitle="Use a structured checkout workspace for fast sales processing."
    >
      <div actions>
        <button type="button" class="secondary">Suspend Sale</button>
        <button type="button" class="primary">Complete Sale</button>
      </div>
    </app-page-header>

    <section class="pos-shell">
      <article class="surface-panel terminal-panel catalog-panel">
        <div class="section-head">
          <div>
            <div class="eyebrow">Product lookup</div>
            <h3>Search and add items</h3>
          </div>
          <button type="button" class="ghost">Scan Barcode</button>
        </div>

        <div class="search-bar">
          <i class="pi pi-search"></i>
          <span>Search by product, barcode, or department</span>
        </div>

        <div class="chip-row">
          <button type="button" class="chip active">All</button>
          <button type="button" class="chip">Fashion</button>
          <button type="button" class="chip">Food Court</button>
          <button type="button" class="chip">Electronics</button>
        </div>

        <div class="product-grid">
          <button type="button" class="surface-panel product-tile interactive-card" *ngFor="let item of catalog">
            <div class="tile-top">
              <div class="tile-badge">{{ item.code }}</div>
              <span class="badge" [ngClass]="item.status">{{ item.status }}</span>
            </div>
            <h4>{{ item.name }}</h4>
            <p class="muted">{{ item.department }}</p>
            <div class="tile-bottom">
              <strong>{{ item.price }}</strong>
              <span class="muted">{{ item.stock }} in stock</span>
            </div>
          </button>
        </div>
      </article>

      <aside class="surface-panel terminal-panel checkout-panel">
        <div class="section-head">
          <div>
            <div class="eyebrow">Current sale</div>
            <h3>Checkout summary</h3>
          </div>
          <span class="badge badge-default">Dine-in</span>
        </div>

        <div class="checkout-card">
          <div class="checkout-row" *ngFor="let line of cart">
            <div>
              <strong>{{ line.name }}</strong>
              <p class="muted">{{ line.meta }}</p>
            </div>
            <div class="qty-pill">x{{ line.qty }}</div>
            <strong>{{ line.total }}</strong>
          </div>
        </div>

        <div class="totals-card">
          <div class="total-row">
            <span class="muted">Subtotal</span>
            <strong>PKR 4,820</strong>
          </div>
          <div class="total-row">
            <span class="muted">Discount</span>
            <strong>- PKR 220</strong>
          </div>
          <div class="total-row grand-total">
            <span>Total due</span>
            <strong>PKR 4,600</strong>
          </div>
        </div>

        <div class="payment-grid">
          <button type="button" class="secondary">Cash</button>
          <button type="button" class="secondary">Card</button>
          <button type="button" class="secondary">Wallet</button>
          <button type="button" class="primary">Charge Customer</button>
        </div>
      </aside>
    </section>
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

      .chip.active {
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

      .checkout-row {
        padding: 0.85rem;
        border-radius: var(--radius-md);
        background: var(--bg-panel-muted);
      }

      .checkout-row p {
        margin: 0.2rem 0 0;
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
      }
    `
  ]
})
export class PosComponent {
  readonly catalog = [
    { code: "FD-18", name: "Burger Combo", department: "Food Court", price: "PKR 1,840", stock: 14, status: "healthy" },
    { code: "FS-07", name: "Denim Jacket", department: "Fashion", price: "PKR 5,200", stock: 6, status: "low_stock" },
    { code: "EL-22", name: "Wireless Earbuds", department: "Electronics", price: "PKR 9,900", stock: 2, status: "out_of_stock" },
    { code: "AC-11", name: "Canvas Backpack", department: "Accessories", price: "PKR 3,250", stock: 11, status: "healthy" }
  ];

  readonly cart = [
    { name: "Burger Combo", meta: "Food Court · x1", qty: 1, total: "PKR 1,840" },
    { name: "Classic Denim Jacket", meta: "Fashion · x1", qty: 1, total: "PKR 2,980" }
  ];
}
