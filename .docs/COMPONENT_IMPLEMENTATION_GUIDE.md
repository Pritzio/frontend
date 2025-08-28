# 🧩 Guía de Implementación de Componentes - Pritzio

## 📋 **Descripción General**

Esta guía establece los estándares y mejores prácticas para implementar componentes en la aplicación Pritzio usando Angular 20 con arquitectura standalone.

## 🏗️ **Arquitectura de Componentes**

### **1. Estructura de Carpetas**
```
src/
├── app/
│   ├── features/           # Módulos de funcionalidades
│   │   ├── auth/          # Autenticación
│   │   ├── admin/         # Panel de administración
│   │   ├── dashboard/     # Dashboard de usuario
│   │   └── [feature]/     # Otras funcionalidades
│   ├── shared/            # Componentes compartidos
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pipes/         # Pipes personalizados
│   │   ├── directives/    # Directivas personalizadas
│   │   └── services/      # Servicios compartidos
│   └── core/              # Servicios y funcionalidades core
```

### **2. Tipos de Componentes**

#### **Feature Components**
- **Propósito**: Funcionalidades específicas de la aplicación
- **Ubicación**: `src/app/features/[feature-name]/`
- **Ejemplos**: Login, Dashboard, User Management

#### **Shared Components**
- **Propósito**: Reutilizables en toda la aplicación
- **Ubicación**: `src/app/shared/components/`
- **Ejemplos**: Buttons, Modals, Tables, Forms

#### **Core Components**
- **Propósito**: Componentes fundamentales de la aplicación
- **Ubicación**: `src/app/core/components/`
- **Ejemplos**: Layout, Navigation, Error Boundaries

## 🚀 **Implementación de Componentes**

### **1. Crear un Nuevo Componente**

#### **Usando Angular CLI**
```bash
# Componente standalone
ng generate component features/[feature-name]/[component-name] --standalone

# Con routing
ng generate component features/[feature-name]/[component-name] --standalone --routing

# Con testing
ng generate component features/[feature-name]/[component-name] --standalone --skip-tests=false
```

#### **Estructura Generada**
```
[component-name]/
├── [component-name].component.ts      # Lógica del componente
├── [component-name].component.html    # Template HTML
├── [component-name].component.scss    # Estilos SCSS
├── [component-name].component.spec.ts # Tests unitarios
└── index.ts                          # Export del componente
```

### **2. Estructura del Componente**

#### **Componente Básico**
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-[component-name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './[component-name].component.html',
  styleUrls: ['./[component-name].component.scss']
})
export class [ComponentName]Component implements OnInit {
  
  constructor() {}

  ngOnInit(): void {
    // Inicialización del componente
  }
}
```

#### **Componente con Inputs/Outputs**
```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-[component-name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './[component-name].component.html',
  styleUrls: ['./[component-name].component.scss']
})
export class [ComponentName]Component implements OnInit {
  
  @Input() data: any;
  @Input() isLoading = false;
  
  @Output() action = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  onAction(data: any): void {
    this.action.emit(data);
  }

  onClose(): void {
    this.close.emit();
  }
}
```

### **3. Imports y Dependencias**

#### **Imports Comunes**
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
```

#### **Imports Específicos**
```typescript
// Para formularios
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Para servicios HTTP
import { HttpClient } from '@angular/common/http';

// Para observables
import { Observable, Subject, takeUntil } from 'rxjs';

// Para servicios de autenticación
import { AuthService } from '../../core/services/auth.service';
```

## 📝 **Templates HTML**

### **1. Estructura Básica**
```html
<div class="[component-name]-container">
  <!-- Header -->
  <header class="[component-name]-header">
    <h1>{{ 'COMPONENT.TITLE' | translate }}</h1>
  </header>

  <!-- Content -->
  <main class="[component-name]-content">
    <!-- Contenido del componente -->
  </main>

  <!-- Footer -->
  <footer class="[component-name]-footer">
    <!-- Acciones del componente -->
  </footer>
</div>
```

### **2. Uso de Traducciones**
```html
<!-- Traducción simple -->
<h1>{{ 'COMPONENT.TITLE' | translate }}</h1>

<!-- Traducción con parámetros -->
<p>{{ 'COMPONENT.WELCOME' | translate: { name: userName } }}</p>

<!-- Traducción condicional -->
<span *ngIf="isAdmin">{{ 'COMPONENT.ADMIN_MESSAGE' | translate }}</span>
```

### **3. Directivas Estructurales**
```html
<!-- ngIf con else -->
<div *ngIf="data; else loading">
  {{ data.name }}
</div>
<ng-template #loading>
  <div class="loading">Loading...</div>
</ng-template>

<!-- ngFor con trackBy -->
<div *ngFor="let item of items; trackBy: trackByFn">
  {{ item.name }}
</div>

<!-- ngSwitch -->
<div [ngSwitch]="status">
  <span *ngSwitchCase="'active'">Active</span>
  <span *ngSwitchCase="'inactive'">Inactive</span>
  <span *ngSwitchDefault>Unknown</span>
</div>
```

### **4. Formularios Reactivos**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <label for="name">{{ 'FORM.NAME' | translate }}</label>
    <input 
      type="text" 
      id="name" 
      formControlName="name"
      [placeholder]="'FORM.NAME_PLACEHOLDER' | translate"
      [class.error]="form.get('name')?.invalid && form.get('name')?.touched"
    />
    <div class="error-message" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
      <span *ngIf="form.get('name')?.errors?.['required']">
        {{ 'VALIDATION.REQUIRED' | translate }}
      </span>
    </div>
  </div>

  <button type="submit" [disabled]="form.invalid || isLoading">
    {{ 'FORM.SUBMIT' | translate }}
  </button>
</form>
```

## 🎨 **Estilos SCSS**

### **1. Estructura de Estilos**
```scss
// Variables
$primary-color: #667eea;
$secondary-color: #764ba2;
$text-color: #2d3748;
$border-color: #e2e8f0;
$error-color: #e53e3e;
$success-color: #38a169;

// Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin button-base {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

// Estilos del componente
.[component-name]-container {
  padding: 20px;
  
  .[component-name]-header {
    margin-bottom: 24px;
    
    h1 {
      color: $text-color;
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
    }
  }
  
  .[component-name]-content {
    // Contenido principal
  }
  
  .[component-name]-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid $border-color;
  }
}

// Responsive
@media (max-width: 768px) {
  .[component-name]-container {
    padding: 16px;
  }
}
```

### **2. Clases de Utilidad**
```scss
// Estados
.error {
  border-color: $error-color !important;
  color: $error-color;
}

.success {
  border-color: $success-color !important;
  color: $success-color;
}

.loading {
  opacity: 0.6;
  pointer-events: none;
}

// Animaciones
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// Hover effects
.hover-lift {
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}
```

## 🔧 **Lógica del Componente**

### **1. Lifecycle Hooks**
```typescript
import { Component, OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  // ... configuración
})
export class [ComponentName]Component implements OnInit, OnDestroy, AfterViewInit {
  
  ngOnInit(): void {
    // Inicialización del componente
    // Cargar datos iniciales
    // Configurar suscripciones
  }

  ngAfterViewInit(): void {
    // Después de que la vista se inicialice
    // Acceder a elementos del DOM
    // Configurar librerías de terceros
  }

  ngOnDestroy(): void {
    // Limpieza del componente
    // Cancelar suscripciones
    // Limpiar timers
  }
}
```

### **2. Manejo de Datos**
```typescript
export class [ComponentName]Component implements OnInit, OnDestroy {
  
  // Propiedades del componente
  public data: any[] = [];
  public isLoading = false;
  public error: string | null = null;
  
  // Observables
  public data$ = new BehaviorSubject<any[]>([]);
  
  // Destructor
  private _destroy$ = new Subject<void>();

  constructor(
    private _service: DataService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this._loadData();
  }

  private _loadData(): void {
    this.isLoading = true;
    this.error = null;

    this._service.getData()
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          this.data = data;
          this.data$.next(data);
        },
        error: (error) => {
          this.error = 'Error loading data';
          console.error('Error:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
```

### **3. Manejo de Formularios**
```typescript
export class [ComponentName]Component implements OnInit {
  
  public form: FormGroup;
  public isSubmitting = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _service: DataService
  ) {
    this.form = this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]+$/)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      
      this._service.create(this.form.value)
        .pipe(
          finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: (result) => {
            console.log('Created:', result);
            this.form.reset();
          },
          error: (error) => {
            console.error('Error:', error);
          }
        });
    }
  }
}
```

## 🧪 **Testing**

### **1. Test Básico**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { [ComponentName]Component } from './[component-name].component';

describe('[ComponentName]Component', () => {
  let component: [ComponentName]Component;
  let fixture: ComponentFixture<[ComponentName]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [[ComponentName]Component]
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
});
```

### **2. Test con Servicios Mock**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { [ComponentName]Component } from './[component-name].component';
import { DataService } from '../../services/data.service';

describe('[ComponentName]Component', () => {
  let component: [ComponentName]Component;
  let fixture: ComponentFixture<[ComponentName]Component>;
  let mockDataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DataService', ['getData']);
    spy.getData.and.returnValue(of([{ id: 1, name: 'Test' }]));

    await TestBed.configureTestingModule({
      imports: [[ComponentName]Component],
      providers: [
        { provide: DataService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent([ComponentName]Component);
    component = fixture.componentInstance;
    mockDataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    fixture.detectChanges();
  });

  it('should load data on init', () => {
    expect(mockDataService.getData).toHaveBeenCalled();
    expect(component.data.length).toBe(1);
  });
});
```

## 📱 **Responsive Design**

### **1. Breakpoints**
```scss
// Breakpoints estándar
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

// Mixin para media queries
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// Uso
.component {
  padding: 16px;
  
  @include respond-to(md) {
    padding: 24px;
  }
  
  @include respond-to(lg) {
    padding: 32px;
  }
}
```

### **2. Grid System**
```scss
.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  
  @include respond-to(md) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @include respond-to(lg) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @include respond-to(xl) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 🚨 **Mejores Prácticas**

### **1. Nomenclatura**
- **Componentes**: PascalCase + "Component" (ej: `UserProfileComponent`)
- **Archivos**: kebab-case (ej: `user-profile.component.ts`)
- **Selectores**: kebab-case con prefijo "app" (ej: `app-user-profile`)
- **Variables**: camelCase (ej: `userName`, `isLoading`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `MAX_RETRY_ATTEMPTS`)

### **2. Performance**
- **OnPush Change Detection**: Para componentes que no cambian frecuentemente
- **TrackBy Functions**: Para ngFor con listas grandes
- **Lazy Loading**: Para componentes pesados
- **Virtual Scrolling**: Para listas muy largas

### **3. Accesibilidad**
- **Labels ARIA**: Para elementos interactivos
- **Semantic HTML**: Usar tags apropiados (main, section, article)
- **Keyboard Navigation**: Soporte para navegación por teclado
- **Screen Readers**: Textos alternativos para imágenes

### **4. Seguridad**
- **Sanitización**: Usar DomSanitizer para contenido HTML
- **XSS Prevention**: No usar innerHTML sin sanitizar
- **Input Validation**: Validar todos los inputs del usuario

## 📚 **Recursos Adicionales**

### **1. Documentación Oficial**
- [Angular Component Guide](https://angular.io/guide/component-overview)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [Angular Lifecycle Hooks](https://angular.io/guide/lifecycle-hooks)

### **2. Librerías Útiles**
- **Angular Material**: Componentes UI predefinidos
- **NGX-Bootstrap**: Componentes Bootstrap para Angular
- **PrimeNG**: Suite completa de componentes UI

### **3. Herramientas de Desarrollo**
- **Angular DevTools**: Extensión de Chrome para debugging
- **Angular Language Service**: IntelliSense en editores
- **Angular CLI**: Herramienta de línea de comandos

---

**Última Actualización**: 2024-01-15  
**Versión**: 1.0.0  
**Mantenedor**: AI Assistant  
**Estado**: ✅ **COMPLETO Y LISTO PARA USO**
