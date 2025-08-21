export interface User {
  id: number;
  email: string;
  role: string;
  client: string;
  status: string;
  createdAt: string;
}
export interface Client {
  id: number;
  name: string;
}
export interface GwClient {
  id: number;
  name: string;
}

export type ContractStatus = 'active' | 'expiring_soon' | 'expired' | 'all';
export interface Contract {
  id: string;
  client_id: number;
  client_name: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  file_url: string;
  client_contact_emails: string[];
  created_at: string;
}
export interface GwContract {
  id: string;
  client_gw_id: number;
  client_name: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string | null;
  file_url: string;
  created_at: string;
  client_contact_emails: string[];
  domain: string | null;
  sku: string | null;
}

export interface ContractFormState {
  clientId: number | null;
  clientName: string;
  startDate: string;
  endDate: string;
  notes: string;
  file: File | null;
  clientEmails: string[];
}
export interface GwContractFormState {
  clientGwId: number | null;
  clientName: string;
  startDate: string;
  endDate: string;
  notes: string;
  file: File | null;
  clientEmails: string[];
}

export interface AdminInvoice {
  id: number;
  invoice_number: string;
  client_name: string;
  invoice_period: string;
  due_date: string;
  total_amount: number;
  status: string;
  proof_of_payment_url: string | null;
}

export interface GroupedAdminInvoices {
  month: string;
  invoices: AdminInvoice[];
}

export interface PaginationInfo {
  total_items: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

export interface PaginatedAdminInvoicesResponse {
  pagination: PaginationInfo;
  data: GroupedAdminInvoices[];
}

// Menambahkan tipe paginasi untuk kontrak
export interface PaginatedContractsResponse {
  pagination: PaginationInfo;
  data: Contract[];
}

export interface PaginatedGwContractsResponse {
  pagination: PaginationInfo;
  data: GwContract[];
}

export interface AdminInvoiceParams {
  status?: string | null;
  clientId?: number | null;
  month?: number | null;
  year?: number | null;
  page?: number;
  limit?: number;
}

export interface AdminUpdateInvoicePayload {
  status: string;
  payment_date?: string | null;
  payment_notes?: string | null;
}

// --- Tipe Data State Utama untuk Admin Store ---
export interface AdminState {
  users: User[];
  clients: Client[];
  contracts: Contract[];
  contractsPagination: PaginationInfo | null; // Pagination untuk GCP
  gwClients: GwClient[];
  gwContracts: GwContract[];
  gwContractsPagination: PaginationInfo | null; // Pagination untuk GW
  adminInvoices: GroupedAdminInvoices[];
  adminInvoicesPagination: PaginationInfo | null;
  stats: { totalUsers: number; totalClients: number; activeUsers: number };
  hasFetched: {
    users: boolean;
    clients: boolean;
    contracts: boolean;
    gwClients: boolean;
    gwContracts: boolean;
    stats: boolean;
    adminInvoices: boolean;
  };
  loading: {
    users: boolean;
    clients: boolean;
    contracts: boolean;
    gwContracts: boolean;
    stats: boolean;
    adminInvoices: boolean;
  };
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchStats: () => Promise<void>;

  fetchContracts: (
    month?: number | null,
    year?: number | null,
    page?: number,
    limit?: number
  ) => Promise<void>;
  addContract: (formData: ContractFormState) => Promise<void>;
  editContract: (
    contractId: string,
    formData: ContractFormState
  ) => Promise<void>;
  removeContract: (contractId: string) => Promise<void>;

  fetchGwClients: () => Promise<void>;
  fetchGwContracts: (
    month?: number | null,
    year?: number | null,
    page?: number,
    limit?: number
  ) => Promise<void>;
  addGwContract: (formData: GwContractFormState) => Promise<void>;
  editGwContract: (
    contractId: string,
    formData: GwContractFormState
  ) => Promise<void>;
  removeGwContract: (contractId: string) => Promise<void>;

  addUser: (userData: any) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  updateUserClient: (userId: number, clientId: number) => Promise<void>;

  fetchAdminInvoices: (params: AdminInvoiceParams) => Promise<void>;
  updateInvoiceDetails: (
    invoiceId: number,
    payload: AdminUpdateInvoicePayload
  ) => Promise<void>;
}
