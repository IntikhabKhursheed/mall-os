import { Injectable } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import { ApiResponse, PagedData } from "../models/api-response.model";
import { Department, DepartmentPayload } from "../models/department.model";
import { Employee, EmployeePayload } from "../models/employee.model";
import { Product, ProductPayload } from "../models/product.model";
import { User } from "../models/user.model";

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "success" | "warning" | "danger";
  time: string;
}

export interface CartLine {
  productId: string;
  name: string;
  department: string;
  barcode?: string;
  quantity: number;
  unitPrice: number;
  stockQuantity: number;
  status: Product["status"];
}

export interface SaleRecord {
  id: string;
  orderId: string;
  cashier: string;
  department: string;
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  time: string;
  status: "completed" | "suspended";
}

export interface SuspendedSale {
  id: string;
  name: string;
  items: CartLine[];
  subtotal: number;
  createdAt: string;
}

export interface DashboardSummary {
  revenueToday: number;
  salesToday: number;
  lowStockCount: number;
  activeEmployees: number;
  stockHealth: number;
  alerts: number;
}

export interface PosState {
  cart: CartLine[];
  paymentMethod: "cash" | "card" | "wallet";
  customerName: string;
  discount: number;
  suspendedSales: SuspendedSale[];
  lastSale?: SaleRecord | null;
}

export interface ReportCard {
  id: string;
  title: string;
  detail: string;
  meta: string;
  badge: string;
  tone: "info" | "success" | "warning" | "danger";
}

export interface InsightCard {
  id: string;
  title: string;
  detail: string;
  action: string;
  tone: "info" | "success" | "warning" | "danger";
}

export interface AppSettings {
  storeName: string;
  currency: string;
  taxRate: number;
  theme: "light" | "dark";
  notificationsEnabled: boolean;
  autoRefresh: boolean;
}

interface MallState {
  departments: Department[];
  employees: Employee[];
  products: Product[];
  users: User[];
  credentials: Record<string, string>;
  notifications: NotificationItem[];
  sales: SaleRecord[];
  reports: ReportCard[];
  insights: InsightCard[];
  pos: PosState;
  settings: AppSettings;
  nextIds: Record<string, number>;
}

interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}

const STORAGE_KEY = "mallos_mock_state_v1";
const SESSION_KEY = "mallos_session_user_v1";

const defaultSettings: AppSettings = {
  storeName: "Grand Central Mall",
  currency: "USD",
  taxRate: 0.13,
  theme: "light",
  notificationsEnabled: true,
  autoRefresh: true
};

const seedState = (): MallState => {
  const departments: Department[] = [
    { _id: "dept-fashion", name: "Fashion", category: "Apparel", manager: "Mariam Khan", status: "active" },
    { _id: "dept-food", name: "Food Court", category: "Dining", manager: "Usman Ali", status: "active" },
    { _id: "dept-electronics", name: "Electronics", category: "Gadgets", manager: "Hira Ahmed", status: "active" },
    { _id: "dept-beauty", name: "Beauty", category: "Personal Care", manager: "Sara Noor", status: "active" },
    { _id: "dept-sports", name: "Sports", category: "Athleisure", manager: "Adeel Khan", status: "inactive" }
  ];

  const employees: Employee[] = [
    {
      _id: "emp-1",
      fullName: "Mariam Khan",
      email: "mariam@mallos.com",
      phone: "0300-1111111",
      role: "Senior Associate",
      department: "Fashion",
      status: "active",
      clockInTime: "09:00",
      lastActive: "2m ago"
    },
    {
      _id: "emp-2",
      fullName: "Usman Ali",
      email: "usman@mallos.com",
      phone: "0300-2222222",
      role: "Cashier",
      department: "Food Court",
      status: "active",
      clockInTime: "09:15",
      lastActive: "5m ago"
    },
    {
      _id: "emp-3",
      fullName: "Hira Ahmed",
      email: "hira@mallos.com",
      phone: "0300-3333333",
      role: "Store Support",
      department: "Electronics",
      status: "inactive",
      clockInTime: null,
      lastActive: "2h ago"
    },
    {
      _id: "emp-4",
      fullName: "Ayesha Malik",
      email: "ayesha@mallos.com",
      phone: "0300-4444444",
      role: "Sales Associate",
      department: "Beauty",
      status: "active",
      clockInTime: "10:05",
      lastActive: "12m ago"
    }
  ];

  const products: Product[] = [
    {
      _id: "prod-1",
      name: "Burger Combo",
      sku: "FD-18",
      barcode: "552188412",
      category: "Meals",
      department: "Food Court",
      sellingPrice: 1840,
      costPrice: 1180,
      stockQuantity: 14,
      reorderLevel: 12,
      status: "healthy"
    },
    {
      _id: "prod-2",
      name: "Classic Denim Jacket",
      sku: "FS-07",
      barcode: "880112341",
      category: "Outerwear",
      department: "Fashion",
      sellingPrice: 5200,
      costPrice: 3280,
      stockQuantity: 5,
      reorderLevel: 12,
      status: "low_stock"
    },
    {
      _id: "prod-3",
      name: "Wireless Earbuds",
      sku: "EL-22",
      barcode: "771245190",
      category: "Audio",
      department: "Electronics",
      sellingPrice: 9900,
      costPrice: 7300,
      stockQuantity: 2,
      reorderLevel: 10,
      status: "low_stock"
    },
    {
      _id: "prod-4",
      name: "Canvas Backpack",
      sku: "AC-11",
      barcode: "665512890",
      category: "Accessories",
      department: "Fashion",
      sellingPrice: 3250,
      costPrice: 1940,
      stockQuantity: 11,
      reorderLevel: 8,
      status: "healthy"
    },
    {
      _id: "prod-5",
      name: "Herbal Face Wash",
      sku: "BE-14",
      barcode: "441117892",
      category: "Skincare",
      department: "Beauty",
      sellingPrice: 1450,
      costPrice: 820,
      stockQuantity: 0,
      reorderLevel: 8,
      status: "out_of_stock"
    },
    {
      _id: "prod-6",
      name: "Running Shorts",
      sku: "SP-08",
      barcode: "990014332",
      category: "Apparel",
      department: "Sports",
      sellingPrice: 2100,
      costPrice: 1250,
      stockQuantity: 7,
      reorderLevel: 10,
      status: "low_stock"
    }
  ];

  const users: User[] = [
    { _id: "user-1", name: "Admin User", email: "admin@mallos.com", role: "admin", department: "Operations", status: "active" },
    { _id: "user-2", name: "Manager User", email: "manager@mallos.com", role: "manager", department: "Fashion", status: "active" },
    { _id: "user-3", name: "Cashier User", email: "cashier@mallos.com", role: "cashier", department: "Food Court", status: "active" }
  ];

  const notifications: NotificationItem[] = [
    { id: "note-1", title: "Low stock alert", detail: "Wireless Earbuds are below reorder level.", tone: "warning", time: "5m ago" },
    { id: "note-2", title: "Sale completed", detail: "Food Court transaction finished successfully.", tone: "success", time: "13m ago" },
    { id: "note-3", title: "Shift update", detail: "Ayesha Malik clocked in for the Beauty counter.", tone: "info", time: "22m ago" }
  ];

  const sales: SaleRecord[] = [
    { id: "sale-1", orderId: "GC-1021", cashier: "Usman Ali", department: "Fashion", itemCount: 2, subtotal: 8200, discount: 500, total: 7700, paymentMethod: "card", time: "09:12", status: "completed" },
    { id: "sale-2", orderId: "GC-1028", cashier: "Usman Ali", department: "Food Court", itemCount: 3, subtotal: 2840, discount: 140, total: 2700, paymentMethod: "cash", time: "09:25", status: "completed" },
    { id: "sale-3", orderId: "GC-1039", cashier: "Ayesha Malik", department: "Electronics", itemCount: 1, subtotal: 9900, discount: 0, total: 9900, paymentMethod: "wallet", time: "10:02", status: "completed" }
  ];

  const reports: ReportCard[] = [
    { id: "rep-1", title: "Daily revenue", detail: "Sales are ahead of yesterday by 12%.", meta: "Updated 4 minutes ago", badge: "Trending up", tone: "success" },
    { id: "rep-2", title: "Inventory risk", detail: "3 products need attention within 48 hours.", meta: "Updated 12 minutes ago", badge: "Needs review", tone: "warning" },
    { id: "rep-3", title: "Staff coverage", detail: "Shift coverage is healthy across the mall.", meta: "Updated 18 minutes ago", badge: "Balanced", tone: "info" }
  ];

  const insights: InsightCard[] = [
    { id: "ins-1", title: "Food Court demand is peaking", detail: "Lunch-hour baskets are 18% larger than the morning average.", action: "Increase prep by 2 staff", tone: "success" },
    { id: "ins-2", title: "Electronics turnover slowing", detail: "Premium accessories are moving slower than expected.", action: "Run a flash bundle", tone: "warning" },
    { id: "ins-3", title: "Fashion conversion looks strong", detail: "Shoppers are converting after fitting room visits.", action: "Promote best sellers", tone: "info" }
  ];

  return {
    departments,
    employees,
    products,
    users,
    credentials: {
      "admin@mallos.com": "Admin@123",
      "manager@mallos.com": "Manager@123",
      "cashier@mallos.com": "Cashier@123"
    },
    notifications,
    sales,
    reports,
    insights,
    pos: {
      cart: [
        { productId: "prod-1", name: "Burger Combo", department: "Food Court", barcode: "552188412", quantity: 1, unitPrice: 1840, stockQuantity: 14, status: "healthy" },
        { productId: "prod-2", name: "Classic Denim Jacket", department: "Fashion", barcode: "880112341", quantity: 1, unitPrice: 5200, stockQuantity: 5, status: "low_stock" }
      ],
      paymentMethod: "cash",
      customerName: "Walk-in customer",
      discount: 220,
      suspendedSales: [],
      lastSale: null
    },
    settings: defaultSettings,
    nextIds: {
      department: 6,
      employee: 5,
      product: 7,
      sale: 4,
      notification: 4,
      user: 4,
      suspendedSale: 1
    }
  };
};

@Injectable({ providedIn: "root" })
export class MallDataService {
  private readonly stateKey = STORAGE_KEY;
  private readonly state = this.loadState();

  private persist(): void {
    localStorage.setItem(this.stateKey, JSON.stringify(this.state));
  }

  private loadState(): MallState {
    const raw = localStorage.getItem(this.stateKey);
    if (!raw) {
      const seeded = seedState();
      localStorage.setItem(this.stateKey, JSON.stringify(seeded));
      return seeded;
    }

    try {
      return { ...seedState(), ...JSON.parse(raw) } as MallState;
    } catch {
      const seeded = seedState();
      localStorage.setItem(this.stateKey, JSON.stringify(seeded));
      return seeded;
    }
  }

  private respond<T>(value: T, latency = 140): Observable<T> {
    return of(value).pipe(delay(latency));
  }

  private page<T>(items: T[], params: ListQuery): PagedData<T> {
    const limit = Math.max(1, Number(params.limit ?? 10));
    const page = Math.max(1, Number(params.page ?? 1));
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), page, limit, total, totalPages };
  }

  private matches(value: string | undefined, query: string): boolean {
    return (value ?? "").toLowerCase().includes(query.toLowerCase());
  }

  private productStatus(product: Partial<Product>): Product["status"] {
    const stock = Number(product.stockQuantity ?? 0);
    const reorder = Number(product.reorderLevel ?? 0);
    if (stock <= 0) {
      return "out_of_stock";
    }
    if (stock <= reorder) {
      return "low_stock";
    }
    return "healthy";
  }

  private hydrateProduct(product: Product): Product {
    return { ...product, status: product.status ?? this.productStatus(product) };
  }

  private hydrateEmployee(employee: Employee): Employee {
    return { ...employee, status: employee.status || "active" };
  }

  private nextId(scope: keyof MallState["nextIds"]): string {
    const next = this.state.nextIds[scope];
    this.state.nextIds[scope] = next + 1;
    this.persist();
    return `${scope}-${next}`;
  }

  // Auth
  getCurrentSessionUser(): User | null {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  login(email: string, password: string): Observable<User> {
    const user = this.state.users.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? null;

    if (!user || this.state.credentials[email.toLowerCase()] !== password) {
      return new Observable<User>((subscriber) => subscriber.error({ error: { message: "Invalid email or password." } }));
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return this.respond(user);
  }

  register(payload: { name: string; email: string; password: string; role: User["role"]; department?: string; status?: "active" | "inactive" }): Observable<User> {
    const duplicate = this.state.users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase());
    if (duplicate) {
      return new Observable<User>((subscriber) => subscriber.error({ error: { message: "An account with this email already exists." } }));
    }

    const user: User = {
      _id: this.nextId("user"),
      name: payload.name,
      email: payload.email,
      role: payload.role,
      department: payload.department || "",
      status: payload.status || "active"
    };

    this.state.users.unshift(user);
    this.state.credentials[payload.email.toLowerCase()] = payload.password;
    this.persist();
    return this.respond(user);
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  me(): Observable<User> {
    return this.respond(this.getCurrentSessionUser() ?? this.state.users[0]);
  }

  // Departments
  listDepartments(): Observable<ApiResponse<{ items: Department[] }>> {
    return this.respond({
      success: true,
      message: "Departments loaded",
      data: { items: [...this.state.departments] }
    });
  }

  createDepartment(payload: DepartmentPayload): Observable<ApiResponse<{ item: Department }>> {
    const item: Department = { _id: this.nextId("department"), ...payload };
    this.state.departments.unshift(item);
    this.persist();
    return this.respond({ success: true, message: "Department created", data: { item } });
  }

  updateDepartment(id: string, payload: DepartmentPayload): Observable<ApiResponse<{ item: Department }>> {
    const index = this.state.departments.findIndex((item) => item._id === id);
    if (index === -1) {
      return new Observable<ApiResponse<{ item: Department }>>((subscriber) => subscriber.error({ error: { message: "Department not found." } }));
    }

    const item = { ...this.state.departments[index], ...payload };
    this.state.departments[index] = item;
    this.persist();
    return this.respond({ success: true, message: "Department updated", data: { item } });
  }

  deleteDepartment(id: string): Observable<ApiResponse<null>> {
    this.state.departments = this.state.departments.filter((item) => item._id !== id);
    this.persist();
    return this.respond({ success: true, message: "Department deleted", data: null });
  }

  // Employees
  listEmployees(params: ListQuery): Observable<ApiResponse<PagedData<Employee>>> {
    const search = (params.search ?? "").trim().toLowerCase();
    const department = (params.department ?? "").trim().toLowerCase();
    const filtered = this.state.employees
      .map((item) => this.hydrateEmployee(item))
      .filter((item) => {
        const matchesSearch =
          !search ||
          this.matches(item.fullName, search) ||
          this.matches(item.email, search) ||
          this.matches(item.department, search);
        const matchesDepartment = !department || (item.department ?? "").toLowerCase() === department;
        return matchesSearch && matchesDepartment;
      });

    return this.respond({
      success: true,
      message: "Employees loaded",
      data: this.page(filtered, params)
    });
  }

  createEmployee(payload: EmployeePayload): Observable<ApiResponse<{ item: Employee }>> {
    const item: Employee = { _id: this.nextId("employee"), ...payload, status: payload.status || "active" };
    this.state.employees.unshift(item);
    this.persist();
    return this.respond({ success: true, message: "Employee created", data: { item } });
  }

  updateEmployee(id: string, payload: EmployeePayload): Observable<ApiResponse<{ item: Employee }>> {
    const index = this.state.employees.findIndex((item) => item._id === id);
    if (index === -1) {
      return new Observable<ApiResponse<{ item: Employee }>>((subscriber) => subscriber.error({ error: { message: "Employee not found." } }));
    }

    const item = { ...this.state.employees[index], ...payload, status: payload.status || this.state.employees[index].status || "active" };
    this.state.employees[index] = item;
    this.persist();
    return this.respond({ success: true, message: "Employee updated", data: { item } });
  }

  deleteEmployee(id: string): Observable<ApiResponse<null>> {
    this.state.employees = this.state.employees.filter((item) => item._id !== id);
    this.persist();
    return this.respond({ success: true, message: "Employee deleted", data: null });
  }

  // Products
  listProducts(params: ListQuery): Observable<ApiResponse<PagedData<Product>>> {
    const search = (params.search ?? "").trim().toLowerCase();
    const department = (params.department ?? "").trim().toLowerCase();
    const filtered = this.state.products
      .map((item) => this.hydrateProduct(item))
      .filter((item) => {
        const matchesSearch =
          !search ||
          this.matches(item.name, search) ||
          this.matches(item.sku, search) ||
          this.matches(item.barcode, search) ||
          this.matches(item.department, search);
        const matchesDepartment = !department || (item.department ?? "").toLowerCase() === department;
        return matchesSearch && matchesDepartment;
      });

    return this.respond({
      success: true,
      message: "Products loaded",
      data: this.page(filtered, params)
    });
  }

  createProduct(payload: ProductPayload): Observable<ApiResponse<{ item: Product }>> {
    const item: Product = { _id: this.nextId("product"), ...payload, status: payload.status || this.productStatus(payload) } as Product;
    this.state.products.unshift(item);
    this.persist();
    return this.respond({ success: true, message: "Product created", data: { item } });
  }

  updateProduct(id: string, payload: ProductPayload): Observable<ApiResponse<{ item: Product }>> {
    const index = this.state.products.findIndex((item) => item._id === id);
    if (index === -1) {
      return new Observable<ApiResponse<{ item: Product }>>((subscriber) => subscriber.error({ error: { message: "Product not found." } }));
    }

    const item: Product = {
      ...this.state.products[index],
      ...payload,
      status: payload.status || this.productStatus(payload)
    };
    this.state.products[index] = item;
    this.persist();
    return this.respond({ success: true, message: "Product updated", data: { item } });
  }

  deleteProduct(id: string): Observable<ApiResponse<null>> {
    this.state.products = this.state.products.filter((item) => item._id !== id);
    this.persist();
    return this.respond({ success: true, message: "Product deleted", data: null });
  }

  // Dashboard
  getSummary(): Observable<DashboardSummary> {
    const lowStockCount = this.state.products.filter((item) => this.productStatus(item) !== "healthy").length;
    const activeEmployees = this.state.employees.filter((item) => (item.status ?? "active") === "active").length;
    const healthyStock = this.state.products.length
      ? Math.round((this.state.products.filter((item) => this.productStatus(item) === "healthy").length / this.state.products.length) * 100)
      : 0;
    const revenueToday = this.state.sales.filter((sale) => sale.status === "completed").reduce((sum, sale) => sum + sale.total, 0);
    return this.respond({
      revenueToday,
      salesToday: this.state.sales.filter((sale) => sale.status === "completed").length,
      lowStockCount,
      activeEmployees,
      stockHealth: healthyStock,
      alerts: this.state.notifications.length + lowStockCount
    });
  }

  getActivityFeed(): Observable<Array<{ icon: string; title: string; detail: string; time: string }>> {
    return this.respond([
      { icon: "pi pi-shopping-bag", title: "New sale processed", detail: "Fashion department completed order #1294.", time: "2m ago" },
      { icon: "pi pi-exclamation-circle", title: "Low stock alert", detail: "Wireless Earbuds dropped below reorder level.", time: "8m ago" },
      { icon: "pi pi-user-plus", title: "Employee check-in", detail: "Cashier shift started at Food Court counter.", time: "15m ago" }
    ]);
  }

  getDepartmentSignals(): Observable<Array<{ label: string; detail: string; status: NonNullable<Product["status"]> }>> {
    const grouped = this.state.products.reduce<Record<string, Product[]>>((acc, product) => {
      const key = product.department || "Unassigned";
      (acc[key] ??= []).push(product);
      return acc;
    }, {});

    const signals = Object.entries(grouped).slice(0, 4).map(([label, items]) => {
      const low = items.filter((item) => this.productStatus(item) !== "healthy").length;
      const detail = low > 0 ? `${low} items need review.` : "Healthy sell-through and stock levels.";
      const status: NonNullable<Product["status"]> = low > Math.ceil(items.length / 2) ? "out_of_stock" : low > 0 ? "low_stock" : "healthy";
      return { label, detail, status };
    });

    return this.respond(signals as Array<{ label: string; detail: string; status: NonNullable<Product["status"]> }>);
  }

  getRecentSales(): Observable<SaleRecord[]> {
    return this.respond([...this.state.sales].slice().sort((a, b) => b.time.localeCompare(a.time)));
  }

  getReportCards(query = ""): Observable<ReportCard[]> {
    const q = query.trim().toLowerCase();
    return this.respond(
      this.state.reports.filter((item) => !q || this.matches(item.title, q) || this.matches(item.detail, q) || this.matches(item.meta, q))
    );
  }

  getInsightCards(query = ""): Observable<InsightCard[]> {
    const q = query.trim().toLowerCase();
    return this.respond(
      this.state.insights.filter((item) => !q || this.matches(item.title, q) || this.matches(item.detail, q) || this.matches(item.action, q))
    );
  }

  getUsers(): Observable<User[]> {
    return this.respond([...this.state.users]);
  }

  updateUser(id: string, patch: Partial<User>): Observable<User> {
    const index = this.state.users.findIndex((item) => item._id === id);
    if (index === -1) {
      return new Observable<User>((subscriber) => subscriber.error({ error: { message: "User not found." } }));
    }

    const user = { ...this.state.users[index], ...patch };
    const previousEmail = this.state.users[index].email.toLowerCase();
    const nextEmail = user.email.toLowerCase();
    if (previousEmail !== nextEmail && this.state.credentials[previousEmail]) {
      this.state.credentials[nextEmail] = this.state.credentials[previousEmail];
      delete this.state.credentials[previousEmail];
    }
    this.state.users[index] = user;
    this.persist();
    return this.respond(user);
  }

  getSettings(): Observable<AppSettings> {
    return this.respond({ ...this.state.settings });
  }

  updateSettings(patch: Partial<AppSettings>): Observable<AppSettings> {
    this.state.settings = { ...this.state.settings, ...patch };
    this.persist();
    return this.respond({ ...this.state.settings });
  }

  getNotifications(): Observable<NotificationItem[]> {
    return this.respond([...this.state.notifications]);
  }

  pushNotification(notification: Omit<NotificationItem, "id">): Observable<NotificationItem[]> {
    this.state.notifications.unshift({
      id: this.nextId("notification"),
      ...notification
    });
    this.persist();
    return this.getNotifications();
  }

  dismissNotification(id: string): Observable<NotificationItem[]> {
    this.state.notifications = this.state.notifications.filter((item) => item.id !== id);
    this.persist();
    return this.getNotifications();
  }

  // POS
  getPosState(): Observable<PosState> {
    return this.respond({
      ...this.state.pos,
      cart: this.state.pos.cart.map((item) => ({ ...item })),
      suspendedSales: this.state.pos.suspendedSales.map((item) => ({ ...item, items: item.items.map((line) => ({ ...line })) }))
    });
  }

  listPosProducts(search = "", department = ""): Observable<Product[]> {
    const q = search.trim().toLowerCase();
    const dept = department.trim().toLowerCase();
    const items = this.state.products
      .map((item) => this.hydrateProduct(item))
      .filter((item) => {
        const matchesQuery =
          !q || this.matches(item.name, q) || this.matches(item.barcode, q) || this.matches(item.department, q) || this.matches(item.sku, q);
        const matchesDept = !dept || (item.department ?? "").toLowerCase() === dept;
        return matchesQuery && matchesDept;
      });
    return this.respond(items);
  }

  addPosLine(productId: string, quantity = 1): Observable<PosState> {
    const product = this.state.products.find((item) => item._id === productId);
    if (!product) {
      return new Observable<PosState>((subscriber) => subscriber.error({ error: { message: "Product not found." } }));
    }

    const index = this.state.pos.cart.findIndex((item) => item.productId === productId);
    if (index >= 0) {
      this.state.pos.cart[index].quantity += quantity;
    } else {
      this.state.pos.cart.unshift({
        productId: product._id,
        name: product.name,
        department: product.department || "Unassigned",
        barcode: product.barcode,
        quantity,
        unitPrice: Number(product.sellingPrice ?? 0),
        stockQuantity: Number(product.stockQuantity ?? 0),
        status: this.productStatus(product)
      });
    }

    this.persist();
    return this.getPosState();
  }

  updatePosLineQuantity(productId: string, quantity: number): Observable<PosState> {
    const index = this.state.pos.cart.findIndex((item) => item.productId === productId);
    if (index >= 0) {
      if (quantity <= 0) {
        this.state.pos.cart.splice(index, 1);
      } else {
        this.state.pos.cart[index].quantity = quantity;
      }
      this.persist();
    }
    return this.getPosState();
  }

  removePosLine(productId: string): Observable<PosState> {
    this.state.pos.cart = this.state.pos.cart.filter((item) => item.productId !== productId);
    this.persist();
    return this.getPosState();
  }

  setPaymentMethod(method: PosState["paymentMethod"]): Observable<PosState> {
    this.state.pos.paymentMethod = method;
    this.persist();
    return this.getPosState();
  }

  setCustomerName(customerName: string): Observable<PosState> {
    this.state.pos.customerName = customerName;
    this.persist();
    return this.getPosState();
  }

  setDiscount(discount: number): Observable<PosState> {
    this.state.pos.discount = Math.max(0, discount);
    this.persist();
    return this.getPosState();
  }

  suspendSale(name = "Suspended sale"): Observable<PosState> {
    if (!this.state.pos.cart.length) {
      return this.getPosState();
    }

    this.state.pos.suspendedSales.unshift({
      id: this.nextId("suspendedSale"),
      name,
      items: this.state.pos.cart.map((item) => ({ ...item })),
      subtotal: this.calculateSubtotal(this.state.pos.cart),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
    this.state.pos.cart = [];
    this.state.pos.discount = 0;
    this.persist();
    return this.getPosState();
  }

  resumeSuspendedSale(id: string): Observable<PosState> {
    const index = this.state.pos.suspendedSales.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.state.pos.cart = this.state.pos.suspendedSales[index].items.map((item) => ({ ...item }));
      this.state.pos.suspendedSales.splice(index, 1);
      this.persist();
    }
    return this.getPosState();
  }

  completeSale(payload?: { paymentMethod?: PosState["paymentMethod"] }): Observable<SaleRecord> {
    if (!this.state.pos.cart.length) {
      return new Observable<SaleRecord>((subscriber) => subscriber.error({ error: { message: "Add at least one item to complete the sale." } }));
    }

    if (payload?.paymentMethod) {
      this.state.pos.paymentMethod = payload.paymentMethod;
    }

    const subtotal = this.calculateSubtotal(this.state.pos.cart);
    const discount = Math.max(0, Math.min(this.state.pos.discount, subtotal));
    const total = subtotal - discount;
    const record: SaleRecord = {
      id: this.nextId("sale"),
      orderId: `GC-${1000 + this.state.sales.length + 1}`,
      cashier: this.getCurrentSessionUser()?.name ?? "Cashier",
      department: this.state.pos.cart[0]?.department ?? "Mixed",
      itemCount: this.state.pos.cart.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      discount,
      total,
      paymentMethod: this.state.pos.paymentMethod,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "completed"
    };

    this.state.sales.unshift(record);
    this.state.pos.lastSale = record;
    this.state.pos.cart = [];
    this.state.pos.discount = 0;
    this.persist();
    return this.respond(record);
  }

  chargeCustomer(): Observable<SaleRecord> {
    return this.completeSale();
  }

  clearPosCart(): Observable<PosState> {
    this.state.pos.cart = [];
    this.state.pos.discount = 0;
    this.state.pos.customerName = "Walk-in customer";
    this.persist();
    return this.getPosState();
  }

  private calculateSubtotal(lines: CartLine[]): number {
    return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  }
}
