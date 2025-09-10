import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseProductsListComponent } from './components/base-products-list/base-products-list.component';
import { BaseProductFormComponent } from './components/base-product-form/base-product-form.component';
import { BaseProductDetailComponent } from './components/base-product-detail/base-product-detail.component';
import { BaseProductsAnalyticsComponent } from './components/base-products-analytics/base-products-analytics.component';

const routes: Routes = [
  {
    path: '',
    component: BaseProductsListComponent
  },
  {
    path: 'analytics',
    component: BaseProductsAnalyticsComponent
  },
  {
    path: 'create',
    component: BaseProductFormComponent
  },
  {
    path: ':id',
    component: BaseProductDetailComponent
  },
  {
    path: ':id/edit',
    component: BaseProductFormComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    BaseProductsListComponent,
    BaseProductFormComponent,
    BaseProductDetailComponent,
    BaseProductsAnalyticsComponent
  ],
  exports: [RouterModule]
})
export class BaseProductsModule {}
