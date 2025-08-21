'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Contract, GwContract } from '@/lib/store/admin/types';
import { useAdminStore } from '@/lib/store/admin/index';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getContractDetails, getGwContractDetails } from '@/lib/api/admin';
import { ClientCombobox } from './ClientCombobox';
import { EmailInputManager } from './EmailInputManager';

type ContractType = 'gcp' | 'gw';

interface ContractDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: 'add' | 'edit';
  contractType: ContractType;
  initialData?: Contract | GwContract | null;
  onSuccess: () => void;
}

// Skema Validasi menggunakan Zod
const createContractSchema = (mode: 'add' | 'edit') =>
  z
    .object({
      clientId: z.number().nullable(),
      clientGwId: z.number().nullable(),
      clientName: z.string().min(1, { message: 'Client name is required.' }),
      startDate: z.string().min(1, { message: 'Start date is required.' }),
      endDate: z.string().min(1, { message: 'End date is required.' }),
      notes: z.string().optional(),
      file: z
        .any()
        .refine((file) => (mode === 'add' ? file instanceof File : true), {
          message: 'Contract file is required.',
        }),
      clientEmails: z
        .array(
          z
            .string()
            .email({ message: 'Invalid email address.' })
            .min(1, { message: 'Email cannot be empty.' })
        )
        .min(1, { message: 'At least one client email is required.' }),
    })
    .refine((data) => data.clientId !== null || data.clientGwId !== null, {
      message: 'Client must be selected.',
      path: ['clientName'], // Error akan muncul di field clientName
    });

export const ContractDialog: React.FC<ContractDialogProps> = ({
  isOpen,
  onOpenChange,
  mode,
  contractType,
  initialData,
  onSuccess,
}) => {
  const {
    clients,
    gwClients,
    addContract,
    editContract,
    addGwContract,
    editGwContract,
  } = useAdminStore();
  const { toast } = useToast();

  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Inisialisasi React Hook Form
  const formSchema = createContractSchema(mode);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: null,
      clientGwId: null,
      clientName: '',
      startDate: '',
      endDate: '',
      notes: '',
      file: undefined,
      clientEmails: [''],
    },
  });

  useEffect(() => {
    const fetchDetailsAndSetForm = async () => {
      if (mode === 'edit' && initialData?.id) {
        setIsFetchingDetails(true);
        try {
          const details =
            contractType === 'gcp'
              ? await getContractDetails(initialData.id)
              : await getGwContractDetails(initialData.id);

          const clientEmails =
            details.client_contact_emails?.length > 0
              ? details.client_contact_emails
              : [''];
          const defaultData = {
            clientName: details.client_name,
            startDate: new Date(details.start_date).toISOString().split('T')[0],
            endDate: new Date(details.end_date).toISOString().split('T')[0],
            notes: details.notes || '',
            file: undefined, // file tidak di-fetch
            clientEmails: clientEmails,
            clientId: (details as any).client_id,
            clientGwId: (details as any).client_gw_id,
          };

          form.reset(defaultData); // Gunakan reset untuk mengisi form
        } catch (error: any) {
          toast({
            title: 'Error',
            description: `Failed to fetch contract details: ${error.message}`,
            variant: 'destructive',
          });
          onOpenChange(false);
        } finally {
          setIsFetchingDetails(false);
        }
      } else {
        form.reset(); // Reset ke default values jika mode 'add'
      }
    };

    if (isOpen) {
      fetchDetailsAndSetForm();
    }
  }, [isOpen, mode, initialData, contractType, form, toast, onOpenChange]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (contractType === 'gcp') {
        if (mode === 'add') await addContract(values as any);
        else await editContract(initialData!.id, values as any);
      } else {
        if (mode === 'add') await addGwContract(values as any);
        else await editGwContract(initialData!.id, values as any);
      }
      toast({
        title: 'Success',
        description: `Contract ${mode === 'add' ? 'created' : 'updated'}.`,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const currentClients = contractType === 'gcp' ? clients : gwClients;
  const { isSubmitting, isDirty } = form.formState;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit' : 'Upload'} {contractType.toUpperCase()}{' '}
            Contract
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the contract information.'
              : 'Upload a new client contract.'}
          </DialogDescription>
        </DialogHeader>

        {isFetchingDetails ? (
          <div className="space-y-4 pt-4">
            {/* Skeleton Loader */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <ClientCombobox
                        clients={currentClients}
                        value={
                          contractType === 'gcp'
                            ? form.getValues('clientId')
                            : form.getValues('clientGwId')
                        }
                        onChange={(clientId) => {
                          const numericId = Number(clientId);
                          const client = currentClients.find(
                            (c) => c.id === numericId
                          );
                          if (client) {
                            form.setValue('clientName', client.name, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            if (contractType === 'gcp') {
                              form.setValue('clientId', numericId, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            } else {
                              form.setValue('clientGwId', numericId, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {mode === 'edit'
                        ? 'New Contract File (Optional)'
                        : 'Contract File'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientEmails"
                render={({ field }) => (
                  <FormItem>
                    <EmailInputManager
                      label="Client Emails"
                      emails={field.value}
                      setEmails={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (mode === 'edit' && !isDirty)}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === 'edit' ? 'Update Contract' : 'Submit'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
