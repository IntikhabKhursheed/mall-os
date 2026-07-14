import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { API_BASE_URL } from "./api.service";

export type AnalyticsTone = "info" | "success" | "warning" | "danger";

export interface AnalyticsTransaction {
  id: string;
  reference: string;
  department: string;
  itemCount: number;
  amount: number;
  paymentMethod: "cash" | "card" | "easypaisa" | "jazzcash" | "raast" | "wallet";
  timestamp: string;
  status: "completed";
}

export interface AnalyticsSummary {
  revenue: number;
  transactionCount: number;
  activeEmployees: number;
  lowStockCount: number;
  stockHealth: number;
  alerts: number;
  lowStockThreshold: number;
  recentTransactions: AnalyticsTransaction[];
}

export interface AnalyticsNotification {
  id: string;
  title: string;
  description: string;
  type: AnalyticsTone;
  source: string;
  timestamp: string;
}

export interface AnalyticsNotifications {
  warnings: AnalyticsNotification[];
  events: AnalyticsNotification[];
}

export interface DashboardSummary {
  revenueToday: number;
  salesToday: number;
  lowStockCount: number;
  activeEmployees: number;
  stockHealth: number;
  alerts: number;
}

interface AnalyticsSummaryResponse {
  summary: AnalyticsSummary;
}

@Injectable({ providedIn: "root" })
export class AnalyticsService {
  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<AnalyticsSummary> {
    return this.http.get<ApiResponse<AnalyticsSummaryResponse>>(`${API_BASE_URL}/analytics/summary`).pipe(
      map((response) => response.data.summary)
    );
  }

  getNotifications(): Observable<AnalyticsNotifications> {
    return this.http.get<ApiResponse<AnalyticsNotifications>>(`${API_BASE_URL}/analytics/notifications`).pipe(
      map((response) => response.data)
    );
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.getSummary().pipe(
      map((summary) => ({
        revenueToday: summary.revenue,
        salesToday: summary.transactionCount,
        lowStockCount: summary.lowStockCount,
        activeEmployees: summary.activeEmployees,
        stockHealth: summary.stockHealth,
        alerts: summary.alerts
      }))
    );
  }
}
