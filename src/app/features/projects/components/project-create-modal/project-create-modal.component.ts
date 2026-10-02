import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../../core/services/project.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../models';

@Component({
  selector: 'app-project-create-modal',
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-xl shadow-2xl p-6 min-w-[500px] max-w-[600px] max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
      <h2 class="text-xl font-semibold text-secondary-900 mb-6">Create New Project</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              formControlName="name"
              class="input-field w-full"
              placeholder="Enter project name"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              formControlName="description"
              class="input-field w-full"
              rows="3"
              placeholder="Enter project description"
            ></textarea>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                formControlName="startDate"
                class="input-field w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                formControlName="endDate"
                class="input-field w-full"
              />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Status
            </label>
            <select formControlName="status" class="input-field w-full">
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <!-- Members -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Team Members
            </label>
            <div class="border border-secondary-300 rounded-lg max-h-40 overflow-y-auto">
              <label
                *ngFor="let user of availableUsers"
                class="flex items-center gap-3 p-3 hover:bg-secondary-50 cursor-pointer border-b border-secondary-100 last:border-0"
              >
                <input
                  type="checkbox"
                  [value]="user.id"
                  (change)="onMemberToggle(user.id, $event)"
                  [checked]="selectedMembers.includes(user.id)"
                  class="w-4 h-4 text-primary-600 rounded border-secondary-300"
                />
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">
                    {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-secondary-900">
                      {{ user.firstName }} {{ user.lastName }}
                    </p>
                    <p class="text-xs text-secondary-500">{{ user.role }}</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-secondary-200">
          <button type="button" class="btn-secondary" (click)="onCancel()">
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            [disabled]="form.invalid || isSubmitting"
          >
            {{ isSubmitting ? 'Creating...' : 'Create Project' }}
          </button>
        </div>
      </form>
      </div>
    </div>
  `,
})
export class ProjectCreateModalComponent implements OnInit {
  @Output() onClose = new EventEmitter<any>();
  
  form: FormGroup;
  availableUsers: User[] = [];
  selectedMembers: string[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      startDate: [''],
      endDate: [''],
      status: ['ACTIVE'],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (response) => {
        this.availableUsers = (response.data || []).filter(u => u.isActive);
      },
    });
  }

  onMemberToggle(userId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedMembers.push(userId);
    } else {
      this.selectedMembers = this.selectedMembers.filter(id => id !== userId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const formValue = this.form.value;

    this.projectService.create({
      name: formValue.name,
      description: formValue.description || undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      status: formValue.status,
      memberIds: this.selectedMembers,
    }).subscribe({
      next: (response) => {
        this.toastr.success('Project created successfully');
        this.onClose.emit(response.data);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to create project');
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.onClose.emit(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
