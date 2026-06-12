export interface Role {
  id: string;
  companyId: string | null;
  name: string;
  code: string;
  status: string;
  permissionIds?: string[];
  permissionCodes?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateRoleRequest {
  companyId?: string | null;
  name: string;
  code: string;
  status?: string;
  permissionIds?: string[];
}

export type UpdateRoleRequest = Partial<CreateRoleRequest>;
