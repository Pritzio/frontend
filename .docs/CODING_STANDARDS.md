# 📝 Estándares de Código - Pritzio

## 📋 **Descripción General**

Este documento establece los estándares de código que deben seguirse en todo el proyecto Pritzio para mantener consistencia, legibilidad y calidad del código.

## 🏗️ **Arquitectura y Estructura**

### **1. Estructura de Carpetas**
```
src/
├── app/
│   ├── core/               # Funcionalidades fundamentales
│   │   ├── services/       # Servicios core
│   │   ├── guards/         # Guards de autenticación
│   │   ├── interceptors/   # Interceptores HTTP
│   │   ├── models/         # Interfaces y tipos
│   │   └── providers/      # Providers de la aplicación
│   ├── shared/             # Componentes y servicios compartidos
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pipes/          # Pipes personalizados
│   │   ├── directives/     # Directivas personalizadas
│   │   ├── services/       # Servicios compartidos
│   │   └── utils/          # Utilidades y helpers
│   └── features/           # Módulos de funcionalidades
│       ├── auth/           # Autenticación
│       ├── admin/          # Panel de administración
│       ├── dashboard/      # Dashboard de usuario
│       └── [feature]/      # Otras funcionalidades
├── assets/                 # Recursos estáticos
│   ├── images/            # Imágenes
│   ├── icons/             # Iconos
│   ├── fonts/             # Fuentes
│   └── i18n/              # Archivos de traducción
└── environments/           # Configuraciones de entorno
```

### **2. Convenciones de Nomenclatura**

#### **Archivos y Carpetas**
- **Carpetas**: kebab-case (ej: `user-management`, `price-comparison`)
- **Archivos**: kebab-case (ej: `user-profile.component.ts`, `auth.service.ts`)
- **Componentes**: PascalCase + "Component" (ej: `UserProfileComponent`)
- **Servicios**: PascalCase + "Service" (ej: `UserManagementService`)
- **Interfaces**: PascalCase con prefijo "I" (ej: `IUser`, `IProduct`)

#### **Variables y Métodos**
- **Variables públicas**: camelCase (ej: `userName`, `isLoading`)
- **Variables privadas**: Prefijo `_` + camelCase (ej: `_http`, `_baseUrl`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **Métodos**: camelCase (ej: `getUserById`, `createProduct`)
- **Métodos privados**: Prefijo `_` + camelCase (ej: `_handleError`, `_validateInput`)

## 📝 **Estándares de TypeScript**

### **1. Imports y Exports**

#### **Orden de Imports**
```typescript
// 1. Imports de Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';

// 2. Imports de librerías de terceros
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

// 3. Imports de la aplicación (ordenados por distancia)
import { AuthService } from '../../core/services/auth.service';
import { IUser } from '../../core/models/user.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
```

#### **Exports**
```typescript
// Export individual
export class UserService {}

// Export múltiple
export { UserService, UserComponent } from './user';

// Export por defecto (evitar en servicios)
export default UserService;
```

### **2. Interfaces y Tipos**

#### **Definición de Interfaces**
```typescript
// Interfaces para modelos de datos
export interface IUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para requests
export interface ICreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

// Interfaces para responses
export interface IApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Tipos union
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type UserRole = 'user' | 'admin' | 'super_admin';
```

#### **Enums**
```typescript
export enum UserType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  SYSTEM = 'system'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}
```

### **3. Clases y Componentes**

#### **Estructura de Componentes**
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { IUser } from '../../core/models/user.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  
  // Propiedades públicas
  public user: IUser | null = null;
  public isLoading = false;
  public error: string | null = null;
  
  // Observables públicos
  public user$ = new BehaviorSubject<IUser | null>(null);
  
  // Propiedades privadas
  private _destroy$ = new Subject<void>();
  
  constructor(
    private _authService: AuthService,
    private _userService: UserService
  ) {}
  
  ngOnInit(): void {
    this._loadUserData();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  // Métodos públicos
  public updateProfile(): void {
    if (this.user) {
      this._updateUserProfile(this.user);
    }
  }
  
  // Métodos privados
  private _loadUserData(): void {
    this.isLoading = true;
    this.error = null;
    
    this._userService.getCurrentUser()
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (user) => {
          this.user = user;
          this.user$.next(user);
        },
        error: (error) => {
          this.error = 'Error loading user data';
          console.error('Error:', error);
        }
      });
  }
  
  private _updateUserProfile(user: IUser): void {
    // Lógica de actualización
  }
}
```

### **4. Servicios**

#### **Estructura de Servicios**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { IUser, ICreateUserRequest, IUpdateUserRequest } from '../models/user.model';
import { IApiResponse, IPaginatedResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  // URLs de la API
  private readonly _baseUrl = `${environment.apiUrl}/users`;
  
  // Observables del estado
  private _users = new BehaviorSubject<IUser[]>([]);
  public users$ = this._users.asObservable();
  
  constructor(private _http: HttpClient) {}
  
  // Métodos CRUD
  public getAll(params?: HttpParams): Observable<IPaginatedResponse<IUser>> {
    return this._http.get<IPaginatedResponse<IUser>>(this._baseUrl, { params });
  }
  
  public getById(id: string): Observable<IApiResponse<IUser>> {
    return this._http.get<IApiResponse<IUser>>(`${this._baseUrl}/${id}`);
  }
  
  public create(userData: ICreateUserRequest): Observable<IApiResponse<IUser>> {
    return this._http.post<IApiResponse<IUser>>(this._baseUrl, userData);
  }
  
  public update(id: string, userData: IUpdateUserRequest): Observable<IApiResponse<IUser>> {
    return this._http.put<IApiResponse<IUser>>(`${this._baseUrl}/${id}`, userData);
  }
  
  public delete(id: string): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._baseUrl}/${id}`);
  }
  
  // Métodos de utilidad
  public refreshUsers(): void {
    this.getAll().subscribe({
      next: (response) => {
        this._users.next(response.data);
      },
      error: (error) => {
        console.error('Error refreshing users:', error);
      }
    });
  }
}
```

## 🎨 **Estándares de SCSS**

### **1. Variables y Mixins**

#### **Variables Globales**
```scss
// Colores
$primary-color: #667eea;
$secondary-color: #764ba2;
$success-color: #38a169;
$warning-color: #d69e2e;
$error-color: #e53e3e;
$info-color: #3182ce;

// Tipografía
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
$font-size-base: 1rem;
$font-size-sm: 0.875rem;
$font-size-lg: 1.125rem;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Espaciado
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px

// Breakpoints
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

// Bordes
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-width: 1px;
$border-color: #e2e8f0;

// Sombras
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

#### **Mixins Reutilizables**
```scss
// Flexbox
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-column {
  display: flex;
  flex-direction: column;
}

// Botones
@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm $spacing-md;
  border: $border-width solid transparent;
  border-radius: $border-radius-md;
  font-family: $font-family-base;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@mixin button-variant($bg-color, $text-color, $border-color: transparent) {
  background-color: $bg-color;
  color: $text-color;
  border-color: $border-color;
  
  &:hover:not(:disabled) {
    background-color: darken($bg-color, 10%);
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
}

// Media queries
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// Estados
@mixin state-variant($color) {
  border-color: $color;
  color: $color;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba($color, 0.1);
  }
}
```

### **2. Estructura de Estilos**

#### **Organización de Estilos**
```scss
// 1. Variables y mixins
@import 'variables';
@import 'mixins';

// 2. Estilos del componente
.user-profile {
  // Layout
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-lg;
  
  // Header
  &__header {
    @include flex-between;
    padding-bottom: $spacing-md;
    border-bottom: $border-width solid $border-color;
    
    h1 {
      margin: 0;
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $primary-color;
    }
  }
  
  // Content
  &__content {
    @include flex-column;
    gap: $spacing-md;
  }
  
  // Form
  &__form {
    display: grid;
    gap: $spacing-md;
    grid-template-columns: 1fr;
    
    @include respond-to(md) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @include respond-to(lg) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  // Actions
  &__actions {
    @include flex-center;
    gap: $spacing-md;
    padding-top: $spacing-md;
    border-top: $border-width solid $border-color;
  }
}

// 3. Estados
.user-profile {
  &--loading {
    opacity: 0.6;
    pointer-events: none;
  }
  
  &--error {
    @include state-variant($error-color);
  }
}

// 4. Responsive
@include respond-to(sm) {
  .user-profile {
    padding: $spacing-md;
  }
}

@include respond-to(md) {
  .user-profile {
    padding: $spacing-xl;
  }
}
```

## 📱 **Estándares de HTML**

### **1. Estructura de Templates**

#### **Estructura Básica**
```html
<div class="[component-name]-container">
  <!-- Header -->
  <header class="[component-name]-header">
    <h1>{{ 'COMPONENT.TITLE' | translate }}</h1>
  </header>

  <!-- Content -->
  <main class="[component-name]-content">
    <!-- Contenido principal -->
  </main>

  <!-- Footer -->
  <footer class="[component-name]-footer">
    <!-- Acciones -->
  </footer>
</div>
```

#### **Uso de Traducciones**
```html
<!-- Traducción simple -->
<h1>{{ 'COMPONENT.TITLE' | translate }}</h1>

<!-- Traducción con parámetros -->
<p>{{ 'COMPONENT.WELCOME' | translate: { name: userName } }}</p>

<!-- Traducción condicional -->
<span *ngIf="isAdmin">{{ 'COMPONENT.ADMIN_MESSAGE' | translate }}</span>
```

### **2. Formularios**

#### **Formularios Reactivos**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
  <div class="form-group">
    <label for="username" class="form-label">
      {{ 'FORM.USERNAME' | translate }}
    </label>
    <input
      type="text"
      id="username"
      formControlName="username"
      class="form-input"
      [class.form-input--error]="form.get('username')?.invalid && form.get('username')?.touched"
      [placeholder]="'FORM.USERNAME_PLACEHOLDER' | translate"
      [attr.aria-describedby]="'username-error'"
    />
    <div 
      id="username-error"
      class="form-error" 
      *ngIf="form.get('username')?.invalid && form.get('username')?.touched"
    >
      <span *ngIf="form.get('username')?.errors?.['required']">
        {{ 'VALIDATION.REQUIRED' | translate }}
      </span>
      <span *ngIf="form.get('username')?.errors?.['minlength']">
        {{ 'VALIDATION.MIN_LENGTH' | translate: { min: 3 } }}
      </span>
    </div>
  </div>

  <div class="form-actions">
    <button 
      type="submit" 
      class="btn btn--primary"
      [disabled]="form.invalid || isLoading"
    >
      <span *ngIf="!isLoading">{{ 'FORM.SUBMIT' | translate }}</span>
      <span *ngIf="isLoading" class="loading-spinner"></span>
    </button>
    
    <button 
      type="button" 
      class="btn btn--secondary"
      (click)="onCancel()"
    >
      {{ 'FORM.CANCEL' | translate }}
    </button>
  </div>
</form>
```

### **3. Accesibilidad**

#### **Labels y ARIA**
```html
<!-- Labels asociados -->
<label for="email">Email</label>
<input type="email" id="email" />

<!-- Labels ARIA -->
<button aria-label="Close dialog">×</button>
<div role="alert" aria-live="polite">Error message</div>

<!-- Estados ARIA -->
<button 
  [attr.aria-expanded]="isExpanded"
  [attr.aria-controls]="'content-' + id"
>
  Toggle content
</button>
<div [id]="'content-' + id" [attr.aria-hidden]="!isExpanded">
  Content here
</div>
```

## 🧪 **Estándares de Testing**

### **1. Estructura de Tests**

#### **Test de Componente**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { [ComponentName]Component } from './[component-name].component';

describe('[ComponentName]Component', () => {
  let component: [ComponentName]Component;
  let fixture: ComponentFixture<[ComponentName]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        [ComponentName]Component,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent([ComponentName]Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Title');
  });

  it('should handle form submission', () => {
    // Test de funcionalidad
  });
});
```

#### **Test de Servicio**
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

### **1. Performance**
- **OnPush Change Detection**: Para componentes que no cambian frecuentemente
- **TrackBy Functions**: Para ngFor con listas grandes
- **Lazy Loading**: Para componentes y módulos pesados
- **Unsubscribe**: Cancelar suscripciones en ngOnDestroy

### **2. Seguridad**
- **Input Validation**: Validar todos los inputs del usuario
- **XSS Prevention**: No usar innerHTML sin sanitizar
- **CSRF Protection**: Implementar tokens CSRF
- **Content Security Policy**: Configurar CSP headers

### **3. Accesibilidad**
- **Semantic HTML**: Usar tags apropiados (main, section, article)
- **ARIA Labels**: Para elementos interactivos
- **Keyboard Navigation**: Soporte para navegación por teclado
- **Screen Readers**: Textos alternativos para imágenes

### **4. Mantenibilidad**
- **Single Responsibility**: Una clase, una responsabilidad
- **Dependency Injection**: Usar DI para dependencias
- **Interface Segregation**: Interfaces pequeñas y específicas
- **Error Handling**: Manejo consistente de errores

## 📚 **Recursos Adicionales**

### **1. Herramientas de Linting**
- **ESLint**: Para TypeScript/JavaScript
- **Stylelint**: Para SCSS/CSS
- **Prettier**: Para formateo de código

### **2. Documentación Oficial**
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Angular Best Practices](https://angular.io/guide/best-practices)
- [Angular Testing](https://angular.io/guide/testing)

### **3. Herramientas de Desarrollo**
- **Angular DevTools**: Para debugging
- **Angular Language Service**: IntelliSense en editores
- **Angular CLI**: Herramienta de línea de comandos

---

**Última Actualización**: 2024-01-15  
**Versión**: 1.0.0  
**Mantenedor**: AI Assistant  
**Estado**: ✅ **COMPLETO Y LISTO PARA USO**
