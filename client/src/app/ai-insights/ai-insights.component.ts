import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-ai-insights",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="AI Insights"
      subtitle="Surface trends, anomalies, and suggested actions from store data."
    />

    <section class="surface-panel metric-card"><p class="muted">AI insights will appear here.</p></section>
  `
})
export class AiInsightsComponent {}
