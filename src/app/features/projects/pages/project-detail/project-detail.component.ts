import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Project } from '../../../../models';

@Component({
  selector: 'app-project-detail',
  template: `
    <div *ngIf="isLoading" class="flex justify-center py-12">
      <app-loading-spinner size="lg"></app-loading-spinner>
    </div>

    <div *ngIf="!isLoading && project">
      <!-- Header -->
      <div class="mb-6">
        <button
          (click)="goBack()"
          class="flex items-center gap-2 text-secondary-500 hover:text-secondary-700 mb-4"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>

        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-secondary-900">{{ project.name }}</h1>
            <p class="text-secondary-500 mt-1">{{ project.description || 'No description' }}</p>
          </div>
          <div class="flex items-center gap-3">
            <app-status-badge [status]="project.status" type="project"></app-status-badge>
            <button
              *ngIf="canModify"
              (click)="openEditModal()"
              class="p-2 text-secondary-400 hover:text-primary-600 transition-colors"
              title="Edit Project"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              *ngIf="canModify"
              (click)="confirmDelete()"
              class="p-2 text-secondary-400 hover:text-red-600 transition-colors"
              title="Delete Project"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tasks Section -->
        <div class="lg:col-span-2 card">
          <h2 class="text-lg font-semibold text-secondary-900 mb-4">Tasks</h2>
          
          <div *ngIf="!project.tasks || project.tasks.length === 0">
            <app-empty-state
              icon="document"
              title="No tasks yet"
              message="Create tasks to track work for this project."
            ></app-empty-state>
          </div>

          <div *ngIf="project.tasks && project.tasks.length > 0" class="space-y-3">
            <div
              *ngFor="let task of project.tasks"
              class="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium text-secondary-900 truncate">{{ task.title }}</p>
              </div>
              <app-status-badge [status]="task.status" type="task"></app-status-badge>
              <app-status-badge [status]="task.priority" type="priority"></app-status-badge>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Project Info -->
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-4">Project Info</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm text-secondary-500">Created</dt>
                <dd class="text-secondary-900">{{ project.createdAt | date:'mediumDate' }}</dd>
              </div>
              <div *ngIf="project.startDate">
                <dt class="text-sm text-secondary-500">Start Date</dt>
                <dd class="text-secondary-900">{{ project.startDate | date:'mediumDate' }}</dd>
              </div>
              <div *ngIf="project.endDate">
                <dt class="text-sm text-secondary-500">End Date</dt>
                <dd class="text-secondary-900">{{ project.endDate | date:'mediumDate' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Team Members -->
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-4">Team Members</h3>
            <div *ngIf="!project.members || project.members.length === 0" class="text-secondary-500 text-sm">
              No members assigned
            </div>
            <div *ngIf="project.members && project.members.length > 0" class="space-y-3">
              <div
                *ngFor="let member of project.members"
                class="flex items-center gap-3"
              >
                <app-avatar
                  [name]="member.firstName + ' ' + member.lastName"
                  size="sm"
                ></app-avatar>
                <div>
                  <p class="text-sm font-medium text-secondary-900">
                    {{ member.firstName }} {{ member.lastName }}
                  </p>
                  <p class="text-xs text-secondary-500">{{ member.role }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Project Modal -->
      <app-project-edit-modal
        *ngIf="showEditModal && project"
        [project]="project"
        (onCloseEvent)="handleEditModalClose($event)"
      ></app-project-edit-modal>
    </div>
  `,
  styles: [],
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  isLoading = true;
  showEditModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  get canModify(): boolean {
    return this.authService.isManager();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(id);
    }
  }

  loadProject(id: string): void {
    this.projectService.getById(id).subscribe({
      next: (response) => {
        this.project = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/projects']);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  openEditModal(): void {
    this.showEditModal = true;
  }

  handleEditModalClose(shouldRefresh: boolean): void {
    this.showEditModal = false;
    if (shouldRefresh && this.project) {
      this.loadProject(this.project.id);
    }
  }

  confirmDelete(): void {
    if (!this.project) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${this.project.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      this.deleteProject();
    }
  }

  deleteProject(): void {
    if (!this.project) return;

    this.projectService.delete(this.project.id).subscribe({
      next: () => {
        this.toastr.success('Project deleted successfully');
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'Failed to delete project');
      },
    });
  }
}
