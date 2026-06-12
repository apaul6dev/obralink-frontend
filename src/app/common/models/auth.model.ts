export interface LoginRequest {
  email: string;
  password: string;
}

export interface BetterAuthUser {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  userType?: string;
  branchId?: string | null;
  permissions?: string[];
  role?: string | string[];
}

export interface BetterAuthSessionData {
  id: string;
  userId: string;
  token?: string;
  expiresAt?: string;
  activeOrganizationId?: string | null;
}

export interface AuthSession {
  user: BetterAuthUser;
  session: BetterAuthSessionData;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  userType: string;
  companyId: string | null;
  branchId: string | null;
  roles: string[];
  permissions: string[];
}
