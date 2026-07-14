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
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
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
