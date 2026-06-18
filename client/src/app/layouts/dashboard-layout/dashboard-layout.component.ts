import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { User } from "../../core/models/user.model";

interface NavItem {
  label: string;
  link: string;
  icon: string;
  roles: Array<User["role"]>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: "app-dashboard-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-shell">
      <aside class="sidebar">
        <div>
          <div class="sidebar-brand">
            <div class="brand-mark">M</div>
            <div>
              <div class="brand-name">MallOS</div>
              <div class="mall-subtitle">Grand Central Mall</div>
            </div>
          </div>

          <div class="sidebar-divider"></div>

          <nav class="nav-groups">
            <section class="nav-group" *ngFor="let section of visibleSections">
              <div class="nav-label">{{ section.label }}</div>
              <a
                *ngFor="let item of section.items"
                [routerLink]="item.link"
                routerLinkActive="active"
                class="nav-item"
              >
                <i [class]="item.icon"></i>
                <span>{{ item.label }}</span>
              </a>
            </section>
          </nav>
        </div>

        <div class="sidebar-profile">
          <div class="profile-row">
            <div class="avatar">{{ initials }}</div>
            <div class="profile-meta">
              <div class="profile-name">{{ currentUser?.name || "Guest User" }}</div>
              <div class="badge" [ngClass]="roleBadgeClass">{{ currentUser?.role || "admin" }}</div>
            </div>
            <button class="icon-button" type="button" (click)="logout()">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </div>
      </aside>

      <div class="workspace-shell">
        <header class="topbar">
          <div>
            <div class="topbar-breadcrumb">Mall Management Console / {{ currentPageTitle }}</div>
            <h1>{{ currentPageTitle }}</h1>
          </div>

          <div class="topbar-actions">
            <button class="icon-button" type="button">
              <i class="pi pi-search"></i>
            </button>

            <button class="icon-button notification-button" type="button">
              <i class="pi pi-bell"></i>
              <span class="notification-dot">3</span>
            </button>

            <div class="topbar-divider"></div>

            <div class="topbar-user">
              <div class="avatar">{{ initials }}</div>
              <div>
                <div class="profile-name">{{ currentUser?.name || "Guest User" }}</div>
                <div class="user-role-row">
                  <span class="badge" [ngClass]="roleBadgeClass">{{ currentUser?.role || "admin" }}</span>
                  <i class="pi pi-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main class="page-content-shell">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        background: var(--bg-app);
      }

      .sidebar {
        background: var(--bg-sidebar);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100vh;
        position: sticky;
        top: 0;
      }

      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 20px;
      }

      .brand-mark {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: var(--teal);
        color: #042f2e;
        display: grid;
        place-items: center;
        font-size: 0.85rem;
        font-weight: 800;
      }

      .brand-name {
        font-weight: 700;
        color: #ffffff;
      }

      .mall-subtitle {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
      }

      .sidebar-divider,
      .topbar-divider {
        height: 1px;
        background: var(--border);
      }

      .nav-groups {
        padding: 1rem 0.85rem 1.25rem;
        display: grid;
        gap: 1.25rem;
      }

      .nav-group {
        display: grid;
        gap: 0.3rem;
      }

      .nav-label {
        padding: 0 0.9rem 0.45rem;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        min-height: 42px;
        padding: 0.72rem 0.9rem;
        color: var(--text-secondary);
        border-left: 3px solid transparent;
        border-radius: 0 12px 12px 0;
        transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
      }

      .nav-item i {
        color: inherit;
        font-size: 18px;
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.03);
        color: #d1d5db;
      }

      .nav-item.active {
        background: rgba(20, 184, 166, 0.06);
        color: var(--teal);
        border-left-color: var(--teal);
      }

      .sidebar-profile {
        padding: 1rem;
        border-top: 1px solid var(--border);
      }

      .profile-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 0.75rem;
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        background: rgba(20, 184, 166, 0.18);
        color: #7dd3fc;
        display: grid;
        place-items: center;
        font-weight: 700;
      }

      .profile-meta {
        display: grid;
        gap: 0.3rem;
      }

      .profile-name {
        font-size: 0.92rem;
        font-weight: 600;
        color: #f9fafb;
      }

      .workspace-shell {
        min-width: 0;
        display: grid;
        grid-template-rows: 64px minmax(0, 1fr);
      }

      .topbar {
        background: var(--bg-panel);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0 24px;
      }

      .topbar h1 {
        margin: 0.15rem 0 0;
        font-size: 1.35rem;
      }

      .topbar-breadcrumb {
        color: var(--text-secondary);
        font-size: 0.78rem;
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .notification-button {
        position: relative;
      }

      .notification-dot {
        position: absolute;
        top: -5px;
        right: -5px;
        min-width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #ef4444;
        color: #ffffff;
        display: grid;
        place-items: center;
        font-size: 0.65rem;
        font-weight: 700;
      }

      .topbar-divider {
        width: 1px;
        height: 28px;
      }

      .topbar-user {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .user-role-row {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        color: var(--text-secondary);
      }

      @media (max-width: 1024px) {
        .dashboard-shell {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: static;
          min-height: auto;
        }
      }

      @media (max-width: 720px) {
        .topbar {
          height: auto;
          padding: 1rem;
          align-items: start;
          flex-direction: column;
        }

        .topbar-actions {
          width: 100%;
          justify-content: space-between;
        }
      }
    `
  ]
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.getCurrentUser();
  readonly currentRole = this.currentUser?.role ?? "admin";
  currentPageTitle = "Dashboard";

  readonly sections: NavSection[] = [
    {
      label: "OVERVIEW",
      items: [{ label: "Dashboard", link: "/dashboard", icon: "pi pi-th-large", roles: ["admin", "manager", "cashier"] }]
    },
    {
      label: "OPERATIONS",
      items: [
        { label: "Employees", link: "/employees", icon: "pi pi-users", roles: ["admin", "manager"] },
        { label: "Departments", link: "/departments", icon: "pi pi-building", roles: ["admin", "manager"] },
        { label: "Products", link: "/products", icon: "pi pi-tag", roles: ["admin", "manager"] },
        { label: "POS", link: "/pos", icon: "pi pi-shopping-cart", roles: ["admin", "cashier"] }
      ]
    },
    {
      label: "ANALYTICS",
      items: [
        { label: "Sales", link: "/sales", icon: "pi pi-chart-bar", roles: ["admin", "manager"] },
        { label: "Reports", link: "/reports", icon: "pi pi-chart-line", roles: ["admin", "manager"] },
        { label: "AI Insights", link: "/ai-insights", icon: "pi pi-sparkles", roles: ["admin", "manager"] }
      ]
    },
    {
      label: "SYSTEM",
      items: [
        { label: "Users", link: "/users", icon: "pi pi-id-card", roles: ["admin"] },
        { label: "Settings", link: "/settings", icon: "pi pi-cog", roles: ["admin", "manager", "cashier"] }
      ]
    }
  ];

  constructor() {
    this.setCurrentPageTitle(this.router.url);
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.setCurrentPageTitle((event as NavigationEnd).urlAfterRedirects);
    });
  }

  get visibleSections(): NavSection[] {
    return this.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.roles.includes(this.currentRole))
      }))
      .filter((section) => section.items.length > 0);
  }

  get initials(): string {
    const name = this.currentUser?.name || "Guest User";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  get roleBadgeClass(): string {
    return this.currentRole === "manager" ? "badge-manager" : this.currentRole === "cashier" ? "badge-cashier" : "badge-admin";
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl("/login");
  }

  private setCurrentPageTitle(url: string): void {
    if (url.includes("/employees")) {
      this.currentPageTitle = "Employees";
      return;
    }
    if (url.includes("/departments")) {
      this.currentPageTitle = "Departments";
      return;
    }
    if (url.includes("/products")) {
      this.currentPageTitle = "Products";
      return;
    }
    if (url.includes("/pos")) {
      this.currentPageTitle = "Point of Sale";
      return;
    }
    if (url.includes("/sales")) {
      this.currentPageTitle = "Sales";
      return;
    }
    if (url.includes("/reports")) {
      this.currentPageTitle = "Reports";
      return;
    }
    if (url.includes("/ai-insights")) {
      this.currentPageTitle = "AI Insights";
      return;
    }
    if (url.includes("/users")) {
      this.currentPageTitle = "Users";
      return;
    }
    if (url.includes("/settings")) {
      this.currentPageTitle = "Settings";
      return;
    }
    this.currentPageTitle = "Dashboard";
  }
}
