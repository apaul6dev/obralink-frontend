export interface Permission {
  id: string;
  code: string;
  description: string | null;
  category: 'API' | 'UI';
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  moduleIcon: string | null;
  action: string;
  label: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PermissionCatalogGroup {
  category: 'API' | 'UI';
  moduleId: string;
  moduleCode: string;
  label: string;
  icon: string | null;
  permissions: Permission[];
}

export interface CreatePermissionRequest {
  code: string;
  description?: string | null;
  category?: 'API' | 'UI';
  moduleId: string;
  action?: string;
  label?: string;
  isSystem?: boolean;
}

export type UpdatePermissionRequest = Partial<CreatePermissionRequest>;
