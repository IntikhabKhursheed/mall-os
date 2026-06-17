import { Component } from "@angular/core";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  template: `
    <section class="grid-cards">
      <article class="surface-panel metric-card">
        <div class="muted">Today's Revenue</div>
        <h3>--</h3>
      </article>
      <article class="surface-panel metric-card">
        <div class="muted">Total Sales</div>
        <h3>--</h3>
      </article>
      <article class="surface-panel metric-card">
        <div class="muted">Low Stock Alerts</div>
        <h3>--</h3>
      </article>
      <article class="surface-panel metric-card">
        <div class="muted">Active Employees</div>
        <h3>--</h3>
      </article>
    </section>
  `
})
export class AdminDashboardComponent {}
