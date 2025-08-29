import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslationService, Language } from '../../../core/services/translation.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-2 items-center">
      <button 
        *ngFor="let lang of supportedLanguages" 
        class="lang-btn"
        [class.active]="lang === currentLanguage"
        (click)="changeLanguage(lang)"
        [attr.aria-label]="'Change language to ' + getLanguageDisplayName(lang)"
      >
        <span class="text-lg leading-none">{{ getLanguageFlag(lang) }}</span>
        <span class="font-medium lang-name">{{ getLanguageDisplayName(lang) }}</span>
      </button>
    </div>
  `,
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  public currentLanguage: Language = 'en';
  public supportedLanguages: Language[] = [];

  constructor(
    private _translationService: TranslationService,
    private _i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this._loadLanguageData();
  }

  private _loadLanguageData(): void {
    this.currentLanguage = this._translationService.getCurrentLanguage();
    this.supportedLanguages = this._translationService.getSupportedLanguages();
  }

  changeLanguage(language: Language): void {
    if (language !== this.currentLanguage) {
      this._translationService.changeLanguage(language);
      this._i18nService.setLanguage(language);
    }
  }

  getLanguageDisplayName(language: Language): string {
    return this._translationService.getLanguageDisplayName(language);
  }

  getLanguageFlag(language: Language): string {
    const flags = {
      en: '🇺🇸',
      es: '🇪🇸'
    };
    return flags[language] || '🌐';
  }
}
