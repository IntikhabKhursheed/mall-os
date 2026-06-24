import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { MallDataService, SaleRecord } from "./mall-data.service";
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
import { ApiResponse } from "../models/api-response.model";
import { API_BASE_URL } from "./api.service";

interface AiApiResponse {
  insights: Array<{
    title: string;
    description: string;
    type: GrokInsightType;
    timestamp: string;
  }>;
  source: "gemini" | "mock";
  generatedAt: string;
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
  constructor(
    private readonly http: HttpClient,
    private readonly mallData: MallDataService
  ) {}

  fetchInsights(payload: GrokInsightPayload = {}): Observable<GrokInsightResponse> {
    return this.loadContext().pipe(
      switchMap((context) =>
        this.http
          .post<ApiResponse<AiApiResponse>>(`${API_BASE_URL}/ai/insights`, {
            searchTerm: payload.query ?? "",
            insightType: payload.type ?? "all",
            mallContext: this.buildMallContext(context, payload)
          })
          .pipe(
            map((response) => this.normalizeResponse(response.data, context)),
            catchError(() => of(this.buildMockResponse(context, payload)))
          )
      )
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

  private buildMallContext(context: GrokContextBundle, payload: GrokInsightPayload): Record<string, unknown> {
    return {
      query: payload.query ?? "",
      type: payload.type ?? "all",
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
    };
  }

  private normalizeResponse(response: AiApiResponse, context: GrokContextBundle): GrokInsightResponse {
    const insights = (response.insights || []).map((item, index) => ({
      id: `ai-${index + 1}`,
      title: item.title,
      description: item.description,
      type: item.type,
      timestamp: item.timestamp
    }));

    return {
      source: response.source,
      generatedAt: response.generatedAt,
      context: this.summarizeContext(context),
      insights
    };
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
    const query = (payload.query ?? "").trim().toLowerCase();
    const type = payload.type ?? "all";
    const departmentLabels = context.departments.slice(0, 3).map((department) => department.name);

    const insights: GrokInsight[] = [
      {
        id: "trend-sales",
        title: "Sales momentum is stable",
        description: `Revenue today is ${this.formatCurrency(context.revenueToday)} with ${context.salesToday} completed sales.`,
        type: "trend",
        timestamp: this.nowLabel()
      },
      {
        id: "anomaly-stock",
        title: lowStockCount > 0 ? "Inventory anomaly detected" : "Inventory levels are healthy",
        description:
          lowStockCount > 0
            ? `${lowStockCount} products are at or below reorder level. Review the low-stock departments immediately.`
            : "No low-stock anomalies are currently visible in the available context.",
        type: "anomaly",
        timestamp: this.nowLabel()
      },
      {
        id: "recommendation-shifts",
        title: "Optimize frontline coverage",
        description:
          context.activeEmployees >= 3
            ? "Staffing looks balanced across active departments."
            : "Shift coverage needs a review in a few departments.",
        type: "recommendation",
        timestamp: this.nowLabel()
      },
      {
        id: "recommendation-pos",
        title: "Use POS bundles for faster checkout",
        description:
          context.openPosItems > 0
            ? "There is already an active cart in POS. Suggest upsells based on the current basket."
            : "Consider promotional bundles in POS to improve average basket size.",
        type: "recommendation",
        timestamp: this.nowLabel()
      },
      {
        id: "trend-departments",
        title: "Department health remains mixed",
        description: `Key departments under watch: ${departmentLabels.join(", ") || "none"}. Track these in Reports and the department roster.`,
        type: "trend",
        timestamp: this.nowLabel()
      }
    ];

    return insights.filter((insight) => {
      const matchesType = type === "all" || insight.type === type;
      const matchesQuery =
        !query ||
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query);
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
