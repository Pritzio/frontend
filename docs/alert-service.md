# AlertService Documentation

## Service Overview

**Location**: `src/app/core/services/alert.service.ts`  
**Type**: Injectable Service  
**Scope**: Root (Singleton)  
**Purpose**: Centralized alert and notification management using SweetAlert2

## Class Definition

```typescript
@Injectable({
  providedIn: 'root'
})
export class AlertService
```

## Dependencies

- **SweetAlert2**: `import Swal from 'sweetalert2'`

## Public Methods

### success(message: string, title?: string): Promise<any>

Shows a success notification with auto-dismiss timer.

**Parameters:**
- `message` (string): The success message to display
- `title` (string, optional): Custom title. Defaults to "¡Éxito!"

**Returns:** Promise that resolves when the alert is dismissed

**Configuration:**
- Icon: Success checkmark
- Color: Green (#10b981)
- Timer: 3 seconds auto-dismiss
- Progress bar: Enabled

**Example:**
```typescript
this._alertService.success('Usuario creado exitosamente', 'Operación Completada');
```

---

### error(message: string, title?: string): Promise<any>

Shows an error notification that requires manual dismissal.

**Parameters:**
- `message` (string): The error message to display
- `title` (string, optional): Custom title. Defaults to "Error"

**Returns:** Promise that resolves when the alert is dismissed

**Configuration:**
- Icon: Error X mark
- Color: Red (#ef4444)
- Timer: None (manual dismiss)
- Button: "Aceptar"

**Example:**
```typescript
this._alertService.error('No se pudo eliminar el usuario', 'Error de Operación');
```

---

### warning(message: string, title?: string): Promise<any>

Shows a warning notification.

**Parameters:**
- `message` (string): The warning message to display
- `title` (string, optional): Custom title. Defaults to "Advertencia"

**Returns:** Promise that resolves when the alert is dismissed

**Configuration:**
- Icon: Warning triangle
- Color: Yellow (#f59e0b)
- Timer: None (manual dismiss)
- Button: "Aceptar"

**Example:**
```typescript
this._alertService.warning('No tiene permisos para esta acción', 'Acceso Denegado');
```

---

### info(message: string, title?: string): Promise<any>

Shows an informational notification.

**Parameters:**
- `message` (string): The information message to display
- `title` (string, optional): Custom title. Defaults to "Información"

**Returns:** Promise that resolves when the alert is dismissed

**Configuration:**
- Icon: Info circle
- Color: Blue (#3b82f6)
- Timer: None (manual dismiss)
- Button: "Aceptar"

**Example:**
```typescript
this._alertService.info('Los cambios se aplicarán en 5 minutos', 'Información del Sistema');
```

---

### confirm(message: string, title?: string, confirmText?: string, cancelText?: string): Promise<boolean>

Shows a confirmation dialog with two buttons.

**Parameters:**
- `message` (string): The confirmation question to display
- `title` (string, optional): Custom title. Defaults to "¿Estás seguro?"
- `confirmText` (string, optional): Confirm button text. Defaults to "Sí, confirmar"
- `cancelText` (string, optional): Cancel button text. Defaults to "Cancelar"

**Returns:** Promise<boolean> - `true` if confirmed, `false` if canceled

**Configuration:**
- Icon: Question mark
- Buttons: Two-button layout
- Focus: Cancel button (safer default)
- Colors: Confirm (red), Cancel (gray)
- Button order: Reversed (Cancel left, Confirm right)

**Example:**
```typescript
const confirmed = await this._alertService.confirm(
  '¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.',
  'Confirmar Eliminación',
  'Sí, eliminar',
  'Cancelar'
);

if (confirmed) {
  // Execute action
}
```

---

### loading(message?: string): void

Shows a loading dialog without buttons.

**Parameters:**
- `message` (string, optional): Loading message. Defaults to "Procesando..."

**Returns:** void

**Configuration:**
- No buttons or close options
- Spinner animation
- Blocks user interaction
- Must be manually closed with `close()`

**Example:**
```typescript
this._alertService.loading('Guardando cambios...');
// ... perform async operation
this._alertService.close();
```

---

### close(): void

Closes any currently open alert.

**Parameters:** None  
**Returns:** void

**Example:**
```typescript
this._alertService.close();
```

---

### toast(message: string, type?: string, position?: string): void

Shows a small, non-intrusive toast notification.

**Parameters:**
- `message` (string): The toast message
- `type` (string, optional): 'success' | 'error' | 'warning' | 'info'. Defaults to 'info'
- `position` (string, optional): Toast position. Defaults to 'top-end'

**Returns:** void

**Configuration:**
- Small size, non-blocking
- Auto-dismiss after 3 seconds
- Pause on hover
- No buttons

**Available Positions:**
- 'top-end', 'top-start', 'bottom-end', 'bottom-start'

**Example:**
```typescript
this._alertService.toast('Cambios guardados automáticamente', 'success', 'bottom-end');
```

## Usage in Components

### 1. Injection

```typescript
constructor(private _alertService: AlertService) {}
```

### 2. Basic Notifications

```typescript
// Success
this._alertService.success('Operación completada exitosamente');

// Error
this._alertService.error('Ocurrió un error inesperado');

// Warning
this._alertService.warning('Revise los datos antes de continuar');

// Info
this._alertService.info('Nueva versión disponible');
```

### 3. Confirmations

```typescript
public async deleteUser(user: User): Promise<void> {
  const confirmed = await this._alertService.confirm(
    `¿Está seguro de eliminar al usuario ${user.name}?`,
    'Confirmar Eliminación',
    'Sí, eliminar',
    'Cancelar'
  );

  if (confirmed) {
    this.userService.delete(user.id).subscribe({
      next: () => this._alertService.success('Usuario eliminado exitosamente'),
      error: () => this._alertService.error('Error al eliminar usuario')
    });
  }
}
```

### 4. Loading States

```typescript
public async saveData(): Promise<void> {
  this._alertService.loading('Guardando datos...');
  
  try {
    await this.dataService.save(this.formData);
    this._alertService.close();
    this._alertService.success('Datos guardados correctamente');
  } catch (error) {
    this._alertService.close();
    this._alertService.error('Error al guardar los datos');
  }
}
```

## Styling and Theming

The service applies consistent styling across all alerts:

### Colors
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Warning**: #f59e0b (Yellow)
- **Info**: #3b82f6 (Blue)
- **Cancel**: #6b7280 (Gray)

### Animations
- **Enter**: `animate__fadeInDown`
- **Exit**: `animate__fadeOutUp`
- **Duration**: 300ms

### Typography
- Uses system fonts for consistency
- Responsive text sizing
- Proper contrast ratios for accessibility

## Error Handling

The service includes built-in error handling:

```typescript
// Service methods wrap SweetAlert2 calls in try-catch blocks
// Fallbacks to console warnings if SweetAlert2 fails to load
// Graceful degradation for unsupported browsers
```

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and announcements
- **Focus Management**: Proper focus trapping and restoration
- **Color Contrast**: WCAG AA compliant color combinations
- **Reduced Motion**: Respects user's motion preferences

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Fallback**: Graceful degradation to native alerts if needed

## Performance Characteristics

- **Bundle Size**: ~47KB gzipped
- **Load Time**: Lazy-loaded, only when first used
- **Memory Usage**: Minimal, proper cleanup after each use
- **DOM Impact**: No persistent elements, clean lifecycle

## Testing

### Unit Test Mock

```typescript
const mockAlertService = {
  success: jasmine.createSpy('success').and.returnValue(Promise.resolve()),
  error: jasmine.createSpy('error').and.returnValue(Promise.resolve()),
  warning: jasmine.createSpy('warning').and.returnValue(Promise.resolve()),
  info: jasmine.createSpy('info').and.returnValue(Promise.resolve()),
  confirm: jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true)),
  loading: jasmine.createSpy('loading'),
  close: jasmine.createSpy('close'),
  toast: jasmine.createSpy('toast')
};
```

### Component Test Example

```typescript
it('should show success message after saving', async () => {
  spyOn(component['_alertService'], 'success');
  
  await component.save();
  
  expect(component['_alertService'].success).toHaveBeenCalledWith(
    'Datos guardados correctamente',
    'Operación Exitosa'
  );
});
```

## Migration Notes

### From Native Alerts

**Before:**
```typescript
alert('Success!');
if (confirm('Delete user?')) {
  // delete
}
```

**After:**
```typescript
this._alertService.success('Success!');
const confirmed = await this._alertService.confirm('Delete user?');
if (confirmed) {
  // delete
}
```

### From Previous Custom System

All previous `NotificationService` calls have been migrated to corresponding `AlertService` methods with improved functionality and styling.
