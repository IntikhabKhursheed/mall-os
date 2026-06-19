import { CommonModule, NgFor } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { PageHeaderComponent } from "../../shared/page-header/page-header.component";

@Component({
  selector: "app-cashier-dashboard",
  standalone: true,
  imports: [CommonModule, NgFor, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Cashier workspace"
      title="Checkout overview"
      subtitle="Keep an eye on recent transactions, live totals, and quick product lookup."
    >
      <div actions>
        <button type="button" class="secondary" (click)="goToPos()">Open POS</button>
        <button type="button" class="primary" (click)="goToPos()">Start New Sale</button>
      </div>
    </app-page-header>

    <section class="page-grid">
      <section class="stats-row">
        <article class="surface-panel stat-card" *ngFor="let stat of stats">
          <div class="metric-icon" [ngClass]="stat.iconTone"><i [class]="stat.icon"></i></div>
          <div class="eyebrow">{{ stat.label }}</div>
          <div class="metric-value compact">{{ stat.value }}</div>
          <p class="muted">{{ stat.detail }}</p>
        </article>
      </section>

      <section class="content-split">
        <article class="surface-panel transactions-card">
          <div class="section-head">
            <div>
              <div class="eyebrow">Recent transactions</div>
              <h3>My latest processed sales</h3>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Order ID</th>
                <th>Department</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let transaction of transactions">
                <td>{{ transaction.time }}</td>
                <td>{{ transaction.orderId }}</td>
                <td><span class="badge badge-default">{{ transaction.department }}</span></td>
                <td>{{ transaction.amount }}</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article class="surface-panel search-card">
          <div class="section-head">
            <div>
              <div class="eyebrow">Quick product search</div>
              <h3>Fast lookup</h3>
            </div>
          </div>

          <div class="search-shell">
            <i class="pi pi-search"></i>
            <span>Search by product name or barcode</span>
          </div>

          <div class="search-results">
            <div class="result-row" *ngFor="let item of quickProducts">
              <div>
                <strong>{{ item.name }}</strong>
                <p class="muted">{{ item.barcode }}</p>
              </div>
              <span class="badge" [ngClass]="item.status">{{ item.status }}</span>
            </div>
          </div>
        </article>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1.1rem;
      }

      .page-grid,
      .stats-row,
      .content-split,
      .search-results {
        display: grid;
        gap: 0.95rem;
      }

      .start-sale {
        min-height: 60px;
        font-size: 1.05rem;
      }

      .stats-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .stat-card,
      .transactions-card,
      .search-card {
        padding: 1.15rem;
      }

      .stat-card {
        display: grid;
        gap: 0.55rem;
        align-content: start;
      }

      .metric-icon {
        width: 2.6rem;
        height: 2.6rem;
        border-radius: 14px;
        display: grid;
        place-items: center;
        box-shadow: var(--shadow-sm);
      }

      .metric-icon.accent {
        background: rgba(20, 184, 166, 0.14);
        color: var(--accent);
      }

      .metric-icon.info {
        background: rgba(59, 130, 246, 0.14);
        color: #2563eb;
      }

      .metric-icon.success {
        background: rgba(34, 197, 94, 0.14);
        color: #16a34a;
      }

      .content-split {
        grid-template-columns: 1.2fr 0.95fr;
      }

      .search-shell {
        min-height: 44px;
        padding: 0.8rem 0.95rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: var(--bg-panel-muted);
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        color: var(--text-secondary);
      }

      .result-row {
        display: flex;
        justify-content: space-between;
        gap: 0.85rem;
        align-items: center;
        padding: 0.9rem;
        border-radius: var(--radius-md);
        background: var(--bg-panel-muted);
      }

      .result-row p {
        margin: 0.25rem 0 0;
      }

      @media (max-width: 980px) {
        .stats-row,
        .content-split {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class CashierDashboardComponent {
  private readonly router = inject(Router);

  readonly stats = [
    { label: "My Transactions Today", value: "126", detail: "Processed across current shift.", icon: "pi pi-receipt", iconTone: "accent" },
    { label: "Total Amount Processed", value: "PKR 412,000", detail: "Running cashier total.", icon: "pi pi-wallet", iconTone: "info" },
    { label: "Average Transaction Value", value: "PKR 3,270", detail: "Healthy basket size.", icon: "pi pi-chart-line", iconTone: "success" }
  ];

  readonly transactions = [
    { time: "09:12", orderId: "GC-1021", department: "Fashion", amount: "PKR 5,200" },
    { time: "09:25", orderId: "GC-1028", department: "Food Court", amount: "PKR 1,840" },
    { time: "10:02", orderId: "GC-1039", department: "Electronics", amount: "PKR 9,900" },
    { time: "10:24", orderId: "GC-1044", department: "Beauty", amount: "PKR 3,250" },
    { time: "10:48", orderId: "GC-1051", department: "Sports", amount: "PKR 6,100" }
  ];

  readonly quickProducts = [
    { name: "Classic Denim Jacket", barcode: "880112341", status: "healthy" },
    { name: "Burger Combo", barcode: "552188412", status: "low_stock" },
    { name: "Wireless Earbuds", barcode: "771245190", status: "out_of_stock" }
  ];

  goToPos(): void {
    void this.router.navigateByUrl("/pos");
  }
}
