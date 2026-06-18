import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL, buildParams } from "./api.service";
import { ApiResponse, PagedData } from "../models/api-response.model";
import { Product, ProductPayload } from "../models/product.model";

@Injectable({ providedIn: "root" })
export class ProductService {
  private readonly endpoint = `${API_BASE_URL}/products`;

  constructor(private readonly http: HttpClient) {}

  list(params: { page?: number; limit?: number; search?: string; department?: string }): Observable<ApiResponse<PagedData<Product>>> {
    return this.http.get<ApiResponse<PagedData<Product>>>(this.endpoint, {
      params: buildParams(params)
    });
  }

  create(payload: ProductPayload): Observable<ApiResponse<{ item: Product }>> {
    return this.http.post<ApiResponse<{ item: Product }>>(this.endpoint, payload);
  }

  update(id: string, payload: ProductPayload): Observable<ApiResponse<{ item: Product }>> {
    return this.http.put<ApiResponse<{ item: Product }>>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
  }
}
