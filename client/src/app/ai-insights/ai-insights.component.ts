import { Component } from "@angular/core";

@Component({
  selector: "app-ai-insights",
  standalone: true,
  template: `
    <section class="saas-card empty-state">
      <div class="empty-state-inner">
        <i class="pi pi-sparkles"></i>
        <h3>No AI insights yet</h3>
        <p>MallOS will surface forecasting, product, and staffing insights here once enough activity data is available.</p>
        <button class="btn-primary" type="button">View dashboard data</button>
      </div>
    </section>
  `
})
export class AiInsightsComponent {}
