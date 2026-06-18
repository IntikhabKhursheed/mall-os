import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api.service";
import { ApiResponse } from "../models/api-response.model";
import { Department, DepartmentPayload } from "../models/department.model";

@Injectable({ providedIn: "root" })
export class DepartmentService {
  private readonly endpoint = `${API_BASE_URL}/departments`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ApiResponse<{ items: Department[] }>> {
    return this.http.get<ApiResponse<{ items: Department[] }>>(this.endpoint);
  }

  create(payload: DepartmentPayload): Observable<ApiResponse<{ item: Department }>> {
    return this.http.post<ApiResponse<{ item: Department }>>(this.endpoint, payload);
  }

  update(id: string, payload: DepartmentPayload): Observable<ApiResponse<{ item: Department }>> {
    return this.http.put<ApiResponse<{ item: Department }>>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
  }
}
