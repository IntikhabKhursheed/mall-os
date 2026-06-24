import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { MallDataService } from "../core/services/mall-data.service";
import { GrokAIService } from "../core/services/grok-ai.service";
import { GrokInsight, GrokInsightType } from "../core/models/grok-insight.model";

type InsightFilter = GrokInsightType | "all";

@Component({
  selector: "app-ai-insights",
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="Grok AI"
      title="AI insights"
      subtitle="Grok scans MallOS activity and turns POS, sales, employee, department, and reporting data into actionable guidance."
    >
      <div actions class="actions-bar">
        <button type="button" class="secondary" (click)="refresh()">Refresh</button>
      </div>
    </app-page-header>

    <section class="surface-panel toolbar-panel">
      <div class="toolbar-grid">
        <label class="search-field">
          <span class="field-label">Search</span>
          <input
            [(ngModel)]="searchTerm"
            (ngModelChange)="refresh()"
            type="search"
            placeholder="Search by keyword, department, or action"
          />
        </label>

        <label class="search-field">
          <span class="field-label">Type</span>
          <select [(ngModel)]="typeFilter" (ngModelChange)="refresh()">
            <option value="all">All types</option>
            <option value="trend">Trend</option>
            <option value="anomaly">Anomaly</option>
            <option value="recommendation">Recommendation</option>
          </select>
        </label>
      </div>
    </section>

    <section class="context-grid">
      <article class="surface-panel context-card" *ngFor="let item of contextCards">
        <div class="eyebrow">{{ item.label }}</div>
        <strong>{{ item.value }}</strong>
        <p class="muted">{{ item.detail }}</p>
      </article>
    </section>

    <section class="surface-panel status-panel">
      <div>
        <div class="eyebrow">Connection</div>
        <h3>{{ sourceLabel }}</h3>
        <p class="muted">Last refreshed: {{ lastRefreshed || "Never" }}</p>
      </div>

      <div class="status-actions">
        <span class="badge" [ngClass]="sourceLabel.includes('Gemini') ? 'healthy' : 'low_stock'">{{ sourceLabel }}</span>
        <span class="badge badge-default">{{ visibleInsights.length }} insights</span>
      </div>
    </section>

    <section class="insights-grid">
      <article class="insight-card" *ngFor="let insight of visibleInsights">
        <div class="insight-head">
          <div>
            <div class="eyebrow">{{ insight.type }}</div>
            <h3>{{ insight.title }}</h3>
          </div>
          <span class="insight-badge" [ngClass]="insight.type">{{ insight.type }}</span>
        </div>

        <p>{{ insight.description }}</p>

        <div class="insight-footer">
          <div class="context-tags">
            <span *ngFor="let tag of insight.context || []">{{ tag }}</span>
          </div>
          <span class="muted">{{ formatTimestamp(insight.timestamp) }}</span>
        </div>
      </article>
    </section>

    <section class="surface-panel summary-panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">AI summary</div>
          <h3>Recommended next steps</h3>
        </div>
      </div>

      <ul class="summary-list">
        <li *ngFor="let line of summaryLines">{{ line }}</li>
      </ul>

      <div *ngIf="alertMessage" class="alert-box">
        {{ alertMessage }}
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
      }

      .actions-bar {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .toolbar-panel,
      .summary-panel,
      .status-panel {
        padding: 1rem;
      }

      .toolbar-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .search-field {
        display: grid;
        gap: 0.35rem;
      }

      .field-label {
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .context-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .context-card,
      .insight-card {
        padding: 1rem;
      }

      .context-card strong {
        font-size: 1.25rem;
        margin: 0.15rem 0 0.35rem;
      }

      .context-card p {
        margin: 0;
      }

      .status-panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .status-actions {
        display: flex;
        gap: 0.65rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .insights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 0.85rem;
      }

      .insight-card {
        display: grid;
        gap: 0.85rem;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
        background: var(--bg-panel);
        box-shadow: var(--shadow-md);
      }

      .insight-head {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: flex-start;
      }

      .insight-head h3,
      .insight-card p {
        margin: 0;
      }

      .insight-card p {
        color: var(--text-secondary);
        line-height: 1.65;
      }

      .insight-badge {
        min-width: 88px;
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
        text-align: center;
        text-transform: capitalize;
      }

      .insight-badge.trend {
        background: rgba(34, 197, 94, 0.15);
        color: #166534;
      }

      .insight-badge.anomaly {
        background: rgba(239, 68, 68, 0.14);
        color: #991b1b;
      }

      .insight-badge.recommendation {
        background: rgba(59, 130, 246, 0.14);
        color: #1d4ed8;
      }

      .insight-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .context-tags {
        display: flex;
        gap: 0.45rem;
        flex-wrap: wrap;
      }

      .context-tags span {
        padding: 0.25rem 0.55rem;
        border-radius: 999px;
        background: var(--bg-panel-muted);
        border: 1px solid var(--border);
        font-size: 0.78rem;
        color: var(--text-secondary);
      }

      .summary-list {
        margin: 0;
        padding-left: 1.2rem;
        display: grid;
        gap: 0.55rem;
      }

      .alert-box {
        margin-top: 1rem;
        padding: 0.9rem 1rem;
        border-radius: 14px;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #991b1b;
      }

      @media (max-width: 980px) {
        .toolbar-grid,
        .context-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 720px) {
        .toolbar-grid,
        .context-grid {
          grid-template-columns: 1fr;
        }

        .status-panel,
        .insight-head,
        .insight-footer {
          flex-direction: column;
          align-items: flex-start;
        }

        .actions-bar {
          justify-content: flex-start;
        }
      }
    `
  ]
})
export class AiInsightsComponent implements OnInit {
  private readonly grokAI = inject(GrokAIService);
  private readonly mallData = inject(MallDataService);

  searchTerm = "";
  typeFilter: InsightFilter = "all";
  sourceLabel = "Loading AI insights...";
  lastRefreshed = "";
  insights: GrokInsight[] = [];
  visibleInsights: GrokInsight[] = [];
  summaryLines: string[] = [];
  alertMessage = "";
  loading = false;
  contextCards: Array<{ label: string; value: string; detail: string }> = [
    { label: "POS", value: "...", detail: "Loading cart and checkout context." },
    { label: "Reports", value: "...", detail: "Loading reporting context." },
    { label: "Sales", value: "...", detail: "Loading sales context." },
    { label: "Employees", value: "...", detail: "Loading staffing context." }
  ];

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.grokAI.fetchInsights({ query: this.searchTerm, type: this.typeFilter }).subscribe({
      next: (result) => {
        this.loading = false;
        this.insights = result.insights;
        this.visibleInsights = result.insights;
        this.sourceLabel = result.source === "gemini" ? "Live Gemini API" : "Mock insights";
        this.lastRefreshed = this.formatTimestamp(result.generatedAt);
        this.contextCards = [
          {
            label: "POS",
            value: `${result.context.openPosItems} items`,
            detail: "Active basket items currently in checkout."
          },
          {
            label: "Reports",
            value: `${result.context.stockHealth}%`,
            detail: "Healthy stock ratio feeding reports."
          },
          {
            label: "Sales",
            value: `${result.context.salesToday}`,
            detail: "Completed sales captured in the current session."
          },
          {
            label: "Employees",
            value: `${result.context.activeEmployees}`,
            detail: "Active team members available on shift."
          },
          {
            label: "Departments",
            value: `${result.context.departments}`,
            detail: "Departments feeding recommendation context."
          }
        ];
        this.summaryLines = [
          `${result.insights.length} insights generated for ${this.typeFilter === "all" ? "all types" : this.typeFilter}.`,
          this.searchTerm.trim() ? `Filtered by "${this.searchTerm.trim()}".` : "No keyword filter applied.",
          `Grok context includes POS, Reports, Sales, Employees, and Departments data.`
        ];
        this.alertMessage = "";
        const criticalAnomaly = result.insights.find((item) => item.type === "anomaly" && /critical|urgent|out of stock/i.test(item.description));
        if (criticalAnomaly) {
          this.alertMessage = `Critical anomaly: ${criticalAnomaly.title}`;
          this.mallData
            .pushNotification({
              title: "Critical AI anomaly",
              detail: criticalAnomaly.description,
              tone: "danger",
              time: "just now"
            })
            .subscribe();
        }
      },
      error: () => {
        this.loading = false;
        this.alertMessage = "Unable to load insights right now.";
      }
    });
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime())
      ? timestamp
      : date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
  }
}
