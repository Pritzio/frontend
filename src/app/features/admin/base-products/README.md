# Base Products Admin Module

Este módulo proporciona una interfaz completa para gestionar los productos base del sistema de comparación de precios.

## Estructura

```
base-products/
├── components/
│   ├── base-products-list/          # Listado de productos base
│   ├── base-product-form/           # Formulario de creación/edición
│   ├── base-product-detail/         # Vista de detalles del producto
│   ├── base-products-analytics/     # Analytics y estadísticas
│   └── index.ts                     # Exportaciones
├── base-products.module.ts          # Módulo principal
└── README.md                        # Este archivo
```

## Componentes

### BaseProductsListComponent
- **Ruta:** `/admin/base-products`
- **Funcionalidad:** Lista todos los productos base con filtros y paginación
- **Características:**
  - Búsqueda por nombre, marca, modelo
  - Filtros por marca, categoría, estado
  - Paginación
  - Acciones: Ver, Editar, Activar/Desactivar, Eliminar
  - Selección múltiple

### BaseProductFormComponent
- **Rutas:** 
  - `/admin/base-products/create` (Crear)
  - `/admin/base-products/:id/edit` (Editar)
- **Funcionalidad:** Formulario para crear y editar productos base
- **Características:**
  - Campos básicos: nombre, marca, modelo, descripción
  - Gestión de imágenes (normal y alta resolución)
  - Asignación de categorías
  - Especificaciones del producto
  - Validaciones completas

### BaseProductDetailComponent
- **Ruta:** `/admin/base-products/:id`
- **Funcionalidad:** Vista detallada de un producto base
- **Características:**
  - Información básica del producto
  - Estadísticas (tiendas, variantes, calificación)
  - Imagen del producto
  - Categorías asignadas
  - Especificaciones
  - Productos de tienda asociados
  - Acciones: Editar, Activar/Desactivar, Eliminar

### BaseProductsAnalyticsComponent
- **Ruta:** `/admin/base-products/analytics`
- **Funcionalidad:** Analytics y estadísticas de productos base
- **Características:**
  - Métricas generales (total, activos, inactivos)
  - Productos con/sin imágenes
  - Promedios de tiendas y variantes por producto
  - Distribución por marca
  - Distribución por categoría
  - Distribución por estado

## Servicios

### BaseProductsService
Servicio principal para interactuar con la API de productos base.

**Métodos principales:**
- `getAll(filters?)` - Obtener lista paginada
- `getById(id)` - Obtener por ID
- `create(data)` - Crear nuevo producto
- `update(id, data)` - Actualizar producto
- `delete(id)` - Eliminar producto
- `getAnalytics()` - Obtener estadísticas
- `search(query, filters?)` - Búsqueda
- `getBrands()` - Obtener marcas disponibles
- `getWithStoreProducts(id)` - Obtener con productos de tienda
- `toggleActive(id)` - Activar/desactivar

## Modelos

### IBaseProduct
Interfaz principal del producto base con todos sus campos.

### IBaseProductFilters
Filtros para búsquedas y listados.

### ICreateBaseProductRequest / IUpdateBaseProductRequest
Interfaces para operaciones de creación y actualización.

### IBaseProductAnalytics
Interfaz para datos de analytics.

## Características Técnicas

- **Standalone Components:** Todos los componentes son standalone
- **Reactive Forms:** Formularios reactivos con validaciones
- **Lazy Loading:** Carga diferida de datos
- **Error Handling:** Manejo completo de errores
- **Loading States:** Estados de carga en todas las operaciones
- **Responsive Design:** Diseño responsive con Tailwind CSS
- **TypeScript:** Completamente tipado
- **RxJS:** Programación reactiva para operaciones asíncronas

## Uso

1. **Importar el módulo** en el routing principal del admin
2. **Configurar las rutas** en el sistema de routing
3. **Asegurar que el servicio** esté disponible en el DI
4. **Configurar la API** para que responda a los endpoints esperados

## Dependencias

- Angular Core
- Angular Router
- Angular Forms
- Angular Common
- RxJS
- Tailwind CSS
- Servicios: AlertService, CategoriesService
