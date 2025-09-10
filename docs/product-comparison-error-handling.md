# Manejo de Errores - Sistema de Comparación de Productos

## 📋 Resumen

Este documento describe cómo el sistema de comparación de productos maneja los errores de API y proporciona una experiencia de usuario robusta.

## 🔧 Endpoints y Manejo de Errores

### 1. Endpoint de Búsqueda de Productos
- **URL**: `GET /api/v1/product-comparison/search`
- **Manejo**: Errores capturados en el componente `SearchPageComponent`
- **Comportamiento**: Muestra mensaje de error y permite reintentar

### 2. Endpoint de Comparación de Producto
- **URL**: `GET /api/v1/product-comparison/{id}`
- **Manejo**: Errores capturados en `ProductComparisonPageComponent`
- **Comportamiento**: Muestra estado de error con opción de volver a búsqueda

### 3. Endpoint de Marcas (Opcional)
- **URL**: `GET /api/v1/product-comparison/brands`
- **Manejo**: Error capturado en el servicio con fallback
- **Comportamiento**: Continúa sin filtros de marca si falla

## 🛡️ Estrategias de Manejo de Errores

### 1. **Servicio con Fallback**
```typescript
getAvailableBrands(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/brands`, {
    headers: this.getAuthHeaders()
  }).pipe(
    catchError(error => {
      console.warn('Brands endpoint not available:', error);
      return of([]); // Return empty array if endpoint fails
    })
  );
}
```

### 2. **Componente con Estados**
```typescript
// Estados manejados:
- loading: boolean
- error: boolean
- comparison: ProductComparisonResponse | null
```

### 3. **Template con Validaciones**
```html
<!-- Solo renderiza cuando hay datos válidos -->
<div *ngIf="comparison && comparison.baseProduct">
  <!-- Contenido seguro -->
</div>

<!-- Estados de error -->
<div *ngIf="error" class="error-state">
  <!-- Mensaje de error -->
</div>
```

## 🎯 Estados de la Aplicación

### 1. **Estado de Carga**
- Spinner de carga visible
- Botones deshabilitados
- Mensaje "Cargando..."

### 2. **Estado de Error**
- Mensaje de error claro
- Botón para reintentar
- Opción de volver a búsqueda

### 3. **Estado Sin Datos**
- Mensaje informativo
- Sugerencias de acción
- Navegación de regreso

### 4. **Estado Exitoso**
- Datos mostrados correctamente
- Funcionalidad completa disponible

## 🔍 Tipos de Errores Manejados

### 1. **Errores de Red (500, 404, etc.)**
- **Causa**: Servidor no disponible o endpoint inexistente
- **Manejo**: Mensaje de error con opción de reintentar
- **Ejemplo**: `GET /api/v1/product-comparison/brands 500`

### 2. **Errores de Autenticación (401, 403)**
- **Causa**: Token inválido o expirado
- **Manejo**: Redirección a login
- **Prevención**: Validación de token antes de requests

### 3. **Errores de Validación (400)**
- **Causa**: Parámetros inválidos
- **Manejo**: Mensaje específico de validación
- **Prevención**: Validación en frontend

### 4. **Timeouts**
- **Causa**: Request muy lento
- **Manejo**: Timeout configurado en HTTP client
- **Fallback**: Mensaje de "Request lento"

## 🎨 UX en Casos de Error

### 1. **Mensajes Claros**
- No usar jerga técnica
- Explicar qué pasó en términos simples
- Sugerir acciones específicas

### 2. **Opciones de Recuperación**
- Botón "Reintentar"
- "Volver a búsqueda"
- "Contactar soporte" (si aplica)

### 3. **Estados Visuales**
- Iconos apropiados (⚠️ para error, 🔍 para búsqueda)
- Colores consistentes (rojo para error, azul para info)
- Animaciones sutiles

## 🔧 Configuración de Timeouts

### HTTP Client Configuration
```typescript
// En app.config.ts o similar
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TimeoutInterceptor,
    multi: true
  }
]
```

### Timeout Interceptor
```typescript
@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeout = 10000; // 10 segundos
    return next.handle(req).pipe(
      timeout(timeout),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timeout'));
        }
        return throwError(() => error);
      })
    );
  }
}
```

## 📊 Logging y Monitoreo

### 1. **Console Warnings**
- Errores no críticos (como endpoint de marcas)
- Información de debugging
- No spam en producción

### 2. **Error Tracking**
- Errores críticos reportados
- Contexto de usuario
- Stack traces (en desarrollo)

### 3. **Métricas**
- Tasa de éxito de requests
- Tiempo de respuesta
- Errores por endpoint

## 🚀 Mejoras Futuras

### 1. **Retry Automático**
- Reintentar requests fallidos
- Backoff exponencial
- Límite de reintentos

### 2. **Cache de Errores**
- Evitar requests repetidos
- Cache de respuestas exitosas
- Invalidación inteligente

### 3. **Notificaciones Push**
- Alertas de errores críticos
- Notificaciones de estado del sistema
- Updates de mantenimiento

### 4. **Modo Offline**
- Cache local de datos
- Funcionalidad limitada sin red
- Sincronización cuando vuelve la conexión

## 📝 Checklist de Manejo de Errores

### ✅ **Implementado**
- [x] Manejo de errores 500 en endpoint de marcas
- [x] Estados de carga y error en componentes
- [x] Validaciones de datos en templates
- [x] Mensajes de error user-friendly
- [x] Opciones de recuperación (reintentar, volver)

### 🔄 **En Progreso**
- [ ] Timeout interceptor
- [ ] Retry automático
- [ ] Cache de errores

### 📋 **Pendiente**
- [ ] Modo offline
- [ ] Notificaciones push
- [ ] Métricas avanzadas
- [ ] Error tracking service

---

**Desarrollado por**: Equipo Pritzio Frontend  
**Última actualización**: Enero 2024  
**Versión**: 1.0.0
