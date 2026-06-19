import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="Management reports"
      subtitle="Review operational reports, performance summaries, and management exports."
    />

    <section class="surface-panel metric-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">Summary</div>
          <h3>Operational exports</h3>
        </div>
      </div>
      <p class="muted">Operational exports will appear here.</p>
    </section>
  `
})
export class ReportsComponent {}
