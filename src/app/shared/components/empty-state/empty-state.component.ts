import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() title: string = 'No data available';
  @Input() description: string = '';
  @Input() actionLabel: string = '';
  @Input() actionIcon: string = 'add';
  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}
