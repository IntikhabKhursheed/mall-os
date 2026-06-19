import { CommonModule, NgFor } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

type NavGroup = "Overview" | "Operations" | "Analytics" | "System";

@Component({
  selector: "app-dashboard-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  template: `
    <div class="dashboard-shell">
      <aside class="sidebar surface-panel">
        <div class="sidebar-inner">
          <div class="sidebar-head">
            <div class="brand-shell">
              <div class="brand-mark">M</div>
              <div class="brand-copy">
                <div class="brand-title">MallOS</div>
                <div class="muted brand-subtitle">Grand Central Mall</div>
              </div>
            </div>
          </div>

          <nav class="nav">
            <section class="nav-group" *ngFor="let group of groups">
              <div class="nav-label">{{ group }}</div>
              <div class="nav-items">
                <a *ngFor="let item of visibleByGroup(group)" [routerLink]="item.link" routerLinkActive="active">
                  <span class="item-icon" [ngStyle]="{ background: item.iconBg, color: item.iconColor }">
                    <i [class]="item.icon"></i>
                  </span>
                  <span>{{ item.label }}</span>
                </a>
              </div>
            </section>
          </nav>

          <div class="sidebar-footer">
            <div class="profile-row">
              <div class="avatar">{{ userInitials }}</div>
              <div class="profile-copy">
                <div class="profile-name">{{ currentUserName }}</div>
                <div class="role-badge">{{ currentRole }}</div>
              </div>
              <button type="button" class="ghost logout-icon" (click)="logout()" aria-label="Logout">
                <i class="pi pi-sign-out"></i>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main class="workspace">
        <header class="surface-panel topbar">
          <div class="topbar-copy">
            <div class="muted breadcrumb">{{ activeGroup }}</div>
            <h1>{{ currentModuleLabel }}</h1>
          </div>

          <div class="topbar-actions">
            <button type="button" class="icon-button ghost" (click)="toggleTheme()" [attr.aria-label]="themeLabel">
              <i class="pi" [class.pi-moon]="theme === 'light'" [class.pi-sun]="theme === 'dark'"></i>
            </button>
            <button type="button" class="icon-button ghost notification-button" aria-label="Notifications">
              <i class="pi pi-bell"></i>
              <span class="notification-dot"></span>
            </button>
          </div>
        </header>

        <div class="content-scroll">
          <section class="content">
            <router-outlet />
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .dashboard-shell {
        min-height: 100vh;
        background: var(--bg-app);
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 280px;
        height: 100vh;
        z-index: 50;
        border-radius: 0;
        border-left: 0;
        overflow-y: auto;
        background: linear-gradient(180deg, color-mix(in srgb, var(--bg-sidebar) 96%, white 4%), var(--bg-sidebar));
        box-shadow: var(--shadow-lg);
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .sidebar::before {
        height: 0;
      }

      .sidebar::-webkit-scrollbar {
        display: none;
      }

      .sidebar-inner {
        min-height: 100%;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 1rem;
      }

      .sidebar-head {
        padding: 1.25rem 1rem;
        border-bottom: 1px solid var(--border);
      }

      .brand-shell,
      .profile-row {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .brand-mark {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.9rem;
        background: linear-gradient(135deg, #14b8a6, #0f9e8c);
        color: #ffffff;
        display: grid;
        place-items: center;
        font-weight: 800;
        box-shadow: 0 14px 26px rgba(20, 184, 166, 0.18);
      }

      .brand-title,
      .profile-name {
        font-weight: 700;
        color: var(--heading);
      }

      .nav {
        display: grid;
        gap: 1rem;
      }

      .nav-group {
        display: grid;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .nav-group:first-child {
        margin-top: 0;
      }

      .nav-label {
        padding: 0 1rem;
        color: #4b5563;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .nav-items {
        display: grid;
        gap: 0.35rem;
        margin-top: 0.5rem;
      }

      .nav-items a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-height: 44px;
        padding: 0.625rem 1rem;
        border-radius: 14px;
        border: 1px solid transparent;
        color: var(--text-secondary);
        transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
      }

      .item-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 10px;
        display: inline-grid;
        place-items: center;
        flex: 0 0 auto;
      }

      .nav-items a:hover {
        background: var(--bg-panel-muted);
        color: var(--heading);
      }

      .nav-items a.active {
        background: linear-gradient(135deg, #14b8a6, #0f9e8c);
        color: #ffffff;
        box-shadow: 0 12px 24px rgba(20, 184, 166, 0.22);
      }

      .nav-items a.active .item-icon {
        background: rgba(255, 255, 255, 0.16) !important;
        color: #ffffff !important;
      }

      .sidebar-footer {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
      }

      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #14b8a6, #8b5cf6);
        color: #ffffff;
        display: grid;
        place-items: center;
        font-weight: 800;
      }

      .profile-copy {
        flex: 1;
      }

      .role-badge {
        display: inline-flex;
        margin-top: 0.35rem;
        padding: 0.28rem 0.6rem;
        border-radius: 999px;
        background: rgba(20, 184, 166, 0.12);
        color: var(--accent);
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: capitalize;
      }

      .logout-icon {
        width: 38px;
        min-width: 38px;
        min-height: 38px;
        padding: 0;
        border-radius: 10px;
        display: inline-grid;
        place-items: center;
      }

      .workspace {
        margin-left: 280px;
        height: 100vh;
        background: var(--bg-app);
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 1rem;
        min-height: 0;
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 40;
        margin: 24px 24px 0;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .topbar h1 {
        margin: 0.2rem 0 0;
      }

      .topbar-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
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

      .content-scroll {
        min-height: 0;
        overflow-y: auto;
        padding: 0 24px 24px;
      }

      .content {
        padding-bottom: 1rem;
      }

      @media (max-width: 980px) {
        .sidebar {
          position: static;
          width: auto;
          height: auto;
          border-radius: var(--radius-md);
        }

        .workspace {
          margin-left: 0;
          height: auto;
          gap: 0.75rem;
        }

        .topbar {
          position: static;
          margin: 1rem 1rem 0;
        }

        .content-scroll {
          overflow: visible;
          padding: 0 1rem 1rem;
        }
      }
    `
  ]
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly currentRoleValue = this.authService.getCurrentUser()?.role ?? "admin";
  readonly groups: NavGroup[] = ["Overview", "Operations", "Analytics", "System"];

  currentUserName = this.authService.getCurrentUser()?.name ?? "Guest";
  theme: "light" | "dark" = "light";

  navItems = [
    { label: "Admin Dashboard", link: "/dashboard/admin", icon: "pi pi-chart-bar", iconBg: "#14b8a620", iconColor: "#14b8a6", roles: ["admin"], group: "Overview" as NavGroup },
    { label: "Manager Dashboard", link: "/dashboard/manager", icon: "pi pi-briefcase", iconBg: "#8b5cf620", iconColor: "#8b5cf6", roles: ["admin", "manager"], group: "Overview" as NavGroup },
    { label: "Cashier Dashboard", link: "/dashboard/cashier", icon: "pi pi-desktop", iconBg: "#3b82f620", iconColor: "#3b82f6", roles: ["admin", "cashier"], group: "Overview" as NavGroup },
    { label: "Employees", link: "/employees", icon: "pi pi-users", iconBg: "#8b5cf620", iconColor: "#8b5cf6", roles: ["admin", "manager"], group: "Operations" as NavGroup },
    { label: "Departments", link: "/departments", icon: "pi pi-building", iconBg: "#3b82f620", iconColor: "#3b82f6", roles: ["admin", "manager"], group: "Operations" as NavGroup },
    { label: "Products", link: "/products", icon: "pi pi-tag", iconBg: "#f59e0b20", iconColor: "#f59e0b", roles: ["admin", "manager"], group: "Operations" as NavGroup },
    { label: "POS", link: "/pos", icon: "pi pi-shopping-cart", iconBg: "#22c55e20", iconColor: "#22c55e", roles: ["admin", "cashier"], group: "Operations" as NavGroup },
    { label: "Sales", link: "/sales", icon: "pi pi-chart-line", iconBg: "#eab30820", iconColor: "#eab308", roles: ["admin", "manager"], group: "Analytics" as NavGroup },
    { label: "Reports", link: "/reports", icon: "pi pi-file", iconBg: "#ec489920", iconColor: "#ec4899", roles: ["admin", "manager"], group: "Analytics" as NavGroup },
    { label: "AI Insights", link: "/ai-insights", icon: "pi pi-sparkles", iconBg: "#7c3aed20", iconColor: "#7c3aed", roles: ["admin", "manager"], group: "Analytics" as NavGroup },
    { label: "Users", link: "/users", icon: "pi pi-id-card", iconBg: "#6b728020", iconColor: "#6b7280", roles: ["admin"], group: "System" as NavGroup },
    { label: "Settings", link: "/settings", icon: "pi pi-cog", iconBg: "#64748b20", iconColor: "#64748b", roles: ["admin", "manager", "cashier"], group: "System" as NavGroup }
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

  get activeGroup(): NavGroup {
    return this.groups.find((group) => this.visibleByGroup(group).some((item) => this.router.url.startsWith(item.link))) ?? "Overview";
  }

  get currentModuleLabel(): string {
    return this.navItems.find((item) => this.router.url.startsWith(item.link))?.label ?? "Dashboard";
  }

  visibleByGroup(group: NavGroup) {
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
