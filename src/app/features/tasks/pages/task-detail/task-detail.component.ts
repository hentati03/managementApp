import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../models';

@Component({
  selector: 'app-task-detail',
  template: `
    <div *ngIf="isLoading" class="flex justify-center py-12">
      <app-loading-spinner size="lg"></app-loading-spinner>
    </div>

    <div *ngIf="!isLoading && task">
      <button
        (click)="goBack()"
        class="flex items-center gap-2 text-secondary-500 hover:text-secondary-700 mb-4"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tasks
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <div class="card">
            <div class="flex items-start justify-between mb-4">
              <h1 class="text-2xl font-bold text-secondary-900">{{ task.title }}</h1>
              <div class="flex items-center gap-2">
                <app-status-badge [status]="task.status" type="task"></app-status-badge>
                <app-status-badge [status]="task.priority" type="priority"></app-status-badge>
              </div>
            </div>
            <p class="text-secondary-600">{{ task.description || 'No description provided.' }}</p>
          </div>

          <!-- Comments Section -->
          <div class="card">
            <h2 class="text-lg font-semibold text-secondary-900 mb-4">Comments</h2>
            <div *ngIf="!task.comments || task.comments.length === 0" class="text-secondary-500">
              No comments yet.
            </div>
            <div *ngIf="task.comments && task.comments.length > 0" class="space-y-4">
              <div *ngFor="let comment of task.comments" class="flex gap-3">
                <app-avatar
                  [name]="comment.author?.firstName + ' ' + comment.author?.lastName"
                  size="sm"
                ></app-avatar>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-secondary-900">
                      {{ comment.author?.firstName }} {{ comment.author?.lastName }}
                    </span>
                    <span class="text-xs text-secondary-500">
                      {{ comment.createdAt | date:'short' }}
                    </span>
                  </div>
                  <p class="text-secondary-700">{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-4">Details</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm text-secondary-500">Project</dt>
                <dd class="text-secondary-900">{{ task.project?.name || '-' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-secondary-500">Due Date</dt>
                <dd [ngClass]="isOverdue ? 'text-red-600' : 'text-secondary-900'">
                  {{ task.dueDate ? (task.dueDate | date:'mediumDate') : 'Not set' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-secondary-500">Created</dt>
                <dd class="text-secondary-900">{{ task.createdAt | date:'mediumDate' }}</dd>
              </div>
            </dl>
          </div>

          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-4">Assignee</h3>
            <div *ngIf="!task.assignee" class="text-secondary-500 text-sm">
              No one assigned
            </div>
            <div *ngIf="task.assignee" class="flex items-center gap-3">
              <app-avatar
                [name]="task.assignee.firstName + ' ' + task.assignee.lastName"
                size="sm"
              ></app-avatar>
              <span class="text-secondary-900">{{ task.assignee.firstName }} {{ task.assignee.lastName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTask(id);
    }
  }

  loadTask(id: string): void {
    this.taskService.getById(id).subscribe({
      next: (response) => {
        this.task = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/tasks']);
      },
    });
  }

  get isOverdue(): boolean {
    if (!this.task?.dueDate || this.task.status === 'DONE') return false;
    return new Date(this.task.dueDate) < new Date();
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}
