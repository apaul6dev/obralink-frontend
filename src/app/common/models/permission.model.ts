export interface Permission {
  id: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreatePermissionRequest {
  code: string;
  description?: string | null;
}

export type UpdatePermissionRequest = Partial<CreatePermissionRequest>;
