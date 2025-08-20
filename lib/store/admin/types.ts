// --- Tipe Data Pengguna dan Klien ---
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

// --- Tipe Data Kontrak ---
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

// --- Tipe Data Form ---
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

// --- TIPE DATA INVOICE ADMIN YANG HILANG ---
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

export interface AdminInvoiceParams {
  status?: string | null;
  clientId?: number | null;
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
  gwClients: GwClient[];
  gwContracts: GwContract[];
  adminInvoices: AdminInvoice[]; // Tambahkan ini
  stats: { totalUsers: number; totalClients: number; activeUsers: number };
  hasFetched: {
    users: boolean;
    clients: boolean;
    contracts: boolean;
    gwClients: boolean;
    gwContracts: boolean;
    stats: boolean;
    adminInvoices: boolean; // Tambahkan ini
  };
  loading: {
    users: boolean;
    clients: boolean;
    contracts: boolean;
    gwContracts: boolean;
    stats: boolean;
    adminInvoices: boolean; // Tambahkan ini
  };
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchStats: () => Promise<void>;

  fetchContracts: (
    month?: number | null,
    year?: number | null
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
    year?: number | null
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

  fetchAdminInvoices: (params: AdminInvoiceParams) => Promise<void>; // Tambahkan ini
  updateInvoiceDetails: (
    invoiceId: number,
    payload: AdminUpdateInvoicePayload
  ) => Promise<void>; // Tambahkan ini
}
