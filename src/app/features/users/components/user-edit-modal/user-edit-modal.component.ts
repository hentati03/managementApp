import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { User, Role } from '../../../../models';

@Component({
  selector: 'app-user-edit-modal',
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 class="text-xl font-semibold text-secondary-900">Edit User</h2>
          <button (click)="onClose()" class="text-secondary-400 hover:text-secondary-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="font-medium text-secondary-900">Personal Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-1">
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="firstName"
                  class="input-field w-full"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-1">
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="lastName"
                  class="input-field w-full"
                  placeholder="Enter last name"
                />
              </div>
            </div>
          </div>

          <!-- Account Information -->
          <div class="space-y-4">
            <h3 class="font-medium text-secondary-900">Account Information</h3>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                [(ngModel)]="email"
                class="input-field w-full"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Role <span class="text-red-500">*</span>
              </label>
              <select [(ngModel)]="role" class="input-field w-full">
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="ADMIN">Administrator</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Status
              </label>
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    [value]="true"
                    [(ngModel)]="isActive"
                    name="status"
                    class="w-4 h-4 text-primary-600"
                  />
                  <span class="text-sm text-secondary-700">Active</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    [value]="false"
                    [(ngModel)]="isActive"
                    name="status"
                    class="w-4 h-4 text-primary-600"
                  />
                  <span class="text-sm text-secondary-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Optional Information -->
          <div class="space-y-4">
            <h3 class="font-medium text-secondary-900">Additional Information</h3>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Bio
              </label>
              <textarea
                [(ngModel)]="bio"
                class="input-field w-full"
                rows="3"
                placeholder="Brief description about the user"
              ></textarea>
            </div>
          </div>

          <!-- Password Reset -->
          <div class="space-y-4">
            <h3 class="font-medium text-secondary-900">Password (Optional)</h3>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                [(ngModel)]="password"
                class="input-field w-full"
                placeholder="Leave blank to keep current password"
              />
              <p class="text-xs text-secondary-500 mt-1">
                Minimum 6 characters. Leave blank to keep current password.
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-secondary-200">
            <button
              type="button"
              (click)="onClose()"
              class="btn-secondary"
              [disabled]="isSubmitting"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              class="btn-primary"
              [disabled]="isSubmitting || !isValid()"
            >
              <span *ngIf="isSubmitting">Updating...</span>
              <span *ngIf="!isSubmitting">Update User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class UserEditModalComponent implements OnInit {
  @Input() user!: User;
  @Output() onCloseEvent = new EventEmitter<boolean>();

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  role = '';
  bio = '';
  isActive = true;
  isSubmitting = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.user) {
      this.firstName = this.user.firstName || '';
      this.lastName = this.user.lastName || '';
      this.email = this.user.email || '';
      this.role = this.user.role || 'TEAM_MEMBER';
      this.bio = this.user.bio || '';
      this.isActive = this.user.isActive !== undefined ? this.user.isActive : true;
    }
  }

  isValid(): boolean {
    const basicValid = !!(
      this.firstName.trim() &&
      this.lastName.trim() &&
      this.email.trim() &&
      this.role
    );

    if (!basicValid) return false;

    // If password is provided, it must be at least 6 characters
    if (this.password && this.password.length < 6) {
      return false;
    }

    return true;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    if (!this.isSubmitting) {
      this.onCloseEvent.emit(false);
    }
  }

  onSubmit(): void {
    if (!this.isValid()) {
      this.toastr.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;

    const userData: any = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim().toLowerCase(),
      role: this.role as Role,
      bio: this.bio.trim() || undefined,
      isActive: this.isActive,
    };

    // Only include password if it's provided
    if (this.password && this.password.trim()) {
      userData.password = this.password;
    }

    this.userService.update(this.user.id, userData).subscribe({
      next: (response) => {
        this.toastr.success('User updated successfully');
        this.onCloseEvent.emit(true);
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'Failed to update user');
        this.isSubmitting = false;
      },
    });
  }
}
