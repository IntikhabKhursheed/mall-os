import { Component } from "@angular/core";

@Component({
  selector: "app-sales",
  standalone: true,
  template: `
    <section class="saas-card empty-state">
      <div class="empty-state-inner">
        <i class="pi pi-chart-bar"></i>
        <h3>No sales recorded yet</h3>
        <p>Sales will appear here once cashiers begin processing transactions across the mall.</p>
        <button class="btn-primary" type="button">Go to POS</button>
      </div>
    </section>
  `
})
export class SalesComponent {}
