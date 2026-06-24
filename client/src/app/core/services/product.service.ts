import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiResponse, PagedData } from "../models/api-response.model";
import { Product, ProductPayload } from "../models/product.model";
import { API_BASE_URL, buildParams } from "./api.service";

interface ProductDto {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  price?: number;
  sellingPrice?: number;
  stock?: number;
  stockQuantity?: number;
  reorderLevel: number;
  status: Product["status"];
  department: string;
  imageUrl?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductListResponse {
  items: ProductDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const toUiProduct = (item: ProductDto): Product => ({
  _id: item._id,
  name: item.name,
  sku: item.sku,
  barcode: item.barcode,
  department: item.department,
  sellingPrice: item.price ?? item.sellingPrice ?? 0,
  stockQuantity: item.stock ?? item.stockQuantity ?? 0,
  reorderLevel: item.reorderLevel,
  status: item.status,
  image: item.imageUrl ?? item.image ?? "",
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

const toPayload = (payload: ProductPayload): Record<string, unknown> => ({
  name: payload.name,
  sku: payload.sku,
  barcode: payload.barcode,
  price: payload.sellingPrice,
  stock: payload.stockQuantity,
  reorderLevel: payload.reorderLevel,
  department: payload.department,
  imageUrl: payload.image?.trim() || "https://placehold.co/600x400?text=MallOS"
});

@Injectable({ providedIn: "root" })
export class ProductService {
  constructor(private readonly http: HttpClient) {}

  list(params: { page?: number; limit?: number; search?: string; department?: string }): Observable<ApiResponse<PagedData<Product>>> {
    return this.http
      .get<ApiResponse<ProductListResponse>>(`${API_BASE_URL}/products`, {
        params: buildParams(params)
      })
      .pipe(
        map((response) => ({
          ...response,
          data: {
            ...response.data,
            items: response.data.items.map(toUiProduct)
          }
        }))
      );
  }

  create(payload: ProductPayload): Observable<ApiResponse<{ item: Product }>> {
    return this.http.post<ApiResponse<{ item: ProductDto }>>(`${API_BASE_URL}/products`, toPayload(payload)).pipe(
      map((response) => ({
        ...response,
        data: {
          item: toUiProduct(response.data.item)
        }
      }))
    );
  }

  update(id: string, payload: ProductPayload): Observable<ApiResponse<{ item: Product }>> {
    return this.http.put<ApiResponse<{ item: ProductDto }>>(`${API_BASE_URL}/products/${id}`, toPayload(payload)).pipe(
      map((response) => ({
        ...response,
        data: {
          item: toUiProduct(response.data.item)
        }
      }))
    );
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${API_BASE_URL}/products/${id}`);
  }
}
