# Sistema de Comparación de Productos

## 📋 Resumen

Sistema completo de comparación de precios implementado en Angular que permite a los usuarios buscar productos y comparar precios entre diferentes tiendas.

## 🏗️ Arquitectura

### Componentes Principales

#### 1. SearchBarComponent
- **Ubicación**: `src/app/features/comparison/components/search-bar/`
- **Propósito**: Barra de búsqueda con validación de mínimo 2 caracteres
- **Características**:
  - Búsqueda en tiempo real
  - Validación de formularios
  - Estado de carga
  - Botón de limpiar búsqueda

#### 2. ProductCardComponent
- **Ubicación**: `src/app/features/comparison/components/product-card/`
- **Propósito**: Tarjeta individual de producto en la lista de resultados
- **Características**:
  - Información del producto (nombre, marca)
  - Estadísticas (número de tiendas, variantes)
  - Botón para ver comparación
  - Diseño responsive

#### 3. ProductListComponent
- **Ubicación**: `src/app/features/comparison/components/product-list/`
- **Propósito**: Lista de productos con estados de carga y vacío
- **Características**:
  - Grid responsive de productos
  - Estados de carga y error
  - Contador de resultados
  - Integración con ProductCard

#### 4. ProductComparisonComponent
- **Ubicación**: `src/app/features/comparison/components/product-comparison/`
- **Propósito**: Vista detallada de comparación de precios
- **Características**:
  - Información del producto base
  - Resumen de precios (min, max, promedio)
  - Lista de tiendas con precios
  - Integración con StoreCard

#### 5. StoreCardComponent
- **Ubicación**: `src/app/features/comparison/components/store-card/`
- **Propósito**: Tarjeta individual de tienda en la comparación
- **Características**:
  - Logo y nombre de la tienda
  - Precio del producto
  - Enlace a la tienda
  - Formato de moneda chilena

### Páginas

#### 1. SearchPageComponent
- **Ubicación**: `src/app/features/comparison/pages/search-page/`
- **Ruta**: `/comparison/search`
- **Propósito**: Página principal de búsqueda
- **Características**:
  - Barra de búsqueda
  - Filtros por marca y disponibilidad
  - Lista de resultados
  - Navegación a comparación

#### 2. ProductComparisonPageComponent
- **Ubicación**: `src/app/features/comparison/pages/product-comparison-page/`
- **Ruta**: `/comparison/product/:id`
- **Propósito**: Página de comparación detallada
- **Características**:
  - Carga de datos del producto
  - Manejo de errores
  - Navegación de regreso
  - Vista de comparación completa

### Servicios

#### ProductComparisonService
- **Ubicación**: `src/app/core/services/product-comparison.service.ts`
- **Propósito**: Servicio para comunicación con la API
- **Métodos**:
  - `searchProducts(query, filters)`: Búsqueda de productos
  - `getProductComparison(productId)`: Comparación detallada
  - `getAvailableBrands()`: Lista de marcas disponibles

### Modelos

#### Interfaces
- **Ubicación**: `src/app/models/product-comparison.interface.ts`
- **Interfaces principales**:
  - `Product`: Producto base
  - `Store`: Información de tienda
  - `StoreProduct`: Producto en tienda específica
  - `StoreComparison`: Comparación de tienda
  - `PriceRange`: Rango de precios
  - `ProductSearchResponse`: Respuesta de búsqueda
  - `ProductComparisonResponse`: Respuesta de comparación
  - `SearchFilters`: Filtros de búsqueda

## 🎨 Diseño y Estilos

### Características de UI/UX
- **Diseño responsive** con Tailwind CSS
- **Estados de carga** con spinners animados
- **Estados vacíos** con iconos y mensajes informativos
- **Transiciones suaves** en hover y interacciones
- **Formato de moneda** chilena (CLP)
- **Gradientes** y sombras para profundidad visual

### Paleta de Colores
- **Primario**: Azul (#3b82f6)
- **Secundario**: Verde para precios (#059669)
- **Neutros**: Grises para texto y fondos
- **Estados**: Rojo para errores, gris para deshabilitado

## 🔧 Configuración

### Rutas
```typescript
const routes: Routes = [
  {
    path: 'search',
    component: SearchPageComponent
  },
  {
    path: 'product/:id',
    component: ProductComparisonPageComponent
  },
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  }
];
```

### Dependencias
- Angular Reactive Forms
- Angular Router
- Angular HTTP Client
- Tailwind CSS

## 🚀 Uso

### Búsqueda de Productos
1. Navegar a `/comparison/search`
2. Ingresar término de búsqueda (mínimo 2 caracteres)
3. Aplicar filtros opcionales (marca, disponibilidad)
4. Seleccionar producto para ver comparación

### Comparación de Precios
1. Desde la búsqueda, hacer clic en "Ver Comparación"
2. Ver información detallada del producto
3. Comparar precios entre tiendas
4. Hacer clic en "Ver en tienda" para visitar la tienda

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px - Una columna
- **Tablet**: 640px - 768px - Grid adaptativo
- **Desktop**: > 768px - Grid completo

### Adaptaciones
- Formularios apilados en móvil
- Botones de ancho completo en móvil
- Grid de productos responsive
- Navegación optimizada para touch

## 🔒 Seguridad

### Autenticación
- Todos los endpoints requieren token JWT
- Token almacenado en localStorage
- Headers de autorización automáticos

### Validación
- Validación de formularios en frontend
- Sanitización de inputs
- Manejo seguro de URLs externas

## 🧪 Testing

### Estados a Probar
- Búsqueda exitosa
- Búsqueda sin resultados
- Error de red
- Carga de comparación
- Navegación entre páginas

### Casos Edge
- Búsqueda con menos de 2 caracteres
- Producto no encontrado
- Error de API
- Timeout de red

## 📈 Mejoras Futuras

### Funcionalidades
- Búsqueda con autocompletado
- Filtros avanzados (precio, rating)
- Comparación de múltiples productos
- Lista de favoritos
- Historial de búsquedas

### Performance
- Lazy loading de imágenes
- Paginación de resultados
- Cache de búsquedas
- Optimización de bundle

### UX
- Animaciones más fluidas
- Modo oscuro
- Accesibilidad mejorada
- PWA capabilities

---

**Desarrollado por**: Equipo Pritzio Frontend  
**Última actualización**: Enero 2024  
**Versión**: 1.0.0
