import { Component } from "@angular/core";

@Component({
  selector: "app-cashier-dashboard",
  standalone: true,
  template: `
    <section class="section-grid two-col">
      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Shift overview</h3>
            <p>Monitor current shift totals, transaction count, and checkout readiness.</p>
          </div>
        </div>
        <div class="empty-state compact-state">
          <div class="empty-state-inner">
            <i class="pi pi-wallet"></i>
            <h3>No shift data yet</h3>
            <p>Cashier shift metrics will appear here once the POS flow is active.</p>
          </div>
        </div>
      </article>

      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Quick actions</h3>
            <p>Access drawer open, barcode scan, and pending refund shortcuts.</p>
          </div>
        </div>
        <div class="empty-state compact-state">
          <div class="empty-state-inner">
            <i class="pi pi-bolt"></i>
            <h3>POS shortcuts coming next</h3>
            <p>Cashier tools will be added here when transaction operations are enabled.</p>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .compact-state {
        min-height: 240px;
      }
    `
  ]
})
export class CashierDashboardComponent {}
