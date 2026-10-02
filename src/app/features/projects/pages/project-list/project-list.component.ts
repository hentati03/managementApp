import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../../core/services/project.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Project, ProjectStatus } from '../../../../models';

@Component({
  selector: 'app-project-list',
  template: `
    <div>
      <app-page-header
        title="Projects"
        subtitle="Manage and track all your projects"
        [actionText]="canCreate ? 'New Project' : undefined"
        (action)="showCreateModal = true"
      >
        <!-- Filters -->
        <div class="flex items-center gap-3">
          <select
            [(ngModel)]="statusFilter"
            (change)="loadProjects()"
            class="input-field w-40"
          >
            <option value="">All Status</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search projects..."
            class="input-field w-64"
          />
        </div>
      </app-page-header>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <app-loading-spinner size="lg"></app-loading-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && projects.length === 0">
        <app-empty-state
          icon="folder"
          title="No projects found"
          description="Get started by creating your first project."
          [actionLabel]="canCreate ? 'Create Project' : ''"
          (action)="showCreateModal = true"
        ></app-empty-state>
      </div>

      <!-- Project Grid -->
      <div *ngIf="!isLoading && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let project of projects"
          class="card hover:shadow-md transition-shadow cursor-pointer"
          (click)="goToProject(project)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-secondary-900 truncate">{{ project.name }}</h3>
              <p class="text-sm text-secondary-500 mt-1 line-clamp-2">
                {{ project.description || 'No description' }}
              </p>
            </div>
            <app-status-badge [status]="project.status" type="project"></app-status-badge>
          </div>

          <!-- Progress -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-secondary-500">Progress</span>
              <span class="font-medium text-secondary-700">{{ getProgress(project) }}%</span>
            </div>
            <div class="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-600 rounded-full transition-all duration-300"
                [style.width.%]="getProgress(project)"
              ></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-3 border-t border-secondary-100">
            <div class="flex -space-x-2">
              <div
                *ngFor="let member of (project.members || []).slice(0, 4)"
                class="w-8 h-8 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                [title]="member.firstName + ' ' + member.lastName"
              >
                {{ member.firstName?.charAt(0) }}{{ member.lastName?.charAt(0) }}
              </div>
              <div
                *ngIf="(project.members?.length || 0) > 4"
                class="w-8 h-8 rounded-full bg-secondary-300 border-2 border-white flex items-center justify-center text-secondary-600 text-xs font-medium"
              >
                +{{ (project.members?.length || 0) - 4 }}
              </div>
            </div>
            <div class="text-sm text-secondary-500">
              {{ project.tasks?.length || 0 }} tasks
            </div>
          </div>
        </div>
      </div>

      <!-- Create Project Modal -->
      <app-project-create-modal
        *ngIf="showCreateModal"
        (onClose)="handleModalClose($event)"
      ></app-project-create-modal>
    </div>
  `,
  styles: [],
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  statusFilter = '';
  searchQuery = '';
  showCreateModal = false;
  private searchTimeout: any;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  get canCreate(): boolean {
    return this.authService.isManager();
  }

  loadProjects(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    // Team members and project managers see only their projects
    // Admins see all projects
    const isAdmin = this.authService.isAdmin();
    
    this.projectService
      .getAll({
        status: this.statusFilter || undefined,
        search: this.searchQuery || undefined,
      })
      .subscribe({
        next: (response) => {
          let allProjects = response.data || [];
          
          // Filter projects based on user role
          if (!isAdmin && currentUser) {
            allProjects = allProjects.filter(project => 
              project.memberIds?.includes(currentUser.id)
            );
          }
          
          this.projects = allProjects;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadProjects();
    }, 300);
  }

  getProgress(project: Project): number {
    const tasks = project.tasks || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t: any) => t.status === 'DONE').length;
    return Math.round((completed / tasks.length) * 100);
  }

  goToProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  handleModalClose(result: any): void {
    this.showCreateModal = false;
    if (result) {
      this.projects.unshift(result);
    }
  }
}
