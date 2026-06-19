import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="System"
      title="Workspace settings"
      subtitle="Adjust workspace preferences, branding, and operational defaults."
    />

    <section class="surface-panel metric-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">Overview</div>
          <h3>Configuration options</h3>
        </div>
      </div>
      <p class="muted">Configuration controls will appear here.</p>
    </section>
  `
})
export class SettingsComponent {}
