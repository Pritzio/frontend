import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { StoresService } from '../../../../../core/services/stores.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { IStore, IStoreLocation, IStoreAnalytics, StoreType, StoreStatus, StoreCategory } from '../../../../../models/store.model';
import { IApiResponse } from '../../../../../models/api.model';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [StoresService, AlertService],
  templateUrl: './store-detail.component.html',
  styleUrls: ['./store-detail.component.scss']
})
export class StoreDetailComponent implements OnInit, OnDestroy {
  public store: IStore | null = null;
  public storeAnalytics: IStoreAnalytics | null = null;
  public storeLocations: IStoreLocation[] = [];
  public isLoading = false;
  public error: string | null = null;
  public activeTab = 'overview';

  // Enums for template
  public StoreType = StoreType;
  public StoreStatus = StoreStatus;
  public StoreCategory = StoreCategory;

  private _destroy$ = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _storesService: StoresService,
    private _alertService: AlertService
  ) {}

  ngOnInit(): void {
    this._route.paramMap.pipe(
      takeUntil(this._destroy$)
    ).subscribe(params => {
      const storeId = params.get('id');
      console.log('🔍 Route params changed, storeId:', storeId);
      console.log('🔍 All params:', params);
      if (storeId) {
        this._loadStore(storeId);
      } else {
        this.error = 'ID de tienda no válido';
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // ===== Public Methods =====

  public setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  public editStore(): void {
    if (this.store) {
      this._router.navigate(['/admin/stores', this.store.id, 'edit']);
    }
  }

  public async verifyStore(): Promise<void> {
    if (!this.store) return;

    const confirmed = await this._alertService.confirm(
      `¿Verificar la tienda "${this.store.name}"?`,
      'Verificar Tienda',
      'Sí, verificar',
      'Cancelar'
    );

    if (confirmed) {
      this.isLoading = true;
      this._storesService.verifyStore(this.store.id).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda verificada exitosamente');
          this._loadStore(this.store!.id);
        },
        error: (err: any) => {
          this._alertService.error(err.message || 'Error al verificar la tienda');
        }
      });
    }
  }

  public async suspendStore(): Promise<void> {
    if (!this.store) return;

    const confirmed = await this._alertService.confirm(
      `¿Suspender la tienda "${this.store.name}"?`,
      'Suspender Tienda',
      'Sí, suspender',
      'Cancelar'
    );

    if (confirmed) {
      this.isLoading = true;
      this._storesService.suspendStore(this.store.id).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda suspendida exitosamente');
          this._loadStore(this.store!.id);
        },
        error: (err: any) => {
          this._alertService.error(err.message || 'Error al suspender la tienda');
        }
      });
    }
  }

  public async reactivateStore(): Promise<void> {
    if (!this.store) return;

    const confirmed = await this._alertService.confirm(
      `¿Reactivar la tienda "${this.store.name}"?`,
      'Reactivar Tienda',
      'Sí, reactivar',
      'Cancelar'
    );

    if (confirmed) {
      this.isLoading = true;
      this._storesService.reactivateStore(this.store.id).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda reactivada exitosamente');
          this._loadStore(this.store!.id);
        },
        error: (err: any) => {
          this._alertService.error(err.message || 'Error al reactivar la tienda');
        }
      });
    }
  }

  public async deleteStore(): Promise<void> {
    if (!this.store) return;

    const confirmed = await this._alertService.confirm(
      `¿Eliminar la tienda "${this.store.name}"? Esta acción no se puede deshacer.`,
      'Eliminar Tienda',
      'Sí, eliminar',
      'Cancelar'
    );

    if (confirmed) {
      this.isLoading = true;
      this._storesService.deleteStore(this.store.id).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda eliminada exitosamente');
          this._router.navigate(['/admin/stores']);
        },
        error: (err: any) => {
          this._alertService.error(err.message || 'Error al eliminar la tienda');
        }
      });
    }
  }

  public getStatusBadgeClass(status: StoreStatus): string {
    switch (status) {
      case StoreStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case StoreStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case StoreStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      case StoreStatus.PENDING_VERIFICATION:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  public getTypeBadgeClass(type: StoreType): string {
    switch (type) {
      case StoreType.ONLINE:
        return 'bg-blue-100 text-blue-800';
      case StoreType.PHYSICAL:
        return 'bg-green-100 text-green-800';
      case StoreType.HYBRID:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  public getCategoryDisplayName(category: StoreCategory): string {
    const categoryMap: Record<StoreCategory, string> = {
      [StoreCategory.ELECTRONICS]: 'Electrónicos',
      [StoreCategory.CLOTHING]: 'Ropa',
      [StoreCategory.HOME_AND_GARDEN]: 'Hogar y Jardín',
      [StoreCategory.SPORTS]: 'Deportes',
      [StoreCategory.BEAUTY]: 'Belleza',
      [StoreCategory.BOOKS]: 'Libros',
      [StoreCategory.AUTOMOTIVE]: 'Automotriz',
      [StoreCategory.FOOD_AND_BEVERAGES]: 'Alimentos y Bebidas',
      [StoreCategory.HEALTH]: 'Salud',
      [StoreCategory.TOYS]: 'Juguetes',
      [StoreCategory.OTHER]: 'Otros'
    };
    return categoryMap[category] || category;
  }

  public getStoreImage(): string | null {
    return this.store?.logo || null;
  }

  public onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  // ===== Private Methods =====

  private _loadStore(storeId: string): void {
    console.log('🔍 Loading store with ID:', storeId);
    if (!storeId) {
      this.error = 'ID de tienda no válido';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this._storesService.getAdminStoreById(storeId).pipe(
      takeUntil(this._destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response: any) => {
        console.log('🔍 Store response received:', response);
        if (response && response.data) {
          // Standard API response
          this.store = response.data;
          console.log('🔍 Store loaded from data object:', this.store?.name, this.store?.id);
          this._loadStoreAnalytics();
          this._loadStoreLocations();
        } else if (response && response.store) {
          // Direct store response
          this.store = response.store;
          console.log('🔍 Store loaded from store object:', this.store?.name, this.store?.id);
          this._loadStoreAnalytics();
          this._loadStoreLocations();
        } else if (response && response.id) {
          // Direct store object response
          this.store = response;
          console.log('🔍 Store loaded from direct object:', this.store?.name, this.store?.id);
          this._loadStoreAnalytics();
          this._loadStoreLocations();
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

  private _loadStoreAnalytics(): void {
    if (!this.store) return;

    // TODO: Enable when analytics endpoint is available
    // this._storesService.getStoreAnalytics(this.store.id).pipe(
    //   takeUntil(this._destroy$)
    // ).subscribe({
    //   next: (response: IApiResponse<IStoreAnalytics>) => {
    //     if (response && response.data) {
    //       this.storeAnalytics = response.data;
    //     }
    //   },
    //   error: (_err: any) => {
    //     // Analytics are optional, don't show error
    //   }
    // });
  }

  private _loadStoreLocations(): void {
    if (!this.store) return;

    // TODO: Implement store locations loading when API is available
    this.storeLocations = [];
  }
}
