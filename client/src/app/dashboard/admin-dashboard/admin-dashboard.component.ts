import { CommonModule, NgFor } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { PageHeaderComponent } from "../../shared/page-header/page-header.component";
import { AuthService } from "../../core/services/auth.service";
import { DashboardSummary, MallDataService } from "../../core/services/mall-data.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, NgFor, RouterLink, PageHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly mallData = inject(MallDataService);

  readonly greetingTitle = `Good morning, ${this.authService.getCurrentUser()?.name ?? "team"}`;
  summary: DashboardSummary = { revenueToday: 0, salesToday: 0, lowStockCount: 0, activeEmployees: 0, stockHealth: 0, alerts: 0 };

  activityFeed: Array<{ icon: string; title: string; detail: string; time: string }> = [];
  chartBars = [38, 64, 54, 72, 58, 83, 62];
  departmentSignals: Array<{ label: string; detail: string; status: NonNullable<"healthy" | "low_stock" | "out_of_stock"> }> = [];
  salesCards: Array<{ initials: string; title: string; meta: string }> = [];

  ngOnInit(): void {
    this.mallData.getSummary().subscribe((summary) => (this.summary = summary));
    this.mallData.getActivityFeed().subscribe((feed) => (this.activityFeed = feed));
    this.mallData.getDepartmentSignals().subscribe((signals) => (this.departmentSignals = signals));
    this.mallData.getRecentSales().subscribe((sales) => {
      this.salesCards = sales.slice(0, 3).map((sale) => ({
        initials: sale.department.slice(0, 2).toUpperCase(),
        title: `${sale.department} Batch`,
        meta: `${sale.itemCount} items · ${sale.paymentMethod} · ${sale.total.toLocaleString("en-US", { style: "currency", currency: "PKR" })}`
      }));
    });
  }
}
