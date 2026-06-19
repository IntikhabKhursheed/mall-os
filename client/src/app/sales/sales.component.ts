import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-sales",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="Sales"
      subtitle="Track sales trends, revenue breakdowns, and conversion movement across the mall."
    />

    <section class="surface-panel metric-card"><p class="muted">Sales analytics will render here.</p></section>
  `
})
export class SalesComponent {}
