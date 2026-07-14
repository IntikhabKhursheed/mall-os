import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, HostListener, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { MallDataService, NotificationItem } from "../../core/services/mall-data.service";

type NavGroup = "Overview" | "Operations" | "Analytics" | "System";

@Component({
  selector: "app-dashboard-layout",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly mallData = inject(MallDataService);
  private readonly router = inject(Router);
  private readonly currentRoleValue = this.authService.getCurrentUser()?.role ?? "admin";

  readonly groups: NavGroup[] = ["Overview", "Operations", "Analytics", "System"];

  currentUserName = this.authService.getCurrentUser()?.name ?? "Guest";
  theme: "light" | "dark" = "light";
  sidebarOpen = true;
  isMobile = window.innerWidth <= 980;
  showNotifications = false;
  globalSearch = "";
  notifications: NotificationItem[] = [];
  searchMatches: Array<{ label: string; link: string; icon: string }> = [];
  currentRouteLabel = "Dashboard";

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

  ngOnInit(): void {
    this.loadNotifications();
    this.updateSearchMatches();
    this.syncRouteLabel(this.router.url);

    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.syncRouteLabel(event.urlAfterRedirects);
      if (this.isMobile) {
        this.sidebarOpen = false;
      }
      this.showNotifications = false;
    });
  }

  @HostListener("window:resize")
  onResize(): void {
    this.isMobile = window.innerWidth <= 980;
    this.sidebarOpen = !this.isMobile;
  }

  @HostListener("document:click")
  closePanels(): void {
    this.showNotifications = false;
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  handleNavClick(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleTheme(): void {
    this.applyTheme(this.theme === "light" ? "dark" : "light");
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  loadNotifications(): void {
    this.mallData.getNotifications().subscribe((items) => (this.notifications = items));
  }

  dismissNotification(id: string): void {
    this.mallData.dismissNotification(id).subscribe((items) => {
      this.notifications = items;
    });
  }

  clearAllNotifications(): void {
    const ids = this.notifications.map((note) => note.id);
    ids.forEach((id) => this.mallData.dismissNotification(id).subscribe());
    this.notifications = [];
  }

  updateSearchMatches(): void {
    const query = this.globalSearch.trim().toLowerCase();
    this.searchMatches = !query
      ? []
      : this.navItems
          .filter((item) => item.roles.includes(this.currentRoleValue) && item.label.toLowerCase().includes(query))
          .slice(0, 5);
  }

  openFirstMatch(): void {
    if (this.searchMatches.length) {
      this.goTo(this.searchMatches[0].link);
    }
  }

  goTo(link: string): void {
    void this.router.navigateByUrl(link);
    this.globalSearch = "";
    this.searchMatches = [];
    this.showNotifications = false;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl("/login");
  }

  private syncRouteLabel(url: string): void {
    const match = this.navItems.find((item) => url.startsWith(item.link));
    this.currentRouteLabel = match?.label ?? "Dashboard";
  }

  private applyTheme(theme: "light" | "dark"): void {
    this.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mallos_theme", theme);
    this.mallData.updateSettings({ theme }).subscribe();
  }
}
