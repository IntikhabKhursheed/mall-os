export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier";
  department?: string;
  status?: "active" | "inactive";
  lastLogin?: string | null;
}
