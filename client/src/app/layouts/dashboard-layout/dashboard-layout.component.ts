import { Component, inject } from "@angular/core";
import { NgFor } from "@angular/common";
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-dashboard-layout",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  template: `
    <div class="dashboard-shell">
      <aside class="sidebar surface-panel">
        <div class="brand">MallOS</div>
        <nav>
          <a *ngFor="let item of navItems" [routerLink]="item.link" routerLinkActive="active">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        </nav>
        <button type="button" class="logout" (click)="logout()">Logout</button>
      </aside>

      <main class="workspace">
        <header class="surface-panel topbar">
          <div>
            <div class="muted">Mall management console</div>
            <h1>Dashboard</h1>
          </div>
          <div class="muted">{{ currentUserName }}</div>
        </header>

        <section class="content">
          <router-outlet />
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      .dashboard-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 1rem;
        padding: 1rem;
      }

      .sidebar {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .brand {
        font-size: 1.25rem;
        font-weight: 700;
      }

      nav {
        display: grid;
        gap: 0.35rem;
      }

      nav a,
      .logout {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0.85rem;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }

      nav a.active,
      nav a:hover,
      .logout:hover {
        background: rgba(96, 165, 250, 0.12);
        border-color: rgba(96, 165, 250, 0.25);
      }

      .workspace {
        display: grid;
        gap: 1rem;
      }

      .topbar {
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .content {
        padding-bottom: 1rem;
      }

      @media (max-width: 900px) {
        .dashboard-shell {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  currentUserName = this.authService.getCurrentUser()?.name ?? "Guest";

  navItems = [
    { label: "Admin Dashboard", link: "/dashboard/admin", icon: "pi pi-chart-bar" },
    { label: "Manager Dashboard", link: "/dashboard/manager", icon: "pi pi-briefcase" },
    { label: "Cashier Dashboard", link: "/dashboard/cashier", icon: "pi pi-desktop" },
    { label: "Employees", link: "/employees", icon: "pi pi-users" },
    { label: "Departments", link: "/departments", icon: "pi pi-building" },
    { label: "Products", link: "/products", icon: "pi pi-tag" },
    { label: "POS", link: "/pos", icon: "pi pi-shopping-cart" },
    { label: "Sales", link: "/sales", icon: "pi pi-chart-line" },
    { label: "Reports", link: "/reports", icon: "pi pi-file" },
    { label: "AI Insights", link: "/ai-insights", icon: "pi pi-star" },
    { label: "Users", link: "/users", icon: "pi pi-id-card" },
    { label: "Settings", link: "/settings", icon: "pi pi-cog" }
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl("/login");
  }
}
