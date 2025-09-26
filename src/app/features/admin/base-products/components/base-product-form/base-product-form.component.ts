import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { BaseProductsService } from '../../../../../core/services/base-products.service';
import { CategoriesService, ICategoryResponse } from '../../../../../core/services/categories.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { 
  IBaseProduct, 
  ICreateBaseProductRequest, 
  IUpdateBaseProductRequest
} from '../../../../../models/base-product.model';

@Component({
  selector: 'app-base-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './base-product-form.component.html',
  styleUrls: []
})
export class BaseProductFormComponent implements OnInit, OnDestroy {
  
  // Input properties
  @Input() baseProductId?: string;
  @Input() isEditMode = false;
  
  // Public properties
  public baseProductForm: FormGroup;
  public isLoading = false;
  public isSubmitting = false;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  public availableCategories: ICategoryResponse[] = [];
  public selectedCategories: string[] = [];
  public isCategoriesDropdownOpen = false;
  
  // Private properties
  private _destroy$ = new Subject<void>();
  private _currentBaseProduct: IBaseProduct | null = null;
  
  constructor(
    private _formBuilder: FormBuilder,
    private _baseProductsService: BaseProductsService,
    private _categoriesService: CategoriesService,
    private _alertService: AlertService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.baseProductForm = this._createForm();
  }
  
  ngOnInit(): void {
    this._setupRouteParams();
    this._loadCategories();
    this._loadBaseProductIfEditMode();
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
    if (this.baseProductForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;
      
      const formData = this._prepareFormData();
      
      if (this.isEditMode && this.baseProductId) {
        this._updateBaseProduct(formData as IUpdateBaseProductRequest);
      } else {
        this._createBaseProduct(formData as ICreateBaseProductRequest);
      }
    } else {
      this._markFormGroupTouched();
    }
  }
  
  // ===== Private Methods =====
  
  private _createForm(): FormGroup {
    return this._formBuilder.group({
      // Core fields
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]],
      brand: ['', [Validators.minLength(1), Validators.maxLength(100)]],
      model: ['', [Validators.maxLength(100)]],
      sku: ['', [Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(2000)]],
      image: ['', [Validators.maxLength(500)]],
      highResImageUrl: ['', [Validators.maxLength(500)]],
      rating: [null, [Validators.min(1), Validators.max(5)]],
      isActive: [true]
    });
  }
  
  private _setupRouteParams(): void {
    this._route.params.pipe(
      takeUntil(this._destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.baseProductId = params['id'];
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
  
  private _loadBaseProductIfEditMode(): void {
    if (this.isEditMode && this.baseProductId) {
      this.isLoading = true;
      
      this._baseProductsService.getById(this.baseProductId!).subscribe({
        next: (response) => {
          this._currentBaseProduct = response;
          this._populateForm(response);
        },
        error: (error: any) => {
          this.errorMessage = 'Error al cargar el producto base';
          console.error('Error loading base product:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  
  private _populateForm(product: IBaseProduct): void {
    // Core fields
    this.baseProductForm.patchValue({
      name: product.name,
      brand: product.brand || '',
      model: product.model || '',
      sku: product.sku || '',
      description: product.description || '',
      image: product.image || '',
      highResImageUrl: product.specifications?.originalData?.highResImageUrl || '',
      rating: product.specifications?.rating || null,
      isActive: product.isActive
    });
    
    // Categories
    if (product.categories && product.categories.length > 0) {
      this.selectedCategories = product.categories.map(cat => cat.id);
    }
  }
  
  private _prepareFormData(): ICreateBaseProductRequest | IUpdateBaseProductRequest {
    const formValue = this.baseProductForm.value;
    
    // Core fields
    const data: any = {
      name: formValue.name
    };
    
    if (formValue.brand?.trim()) {
      data.brand = formValue.brand.trim();
    }
    
    if (formValue.model?.trim()) {
      data.model = formValue.model.trim();
    }
    
    if (formValue.sku?.trim()) {
      data.sku = formValue.sku.trim();
    }
    
    if (formValue.description?.trim()) {
      data.description = formValue.description.trim();
    }
    
    if (formValue.image?.trim()) {
      data.image = formValue.image.trim();
    }
    
    if (formValue.isActive !== undefined) {
      data.isActive = formValue.isActive;
    }
    
    // Specifications
    const specifications: any = {};
    
    if (formValue.rating !== null && formValue.rating !== undefined && formValue.rating !== '') {
      specifications.rating = Number(formValue.rating);
    }
    
    if (formValue.highResImageUrl?.trim()) {
      specifications.originalData = {
        highResImageUrl: formValue.highResImageUrl.trim()
      };
    }
    
    // Handle categories from selected categories
    const selectedCategoryNames = this.getSelectedCategoryNames();
    
    if (selectedCategoryNames.length > 0) {
      specifications.categories = selectedCategoryNames;
    }
    
    // Only include specifications if it has values
    if (Object.keys(specifications).length > 0) {
      data.specifications = specifications;
    }
    
    // Handle categories for the main request
    if (this.selectedCategories.length > 0) {
      data.categoryIds = this.selectedCategories;
    }
    
    return data;
  }
  
  private _createBaseProduct(baseProductData: ICreateBaseProductRequest): void {
    this._alertService.loading('Creando producto base...');
    
    this._baseProductsService.create(baseProductData).subscribe({
      next: (response) => {
        this._alertService.close();
        this._alertService.success('Producto base creado exitosamente');
        setTimeout(() => {
          this._router.navigate(['/admin/base-products']);
        }, 2000);
      },
      error: (error: any) => {
        this._alertService.close();
        this._alertService.error('Error al crear el producto base. Intente nuevamente.');
        console.error('Error creating base product:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
  
  private _updateBaseProduct(baseProductData: IUpdateBaseProductRequest): void {
    if (!this.baseProductId) return;
    
    this._alertService.loading('Guardando cambios...');
    
    this._baseProductsService.update(this.baseProductId!, baseProductData).subscribe({
      next: (response) => {
        this._alertService.close();
        this._alertService.success('Producto base actualizado exitosamente');
        setTimeout(() => {
          this._router.navigate(['/admin/base-products']);
        }, 2000);
      },
      error: (error: any) => {
        this._alertService.close();
        this._alertService.error('Error al actualizar el producto base. Intente nuevamente.');
        console.error('Error updating base product:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
  
  private _markFormGroupTouched(): void {
    Object.keys(this.baseProductForm.controls).forEach(key => {
      const control = this.baseProductForm.get(key);
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
