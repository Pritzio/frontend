import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StoresComponent } from './stores.component';
import { StoreDetailComponent } from './components/store-detail/store-detail.component';
import { StoreEditComponent } from './components/store-edit/store-edit.component';
import { StoresService } from '../../../core/services/stores.service';
import { AlertService } from '../../../core/services/alert.service';

const routes: Routes = [
  {
    path: '',
    component: StoresComponent
  },
  {
    path: 'new',
    component: StoreEditComponent
  },
  {
    path: ':id',
    component: StoreDetailComponent
  },
  {
    path: ':id/edit',
    component: StoreEditComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
    StoresService,
    AlertService
  ]
})
export class StoresModule {}
