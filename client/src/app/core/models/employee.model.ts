export interface Employee {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  status?: string;
  clockInTime?: string | null;
  lastActive?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeePayload {
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  status?: string;
  clockInTime?: string | null;
  lastActive?: string | null;
}
