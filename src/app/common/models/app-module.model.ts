import { MenuStatus } from './menu-admin.model';

export interface AppModule {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  status: MenuStatus;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateAppModuleRequest {
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  displayOrder?: number;
  status?: MenuStatus;
  isSystem?: boolean;
}

export type UpdateAppModuleRequest = Partial<CreateAppModuleRequest>;
