import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md" (click)="$event.stopPropagation()">
        <h2 class="text-xl font-semibold text-secondary-900 mb-2">
          {{ title }}
        </h2>
        <p class="text-secondary-600 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="btn-outline"
            (click)="onCancel()"
          >
            {{ cancelText || 'Cancel' }}
          </button>
          <button
            type="button"
            [ngClass]="confirmButtonClass"
            (click)="onConfirmClick()"
          >
            {{ confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirm';
  @Input() message: string = 'Are you sure?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() confirmColor: 'primary' | 'danger' | 'warning' = 'primary';
  @Output() onConfirm = new EventEmitter<boolean>();

  get confirmButtonClass(): string {
    const colorMap = {
      primary: 'btn-primary',
      danger: 'btn-danger',
      warning: 'bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600',
    };
    return colorMap[this.confirmColor || 'primary'];
  }

  onCancel(): void {
    this.onConfirm.emit(false);
  }

  onConfirmClick(): void {
    this.onConfirm.emit(true);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
