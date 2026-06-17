import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-auth-layout",
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="page-shell auth-layout">
      <router-outlet />
    </div>
  `,
  styles: [
    `
      .auth-layout {
        display: grid;
        place-items: center;
        padding: 2rem;
      }
    `
  ]
})
export class AuthLayoutComponent {}
