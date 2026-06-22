import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { User } from "../models/user.model";
import { MallDataService } from "./mall-data.service";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly tokenKey = "mallos_token";
  private readonly userKey = "mallos_user";
  private readonly currentUserSubject: BehaviorSubject<User | null>;
  readonly currentUser$: Observable<User | null>;

  constructor(private readonly mallData: MallDataService) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.readUser() ?? this.mallData.getCurrentSessionUser());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<User> {
    return this.mallData.login(email, password).pipe(
      tap((user) => this.storeSession(user)),
      map((user) => user)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.mallData.logout();
    this.currentUserSubject.next(null);
  }

  register(payload: {
    name: string;
    email: string;
    password: string;
    role: User["role"];
    department?: string;
    status?: "active" | "inactive";
  }, persistSession = true): Observable<User> {
    return this.mallData.register(payload).pipe(
      tap((user) => {
        if (persistSession) {
          this.storeSession(user);
        }
      }),
      map((user) => user)
    );
  }

  me(): Observable<User> {
    return this.mallData.me().pipe(
      tap((user) => this.currentUserSubject.next(user)),
      map((user) => user)
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  private storeSession(user: User): void {
    const token = `mock-${user.role}-${Date.now()}`;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readUser(): User | null {
    const rawUser = localStorage.getItem(this.userKey);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  }
}
