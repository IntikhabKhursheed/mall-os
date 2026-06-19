import { Component } from "@angular/core";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="System"
      title="Users"
      subtitle="Manage system access and keep administrative accounts organized."
    />

    <section class="surface-panel metric-card"><p class="muted">User administration will appear here.</p></section>
  `
})
export class UsersComponent {}
