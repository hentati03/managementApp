import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { TimeTrackingRoutingModule } from './time-tracking-routing.module';
import { TimeTrackingComponent } from './pages/time-tracking/time-tracking.component';
import { TimeEntryModalComponent } from './components/time-entry-modal/time-entry-modal.component';

@NgModule({
  declarations: [TimeTrackingComponent, TimeEntryModalComponent],
  imports: [SharedModule, TimeTrackingRoutingModule],
})
export class TimeTrackingModule {}
