import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../../shared/shared.module';

const routes: Routes = [
  // TODO: Create ProductsComponent and uncomment this route
  // {
  //   path: '',
  //   component: ProductsComponent
  // }
];

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductsModule {}
