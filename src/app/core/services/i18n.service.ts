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
  private _currentLanguage = 'en';
  private _isLoaded = new BehaviorSubject<boolean>(false);
  public isLoaded$ = this._isLoaded.asObservable();

  constructor() {
    // Load translations immediately
    this._loadTranslationsSync();
  }

  private _loadTranslationsSync(): void {
    try {
      console.log('Loading translations synchronously...');
      
      // For now, let's use inline translations to ensure they work
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
          "SPANISH": "Spanish"
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
          "LOGOUT_SUCCESS": "Logged out successfully",
          "LOGOUT_ERROR": "Error during logout"
        },
        "ADMIN": {
          "DASHBOARD_TITLE": "Admin Dashboard",
          "DASHBOARD_WELCOME": "Welcome",
          "DASHBOARD_STATS": {
            "TOTAL_USERS": "Total Users",
            "TOTAL_STORES": "Total Stores",
            "TOTAL_PRODUCTS": "Total Products",
            "ACTIVE_SCRAPING": "Active Scraping"
          },
          "QUICK_ACTIONS": "Quick Actions",
          "QUICK_ACTIONS_BUTTONS": {
            "MANAGE_USERS": "Manage Users",
            "MANAGE_STORES": "Manage Stores",
            "MANAGE_PRODUCTS": "Manage Products",
            "START_SCRAPING": "Start Scraping"
          },
          "NAVIGATION": {
            "DASHBOARD": "Dashboard",
            "USERS": "Users",
            "STORES": "Stores",
            "PRODUCTS": "Products",
            "SCRAPING": "Scraping",
            "ANALYTICS": "Analytics",
            "REPORTS": "Reports",
            "SETTINGS": "Settings"
          }
        },
        "USER": {
          "DASHBOARD_TITLE": "Welcome to Pritzio",
          "DASHBOARD_SUBTITLE": "Price Intelligence Dashboard",
          "DASHBOARD_DESCRIPTION": "Track prices, compare products, and make informed decisions.",
          "FEATURES": {
            "SEARCH_PRODUCTS": {
              "TITLE": "Search Products",
              "DESCRIPTION": "Find products across multiple stores and compare prices",
              "BUTTON": "Start Searching"
            },
            "PRICE_HISTORY": {
              "TITLE": "Price History",
              "DESCRIPTION": "View price trends and historical data for products",
              "BUTTON": "View History"
            },
            "PRICE_ALERTS": {
              "TITLE": "Price Alerts",
              "DESCRIPTION": "Get notified when prices drop on your favorite products",
              "BUTTON": "Set Alerts"
            },
            "MOBILE_APP": {
              "TITLE": "Mobile App",
              "DESCRIPTION": "Access Pritzio on the go with our mobile application",
              "BUTTON": "Download"
            }
          }
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
          "FORGOT_PASSWORD": "Olvidé mi Contraseña",
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
          "SPANISH": "Español"
        },
        "AUTH": {
          "LOGIN_TITLE": "Bienvenido de Vuelta",
          "LOGIN_SUBTITLE": "Inicia sesión en tu cuenta para continuar",
          "LOGIN_IDENTIFIER": "Correo o Nombre de Usuario",
          "LOGIN_PASSWORD": "Contraseña",
          "LOGIN_BUTTON": "Iniciar Sesión",
          "LOGIN_ERROR": "Error en el inicio de sesión",
          "LOGIN_INVALID_CREDENTIALS": "Credenciales inválidas. Por favor verifica tu nombre de usuario/correo y contraseña.",
          "LOGIN_AUTH_FAILED": "Falló la autenticación. Por favor verifica tus credenciales.",
          "LOGIN_CONNECTION_ERROR": "No se puede conectar al servidor. Por favor verifica tu conexión.",
          "LOGIN_GENERAL_ERROR": "Ocurrió un error durante el inicio de sesión. Por favor intenta de nuevo.",
          "LOGIN_NO_ACCOUNT": "¿No tienes una cuenta?",
          "LOGIN_SIGN_UP": "Regístrate",
          "LOGIN_FORGOT_PASSWORD": "¿Olvidaste tu contraseña?",
          "REGISTER_TITLE": "Crear Cuenta",
          "REGISTER_SUBTITLE": "Regístrate para comenzar",
          "REGISTER_BUTTON": "Crear Cuenta",
          "REGISTER_SUCCESS": "Cuenta creada exitosamente",
          "REGISTER_ERROR": "Falló el registro",
          "LOGOUT_SUCCESS": "Sesión cerrada exitosamente",
          "LOGOUT_ERROR": "Error durante el cierre de sesión"
        },
        "ADMIN": {
          "DASHBOARD_TITLE": "Panel de Administración",
          "DASHBOARD_WELCOME": "Bienvenido",
          "DASHBOARD_STATS": {
            "TOTAL_USERS": "Total de Usuarios",
            "TOTAL_STORES": "Total de Tiendas",
            "TOTAL_PRODUCTS": "Total de Productos",
            "ACTIVE_SCRAPING": "Scraping Activo"
          },
          "QUICK_ACTIONS": "Acciones Rápidas",
          "QUICK_ACTIONS_BUTTONS": {
            "MANAGE_USERS": "Gestionar Usuarios",
            "MANAGE_STORES": "Gestionar Tiendas",
            "MANAGE_PRODUCTS": "Gestionar Productos",
            "START_SCRAPING": "Iniciar Scraping"
          },
          "NAVIGATION": {
            "DASHBOARD": "Panel Principal",
            "USERS": "Usuarios",
            "STORES": "Tiendas",
            "PRODUCTS": "Productos",
            "SCRAPING": "Scraping",
            "ANALYTICS": "Análisis",
            "REPORTS": "Reportes",
            "SETTINGS": "Configuración"
          }
        },
        "USER": {
          "DASHBOARD_TITLE": "Bienvenido a Pritzio",
          "DASHBOARD_SUBTITLE": "Panel de Inteligencia de Precios",
          "DASHBOARD_DESCRIPTION": "Rastrea precios, compara productos y toma decisiones informadas.",
          "FEATURES": {
            "SEARCH_PRODUCTS": {
              "TITLE": "Buscar Productos",
              "DESCRIPTION": "Encuentra productos en múltiples tiendas y compara precios",
              "BUTTON": "Comenzar Búsqueda"
            },
            "PRICE_HISTORY": {
              "TITLE": "Historial de Precios",
              "DESCRIPTION": "Visualiza tendencias de precios y datos históricos de productos",
              "BUTTON": "Ver Historial"
            },
            "PRICE_ALERTS": {
              "TITLE": "Alertas de Precio",
              "DESCRIPTION": "Recibe notificaciones cuando bajen los precios de tus productos favoritos",
              "BUTTON": "Configurar Alertas"
            },
            "MOBILE_APP": {
              "TITLE": "Aplicación Móvil",
              "DESCRIPTION": "Accede a Pritzio desde cualquier lugar con nuestra aplicación móvil",
              "BUTTON": "Descargar"
            }
          }
        }
      };

      this._isLoaded.next(true);
      console.log('Translations loaded successfully:', this._translations);
      
      // Now try to load from files asynchronously for future updates
      this._loadTranslationsAsync();
    } catch (error) {
      console.error('Error loading translations synchronously:', error);
      this._isLoaded.next(true);
    }
  }

  private async _loadTranslationsAsync(): Promise<void> {
    try {
      console.log('Loading translations asynchronously from files...');
      
      // Load English translations
      const enResponse = await fetch('./assets/i18n/en.json');
      if (enResponse.ok) {
        this._translations['en'] = await enResponse.json();
        console.log('English translations updated from file');
      }

      // Load Spanish translations
      const esResponse = await fetch('./assets/i18n/es.json');
      if (esResponse.ok) {
        this._translations['es'] = await esResponse.json();
        console.log('Spanish translations updated from file');
      }
    } catch (error) {
      console.error('Error loading translations asynchronously:', error);
    }
  }

  setLanguage(language: string): void {
    console.log('Setting language to:', language);
    this._currentLanguage = language;
  }

  getCurrentLanguage(): string {
    return this._currentLanguage;
  }

  translate(key: string, params?: { [key: string]: any }): string {
    if (!this._isLoaded.value) {
      console.warn('Translations not yet loaded, returning key:', key);
      return key;
    }

    const keys = key.split('.');
    let translation: any = this._translations[this._currentLanguage] || this._translations['en'];

    if (!translation) {
      console.warn('No translations available for language:', this._currentLanguage);
      return key;
    }

    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object' && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        translation = this._translations['en'];
        if (!translation) {
          console.warn('Fallback translations not available');
          return key;
        }
        
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && translation[fallbackKey] !== undefined) {
            translation = translation[fallbackKey];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        break;
      }
    }

    // Handle parameters replacement
    if (typeof translation === 'string' && params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    const result = typeof translation === 'string' ? translation : key;
    return result;
  }

  // Method to get all translations for a specific language
  getTranslations(language: string): ITranslations {
    return this._translations[language] || {};
  }

  // Method to check if a translation exists
  hasTranslation(key: string): boolean {
    const keys = key.split('.');
    let translation: any = this._translations[this._currentLanguage] || this._translations['en'];

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
}
