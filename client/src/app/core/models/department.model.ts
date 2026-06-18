export interface Department {
  _id: string;
  name: string;
  category?: string;
  manager?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentPayload {
  name: string;
  category?: string;
  manager?: string;
  status?: string;
}
