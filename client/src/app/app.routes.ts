import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { roleGuard } from "./core/guards/role.guard";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { DashboardLayoutComponent } from "./layouts/dashboard-layout/dashboard-layout.component";
import { LoginComponent } from "./auth/login/login.component";
import { AdminDashboardComponent } from "./dashboard/admin-dashboard/admin-dashboard.component";
import { ManagerDashboardComponent } from "./dashboard/manager-dashboard/manager-dashboard.component";
import { CashierDashboardComponent } from "./dashboard/cashier-dashboard/cashier-dashboard.component";
import { DashboardRedirectComponent } from "./dashboard/dashboard-redirect.component";
import { EmployeesComponent } from "./employees/employees.component";
import { DepartmentsComponent } from "./departments/departments.component";
import { ProductsComponent } from "./products/products.component";
import { PosComponent } from "./pos/pos.component";
import { SalesComponent } from "./sales/sales.component";
import { ReportsComponent } from "./reports/reports.component";
import { AiInsightsComponent } from "./ai-insights/ai-insights.component";
import { UsersComponent } from "./users/users.component";
import { SettingsComponent } from "./settings/settings.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "login",
    component: AuthLayoutComponent,
    children: [{ path: "", component: LoginComponent }]
  },
  {
    path: "",
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "dashboard",
        component: DashboardRedirectComponent
      },
      {
        path: "dashboard/admin",
        component: AdminDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin"] }
      },
      {
        path: "dashboard/manager",
        component: ManagerDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "manager"] }
      },
      {
        path: "dashboard/cashier",
        component: CashierDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "cashier"] }
      },
      {
        path: "employees",
        component: EmployeesComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "manager"] }
      },
      {
        path: "departments",
        component: DepartmentsComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "manager"] }
      },
      {
        path: "products",
        component: ProductsComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "manager"] }
      },
      {
        path: "pos",
        component: PosComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "cashier"] }
      },
      {
        path: "sales",
        component: SalesComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "manager"] }
      },
      {
        path: "reports",
        component: ReportsComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "manager"] }
      },
      {
        path: "ai-insights",
        component: AiInsightsComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "manager"] }
      },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin"] }
      },
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [roleGuard],
        data: { roles: ["admin", "manager", "cashier"] }
      }
    ]
  },
  {
    path: "**",
    redirectTo: "login"
  }
];
