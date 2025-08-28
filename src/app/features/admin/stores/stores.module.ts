import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { StoresComponent } from './stores.component';

const routes: Routes = [
  {
    path: '',
    component: StoresComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    StoresComponent,
    FormsModule
  ]
})
export class StoresModule {}
