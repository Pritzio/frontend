export interface IRole {
  id: string;           // UUID del rol
  name: string;         // Nombre del rol (ej: 'customer', 'admin')
  displayName: string;  // Nombre para mostrar (ej: 'Cliente', 'Administrador')
  description?: string; // Descripción opcional del rol
  isActive: boolean;    // Si el rol está activo
  createdAt?: string;   // Fecha de creación
  updatedAt?: string;   // Fecha de actualización
}

export interface IRoleAssignment {
  userId: string;
  roleId: string;
}

export interface IRoleRemoval {
  userId: string;
  roleId: string;
}
