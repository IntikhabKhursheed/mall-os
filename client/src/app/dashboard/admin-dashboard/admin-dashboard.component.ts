import { CommonModule, CurrencyPipe, NgFor } from "@angular/common";
import { Component } from "@angular/core";
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexMarkers,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule
} from "ng-apexcharts";

type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  grid: ApexGrid;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  markers: ApexMarkers;
  tooltip: ApexTooltip;
  colors: string[];
};

type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  colors: string[];
};

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, CurrencyPipe, NgFor, NgApexchartsModule],
  template: `
    <section class="section-grid four-col">
      <article class="saas-card kpi-card" *ngFor="let card of kpiCards">
        <div class="kpi-top">
          <div>
            <div class="kpi-label">{{ card.label }}</div>
            <div class="kpi-value">{{ card.value }}</div>
          </div>
          <div class="kpi-icon" [ngClass]="card.iconClass">
            <i [class]="card.icon"></i>
          </div>
        </div>
        <div class="kpi-foot" [ngClass]="card.trendClass">{{ card.trend }}</div>
      </article>
    </section>

    <section class="section-grid two-col dashboard-gap">
      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Revenue Last 30 Days</h3>
            <p>Daily revenue trend across all departments</p>
          </div>
        </div>
        <apx-chart
          [series]="revenueChart.series"
          [chart]="revenueChart.chart"
          [stroke]="revenueChart.stroke"
          [grid]="revenueChart.grid"
          [xaxis]="revenueChart.xaxis"
          [yaxis]="revenueChart.yaxis"
          [markers]="revenueChart.markers"
          [tooltip]="revenueChart.tooltip"
          [colors]="revenueChart.colors"
        ></apx-chart>
      </article>

      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Sales by Department</h3>
            <p>Department performance snapshot</p>
          </div>
        </div>
        <apx-chart
          [series]="salesDepartmentChart.series"
          [chart]="salesDepartmentChart.chart"
          [plotOptions]="salesDepartmentChart.plotOptions"
          [grid]="salesDepartmentChart.grid"
          [xaxis]="salesDepartmentChart.xaxis"
          [yaxis]="salesDepartmentChart.yaxis"
          [dataLabels]="salesDepartmentChart.dataLabels"
          [tooltip]="salesDepartmentChart.tooltip"
          [colors]="salesDepartmentChart.colors"
        ></apx-chart>
      </article>
    </section>

    <section class="section-grid two-col dashboard-gap">
      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Top Selling Products</h3>
            <p>Best performers by units and revenue</p>
          </div>
          <a class="pill-link" href="#">View catalog</a>
        </div>
        <div class="table-wrap">
          <table class="saas-table compact-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of topProducts">
                <td><span class="rank-pill">{{ product.rank }}</span></td>
                <td>{{ product.name }}</td>
                <td>{{ product.units }}</td>
                <td>{{ product.revenue | currency: 'PKR ':'symbol':'1.0-0' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Recent Transactions</h3>
            <p>Latest transactions across the mall</p>
          </div>
          <a class="pill-link" href="#">Open sales log</a>
        </div>
        <div class="table-wrap">
          <table class="saas-table compact-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Cashier</th>
                <th>Amount</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let transaction of recentTransactions">
                <td>{{ transaction.time }}</td>
                <td>{{ transaction.cashier }}</td>
                <td class="amount-positive">{{ transaction.amount | currency: 'PKR ':'symbol':'1.0-0' }}</td>
                <td><span class="badge badge-cashier">{{ transaction.department }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <section class="dashboard-gap">
      <article class="saas-card panel-section">
        <div class="panel-header">
          <div>
            <h3>Low Stock Alerts</h3>
            <p>Products that are approaching or below reorder thresholds</p>
          </div>
        </div>

        <div class="alerts-grid">
          <div class="alert-card" *ngFor="let alert of stockAlerts">
            <div class="alert-title-row">
              <div>
                <h4>{{ alert.name }}</h4>
                <div class="alert-department">{{ alert.department }}</div>
              </div>
              <span class="badge badge-danger">{{ alert.currentStock }} left</span>
            </div>

            <div class="alert-meta">
              <span>Reorder level</span>
              <strong>{{ alert.reorderLevel }}</strong>
            </div>

            <button class="btn-primary" type="button">Reorder</button>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .dashboard-gap {
        margin-top: 1rem;
      }

      .kpi-card {
        padding: 1.5rem;
      }

      .kpi-top {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 1rem;
      }

      .kpi-label {
        color: var(--text-secondary);
        font-size: 0.88rem;
      }

      .kpi-value {
        margin-top: 0.6rem;
        color: #ffffff;
        font-size: 1.8rem;
        font-weight: 700;
        line-height: 1.1;
      }

      .kpi-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        font-size: 1.1rem;
      }

      .kpi-icon.green {
        color: #4ade80;
        background: rgba(34, 197, 94, 0.1);
      }

      .kpi-icon.blue {
        color: #60a5fa;
        background: rgba(59, 130, 246, 0.1);
      }

      .kpi-icon.red {
        color: #f87171;
        background: rgba(239, 68, 68, 0.1);
      }

      .kpi-icon.teal {
        color: #2dd4bf;
        background: rgba(20, 184, 166, 0.1);
      }

      .kpi-foot {
        margin-top: 1rem;
        font-size: 0.84rem;
        font-weight: 600;
      }

      .trend-positive {
        color: #4ade80;
      }

      .trend-info {
        color: #60a5fa;
      }

      .trend-danger {
        color: #f87171;
      }

      .trend-neutral {
        color: #2dd4bf;
      }

      .compact-table td,
      .compact-table th {
        padding-top: 0.8rem;
        padding-bottom: 0.8rem;
      }

      .rank-pill {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        display: inline-grid;
        place-items: center;
        background: rgba(20, 184, 166, 0.12);
        color: #2dd4bf;
        font-weight: 700;
      }

      .amount-positive {
        color: #4ade80;
        font-weight: 700;
      }

      .alerts-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
      }

      .alert-card {
        border: 1px solid var(--border);
        border-radius: 16px;
        background: #0f172a;
        padding: 1rem;
        display: grid;
        gap: 1rem;
      }

      .alert-title-row {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .alert-title-row h4 {
        margin: 0;
      }

      .alert-department {
        margin-top: 0.35rem;
        color: var(--text-secondary);
        font-size: 0.85rem;
      }

      .alert-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      @media (max-width: 1280px) {
        .alerts-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .alerts-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AdminDashboardComponent {
  readonly kpiCards = [
    {
      label: "Today's Revenue",
      value: "PKR 284,500",
      trend: "+12.5% vs yesterday",
      icon: "pi pi-arrow-up-right",
      iconClass: "green",
      trendClass: "trend-positive"
    },
    {
      label: "Total Sales",
      value: "847 transactions",
      trend: "+8.2% vs yesterday",
      icon: "pi pi-chart-bar",
      iconClass: "blue",
      trendClass: "trend-info"
    },
    {
      label: "Low Stock Alerts",
      value: "12 items",
      trend: "Needs attention",
      icon: "pi pi-exclamation-triangle",
      iconClass: "red",
      trendClass: "trend-danger"
    },
    {
      label: "Active Employees",
      value: "34 online",
      trend: "Out of 56 total",
      icon: "pi pi-users",
      iconClass: "teal",
      trendClass: "trend-neutral"
    }
  ];

  readonly topProducts = [
    { rank: 1, name: "Wireless Earbuds", units: 142, revenue: 994000 },
    { rank: 2, name: "Classic Denim Jacket", units: 101, revenue: 908000 },
    { rank: 3, name: "Burger Combo", units: 278, revenue: 416000 },
    { rank: 4, name: "Face Serum", units: 156, revenue: 343000 },
    { rank: 5, name: "Smart Watch", units: 63, revenue: 819000 }
  ];

  readonly recentTransactions = [
    { time: "10:42 AM", cashier: "Ayesha Khan", amount: 12450, department: "Fashion" },
    { time: "10:36 AM", cashier: "Hassan Ali", amount: 8450, department: "Food Court" },
    { time: "10:28 AM", cashier: "Sara Ahmed", amount: 28999, department: "Electronics" },
    { time: "10:14 AM", cashier: "Usman Raza", amount: 6490, department: "Beauty" },
    { time: "09:58 AM", cashier: "Nida Tariq", amount: 15499, department: "Sports" }
  ];

  readonly stockAlerts = [
    { name: "Smart Watch", currentStock: 6, reorderLevel: 8, department: "Electronics" },
    { name: "Perfume Bottle", currentStock: 7, reorderLevel: 10, department: "Beauty" },
    { name: "Running Shorts", currentStock: 4, reorderLevel: 8, department: "Sports" },
    { name: "Home Decor Lamp", currentStock: 0, reorderLevel: 5, department: "Home & Living" }
  ];

  readonly revenueChart: LineChartOptions = {
    series: [
      {
        name: "Revenue",
        data: [180, 192, 205, 210, 224, 198, 232, 241, 256, 249, 264, 272, 280, 275, 289]
      }
    ],
    chart: {
      type: "line",
      height: 320,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent"
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    colors: ["#14b8a6"],
    markers: {
      size: 4,
      colors: ["#14b8a6"],
      strokeColors: "#0f172a"
    },
    grid: {
      borderColor: "#1f2937"
    },
    xaxis: {
      categories: ["1 Jun", "3 Jun", "5 Jun", "7 Jun", "9 Jun", "11 Jun", "13 Jun", "15 Jun", "17 Jun", "19 Jun", "21 Jun", "23 Jun", "25 Jun", "27 Jun", "29 Jun"],
      labels: { style: { colors: "#6b7280" } },
      axisBorder: { color: "#1f2937" },
      axisTicks: { color: "#1f2937" }
    },
    yaxis: {
      labels: {
        style: { colors: "#6b7280" },
        formatter: (value) => `PKR ${value}k`
      }
    },
    tooltip: {
      theme: "dark"
    }
  };

  readonly salesDepartmentChart: BarChartOptions = {
    series: [{ name: "Sales", data: [168, 142, 189, 122, 136] }],
    chart: {
      type: "bar",
      height: 320,
      toolbar: { show: false },
      background: "transparent"
    },
    colors: ["#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#0f766e"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "45%",
        distributed: true
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#1f2937"
    },
    xaxis: {
      categories: ["Fashion", "Food", "Electronics", "Beauty", "Sports"],
      labels: { style: { colors: "#6b7280" } },
      axisBorder: { color: "#1f2937" },
      axisTicks: { color: "#1f2937" }
    },
    yaxis: {
      labels: {
        style: { colors: "#6b7280" }
      }
    },
    tooltip: {
      theme: "dark"
    }
  };
}
