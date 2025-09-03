import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreProductsListComponent } from './components/store-products-list/store-products-list.component';
import { StoreProductFormComponent } from './components/store-product-form/store-product-form.component';
import { StoreProductDetailComponent } from './components/store-product-detail/store-product-detail.component';
import { StoreProductsAnalyticsComponent } from './components/store-products-analytics/store-products-analytics.component';


const routes: Routes = [
  {
    path: '',
    component: StoreProductsListComponent
  },
  {
    path: 'analytics',
    component: StoreProductsAnalyticsComponent
  },
  {
    path: 'create',
    component: StoreProductFormComponent
  },
  {
    path: ':id',
    component: StoreProductDetailComponent
  },
  {
    path: ':id/edit',
    component: StoreProductFormComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    StoreProductsListComponent,
    StoreProductFormComponent,
    StoreProductDetailComponent,
    StoreProductsAnalyticsComponent
  ],
  exports: [RouterModule]
})
export class StoreProductsModule {}



