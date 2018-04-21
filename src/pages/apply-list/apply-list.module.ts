import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ApplyListPage } from './apply-list';

@NgModule({
  declarations: [
    ApplyListPage,
  ],
  imports: [
    IonicPageModule.forChild(ApplyListPage),
  ],
})
export class ApplyListPageModule {}
