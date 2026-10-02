import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TaskService } from '../../../../core/services/task.service';
import { ProjectService } from '../../../../core/services/project.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Project, User, Role } from '../../../../models';

@Component({
  selector: 'app-task-create-modal',
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-xl shadow-2xl max-w-[500px] max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-secondary-900 mb-4">
            Create New Task
          </h2>
          <div class="space-y-4 min-w-[400px]">
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            [(ngModel)]="title"
            class="input-field w-full"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">
            Description
          </label>
          <textarea
            [(ngModel)]="description"
            rows="3"
            class="input-field w-full"
            placeholder="Enter task description"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">
            Project *
          </label>
          <select [(ngModel)]="projectId" class="input-field w-full">
            <option value="">Select a project</option>
            <option *ngFor="let project of projects" [value]="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <!-- Assignee - Only for Admin/PM -->
        <div *ngIf="canAssignOthers">
          <label class="block text-sm font-medium text-secondary-700 mb-1">
            Assignee
          </label>
          <select [(ngModel)]="assigneeId" class="input-field w-full">
            <option value="">Select assignee</option>
            <option *ngFor="let user of teamMembers" [value]="user.id">
              {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>
        <div *ngIf="!canAssignOthers" class="bg-secondary-50 rounded-lg p-3">
          <p class="text-sm text-secondary-600">
            Task will be assigned to you: <strong>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</strong>
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Priority
            </label>
            <select [(ngModel)]="priority" class="input-field w-full">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Status
            </label>
            <select [(ngModel)]="status" class="input-field w-full">
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              [(ngModel)]="dueDate"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              [(ngModel)]="estimatedHours"
              min="0"
              class="input-field w-full"
              placeholder="e.g., 2"
            />
          </div>
        </div>
      </div>
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-secondary-200">
            <button type="button" class="btn-secondary" (click)="onCancel()">
              Cancel
            </button>
            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="isSubmitting || !isValid()"
              class="btn-primary"
            >
              <span *ngIf="isSubmitting">Creating...</span>
              <span *ngIf="!isSubmitting">Create Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TaskCreateModalComponent implements OnInit {
  @Output() onClose = new EventEmitter<any>();

  title = '';
  description = '';
  projectId = '';
  assigneeId = '';
  priority = 'MEDIUM';
  status = 'TODO';
  dueDate = '';
  estimatedHours: number | null = null;

  projects: Project[] = [];
  teamMembers: User[] = [];
  currentUser: User | null = null;
  isSubmitting = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProjects();
    if (this.canAssignOthers) {
      this.loadTeamMembers();
    }
  }

  get canAssignOthers(): boolean {
    return this.authService.isManager();
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (response) => {
        this.projects = response.data || [];
      },
    });
  }

  loadTeamMembers(): void {
    this.userService.getAll().subscribe({
      next: (response) => {
        this.teamMembers = (response.data || []).filter(
          (u) => u.role === Role.TEAM_MEMBER
        );
      },
    });
  }

  isValid(): boolean {
    return !!this.title.trim() && !!this.projectId;
  }

  onCancel(): void {
    this.onClose.emit(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    this.isSubmitting = true;

    // If user is an employee, auto-assign to self
    const finalAssigneeId = this.canAssignOthers
      ? this.assigneeId || undefined
      : this.currentUser?.id;

    this.taskService
      .create({
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        projectId: this.projectId,
        assigneeId: finalAssigneeId,
        priority: this.priority as any,
        status: this.status as any,
        dueDate: this.dueDate || undefined,
        estimatedHours: this.estimatedHours || undefined,
      })
      .subscribe({
        next: (response) => {
          this.toastr.success('Task created successfully');
          this.onClose.emit(response.data);
        },
        error: () => {
          this.toastr.error('Failed to create task');
          this.isSubmitting = false;
        },
      });
  }
}
