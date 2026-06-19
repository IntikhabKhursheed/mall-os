import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-ai-insights",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="Predictive insights"
      subtitle="Surface trends, anomalies, and suggested actions from store data."
    />

    <section class="surface-panel metric-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">Insights</div>
          <h3>Model recommendations</h3>
        </div>
      </div>
      <p class="muted">Predictive model output will appear here.</p>
    </section>
  `
})
export class AiInsightsComponent {}
