import { CommonModule, NgFor } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { PageHeaderComponent } from "../../shared/page-header/page-header.component";
import { AuthService } from "../../core/services/auth.service";
import { DashboardSummary, MallDataService } from "../../core/services/mall-data.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, NgFor, RouterLink, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Admin dashboard"
      [title]="greetingTitle"
      subtitle="Monitor revenue, inventory, and frontline activity from one place."
    >
      <div actions class="header-tools">
        <div class="search-shell">
          <i class="pi pi-search"></i>
          <span>Search mall data...</span>
          <kbd>Ctrl+K</kbd>
        </div>
        <button type="button" class="secondary" routerLink="/pos">Open POS</button>
        <button type="button" class="secondary" routerLink="/products">Products</button>
        <button type="button" class="primary" routerLink="/reports">Reports</button>
      </div>
    </app-page-header>

    <section class="hero-insight surface-panel hero-surface">
      <div class="hero-copy">
        <div class="eyebrow">Today at a glance</div>
        <p class="muted hero-intro">Priority signals, revenue momentum, and frontline activity are all visible from this workspace.</p>
      </div>

      <article class="hero-metric">
        <div class="eyebrow">Primary KPI</div>
        <div class="metric-value">{{ summary.revenueToday | currency : "USD" : "symbol" : "1.0-0" }}</div>
        <p class="muted">Projected revenue across active departments</p>
      </article>

      <aside class="quick-actions">
        <div class="eyebrow">Quick actions</div>
        <button type="button" class="quick-pill" routerLink="/pos"><i class="pi pi-shopping-cart"></i><span>Open POS shortcut</span></button>
        <button type="button" class="quick-pill" routerLink="/employees"><i class="pi pi-users"></i><span>Review employees</span></button>
        <button type="button" class="quick-pill" routerLink="/products"><i class="pi pi-bolt"></i><span>Review stock</span></button>
      </aside>
    </section>

    <section class="kpi-focus">
      <article class="surface-panel support-card primary-support">
        <div class="metric-icon accent"><i class="pi pi-exclamation-triangle"></i></div>
        <div class="eyebrow">Low stock risk</div>
        <h3 class="metric-value">{{ summary.lowStockCount }}</h3>
        <p class="muted">Products approaching reorder level today.</p>
      </article>

      <article class="surface-panel support-card">
        <div class="metric-icon info"><i class="pi pi-users"></i></div>
        <div class="eyebrow">Active employees</div>
        <h3 class="metric-value">{{ summary.activeEmployees }}</h3>
        <p class="muted">Coverage is balanced across current shifts.</p>
      </article>

      <article class="surface-panel insight-card">
        <div class="metric-icon success"><i class="pi pi-trending-up"></i></div>
        <div class="eyebrow">Stock health</div>
        <h3>{{ summary.stockHealth }}%</h3>
        <p class="muted">{{ summary.alerts }} combined alerts are currently active.</p>
      </article>
    </section>

    <section class="activity-stream surface-panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Live activity</div>
          <h3>Recent operational events</h3>
        </div>
      </div>

      <div class="stream-list">
        <article class="stream-item" *ngFor="let item of activityFeed">
          <div class="stream-icon"><i [class]="item.icon"></i></div>
          <div class="stream-body">
            <strong>{{ item.title }}</strong>
            <p class="muted">{{ item.detail }}</p>
          </div>
          <span class="stream-time">{{ item.time }}</span>
        </article>
      </div>
    </section>

    <section class="analytics-split">
      <article class="surface-panel analytics-card">
        <div class="section-head">
          <div>
            <div class="eyebrow">Analytics</div>
            <h3>Performance snapshot</h3>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-bar" *ngFor="let height of chartBars" [style.height.%]="height"></div>
        </div>
      </article>

      <article class="surface-panel analytics-card">
        <div class="section-head">
          <div>
            <div class="eyebrow">Operational health</div>
            <h3>Department signals</h3>
          </div>
        </div>

        <div class="signal-list">
          <div class="signal-row" *ngFor="let signal of departmentSignals">
            <div>
              <strong>{{ signal.label }}</strong>
              <p class="muted">{{ signal.detail }}</p>
            </div>
            <span class="badge" [ngClass]="signal.status">{{ signal.status }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="record-section">
      <div class="section-head">
        <div>
          <div class="eyebrow">Records</div>
          <h3>Recent sales summaries</h3>
        </div>
      </div>

      <div class="record-grid">
        <article class="surface-panel record-card" *ngFor="let record of salesCards">
          <div class="record-avatar">{{ record.initials }}</div>
          <div class="record-copy">
            <strong>{{ record.title }}</strong>
            <p class="muted">{{ record.meta }}</p>
          </div>
          <button type="button" class="secondary record-action" routerLink="/sales">View</button>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1.1rem;
      }

      .header-tools {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .search-shell {
        min-height: 44px;
        padding: 0 1rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: var(--bg-panel);
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        color: var(--text-secondary);
        box-shadow: var(--shadow-xs);
      }

      .search-shell kbd {
        margin-left: auto;
        padding: 0.18rem 0.45rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--bg-panel-muted);
        color: var(--muted);
        font-size: 0.75rem;
      }

      .hero-insight {
        display: grid;
        grid-template-columns: 1.35fr 0.95fr 0.85fr;
        gap: 1.25rem;
        align-items: stretch;
      }

      .hero-copy p,
      .section-head h3,
      .section-head p {
        margin: 0;
      }

      .hero-copy p,
      .section-head p {
        margin-top: 0.45rem;
      }

      .hero-intro {
        font-size: 1rem;
        max-width: 52ch;
      }

      .hero-metric,
      .quick-actions,
      .activity-stream,
      .analytics-card,
      .record-card {
        padding: 1.5rem;
      }

      .hero-metric,
      .quick-actions {
        border-radius: var(--radius-lg);
        background: color-mix(in srgb, var(--bg-panel) 90%, transparent);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-md);
      }

      .quick-actions {
        display: grid;
        gap: 0.85rem;
        align-content: start;
      }

      .quick-pill {
        min-height: 44px;
        padding: 0.8rem 0.95rem;
        border-radius: 14px;
        background: var(--bg-panel);
        border: 1px solid var(--border);
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        color: var(--text-secondary);
      }

      .kpi-focus {
        display: grid;
        grid-template-columns: 1.2fr 1fr 0.9fr;
        gap: 1.25rem;
      }

      .support-card,
      .insight-card {
        padding: 1.35rem;
        min-height: 168px;
        display: grid;
        gap: 0.65rem;
        align-content: start;
      }

      .metric-icon {
        width: 2.8rem;
        height: 2.8rem;
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

      .primary-support {
        background:
          radial-gradient(circle at top right, rgba(20, 184, 166, 0.1), transparent 30%),
          linear-gradient(180deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel-muted) 60%, transparent));
      }

      .activity-stream {
        display: grid;
        gap: 1rem;
      }

      .stream-list {
        display: grid;
        gap: 1rem;
      }

      .stream-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.85rem;
        align-items: start;
        padding: 0.95rem 0;
        border-top: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
      }

      .stream-item:first-child {
        border-top: 0;
        padding-top: 0;
      }

      .stream-icon,
      .record-avatar {
        width: 2.4rem;
        height: 2.4rem;
        border-radius: 12px;
        background: rgba(20, 184, 166, 0.12);
        color: var(--accent);
        display: grid;
        place-items: center;
        font-weight: 700;
      }

      .stream-body p {
        margin: 0.25rem 0 0;
      }

      .stream-time {
        color: var(--muted);
        font-size: 0.8rem;
      }

      .analytics-split {
        display: grid;
        grid-template-columns: 1.2fr 0.95fr;
        gap: 1.25rem;
      }

      .analytics-card {
        display: grid;
        gap: 1rem;
        min-height: 260px;
      }

      .chart-placeholder {
        min-height: 200px;
        border-radius: var(--radius-lg);
        background: linear-gradient(180deg, var(--bg-panel-muted), transparent);
        display: flex;
        align-items: end;
        gap: 0.65rem;
        padding: 1rem;
      }

      .chart-bar {
        flex: 1;
        border-radius: 999px 999px 10px 10px;
        background: linear-gradient(180deg, rgba(20, 184, 166, 0.48), rgba(20, 184, 166, 0.95));
      }

      .signal-list {
        display: grid;
        gap: 1rem;
      }

      .signal-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
        padding: 0.95rem;
        border-radius: var(--radius-md);
        background: var(--bg-panel-muted);
      }

      .signal-row p {
        margin: 0.25rem 0 0;
      }

      .record-section {
        display: grid;
        gap: 1rem;
      }

      .record-grid {
        display: grid;
        gap: 1rem;
      }

      .record-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.85rem;
        align-items: center;
      }

      .record-copy p {
        margin: 0.25rem 0 0;
      }

      @media (max-width: 1100px) {
        .hero-insight,
        .kpi-focus,
        .analytics-split {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AdminDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly mallData = inject(MallDataService);

  readonly greetingTitle = `Good morning, ${this.authService.getCurrentUser()?.name ?? "team"}`;
  summary: DashboardSummary = { revenueToday: 0, salesToday: 0, lowStockCount: 0, activeEmployees: 0, stockHealth: 0, alerts: 0 };

  activityFeed: Array<{ icon: string; title: string; detail: string; time: string }> = [];
  chartBars = [38, 64, 54, 72, 58, 83, 62];
  departmentSignals: Array<{ label: string; detail: string; status: NonNullable<"healthy" | "low_stock" | "out_of_stock"> }> = [];
  salesCards: Array<{ initials: string; title: string; meta: string }> = [];

  ngOnInit(): void {
    this.mallData.getSummary().subscribe((summary) => (this.summary = summary));
    this.mallData.getActivityFeed().subscribe((feed) => (this.activityFeed = feed));
    this.mallData.getDepartmentSignals().subscribe((signals) => (this.departmentSignals = signals));
    this.mallData.getRecentSales().subscribe((sales) => {
      this.salesCards = sales.slice(0, 3).map((sale) => ({
        initials: sale.department.slice(0, 2).toUpperCase(),
        title: `${sale.department} Batch`,
        meta: `${sale.itemCount} items · ${sale.paymentMethod} · ${sale.total.toLocaleString("en-US", { style: "currency", currency: "USD" })}`
      }));
    });
  }
}
