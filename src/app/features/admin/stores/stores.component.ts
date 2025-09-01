import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AdminService, Store } from '../../../core/services/admin.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  public stores: Store[] = [];
  public isLoading = true;
  public searchTerm = '';
  public statusFilter = '';
  public categoryFilter = '';

  constructor(
    private _adminService: AdminService,
    private _i18nService: I18nService,
    private _alertService: AlertService
  ) {}

  ngOnInit(): void {
    this._loadStores();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadStores(): void {
    this.isLoading = true;
    this._adminService.stores$
      .pipe(takeUntil(this._destroy$))
      .subscribe(stores => {
        this.stores = stores;
        this.isLoading = false;
      });

    this._adminService.getStores().subscribe();
  }

  public get filteredStores(): Store[] {
    let filtered = this.stores;

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(search) ||
        store.description?.toLowerCase().includes(search) ||
        store.website.toLowerCase().includes(search)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(store => store.status === this.statusFilter);
    }

    if (this.categoryFilter) {
      filtered = filtered.filter(store => store.category === this.categoryFilter);
    }

    return filtered;
  }

  public async verifyStore(store: Store): Promise<void> {
    const message = this._i18nService.translate('STORES.CONFIRMATIONS.VERIFY', { name: store.name });
    
    const confirmed = await this._alertService.confirm(
      message,
      '¿Verificar tienda?',
      'Sí, verificar',
      'Cancelar'
    );

    if (confirmed) {
      this._adminService.verifyStore(store.id).subscribe({
        next: () => {
          this._loadStores();
          this._alertService.success('Tienda verificada exitosamente', 'Verificación Completada');
        },
        error: (error) => {
          const errorMessage = this._i18nService.translate('STORES.ERRORS.VERIFY');
          this._alertService.error(errorMessage, 'Error');
        }
      });
    }
  }

  public async deleteStore(store: Store): Promise<void> {
    const message = this._i18nService.translate('STORES.CONFIRMATIONS.DELETE', { name: store.name });
    
    const confirmed = await this._alertService.confirm(
      message,
      '¿Eliminar tienda?',
      'Sí, eliminar',
      'Cancelar'
    );

    if (confirmed) {
      this._adminService.deleteStore(store.id).subscribe({
        next: () => {
          this._loadStores();
          this._alertService.success('Tienda eliminada exitosamente', 'Eliminación Completada');
        },
        error: (error) => {
          const errorMessage = this._i18nService.translate('STORES.ERRORS.DELETE');
          this._alertService.error(errorMessage, 'Error');
        }
      });
    }
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'text-success-600 bg-success-50';
      case 'INACTIVE': return 'text-gray-600 bg-gray-50';
      case 'PENDING_VERIFICATION': return 'text-warning-600 bg-warning-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  public getTypeColor(type: string): string {
    switch (type) {
      case 'ONLINE': return 'text-primary-600 bg-primary-50';
      case 'PHYSICAL': return 'text-success-600 bg-success-50';
      case 'HYBRID': return 'text-warning-600 bg-warning-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  public clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.categoryFilter = '';
  }

  public viewStore(store: Store): void {
    // TODO: Implement view store functionality
  }

  public editStore(store: Store): void {
    // TODO: Implement edit store functionality
  }
}
