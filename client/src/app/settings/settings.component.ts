import { CommonModule, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { AppSettings, MallDataService } from "../core/services/mall-data.service";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIf, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="System"
      title="Workspace settings"
      subtitle="Adjust workspace preferences, branding, and operational defaults."
    >
      <div actions>
        <button type="button" class="secondary" (click)="reload()">Reload</button>
      </div>
    </app-page-header>

    <section class="surface-panel metric-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">Overview</div>
          <h3>Configuration options</h3>
        </div>
      </div>

      <form class="settings-grid" [formGroup]="form" (ngSubmit)="saveSettings()">
        <label>
          Store name
          <input formControlName="storeName" type="text" />
        </label>
        <label>
          Currency
          <input formControlName="currency" type="text" />
        </label>
        <label>
          Tax rate
          <input formControlName="taxRate" type="number" min="0" step="0.01" />
        </label>
        <label class="toggle-row">
          <input formControlName="notificationsEnabled" type="checkbox" />
          Notifications enabled
        </label>
        <label class="toggle-row">
          <input formControlName="autoRefresh" type="checkbox" />
          Auto refresh dashboards
        </label>
        <div class="actions">
          <button type="submit" class="primary" [disabled]="form.invalid">Save Settings</button>
          <button type="button" class="secondary" (click)="resetDefaults()">Reset Defaults</button>
        </div>
      </form>

      <div *ngIf="saved" class="saved-box">Settings saved and reflected across the mock dashboard state.</div>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
      }

      .metric-card {
        padding: 1rem;
      }

      .settings-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .toggle-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .actions {
        grid-column: span 2;
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .saved-box {
        margin-top: 1rem;
        padding: 0.9rem 1rem;
        border-radius: 14px;
        background: var(--bg-success-soft);
        color: var(--success);
      }

      @media (max-width: 720px) {
        .settings-grid,
        .actions {
          grid-template-columns: 1fr;
          grid-column: auto;
        }
      }
    `
  ]
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mallData = inject(MallDataService);

  saved = false;
  form = this.fb.group({
    storeName: ["", [Validators.required]],
    currency: ["PKR", [Validators.required]],
    taxRate: [0.13, [Validators.required, Validators.min(0)]],
    notificationsEnabled: [true],
    autoRefresh: [true]
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.mallData.getSettings().subscribe((settings) => {
      this.form.reset(settings);
    });
  }

  saveSettings(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.mallData.updateSettings(this.form.getRawValue() as AppSettings).subscribe((settings) => {
      this.form.reset(settings);
      this.saved = true;
      setTimeout(() => (this.saved = false), 2200);
    });
  }

  resetDefaults(): void {
    this.form.reset({
      storeName: "Grand Central Mall",
      currency: "PKR",
      taxRate: 0.13,
      notificationsEnabled: true,
      autoRefresh: true
    });
  }
}
