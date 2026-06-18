import { Component } from "@angular/core";

@Component({
  selector: "app-manager-dashboard",
  standalone: true,
  template: `
    <section class="section-grid two-col">
      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Department performance</h3>
            <p>Track staff coverage, stock risk, and daily revenue across managed departments.</p>
          </div>
        </div>
        <div class="empty-state compact-state">
          <div class="empty-state-inner">
            <i class="pi pi-briefcase"></i>
            <h3>Manager analytics coming next</h3>
            <p>We will surface department-level operations and staffing insights here.</p>
          </div>
        </div>
      </article>

      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Action queue</h3>
            <p>Review pending approvals, low stock escalations, and staffing gaps.</p>
          </div>
        </div>
        <div class="empty-state compact-state">
          <div class="empty-state-inner">
            <i class="pi pi-list-check"></i>
            <h3>No pending actions</h3>
            <p>Manager task workflows will appear here once automation rules are connected.</p>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .compact-state {
        min-height: 240px;
      }
    `
  ]
})
export class ManagerDashboardComponent {}
