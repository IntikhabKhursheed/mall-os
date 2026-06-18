import { Component } from "@angular/core";

@Component({
  selector: "app-cashier-dashboard",
  standalone: true,
  template: `
    <section class="surface-panel hero-surface metric-card">
      <div class="eyebrow">Checkout Operations</div>
      <h3>Cashier Dashboard</h3>
      <p class="muted">This area is ready for quick actions, queue status, and recent transactions.</p>
    </section>
  `
})
export class CashierDashboardComponent {}
