import { Component } from "@angular/core";

@Component({
  selector: "app-reports",
  standalone: true,
  template: `
    <section class="saas-card empty-state">
      <div class="empty-state-inner">
        <i class="pi pi-chart-line"></i>
        <h3>No reports generated yet</h3>
        <p>Scheduled and exportable reports will appear here once reporting jobs are configured.</p>
        <button class="btn-primary" type="button">Configure reports</button>
      </div>
    </section>
  `
})
export class ReportsComponent {}
