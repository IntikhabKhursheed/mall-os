import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { MallDataService } from "../core/services/mall-data.service";
import { User } from "../core/models/user.model";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgFor, PageHeaderComponent],
  template: `
    <app-page-header
      eyebrow="System"
      title="Access control"
      subtitle="Manage system access and keep administrative accounts organized."
    >
      <div actions>
        <button type="button" class="secondary" (click)="resetFilters()">Reset</button>
      </div>
    </app-page-header>

    <section class="toolbar surface-panel">
      <input [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()" type="search" placeholder="Search by name, email, role, or department" />
      <select [(ngModel)]="roleFilter" (ngModelChange)="applyFilter()">
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="cashier">Cashier</option>
      </select>
    </section>

    <section class="grid-cards">
      <article class="surface-panel metric-card" *ngFor="let user of filteredUsers">
        <div class="user-row">
          <div class="avatar">{{ initials(user.name) }}</div>
          <div>
            <h3>{{ user.name }}</h3>
            <p class="muted">{{ user.email }}</p>
          </div>
          <span class="badge" [ngClass]="user.status || 'active'">{{ user.role }}</span>
        </div>
        <p class="muted">Department: {{ user.department || "Unassigned" }}</p>
        <div class="actions">
          <button type="button" class="secondary" (click)="startEdit(user)">Edit</button>
          <button type="button" class="secondary" (click)="promote(user)" [disabled]="user.role === 'admin'">Promote</button>
          <button type="button" class="danger" (click)="toggleStatus(user)">{{ user.status === 'active' ? 'Deactivate' : 'Activate' }}</button>
        </div>
      </article>
    </section>

    <section class="surface-panel metric-card form-card">
      <div class="section-head">
        <div>
          <div class="eyebrow">Quick edit</div>
          <h3>Update selected account</h3>
        </div>
      </div>

      <form class="form-grid cols-2" [formGroup]="form" (ngSubmit)="saveUser()">
        <label>
          Name
          <input formControlName="name" type="text" />
        </label>
        <label>
          Email
          <input formControlName="email" type="email" />
        </label>
        <label>
          Role
          <select formControlName="role">
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="cashier">cashier</option>
          </select>
        </label>
        <label>
          Department
          <input formControlName="department" type="text" />
        </label>
        <div class="actions span-2">
          <button type="submit" class="primary" [disabled]="form.invalid">Save Account</button>
          <button type="button" class="secondary" (click)="resetForm()">Clear</button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
      }

      .toolbar {
        display: grid;
        grid-template-columns: 1fr 220px;
        gap: 0.75rem;
        padding: 1rem;
      }

      .metric-card,
      .form-card {
        padding: 1rem;
      }

      .grid-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
      }

      .user-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.85rem;
        align-items: center;
      }

      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #14b8a6, #8b5cf6);
        color: #ffffff;
        display: grid;
        place-items: center;
        font-weight: 800;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .span-2 {
        grid-column: span 2;
      }

      @media (max-width: 720px) {
        .toolbar,
        .user-row,
        .span-2 {
          grid-template-columns: 1fr;
          grid-column: auto;
        }
      }
    `
  ]
})
export class UsersComponent implements OnInit {
  private readonly mallData = inject(MallDataService);
  private readonly fb = inject(FormBuilder);

  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = "";
  roleFilter = "";
  selectedUserId: string | null = null;

  form = this.fb.group({
    name: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    role: ["cashier" as User["role"], [Validators.required]],
    department: [""]
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.mallData.getUsers().subscribe((users) => {
      this.users = users;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const query = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.users.filter((user) => {
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        (user.department ?? "").toLowerCase().includes(query);
      const matchesRole = !this.roleFilter || user.role === this.roleFilter;
      return matchesQuery && matchesRole;
    });
  }

  resetFilters(): void {
    this.searchTerm = "";
    this.roleFilter = "";
    this.applyFilter();
  }

  promote(user: User): void {
    if (user.role === "admin") {
      return;
    }
    const nextRole = user.role === "manager" ? "admin" : "manager";
    this.mallData.updateUser(user._id, { role: nextRole }).subscribe(() => this.loadUsers());
  }

  startEdit(user: User): void {
    this.selectedUserId = user._id;
    this.form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || ""
    });
  }

  toggleStatus(user: User): void {
    this.mallData.updateUser(user._id, { status: user.status === "active" ? "inactive" : "active" }).subscribe(() => this.loadUsers());
  }

  initials(name: string): string {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  saveUser(): void {
    if (this.form.invalid || !this.selectedUserId) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.form.getRawValue().name ?? "",
      email: this.form.getRawValue().email ?? "",
      role: (this.form.getRawValue().role ?? "cashier") as User["role"],
      department: this.form.getRawValue().department ?? ""
    };
    this.mallData.updateUser(this.selectedUserId, payload).subscribe(() => {
      this.loadUsers();
      this.resetForm();
    });
  }

  resetForm(): void {
    this.selectedUserId = null;
    this.form.reset({ name: "", email: "", role: "cashier", department: "" });
  }
}
