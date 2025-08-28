# 📚 Documentación Técnica del Proyecto Angular - Pritzio

Esta carpeta contiene toda la documentación técnica y las instrucciones de desarrollo del proyecto frontend de Pritzio.

## 🚀 Tecnologías del Proyecto

- **Angular**: 20.2.2 (última versión)
- **Node.js**: 24.6.0 (última versión LTS)
- **TypeScript**: 5.9.2
- **RxJS**: 7.8.2
- **Zone.js**: 0.15.1

## 📁 Estructura de la Documentación

- `README.md` - Este archivo, descripción general del proyecto
- `setup.md` - Instrucciones de configuración del entorno de desarrollo
- `architecture.md` - Arquitectura del proyecto y decisiones técnicas
- `components.md` - Documentación de componentes y servicios
- `routing.md` - Configuración de rutas y navegación
- `testing.md` - Guía de testing y debugging
- `deployment.md` - Instrucciones de despliegue
- `troubleshooting.md` - Solución de problemas comunes

## 🛠️ Comandos Principales

```bash
# Servidor de desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Generar componentes
ng generate component nombre-componente
ng generate service nombre-servicio
ng generate pipe nombre-pipe
```

## 📋 Convenciones del Proyecto

- Usar Angular CLI para generar archivos
- Seguir el estilo guide de Angular
- Componentes con prefijo `app-`
- Servicios con sufijo `Service`
- Interfaces con prefijo `I`
- Enums con sufijo `Enum`

## 🔧 Configuración del IDE

### VS Code
- Extensiones recomendadas ya configuradas
- Formateo automático con Prettier
- Debugger configurado para Angular

## 📝 Notas Importantes

- Esta carpeta está excluida del control de versiones de Git
- Mantener la documentación actualizada con cada cambio
- Usar Markdown para todos los archivos
- Incluir ejemplos de código cuando sea relevante
