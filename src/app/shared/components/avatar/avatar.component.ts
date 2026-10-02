import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    <div
      class="rounded-full flex items-center justify-center font-medium"
      [ngClass]="[sizeClass, colorClass]"
    >
      <img
        *ngIf="src"
        [src]="src"
        [alt]="name"
        class="w-full h-full rounded-full object-cover"
      />
      <span *ngIf="!src">{{ initials }}</span>
    </div>
  `,
  styles: [],
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  get initials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  get sizeClass(): string {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };
    return sizes[this.size];
  }

  get colorClass(): string {
    if (this.src) return '';
    // Generate consistent color based on name
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-yellow-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white',
      'bg-red-500 text-white',
      'bg-teal-500 text-white',
    ];
    const index = this.name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }
}
