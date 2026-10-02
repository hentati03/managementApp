import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { ProjectDetailComponent } from './pages/project-detail/project-detail.component';
import { ProjectCreateModalComponent } from './components/project-create-modal/project-create-modal.component';
import { ProjectEditModalComponent } from './components/project-edit-modal/project-edit-modal.component';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectDetailComponent,
    ProjectCreateModalComponent,
    ProjectEditModalComponent
  ],
  imports: [SharedModule, ProjectsRoutingModule],
})
export class ProjectsModule {}
