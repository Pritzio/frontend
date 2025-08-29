import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface StatCardData {
  title: string;
  value: number;
  subtitle?: string;
  subtitleValue?: number;
  icon: string;
  iconColor: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <!-- Title -->
          <p class="text-sm font-medium text-gray-600 mb-2">
            {{ data.title | translate }}
          </p>
          
          <!-- Main Value -->
          <p class="text-3xl font-bold text-gray-900 mb-1">
            {{ data.value | number }}
          </p>
          
          <!-- Subtitle -->
          <div *ngIf="data.subtitle && data.subtitleValue !== undefined" class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">
              {{ data.subtitle | translate }}: 
            </span>
            <span class="text-sm font-medium" [ngClass]="getSubtitleColor()">
              {{ data.subtitleValue | number }}
            </span>
          </div>
          
          <!-- Trend -->
          <div *ngIf="data.trend" class="flex items-center mt-2">
            <svg 
              class="w-4 h-4 mr-1" 
              [ngClass]="data.trend.isPositive ? 'text-green-500' : 'text-red-500'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                *ngIf="data.trend.isPositive" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              ></path>
              <path 
                *ngIf="!data.trend.isPositive" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              ></path>
            </svg>
            <span 
              class="text-sm font-medium"
              [ngClass]="data.trend.isPositive ? 'text-green-600' : 'text-red-600'"
            >
              {{ data.trend.value }}% {{ data.trend.label | translate }}
            </span>
          </div>
        </div>
        
        <!-- Icon -->
        <div class="flex-shrink-0">
          <div class="p-3 rounded-full" [ngClass]="getIconBackgroundClass()">
            <div [ngClass]="getIconTextClass()">
              <ng-container [ngSwitch]="data.icon">
                <svg *ngSwitchCase="'users'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                <svg *ngSwitchCase="'stores'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <svg *ngSwitchCase="'products'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <svg *ngSwitchCase="'analytics'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <svg *ngSwitchCase="'activity'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <svg *ngSwitchCase="'pending'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg *ngSwitchDefault class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() data!: StatCardData;

  getIconBackgroundClass(): string {
    const classes = {
      primary: 'bg-blue-100',
      success: 'bg-green-100',
      warning: 'bg-yellow-100',
      error: 'bg-red-100',
      info: 'bg-indigo-100'
    };
    return classes[this.data.iconColor] || classes.primary;
  }

  getIconTextClass(): string {
    const classes = {
      primary: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-indigo-600'
    };
    return classes[this.data.iconColor] || classes.primary;
  }

  getSubtitleColor(): string {
    return this.getIconTextClass();
  }
}
