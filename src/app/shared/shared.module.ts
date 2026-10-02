import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

// Components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';

const COMPONENTS = [
  LoadingSpinnerComponent,
  ConfirmDialogComponent,
  EmptyStateComponent,
  AvatarComponent,
  PageHeaderComponent,
  StatusBadgeComponent,
];

const MATERIAL_MODULES = [
  MatDialogModule,
  MatMenuModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatButtonModule,
  MatIconModule,
  MatDividerModule,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES,
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES,
    ...COMPONENTS,
  ],
})
export class SharedModule {}
