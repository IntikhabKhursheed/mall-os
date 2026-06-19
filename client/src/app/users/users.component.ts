import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="System"
      title="Access control"
      subtitle="Manage system access and keep administrative accounts organized."
    />

    <section class="surface-panel metric-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">Summary</div>
          <h3>Account permissions</h3>
        </div>
      </div>
      <p class="muted">Account administration will appear here.</p>
    </section>
  `
})
export class UsersComponent {}
