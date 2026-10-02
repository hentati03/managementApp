import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '../../shared/shared.module';
import { TasksRoutingModule } from './tasks-routing.module';
import { TaskListComponent } from './pages/task-list/task-list.component';
import { TaskDetailComponent } from './pages/task-detail/task-detail.component';
import { TimeEntryModalComponent } from './components/time-entry-modal/time-entry-modal.component';
import { TaskDetailModalComponent } from './components/task-detail-modal/task-detail-modal.component';
import { TaskCreateModalComponent } from './components/task-create-modal/task-create-modal.component';

@NgModule({
  declarations: [
    TaskListComponent,
    TaskDetailComponent,
    TimeEntryModalComponent,
    TaskDetailModalComponent,
    TaskCreateModalComponent,
  ],
  imports: [SharedModule, TasksRoutingModule, DragDropModule],
})
export class TasksModule {}
