import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL, buildParams } from "./api.service";
import { ApiResponse, PagedData } from "../models/api-response.model";
import { Employee, EmployeePayload } from "../models/employee.model";

@Injectable({ providedIn: "root" })
export class EmployeeService {
  private readonly endpoint = `${API_BASE_URL}/employees`;

  constructor(private readonly http: HttpClient) {}

  list(params: { page?: number; limit?: number; search?: string; department?: string }): Observable<ApiResponse<PagedData<Employee>>> {
    return this.http.get<ApiResponse<PagedData<Employee>>>(this.endpoint, {
      params: buildParams(params)
    });
  }

  create(payload: EmployeePayload): Observable<ApiResponse<{ item: Employee }>> {
    return this.http.post<ApiResponse<{ item: Employee }>>(this.endpoint, payload);
  }

  update(id: string, payload: EmployeePayload): Observable<ApiResponse<{ item: Employee }>> {
    return this.http.put<ApiResponse<{ item: Employee }>>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
  }
}
