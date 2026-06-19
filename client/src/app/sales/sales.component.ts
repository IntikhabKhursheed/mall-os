import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-sales",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="Sales performance"
      subtitle="Track sales trends, revenue breakdowns, and conversion movement across the mall."
    />

    <section class="surface-panel metric-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">Overview</div>
          <h3>Performance snapshot</h3>
        </div>
      </div>
      <p class="muted">Performance analytics will render here.</p>
    </section>
  `
})
export class SalesComponent {}
