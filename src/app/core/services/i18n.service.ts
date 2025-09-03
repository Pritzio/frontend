import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ITranslations {
  [key: string]: string | ITranslations;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private _translations: { [lang: string]: ITranslations } = {};
  private _currentLanguage = new BehaviorSubject<string>('es');
  public currentLanguage$ = this._currentLanguage.asObservable();
  private _isLoaded = new BehaviorSubject<boolean>(false);
  public isLoaded$ = this._isLoaded.asObservable();

  constructor() {
    // Initialize language from localStorage or browser FIRST
    this._initializeLanguage();
    
    // Then load translations
    this._loadTranslationsSync();
    
    // Listen for browser language changes
    this._setupLanguageChangeListener();
  }

  private _initializeLanguage(): void {
    // Get language from localStorage or browser
    const savedLanguage = localStorage.getItem('language');
    
    const browserLanguage = this._getBrowserLanguage();
    
    // Default to Spanish if no language detected
    const languageToUse = savedLanguage || browserLanguage || 'es';
    
    this._currentLanguage.next(languageToUse);
  }

  private _getBrowserLanguage(): string | null {
    // Try to get the most preferred language from the browser
    const browserLang = navigator.language || navigator.languages?.[0];
    
    if (!browserLang) {
      return null;
    }

    // Extract language code (e.g., 'en-US' -> 'en')
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Map to supported languages
    if (langCode === 'es') {
      return 'es';
    }
    if (langCode === 'en') {
      return 'en';
    }
    
    // Check if any of the browser languages are supported
    if (navigator.languages) {
      for (const lang of navigator.languages) {
        const code = lang.split('-')[0].toLowerCase();
        if (code === 'es') {
          return 'es';
        }
        if (code === 'en') {
          return 'en';
        }
      }
    }
    
    return 'es'; // Default to Spanish instead of null
  }

  private _setupLanguageChangeListener(): void {
    // Listen for language changes (this is experimental and may not work in all browsers)
    if ('languagechange' in window) {
      window.addEventListener('languagechange', () => {
        const newLanguage = this._getBrowserLanguage();
        if (newLanguage && newLanguage !== this._currentLanguage.value) {
          this.setLanguage(newLanguage);
        }
      });
    }
    
    // Alternative: Check language periodically (every 5 seconds)
    setInterval(() => {
      const currentBrowserLang = this._getBrowserLanguage();
      if (currentBrowserLang && currentBrowserLang !== this._currentLanguage.value) {
        this.setLanguage(currentBrowserLang);
      }
    }, 5000);
  }

  private _loadTranslationsSync(): void {
    // Load translations from JSON files asynchronously
    this._loadTranslationsFromFiles();
  }

  private async _loadTranslationsFromFiles(): Promise<void> {
    try {
      // Load English translations
      const enResponse = await fetch('/assets/i18n/en.json');
      if (enResponse.ok) {
        this._translations['en'] = await enResponse.json();
      } else {
        console.error('Failed to load English translations');
        return;
      }
      
      // Load Spanish translations
      const esResponse = await fetch('/assets/i18n/es.json');
      if (esResponse.ok) {
        this._translations['es'] = await esResponse.json();
      } else {
        console.error('Failed to load Spanish translations');
        return;
      }
      
      // Mark as loaded
      this._isLoaded.next(true);
      
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  setLanguage(language: string): void {
    this._currentLanguage.next(language);
    // Update localStorage
    localStorage.setItem('language', language);
  }

  getCurrentLanguage(): string {
    return this._currentLanguage.value;
  }

  translate(key: string, params?: { [key: string]: any }): string {
    if (!this._isLoaded.value) {
      return key;
    }

    const keys = key.split('.');
    const currentLang = this._currentLanguage.value;
    
    // Try current language first
    let translation = this._findTranslation(this._translations[currentLang], keys);
    
    // If not found, try Spanish as fallback
    if (!translation && currentLang !== 'es') {
      translation = this._findTranslation(this._translations['es'], keys);
    }
    
    // If still not found, return the key
    if (!translation) {
      return key;
    }

    // Handle parameters replacement
    if (typeof translation === 'string' && params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return typeof translation === 'string' ? translation : key;
  }

  private _findTranslation(translations: any, keys: string[]): string | null {
    if (!translations) return null;
    
    let current = translations;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && current[key] !== undefined) {
        current = current[key];
      } else {
        return null;
      }
    }
    
    return typeof current === 'string' ? current : null;
  }

  // Method to get all translations for a specific language
  getTranslations(language: string): ITranslations {
    return this._translations[language] || {};
  }

  getCurrentLanguageTranslations(): ITranslations {
    return this._translations[this._currentLanguage.value] || {};
  }

  // Method to check if a translation exists
  hasTranslation(key: string): boolean {
    const keys = key.split('.');
    const currentLang = this._currentLanguage.value;
    let translation: any = this._translations[currentLang] || this._translations['es'];

    for (const k of keys) {
      if (translation && typeof translation === 'object' && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        return false;
      }
    }

    return typeof translation === 'string';
  }

  // Method to wait for translations to be loaded
  async waitForTranslations(): Promise<void> {
    if (this._isLoaded.value) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      const subscription = this.isLoaded$.subscribe((loaded) => {
        if (loaded) {
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }

  // Method to get all translation keys
  getAllTranslationKeys(): string[] {
    const keys: string[] = [];
    
    const addKeys = (obj: any, prefix: string = '') => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'string') {
            keys.push(fullKey);
          } else if (typeof obj[key] === 'object') {
            addKeys(obj[key], fullKey);
          }
        }
      }
    };
    
    addKeys(this._translations[this._currentLanguage.value] || {});
    return keys;
  }
}