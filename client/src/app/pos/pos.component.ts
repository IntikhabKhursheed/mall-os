import { Component } from "@angular/core";

@Component({
  selector: "app-pos",
  standalone: true,
  template: `
    <section class="saas-card empty-state">
      <div class="empty-state-inner">
        <i class="pi pi-shopping-cart"></i>
        <h3>POS workspace coming next</h3>
        <p>Cashier transaction tools, barcode scanning, and checkout flows will be available here.</p>
        <button class="btn-primary" type="button">Start transaction setup</button>
      </div>
    </section>
  `
})
export class PosComponent {}
