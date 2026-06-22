import { CommonModule, NgFor } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { MallDataService, ReportCard } from "../core/services/mall-data.service";

type ReportTab = "overview" | "sales" | "inventory" | "staff";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="Management reports"
      subtitle="Review operational reports, performance summaries, and management exports."
    >
      <div actions>
        <button type="button" class="secondary" (click)="setTab('overview')">Overview</button>
        <button type="button" class="secondary" (click)="setTab('sales')">Sales</button>
        <button type="button" class="secondary" (click)="setTab('inventory')">Inventory</button>
        <button type="button" class="secondary" (click)="setTab('staff')">Staff</button>
      </div>
    </app-page-header>

    <section class="toolbar surface-panel">
      <input [(ngModel)]="searchTerm" (ngModelChange)="loadData()" type="search" placeholder="Search reports or summary text" />
    </section>

    <section class="tab-strip surface-panel">
      <button type="button" class="tab" [class.active]="activeTab === 'overview'" (click)="setTab('overview')">Overview</button>
      <button type="button" class="tab" [class.active]="activeTab === 'sales'" (click)="setTab('sales')">Sales</button>
      <button type="button" class="tab" [class.active]="activeTab === 'inventory'" (click)="setTab('inventory')">Inventory</button>
      <button type="button" class="tab" [class.active]="activeTab === 'staff'" (click)="setTab('staff')">Staff</button>
    </section>

    <section class="grid-cards">
      <article class="surface-panel metric-card" *ngFor="let card of filteredCards">
        <div class="eyebrow">{{ activeTab | titlecase }}</div>
        <div class="report-head">
          <h3>{{ card.title }}</h3>
          <span class="badge" [ngClass]="card.tone">{{ card.badge }}</span>
        </div>
        <p class="muted">{{ card.detail }}</p>
        <span class="muted">{{ card.meta }}</span>
      </article>
    </section>

    <section class="surface-panel metric-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">Exports</div>
          <h3>{{ activeTab | titlecase }} snapshot</h3>
        </div>
      </div>
      <div class="export-list">
        <div class="export-row" *ngFor="let line of summaryLines">
          <strong>{{ line.label }}</strong>
          <span class="muted">{{ line.value }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
      }

      .toolbar {
        padding: 1rem;
      }

      .tab-strip {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        padding: 0.75rem;
      }

      .tab {
        min-height: 40px;
        padding: 0.6rem 0.9rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: var(--bg-panel);
        color: var(--text-secondary);
      }

      .tab.active {
        background: color-mix(in srgb, var(--accent) 14%, var(--bg-panel) 86%);
        color: var(--accent);
        border-color: color-mix(in srgb, var(--accent) 24%, transparent);
      }

      .report-head {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: start;
      }

      .metric-card {
        padding: 1rem;
      }

      .export-list {
        display: grid;
        gap: 0.75rem;
      }

      .export-row {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.85rem;
        border-radius: 14px;
        background: var(--bg-panel-muted);
      }

      @media (max-width: 720px) {
        .report-head,
        .export-row {
          flex-direction: column;
        }
      }
    `
  ]
})
export class ReportsComponent implements OnInit {
  private readonly mallData = inject(MallDataService);

  activeTab: ReportTab = "overview";
  searchTerm = "";
  cards: ReportCard[] = [];
  filteredCards: ReportCard[] = [];
  summaryLines: Array<{ label: string; value: string }> = [];

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: ReportTab): void {
    this.activeTab = tab;
    this.loadData();
  }

  loadData(): void {
    this.mallData.getReportCards(this.searchTerm).subscribe((cards) => {
      this.cards = cards;
      this.filteredCards = cards.filter((card) => {
        if (this.activeTab === "overview") {
          return true;
        }
        if (this.activeTab === "sales") {
          return card.title.toLowerCase().includes("revenue") || card.detail.toLowerCase().includes("sales");
        }
        if (this.activeTab === "inventory") {
          return card.title.toLowerCase().includes("inventory") || card.detail.toLowerCase().includes("stock");
        }
        return card.title.toLowerCase().includes("staff") || card.detail.toLowerCase().includes("shift");
      });
      this.summaryLines = [
        { label: "Visible cards", value: String(this.filteredCards.length) },
        { label: "Search term", value: this.searchTerm.trim() || "None" },
        { label: "Active tab", value: this.activeTab }
      ];
    });
  }
}
