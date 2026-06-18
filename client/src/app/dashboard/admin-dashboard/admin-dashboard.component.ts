import { Component } from "@angular/core";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  template: `
    <section class="surface-panel hero-surface hero">
      <div>
        <div class="eyebrow">Operations Overview</div>
        <h2>Welcome back to MallOS</h2>
        <p class="muted">Track sales, staffing, and stock movement from one workspace.</p>
      </div>

      <div class="hero-actions">
        <div class="hero-pill">
          <i class="pi pi-search"></i>
          <span>Search records</span>
        </div>
        <div class="hero-pill">
          <i class="pi pi-sparkles"></i>
          <span>Insights ready</span>
        </div>
      </div>
    </section>

    <section class="grid-cards">
      <article class="surface-panel metric-card">
        <div class="eyebrow">Today's Revenue</div>
        <h3 class="metric-value">$0</h3>
        <p class="muted">Awaiting live transaction totals.</p>
      </article>
      <article class="surface-panel metric-card">
        <div class="eyebrow">Total Sales</div>
        <h3 class="metric-value">0</h3>
        <p class="muted">Sales data will appear here once synced.</p>
      </article>
      <article class="surface-panel metric-card">
        <div class="eyebrow">Low Stock Alerts</div>
        <h3 class="metric-value">0</h3>
        <p class="muted">Restock signals stay visible for operations.</p>
      </article>
      <article class="surface-panel metric-card">
        <div class="eyebrow">Active Employees</div>
        <h3 class="metric-value">0</h3>
        <p class="muted">Staff activity updates as records are added.</p>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="surface-panel canvas-card">
        <div class="section-head">
          <div>
            <h3>Performance Snapshot</h3>
            <p class="muted">Charts can plug into this panel without layout changes.</p>
          </div>
        </div>
        <div class="empty-state">No chart data available yet.</div>
      </article>

      <article class="surface-panel canvas-card">
        <div class="section-head">
          <div>
            <h3>Recent Activity</h3>
            <p class="muted">Latest employee, product, and sales updates.</p>
          </div>
        </div>
        <div class="empty-state">No recent activity to display.</div>
      </article>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
      }

      .hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }

      .hero h2,
      .hero p {
        margin: 0;
      }

      .hero p {
        margin-top: 0.45rem;
        max-width: 42rem;
      }

      .hero-actions {
        display: inline-flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .hero-pill {
        min-height: 42px;
        padding: 0.75rem 1rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: color-mix(in srgb, var(--bg-panel) 88%, transparent);
        box-shadow: var(--shadow-sm);
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        color: var(--text-secondary);
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 1.25fr 0.95fr;
        gap: 1rem;
      }

      .canvas-card {
        padding: 1.25rem;
        min-height: 280px;
        display: grid;
        gap: 1rem;
      }

      .section-head h3,
      .section-head p {
        margin: 0;
      }

      .section-head p {
        margin-top: 0.35rem;
      }

      @media (max-width: 900px) {
        .hero {
          flex-direction: column;
        }

        .dashboard-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AdminDashboardComponent {}
