import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { I18nService } from './i18n.service';

export type Language = 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private _currentLanguage = new BehaviorSubject<Language>('en');
  public currentLanguage$ = this._currentLanguage.asObservable();

  private readonly _defaultLanguage: Language = 'en';
  private readonly _supportedLanguages: Language[] = ['en', 'es'];

  constructor(private _i18nService: I18nService) {
    this._initializeLanguage();
  }

  private _initializeLanguage(): void {
    // Get language from localStorage or browser
    const savedLanguage = this._getSavedLanguage();
    const browserLanguage = this._getBrowserLanguage();
    
    const languageToUse = savedLanguage || browserLanguage || this._defaultLanguage;
    this.setLanguage(languageToUse);
  }

  private _getSavedLanguage(): Language | null {
    const saved = localStorage.getItem('language');
    return saved && this._supportedLanguages.includes(saved as Language) 
      ? saved as Language 
      : null;
  }

  private _getBrowserLanguage(): Language | null {
    const browserLang = navigator.language || navigator.languages?.[0];
    if (!browserLang) return null;

    // Extract language code (e.g., 'en-US' -> 'en')
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Map to supported languages
    if (langCode === 'es') return 'es';
    if (langCode === 'en') return 'en';
    
    return null;
  }

  setLanguage(language: Language): void {
    if (!this._supportedLanguages.includes(language)) {
      console.warn(`Language '${language}' is not supported. Using default language.`);
      language = this._defaultLanguage;
    }

    this._currentLanguage.next(language);
    localStorage.setItem('language', language);
    
    // Sync with I18nService
    this._i18nService.setLanguage(language);

    // Update document direction for RTL languages if needed in the future
    document.documentElement.lang = language;
  }

  getCurrentLanguage(): Language {
    return this._currentLanguage.value;
  }

  getSupportedLanguages(): Language[] {
    return [...this._supportedLanguages];
  }

  getLanguageDisplayName(language: Language): string {
    const languageNames = {
      en: 'English',
      es: 'Español'
    };
    return languageNames[language] || language;
  }

  // Method to change language and reload translations
  changeLanguage(language: Language): void {
    this.setLanguage(language);
    // Force reload of current component translations
    window.location.reload();
  }
}
