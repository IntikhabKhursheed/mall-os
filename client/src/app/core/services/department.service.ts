import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { Department, DepartmentPayload } from "../models/department.model";
import { API_BASE_URL } from "./api.service";

interface DepartmentDto {
  _id: string;
  name: string;
  managerId?: string;
  manager?: string;
  status: Department["status"];
  createdAt?: string;
  updatedAt?: string;
}

interface DepartmentListResponse {
  items: DepartmentDto[];
}

const toUiDepartment = (item: DepartmentDto): Department => ({
  _id: item._id,
  name: item.name,
  manager: item.managerId ?? item.manager ?? "",
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

const toPayload = (payload: DepartmentPayload): Record<string, unknown> => ({
  name: payload.name,
  managerId: payload.manager,
  status: payload.status
});

@Injectable({ providedIn: "root" })
export class DepartmentService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<ApiResponse<{ items: Department[] }>> {
    return this.http.get<ApiResponse<DepartmentListResponse>>(`${API_BASE_URL}/departments`).pipe(
      map((response) => ({
        ...response,
        data: {
          items: response.data.items.map(toUiDepartment)
        }
      }))
    );
  }

  create(payload: DepartmentPayload): Observable<ApiResponse<{ item: Department }>> {
    return this.http.post<ApiResponse<{ item: DepartmentDto }>>(`${API_BASE_URL}/departments`, toPayload(payload)).pipe(
      map((response) => ({
        ...response,
        data: {
          item: toUiDepartment(response.data.item)
        }
      }))
    );
  }

  update(id: string, payload: DepartmentPayload): Observable<ApiResponse<{ item: Department }>> {
    return this.http.put<ApiResponse<{ item: DepartmentDto }>>(`${API_BASE_URL}/departments/${id}`, toPayload(payload)).pipe(
      map((response) => ({
        ...response,
        data: {
          item: toUiDepartment(response.data.item)
        }
      }))
    );
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${API_BASE_URL}/departments/${id}`);
  }
}
