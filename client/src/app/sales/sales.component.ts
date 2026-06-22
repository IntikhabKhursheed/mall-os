import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { MallDataService, SaleRecord } from "../core/services/mall-data.service";

@Component({
  selector: "app-sales",
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, RouterLink, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="Sales performance"
      subtitle="Track sales trends, revenue breakdowns, and conversion movement across the mall."
    >
      <div actions>
        <button type="button" class="secondary" (click)="refreshSales()">Refresh</button>
        <button type="button" class="primary" routerLink="/pos">Open POS</button>
      </div>
    </app-page-header>

    <section class="toolbar surface-panel">
      <input [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()" type="search" placeholder="Search order ID, cashier, department, or payment" />
      <select [(ngModel)]="paymentFilter" (ngModelChange)="applyFilter()">
        <option value="">All payment methods</option>
        <option value="cash">Cash</option>
        <option value="card">Card</option>
        <option value="wallet">Wallet</option>
      </select>
    </section>

    <section class="sales-grid">
      <article class="surface-panel metric-card">
        <div class="eyebrow">Revenue</div>
        <div class="metric-value">{{ revenue | currency : "USD" : "symbol" : "1.0-0" }}</div>
        <p class="muted">Completed sales in the current mock session.</p>
      </article>

      <article class="surface-panel metric-card">
        <div class="eyebrow">Transactions</div>
        <div class="metric-value">{{ filteredSales.length }}</div>
        <p class="muted">Filtered records based on your search.</p>
      </article>

      <article class="surface-panel metric-card">
        <div class="eyebrow">Average ticket</div>
        <div class="metric-value">{{ averageTicket | currency : "USD" : "symbol" : "1.0-0" }}</div>
        <p class="muted">Useful for comparing basket size across departments.</p>
      </article>
    </section>

    <section class="surface-panel table-card">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Order</th>
            <th>Cashier</th>
            <th>Department</th>
            <th>Payment</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let sale of filteredSales">
            <td>{{ sale.time }}</td>
            <td>{{ sale.orderId }}</td>
            <td>{{ sale.cashier }}</td>
            <td><span class="badge badge-default">{{ sale.department }}</span></td>
            <td><span class="badge" [ngClass]="sale.paymentMethod === 'cash' ? 'active' : sale.paymentMethod === 'card' ? 'info' : 'low_stock'">{{ sale.paymentMethod }}</span></td>
            <td>{{ sale.total | currency : "USD" : "symbol" : "1.0-0" }}</td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="filteredSales.length === 0" class="empty-state">No sales match the current filter.</div>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
      }

      .toolbar {
        display: grid;
        grid-template-columns: 1fr 220px;
        gap: 0.75rem;
        padding: 1rem;
      }

      .sales-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }

      .metric-card,
      .table-card {
        padding: 1rem;
      }

      .table-card {
        display: grid;
        gap: 1rem;
      }

      @media (max-width: 980px) {
        .toolbar,
        .sales-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class SalesComponent implements OnInit {
  private readonly mallData = inject(MallDataService);

  sales: SaleRecord[] = [];
  filteredSales: SaleRecord[] = [];
  searchTerm = "";
  paymentFilter = "";

  ngOnInit(): void {
    this.refreshSales();
  }

  get revenue(): number {
    return this.filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  }

  get averageTicket(): number {
    return this.filteredSales.length ? Math.round(this.revenue / this.filteredSales.length) : 0;
  }

  refreshSales(): void {
    this.mallData.getRecentSales().subscribe((items) => {
      this.sales = items;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const query = this.searchTerm.trim().toLowerCase();
    this.filteredSales = this.sales.filter((sale) => {
      const matchesQuery =
        !query ||
        sale.orderId.toLowerCase().includes(query) ||
        sale.cashier.toLowerCase().includes(query) ||
        sale.department.toLowerCase().includes(query) ||
        sale.paymentMethod.toLowerCase().includes(query);
      const matchesPayment = !this.paymentFilter || sale.paymentMethod === this.paymentFilter;
      return matchesQuery && matchesPayment;
    });
  }
}
