'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { ClientCombobox } from './ClientCombobox';
import { EmailInputManager } from './EmailInputManager';
// FIX 1: Import path diperbarui dari './types' ke '@/lib/adminStore'
import { ContractFormState } from '@/lib/adminStore';
import type { Client } from '@/lib/adminStore';

interface ContractDialogProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (formData: ContractFormState) => Promise<void>;
  initialData?: ContractFormState | null;
  clients: Client[];
}

export const ContractDialog: React.FC<ContractDialogProps> = ({
  mode,
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  clients,
}) => {
  const [formData, setFormData] = useState<ContractFormState>({
    clientName: '',
    startDate: '',
    endDate: '',
    notes: '',
    file: null,
    clientEmails: [''],
    internalEmails: [''],
  });
  const [originalData, setOriginalData] = useState<ContractFormState | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(initialData);
      setOriginalData(initialData);
    } else {
      setFormData({
        clientName: '',
        startDate: '',
        endDate: '',
        notes: '',
        file: null,
        clientEmails: [''],
        internalEmails: [''],
      });
      setOriginalData(null);
    }
  }, [isOpen, initialData, mode]);

  const isFormChanged = useMemo(() => {
    if (mode !== 'edit' || !formData || !originalData) return false;
    // Penambahan file baru juga dianggap sebagai perubahan
    if (formData.file) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const isEditMode = mode === 'edit';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Contract' : 'Upload New Contract'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update contract information.'
              : 'Upload a new client contract.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            {/* FIX 2: Menambahkan tipe eksplisit untuk parameter 'prev' */}
            <ClientCombobox
              clients={clients}
              value={formData.clientName}
              onChange={(value) =>
                setFormData((prev: ContractFormState) => ({
                  ...prev,
                  clientName: value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">
              {isEditMode ? 'New Contract File (Optional)' : 'Contract File'}
            </Label>
            <Input
              id="file"
              type="file"
              onChange={(e) =>
                setFormData((prev: ContractFormState) => ({
                  ...prev,
                  file: e.target.files?.[0] || null,
                }))
              }
              required={!isEditMode}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev: ContractFormState) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev: ContractFormState) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev: ContractFormState) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              rows={3}
            />
          </div>
          <EmailInputManager
            label="Client Emails"
            emails={formData.clientEmails}
            setEmails={(emails) =>
              setFormData((prev: ContractFormState) => ({
                ...prev,
                clientEmails: emails,
              }))
            }
          />
          <EmailInputManager
            label="Internal Emails"
            emails={formData.internalEmails}
            setEmails={(emails) =>
              setFormData((prev: ContractFormState) => ({
                ...prev,
                internalEmails: emails,
              }))
            }
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || (isEditMode && !isFormChanged)}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Contract' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
