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
      <aside class="sidebar">
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
        <header class="topbar">
          <div class="topbar-copy">
            <div class="muted breadcrumb">{{ activeGroup }}</div>
          </div>

          <div class="topbar-search">
            <div class="search-shell">
              <i class="pi pi-search"></i>
              <span>Search...</span>
              <kbd>Ctrl+K</kbd>
            </div>
            <span class="status-pill">
              <span class="status-dot"></span>
              Opened
              <i class="pi pi-chevron-down"></i>
            </span>
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
        display: flex;
        margin-top: 68px;
        height: calc(100vh - 68px);
        background: var(--bg-app);
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 300px;
        height: 100vh;
        overflow-y: auto;
        background: var(--bg-panel);
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .sidebar::-webkit-scrollbar {
        display: none;
      }

      .sidebar-inner {
        min-height: 100%;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 1.1rem;
      }

      .sidebar-head {
        padding: 0.9rem 1rem 1rem;
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
        background: linear-gradient(135deg, #14b8a6, #f59e0b);
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
        margin-top: 0.85rem;
      }

      .nav-group:first-child {
        margin-top: 0;
      }

      .nav-label {
        padding: 0 1rem;
        color: var(--muted);
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
        background: linear-gradient(135deg, rgba(250, 204, 21, 0.98), rgba(245, 158, 11, 0.98));
        color: #111827;
        box-shadow: 0 16px 32px rgba(245, 158, 11, 0.22);
        border-color: rgba(255, 255, 255, 0.08);
        transform: translateY(-1px);
      }

      .nav-items a.active .item-icon {
        background: rgba(255, 255, 255, 0.3) !important;
        color: #111827 !important;
      }

      .nav-items a.active::after {
        content: "";
        margin-left: auto;
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 999px;
        background: rgba(17, 24, 39, 0.7);
        box-shadow: 0 0 0 6px rgba(17, 24, 39, 0.08);
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
        min-width: 0;
        flex: 1;
        margin-left: 300px;
        padding-top: 68px;
        height: calc(100vh - 68px);
        background: var(--bg-app);
        overflow-y: auto;
      }

      .topbar {
        position: fixed;
        top: 0;
        left: 300px;
        right: 0;
        z-index: 1000;
        margin: 0;
        padding: 0 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        height: 68px;
        border-radius: 0;
        background-color: var(--bg-panel);
        background: var(--bg-panel);
        border-bottom: 1px solid var(--border);
        box-shadow: none;
      }

      .topbar-copy {
        display: grid;
        gap: 0.25rem;
      }

      .topbar-search {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        justify-content: center;
      }

      .search-shell {
        min-height: 44px;
        width: min(100%, 320px);
        padding: 0 1rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: var(--bg-panel);
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        color: var(--text-secondary);
        box-shadow: var(--shadow-xs);
      }

      .search-shell kbd {
        margin-left: auto;
        padding: 0.18rem 0.45rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--bg-panel-muted);
        color: var(--muted);
        font-size: 0.75rem;
      }

      .status-pill {
        min-height: 44px;
        padding: 0 0.9rem;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, var(--success) 22%, var(--border) 78%);
        background: color-mix(in srgb, var(--success) 14%, var(--bg-panel) 86%);
        color: #15803d;
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        font-weight: 700;
      }

      .status-dot {
        width: 0.6rem;
        height: 0.6rem;
        border-radius: 999px;
        background: var(--success);
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
        padding: 24px;
      }

      .content {
        padding-bottom: 0.75rem;
      }

      @media (max-width: 980px) {
        .sidebar {
          top: 0;
          width: 300px;
          height: 100vh;
        }

        .topbar {
          left: 300px;
          right: 0;
          border-radius: 0;
        }

        .workspace {
          margin-left: 300px;
          padding-top: 68px;
          height: calc(100vh - 68px);
        }

        .topbar-search {
          order: 3;
          width: 100%;
          justify-content: flex-start;
        }

        .content-scroll {
          padding: 24px;
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
