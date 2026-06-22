import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse, PagedData } from "../models/api-response.model";
import { Product, ProductPayload } from "../models/product.model";
import { MallDataService } from "./mall-data.service";

@Injectable({ providedIn: "root" })
export class ProductService {
  constructor(private readonly mallData: MallDataService) {}

  list(params: { page?: number; limit?: number; search?: string; department?: string }): Observable<ApiResponse<PagedData<Product>>> {
    return this.mallData.listProducts(params);
  }

  create(payload: ProductPayload): Observable<ApiResponse<{ item: Product }>> {
    return this.mallData.createProduct(payload);
  }

  update(id: string, payload: ProductPayload): Observable<ApiResponse<{ item: Product }>> {
    return this.mallData.updateProduct(id, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.mallData.deleteProduct(id);
  }
}
