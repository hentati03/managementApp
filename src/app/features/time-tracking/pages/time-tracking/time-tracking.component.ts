import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TimeEntryService } from '../../../../core/services/time-entry.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TimeEntry, User, Role } from '../../../../models';

@Component({
  selector: 'app-time-tracking',
  template: `
    <div>
      <app-page-header
        title="Time Tracking"
        subtitle="Track time spent on tasks and projects"
        actionText="Log Time"
        (action)="openLogDialog()"
      ></app-page-header>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <p class="text-sm text-secondary-500 mb-1">Today</p>
          <p class="text-2xl font-bold text-secondary-900">{{ formatDuration(todayMinutes) }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-secondary-500 mb-1">This Week</p>
          <p class="text-2xl font-bold text-secondary-900">{{ formatDuration(weekMinutes) }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-secondary-500 mb-1">This Month</p>
          <p class="text-2xl font-bold text-secondary-900">{{ formatDuration(monthMinutes) }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-secondary-500 mb-1">Total Entries</p>
          <p class="text-2xl font-bold text-secondary-900">{{ entries.length }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">Start Date</label>
            <input
              type="date"
              [(ngModel)]="startDate"
              (change)="loadEntries()"
              class="input-field w-40"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">End Date</label>
            <input
              type="date"
              [(ngModel)]="endDate"
              (change)="loadEntries()"
              class="input-field w-40"
            />
          </div>
          <div *ngIf="canViewAllEntries">
            <label class="block text-sm font-medium text-secondary-700 mb-1">User</label>
            <select
              [(ngModel)]="userFilter"
              (change)="loadEntries()"
              class="input-field w-48"
            >
              <option value="">All Users</option>
              <option *ngFor="let user of users" [value]="user.id">
                {{ user.firstName }} {{ user.lastName }}
              </option>
            </select>
          </div>
          <div class="flex-1"></div>
          <button class="btn-secondary mt-6" (click)="resetFilters()">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <app-loading-spinner size="lg"></app-loading-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && entries.length === 0">
        <app-empty-state
          icon="schedule"
          title="No time entries"
          description="Start tracking your time by logging your first entry."
          actionLabel="Log Time"
          (action)="openLogDialog()"
        ></app-empty-state>
      </div>

      <!-- Time Entry Modal -->
      <app-time-entry-modal
        *ngIf="showTimeEntryModal"
        [entry]="selectedEntry"
        (onClose)="handleTimeEntryClose($event)"
      ></app-time-entry-modal>

      <!-- Confirm Delete Modal -->
      <app-confirm-dialog
        *ngIf="showConfirmDelete"
        title="Delete Time Entry"
        message="Are you sure you want to delete this time entry?"
        confirmText="Delete"
        (onConfirm)="handleConfirmDelete($event)"
      ></app-confirm-dialog>

      <!-- Entries List -->
      <div *ngIf="!isLoading && entries.length > 0" class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-secondary-200">
                <th class="text-left py-3 px-4 text-sm font-medium text-secondary-700">Date</th>
                <th *ngIf="canViewAllEntries" class="text-left py-3 px-4 text-sm font-medium text-secondary-700">User</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-secondary-700">Task</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-secondary-700">Project</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-secondary-700">Duration</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-secondary-700">Description</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-secondary-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let entry of entries"
                class="border-b border-secondary-100 hover:bg-secondary-50"
              >
                <td class="py-3 px-4">
                  <p class="text-sm font-medium text-secondary-900">
                    {{ entry.date | date:'mediumDate' }}
                  </p>
                  <p class="text-xs text-secondary-500">
                    {{ entry.startTime | date:'shortTime' }} - {{ entry.endTime | date:'shortTime' }}
                  </p>
                </td>
                <td *ngIf="canViewAllEntries" class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <app-avatar
                      [name]="entry.user?.firstName + ' ' + entry.user?.lastName"
                      size="xs"
                    ></app-avatar>
                    <span class="text-sm text-secondary-900">
                      {{ entry.user?.firstName }} {{ entry.user?.lastName }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm text-secondary-900">{{ entry.task?.title || 'Unknown Task' }}</p>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm text-secondary-600">{{ entry.task?.project?.name || '-' }}</p>
                </td>
                <td class="py-3 px-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {{ formatDuration(entry.realDuration || entry.theoDuration) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm text-secondary-600 truncate max-w-xs">
                    {{ entry.description || '-' }}
                  </p>
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    class="p-1 text-secondary-400 hover:text-primary-600 mr-2"
                    (click)="editEntry(entry)"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="p-1 text-secondary-400 hover:text-red-600"
                    (click)="deleteEntry(entry)"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class TimeTrackingComponent implements OnInit {
  entries: TimeEntry[] = [];
  users: User[] = [];
  isLoading = true;
  startDate = '';
  endDate = '';
  userFilter = '';

  todayMinutes = 0;
  weekMinutes = 0;
  monthMinutes = 0;

  showTimeEntryModal = false;
  showConfirmDelete = false;
  selectedEntry: TimeEntry | null = null;
  entryToDelete: TimeEntry | null = null;

  constructor(
    private timeEntryService: TimeEntryService,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  get canViewAllEntries(): boolean {
    const role = this.authService.currentUser?.role;
    return role === Role.ADMIN || role === Role.PROJECT_MANAGER;
  }

  ngOnInit(): void {
    this.setDefaultDates();
    if (this.canViewAllEntries) {
      this.loadUsers();
    }
    this.loadEntries();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (response) => {
        this.users = response.data || [];
      },
    });
  }

  setDefaultDates(): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.startDate = startOfMonth.toISOString().split('T')[0];
    this.endDate = endOfMonth.toISOString().split('T')[0];
  }

  loadEntries(): void {
    this.isLoading = true;
    
    // Team members can only see their own entries
    // Admins and project managers can see all entries and filter by user
    const observable = this.canViewAllEntries && this.userFilter
      ? this.timeEntryService.getUserEntries(this.userFilter, {
          startDate: this.startDate,
          endDate: this.endDate,
        })
      : this.canViewAllEntries
      ? this.timeEntryService.getAllEntries({
          startDate: this.startDate,
          endDate: this.endDate,
        })
      : this.timeEntryService.getMyEntries({
          startDate: this.startDate,
          endDate: this.endDate,
        });
    
    observable.subscribe({
      next: (response) => {
        this.entries = (response.data || response as any) || [];
        this.calculateSummaries();
        this.isLoading = false;
      },
      error: () => {
        this.entries = [];
        this.isLoading = false;
      },
    });
  }

  calculateSummaries(): void {
    const now = new Date();
    const today = now.toDateString();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    this.todayMinutes = 0;
    this.weekMinutes = 0;
    this.monthMinutes = 0;

    for (const entry of this.entries) {
      const entryDate = new Date(entry.date);
      const duration = entry.realDuration || entry.theoDuration || 0;

      if (entryDate.toDateString() === today) {
        this.todayMinutes += duration;
      }
      if (entryDate >= weekStart) {
        this.weekMinutes += duration;
      }
      if (entryDate >= monthStart) {
        this.monthMinutes += duration;
      }
    }
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  resetFilters(): void {
    this.setDefaultDates();
    this.userFilter = '';
    this.loadEntries();
  }

  openLogDialog(): void {
    this.selectedEntry = null;
    this.showTimeEntryModal = true;
  }

  editEntry(entry: TimeEntry): void {
    this.selectedEntry = entry;
    this.showTimeEntryModal = true;
  }

  handleTimeEntryClose(result: any): void {
    this.showTimeEntryModal = false;
    this.selectedEntry = null;
    if (result) {
      this.loadEntries();
    }
  }

  deleteEntry(entry: TimeEntry): void {
    this.entryToDelete = entry;
    this.showConfirmDelete = true;
  }

  handleConfirmDelete(confirmed: boolean): void {
    this.showConfirmDelete = false;
    if (confirmed && this.entryToDelete) {
      this.timeEntryService.delete(this.entryToDelete.id).subscribe({
        next: () => {
          this.toastr.success('Time entry deleted');
          this.loadEntries();
        },
        error: () => {
          this.toastr.error('Failed to delete time entry');
        },
      });
    }
    this.entryToDelete = null;
  }
}
