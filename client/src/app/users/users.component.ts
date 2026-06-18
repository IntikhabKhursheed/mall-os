import { Component } from "@angular/core";

@Component({
  selector: "app-users",
  standalone: true,
  template: `
    <section class="saas-card empty-state">
      <div class="empty-state-inner">
        <i class="pi pi-id-card"></i>
        <h3>No additional user accounts yet</h3>
        <p>System-level user administration will appear here when advanced access controls are enabled.</p>
        <button class="btn-primary" type="button">Review employees</button>
      </div>
    </section>
  `
})
export class UsersComponent {}
