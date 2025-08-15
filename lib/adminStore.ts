import { create } from 'zustand';
import {
  getUsers,
  getClients,
  deleteUser as apiDeleteUser,
  updateUserClientId as apiUpdateUserClient,
  registerUser as apiRegisterUser,
  getContracts,
  createContract,
  updateContract,
  deleteContract,
} from './api/index';
import { contractFormToFormData } from './utils';

// --- TIPE DATA ---
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

export type ContractStatus = 'active' | 'expiring_soon' | 'expired' | 'all';

export interface Contract {
  id: string;
  client_id: number;
  client_name: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  file_url: string;
  client_emails: string[];
  // internal_emails tidak lagi menjadi bagian dari data kontrak utama
  created_at: string;
}

// --- PERUBAHAN DI SINI ---
export interface ContractFormState {
  clientId: number | null;
  clientName: string;
  startDate: string;
  endDate: string;
  notes: string;
  file: File | null;
  clientEmails: string[];
  // Hapus internalEmails dari sini
  // internalEmails: string[];
}

interface AdminState {
  users: User[];
  clients: Client[];
  contracts: Contract[];
  stats: { totalUsers: number; totalClients: number; activeUsers: number };
  hasFetched: {
    users: boolean;
    clients: boolean;
    stats: boolean;
    contracts: boolean;
  };
  loading: {
    users: boolean;
    clients: boolean;
    stats: boolean;
    contracts: boolean;
  };
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchContracts: () => Promise<void>;
  addContract: (formData: ContractFormState) => Promise<void>;
  editContract: (
    contractId: string,
    formData: ContractFormState
  ) => Promise<void>;
  removeContract: (contractId: string) => Promise<void>;
  addUser: (userData: any) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  updateUserClient: (userId: number, clientId: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  clients: [],
  contracts: [],
  stats: { totalUsers: 0, totalClients: 0, activeUsers: 0 },
  hasFetched: { users: false, clients: false, stats: false, contracts: false },
  loading: { users: false, clients: false, stats: false, contracts: false },
  error: null,

  fetchUsers: async () => {
    if (get().hasFetched.users) return;
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: null,
    }));
    try {
      const res = await getUsers();
      set({
        users: res.users || [],
        hasFetched: { ...get().hasFetched, users: true },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat pengguna' });
    } finally {
      set((state) => ({ loading: { ...state.loading, users: false } }));
    }
  },

  fetchClients: async () => {
    if (get().hasFetched.clients) return;
    set((state) => ({
      loading: { ...state.loading, clients: true },
      error: null,
    }));
    try {
      const res = await getClients();
      set({
        clients: res.clients || [],
        hasFetched: { ...get().hasFetched, clients: true },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat clients' });
    } finally {
      set((state) => ({ loading: { ...state.loading, clients: false } }));
    }
  },

  fetchStats: async () => {
    if (get().hasFetched.stats) return;
    set((state) => ({
      loading: { ...state.loading, stats: true },
      error: null,
    }));
    try {
      await get().fetchUsers();
      await get().fetchClients();
      const users = get().users;
      const clients = get().clients;
      set({
        stats: {
          totalUsers: users.length,
          totalClients: clients.length,
          activeUsers: users.filter((u) => u.status === 'Aktif').length,
        },
        hasFetched: { ...get().hasFetched, stats: true },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat statistik' });
    } finally {
      set((state) => ({ loading: { ...state.loading, stats: false } }));
    }
  },

  addUser: async (userData) => {
    await apiRegisterUser(userData);
    set({ hasFetched: { ...get().hasFetched, users: false, stats: false } });
  },

  deleteUser: async (userId) => {
    const originalUsers = get().users;
    set((state) => ({ users: state.users.filter((u) => u.id !== userId) }));
    try {
      await apiDeleteUser(userId);
      set({ hasFetched: { ...get().hasFetched, stats: false } });
    } catch (err: any) {
      set({
        users: originalUsers,
        error: err.message || 'Gagal menghapus pengguna',
      });
    }
  },

  updateUserClient: async (userId, clientId) => {
    const originalUsers = get().users;
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              client: get().clients.find((c) => c.id === clientId)?.name || '',
            }
          : u
      ),
    }));
    try {
      await apiUpdateUserClient(userId, clientId);
    } catch (err: any) {
      set({
        users: originalUsers,
        error: err.message || 'Gagal update client',
      });
    }
  },

  fetchContracts: async () => {
    set((state) => ({
      loading: { ...state.loading, contracts: true },
      error: null,
    }));
    try {
      const contractsData = await getContracts();
      set({
        contracts: contractsData || [],
        hasFetched: { ...get().hasFetched, contracts: true },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data kontrak' });
    } finally {
      set((state) => ({ loading: { ...state.loading, contracts: false } }));
    }
  },

  addContract: async (formData: ContractFormState) => {
    const data = contractFormToFormData(formData, get().clients);
    await createContract(data);
    set((state) => ({ hasFetched: { ...state.hasFetched, contracts: false } }));
  },

  editContract: async (contractId: string, formData: ContractFormState) => {
    const data = contractFormToFormData(formData, get().clients);
    await updateContract(contractId, data);
    set((state) => ({ hasFetched: { ...state.hasFetched, contracts: false } }));
  },

  removeContract: async (contractId: string) => {
    try {
      await deleteContract(contractId);
    } catch (error) {
      console.error('Failed to delete contract via API:', error);
      throw error;
    }
  },
}));
