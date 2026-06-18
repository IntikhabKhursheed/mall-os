import { HttpParams } from "@angular/common/http";

export const API_BASE_URL = "http://localhost:5000/api";

export const buildParams = (params: Record<string, string | number | boolean | undefined | null>): HttpParams => {
  let httpParams = new HttpParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      httpParams = httpParams.set(key, String(value));
    }
  });
  return httpParams;
};
