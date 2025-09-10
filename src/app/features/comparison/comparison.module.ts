import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Pages
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ProductComparisonPageComponent } from './pages/product-comparison-page/product-comparison-page.component';

const routes: Routes = [
  {
    path: 'search',
    component: SearchPageComponent
  },
  {
    path: 'product/:id',
    component: ProductComparisonPageComponent
  },
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class ComparisonModule {}
