export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type CustomerStatus = 'LEAD' | 'CUSTOMER';

export interface Company {
  id: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  customerType: string | null;
  industry: string | null;
  billingEmail: string | null;
  paymentTerms: string | null;
  customerStatus: CustomerStatus;
  assignedAccountManager: string | null;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateCompanyRequest {
  name: string;
  legalName?: string | null;
  taxId?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  customerType?: string | null;
  industry?: string | null;
  billingEmail?: string | null;
  paymentTerms?: string | null;
  customerStatus?: CustomerStatus;
  assignedAccountManager?: string | null;
}

export type UpdateCompanyRequest = Partial<CreateCompanyRequest>;
