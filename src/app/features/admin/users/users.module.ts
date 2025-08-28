import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../../shared/shared.module';

const routes: Routes = [
  // TODO: Create UsersComponent and uncomment this route
  // {
  //   path: '',
  //   component: UsersComponent
  // }
];

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class UsersModule {}
