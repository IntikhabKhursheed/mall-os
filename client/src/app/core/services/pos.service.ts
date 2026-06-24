import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { API_BASE_URL } from "./api.service";

export interface PosSaleLine {
  productId: string;
  quantity: number;
}

export interface PosSalePayload {
  items: PosSaleLine[];
  discount?: number;
  tax?: number;
  paymentMethod: "cash" | "card" | "wallet";
  timestamp?: string;
}

export interface PosSaleNotification {
  _id: string;
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "danger";
  source: string;
  productId?: string | null;
}

export interface PosSaleResponse {
  saleId: string;
  updatedProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    barcode: string;
    price: number;
    stock: number;
    reorderLevel: number;
    status: "healthy" | "low_stock" | "out_of_stock";
    department: string;
    imageUrl: string;
  }>;
  notifications: PosSaleNotification[];
}

@Injectable({ providedIn: "root" })
export class PosService {
  constructor(private readonly http: HttpClient) {}

  completeSale(payload: PosSalePayload): Observable<ApiResponse<PosSaleResponse>> {
    return this.http.post<ApiResponse<PosSaleResponse>>(`${API_BASE_URL}/pos/sale`, payload);
  }
}
