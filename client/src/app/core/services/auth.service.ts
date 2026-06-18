import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { User } from "../models/user.model";
import { API_BASE_URL } from "./api.service";

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

interface MeResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly apiUrl = `${API_BASE_URL}/auth`;
  private readonly tokenKey = "mallos_token";
  private readonly userKey = "mallos_user";
  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.readUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((response) => this.storeSession(response.data)), map((response) => response.data.user));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
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
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(
        tap((response) => {
          if (persistSession) {
            this.storeSession(response.data);
          }
        }),
        map((response) => response.data.user)
      );
  }

  me(): Observable<User> {
    return this.http
      .get<MeResponse>(`${this.apiUrl}/me`)
      .pipe(map((response) => response.data.user));
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

  private storeSession(data: { token: string; user: User }): void {
    localStorage.setItem(this.tokenKey, data.token);
    localStorage.setItem(this.userKey, JSON.stringify(data.user));
    this.currentUserSubject.next(data.user);
  }

  private readUser(): User | null {
    const rawUser = localStorage.getItem(this.userKey);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  }
}
