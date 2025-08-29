import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private _subscription: Subscription | null = null;
  private _lastKey: string = '';
  private _lastParams: any = null;
  private _lastResult: string = '';

  constructor(private _i18nService: I18nService) {
    // Subscribe to translation loading status and language changes
    this._subscription = this._i18nService.isLoaded$.subscribe((loaded) => {
      if (loaded && this._lastKey) {
        // Re-evaluate translation when translations are loaded
        this._lastResult = this._i18nService.translate(this._lastKey, this._lastParams);
      }
    });

    // Subscribe to language changes
    this._i18nService.currentLanguage$.subscribe((language) => {
      if (this._lastKey) {
        // Re-evaluate translation when language changes
        this._lastResult = this._i18nService.translate(this._lastKey, this._lastParams);
      }
    });
  }

  transform(key: string, params?: { [key: string]: any }): string {
    if (!key) {
      return '';
    }

    // Store for re-evaluation when translations load
    this._lastKey = key;
    this._lastParams = params;

    const result = this._i18nService.translate(key, params);
    this._lastResult = result;



    return result;
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
