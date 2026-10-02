import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProjectService } from '../../../../core/services/project.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Project, User } from '../../../../models';

@Component({
  selector: 'app-project-edit-modal',
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 class="text-xl font-semibold text-secondary-900">Edit Project</h2>
          <button (click)="onClose()" class="text-secondary-400 hover:text-secondary-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h3 class="font-medium text-secondary-900">Basic Information</h3>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Project Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="name"
                class="input-field w-full"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Description
              </label>
              <textarea
                [(ngModel)]="description"
                class="input-field w-full"
                rows="3"
                placeholder="Project description"
              ></textarea>
            </div>
          </div>

          <!-- Dates & Status -->
          <div class="space-y-4">
            <h3 class="font-medium text-secondary-900">Schedule & Status</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  [(ngModel)]="startDate"
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  [(ngModel)]="endDate"
                  class="input-field w-full"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Status <span class="text-red-500">*</span>
              </label>
              <select [(ngModel)]="status" class="input-field w-full">
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <!-- Team Members -->
          <div class="space-y-4">
            <h3 class="font-medium text-secondary-900">Team Members</h3>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Assign Members
              </label>
              <div class="space-y-2 max-h-48 overflow-y-auto border border-secondary-200 rounded-lg p-3">
                <label
                  *ngFor="let user of availableUsers"
                  class="flex items-center gap-3 p-2 hover:bg-secondary-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    [checked]="isUserSelected(user.id)"
                    (change)="toggleUser(user.id)"
                    class="w-4 h-4 text-primary-600"
                  />
                  <app-avatar
                    [name]="user.firstName + ' ' + user.lastName"
                    size="xs"
                  ></app-avatar>
                  <span class="text-sm text-secondary-700">
                    {{ user.firstName }} {{ user.lastName }}
                  </span>
                </label>
              </div>
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
              <span *ngIf="!isSubmitting">Update Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ProjectEditModalComponent implements OnInit {
  @Input() project!: Project;
  @Output() onCloseEvent = new EventEmitter<boolean>();

  name = '';
  description = '';
  startDate = '';
  endDate = '';
  status = 'PLANNING';
  memberIds: string[] = [];
  availableUsers: User[] = [];
  isSubmitting = false;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.project) {
      this.name = this.project.name || '';
      this.description = this.project.description || '';
      this.startDate = this.project.startDate ? this.formatDate(this.project.startDate) : '';
      this.endDate = this.project.endDate ? this.formatDate(this.project.endDate) : '';
      this.status = this.project.status || 'PLANNING';
      this.memberIds = this.project.memberIds || [];
    }
    this.loadUsers();
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (response) => {
        this.availableUsers = response.data || [];
      },
    });
  }

  isUserSelected(userId: string): boolean {
    return this.memberIds.includes(userId);
  }

  toggleUser(userId: string): void {
    const index = this.memberIds.indexOf(userId);
    if (index > -1) {
      this.memberIds.splice(index, 1);
    } else {
      this.memberIds.push(userId);
    }
  }

  isValid(): boolean {
    return !!(this.name.trim() && this.status);
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
      this.toastr.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    const projectData: any = {
      name: this.name.trim(),
      description: this.description.trim() || undefined,
      status: this.status,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
      memberIds: this.memberIds.length > 0 ? this.memberIds : undefined,
    };

    this.projectService.update(this.project.id, projectData).subscribe({
      next: (response) => {
        this.toastr.success('Project updated successfully');
        this.onCloseEvent.emit(true);
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'Failed to update project');
        this.isSubmitting = false;
      },
    });
  }
}
