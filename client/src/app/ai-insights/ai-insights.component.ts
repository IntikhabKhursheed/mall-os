import { CommonModule, NgFor } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { InsightCard, MallDataService } from "../core/services/mall-data.service";

type InsightTab = "forecast" | "alerts" | "recommendations";

@Component({
  selector: "app-ai-insights",
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Analytics"
      title="Predictive insights"
      subtitle="Surface trends, anomalies, and suggested actions from store data."
    >
      <div actions>
        <button type="button" class="secondary" (click)="setTab('forecast')">Forecast</button>
        <button type="button" class="secondary" (click)="setTab('alerts')">Alerts</button>
        <button type="button" class="secondary" (click)="setTab('recommendations')">Recommendations</button>
      </div>
    </app-page-header>

    <section class="toolbar surface-panel">
      <input [(ngModel)]="searchTerm" (ngModelChange)="loadData()" type="search" placeholder="Search insights or suggested actions" />
    </section>

    <section class="tab-strip surface-panel">
      <button type="button" class="tab" [class.active]="activeTab === 'forecast'" (click)="setTab('forecast')">Forecast</button>
      <button type="button" class="tab" [class.active]="activeTab === 'alerts'" (click)="setTab('alerts')">Alerts</button>
      <button type="button" class="tab" [class.active]="activeTab === 'recommendations'" (click)="setTab('recommendations')">Recommendations</button>
    </section>

    <section class="grid-cards">
      <article class="surface-panel metric-card" *ngFor="let card of filteredCards">
        <div class="eyebrow">{{ activeTab | titlecase }}</div>
        <div class="report-head">
          <h3>{{ card.title }}</h3>
          <span class="badge" [ngClass]="card.tone">{{ card.action }}</span>
        </div>
        <p class="muted">{{ card.detail }}</p>
      </article>
    </section>

    <section class="surface-panel metric-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">AI summary</div>
          <h3>Recommended next steps</h3>
        </div>
      </div>
      <ul class="recommendation-list">
        <li *ngFor="let line of summaryLines">{{ line }}</li>
      </ul>
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

      .recommendation-list {
        margin: 0;
        padding-left: 1.2rem;
        display: grid;
        gap: 0.6rem;
      }

      @media (max-width: 720px) {
        .report-head {
          flex-direction: column;
        }
      }
    `
  ]
})
export class AiInsightsComponent implements OnInit {
  private readonly mallData = inject(MallDataService);

  activeTab: InsightTab = "forecast";
  searchTerm = "";
  cards: InsightCard[] = [];
  filteredCards: InsightCard[] = [];
  summaryLines: string[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: InsightTab): void {
    this.activeTab = tab;
    this.loadData();
  }

  loadData(): void {
    this.mallData.getInsightCards(this.searchTerm).subscribe((cards) => {
      this.cards = cards;
      this.filteredCards = cards.filter((card) => {
        if (this.activeTab === "forecast") {
          return card.title.toLowerCase().includes("demand") || card.detail.toLowerCase().includes("trend");
        }
        if (this.activeTab === "alerts") {
          return card.tone === "warning";
        }
        return true;
      });
      this.summaryLines = [
        `${this.filteredCards.length} insight cards visible`,
        this.searchTerm.trim() ? `Filtered by "${this.searchTerm.trim()}"` : "Showing all mock insight data",
        `Top action: ${this.filteredCards[0]?.action ?? "Monitor daily trends"}`
      ];
    });
  }
}
