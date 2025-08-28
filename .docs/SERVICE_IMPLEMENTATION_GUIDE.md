# 🔧 Guía de Implementación de Servicios - Pritzio

## 📋 **Descripción General**

Esta guía establece los estándares y mejores prácticas para implementar servicios en la aplicación Pritzio usando Angular 20 con arquitectura standalone.

## 🏗️ **Arquitectura de Servicios**

### **1. Estructura de Carpetas**
```
src/
├── app/
│   ├── core/               # Servicios fundamentales
│   │   ├── services/       # Servicios core
│   │   ├── guards/         # Guards de autenticación
│   │   ├── interceptors/   # Interceptores HTTP
│   │   └── models/         # Interfaces y tipos
│   ├── shared/             # Servicios compartidos
│   │   ├── services/       # Servicios reutilizables
│   │   ├── utils/          # Utilidades y helpers
│   │   └── constants/      # Constantes de la aplicación
│   └── features/           # Servicios específicos de features
│       ├── auth/           # Servicios de autenticación
│       ├── admin/          # Servicios de administración
│       └── [feature]/      # Otros servicios de features
```

### **2. Tipos de Servicios**

#### **Core Services**
- **Propósito**: Funcionalidades fundamentales de la aplicación
- **Ubicación**: `src/app/core/services/`
- **Ejemplos**: AuthService, TranslationService, I18nService

#### **Shared Services**
- **Propósito**: Reutilizables en toda la aplicación
- **Ubicación**: `src/app/shared/services/`
- **Ejemplos**: NotificationService, StorageService, ValidationService

#### **Feature Services**
- **Propósito**: Lógica específica de funcionalidades
- **Ubicación**: `src/app/features/[feature-name]/services/`
- **Ejemplos**: UserService, ProductService, StoreService

## 🚀 **Implementación de Servicios**

### **1. Crear un Nuevo Servicio**

#### **Usando Angular CLI**
```bash
# Servicio básico
ng generate service core/services/[service-name]

# Con testing
ng generate service core/services/[service-name] --skip-tests=false

# En feature específica
ng generate service features/[feature-name]/services/[service-name]
```

#### **Estructura Generada**
```
[service-name]/
├── [service-name].service.ts      # Lógica del servicio
├── [service-name].service.spec.ts # Tests unitarios
└── index.ts                       # Export del servicio
```

### **2. Estructura del Servicio**

#### **Servicio Básico**
```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class [ServiceName]Service {
  
  constructor() {}
  
  // Métodos del servicio
}
```

#### **Servicio con Dependencias**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IDataModel } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class [ServiceName]Service {
  
  private readonly _apiUrl = `${environment.apiUrl}/[endpoint]`;
  
  constructor(
    private _http: HttpClient
  ) {}
  
  // Métodos del servicio
}
```

### **3. Patrones de Implementación**

#### **Singleton Service**
```typescript
@Injectable({
  providedIn: 'root' // Singleton en toda la aplicación
})
export class SingletonService {
  private static _instance: SingletonService;
  
  constructor() {
    if (SingletonService._instance) {
      return SingletonService._instance;
    }
    SingletonService._instance = this;
  }
}
```

#### **Feature Service**
```typescript
@Injectable({
  providedIn: 'any' // Nueva instancia por feature
})
export class FeatureService {
  // Lógica específica de la feature
}
```

#### **Lazy Loaded Service**
```typescript
@Injectable({
  providedIn: 'root'
})
export class LazyService {
  // Se carga solo cuando se necesita
}
```

## 📡 **Servicios HTTP**

### **1. Servicio CRUD Básico**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IDataModel, ICreateDataRequest, IUpdateDataRequest } from '../models/data.model';
import { IApiResponse, IPaginatedResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  private readonly _baseUrl = `${environment.apiUrl}/data`;
  
  constructor(private _http: HttpClient) {}
  
  // GET - Obtener todos
  getAll(params?: HttpParams): Observable<IPaginatedResponse<IDataModel>> {
    return this._http.get<IPaginatedResponse<IDataModel>>(this._baseUrl, { params });
  }
  
  // GET - Obtener por ID
  getById(id: string | number): Observable<IApiResponse<IDataModel>> {
    return this._http.get<IApiResponse<IDataModel>>(`${this._baseUrl}/${id}`);
  }
  
  // POST - Crear
  create(data: ICreateDataRequest): Observable<IApiResponse<IDataModel>> {
    return this._http.post<IApiResponse<IDataModel>>(this._baseUrl, data);
  }
  
  // PUT - Actualizar
  update(id: string | number, data: IUpdateDataRequest): Observable<IApiResponse<IDataModel>> {
    return this._http.put<IApiResponse<IDataModel>>(`${this._baseUrl}/${id}`, data);
  }
  
  // DELETE - Eliminar
  delete(id: string | number): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._baseUrl}/${id}`);
  }
  
  // PATCH - Actualización parcial
  patch(id: string | number, data: Partial<IUpdateDataRequest>): Observable<IApiResponse<IDataModel>> {
    return this._http.patch<IApiResponse<IDataModel>>(`${this._baseUrl}/${id}`, data);
  }
}
```

### **2. Servicio con Cache**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CachedDataService {
  
  private _cache = new Map<string, any>();
  private _cacheTime = new Map<string, number>();
  private readonly _cacheExpiry = 5 * 60 * 1000; // 5 minutos
  
  constructor(private _http: HttpClient) {}
  
  getData(key: string): Observable<any> {
    const cached = this._getFromCache(key);
    if (cached) {
      return of(cached);
    }
    
    return this._http.get(`/api/${key}`).pipe(
      tap(data => this._setCache(key, data)),
      shareReplay(1)
    );
  }
  
  private _getFromCache(key: string): any {
    const cached = this._cache.get(key);
    const timestamp = this._cacheTime.get(key);
    
    if (cached && timestamp && Date.now() - timestamp < this._cacheExpiry) {
      return cached;
    }
    
    return null;
  }
  
  private _setCache(key: string, data: any): void {
    this._cache.set(key, data);
    this._cacheTime.set(key, Date.now());
  }
  
  clearCache(): void {
    this._cache.clear();
    this._cacheTime.clear();
  }
}
```

### **3. Servicio con Interceptor Personalizado**
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CustomInterceptor implements HttpInterceptor {
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Modificar request antes de enviar
    const modifiedRequest = request.clone({
      setHeaders: {
        'Custom-Header': 'Custom-Value'
      }
    });
    
    return next.handle(modifiedRequest);
  }
}
```

## 🔄 **Servicios con Observables**

### **1. Servicio de Estado**
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IAppState {
  isLoading: boolean;
  user: any | null;
  theme: 'light' | 'dark';
  language: 'en' | 'es';
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  
  private _state = new BehaviorSubject<IAppState>({
    isLoading: false,
    user: null,
    theme: 'light',
    language: 'en'
  });
  
  public state$ = this._state.asObservable();
  
  // Getters
  get currentState(): IAppState {
    return this._state.value;
  }
  
  get isLoading$(): Observable<boolean> {
    return this._state.pipe(map(state => state.isLoading));
  }
  
  get user$(): Observable<any | null> {
    return this._state.pipe(map(state => state.user));
  }
  
  // Setters
  setLoading(loading: boolean): void {
    this._updateState({ isLoading: loading });
  }
  
  setUser(user: any | null): void {
    this._updateState({ user });
  }
  
  setTheme(theme: 'light' | 'dark'): void {
    this._updateState({ theme });
  }
  
  setLanguage(language: 'en' | 'es'): void {
    this._updateState({ language });
  }
  
  private _updateState(updates: Partial<IAppState>): void {
    const currentState = this._state.value;
    const newState = { ...currentState, ...updates };
    this._state.next(newState);
  }
}
```

### **2. Servicio de Eventos**
```typescript
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface IAppEvent {
  type: string;
  data?: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  
  private _events = new Subject<IAppEvent>();
  public events$ = this._events.asObservable();
  
  // Emitir evento
  emit(eventType: string, data?: any): void {
    const event: IAppEvent = {
      type: eventType,
      data,
      timestamp: new Date()
    };
    this._events.next(event);
  }
  
  // Suscribirse a eventos específicos
  on(eventType: string): Observable<IAppEvent> {
    return this.events$.pipe(
      filter(event => event.type === eventType)
    );
  }
  
  // Eventos predefinidos
  emitUserLogin(user: any): void {
    this.emit('user:login', user);
  }
  
  emitUserLogout(): void {
    this.emit('user:logout');
  }
  
  emitDataUpdate(data: any): void {
    this.emit('data:update', data);
  }
}
```

## 🗄️ **Servicios de Almacenamiento**

### **1. Servicio de LocalStorage**
```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  // LocalStorage
  setLocalItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  getLocalItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }
  
  removeLocalItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  clearLocalStorage(): void {
    localStorage.clear();
  }
  
  // SessionStorage
  setSessionItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }
  
  getSessionItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }
  
  removeSessionItem(key: string): void {
    sessionStorage.removeItem(key);
  }
  
  clearSessionStorage(): void {
    sessionStorage.clear();
  }
}
```

### **2. Servicio de Cache en Memoria**
```typescript
import { Injectable } from '@angular/core';

interface ICacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

@Injectable({
  providedIn: 'root'
})
export class MemoryCacheService {
  
  private _cache = new Map<string, ICacheItem<any>>();
  
  set<T>(key: string, value: T, ttl: number = 300000): void { // 5 minutos por defecto
    const item: ICacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl
    };
    this._cache.set(key, item);
  }
  
  get<T>(key: string): T | null {
    const item = this._cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Verificar si expiró
    if (Date.now() - item.timestamp > item.ttl) {
      this._cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  has(key: string): boolean {
    return this._cache.has(key);
  }
  
  delete(key: string): boolean {
    return this._cache.delete(key);
  }
  
  clear(): void {
    this._cache.clear();
  }
  
  // Limpiar items expirados
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this._cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this._cache.delete(key);
      }
    }
  }
}
```

## 🔐 **Servicios de Autenticación**

### **1. Servicio de Autenticación**
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IUser, ILoginRequest, IAuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private _currentUser = new BehaviorSubject<IUser | null>(null);
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _token: string | null = null;
  
  public currentUser$ = this._currentUser.asObservable();
  public isAuthenticated$ = this._isAuthenticated.asObservable();
  
  constructor(
    private _http: HttpClient,
    private _storageService: StorageService
  ) {
    this._initializeAuth();
  }
  
  private _initializeAuth(): void {
    // Recuperar token del storage
    const token = this._storageService.getLocalItem<string>('auth_token');
    const user = this._storageService.getLocalItem<IUser>('current_user');
    
    if (token && user) {
      this._token = token;
      this._currentUser.next(user);
      this._isAuthenticated.next(true);
    }
  }
  
  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this._http.post<IAuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => this._handleSuccessfulAuth(response)),
      catchError(error => {
        console.error('Login error:', error);
        return of(null);
      })
    );
  }
  
  logout(): void {
    this._token = null;
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
    
    this._storageService.removeLocalItem('auth_token');
    this._storageService.removeLocalItem('current_user');
  }
  
  private _handleSuccessfulAuth(authResponse: IAuthResponse): void {
    this._token = authResponse.accessToken;
    this._currentUser.next(authResponse.user);
    this._isAuthenticated.next(true);
    
    this._storageService.setLocalItem('auth_token', authResponse.accessToken);
    this._storageService.setLocalItem('current_user', authResponse.user);
  }
  
  getToken(): string | null {
    return this._token;
  }
  
  refreshToken(): Observable<any> {
    const refreshToken = this._storageService.getLocalItem<string>('refresh_token');
    return this._http.post(`${environment.apiUrl}/auth/refresh`, { refreshToken });
  }
}
```

## 🧪 **Testing de Servicios**

### **1. Test Básico**
```typescript
import { TestBed } from '@angular/core/testing';
import { [ServiceName]Service } from './[service-name].service';

describe('[ServiceName]Service', () => {
  let service: [ServiceName]Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject([ServiceName]Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

### **2. Test con Dependencias Mock**
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { [ServiceName]Service } from './[service-name].service';

describe('[ServiceName]Service', () => {
  let service: [ServiceName]Service;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [[ServiceName]Service]
    });
    
    service = TestBed.inject([ServiceName]Service);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get data from API', () => {
    const mockData = { id: 1, name: 'Test' };
    
    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });
    
    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

## 🚨 **Mejores Prácticas**

### **1. Nomenclatura**
- **Servicios**: PascalCase + "Service" (ej: `UserManagementService`)
- **Archivos**: kebab-case (ej: `user-management.service.ts`)
- **Métodos**: camelCase (ej: `getUserById`, `createUser`)
- **Variables privadas**: Prefijo `_` (ej: `_http`, `_baseUrl`)

### **2. Performance**
- **Lazy Loading**: Cargar servicios solo cuando se necesiten
- **Caching**: Implementar cache para datos frecuentemente accedidos
- **Unsubscribe**: Cancelar suscripciones en ngOnDestroy
- **ShareReplay**: Compartir observables entre múltiples suscriptores

### **3. Seguridad**
- **Input Validation**: Validar todos los inputs
- **Error Handling**: Manejar errores de forma segura
- **Token Management**: Gestionar tokens de autenticación
- **XSS Prevention**: Sanitizar datos antes de mostrar

### **4. Mantenibilidad**
- **Single Responsibility**: Un servicio, una responsabilidad
- **Dependency Injection**: Usar DI para dependencias
- **Interface Segregation**: Interfaces pequeñas y específicas
- **Error Logging**: Logging consistente de errores

## 📚 **Recursos Adicionales**

### **1. Documentación Oficial**
- [Angular Services](https://angular.io/guide/architecture-services)
- [Dependency Injection](https://angular.io/guide/dependency-injection)
- [HTTP Client](https://angular.io/guide/http)

### **2. Librerías Útiles**
- **RxJS**: Para programación reactiva
- **Angular Material**: Para componentes UI
- **NGX-Translate**: Para internacionalización

### **3. Herramientas de Desarrollo**
- **Angular DevTools**: Para debugging
- **Postman**: Para probar APIs
- **Jasmine**: Para testing

---

**Última Actualización**: 2024-01-15  
**Versión**: 1.0.0  
**Mantenedor**: AI Assistant  
**Estado**: ✅ **COMPLETO Y LISTO PARA USO**
