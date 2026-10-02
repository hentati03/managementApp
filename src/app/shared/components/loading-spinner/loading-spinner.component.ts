import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="flex items-center justify-center" [ngClass]="containerClass">
      <div
        class="animate-spin rounded-full border-t-2 border-b-2 border-primary-600"
        [ngClass]="sizeClass"
      ></div>
      <span *ngIf="message" class="ml-3 text-secondary-600">{{ message }}</span>
    </div>
  `,
  styles: [],
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message?: string;
  @Input() fullScreen = false;

  get sizeClass(): string {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };
    return sizes[this.size];
  }

  get containerClass(): string {
    return this.fullScreen ? 'fixed inset-0 bg-white bg-opacity-75 z-50' : '';
  }
}
