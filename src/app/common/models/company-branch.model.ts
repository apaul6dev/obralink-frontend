export type BranchStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface CompanyBranch {
  id: string;
  companyId: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateCompanyBranchRequest {
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: BranchStatus;
}

export type UpdateCompanyBranchRequest = Partial<CreateCompanyBranchRequest>;
