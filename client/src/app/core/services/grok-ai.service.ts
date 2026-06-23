import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { MallDataService } from "./mall-data.service";
import {
  GrokContextSnapshot,
  GrokInsight,
  GrokInsightPayload,
  GrokInsightResponse,
  GrokInsightType
} from "../models/grok-insight.model";
import { Department } from "../models/department.model";
import { Employee } from "../models/employee.model";
import { Product } from "../models/product.model";
import { SaleRecord } from "./mall-data.service";

interface GrokApiResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{ text?: string }>;
  }>;
}

interface GrokContextBundle {
  revenueToday: number;
  salesToday: number;
  lowStockCount: number;
  activeEmployees: number;
  stockHealth: number;
  openPosItems: number;
  departments: Department[];
  employees: Employee[];
  products: Product[];
  sales: SaleRecord[];
}

@Injectable({ providedIn: "root" })
export class GrokAIService {
  private readonly apiUrl = "https://api.x.ai/v1/responses";
  private readonly model = "grok-4.3";
  private readonly apiKeyStorageKey = "grok_api_key";

  constructor(
    private readonly http: HttpClient,
    private readonly mallData: MallDataService
  ) {}

  setApiKey(apiKey: string): void {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem(this.apiKeyStorageKey, trimmed);
    } else {
      localStorage.removeItem(this.apiKeyStorageKey);
    }
  }

  getApiKey(): string {
    return localStorage.getItem(this.apiKeyStorageKey) ?? window.__MALLOS_ENV?.XAI_API_KEY ?? "";
  }

  hasRuntimeApiKey(): boolean {
    return Boolean(window.__MALLOS_ENV?.XAI_API_KEY?.trim());
  }

  fetchInsights(payload: GrokInsightPayload = {}): Observable<GrokInsightResponse> {
    return this.loadContext().pipe(
      switchMap((context) => {
        const apiKey = this.getApiKey();
        if (!apiKey) {
          return of(this.buildMockResponse(context, payload));
        }

        return this.callGrokApi(context, payload, apiKey).pipe(
          catchError(() => of(this.buildMockResponse(context, payload)))
        );
      })
    );
  }

  private loadContext(): Observable<GrokContextBundle> {
    return forkJoin({
      summary: this.mallData.getSummary(),
      sales: this.mallData.getRecentSales(),
      departments: this.mallData.listDepartments(),
      employees: this.mallData.listEmployees({ page: 1, limit: 100 }),
      products: this.mallData.listProducts({ page: 1, limit: 100 }),
      pos: this.mallData.getPosState()
    }).pipe(
      map(({ summary, sales, departments, employees, products, pos }) => ({
        revenueToday: summary.revenueToday,
        salesToday: summary.salesToday,
        lowStockCount: summary.lowStockCount,
        activeEmployees: summary.activeEmployees,
        stockHealth: summary.stockHealth,
        openPosItems: pos.cart.length,
        departments: departments.data.items,
        employees: employees.data.items,
        products: products.data.items,
        sales
      }))
    );
  }

  private callGrokApi(context: GrokContextBundle, payload: GrokInsightPayload, apiKey: string): Observable<GrokInsightResponse> {
    const prompt = this.buildPrompt(context, payload);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    });

    return this.http
      .post<GrokApiResponse>(
        this.apiUrl,
        {
          model: this.model,
          input: [
            {
              role: "system",
              content:
                "You are Grok helping a mall operations dashboard. Return only valid JSON with an array of insights. Each insight must include title, description, type, timestamp, context, and severity."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        },
        { headers }
      )
      .pipe(map((response) => this.normalizeResponse(response, context)));
  }

  private buildPrompt(context: GrokContextBundle, payload: GrokInsightPayload): string {
    return JSON.stringify(
      {
        task: "Generate actionable MallOS insights",
        filters: payload,
        mallContext: {
          revenueToday: context.revenueToday,
          salesToday: context.salesToday,
          lowStockCount: context.lowStockCount,
          activeEmployees: context.activeEmployees,
          stockHealth: context.stockHealth,
          openPosItems: context.openPosItems,
          departments: context.departments.slice(0, 5).map((department) => ({
            name: department.name,
            status: department.status,
            manager: department.manager
          })),
          topEmployees: context.employees.slice(0, 5).map((employee) => ({
            name: employee.fullName,
            department: employee.department,
            status: employee.status
          })),
          recentSales: context.sales.slice(0, 5).map((sale) => ({
            orderId: sale.orderId,
            department: sale.department,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            time: sale.time
          })),
          lowStockProducts: context.products
            .filter((product) => (product.stockQuantity ?? 0) <= (product.reorderLevel ?? 0))
            .slice(0, 5)
            .map((product) => ({
              name: product.name,
              department: product.department,
              stockQuantity: product.stockQuantity,
              reorderLevel: product.reorderLevel
            }))
        },
        responseShape: [
          {
            title: "string",
            description: "string",
            type: "trend | anomaly | recommendation",
            timestamp: "ISO-8601 string",
            context: ["optional context labels"],
            severity: "low | medium | high"
          }
        ],
        rules: [
          "Return JSON only.",
          "Make anomalies urgent when low stock or revenue drops are severe.",
          "Tie at least one insight to POS, Reports, Sales, Employees, and Departments context when relevant."
        ]
      },
      null,
      2
    );
  }

  private normalizeResponse(response: GrokApiResponse, context: GrokContextBundle): GrokInsightResponse {
    const text = this.extractText(response);
    const parsed = this.safeParseInsights(text);
    const insights = parsed.length ? parsed : this.buildMockInsights(context, {});
    return {
      source: "grok",
      generatedAt: new Date().toISOString(),
      context: this.summarizeContext(context),
      insights
    };
  }

  private extractText(response: GrokApiResponse): string {
    if (response.output_text) {
      return response.output_text;
    }

    const text = response.output?.[0]?.content?.map((part) => part.text ?? "").join("\n") ?? "";
    return text;
  }

  private safeParseInsights(text: string): GrokInsight[] {
    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]");
      const candidate = jsonStart >= 0 && jsonEnd >= jsonStart ? text.slice(jsonStart, jsonEnd + 1) : text;
      const parsed = JSON.parse(candidate) as Partial<GrokInsight>[];
      return parsed
        .filter((item) => item && item.title && item.description && item.type && item.timestamp)
        .map((item, index) => ({
          id: item.id ?? `grok-${index + 1}`,
          title: item.title ?? "Insight",
          description: item.description ?? "",
          type: this.normalizeType(item.type),
          timestamp: item.timestamp ?? new Date().toISOString(),
          context: item.context ?? [],
          severity: item.severity ?? "medium"
        }));
    } catch {
      return [];
    }
  }

  private normalizeType(value: unknown): GrokInsightType {
    if (value === "trend" || value === "anomaly" || value === "recommendation") {
      return value;
    }
    return "recommendation";
  }

  private buildMockResponse(context: GrokContextBundle, payload: GrokInsightPayload): GrokInsightResponse {
    return {
      source: "mock",
      generatedAt: new Date().toISOString(),
      context: this.summarizeContext(context),
      insights: this.buildMockInsights(context, payload)
    };
  }

  private buildMockInsights(context: GrokContextBundle, payload: GrokInsightPayload): GrokInsight[] {
    const lowStockCount = context.lowStockCount;
    const salesTrend = context.salesToday >= 3 ? "Sales are moving steadily across the mall." : "Sales volume is lighter than expected today.";
    const employeeTrend =
      context.activeEmployees >= 3 ? "Staffing looks balanced across active departments." : "Shift coverage needs a review in a few departments.";
    const departmentLabels = context.departments.slice(0, 3).map((department) => department.name);
    const query = (payload.query ?? "").trim().toLowerCase();
    const type = payload.type ?? "all";

    const insights: GrokInsight[] = [
      {
        id: "trend-sales",
        title: "Sales momentum is stable",
        description: `${salesTrend} Revenue today is ${this.formatCurrency(context.revenueToday)} with ${context.salesToday} completed sales.`,
        type: "trend",
        timestamp: this.nowLabel(),
        context: ["Sales", "Reports", "POS"],
        severity: "low"
      },
      {
        id: "anomaly-stock",
        title: lowStockCount > 0 ? "Inventory anomaly detected" : "Inventory levels are healthy",
        description:
          lowStockCount > 0
            ? `${lowStockCount} products are at or below reorder level. Review the low-stock departments immediately.`
            : "No low-stock anomalies are currently visible in the mock mall data.",
        type: "anomaly",
        timestamp: this.nowLabel(),
        context: ["Departments", "Products", "Reports"],
        severity: lowStockCount > 2 ? "high" : "medium"
      },
      {
        id: "recommendation-shifts",
        title: "Optimize frontline coverage",
        description: employeeTrend,
        type: "recommendation",
        timestamp: this.nowLabel(),
        context: ["Employees", "Departments"],
        severity: "low"
      },
      {
        id: "recommendation-pos",
        title: "Use POS bundles for faster checkout",
        description:
          context.openPosItems > 0
            ? "There is already an active cart in POS. Suggest upsells based on the current basket."
            : "Consider promotional bundles in POS to improve average basket size.",
        type: "recommendation",
        timestamp: this.nowLabel(),
        context: ["POS", "Sales"],
        severity: "low"
      },
      {
        id: "trend-departments",
        title: "Department health remains mixed",
        description: `Key departments under watch: ${departmentLabels.join(", ") || "none"}. Track these in Reports and the department roster.`,
        type: "trend",
        timestamp: this.nowLabel(),
        context: ["Departments", "Reports"],
        severity: "low"
      }
    ];

    return insights.filter((insight) => {
      const matchesType = type === "all" || insight.type === type;
      const matchesQuery =
        !query ||
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query) ||
        insight.context?.some((item) => item.toLowerCase().includes(query));
      return matchesType && matchesQuery;
    });
  }

  private summarizeContext(context: GrokContextBundle): GrokContextSnapshot {
    return {
      revenueToday: context.revenueToday,
      salesToday: context.salesToday,
      lowStockCount: context.lowStockCount,
      activeEmployees: context.activeEmployees,
      stockHealth: context.stockHealth,
      openPosItems: context.openPosItems,
      departments: context.departments.length,
      recentSales: context.sales.length
    };
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  private nowLabel(): string {
    return new Date().toISOString();
  }
}
