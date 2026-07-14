import { CommonModule, NgFor } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { PageHeaderComponent } from "../../shared/page-header/page-header.component";

@Component({
  selector: "app-cashier-dashboard",
  standalone: true,
  imports: [CommonModule, NgFor, PageHeaderComponent],
  templateUrl: './cashier-dashboard.component.html',
  styleUrl: './cashier-dashboard.component.scss'
})
export class CashierDashboardComponent {
  private readonly router = inject(Router);

  readonly stats = [
    { label: "My Transactions Today", value: "126", detail: "Processed across current shift.", icon: "pi pi-receipt", iconTone: "accent" },
    { label: "Total Amount Processed", value: "PKR 412,000", detail: "Running cashier total.", icon: "pi pi-wallet", iconTone: "info" },
    { label: "Average Transaction Value", value: "PKR 3,270", detail: "Healthy basket size.", icon: "pi pi-chart-line", iconTone: "success" }
  ];

  readonly transactions = [
    { time: "09:12", orderId: "GC-1021", department: "Fashion", amount: "PKR 5,200" },
    { time: "09:25", orderId: "GC-1028", department: "Food Court", amount: "PKR 1,840" },
    { time: "10:02", orderId: "GC-1039", department: "Electronics", amount: "PKR 9,900" },
    { time: "10:24", orderId: "GC-1044", department: "Beauty", amount: "PKR 3,250" },
    { time: "10:48", orderId: "GC-1051", department: "Sports", amount: "PKR 6,100" }
  ];

  readonly quickProducts = [
    { name: "Classic Denim Jacket", barcode: "880112341", status: "healthy" },
    { name: "Burger Combo", barcode: "552188412", status: "low_stock" },
    { name: "Wireless Earbuds", barcode: "771245190", status: "out_of_stock" }
  ];

  goToPos(): void {
    void this.router.navigateByUrl("/pos");
  }
}
