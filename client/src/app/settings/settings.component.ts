import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="System"
      title="Settings"
      subtitle="Adjust workspace preferences, branding, and operational defaults."
    />

    <section class="surface-panel metric-card"><p class="muted">Settings controls will appear here.</p></section>
  `
})
export class SettingsComponent {}
