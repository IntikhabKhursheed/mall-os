import { CommonModule, NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-page-header",
  standalone: true,
  imports: [CommonModule, NgIf],
  template: `
    <header class="page-header surface-panel">
      <div class="page-header-copy">
        <div *ngIf="eyebrow" class="eyebrow">{{ eyebrow }}</div>
        <h1>{{ title }}</h1>
        <p *ngIf="subtitle" class="muted">{{ subtitle }}</p>
      </div>

      <div class="page-header-actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </header>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.15rem 1.35rem;
      }

      .page-header-copy {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
      }

      .page-header-copy p {
        margin: 0;
        max-width: 72ch;
      }

      .page-header-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-left: auto;
      }

      @media (max-width: 720px) {
        .page-header {
          flex-direction: column;
        }

        .page-header-actions {
          width: 100%;
          justify-content: flex-start;
          margin-left: 0;
        }
      }
    `
  ]
})
export class PageHeaderComponent {
  @Input() eyebrow = "";
  @Input() title = "";
  @Input() subtitle = "";
}
