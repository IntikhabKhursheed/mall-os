import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="Reports"
      subtitle="Review operational reports, performance summaries, and management exports."
    />

    <section class="surface-panel metric-card"><p class="muted">Reports content will appear here.</p></section>
  `
})
export class ReportsComponent {}
