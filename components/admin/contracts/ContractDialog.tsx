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

const EMPTY_FORM: ContractFormState = {
  clientId: null,
  clientName: '',
  startDate: '',
  endDate: '',
  notes: '',
  file: null,
  clientEmails: [''],
  internalEmails: [''],
};

export const ContractDialog: React.FC<ContractDialogProps> = ({
  mode,
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  clients,
}) => {
  const [formData, setFormData] = useState<ContractFormState>(EMPTY_FORM);
  const [originalData, setOriginalData] = useState<ContractFormState | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData(initialData);
      setOriginalData(initialData);
    } else {
      setFormData(EMPTY_FORM);
      setOriginalData(null);
    }
  }, [isOpen, initialData, mode]);

  const isFormChanged = useMemo(() => {
    if (mode !== 'edit' || !formData || !originalData) return false;
    if (formData.file) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const isSubmitDisabled =
    isSubmitting || (mode === 'edit' && !isFormChanged) || !formData.clientId;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Contract' : 'Upload New Contract'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update contract information.'
              : 'Upload a new client contract.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <ClientCombobox
              clients={clients}
              value={{ id: formData.clientId, name: formData.clientName }}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  clientId: value.id,
                  clientName: value.name,
                }))
              }
            />
          </div>
          {/* ... sisa form tidak berubah ... */}
          <div className="space-y-2">
            <Label htmlFor="file">
              {mode === 'edit'
                ? 'New Contract File (Optional)'
                : 'Contract File'}
            </Label>
            <Input
              id="file"
              type="file"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  file: e.target.files?.[0] || null,
                }))
              }
              required={mode !== 'edit'}
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
                  setFormData((prev) => ({
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
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
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
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>
          <EmailInputManager
            label="Client Emails"
            emails={formData.clientEmails}
            setEmails={(emails) =>
              setFormData((prev) => ({ ...prev, clientEmails: emails }))
            }
          />
          <EmailInputManager
            label="Internal Emails"
            emails={formData.internalEmails}
            setEmails={(emails) =>
              setFormData((prev) => ({ ...prev, internalEmails: emails }))
            }
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === 'edit' ? 'Update Contract' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
