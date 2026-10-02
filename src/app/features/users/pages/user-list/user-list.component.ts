import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../core/services/user.service';
import { User, Role } from '../../../../models';

@Component({
  selector: 'app-user-list',
  template: `
    <div>
      <app-page-header
        title="Users"
        subtitle="Manage user accounts"
        actionText="Add User"
        (action)="openCreateDialog()"
      >
        <div class="flex items-center gap-3">
          <select [(ngModel)]="roleFilter" (change)="loadUsers()" class="input-field w-40">
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="TEAM_MEMBER">Team Member</option>
            <option value="CLIENT">Client</option>
          </select>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search users..."
            class="input-field w-64"
          />
        </div>
      </app-page-header>

      <div *ngIf="isLoading" class="flex justify-center py-12">
        <app-loading-spinner size="lg"></app-loading-spinner>
      </div>

      <div *ngIf="!isLoading && users.length === 0">
        <app-empty-state
          icon="group"
          title="No users found"
          description="Add users to start building your team."
          actionLabel="Add User"
          (action)="openCreateDialog()"
        ></app-empty-state>
      </div>

      <div *ngIf="!isLoading && users.length > 0" class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-secondary-600">User</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-secondary-600">Email</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-secondary-600">Role</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-secondary-600">Status</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-secondary-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-secondary-200">
            <tr *ngFor="let user of users" class="hover:bg-secondary-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <app-avatar [name]="user.firstName + ' ' + user.lastName" size="sm"></app-avatar>
                  <div>
                    <p class="font-medium text-secondary-900">{{ user.firstName }} {{ user.lastName }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-secondary-600">{{ user.email }}</td>
              <td class="px-4 py-3">
                <app-status-badge [status]="user.role" type="role"></app-status-badge>
              </td>
              <td class="px-4 py-3">
                <span
                  class="badge"
                  [ngClass]="user.isActive ? 'badge-success' : 'badge-danger'"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    class="p-2 text-secondary-400 hover:text-secondary-600"
                    (click)="editUser(user)"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="p-2 text-secondary-400 hover:text-red-600"
                    (click)="toggleUserStatus(user)"
                    [title]="user.isActive ? 'Deactivate' : 'Activate'"
                  >
                    <svg *ngIf="user.isActive" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <svg *ngIf="!user.isActive" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create User Modal -->
      <app-user-create-modal
        *ngIf="showCreateModal"
        (onCloseEvent)="handleCreateModalClose($event)"
      ></app-user-create-modal>

      <!-- Edit User Modal -->
      <app-user-edit-modal
        *ngIf="showEditModal && selectedUser"
        [user]="selectedUser"
        (onCloseEvent)="handleEditModalClose($event)"
      ></app-user-edit-modal>
    </div>
  `,
  styles: [],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  roleFilter = '';
  searchQuery = '';
  showCreateModal = false;
  showEditModal = false;
  selectedUser: User | null = null;
  private searchTimeout: any;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService
      .getAll({
        role: this.roleFilter || undefined,
        search: this.searchQuery || undefined,
      })
      .subscribe({
        next: (response) => {
          this.users = response.data || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadUsers(), 300);
  }

  openCreateDialog(): void {
    this.showCreateModal = true;
  }

  handleCreateModalClose(shouldRefresh: boolean): void {
    this.showCreateModal = false;
    if (shouldRefresh) {
      this.loadUsers();
    }
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.showEditModal = true;
  }

  handleEditModalClose(shouldRefresh: boolean): void {
    this.showEditModal = false;
    this.selectedUser = null;
    if (shouldRefresh) {
      this.loadUsers();
    }
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const confirmMessage = `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`;
    
    if (confirm(confirmMessage)) {
      this.userService.toggleActive(user.id).subscribe({
        next: (response) => {
          const index = this.users.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            this.users[index] = response.data;
          }
          this.toastr.success(`User ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
        },
        error: (error) => {
          this.toastr.error(error?.error?.message || 'Failed to update user status');
        },
      });
    }
  }
}
