import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CategoryNavigationComponent } from './components/category//category-navigation/category-navigation.component';
import { CategoryListComponent } from './components/category/category-list/category-list.component';
import { ProductImagesComponent } from './components/product/product-images/product-images.component';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { ProductPriceComponent } from './components/product/product-price/product-price.component';
import { ProductRowComponent } from './components/product/product-row/product-row.component';
import { ProductTileComponent } from './components/product/product-tile/product-tile.component';
import { DisableIconDirective } from './directives/disable-icon.directive';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    CategoryListComponent,
    CategoryNavigationComponent,
    DisableIconDirective,
    ProductListComponent,
    ProductRowComponent,
    ProductTileComponent,
    ProductImagesComponent,
    ProductPriceComponent
  ],
  exports: [
    CategoryListComponent,
    CategoryNavigationComponent,
    DisableIconDirective,
    ProductListComponent,
    ProductRowComponent,
    ProductTileComponent,
    ProductImagesComponent,
    ProductPriceComponent
  ]
})

export class ShoppingSharedModule { }
