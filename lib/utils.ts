import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  Client,
  ContractFormState,
  ContractStatus,
  GwClient,
  GwContractFormState,
} from './store/admin/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'Rp 0,00';
  }
  return `Rp ${value.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// --- PERUBAHAN DI SINI ---
export const contractFormToFormData = (
  formData: ContractFormState,
  clients: Client[]
): FormData => {
  const data = new FormData();
  const client = clients.find(
    (c) => c.name.toLowerCase() === formData.clientName.toLowerCase()
  );

  const clientIdToSend = client ? client.id.toString() : '0';

  data.append('client_id', clientIdToSend);
  if (!client) {
    data.append('client_name', formData.clientName);
  }

  data.append('start_date', formData.startDate);
  data.append('end_date', formData.endDate);
  data.append('notes', formData.notes || '');

  formData.clientEmails
    .filter((email) => email)
    .forEach((email) => data.append('client_contact_emails', email));
  if (formData.file) {
    data.append('file', formData.file);
  }
  return data;
};

export const getContractStatus = (endDate: string): ContractStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'active';
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const gwContractFormToFormData = (
  formData: GwContractFormState,
  clients: GwClient[]
): FormData => {
  const data = new FormData();

  // Client ID untuk GW
  if (formData.clientGwId) {
    data.append('client_gw_id', formData.clientGwId.toString());
  }

  data.append('start_date', formData.startDate);
  data.append('end_date', formData.endDate);
  data.append('notes', formData.notes || '');

  formData.clientEmails
    .filter((email) => email)
    .forEach((email) => data.append('client_contact_emails', email));

  if (formData.file) {
    data.append('file', formData.file);
  }
  return data;
};

export const formatMonthOnly = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString(
    'id-ID',
    {
      month: 'long',
    }
  );
};
