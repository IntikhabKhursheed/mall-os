import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();
  const roles = (route.data["roles"] as string[] | undefined) ?? [];

  if (!user) {
    return router.createUrlTree(["/login"]);
  }

  if (user.role === "admin" || roles.length === 0 || roles.includes(user.role)) {
    return true;
  }

  const fallback =
    user.role === "manager" ? "/dashboard/manager" : user.role === "cashier" ? "/pos" : "/dashboard/admin";
  return router.createUrlTree([fallback]);
};
