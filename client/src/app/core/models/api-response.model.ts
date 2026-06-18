export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
