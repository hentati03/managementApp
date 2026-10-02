import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ProjectService } from '../../../../core/services/project.service';
import { TaskService } from '../../../../core/services/task.service';
import { TimeEntryService } from '../../../../core/services/time-entry.service';
import { User, Project, Task, DashboardStats, Role, TimeEntry } from '../../../../models';

interface ProjectDuration {
  projectId: string;
  projectName: string;
  totalMinutes: number;
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-1">Welcome back, {{ user?.firstName }}! 👋</h1>
        <p class="text-primary-100">
          {{ getRoleGreeting() }}
        </p>
      </div>

      <!-- EMPLOYEE DASHBOARD -->
      <ng-container *ngIf="isEmployee">
        <!-- Work Duration Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">This Month</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ formatDuration(monthlyDuration) }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-secondary-500 mt-3">Hours worked this month</p>
          </div>

          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">Total Hours</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ formatDuration(totalDuration) }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-secondary-500 mt-3">All time hours</p>
          </div>

          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">My Tasks</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ myTasks.length }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-secondary-500 mt-3">
              {{ getTasksInProgress() }} in progress
            </p>
          </div>
        </div>

        <!-- Work Duration by Project -->
        <div class="card">
          <h2 class="text-lg font-semibold text-secondary-900 mb-4">Work Duration by Project</h2>
          <div *ngIf="isLoading" class="flex justify-center py-8">
            <app-loading-spinner></app-loading-spinner>
          </div>
          <div *ngIf="!isLoading && projectDurations.length === 0" class="py-8">
            <app-empty-state
              icon="folder"
              title="No work logged yet"
              description="Start logging time on your tasks to see your work distribution."
            ></app-empty-state>
          </div>
          <div *ngIf="!isLoading && projectDurations.length > 0" class="space-y-4">
            <div *ngFor="let pd of projectDurations" class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="font-medium text-secondary-700">{{ pd.projectName }}</span>
                <span class="text-secondary-500">{{ formatDuration(pd.totalMinutes) }}</span>
              </div>
              <div class="h-2 bg-secondary-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all"
                  [style.width.%]="getProjectPercentage(pd.totalMinutes)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- PM/ADMIN DASHBOARD -->
      <ng-container *ngIf="!isEmployee">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">Total Projects</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ stats?.overview?.totalProjects || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-green-600 mt-3">{{ activeProjects }} active</p>
          </div>

          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">Total Tasks</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ stats?.overview?.totalTasks || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-yellow-600 mt-3">{{ tasksInProgress }} in progress</p>
          </div>

          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">Completed</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ completedTasks }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-secondary-500 mt-3">{{ completionRate }}% completion rate</p>
          </div>

          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">Team Members</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ stats?.overview?.totalUsers || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p class="text-sm text-secondary-500 mt-3">Active collaborators</p>
          </div>
        </div>

        <!-- Work Duration for PM -->
        <div *ngIf="isPM" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">My Work This Month</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ formatDuration(monthlyDuration) }}</p>
              </div>
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-500 text-sm font-medium">Total Hours Logged</p>
                <p class="text-3xl font-bold text-secondary-900 mt-1">{{ formatDuration(totalDuration) }}</p>
              </div>
              <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Tasks -->
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-secondary-900">{{ isEmployee ? 'My Tasks' : 'Recent Tasks' }}</h2>
            <a routerLink="/tasks" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </a>
          </div>

          <div *ngIf="isLoading" class="flex justify-center py-8">
            <app-loading-spinner></app-loading-spinner>
          </div>

          <div *ngIf="!isLoading && myTasks.length === 0" class="py-8">
            <app-empty-state
              icon="document"
              title="No tasks assigned"
              description="You don't have any tasks assigned to you yet."
            ></app-empty-state>
          </div>

          <div *ngIf="!isLoading && myTasks.length > 0" class="space-y-3">
            <div
              *ngFor="let task of myTasks.slice(0, 5)"
              class="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary-50 transition-colors cursor-pointer"
              (click)="goToTask(task)"
            >
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  [ngClass]="{
                    'bg-secondary-100': task.status === 'TODO',
                    'bg-blue-100': task.status === 'IN_PROGRESS',
                    'bg-yellow-100': task.status === 'IN_REVIEW',
                    'bg-green-100': task.status === 'DONE'
                  }"
                >
                  <svg
                    class="w-5 h-5"
                    [ngClass]="{
                      'text-secondary-600': task.status === 'TODO',
                      'text-blue-600': task.status === 'IN_PROGRESS',
                      'text-yellow-600': task.status === 'IN_REVIEW',
                      'text-green-600': task.status === 'DONE'
                    }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-secondary-900 truncate">{{ task.title }}</p>
                <p class="text-sm text-secondary-500">{{ task.project?.name || 'No Project' }}</p>
              </div>
              <div class="flex-shrink-0">
                <app-status-badge [status]="task.status" type="task"></app-status-badge>
              </div>
              <div class="flex-shrink-0">
                <app-status-badge [status]="task.priority" type="priority"></app-status-badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects / Quick Stats -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-secondary-900">{{ isEmployee ? 'My Projects' : 'Project Overview' }}</h2>
            <a routerLink="/projects" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </a>
          </div>

          <div *ngIf="isLoading" class="flex justify-center py-8">
            <app-loading-spinner></app-loading-spinner>
          </div>

          <div *ngIf="!isLoading && myProjects.length === 0" class="py-8">
            <app-empty-state
              icon="folder"
              title="No projects"
              description="You're not part of any project yet."
            ></app-empty-state>
          </div>

          <div *ngIf="!isLoading && myProjects.length > 0" class="space-y-3">
            <div
              *ngFor="let project of myProjects.slice(0, 5)"
              class="p-3 rounded-lg border border-secondary-200 hover:border-primary-300 transition-colors cursor-pointer"
              (click)="goToProject(project)"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="font-medium text-secondary-900 truncate">{{ project.name }}</p>
                <app-status-badge [status]="project.status" type="project"></app-status-badge>
              </div>
              <p class="text-sm text-secondary-500 line-clamp-2">{{ project.description || 'No description' }}</p>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex -space-x-2">
                  <app-avatar
                    *ngFor="let member of (project.members || []).slice(0, 3)"
                    [name]="member.firstName + ' ' + member.lastName"
                    [src]="member.avatar"
                    size="xs"
                    class="border-2 border-white rounded-full"
                  ></app-avatar>
                </div>
                <span *ngIf="(project.members?.length || 0) > 3" class="text-xs text-secondary-500">
                  +{{ (project.members?.length || 0) - 3 }} more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  stats: DashboardStats | null = null;
  myTasks: Task[] = [];
  myProjects: Project[] = [];
  timeEntries: TimeEntry[] = [];
  projectDurations: ProjectDuration[] = [];
  monthlyDuration = 0;
  totalDuration = 0;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private timeEntryService: TimeEntryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.loadDashboardData();
  }

  get isEmployee(): boolean {
    return this.user?.role === Role.TEAM_MEMBER;
  }

  get isPM(): boolean {
    return this.user?.role === Role.PROJECT_MANAGER;
  }

  get isAdmin(): boolean {
    return this.user?.role === Role.ADMIN;
  }

  getRoleGreeting(): string {
    if (this.isEmployee) {
      return "Track your work and stay productive!";
    } else if (this.isPM) {
      return "Manage your projects and team effectively.";
    } else {
      return "Monitor all activities across your organization.";
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    const requests: any = {
      tasks: this.taskService.getMyTasks(),
      projects: this.projectService.getMyProjects(),
    };

    // Add stats for PM/Admin
    if (!this.isEmployee) {
      requests.stats = this.analyticsService.getDashboardStats();
    }

    // Add time entries for Employee/PM
    if (this.isEmployee || this.isPM) {
      requests.timeEntries = this.timeEntryService.getMyEntries({});
    }

    forkJoin(requests).subscribe({
      next: (results: any) => {
        this.myTasks = results.tasks?.data || [];
        this.myProjects = results.projects?.data || [];
        
        if (results.stats) {
          this.stats = results.stats.data;
        }
        
        if (results.timeEntries) {
          this.timeEntries = results.timeEntries?.data || results.timeEntries || [];
          this.calculateDurations();
        }
        
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  calculateDurations(): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate monthly duration
    this.monthlyDuration = this.timeEntries
      .filter(entry => new Date(entry.date) >= startOfMonth)
      .reduce((sum, entry) => sum + (entry.realDuration || 0), 0);

    // Calculate total duration
    this.totalDuration = this.timeEntries
      .reduce((sum, entry) => sum + (entry.realDuration || 0), 0);

    // Calculate durations by project
    const projectMap = new Map<string, { name: string; minutes: number }>();
    
    this.timeEntries.forEach(entry => {
      const projectId = entry.task?.project?.id || entry.taskId;
      const projectName = entry.task?.project?.name || 'Unknown Project';
      
      if (projectMap.has(projectId)) {
        projectMap.get(projectId)!.minutes += entry.realDuration || 0;
      } else {
        projectMap.set(projectId, { name: projectName, minutes: entry.realDuration || 0 });
      }
    });

    this.projectDurations = Array.from(projectMap.entries())
      .map(([projectId, data]) => ({
        projectId,
        projectName: data.name,
        totalMinutes: data.minutes,
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  getProjectPercentage(minutes: number): number {
    if (this.totalDuration === 0) return 0;
    return Math.round((minutes / this.totalDuration) * 100);
  }

  getTasksInProgress(): number {
    return this.myTasks.filter(t => t.status === 'IN_PROGRESS').length;
  }

  get activeProjects(): number {
    return this.stats?.projectsByStatus?.['ACTIVE'] || 0;
  }

  get tasksInProgress(): number {
    return this.stats?.tasksByStatus?.['IN_PROGRESS'] || 0;
  }

  get completedTasks(): number {
    return this.stats?.tasksByStatus?.['DONE'] || 0;
  }

  get completionRate(): number {
    const total = this.stats?.overview?.totalTasks || 0;
    if (!total) return 0;
    return Math.round((this.completedTasks / total) * 100);
  }

  goToTask(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }

  goToProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }
}
