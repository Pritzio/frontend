# 🚀 Guía de Integración Frontend - Pritzio Backend

## 📋 **Información General del Proyecto**

### **🏗️ Arquitectura**
- **Backend**: NestJS (Node.js) con arquitectura monolítica
- **Base de Datos**: PostgreSQL con TypeORM
- **Cache**: Redis para sesiones y datos temporales
- **Autenticación**: JWT con refresh tokens
- **Documentación**: Swagger/OpenAPI en `/api/docs`

### **🌍 Entornos Disponibles**
- **Desarrollo**: `http://localhost:3000`
- **Staging**: Configurado para despliegue
- **Producción**: Configurado para despliegue

### **🔧 Tecnologías del Backend**
- **Framework**: NestJS v11
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL v15+
- **Cache**: Redis v7+
- **Validación**: class-validator + class-transformer
- **Seguridad**: Helmet, CORS, Rate Limiting, HPP

---

## 🔐 **Sistema de Autenticación**

### **📝 Endpoints de Autenticación**
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/change-password
POST /api/v1/auth/verify-email
```

### **🔑 Estructura de Tokens**
- **Access Token**: JWT válido por 15 minutos
- **Refresh Token**: JWT válido por 7 días
- **Formato**: `Bearer {token}` en header Authorization

### **📊 DTOs de Autenticación**

#### **Login**
```typescript
{
  identifier: string;    // Email o username
  password: string;      // Mínimo 8 caracteres
}
```

#### **Registro**
```typescript
{
  username: string;      // Mínimo 3, máximo 50 caracteres
  email: string;         // Email válido
  password: string;      // Mínimo 8, máximo 128 caracteres
  firstName: string;     // Mínimo 2, máximo 100 caracteres
  lastName: string;      // Mínimo 2, máximo 100 caracteres
  phone?: string;        // Opcional, máximo 20 caracteres
  type?: UserType;       // 'individual' | 'business' | 'system'
}
```

### **👥 Tipos de Usuario**
- **INDIVIDUAL**: Usuario personal
- **BUSINESS**: Usuario empresarial
- **SYSTEM**: Usuario del sistema

### **📈 Estados de Usuario**
- **ACTIVE**: Usuario activo
- **INACTIVE**: Usuario inactivo
- **SUSPENDED**: Usuario suspendido
- **PENDING_VERIFICATION**: Pendiente de verificación

---

## 👤 **Módulo de Usuarios**

### **📝 Endpoints de Usuarios**
```
GET    /api/v1/users/profile          # Perfil del usuario autenticado
PUT    /api/v1/users/profile          # Actualizar perfil
GET    /api/v1/users/{id}             # Obtener usuario por ID
PUT    /api/v1/users/{id}             # Actualizar usuario
DELETE /api/v1/users/{id}             # Eliminar usuario
GET    /api/v1/users                  # Listar usuarios (con filtros)
```

### **📊 Entidad Usuario**
```typescript
{
  id: string;                    // UUID único
  username: string;              // Nombre de usuario único
  email: string;                 // Email único
  firstName: string;             // Nombre
  lastName: string;              # Apellido
  phone?: string;                // Teléfono opcional
  status: UserStatus;            // Estado del usuario
  type: UserType;                // Tipo de usuario
  emailVerified: boolean;        // Email verificado
  phoneVerified: boolean;        # Teléfono verificado
  avatar?: string;               # URL del avatar
  metadata?: Record<string, any>; // Metadatos adicionales
  createdAt: Date;               # Fecha de creación
  updatedAt: Date;               # Fecha de última actualización
}
```

---

## 🏪 **Módulo de Tiendas**

### **📝 Endpoints de Tiendas**
```
GET    /api/v1/stores              # Listar tiendas
POST   /api/v1/stores              # Crear tienda
GET    /api/v1/stores/{id}         # Obtener tienda por ID
PUT    /api/v1/stores/{id}         # Actualizar tienda
DELETE /api/v1/stores/{id}         # Eliminar tienda
GET    /api/v1/stores/{id}/products # Productos de una tienda
```

### **📊 Entidad Tienda**
```typescript
{
  id: string;                    // UUID único
  name: string;                  // Nombre de la tienda
  description?: string;          // Descripción opcional
  website: string;               // URL del sitio web
  logo?: string;                 // URL del logo
  type: StoreType;               // 'online' | 'physical' | 'hybrid'
  status: StoreStatus;           // Estado de la tienda
  category: StoreCategory;       // Categoría de la tienda
  phone?: string;                // Teléfono opcional
  email?: string;                // Email opcional
  country?: string;              // País opcional
  timezone?: string;             // Zona horaria opcional
  isVerified: boolean;           // Verificación de la tienda
  verifiedAt?: Date;             # Fecha de verificación
  verifiedBy?: string;           # ID del usuario que verificó
  metadata?: Record<string, any>; // Metadatos adicionales
  createdAt: Date;               # Fecha de creación
  updatedAt: Date;               # Fecha de última actualización
}
```

### **🏷️ Categorías de Tienda**
- **ELECTRONICS**: Electrónicos
- **CLOTHING**: Ropa
- **HOME_AND_GARDEN**: Hogar y jardín
- **SPORTS**: Deportes
- **BEAUTY**: Belleza
- **BOOKS**: Libros
- **AUTOMOTIVE**: Automotriz
- **FOOD_AND_BEVERAGES**: Alimentos y bebidas
- **HEALTH**: Salud
- **TOYS**: Juguetes
- **OTHER**: Otros

---

## 📦 **Módulo de Productos**

### **📝 Endpoints de Productos**
```
GET    /api/v1/products           # Listar productos
POST   /api/v1/products           # Crear producto
GET    /api/v1/products/{id}      # Obtener producto por ID
PUT    /api/v1/products/{id}      # Actualizar producto
DELETE /api/v1/products/{id}      # Eliminar producto
GET    /api/v1/products/search    # Buscar productos
```

### **📊 Entidad Producto**
```typescript
{
  id: string;                    // UUID único
  name: string;                  // Nombre del producto
  description?: string;          // Descripción opcional
  code: string;                  // Código único del producto
  sku?: string;                  # SKU opcional
  barcode?: string;              # Código de barras opcional
  image?: string;                # URL de la imagen
  brand?: string;                # Marca opcional
  category: string;              # Categoría del producto
  subcategory?: string;          # Subcategoría opcional
  type: ProductType;             # 'physical' | 'digital' | 'service' | 'subscription'
  status: ProductStatus;         # Estado del producto
  condition: ProductCondition;   # 'new' | 'used' | 'refurbished' | 'open_box'
  model?: string;                # Modelo opcional
  manufacturer?: string;         # Fabricante opcional
  country?: string;              # País de origen opcional
  weight?: number;               # Peso opcional
  weightUnit?: string;           # Unidad de peso opcional
  dimensions?: string;           # Dimensiones opcionales
  dimensionsUnit?: string;       # Unidad de dimensiones opcional
  metadata?: Record<string, any>; // Metadatos adicionales
  createdAt: Date;               # Fecha de creación
  updatedAt: Date;               # Fecha de última actualización
}
```

### **🏷️ Estados de Producto**
- **ACTIVE**: Producto activo
- **INACTIVE**: Producto inactivo
- **DISCONTINUED**: Producto discontinuado
- **OUT_OF_STOCK**: Sin stock
- **COMING_SOON**: Próximamente

---

## 🏪📦 **Módulo de Productos de Tienda**

### **📝 Endpoints de Productos de Tienda**
```
GET    /api/v1/store-products           # Listar productos de tienda
POST   /api/v1/store-products           # Crear producto de tienda
GET    /api/v1/store-products/{id}      # Obtener producto de tienda
PUT    /api/v1/store-products/{id}      # Actualizar producto de tienda
DELETE /api/v1/store-products/{id}      # Eliminar producto de tienda
GET    /api/v1/store-products/search    # Buscar productos de tienda
```

### **📊 Entidad Producto de Tienda**
```typescript
{
  id: string;                    // UUID único
  storeId: string;               // ID de la tienda
  productId: string;             // ID del producto maestro
  price: number;                 // Precio actual
  originalPrice?: number;        # Precio original opcional
  currency: string;              // Moneda (ej: 'USD', 'EUR')
  stockQuantity?: number;        # Cantidad en stock opcional
  availability: AvailabilityStatus; // Estado de disponibilidad
  lastScrapedAt?: Date;         # Última vez que se actualizó
  metadata?: Record<string, any>; // Metadatos adicionales
  createdAt: Date;               # Fecha de creación
  updatedAt: Date;               # Fecha de última actualización
}
```

---

## 📍 **Módulo de Ubicaciones Físicas**

### **📝 Endpoints de Ubicaciones**
```
GET    /api/v1/physical-locations      # Listar ubicaciones
POST   /api/v1/physical-locations      # Crear ubicación
GET    /api/v1/physical-locations/{id} # Obtener ubicación por ID
PUT    /api/v1/physical-locations/{id} # Actualizar ubicación
DELETE /api/v1/physical-locations/{id} # Eliminar ubicación
```

### **📊 Entidad Ubicación Física**
```typescript
{
  id: string;                    // UUID único
  storeId: string;               // ID de la tienda
  name: string;                  // Nombre de la ubicación
  address: string;               // Dirección completa
  city: string;                  // Ciudad
  state?: string;                # Estado/Provincia opcional
  country: string;               // País
  postalCode?: string;           # Código postal opcional
  latitude?: number;             # Latitud opcional
  longitude?: number;            # Longitud opcional
  phone?: string;                # Teléfono opcional
  email?: string;                # Email opcional
  businessHours?: BusinessHours[]; // Horarios de negocio opcionales
  capacity?: number;             # Capacidad opcional
  isActive: boolean;             # Si la ubicación está activa
  metadata?: Record<string, any>; // Metadatos adicionales
  createdAt: Date;               # Fecha de creación
  updatedAt: Date;               # Fecha de última actualización
}
```

---

## 🕷️ **Módulo de Scraping**

### **📝 Endpoints de Scraping**
```
POST   /api/v1/scraping/start          # Iniciar proceso de scraping
GET    /api/v1/scraping/status         # Estado del scraping
POST   /api/v1/scraping/stop           # Detener scraping
GET    /api/v1/scraping/history        # Historial de scraping
```

---

## 🔒 **Sistema de Seguridad**

### **🛡️ Middleware de Seguridad**
- **Helmet**: Headers de seguridad
- **CORS**: Control de origen cruzado
- **Rate Limiting**: Límite de requests por IP
- **HPP**: Protección contra HTTP Parameter Pollution
- **Validación**: Validación automática de DTOs

### **📊 Configuración de CORS**
```typescript
// Desarrollo
{
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}

// Producción
{
  origin: ['https://tu-dominio.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}
```

### **⚡ Rate Limiting**
- **Ventana**: 15 minutos
- **Máximo**: 100 requests por IP
- **Configurable**: Mediante variables de entorno

---

## 🌐 **Variables de Entorno**

### **🔧 Configuración Básica**
```bash
NODE_ENV=development
BACKEND_PORT=3000
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:4200
```

### **🗄️ Base de Datos**
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pritzio
DATABASE_USER=pritzio_user
DATABASE_PASSWORD=pritzio_password
```

### **🔴 Redis**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=pritzio_redis_password
```

### **🔐 JWT**
```bash
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=pritzio-backend
JWT_AUDIENCE=pritzio-users
```

### **📝 Logging**
```bash
ENABLE_LOGGING=true
NESTJS_LOG_LEVELS=error,warn,log,debug,verbose
TYPEORM_LOGGING=true
ENABLE_SWAGGER=true
```

---

## 📚 **Documentación de API**

### **🔍 Swagger/OpenAPI**
- **URL**: `http://localhost:3000/api/docs`
- **Autenticación**: Bearer token en Swagger UI
- **Endpoints**: Todos los endpoints documentados
- **DTOs**: Esquemas de request/response
- **Ejemplos**: Ejemplos de uso para cada endpoint

### **📖 Estructura de Respuestas**
```typescript
// Respuesta exitosa
{
  success: true,
  data: any,
  message?: string,
  timestamp: string
}

// Respuesta de error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  timestamp: string
}
```

---

## 🚀 **Guía de Integración Rápida**

### **1️⃣ Configuración Inicial**
```typescript
// Configuración base para el frontend
const API_CONFIG = {
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

### **2️⃣ Interceptor de Autenticación**
```typescript
// Interceptor para agregar token JWT
const authInterceptor = (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
```

### **3️⃣ Manejo de Refresh Token**
```typescript
// Función para renovar token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await api.post('/auth/refresh', { refreshToken });
  
  if (response.data.success) {
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
  }
};
```

### **4️⃣ Manejo de Errores**
```typescript
// Interceptor de errores
const errorInterceptor = (error) => {
  if (error.response?.status === 401) {
    // Token expirado, intentar refresh
    refreshToken();
  }
  return Promise.reject(error);
};
```

---

## 📱 **Ejemplos de Uso**

### **🔐 Login de Usuario**
```typescript
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Guardar tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Guardar información del usuario
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    }
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
```

### **🏪 Obtener Tiendas**
```typescript
const getStores = async (filters = {}) => {
  try {
    const response = await api.get('/stores', { params: filters });
    
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('Error obteniendo tiendas:', error);
    throw error;
  }
};
```

### **📦 Buscar Productos**
```typescript
const searchProducts = async (query, filters = {}) => {
  try {
    const params = { q: query, ...filters };
    const response = await api.get('/products/search', { params });
    
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('Error buscando productos:', error);
    throw error;
  }
};
```

---

## ⚠️ **Consideraciones Importantes**

### **🔒 Seguridad**
- **Nunca** almacenes tokens en variables globales
- **Siempre** usa HTTPS en producción
- **Valida** todos los inputs del usuario
- **Implementa** logout automático en expiración

### **📊 Performance**
- **Implementa** cache local para datos estáticos
- **Usa** paginación para listas grandes
- **Optimiza** requests con debouncing
- **Considera** lazy loading para datos pesados

### **🔄 Estado**
- **Mantén** estado sincronizado con el backend
- **Implementa** optimistic updates cuando sea posible
- **Maneja** estados de loading y error
- **Considera** offline-first para mejor UX

---

## 📞 **Soporte y Contacto**

### **🐛 Reportar Bugs**
- **Issues**: Crear issue en el repositorio
- **Logs**: Incluir logs del backend y frontend
- **Reproducción**: Pasos para reproducir el problema

### **💡 Solicitar Features**
- **Descripción**: Explicar la funcionalidad deseada
- **Caso de uso**: Cómo se usaría
- **Prioridad**: Alta, media o baja

### **📚 Documentación Adicional**
- **Swagger**: `/api/docs` para endpoints específicos
- **Código fuente**: Revisar entidades y DTOs
- **Logs**: Verificar logs del backend para debugging

---

**Última Actualización**: 2024-01-15  
**Versión del Backend**: 0.0.1  
**Mantenedor**: AI Assistant  
**Estado**: ✅ Documentación Completa para Frontend

---

> **💡 Tip**: Esta documentación se actualiza automáticamente con cada cambio en el backend. Para la información más reciente, consulta siempre la documentación Swagger en `/api/docs`.
