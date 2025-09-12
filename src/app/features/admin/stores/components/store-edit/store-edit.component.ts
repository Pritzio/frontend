import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { StoresService } from '../../../../../core/services/stores.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { IStore, StoreType, StoreStatus, StoreCategory } from '../../../../../models/store.model';

@Component({
  selector: 'app-store-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './store-edit.component.html',
  styleUrls: ['./store-edit.component.scss']
})
export class StoreEditComponent implements OnInit, OnDestroy {
  public storeForm: FormGroup;
  public store: IStore | null = null;
  public isLoading = false;
  public error: string | null = null;
  public isEditMode = false;

  // Expose enums to template
  public StoreType = StoreType;
  public StoreStatus = StoreStatus;
  public StoreCategory = StoreCategory;

  private _destroy$ = new Subject<void>();

  // Inject services
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _storesService = inject(StoresService);
  private _alertService = inject(AlertService);

  constructor() {
    this.storeForm = this._createForm();
  }

  ngOnInit(): void {
    this._route.paramMap.pipe(
      takeUntil(this._destroy$)
    ).subscribe(params => {
      const storeId = params.get('id');
      if (storeId) {
        this.isEditMode = true;
        this._loadStore(storeId);
      } else {
        this.isEditMode = false;
        this.storeForm.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public async onSubmit(): Promise<void> {
    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      return;
    }

    // Get form data, including disabled fields
    const formData = this.storeForm.getRawValue();
    this.isLoading = true;
    this.error = null;

    try {
      if (this.isEditMode && this.store) {
        await this._updateStore(this.store.id, formData);
      } else {
        await this._createStore(formData);
      }
    } catch (error) {
      this.error = 'Error al procesar la solicitud';
    } finally {
      this.isLoading = false;
    }
  }

  public onCancel(): void {
    if (this.isEditMode) {
      this._router.navigate(['/admin/stores', this.store?.id]);
    } else {
      this._router.navigate(['/admin/stores']);
    }
  }

  public onLogoError(event: any): void {
    // Hide the image if it fails to load
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  private _createForm(): FormGroup {
    return this._fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      logo: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      type: [StoreType.ONLINE, [Validators.required]],
      category: [StoreCategory.OTHER, [Validators.required]],
      timezone: ['America/Santiago'],
      country: ['Chile']
    });
  }

  private _loadStore(storeId: string): void {
    this.isLoading = true;
    this.error = null;

    this._storesService.getAdminStoreById(storeId).pipe(
      takeUntil(this._destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.store = response;
          this._populateForm(response);
        } else if (response && response.data) {
          this.store = response.data;
          this._populateForm(response.data);
        } else if (response && response.store) {
          this.store = response.store;
          this._populateForm(response.store);
        } else {
          this.error = 'Tienda no encontrada';
        }
      },
      error: (error: any) => {
        this.error = 'Error al cargar la tienda';
        if (error.status === 404) {
          this.error = 'Tienda no encontrada';
        } else if (error.status === 401) {
          this.error = 'No autorizado';
        } else if (error.status === 403) {
          this.error = 'Sin permisos suficientes';
        }
      }
    });
  }

  private _populateForm(store: IStore): void {
    this.storeForm.patchValue({
      name: store.name,
      description: store.description || '',
      website: store.website || '',
      logo: store.logo || '',
      email: store.email || '',
      phone: store.phone || '',
      type: store.type,
      category: store.category,
      timezone: store.timezone || 'America/Santiago',
      country: store.country || 'Chile'
    });

    // Disable name field in edit mode
    if (this.isEditMode) {
      this.storeForm.get('name')?.disable();
    }
  }

  private async _updateStore(storeId: string, formData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this._storesService.updateStore(storeId, formData).pipe(
        takeUntil(this._destroy$)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda actualizada exitosamente');
          this._router.navigate(['/admin/stores', storeId]);
          resolve();
        },
        error: (error: any) => {
          this._alertService.error(error.message || 'Error al actualizar la tienda');
          reject(error);
        }
      });
    });
  }

  private async _createStore(formData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this._storesService.createStore(formData).pipe(
        takeUntil(this._destroy$)
      ).subscribe({
        next: (response: any) => {
          const storeId = response?.id || response?.data?.id;
          this._alertService.success('Tienda creada exitosamente');
          this._router.navigate(['/admin/stores', storeId]);
          resolve();
        },
        error: (error: any) => {
          this._alertService.error(error.message || 'Error al crear la tienda');
          reject(error);
        }
      });
    });
  }
}
