import { CommonModule, NgFor } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-dashboard-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  template: `
    <div class="dashboard-shell">
      <aside class="sidebar surface-panel">
        <div class="sidebar-head">
          <div class="brand">
            <div class="brand-mark">M</div>
            <div>
              <div class="brand-title">MallOS</div>
              <div class="muted brand-subtitle">Mall management suite</div>
            </div>
          </div>
        </div>

        <nav class="nav">
          <section class="nav-group" *ngIf="visibleByGroup('Overview').length">
            <div class="nav-label">Overview</div>
            <a *ngFor="let item of visibleByGroup('Overview')" [routerLink]="item.link" routerLinkActive="active">
              <i [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          </section>

          <section class="nav-group" *ngIf="visibleByGroup('Operations').length">
            <div class="nav-label">Operations</div>
            <a *ngFor="let item of visibleByGroup('Operations')" [routerLink]="item.link" routerLinkActive="active">
              <i [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          </section>

          <section class="nav-group" *ngIf="visibleByGroup('Analytics').length">
            <div class="nav-label">Analytics</div>
            <a *ngFor="let item of visibleByGroup('Analytics')" [routerLink]="item.link" routerLinkActive="active">
              <i [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          </section>

          <section class="nav-group" *ngIf="visibleByGroup('System').length">
            <div class="nav-label">System</div>
            <a *ngFor="let item of visibleByGroup('System')" [routerLink]="item.link" routerLinkActive="active">
              <i [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          </section>
        </nav>

        <div class="sidebar-footer">
          <div class="profile-row">
            <div class="avatar">{{ userInitials }}</div>
            <div class="profile-copy">
              <div class="profile-name">{{ currentUserName }}</div>
              <div class="muted profile-role">{{ currentRole }}</div>
            </div>
          </div>
          <button type="button" class="secondary logout" (click)="logout()">
            <i class="pi pi-sign-out"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main class="workspace">
        <header class="surface-panel topbar">
          <div>
            <div class="muted breadcrumb">Mall Management Console</div>
            <h1>Dashboard</h1>
          </div>

          <div class="topbar-actions">
            <button type="button" class="icon-button ghost" (click)="toggleTheme()" [attr.aria-label]="themeLabel">
              <i class="pi" [class.pi-moon]="theme === 'light'" [class.pi-sun]="theme === 'dark'"></i>
            </button>
            <button type="button" class="icon-button ghost notification-button" aria-label="Notifications">
              <i class="pi pi-bell"></i>
              <span class="notification-dot"></span>
            </button>
            <div class="user-pill ghost">
              <div class="avatar small">{{ userInitials }}</div>
              <span>{{ currentUserName }}</span>
              <i class="pi pi-angle-down"></i>
            </div>
          </div>
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
        grid-template-columns: 280px 1fr;
        gap: 1rem;
        padding: 1rem;
      }

      .sidebar {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .sidebar-head {
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border);
      }

      .brand,
      .profile-row,
      .topbar-actions,
      .user-pill {
        display: flex;
        align-items: center;
      }

      .brand {
        gap: 0.85rem;
      }

      .brand-mark,
      .avatar {
        width: 2.4rem;
        height: 2.4rem;
        border-radius: 0.8rem;
        background: var(--accent);
        color: #ffffff;
        display: grid;
        place-items: center;
        font-weight: 800;
      }

      .brand-title,
      .profile-name {
        font-weight: 700;
        color: var(--heading);
      }

      .brand-subtitle,
      .profile-role,
      .breadcrumb {
        font-size: 0.82rem;
      }

      .nav {
        display: grid;
        gap: 1rem;
      }

      .nav-group {
        display: grid;
        gap: 0.35rem;
      }

      .nav-label {
        padding: 0 0.85rem 0.15rem;
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .nav a,
      .logout {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0.85rem;
        border-radius: 12px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-secondary);
        text-align: left;
        cursor: pointer;
      }

      .nav a.active,
      .nav a:hover,
      .logout:hover {
        background: var(--bg-accent-soft);
        border-color: rgba(20, 184, 166, 0.2);
        color: var(--accent);
      }

      .sidebar-footer {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        display: grid;
        gap: 0.85rem;
      }

      .profile-row,
      .user-pill {
        gap: 0.75rem;
      }

      .avatar.small {
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        font-size: 0.8rem;
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
        gap: 1rem;
      }

      .topbar h1 {
        margin: 0.2rem 0 0;
        color: var(--heading);
      }

      .topbar-actions {
        gap: 0.75rem;
      }

      .icon-button {
        width: 42px;
        min-height: 42px;
        padding: 0;
        border-radius: 12px;
        display: inline-grid;
        place-items: center;
      }

      .notification-button {
        position: relative;
      }

      .notification-dot {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--danger);
      }

      .user-pill {
        min-height: 42px;
        padding: 0.35rem 0.75rem 0.35rem 0.4rem;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: var(--bg-panel);
        color: var(--text);
      }

      .content {
        padding-bottom: 1rem;
      }

      @media (max-width: 900px) {
        .dashboard-shell {
          grid-template-columns: 1fr;
        }

        .topbar {
          flex-direction: column;
          align-items: stretch;
        }

        .topbar-actions {
          justify-content: space-between;
          flex-wrap: wrap;
        }
      }
    `
  ]
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly currentRoleValue = this.authService.getCurrentUser()?.role ?? "admin";

  currentUserName = this.authService.getCurrentUser()?.name ?? "Guest";
  theme: "light" | "dark" = "light";

  navItems = [
    { label: "Admin Dashboard", link: "/dashboard/admin", icon: "pi pi-chart-bar", roles: ["admin"], group: "Overview" },
    { label: "Manager Dashboard", link: "/dashboard/manager", icon: "pi pi-briefcase", roles: ["admin", "manager"], group: "Overview" },
    { label: "Cashier Dashboard", link: "/dashboard/cashier", icon: "pi pi-desktop", roles: ["admin", "cashier"], group: "Overview" },
    { label: "Employees", link: "/employees", icon: "pi pi-users", roles: ["admin", "manager"], group: "Operations" },
    { label: "Departments", link: "/departments", icon: "pi pi-building", roles: ["admin", "manager"], group: "Operations" },
    { label: "Products", link: "/products", icon: "pi pi-tag", roles: ["admin", "manager"], group: "Operations" },
    { label: "POS", link: "/pos", icon: "pi pi-shopping-cart", roles: ["admin", "cashier"], group: "Operations" },
    { label: "Sales", link: "/sales", icon: "pi pi-chart-line", roles: ["admin", "manager"], group: "Analytics" },
    { label: "Reports", link: "/reports", icon: "pi pi-file", roles: ["admin", "manager"], group: "Analytics" },
    { label: "AI Insights", link: "/ai-insights", icon: "pi pi-star", roles: ["admin", "manager"], group: "Analytics" },
    { label: "Users", link: "/users", icon: "pi pi-id-card", roles: ["admin"], group: "System" },
    { label: "Settings", link: "/settings", icon: "pi pi-cog", roles: ["admin", "manager", "cashier"], group: "System" }
  ];

  constructor() {
    this.applyTheme((localStorage.getItem("mallos_theme") as "light" | "dark" | null) ?? "light");
  }

  get currentRole(): string {
    return this.currentRoleValue;
  }

  get userInitials(): string {
    return this.currentUserName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  get themeLabel(): string {
    return this.theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  }

  visibleByGroup(group: string) {
    return this.navItems.filter((item) => item.group === group && item.roles.includes(this.currentRoleValue));
  }

  toggleTheme(): void {
    this.applyTheme(this.theme === "light" ? "dark" : "light");
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl("/login");
  }

  private applyTheme(theme: "light" | "dark"): void {
    this.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mallos_theme", theme);
  }
}
