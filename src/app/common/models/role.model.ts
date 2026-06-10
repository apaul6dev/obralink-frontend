export interface Role {
  id: string;
  companyId: string | null;
  name: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
