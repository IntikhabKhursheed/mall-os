import { CommonModule, NgFor } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { EmployeeService } from "../../core/services/employee.service";
import { MallDataService } from "../../core/services/mall-data.service";
import { ProductService } from "../../core/services/product.service";
import { PageHeaderComponent } from "../../shared/page-header/page-header.component";

@Component({
  selector: "app-manager-dashboard",
  standalone: true,
  imports: [CommonModule, NgFor, RouterLink, PageHeaderComponent],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss'
})
export class ManagerDashboardComponent implements OnInit {
  private readonly mallData = inject(MallDataService);
  private readonly productService = inject(ProductService);
  private readonly employeeService = inject(EmployeeService);

  metrics: Array<{ label: string; value: string; detail: string; icon: string; iconTone: string }> = [];
  readonly bars = [48, 62, 58, 74, 69, 82, 77];
  team: Array<{ initials: string; name: string; role: string; onShift: boolean }> = [];
  lowStock: Array<{ name: string; stock: number; reorder: number }> = [];

  ngOnInit(): void {
    this.mallData.getSummary().subscribe((summary) => {
      this.metrics = [
        {
          label: "Revenue today",
          value: summary.revenueToday.toLocaleString("en-US", { style: "currency", currency: "PKR" }),
          detail: "Tracked from live POS transactions.",
          icon: "pi pi-wallet",
          iconTone: "accent"
        },
        {
          label: "Transactions",
          value: summary.salesToday.toString(),
          detail: "Completed sales in the current window.",
          icon: "pi pi-shopping-bag",
          iconTone: "info"
        },
        {
          label: "Stock health",
          value: `${summary.stockHealth}%`,
          detail: `${summary.lowStockCount} products are below reorder threshold.`,
          icon: "pi pi-check-circle",
          iconTone: "success"
        }
      ];
    });

    this.productService.list({ page: 1, limit: 100 }).subscribe((response) => {
      this.lowStock = response.data.items
        .filter((item) => (item.stockQuantity ?? 0) <= (item.reorderLevel ?? 0))
        .slice(0, 3)
        .map((item) => ({
          name: item.name,
          stock: item.stockQuantity ?? 0,
          reorder: item.reorderLevel ?? 0
        }));
    });

    this.employeeService.list({ page: 1, limit: 100 }).subscribe((response) => {
      this.team = response.data.items
        .filter((employee) => employee.status === "active" || employee.status === "on_shift")
        .slice(0, 3)
        .map((employee) => ({
          initials: (employee.fullName ?? employee.email ?? "EM")
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase(),
          name: employee.fullName ?? employee.email,
          role: employee.role ?? "Team member",
          onShift: employee.status === "on_shift"
        }));
    });
  }
}
