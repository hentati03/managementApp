import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Task, Comment, User } from '../../../../models';
import { CommentService } from '../../../../core/services/comment.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-detail-modal',
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-start p-6 border-b border-secondary-200">
          <div>
            <h2 class="text-xl font-semibold text-secondary-900">{{ task.title }}</h2>
            <p class="text-sm text-secondary-500 mt-1">{{ task.project?.name }}</p>
          </div>
          <button (click)="onClose()" class="text-secondary-400 hover:text-secondary-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
        <div class="grid grid-cols-3 divide-x divide-secondary-200">
          <!-- Task Details -->
          <div class="col-span-2 p-6">
            <div class="space-y-6">
              <!-- Description -->
              <div>
                <h3 class="text-sm font-medium text-secondary-700 mb-2">Description</h3>
                <p class="text-secondary-600">
                  {{ task.description || 'No description provided' }}
                </p>
              </div>

              <!-- Status & Priority -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-secondary-700 mb-2">Status</h3>
                  <app-status-badge [status]="task.status" type="task"></app-status-badge>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-secondary-700 mb-2">Priority</h3>
                  <app-status-badge [status]="task.priority" type="priority"></app-status-badge>
                </div>
              </div>

              <!-- Dates -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-secondary-700 mb-2">Due Date</h3>
                  <p class="text-secondary-600">
                    {{ task.dueDate ? (task.dueDate | date:'mediumDate') : 'Not set' }}
                  </p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-secondary-700 mb-2">Estimated Hours</h3>
                  <p class="text-secondary-600">{{ task.estimatedHours || 0 }} hours</p>
                </div>
              </div>

              <!-- Assignee -->
              <div>
                <h3 class="text-sm font-medium text-secondary-700 mb-2">Assignee</h3>
                <div *ngIf="task.assignee" class="flex items-center gap-2">
                  <app-avatar
                    [name]="task.assignee.firstName + ' ' + task.assignee.lastName"
                    [src]="task.assignee.avatar"
                    size="sm"
                  ></app-avatar>
                  <span class="text-secondary-700">
                    {{ task.assignee.firstName }} {{ task.assignee.lastName }}
                  </span>
                </div>
                <p *ngIf="!task.assignee" class="text-secondary-500">Unassigned</p>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="col-span-1 flex flex-col h-[400px]">
            <div class="p-4 border-b border-secondary-200">
              <h3 class="font-medium text-secondary-900">Comments ({{ comments.length }})</h3>
            </div>

            <!-- Comments List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div *ngIf="isLoadingComments" class="flex justify-center py-4">
                <app-loading-spinner size="sm"></app-loading-spinner>
              </div>

              <div *ngIf="!isLoadingComments && comments.length === 0" class="text-center py-4">
                <p class="text-sm text-secondary-500">No comments yet</p>
              </div>

              <div
                *ngFor="let comment of comments"
                class="bg-secondary-50 rounded-lg p-3"
              >
                <div class="flex items-center gap-2 mb-2">
                  <app-avatar
                    [name]="comment.author?.firstName + ' ' + comment.author?.lastName"
                    [src]="comment.author?.avatar"
                    size="xs"
                  ></app-avatar>
                  <span class="text-sm font-medium text-secondary-900">
                    {{ comment.author?.firstName }} {{ comment.author?.lastName }}
                  </span>
                  <span class="text-xs text-secondary-400">
                    {{ comment.createdAt | date:'short' }}
                  </span>
                </div>
                <p class="text-sm text-secondary-600">{{ comment.content }}</p>
              </div>
            </div>

            <!-- Add Comment -->
            <div class="p-4 border-t border-secondary-200">
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="newComment"
                  (keyup.enter)="addComment()"
                  placeholder="Add a comment..."
                  class="input-field flex-1 text-sm"
                />
                <button
                  (click)="addComment()"
                  [disabled]="!newComment.trim() || isAddingComment"
                  class="btn-primary px-3"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TaskDetailModalComponent implements OnInit, OnDestroy {
  @Input() task!: Task;
  @Output() onCloseEvent = new EventEmitter<void>();
  
  comments: Comment[] = [];
  newComment = '';
  isLoadingComments = true;
  isAddingComment = false;
  currentUser: User | null = null;

  private wsSubscription?: Subscription;

  constructor(
    private commentService: CommentService,
    private wsService: WebSocketService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.task) {
      this.currentUser = this.authService.getCurrentUser();
      this.loadComments();
      this.subscribeToComments();
    }
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    if (this.task?.id) {
      this.wsService.leaveTask(this.task.id);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  loadComments(): void {
    this.isLoadingComments = true;
    this.commentService.getByTask(this.task.id).subscribe({
      next: (response) => {
        this.comments = response.data || [];
        this.isLoadingComments = false;
      },
      error: () => {
        this.isLoadingComments = false;
        this.toastr.error('Failed to load comments');
      },
    });
  }

  subscribeToComments(): void {
    // Join task room for real-time comments
    this.wsService.joinTask(this.task.id);

    this.wsSubscription = this.wsService.onCommentAdded().subscribe((comment) => {
      if (comment.taskId === this.task.id) {
        // Avoid duplicates
        if (!this.comments.find((c) => c.id === comment.id)) {
          this.comments.push(comment);
        }
      }
    });
  }

  addComment(): void {
    if (!this.newComment.trim()) return;

    this.isAddingComment = true;
    this.commentService
      .create({
        taskId: this.task.id,
        content: this.newComment.trim(),
      })
      .subscribe({
        next: (response) => {
          if (response.data) {
            // Comment will be added via WebSocket, but add it anyway for immediate feedback
            if (!this.comments.find((c) => c.id === response.data!.id)) {
              this.comments.push(response.data);
            }
          }
          this.newComment = '';
          this.isAddingComment = false;
        },
        error: () => {
          this.toastr.error('Failed to add comment');
          this.isAddingComment = false;
        },
      });
  }

  onClose(): void {
    this.onCloseEvent.emit();
  }
}
