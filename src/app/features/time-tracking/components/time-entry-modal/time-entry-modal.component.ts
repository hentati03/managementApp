import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TimeEntryService } from '../../../../core/services/time-entry.service';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../models';

@Component({
  selector: 'app-time-entry-modal',
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-xl shadow-2xl p-6 max-w-[500px] max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <h2 class="text-xl font-semibold text-secondary-900 mb-6">
          {{ entry ? 'Edit Time Entry' : 'Log Time' }}
        </h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <!-- Task Selection -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Task *
            </label>
            <select formControlName="taskId" class="input-field">
              <option value="">Select a task</option>
              <option *ngFor="let task of tasks" [value]="task.id">
                {{ task.title }} ({{ task.project?.name }})
              </option>
            </select>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              formControlName="date"
              class="input-field"
            />
          </div>

          <!-- Time Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                formControlName="startTime"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                formControlName="endTime"
                class="input-field"
              />
            </div>
          </div>

          <!-- Duration Display -->
          <div *ngIf="calculatedDuration > 0" class="bg-primary-50 p-3 rounded-lg">
            <p class="text-sm text-primary-700">
              <span class="font-medium">Duration:</span> {{ formatDuration(calculatedDuration) }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              formControlName="description"
              class="input-field"
              rows="3"
              placeholder="What did you work on?"
            ></textarea>
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
            {{ isSubmitting ? 'Saving...' : (entry ? 'Update' : 'Log Time') }}
          </button>
        </div>
      </form>
      </div>
    </div>
  `,
})
export class TimeEntryModalComponent implements OnInit {
  @Input() entry: any = null;
  @Input() task: Task | null = null;
  @Input() newStatus: string | null = null;
  @Output() onClose = new EventEmitter<any>();

  form: FormGroup;
  tasks: Task[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private timeEntryService: TimeEntryService,
    private taskService: TaskService,
    private toastr: ToastrService
  ) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    this.form = this.fb.group({
      taskId: ['', Validators.required],
      date: [today, Validators.required],
      startTime: [currentTime, Validators.required],
      endTime: [currentTime, Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    if (this.entry) {
      this.populateForm(this.entry);
    } else if (this.task) {
      // Pre-select the task when coming from drag-and-drop
      this.form.patchValue({
        taskId: this.task.id
      });
    }
  }

  loadTasks(): void {
    this.taskService.getMyTasks().subscribe({
      next: (response) => {
        this.tasks = response.data || [];
      },
    });
  }

  populateForm(entry: any): void {
    const startDate = new Date(entry.startTime);
    const endDate = new Date(entry.endTime);
    
    this.form.patchValue({
      taskId: entry.taskId,
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      description: entry.description || '',
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

  get calculatedDuration(): number {
    const { date, startTime, endTime } = this.form.value;
    if (!date || !startTime || !endTime) return 0;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const { taskId, date, startTime, endTime, description } = this.form.value;

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const duration = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 60000);

    const payload = {
      taskId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      theoDuration: duration,
      realDuration: duration,
      description: description || undefined,
      date: new Date(date).toISOString(),
    };

    const request = this.entry
      ? this.timeEntryService.update(this.entry.id, payload)
      : this.timeEntryService.create(payload);

    request.subscribe({
      next: (response) => {
        this.toastr.success(this.entry ? 'Time entry updated' : 'Time logged successfully');
        
        // If this is from drag-and-drop, update task status
        if (this.newStatus && this.task) {
          this.taskService.update(this.task.id, { status: this.newStatus as any }).subscribe({
            next: () => {
              this.onClose.emit({ success: true, data: response.data });
            },
            error: () => {
              // Still emit success for time entry, but status update failed
              this.onClose.emit({ success: true, data: response.data });
            }
          });
        } else {
          this.onClose.emit({ success: true, data: response.data });
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to save time entry');
        this.isSubmitting = false;
      },
    });
  }
}
