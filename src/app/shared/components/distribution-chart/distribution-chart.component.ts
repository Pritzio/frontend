import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface DistributionData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

@Component({
  selector: 'app-distribution-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">{{ title | translate }}</h3>
        <div *ngIf="showTotal" class="text-sm text-gray-500">
          {{ 'COMMON.TOTAL' | translate }}: {{ getTotal() | number }}
        </div>
      </div>

      <!-- Chart Content -->
      <div class="space-y-4">
        <!-- Progress bars for each item -->
        <div *ngFor="let item of processedData" class="space-y-2">
          <!-- Label and value -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full" [style.backgroundColor]="item.color"></div>
              <span class="text-sm font-medium text-gray-700">{{ item.label | translate }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-semibold text-gray-900">{{ item.value | number }}</span>
              <span *ngIf="showPercentages" class="text-xs text-gray-500">
                ({{ item.percentage }}%)
              </span>
            </div>
          </div>
          
          <!-- Progress bar -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300 ease-in-out"
              [style.backgroundColor]="item.color"
              [style.width.%]="item.percentage"
            ></div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="processedData.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ 'COMMON.NO_DATA' | translate }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ 'COMMON.NO_DATA_DESCRIPTION' | translate }}</p>
        </div>
      </div>
    </div>
  `
})
export class DistributionChartComponent {
  @Input() title: string = '';
  @Input() data: DistributionData[] = [];
  @Input() showPercentages: boolean = true;
  @Input() showTotal: boolean = true;

  get processedData(): DistributionData[] {
    if (!this.data || this.data.length === 0) {
      return [];
    }

    const total = this.getTotal();
    
    return this.data
      .filter(item => item.value > 0)
      .map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }

  getTotal(): number {
    return this.data.reduce((sum, item) => sum + item.value, 0);
  }
}
