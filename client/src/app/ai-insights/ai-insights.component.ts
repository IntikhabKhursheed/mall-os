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
  templateUrl: './ai-insights.component.html',
  styleUrl: './ai-insights.component.scss'
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
