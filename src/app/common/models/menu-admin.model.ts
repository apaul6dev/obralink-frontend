import { UserType } from './identity-user.model';

export type MenuStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface MenuAdminItem {
  id: string;
  code: string;
  titleKey: string;
  routerLink: string | null;
  href: string | null;
  icon: string;
  target: string | null;
  parentId: string | null;
  parentCode: string | null;
  displayOrder: number;
  allowedUserTypes: UserType[] | null;
  status: MenuStatus;
  permissionIds: string[];
  permissionCodes: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateMenuAdminItemRequest {
  code: string;
  titleKey: string;
  routerLink?: string | null;
  href?: string | null;
  icon: string;
  target?: string | null;
  parentId?: string | null;
  displayOrder?: number;
  allowedUserTypes?: UserType[] | null;
  status?: MenuStatus;
  permissionIds?: string[];
}

export type UpdateMenuAdminItemRequest = Partial<CreateMenuAdminItemRequest>;
