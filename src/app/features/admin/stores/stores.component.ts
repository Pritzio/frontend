import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs/operators';

import { StoresService } from '../../../core/services/stores.service';
import { AlertService } from '../../../core/services/alert.service';
import { IStore, IStoreFilters, StoreType, StoreStatus, StoreCategory } from '../../../models/store.model';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit, OnDestroy {
  public filtersForm: FormGroup;
  public stores: IStore[] = [];
  public isLoading = false;
  public error: string | null = null;
  public showFilters = false;

  // Pagination properties
  public currentPage = 1;
  public itemsPerPage = 20;
  public totalItems = 0;
  public totalPages = 0;
  public hasNext = false;
  public hasPrev = false;

  // Enums for template
  public StoreType = StoreType;
  public StoreStatus = StoreStatus;
  public StoreCategory = StoreCategory;
  public Math = Math;

  private _destroy$ = new Subject<void>();
  private _searchSubject = new Subject<string>();

  constructor(
    private _formBuilder: FormBuilder,
    private _storesService: StoresService,
    private _alertService: AlertService,
    private _router: Router
  ) {
    this.filtersForm = this._createFiltersForm();
    this._setupSearchDebounce();
  }

  ngOnInit(): void {
    this._loadStores();
    this._setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // ===== Public Methods =====

  public loadStores(): void {
    this._loadStores();
  }

  public toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  public clearFilters(): void {
    this.filtersForm.reset();
    this.currentPage = 1;
    this._loadStores();
  }

  public applyFilters(): void {
    this.currentPage = 1;
    this._loadStores();
  }

  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this._loadStores();
    }
  }

  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  public viewStore(store: IStore): void {
    this._router.navigate(['/admin/stores', store.id]);
  }

  public editStore(store: IStore): void {
    this._router.navigate(['/admin/stores', store.id, 'edit']);
  }

  public async verifyStore(store: IStore): Promise<void> {
    const confirmed = await this._alertService.confirm(
      `¿Verificar la tienda "${store.name}"?`,
      'Verificar Tienda',
      'Sí, verificar',
      'Cancelar'
    );

    if (confirmed) {
      this.isLoading = true;
      this._storesService.verifyStore(store.id).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda verificada exitosamente');
          this._loadStores();
        },
        error: (err) => {
          this._alertService.error(err.message || 'Error al verificar la tienda');
        }
      });
    }
  }

  public async suspendStore(store: IStore): Promise<void> {
    const confirmed = await this._alertService.confirm(
      `¿Suspender la tienda "${store.name}"?`,
      'Suspender Tienda',
      'Sí, suspender',
      'Cancelar'
    );

    if (confirmed) {
      this.isLoading = true;
      this._storesService.suspendStore(store.id).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda suspendida exitosamente');
          this._loadStores();
        },
        error: (err) => {
          this._alertService.error(err.message || 'Error al suspender la tienda');
        }
      });
    }
  }

  public async reactivateStore(store: IStore): Promise<void> {
    const confirmed = await this._alertService.confirm(
      `¿Reactivar la tienda "${store.name}"?`,
      'Reactivar Tienda',
      'Sí, reactivar',
      'Cancelar'
    );

    if (confirmed) {
      this.isLoading = true;
      this._storesService.reactivateStore(store.id).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda reactivada exitosamente');
          this._loadStores();
        },
        error: (err) => {
          this._alertService.error(err.message || 'Error al reactivar la tienda');
        }
      });
    }
  }

  public createStore(): void {
    this._router.navigate(['/admin/stores/new']);
  }

  public async deleteStore(store: IStore): Promise<void> {
    const confirmed = await this._alertService.confirm(
      `¿Eliminar la tienda "${store.name}"? Esta acción no se puede deshacer.`,
      'Eliminar Tienda',
      'Sí, eliminar',
      'Cancelar'
    );

    if (confirmed) {
      this.isLoading = true;
      this._storesService.deleteStore(store.id).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this._alertService.success('Tienda eliminada exitosamente');
          this._loadStores();
        },
        error: (err) => {
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

  // ===== Private Methods =====

  private _createFiltersForm(): FormGroup {
    return this._formBuilder.group({
      search: [''],
      type: [''],
      status: [''],
      category: [''],
      country: [''],
      isVerified: ['']
    });
  }

  private _setupSearchDebounce(): void {
    this._searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(value => {
      this.currentPage = 1;
      this._loadStores();
    });
  }

  private _setupFormSubscriptions(): void {
    this.filtersForm.get('search')?.valueChanges.pipe(
      takeUntil(this._destroy$)
    ).subscribe(value => {
      this._searchSubject.next(value);
    });

    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this._loadStores();
    });
  }

  private _loadStores(): void {
    this.isLoading = true;
    this.error = null;

    const formFilters = this._getFormFilters();
    const filters: IStoreFilters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...formFilters
    };

    this._storesService.getAdminStores(filters).subscribe({
      next: (response) => {
        if (response && response.stores) {
          this.stores = response.stores || [];
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.pages || 0;
          this.hasNext = response.pagination?.hasNext || false;
          this.hasPrev = response.pagination?.hasPrev || false;
        } else {
          this.stores = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.hasNext = false;
          this.hasPrev = false;
        }
      },
      error: (error) => {
        this.error = 'Error al cargar las tiendas';
        if (error.status === 404) {
          this.error = 'No se encontraron tiendas';
        } else if (error.status === 401) {
          this.error = 'No autorizado';
        } else if (error.status === 403) {
          this.error = 'Sin permisos suficientes';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private _getFormFilters(): Partial<IStoreFilters> {
    const formValue = this.filtersForm.value;
    const filters: Partial<IStoreFilters> = {};

    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        filters[key as keyof IStoreFilters] = value;
      }
    });

    return filters;
  }
}
