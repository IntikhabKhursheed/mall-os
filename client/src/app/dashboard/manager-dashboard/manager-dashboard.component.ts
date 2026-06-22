import { CommonModule, NgFor } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { PageHeaderComponent } from "../../shared/page-header/page-header.component";

@Component({
  selector: "app-manager-dashboard",
  standalone: true,
  imports: [CommonModule, NgFor, RouterLink, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Manager workspace"
      title="Department overview"
      subtitle="Track sales, shift activity, and inventory health from one place."
    >
      <div actions>
        <button type="button" class="secondary" routerLink="/products">Products</button>
        <button type="button" class="secondary" routerLink="/sales">Sales</button>
        <button type="button" class="primary" routerLink="/employees">Employees</button>
      </div>
    </app-page-header>

    <section class="page-grid">
      <section class="kpi-row">
        <article class="surface-panel kpi-card" *ngFor="let metric of metrics">
          <div class="metric-icon" [ngClass]="metric.iconTone"><i [class]="metric.icon"></i></div>
          <div class="eyebrow">{{ metric.label }}</div>
          <div class="metric-value compact">{{ metric.value }}</div>
          <p class="muted">{{ metric.detail }}</p>
        </article>
      </section>

      <section class="content-split">
        <article class="surface-panel chart-card">
          <div class="section-head">
            <div>
              <div class="eyebrow">Sales last 7 days</div>
              <h3>Department sales trend</h3>
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-bar" *ngFor="let height of bars" [style.height.%]="height"></div>
          </div>
        </article>

        <article class="surface-panel team-card">
          <div class="section-head">
            <div>
              <div class="eyebrow">Team panel</div>
              <h3>Shift coverage</h3>
            </div>
            <button type="button" class="secondary" routerLink="/employees">Review</button>
          </div>

          <div class="team-list">
            <div class="team-row" *ngFor="let member of team">
              <div class="avatar">{{ member.initials }}</div>
              <div class="team-copy">
                <strong>{{ member.name }}</strong>
                <p class="muted">{{ member.role }}</p>
              </div>
              <span class="badge" [class.active]="member.onShift" [class.inactive]="!member.onShift">
                {{ member.onShift ? "On Shift" : "Off Shift" }}
              </span>
            </div>
          </div>
        </article>
      </section>

      <article class="surface-panel stock-card">
        <div class="section-head">
          <div>
            <div class="eyebrow">Low stock panel</div>
            <h3>Products below reorder level</h3>
          </div>
        </div>

        <div class="stock-list">
          <div class="stock-row" *ngFor="let item of lowStock">
            <div>
              <strong>{{ item.name }}</strong>
              <p class="muted">Stock {{ item.stock }} / Reorder {{ item.reorder }}</p>
            </div>
            <button type="button" class="secondary" routerLink="/products">Review</button>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1.1rem;
      }

      .page-grid,
      .kpi-row,
      .content-split,
      .team-list,
      .stock-list {
        display: grid;
        gap: 0.95rem;
      }

      .welcome-card,
      .kpi-card,
      .chart-card,
      .team-card,
      .stock-card {
        padding: 1.15rem;
      }

      .kpi-card {
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

      .kpi-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .content-split {
        grid-template-columns: 1.2fr 0.95fr;
      }

      .chart-placeholder {
        min-height: 170px;
        border-radius: var(--radius-lg);
        background: linear-gradient(180deg, var(--bg-panel-muted), transparent);
        display: flex;
        align-items: end;
        gap: 0.55rem;
        padding: 0.85rem;
      }

      .chart-bar {
        flex: 1;
        border-radius: 999px 999px 8px 8px;
        background: linear-gradient(180deg, rgba(20, 184, 166, 0.45), rgba(20, 184, 166, 0.92));
      }

      .team-row,
      .stock-row {
        display: flex;
        justify-content: space-between;
        gap: 0.85rem;
        align-items: center;
        padding: 0.85rem;
        border-radius: var(--radius-md);
        background: var(--bg-panel-muted);
      }

      .avatar {
        width: 2.3rem;
        height: 2.3rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #14b8a6, #8b5cf6);
        color: #ffffff;
        display: grid;
        place-items: center;
        font-weight: 800;
      }

      .team-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
      }

      .team-copy p,
      .stock-row p {
        margin: 0.25rem 0 0;
      }

      @media (max-width: 980px) {
        .kpi-row,
        .content-split {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class ManagerDashboardComponent {
  readonly metrics = [
    { label: "Department Revenue Today", value: "PKR 86,400", detail: "Strong afternoon sell-through.", icon: "pi pi-wallet", iconTone: "accent" },
    { label: "Items Sold", value: "214", detail: "Across apparel and accessories.", icon: "pi pi-shopping-bag", iconTone: "info" },
    { label: "Stock Health", value: "92%", detail: "Healthy product availability.", icon: "pi pi-check-circle", iconTone: "success" }
  ];

  readonly bars = [48, 62, 58, 74, 69, 82, 77];

  readonly team = [
    { initials: "MK", name: "Mariam Khan", role: "Senior Associate", onShift: true },
    { initials: "UA", name: "Usman Ali", role: "Cashier", onShift: true },
    { initials: "HA", name: "Hira Ahmed", role: "Store Support", onShift: false }
  ];

  readonly lowStock = [
    { name: "Classic Denim Jacket", stock: 5, reorder: 12 },
    { name: "Running Shorts", stock: 7, reorder: 15 },
    { name: "Backpack", stock: 4, reorder: 10 }
  ];
}
