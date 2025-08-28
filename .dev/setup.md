# ⚙️ Configuración del Entorno de Desarrollo - Angular

## 🎯 Requisitos Previos

- **Node.js**: 18.x o superior (recomendado: 24.6.0 LTS)
- **npm**: 9.x o superior (incluido con Node.js)
- **Git**: Para control de versiones
- **nvm**: Para gestión de versiones de Node.js

## 🚀 Instalación del Proyecto

### 1. Configurar Node.js con nvm

```bash
# Verificar versión actual
nvm current

# Usar la versión LTS más reciente
nvm use --lts

# O usar una versión específica
nvm use 24.6.0

# Establecer como predeterminada
nvm alias default 24.6.0
```

### 2. Instalar Angular CLI

```bash
# Instalar la última versión globalmente
npm install -g @angular/cli@latest

# Verificar la instalación
ng version
```

### 3. Clonar y Configurar el Proyecto

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd frontend

# Instalar dependencias
npm install

# Verificar que todo funciona
ng serve
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm start          # ng serve
npm run dev        # ng serve (alias)

# Construcción
npm run build      # ng build
npm run build:prod # ng build --configuration production

# Testing
npm test           # ng test
npm run test:watch # ng test --watch

# Linting y Formateo
npm run lint       # ng lint
npm run format     # prettier --write "src/**/*.{ts,html,scss}"
```

## 🔧 Configuración del IDE

### VS Code (Recomendado)

#### Extensiones Esenciales
- **Angular Language Service** - IntelliSense para Angular
- **Angular Snippets** - Snippets de código
- **Prettier** - Formateo de código
- **ESLint** - Linting de TypeScript
- **Auto Rename Tag** - Renombrar tags HTML automáticamente

#### Configuración Recomendada
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "angular.enable-strict-mode-prompt": false
}
```

### Otros IDEs
- **WebStorm**: Soporte nativo para Angular
- **Atom**: Instalar paquetes para Angular
- **Sublime Text**: Configurar plugins para Angular

## 🌐 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# API Backend
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000

# Configuración de la aplicación
APP_NAME=Pritzio
APP_VERSION=1.0.0
ENVIRONMENT=development

# Configuración de autenticación
AUTH_TOKEN_KEY=auth_token
REFRESH_TOKEN_KEY=refresh_token
```

## 🧪 Configuración de Testing

### Karma + Jasmine
```bash
# Ejecutar tests una vez
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de coverage
npm run test:coverage
```

### Configuración de Testing
- Tests unitarios en `*.spec.ts`
- Tests de integración en `e2e/`
- Configuración en `karma.conf.js`

## 🔍 Debugging

### Chrome DevTools
1. Abrir DevTools (F12)
2. Ir a la pestaña Sources
3. Buscar archivos TypeScript en webpack://
4. Establecer breakpoints

### VS Code Debugger
1. Presionar F5
2. Seleccionar "Launch Chrome"
3. Configurar breakpoints en VS Code
4. Ejecutar en modo debug

## 📱 Configuración de Dispositivos

### Desarrollo Móvil
```bash
# Servir en red local para testing móvil
ng serve --host 0.0.0.0 --port 4200

# Acceder desde dispositivo móvil
# http://[IP-LOCAL]:4200
```

### PWA (Progressive Web App)
```bash
# Agregar capacidades PWA
ng add @angular/pwa

# Construir para producción
npm run build:prod
```

## 🚨 Solución de Problemas Comunes

### Error de Dependencias
```bash
# Limpiar caché e instalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Error de Puerto
```bash
# Cambiar puerto
ng serve --port 4201

# O matar proceso que use el puerto
lsof -ti:4200 | xargs kill -9
```

### Error de TypeScript
```bash
# Limpiar caché de TypeScript
rm -rf .angular/cache
ng serve
```

### Error de Angular CLI
```bash
# Reinstalar Angular CLI
npm uninstall -g @angular/cli
npm install -g @angular/cli@latest
```

## ✅ Verificación de la Instalación

1. Ejecutar `ng serve`
2. Abrir navegador en `http://localhost:4200`
3. Verificar que la aplicación se carga correctamente
4. Verificar que no hay errores en la consola
5. Ejecutar `npm test` para verificar tests

## 📚 Recursos Adicionales

- [Documentación Oficial de Angular](https://angular.io/docs)
- [Angular CLI Reference](https://angular.io/cli)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Angular Testing Guide](https://angular.io/guide/testing)
