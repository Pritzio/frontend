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
    // Load translations from JSON files synchronously using fetch
    this._loadTranslationsFromFilesSync();
  }

  private _loadTranslationsFromFilesSync(): void {
    // Load translations synchronously to prevent flash of untranslated content
    const currentLang = this._currentLanguage.value;
    
    // Load current language first
    this._loadLanguageSync(currentLang);
    
    // Load fallback language (Spanish) if different
    if (currentLang !== 'es') {
      this._loadLanguageSync('es');
    }
    
    // Mark as loaded
    this._isLoaded.next(true);
  }

  private _loadLanguageSync(language: string): void {
    try {
      // Use synchronous XMLHttpRequest for immediate loading
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `/assets/i18n/${language}.json`, false); // false = synchronous
      xhr.send();
      
      if (xhr.status === 200) {
        this._translations[language] = JSON.parse(xhr.responseText);
      } else {
        console.error(`Failed to load ${language} translations`);
      }
    } catch (error) {
      console.error(`Error loading ${language} translations:`, error);
    }
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
    // If translations are not loaded yet, return a loading placeholder or the key
    if (!this._isLoaded.value) {
      // Return a more user-friendly placeholder instead of the raw key
      return this._getLoadingPlaceholder(key);
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

  private _getLoadingPlaceholder(key: string): string {
    // Return a more user-friendly placeholder based on the key
    if (key.includes('TITLE')) return '...';
    if (key.includes('SUBTITLE')) return '...';
    if (key.includes('BUTTON')) return '...';
    if (key.includes('MESSAGE')) return '...';
    if (key.includes('ERROR')) return '...';
    if (key.includes('SUCCESS')) return '...';
    if (key.includes('LOADING')) return 'Cargando...';
    
    // For common keys, return appropriate placeholders
    const commonKeys: { [key: string]: string } = {
      'COMMON.LOADING': 'Cargando...',
      'COMMON.SAVE': 'Guardar',
      'COMMON.CANCEL': 'Cancelar',
      'COMMON.DELETE': 'Eliminar',
      'COMMON.EDIT': 'Editar',
      'COMMON.CREATE': 'Crear',
      'COMMON.SEARCH': 'Buscar',
      'COMMON.FILTER': 'Filtrar',
      'COMMON.ACTIONS': 'Acciones',
      'COMMON.STATUS': 'Estado',
      'COMMON.ACTIVE': 'Activo',
      'COMMON.INACTIVE': 'Inactivo',
      'COMMON.YES': 'Sí',
      'COMMON.NO': 'No',
      'COMMON.SUCCESS': 'Éxito',
      'COMMON.ERROR': 'Error',
      'COMMON.WARNING': 'Advertencia',
      'COMMON.INFO': 'Información',
      'COMMON.CLOSE': 'Cerrar',
      'COMMON.UNDERSTOOD': 'Entendido',
      'COMMON.BACK': 'Atrás',
      'COMMON.NEXT': 'Siguiente',
      'COMMON.PREVIOUS': 'Anterior',
      'COMMON.SUBMIT': 'Enviar',
      'COMMON.RESET': 'Restablecer',
      'COMMON.CONFIRM': 'Confirmar',
      'COMMON.DISCARD': 'Descartar',
      'COMMON.UPLOAD': 'Subir',
      'COMMON.DOWNLOAD': 'Descargar',
      'COMMON.EXPORT': 'Exportar',
      'COMMON.IMPORT': 'Importar',
      'COMMON.REFRESH': 'Actualizar',
      'COMMON.UPDATE': 'Actualizar',
      'COMMON.VIEW': 'Ver',
      'COMMON.DETAILS': 'Detalles',
      'COMMON.RETRY': 'Reintentar',
      'COMMON.TOTAL': 'Total',
      'COMMON.NO_DATA': 'Sin Datos',
      'COMMON.NO_DATA_DESCRIPTION': 'No hay datos disponibles para mostrar',
      'COMMON.VIEW_ALL': 'Ver Todo',
      'COMMON.SETTINGS': 'Configuración',
      'COMMON.PROFILE': 'Perfil',
      'COMMON.LOGOUT': 'Cerrar Sesión',
      'COMMON.LOGIN': 'Iniciar Sesión',
      'COMMON.REGISTER': 'Registrarse',
      'COMMON.FORGOT_PASSWORD': 'Olvidé mi Contraseña',
      'COMMON.RESET_PASSWORD': 'Restablecer Contraseña',
      'COMMON.CHANGE_PASSWORD': 'Cambiar Contraseña',
      'COMMON.EMAIL': 'Correo Electrónico',
      'COMMON.PASSWORD': 'Contraseña',
      'COMMON.USERNAME': 'Nombre de Usuario',
      'COMMON.FIRST_NAME': 'Nombre',
      'COMMON.LAST_NAME': 'Apellido',
      'COMMON.PHONE': 'Teléfono',
      'COMMON.ADDRESS': 'Dirección',
      'COMMON.CITY': 'Ciudad',
      'COMMON.COUNTRY': 'País',
      'COMMON.POSTAL_CODE': 'Código Postal',
      'COMMON.LANGUAGE': 'Idioma',
      'COMMON.ENGLISH': 'Inglés',
      'COMMON.SPANISH': 'Español',
      'COMMON.REMEMBER_ME': 'Recordarme',
      'COMMON.OR': 'o',
      'COMMON.EMAIL_REQUIRED': 'El correo electrónico es requerido',
      'COMMON.EMAIL_INVALID': 'Por favor ingresa un correo electrónico válido',
      'COMMON.PASSWORD_REQUIRED': 'La contraseña es requerida',
      'COMMON.CONTINUE_WITH_GOOGLE': 'Continuar con Google',
      'COMMON.CONTINUE_WITH_FACEBOOK': 'Continuar con Facebook',
      'COMMON.COMPARE_AND_SAVE': 'Compara y Ahorra',
      'COMMON.COMPARE_DESCRIPTION': 'Encuentra los mejores precios en múltiples tiendas',
      'COMMON.COMPARE': 'Comparar',
      'COMMON.FAVORITES': 'Favoritos',
      'COMMON.HOME': 'Inicio',
      'COMMON.FOOTER_DESCRIPTION': 'Tu plataforma confiable para comparación de precios y ahorros',
      'COMMON.PROGRESS': 'Progreso'
    };
    
    return commonKeys[key] || '...';
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