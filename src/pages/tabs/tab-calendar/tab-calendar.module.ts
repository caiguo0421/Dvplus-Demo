import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TabCalendarPage } from './tab-calendar';

@NgModule({
  declarations: [
    TabCalendarPage,
  ],
  imports: [
    IonicPageModule.forChild(TabCalendarPage),
  ],
})
export class TabCalendarPageModule {}
