import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { Department, DepartmentPayload } from "../models/department.model";
import { MallDataService } from "./mall-data.service";

@Injectable({ providedIn: "root" })
export class DepartmentService {
  constructor(private readonly mallData: MallDataService) {}

  list(): Observable<ApiResponse<{ items: Department[] }>> {
    return this.mallData.listDepartments();
  }

  create(payload: DepartmentPayload): Observable<ApiResponse<{ item: Department }>> {
    return this.mallData.createDepartment(payload);
  }

  update(id: string, payload: DepartmentPayload): Observable<ApiResponse<{ item: Department }>> {
    return this.mallData.updateDepartment(id, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.mallData.deleteDepartment(id);
  }
}
