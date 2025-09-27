import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private _i18nService: I18nService) {}

  transform(key: string, params?: { [key: string]: any }): string {
    if (!key) {
      return '';
    }

    try {
      return this._i18nService.translate(key, params);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  }
}
