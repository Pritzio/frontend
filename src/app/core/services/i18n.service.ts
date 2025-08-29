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
    try {
      // Load translations from JSON files
      this._loadTranslationsFromFiles();
    } catch (error) {
      // Fallback to inline translations if files fail to load
      this._loadFallbackTranslations();
    }
  }

  private async _loadTranslationsFromFiles(): Promise<void> {
    try {
      // Load English translations
      const enResponse = await fetch('/assets/i18n/en.json');
      if (enResponse.ok) {
        this._translations['en'] = await enResponse.json();
      } else {
        this._loadFallbackTranslations();
        return;
      }
      
      // Load Spanish translations
      const esResponse = await fetch('/assets/i18n/es.json');
      if (esResponse.ok) {
        this._translations['es'] = await esResponse.json();
      } else {
        this._loadFallbackTranslations();
        return;
      }
      
      // Mark as loaded
      this._isLoaded.next(true);
      
    } catch (error) {
      this._loadFallbackTranslations();
    }
  }

  private _loadFallbackTranslations(): void {
    // Fallback translations in case JSON files fail to load
    this._translations['en'] = {
      "COMMON": {
        "LOADING": "Loading...",
        "SAVE": "Save",
        "CANCEL": "Cancel",
        "DELETE": "Delete",
        "EDIT": "Edit",
        "CREATE": "Create",
        "SEARCH": "Search",
        "FILTER": "Filter",
        "ACTIONS": "Actions",
        "STATUS": "Status",
        "ACTIVE": "Active",
        "INACTIVE": "Inactive",
        "YES": "Yes",
        "NO": "No",
        "SUCCESS": "Success",
        "ERROR": "Error",
        "WARNING": "Warning",
        "INFO": "Information",
        "CLOSE": "Close",
        "BACK": "Back",
        "NEXT": "Next",
        "PREVIOUS": "Previous",
        "SUBMIT": "Submit",
        "RESET": "Reset",
        "CONFIRM": "Confirm",
        "DISCARD": "Discard",
        "UPLOAD": "Upload",
        "DOWNLOAD": "Download",
        "EXPORT": "Export",
        "IMPORT": "Import",
        "REFRESH": "Refresh",
        "UPDATE": "Update",
        "VIEW": "View",
        "DETAILS": "Details",
        "SETTINGS": "Settings",
        "PROFILE": "Profile",
        "LOGOUT": "Logout",
        "LOGIN": "Login",
        "REGISTER": "Register",
        "FORGOT_PASSWORD": "Forgot Password",
        "RESET_PASSWORD": "Reset Password",
        "CHANGE_PASSWORD": "Change Password",
        "EMAIL": "Email",
        "PASSWORD": "Password",
        "USERNAME": "Username",
        "FIRST_NAME": "First Name",
        "LAST_NAME": "Last Name",
        "PHONE": "Phone",
        "ADDRESS": "Address",
        "CITY": "City",
        "COUNTRY": "Country",
        "POSTAL_CODE": "Postal Code",
        "LANGUAGE": "Language",
        "ENGLISH": "English",
        "SPANISH": "Spanish",
        "REMEMBER_ME": "Remember me",
        "COMPARE_AND_SAVE": "Compare and Save",
        "COMPARE_DESCRIPTION": "Find the best prices across multiple stores"
      },
      "AUTH": {
        "LOGIN_TITLE": "Welcome Back",
        "LOGIN_SUBTITLE": "Sign in to your account to continue",
        "LOGIN_IDENTIFIER": "Email or Username",
        "LOGIN_PASSWORD": "Password",
        "LOGIN_BUTTON": "Sign In",
        "LOGIN_ERROR": "Login failed",
        "LOGIN_INVALID_CREDENTIALS": "Invalid credentials. Please check your username/email and password.",
        "LOGIN_AUTH_FAILED": "Authentication failed. Please check your credentials.",
        "LOGIN_CONNECTION_ERROR": "Cannot connect to server. Please check your connection.",
        "LOGIN_GENERAL_ERROR": "An error occurred during login. Please try again.",
        "LOGIN_NO_ACCOUNT": "Don't have an account?",
        "LOGIN_SIGN_UP": "Sign up",
        "LOGIN_FORGOT_PASSWORD": "Forgot your password?",
        "REGISTER_TITLE": "Create Account",
        "REGISTER_SUBTITLE": "Sign up to get started",
        "REGISTER_BUTTON": "Create Account",
        "REGISTER_SUCCESS": "Account created successfully",
        "REGISTER_ERROR": "Registration failed",
        "REGISTER_INVALID_DATA": "Please check your information and try again.",
        "REGISTER_EMAIL_EXISTS": "An account with this email already exists.",
        "REGISTER_USERNAME_EXISTS": "This username is already taken.",
        "REGISTER_PASSWORD_MISMATCH": "Passwords do not match.",
        "REGISTER_TERMS": "I agree to the terms and conditions",
        "REGISTER_PRIVACY": "I agree to the privacy policy",
        "REGISTER_ALREADY_ACCOUNT": "Already have an account?",
        "REGISTER_SIGN_IN": "Sign in",
        "PASSWORD_RESET_TITLE": "Reset Password",
        "PASSWORD_RESET_SUBTITLE": "Enter your email to receive a reset link",
        "PASSWORD_RESET_BUTTON": "Send Reset Link",
        "PASSWORD_RESET_SUCCESS": "Reset link sent to your email",
        "PASSWORD_RESET_ERROR": "Failed to send reset link",
        "PASSWORD_RESET_INVALID_EMAIL": "Please enter a valid email address.",
        "PASSWORD_RESET_EMAIL_NOT_FOUND": "No account found with this email address.",
        "PASSWORD_RESET_BACK_TO_LOGIN": "Back to login",
        "PASSWORD_CHANGE_TITLE": "Change Password",
        "PASSWORD_CHANGE_SUBTITLE": "Enter your current and new password",
        "PASSWORD_CHANGE_CURRENT": "Current Password",
        "PASSWORD_CHANGE_NEW": "New Password",
        "PASSWORD_CHANGE_CONFIRM": "Confirm New Password",
        "PASSWORD_CHANGE_BUTTON": "Change Password",
        "PASSWORD_CHANGE_SUCCESS": "Password changed successfully",
        "PASSWORD_CHANGE_ERROR": "Failed to change password",
        "PASSWORD_CHANGE_INVALID_CURRENT": "Current password is incorrect.",
        "PASSWORD_CHANGE_MISMATCH": "New passwords do not match.",
        "PASSWORD_CHANGE_WEAK": "Password is too weak. Please use a stronger password.",
        "PASSWORD_CHANGE_BACK_TO_PROFILE": "Back to profile",
        "LOGOUT_SUCCESS": "Logged out successfully",
        "LOGOUT_ERROR": "Failed to log out",
        "SESSION_EXPIRED": "Your session has expired. Please log in again.",
        "ACCESS_DENIED": "Access denied. You don't have permission to view this page.",
        "NOT_FOUND": "Page not found",
        "SERVER_ERROR": "Server error. Please try again later.",
        "NETWORK_ERROR": "Network error. Please check your connection.",
        "VALIDATION_ERRORS": "Please fix the following errors:",
        "REQUIRED_FIELD": "This field is required",
        "INVALID_EMAIL": "Please enter a valid email address",
        "INVALID_USERNAME": "Username must be 3-20 characters and contain only letters, numbers, and underscores",
        "INVALID_PASSWORD": "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character",
        "PASSWORDS_MUST_MATCH": "Passwords must match",
        "TERMS_ACCEPTED": "You must accept the terms and conditions",
        "PRIVACY_ACCEPTED": "You must accept the privacy policy"
      }
    };

    this._translations['es'] = {
      "COMMON": {
        "LOADING": "Cargando...",
        "SAVE": "Guardar",
        "CANCEL": "Cancelar",
        "DELETE": "Eliminar",
        "EDIT": "Editar",
        "CREATE": "Crear",
        "SEARCH": "Buscar",
        "FILTER": "Filtrar",
        "ACTIONS": "Acciones",
        "STATUS": "Estado",
        "ACTIVE": "Activo",
        "INACTIVE": "Inactivo",
        "YES": "Sí",
        "NO": "No",
        "SUCCESS": "Éxito",
        "ERROR": "Error",
        "WARNING": "Advertencia",
        "INFO": "Información",
        "CLOSE": "Cerrar",
        "BACK": "Atrás",
        "NEXT": "Siguiente",
        "PREVIOUS": "Anterior",
        "SUBMIT": "Enviar",
        "RESET": "Restablecer",
        "CONFIRM": "Confirmar",
        "DISCARD": "Descartar",
        "UPLOAD": "Subir",
        "DOWNLOAD": "Descargar",
        "EXPORT": "Exportar",
        "IMPORT": "Importar",
        "REFRESH": "Actualizar",
        "UPDATE": "Actualizar",
        "VIEW": "Ver",
        "DETAILS": "Detalles",
        "SETTINGS": "Configuración",
        "PROFILE": "Perfil",
        "LOGOUT": "Cerrar Sesión",
        "LOGIN": "Iniciar Sesión",
        "REGISTER": "Registrarse",
        "FORGOT_PASSWORD": "¿Olvidaste tu contraseña?",
        "RESET_PASSWORD": "Restablecer Contraseña",
        "CHANGE_PASSWORD": "Cambiar Contraseña",
        "EMAIL": "Correo Electrónico",
        "PASSWORD": "Contraseña",
        "USERNAME": "Nombre de Usuario",
        "FIRST_NAME": "Nombre",
        "LAST_NAME": "Apellido",
        "PHONE": "Teléfono",
        "ADDRESS": "Dirección",
        "CITY": "Ciudad",
        "COUNTRY": "País",
        "POSTAL_CODE": "Código Postal",
        "LANGUAGE": "Idioma",
        "ENGLISH": "Inglés",
        "SPANISH": "Español",
        "REMEMBER_ME": "Recordarme",
        "COMPARE_AND_SAVE": "Compara y Ahorra",
        "COMPARE_DESCRIPTION": "Encuentra los mejores precios en múltiples tiendas"
      },
      "AUTH": {
        "LOGIN_TITLE": "Bienvenido de Vuelta",
        "LOGIN_SUBTITLE": "Inicia sesión en tu cuenta para continuar",
        "LOGIN_IDENTIFIER": "Correo o Usuario",
        "LOGIN_PASSWORD": "Contraseña",
        "LOGIN_BUTTON": "Iniciar Sesión",
        "LOGIN_ERROR": "Error al iniciar sesión",
        "LOGIN_INVALID_CREDENTIALS": "Credenciales inválidas. Por favor verifica tu usuario/correo y contraseña.",
        "LOGIN_AUTH_FAILED": "Autenticación fallida. Por favor verifica tus credenciales.",
        "LOGIN_CONNECTION_ERROR": "No se puede conectar al servidor. Por favor verifica tu conexión.",
        "LOGIN_GENERAL_ERROR": "Ocurrió un error durante el inicio de sesión. Por favor intenta de nuevo.",
        "LOGIN_NO_ACCOUNT": "¿No tienes una cuenta?",
        "LOGIN_SIGN_UP": "Regístrate",
        "LOGIN_FORGOT_PASSWORD": "¿Olvidaste tu contraseña?",
        "REGISTER_TITLE": "Crear Cuenta",
        "REGISTER_SUBTITLE": "Regístrate para comenzar",
        "REGISTER_BUTTON": "Crear Cuenta",
        "REGISTER_SUCCESS": "Cuenta creada exitosamente",
        "REGISTER_ERROR": "Registro fallido",
        "REGISTER_INVALID_DATA": "Por favor verifica tu información e intenta de nuevo.",
        "REGISTER_EMAIL_EXISTS": "Ya existe una cuenta con este correo.",
        "REGISTER_USERNAME_EXISTS": "Este nombre de usuario ya está tomado.",
        "REGISTER_PASSWORD_MISMATCH": "Las contraseñas no coinciden.",
        "REGISTER_TERMS": "Acepto los términos y condiciones",
        "REGISTER_PRIVACY": "Acepto la política de privacidad",
        "REGISTER_ALREADY_ACCOUNT": "¿Ya tienes una cuenta?",
        "REGISTER_SIGN_IN": "Iniciar Sesión",
        "PASSWORD_RESET_TITLE": "Restablecer Contraseña",
        "PASSWORD_RESET_SUBTITLE": "Ingresa tu correo para recibir un enlace de restablecimiento",
        "PASSWORD_RESET_BUTTON": "Enviar Enlace de Restablecimiento",
        "PASSWORD_RESET_SUCCESS": "Enlace de restablecimiento enviado a tu correo",
        "PASSWORD_RESET_ERROR": "Error al enviar enlace de restablecimiento",
        "PASSWORD_RESET_INVALID_EMAIL": "Por favor ingresa una dirección de correo válida.",
        "PASSWORD_RESET_EMAIL_NOT_FOUND": "No se encontró cuenta con este correo.",
        "PASSWORD_RESET_BACK_TO_LOGIN": "Volver al inicio de sesión",
        "PASSWORD_CHANGE_TITLE": "Cambiar Contraseña",
        "PASSWORD_CHANGE_SUBTITLE": "Ingresa tu contraseña actual y nueva",
        "PASSWORD_CHANGE_CURRENT": "Contraseña Actual",
        "PASSWORD_CHANGE_NEW": "Nueva Contraseña",
        "PASSWORD_CHANGE_CONFIRM": "Confirmar Nueva Contraseña",
        "PASSWORD_CHANGE_BUTTON": "Cambiar Contraseña",
        "PASSWORD_CHANGE_SUCCESS": "Contraseña cambiada exitosamente",
        "PASSWORD_CHANGE_ERROR": "Error al cambiar contraseña",
        "PASSWORD_CHANGE_INVALID_CURRENT": "La contraseña actual es incorrecta.",
        "PASSWORD_CHANGE_MISMATCH": "Las nuevas contraseñas no coinciden.",
        "PASSWORD_CHANGE_WEAK": "La contraseña es muy débil. Por favor usa una contraseña más fuerte.",
        "PASSWORD_CHANGE_BACK_TO_PROFILE": "Volver al perfil",
        "LOGOUT_SUCCESS": "Sesión cerrada exitosamente",
        "LOGOUT_ERROR": "Error al cerrar sesión",
        "SESSION_EXPIRED": "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
        "ACCESS_DENIED": "Acceso denegado. No tienes permiso para ver esta página.",
        "NOT_FOUND": "Página no encontrada",
        "SERVER_ERROR": "Error del servidor. Por favor intenta más tarde.",
        "NETWORK_ERROR": "Error de red. Por favor verifica tu conexión.",
        "VALIDATION_ERRORS": "Por favor corrige los siguientes errores:",
        "REQUIRED_FIELD": "Este campo es requerido",
        "INVALID_EMAIL": "Por favor ingresa una dirección de correo válida",
        "INVALID_USERNAME": "El nombre de usuario debe tener 3-20 caracteres y contener solo letras, números y guiones bajos",
        "INVALID_PASSWORD": "La contraseña debe tener al menos 8 caracteres y contener mayúsculas, minúsculas, número y carácter especial",
        "PASSWORDS_MUST_MATCH": "Las contraseñas deben coincidir",
        "TERMS_ACCEPTED": "Debes aceptar los términos y condiciones",
        "PRIVACY_ACCEPTED": "Debes aceptar la política de privacidad"
      }
    };

    // Mark as loaded
    this._isLoaded.next(true);
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
