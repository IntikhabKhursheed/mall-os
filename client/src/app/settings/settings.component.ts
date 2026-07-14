import { CommonModule, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { AppSettings, MallDataService } from "../core/services/mall-data.service";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIf, PageHeaderComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
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
