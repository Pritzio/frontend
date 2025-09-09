import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { StoreProductsService } from '../../../../../core/services/store-products.service';
import { CategoriesService, ICategoryResponse } from '../../../../../core/services/categories.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { 
  IStoreProduct, 
  ICreateStoreProductRequest, 
  IUpdateStoreProductRequest,
  IStoreProductMetadata
} from '../../../../../models/store-product.model';

@Component({
  selector: 'app-store-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './store-product-form.component.html',
  styleUrls: []
})
export class StoreProductFormComponent implements OnInit, OnDestroy {
  
  // Input properties
  @Input() storeProductId?: string;
  @Input() isEditMode = false;
  
  // Public properties
  public storeProductForm: FormGroup;
  public isLoading = false;
  public isSubmitting = false;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  public availableCategories: ICategoryResponse[] = [];
  public selectedCategories: string[] = [];
  public isCategoriesDropdownOpen = false;
  
  // Private properties
  private _destroy$ = new Subject<void>();
  private _currentStoreProduct: IStoreProduct | null = null;
  
  constructor(
    private _formBuilder: FormBuilder,
    private _storeProductsService: StoreProductsService,
    private _categoriesService: CategoriesService,
    private _alertService: AlertService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.storeProductForm = this._createForm();
  }
  
  ngOnInit(): void {
    this._setupRouteParams();
    this._loadCategories();
    this._loadStoreProductIfEditMode();
    this._setupClickOutsideListener();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  // ===== Public Methods =====
  
  /**
   * Toggle category selection
   */
  public toggleCategory(categoryId: string): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
  }

  /**
   * Check if category is selected
   */
  public isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  /**
   * Get selected category names
   */
  public getSelectedCategoryNames(): string[] {
    return this.selectedCategories.map(id => {
      const category = this.availableCategories.find(cat => cat.id === id);
      return category ? category.name : '';
    }).filter(name => name);
  }

  /**
   * Toggle categories dropdown
   */
  public toggleCategoriesDropdown(): void {
    this.isCategoriesDropdownOpen = !this.isCategoriesDropdownOpen;
  }

  /**
   * Get category by ID
   */
  public getCategoryById(categoryId: string): ICategoryResponse | undefined {
    return this.availableCategories.find(cat => cat.id === categoryId);
  }

  /**
   * Remove category from selection
   */
  public removeCategory(categoryId: string): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    }
  }

  /**
   * Submit the form
   */
  public onSubmit(): void {
    if (this.storeProductForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;
      
      const formData = this._prepareFormData();
      
      if (this.isEditMode && this.storeProductId) {
        this._updateStoreProduct(formData as IUpdateStoreProductRequest);
      } else {
        this._createStoreProduct(formData as ICreateStoreProductRequest);
      }
    } else {
      this._markFormGroupTouched();
    }
  }
  
  // ===== Private Methods =====
  
  private _createForm(): FormGroup {
    return this._formBuilder.group({
      // API v2.2 - Core fields
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]],
      description: ['', [Validators.maxLength(2000)]],
      url: ['', [Validators.maxLength(500)]],
      sku: ['', [Validators.maxLength(100)]],
      storeProductId: ['', [Validators.maxLength(100)]],
      image: ['', [Validators.maxLength(500)]],
      price: [null, [Validators.min(0)]],
      notes: ['', [Validators.maxLength(500)]],
      
      // Store information (v2.2)
      storeName: [''],
      storeWebsite: ['', [Validators.maxLength(500)]],
      
      // Metadata fields (from API v2.2 documentation)
      brand: [''],
      rating: [null, [Validators.min(1), Validators.max(5)]],
      ratingText: [''],
      highResImageUrl: ['', [Validators.maxLength(500)]],
      ppum: ['']
    });
  }
  
  private _setupRouteParams(): void {
    this._route.params.pipe(
      takeUntil(this._destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.storeProductId = params['id'];
        this.isEditMode = true;
      }
    });
  }

  private _loadCategories(): void {
    this._categoriesService.getAll().subscribe({
      next: (categories) => {
        this.availableCategories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }
  
  private _loadStoreProductIfEditMode(): void {
    if (this.isEditMode && this.storeProductId) {
      this.isLoading = true;
      
      this._storeProductsService.getById(this.storeProductId!).subscribe({
        next: (response) => {
          this._currentStoreProduct = response;
          this._populateForm(response);
        },
        error: (error: any) => {
          this.errorMessage = 'Error al cargar el producto';
          console.error('Error loading product:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  
  private _populateForm(product: IStoreProduct): void {
    // API v2.2 - Core fields
    this.storeProductForm.patchValue({
      name: product.name,
      description: product.description || '',
      url: product.url || '',
      sku: product.sku || '',
      storeProductId: product.storeProductId || '',
      image: product.image || '',
      price: product.price || null,
      notes: product.notes || ''
    });
    
    // Store information (v2.2)
    if (product.store) {
      this.storeProductForm.patchValue({
        storeName: product.store.name || '',
        storeWebsite: product.store.website || ''
      });
    }
    
    // Metadata fields
    if (product.metadata) {
      this.storeProductForm.patchValue({
        brand: product.metadata['brand'] || '',
        rating: product.metadata['rating'] || null,
        ratingText: product.metadata['ratingText'] || '',
        highResImageUrl: product.metadata['highResImageUrl'] || '',
        ppum: product.metadata['ppum'] || ''
      });
    }

    // Categories (v2.2 - New relationship)
    if (product.categories && product.categories.length > 0) {
      this.selectedCategories = product.categories.map(cat => cat.id);
    }
  }
  
  private _prepareFormData(): ICreateStoreProductRequest | IUpdateStoreProductRequest {
    const formValue = this.storeProductForm.value;
    
    // API v2.2 - Core fields
    const data: any = {
      name: formValue.name
    };
    
    if (formValue.description?.trim()) {
      data.description = formValue.description.trim();
    }
    
    if (formValue.url?.trim()) {
      data.url = formValue.url.trim();
    }
    
    if (formValue.sku?.trim()) {
      data.sku = formValue.sku.trim();
    }
    
    if (formValue.storeProductId?.trim()) {
      data.storeProductId = formValue.storeProductId.trim();
    }
    
    if (formValue.image?.trim()) {
      data.image = formValue.image.trim();
    }
    
    if (formValue.price !== null && formValue.price !== undefined && formValue.price !== '') {
      data.price = Number(formValue.price);
    }
    
    if (formValue.notes?.trim()) {
      data.notes = formValue.notes.trim();
    }
    
    // Store information (v2.2)
    if (formValue.storeName?.trim()) {
      data.storeName = formValue.storeName.trim();
    }
    
    if (formValue.storeWebsite?.trim()) {
      data.storeWebsite = formValue.storeWebsite.trim();
    }
    
    // Metadata fields
    const metadata: any = {};
    
    if (formValue.brand?.trim()) {
      metadata.brand = formValue.brand.trim();
    }
    
    if (formValue.rating !== null && formValue.rating !== undefined && formValue.rating !== '') {
      metadata.rating = Number(formValue.rating);
    }
    
    if (formValue.ratingText?.trim()) {
      metadata.ratingText = formValue.ratingText.trim();
    }
    
    // Handle categories from selected categories (v2.1)
    const selectedCategoryNames = this.getSelectedCategoryNames();
    
    if (selectedCategoryNames.length > 0) {
      metadata.categories = selectedCategoryNames;
    }
    
    if (formValue.highResImageUrl?.trim()) {
      metadata.highResImageUrl = formValue.highResImageUrl.trim();
    }
    
    if (formValue.ppum?.trim()) {
      metadata.ppum = formValue.ppum.trim();
    }
    
    // Only include metadata if it has values
    if (Object.keys(metadata).length > 0) {
      data.metadata = metadata;
    }
    
    return data;
  }
  
  private _createStoreProduct(storeProductData: ICreateStoreProductRequest): void {
    this._alertService.loading('Creando producto...');
    
    this._storeProductsService.create(storeProductData).subscribe({
      next: (response) => {
        this._alertService.close();
        this._alertService.success('Producto creado exitosamente');
        setTimeout(() => {
          this._router.navigate(['/admin/store-products']);
        }, 2000);
      },
      error: (error: any) => {
        this._alertService.close();
        this._alertService.error('Error al crear el producto. Intente nuevamente.');
        console.error('Error creating product:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
  
  private _updateStoreProduct(storeProductData: IUpdateStoreProductRequest): void {
    if (!this.storeProductId) return;
    
    this._alertService.loading('Guardando cambios...');
    
    this._storeProductsService.update(this.storeProductId!, storeProductData).subscribe({
      next: (response) => {
        this._alertService.close();
        this._alertService.success('Producto actualizado exitosamente');
        setTimeout(() => {
          this._router.navigate(['/admin/store-products']);
        }, 2000);
      },
      error: (error: any) => {
        this._alertService.close();
        this._alertService.error('Error al actualizar el producto. Intente nuevamente.');
        console.error('Error updating product:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
  
  private _markFormGroupTouched(): void {
    Object.keys(this.storeProductForm.controls).forEach(key => {
      const control = this.storeProductForm.get(key);
      control?.markAsTouched();
    });
  }

  private _setupClickOutsideListener(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.categories-dropdown')) {
        this.isCategoriesDropdownOpen = false;
      }
    });
  }
}







