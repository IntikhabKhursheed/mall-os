import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiResponse, PagedData } from "../models/api-response.model";
import { Employee, EmployeePayload } from "../models/employee.model";
import { API_BASE_URL, buildParams } from "./api.service";

interface EmployeeDto {
  _id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: Employee["status"];
  createdAt?: string;
  updatedAt?: string;
}

interface EmployeeListResponse {
  items: EmployeeDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const toUiEmployee = (item: EmployeeDto): Employee => ({
  _id: item._id,
  fullName: item.name ?? item.fullName ?? "",
  email: item.email,
  phone: item.phone,
  role: item.role,
  department: item.department,
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

const toPayload = (payload: EmployeePayload): Record<string, unknown> => ({
  name: payload.fullName,
  email: payload.email,
  phone: payload.phone,
  role: payload.role,
  department: payload.department,
  status: payload.status
});

@Injectable({ providedIn: "root" })
export class EmployeeService {
  constructor(private readonly http: HttpClient) {}

  list(params: { page?: number; limit?: number; search?: string; department?: string }): Observable<ApiResponse<PagedData<Employee>>> {
    return this.http
      .get<ApiResponse<EmployeeListResponse>>(`${API_BASE_URL}/employees`, {
        params: buildParams(params)
      })
      .pipe(
        map((response) => ({
          ...response,
          data: {
            ...response.data,
            items: response.data.items.map(toUiEmployee)
          }
        }))
      );
  }

  create(payload: EmployeePayload): Observable<ApiResponse<{ item: Employee }>> {
    return this.http.post<ApiResponse<{ item: EmployeeDto }>>(`${API_BASE_URL}/employees`, toPayload(payload)).pipe(
      map((response) => ({
        ...response,
        data: {
          item: toUiEmployee(response.data.item)
        }
      }))
    );
  }

  update(id: string, payload: EmployeePayload): Observable<ApiResponse<{ item: Employee }>> {
    return this.http.put<ApiResponse<{ item: EmployeeDto }>>(`${API_BASE_URL}/employees/${id}`, toPayload(payload)).pipe(
      map((response) => ({
        ...response,
        data: {
          item: toUiEmployee(response.data.item)
        }
      }))
    );
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${API_BASE_URL}/employees/${id}`);
  }
}
