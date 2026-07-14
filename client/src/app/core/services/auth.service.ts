import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { User } from "../models/user.model";
import { API_BASE_URL } from "./api.service";

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly tokenKey = "mallos_token";
  private readonly userKey = "mallos_user";
  private readonly currentUserSubject: BehaviorSubject<User | null>;
  readonly currentUser$: Observable<User | null>;

  constructor(private readonly http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.readUser());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/login`, { email, password }).pipe(
      tap((response) => this.storeSession(response.data.token, response.data.user)),
      map((response) => response.data.user)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  register(
    payload: {
      name: string;
      email: string;
      password: string;
      role: User["role"];
      department?: string;
      status?: "active" | "inactive";
    },
    persistSession = true
  ): Observable<User> {
    return this.http.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/register`, payload).pipe(
      tap((response) => {
        if (persistSession) {
          this.storeSession(response.data.token, response.data.user);
        }
      }),
      map((response) => response.data.user)
    );
  }

  me(): Observable<User> {
    return this.http.get<ApiResponse<{ user: User }>>(`${API_BASE_URL}/auth/me`).pipe(
      map((response) => response.data.user),
      tap((user) => this.currentUserSubject.next(user))
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

  private storeSession(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readUser(): User | null {
    const rawUser = localStorage.getItem(this.userKey);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  }
}
