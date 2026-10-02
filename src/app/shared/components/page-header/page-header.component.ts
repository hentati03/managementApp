import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">{{ title }}</h1>
          <p *ngIf="subtitle" class="mt-1 text-secondary-500">{{ subtitle }}</p>
        </div>
        <div class="flex items-center gap-3">
          <ng-content></ng-content>
          <button
            *ngIf="actionText"
            class="btn-primary flex items-center gap-2"
            (click)="action.emit()"
          >
            <svg
              *ngIf="actionIcon === 'plus'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {{ actionText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() actionText?: string;
  @Input() actionIcon?: 'plus' | 'none' = 'plus';
  @Output() action = new EventEmitter<void>();
}
