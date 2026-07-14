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
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
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
