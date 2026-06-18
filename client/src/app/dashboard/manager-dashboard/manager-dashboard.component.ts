import { Component } from "@angular/core";

@Component({
  selector: "app-manager-dashboard",
  standalone: true,
  template: `
    <section class="surface-panel metric-card">
      <div class="muted">Manager Workspace</div>
      <h3>Manager Dashboard</h3>
      <p class="muted">Department performance, stock reviews, and team activity surface here.</p>
    </section>
  `
})
export class ManagerDashboardComponent {}
