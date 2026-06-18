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
    <div class="dashboard-shell" [class.sidebar-mini]="sidebarCollapsed">
      <aside class="sidebar surface-panel">
        <div class="sidebar-head">
          <button type="button" class="brand-shell" (click)="toggleSidebar()">
            <div class="brand-mark">M</div>
            <div class="brand-copy" *ngIf="!sidebarCollapsed">
              <div class="brand-title">MallOS</div>
              <div class="muted brand-subtitle">Mall management suite</div>
            </div>
            <i class="pi pi-bars menu-icon" *ngIf="!sidebarCollapsed"></i>
          </button>
        </div>

        <nav class="nav">
          <section class="nav-group" *ngFor="let group of groups">
            <button
              type="button"
              class="nav-group-toggle"
              [class.active-group]="isGroupExpanded(group)"
              (click)="toggleGroup(group)"
            >
              <span class="nav-label" *ngIf="!sidebarCollapsed">{{ group }}</span>
              <span class="nav-icon-rail" *ngIf="sidebarCollapsed">
                <i [class]="groupIcon(group)"></i>
              </span>
              <i class="pi pi-angle-down" *ngIf="!sidebarCollapsed"></i>
            </button>

            <div class="nav-items" *ngIf="isGroupExpanded(group)">
              <a *ngFor="let item of visibleByGroup(group)" [routerLink]="item.link" routerLinkActive="active">
                <span class="item-icon"><i [class]="item.icon"></i></span>
                <span *ngIf="!sidebarCollapsed">{{ item.label }}</span>
              </a>
            </div>
          </section>
        </nav>

        <div class="sidebar-footer">
          <div class="profile-row" [class.centered]="sidebarCollapsed">
            <div class="avatar">{{ userInitials }}</div>
            <div class="profile-copy" *ngIf="!sidebarCollapsed">
              <div class="profile-name">{{ currentUserName }}</div>
              <div class="muted profile-role">{{ currentRole }}</div>
            </div>
          </div>
          <button type="button" class="secondary logout" (click)="logout()">
            <i class="pi pi-sign-out"></i>
            <span *ngIf="!sidebarCollapsed">Logout</span>
          </button>
        </div>
      </aside>

      <main class="workspace">
        <header class="surface-panel topbar">
          <div class="topbar-copy">
            <div class="muted breadcrumb">{{ activeGroup }} / {{ currentModuleLabel }}</div>
            <h1>{{ currentModuleLabel }}</h1>
          </div>

          <div class="topbar-actions">
            <div class="search-pill">
              <i class="pi pi-search"></i>
              <span>Search workspace</span>
            </div>
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
        transition: grid-template-columns 240ms ease;
      }

      .dashboard-shell.sidebar-mini {
        grid-template-columns: 92px 1fr;
      }

      .sidebar {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: linear-gradient(180deg, color-mix(in srgb, var(--bg-sidebar) 94%, white 6%), var(--bg-sidebar));
        box-shadow: var(--shadow-lg);
      }

      .brand-shell,
      .nav-group-toggle,
      .profile-row,
      .topbar-actions,
      .user-pill,
      .search-pill {
        display: flex;
        align-items: center;
      }

      .sidebar-head {
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border);
      }

      .brand-shell {
        width: 100%;
        gap: 0.85rem;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }

      .brand-mark,
      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.9rem;
        background: var(--accent);
        color: #ffffff;
        display: grid;
        place-items: center;
        font-weight: 800;
        box-shadow: 0 14px 26px rgba(20, 184, 166, 0.18);
        flex: 0 0 auto;
      }

      .brand-copy {
        flex: 1;
        text-align: left;
      }

      .brand-title,
      .profile-name {
        font-weight: 700;
        color: var(--heading);
      }

      .menu-icon {
        color: var(--muted);
      }

      .nav {
        display: grid;
        gap: 0.85rem;
      }

      .nav-group {
        display: grid;
        gap: 0.4rem;
      }

      .nav-group-toggle {
        width: 100%;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.55rem 0.65rem;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: var(--muted);
        cursor: pointer;
      }

      .nav-group-toggle.active-group {
        background: var(--bg-panel-muted);
        color: var(--heading);
      }

      .nav-label {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .nav-icon-rail {
        width: 100%;
        display: grid;
        place-items: center;
      }

      .nav-items {
        display: grid;
        gap: 0.35rem;
      }

      .nav-items a,
      .logout {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0.85rem;
        border-radius: 999px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-secondary);
        text-align: left;
        cursor: pointer;
        transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease, transform 200ms ease,
          box-shadow 200ms ease;
      }

      .item-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 10px;
        background: color-mix(in srgb, var(--bg-panel-muted) 84%, transparent);
        display: inline-grid;
        place-items: center;
        flex: 0 0 auto;
      }

      .nav-items a.active,
      .nav-items a:hover,
      .logout:hover {
        background: var(--bg-accent-soft);
        border-color: rgba(20, 184, 166, 0.2);
        color: var(--accent);
        box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.12), 0 10px 24px rgba(20, 184, 166, 0.12);
        transform: translateY(-1px);
      }

      .nav-items a.active .item-icon,
      .nav-items a:hover .item-icon {
        background: rgba(20, 184, 166, 0.14);
      }

      .sidebar-footer {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        display: grid;
        gap: 0.85rem;
      }

      .profile-row {
        gap: 0.75rem;
      }

      .profile-row.centered {
        justify-content: center;
      }

      .logout {
        justify-content: center;
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
        box-shadow: var(--shadow-md);
      }

      .topbar-copy h1 {
        margin: 0.2rem 0 0;
      }

      .topbar-actions {
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .search-pill,
      .user-pill {
        min-height: 42px;
        padding: 0.35rem 0.85rem;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: var(--bg-panel);
        color: var(--text-secondary);
        box-shadow: var(--shadow-xs);
        gap: 0.65rem;
      }

      .search-pill {
        min-width: 190px;
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

      .avatar.small {
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        font-size: 0.8rem;
      }

      .content {
        padding-bottom: 1rem;
      }

      @media (max-width: 900px) {
        .dashboard-shell,
        .dashboard-shell.sidebar-mini {
          grid-template-columns: 1fr;
        }

        .topbar {
          flex-direction: column;
          align-items: stretch;
        }

        .topbar-actions {
          justify-content: space-between;
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
  sidebarCollapsed = false;
  expandedGroup: NavGroup | null = null;
  readonly groups: NavGroup[] = ["Overview", "Operations", "Analytics", "System"];

  navItems = [
    { label: "Admin Dashboard", link: "/dashboard/admin", icon: "pi pi-chart-bar", roles: ["admin"], group: "Overview" as NavGroup },
    { label: "Manager Dashboard", link: "/dashboard/manager", icon: "pi pi-briefcase", roles: ["admin", "manager"], group: "Overview" as NavGroup },
    { label: "Cashier Dashboard", link: "/dashboard/cashier", icon: "pi pi-desktop", roles: ["admin", "cashier"], group: "Overview" as NavGroup },
    { label: "Employees", link: "/employees", icon: "pi pi-users", roles: ["admin", "manager"], group: "Operations" as NavGroup },
    { label: "Departments", link: "/departments", icon: "pi pi-building", roles: ["admin", "manager"], group: "Operations" as NavGroup },
    { label: "Products", link: "/products", icon: "pi pi-tag", roles: ["admin", "manager"], group: "Operations" as NavGroup },
    { label: "POS", link: "/pos", icon: "pi pi-shopping-cart", roles: ["admin", "cashier"], group: "Operations" as NavGroup },
    { label: "Sales", link: "/sales", icon: "pi pi-chart-line", roles: ["admin", "manager"], group: "Analytics" as NavGroup },
    { label: "Reports", link: "/reports", icon: "pi pi-file", roles: ["admin", "manager"], group: "Analytics" as NavGroup },
    { label: "AI Insights", link: "/ai-insights", icon: "pi pi-star", roles: ["admin", "manager"], group: "Analytics" as NavGroup },
    { label: "Users", link: "/users", icon: "pi pi-id-card", roles: ["admin"], group: "System" as NavGroup },
    { label: "Settings", link: "/settings", icon: "pi pi-cog", roles: ["admin", "manager", "cashier"], group: "System" as NavGroup }
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
    return this.groups.find((group) => this.groupHasActiveRoute(group)) ?? "Overview";
  }

  get currentModuleLabel(): string {
    return this.navItems.find((item) => this.router.url.startsWith(item.link))?.label ?? "Dashboard";
  }

  visibleByGroup(group: NavGroup) {
    return this.navItems.filter((item) => item.group === group && item.roles.includes(this.currentRoleValue));
  }

  groupIcon(group: NavGroup): string {
    return group === "Operations"
      ? "pi pi-briefcase"
      : group === "Analytics"
        ? "pi pi-chart-line"
        : group === "System"
          ? "pi pi-cog"
          : "pi pi-th-large";
  }

  isGroupExpanded(group: NavGroup): boolean {
    if (this.sidebarCollapsed) {
      return true;
    }
    return this.expandedGroup === group || this.groupHasActiveRoute(group);
  }

  toggleGroup(group: NavGroup): void {
    if (this.sidebarCollapsed) {
      return;
    }
    this.expandedGroup = this.expandedGroup === group ? null : group;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleTheme(): void {
    this.applyTheme(this.theme === "light" ? "dark" : "light");
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl("/login");
  }

  private groupHasActiveRoute(group: NavGroup): boolean {
    return this.visibleByGroup(group).some((item) => this.router.url.startsWith(item.link));
  }

  private applyTheme(theme: "light" | "dark"): void {
    this.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mallos_theme", theme);
  }
}
