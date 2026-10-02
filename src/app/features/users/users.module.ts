import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserCreateModalComponent } from './components/user-create-modal/user-create-modal.component';
import { UserEditModalComponent } from './components/user-edit-modal/user-edit-modal.component';

@NgModule({
  declarations: [
    UserListComponent,
    UserCreateModalComponent,
    UserEditModalComponent
  ],
  imports: [SharedModule, UsersRoutingModule],
})
export class UsersModule {}
