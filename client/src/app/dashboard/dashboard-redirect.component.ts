import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../core/services/auth.service";

@Component({
  selector: "app-dashboard-redirect",
  standalone: true,
  template: ``
})
export class DashboardRedirectComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    const user = this.authService.getCurrentUser();
    const target =
      user?.role === "manager"
        ? "/dashboard/manager"
        : user?.role === "cashier"
          ? "/pos"
          : "/dashboard/admin";

    queueMicrotask(() => {
      void this.router.navigateByUrl(target);
    });
  }
}
