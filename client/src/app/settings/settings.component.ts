import { Component } from "@angular/core";

@Component({
  selector: "app-settings",
  standalone: true,
  template: `
    <section class="saas-card empty-state">
      <div class="empty-state-inner">
        <i class="pi pi-cog"></i>
        <h3>Settings are not configured yet</h3>
        <p>Business preferences, receipt templates, tax rules, and notification settings will live here.</p>
        <button class="btn-primary" type="button">Open configuration plan</button>
      </div>
    </section>
  `
})
export class SettingsComponent {}
