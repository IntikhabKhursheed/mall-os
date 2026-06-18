import { Component } from "@angular/core";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  template: `
    <section class="grid-cards">
      <article class="surface-panel metric-card">
        <div class="muted">Today's Revenue</div>
        <h3>$0</h3>
        <p class="muted">Awaiting live transaction totals.</p>
      </article>
      <article class="surface-panel metric-card">
        <div class="muted">Total Sales</div>
        <h3>0</h3>
        <p class="muted">Sales data will appear here once synced.</p>
      </article>
      <article class="surface-panel metric-card">
        <div class="muted">Low Stock Alerts</div>
        <h3>0</h3>
        <p class="muted">Restock signals stay visible for operations.</p>
      </article>
      <article class="surface-panel metric-card">
        <div class="muted">Active Employees</div>
        <h3>0</h3>
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
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AdminDashboardComponent {}
