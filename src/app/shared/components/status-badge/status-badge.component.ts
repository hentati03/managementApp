import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [ngClass]="badgeClass">
      {{ label || status }}
    </span>
  `,
  styles: [],
})
export class StatusBadgeComponent {
  @Input() status!: string;
  @Input() label?: string;
  @Input() type: 'task' | 'project' | 'priority' | 'role' = 'task';

  get badgeClass(): string {
    if (this.type === 'task') {
      const taskStatuses: Record<string, string> = {
        TODO: 'badge-secondary',
        IN_PROGRESS: 'badge-info',
        IN_REVIEW: 'badge-warning',
        DONE: 'badge-success',
        CANCELLED: 'badge-danger',
      };
      return taskStatuses[this.status] || 'badge-secondary';
    }

    if (this.type === 'project') {
      const projectStatuses: Record<string, string> = {
        PLANNING: 'badge-secondary',
        ACTIVE: 'badge-info',
        ON_HOLD: 'badge-warning',
        COMPLETED: 'badge-success',
        CANCELLED: 'badge-danger',
      };
      return projectStatuses[this.status] || 'badge-secondary';
    }

    if (this.type === 'priority') {
      const priorities: Record<string, string> = {
        LOW: 'badge-secondary',
        MEDIUM: 'badge-info',
        HIGH: 'badge-warning',
        URGENT: 'badge-danger',
      };
      return priorities[this.status] || 'badge-secondary';
    }

    if (this.type === 'role') {
      const roles: Record<string, string> = {
        ADMIN: 'badge-danger',
        PROJECT_MANAGER: 'badge-warning',
        TEAM_MEMBER: 'badge-info',
        CLIENT: 'badge-secondary',
      };
      return roles[this.status] || 'badge-secondary';
    }

    return 'badge-secondary';
  }
}
