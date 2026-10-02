import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { User, Role } from '../../../../models';

@Component({
  selector: 'app-profile',
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <app-page-header
        title="My Profile"
        subtitle="Manage your personal information and settings"
      ></app-page-header>

      <div class="card">
        <!-- Avatar Section -->
        <div class="flex flex-col items-center pb-6 border-b border-secondary-200">
          <div class="relative group">
            <div
              class="w-32 h-32 rounded-full overflow-hidden bg-secondary-200 flex items-center justify-center"
            >
              <img
                *ngIf="avatarPreview || user?.avatar"
                [src]="avatarPreview || user?.avatar"
                alt="Profile avatar"
                class="w-full h-full object-cover"
              />
              <span
                *ngIf="!avatarPreview && !user?.avatar"
                class="text-4xl font-bold text-secondary-400"
              >
                {{ getInitials() }}
              </span>
            </div>
            <button
              (click)="fileInput.click()"
              class="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              #fileInput
              type="file"
              accept="image/*"
              (change)="onFileSelected($event)"
              class="hidden"
            />
          </div>
          <p class="text-sm text-secondary-500 mt-3">
            Click the camera icon to upload a new photo
          </p>
        </div>

        <!-- Profile Form -->
        <div class="pt-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                First Name
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
                Last Name
              </label>
              <input
                type="text"
                [(ngModel)]="lastName"
                class="input-field w-full"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              [(ngModel)]="email"
              class="input-field w-full bg-secondary-50"
              readonly
            />
            <p class="text-xs text-secondary-500 mt-1">
              Email cannot be changed. Contact admin for assistance.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Role
            </label>
            <div class="flex items-center gap-2">
              <span
                class="px-3 py-1.5 rounded-full text-sm font-medium"
                [ngClass]="{
                  'bg-red-100 text-red-700': user?.role === 'ADMIN',
                  'bg-blue-100 text-blue-700': user?.role === 'PROJECT_MANAGER',
                  'bg-green-100 text-green-700': user?.role === 'TEAM_MEMBER'
                }"
              >
                {{ getRoleLabel() }}
              </span>
            </div>
          </div>

          <div class="border-t border-secondary-200 pt-6">
            <h3 class="font-semibold text-secondary-900 mb-4">Change Password</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  [(ngModel)]="currentPassword"
                  class="input-field w-full"
                  placeholder="Enter current password"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="newPassword"
                    class="input-field w-full"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="confirmPassword"
                    class="input-field w-full"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              (click)="resetForm()"
              class="btn-secondary"
              [disabled]="isSaving"
            >
              Reset
            </button>
            <button
              (click)="saveProfile()"
              class="btn-primary"
              [disabled]="isSaving"
            >
              <span *ngIf="isSaving">Saving...</span>
              <span *ngIf="!isSaving">Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Account Info -->
      <div class="card">
        <h3 class="font-semibold text-secondary-900 mb-4">Account Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-secondary-500">Member Since</p>
            <p class="font-medium text-secondary-900">
              {{ user?.createdAt | date:'longDate' }}
            </p>
          </div>
          <div>
            <p class="text-secondary-500">Last Updated</p>
            <p class="font-medium text-secondary-900">
              {{ user?.updatedAt | date:'medium' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  user: User | null = null;
  firstName = '';
  lastName = '';
  email = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  avatarPreview: string | null = null;
  avatarBase64: string | null = null;
  isSaving = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadUserData();
  }

  loadUserData(): void {
    if (this.user) {
      this.firstName = this.user.firstName;
      this.lastName = this.user.lastName;
      this.email = this.user.email;
    }
  }

  getInitials(): string {
    if (!this.user) return '';
    return (
      (this.user.firstName?.charAt(0) || '') +
      (this.user.lastName?.charAt(0) || '')
    ).toUpperCase();
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrator',
      PROJECT_MANAGER: 'Project Manager',
      TEAM_MEMBER: 'Team Member',
    };
    return labels[this.user?.role || ''] || this.user?.role || '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
        this.avatarBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  resetForm(): void {
    this.loadUserData();
    this.avatarPreview = null;
    this.avatarBase64 = null;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  saveProfile(): void {
    // Validation
    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.toastr.error('First name and last name are required');
      return;
    }

    if (this.newPassword) {
      if (!this.currentPassword) {
        this.toastr.error('Please enter your current password');
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.toastr.error('New passwords do not match');
        return;
      }
      if (this.newPassword.length < 6) {
        this.toastr.error('Password must be at least 6 characters');
        return;
      }
    }

    this.isSaving = true;

    const updateData: any = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
    };

    if (this.avatarBase64) {
      updateData.avatar = this.avatarBase64;
    }

    if (this.newPassword && this.currentPassword) {
      updateData.currentPassword = this.currentPassword;
      updateData.newPassword = this.newPassword;
    }

    this.userService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.toastr.success('Profile updated successfully');
        // Update local user data
        if (response.data) {
          this.user = response.data;
          this.authService.updateCurrentUser(response.data);
        }
        this.avatarPreview = null;
        this.avatarBase64 = null;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.isSaving = false;
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'Failed to update profile');
        this.isSaving = false;
      },
    });
  }
}
