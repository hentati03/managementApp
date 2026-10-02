import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Task } from '../../../../models';
import { TimeEntryService } from '../../../../core/services/time-entry.service';
import { TaskService } from '../../../../core/services/task.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-time-entry-modal',
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-[450px] max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <h2 class="text-xl font-semibold text-secondary-900 mb-4">
          Log Time Entry
        </h2>
        <div class="space-y-4">
          <div class="bg-secondary-50 rounded-lg p-4">
            <p class="text-sm text-secondary-600">Task</p>
            <p class="font-medium text-secondary-900">{{ task?.title }}</p>
            <p class="text-sm text-secondary-500 mt-1" *ngIf="newStatus">
              Moving to: <span class="font-medium">{{ getStatusLabel(newStatus) }}</span>
            </p>
          </div>

        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">
            Description
          </label>
          <textarea
            [(ngModel)]="description"
            rows="3"
            class="input-field w-full"
            placeholder="What did you work on?"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            [(ngModel)]="duration"
            min="1"
            class="input-field w-full"
            placeholder="Enter duration in minutes"
          />
          <p class="text-xs text-secondary-500 mt-1">
            Estimated hours: {{ task?.estimatedHours || 0 }} hours
          </p>
        </div>
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-secondary-200">
          <button type="button" class="btn-secondary" (click)="onCancel()">
            Cancel
          </button>
          <button
            type="button"
            (click)="onSubmit()"
            [disabled]="isSubmitting || !duration"
            class="btn-primary"
          >
            <span *ngIf="isSubmitting">Saving...</span>
            <span *ngIf="!isSubmitting">Save Entry</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TimeEntryModalComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() newStatus: string | null = null;
  @Output() onClose = new EventEmitter<any>();

  description = '';
  duration: number = 0;
  isSubmitting = false;

  constructor(
    private timeEntryService: TimeEntryService,
    private taskService: TaskService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Pre-fill with theoretical duration
    this.duration = (this.task?.estimatedHours || 0.5) * 60;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'In Review',
      DONE: 'Done',
    };
    return labels[status] || status;
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
    if (!this.duration || this.duration <= 0) {
      this.toastr.error('Please enter a valid duration');
      return;
    }

    if (!this.task) {
      this.toastr.error('Task not found');
      return;
    }

    this.isSubmitting = true;
    const now = new Date();

    // Create time entry
    this.timeEntryService
      .create({
        taskId: this.task.id,
        description: this.description,
        theoDuration: Math.round((this.task.estimatedHours || 0) * 60) || this.duration,
        realDuration: this.duration,
        startTime: new Date(now.getTime() - this.duration * 60000).toISOString(),
        endTime: now.toISOString(),
        date: now.toISOString(),
      })
      .subscribe({
        next: () => {
          // Update task status if newStatus is provided
          if (this.newStatus) {
            this.taskService
              .update(this.task!.id, { status: this.newStatus as any })
              .subscribe({
                next: (response) => {
                  this.toastr.success('Time entry logged and task updated');
                  this.onClose.emit({
                    success: true,
                    updatedTask: response.data,
                  });
                },
                error: () => {
                  this.toastr.error('Failed to update task status');
                  this.isSubmitting = false;
                },
              });
          } else {
            this.toastr.success('Time entry logged');
            this.onClose.emit({ success: true });
          }
        },
        error: () => {
          this.toastr.error('Failed to create time entry');
          this.isSubmitting = false;
        },
      });
  }
}
