import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse, PagedData } from "../models/api-response.model";
import { Employee, EmployeePayload } from "../models/employee.model";
import { MallDataService } from "./mall-data.service";

@Injectable({ providedIn: "root" })
export class EmployeeService {
  constructor(private readonly mallData: MallDataService) {}

  list(params: { page?: number; limit?: number; search?: string; department?: string }): Observable<ApiResponse<PagedData<Employee>>> {
    return this.mallData.listEmployees(params);
  }

  create(payload: EmployeePayload): Observable<ApiResponse<{ item: Employee }>> {
    return this.mallData.createEmployee(payload);
  }

  update(id: string, payload: EmployeePayload): Observable<ApiResponse<{ item: Employee }>> {
    return this.mallData.updateEmployee(id, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.mallData.deleteEmployee(id);
  }
}
