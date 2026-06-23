export type GrokInsightType = "trend" | "anomaly" | "recommendation";

export interface GrokInsight {
  id: string;
  title: string;
  description: string;
  type: GrokInsightType;
  timestamp: string;
  context?: string[];
  severity?: "low" | "medium" | "high";
}

export interface GrokContextSnapshot {
  revenueToday: number;
  salesToday: number;
  lowStockCount: number;
  activeEmployees: number;
  stockHealth: number;
  openPosItems: number;
  departments: number;
  recentSales: number;
}

export interface GrokInsightPayload {
  query?: string;
  type?: GrokInsightType | "all";
}

export interface GrokInsightResponse {
  source: "mock" | "grok";
  generatedAt: string;
  context: GrokContextSnapshot;
  insights: GrokInsight[];
}
