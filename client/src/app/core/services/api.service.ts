import { HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export const API_BASE_URL = `${environment.apiBaseUrl}/api`;

export const buildParams = (params: Record<string, string | number | boolean | undefined | null>): HttpParams => {
  let httpParams = new HttpParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      httpParams = httpParams.set(key, String(value));
    }
  });
  return httpParams;
};
