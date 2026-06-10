export type UserType = 'SYSTEM_OWNER' | 'COMPANY_ADMIN' | 'COMPANY_USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface IdentityUser {
  id: string;
  companyId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  status: UserStatus;
  identificationNumber: string | null;
  personalEmail: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateIdentityUserRequest {
  companyId?: string | null;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  identificationNumber?: string | null;
  personalEmail?: string | null;
  phoneNumber?: string | null;
}

export interface CreateCompanyAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  identificationNumber?: string | null;
  personalEmail?: string | null;
  phoneNumber?: string | null;
}

export interface UpdateIdentityUserRequest {
  firstName?: string;
  lastName?: string;
  identificationNumber?: string | null;
  personalEmail?: string | null;
  phoneNumber?: string | null;
  status?: UserStatus;
}
