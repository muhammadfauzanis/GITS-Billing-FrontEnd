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

const createContractSchema = (mode: 'add' | 'edit') =>
  z
    .object({
      clientId: z.coerce.number().nullable(),
      clientGwId: z.coerce.number().nullable(),
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
          z.string().email({ message: 'Invalid email address.' }).min(1, {
            message: 'Email cannot be empty.',
          })
        )
        .min(1, { message: 'At least one client email is required.' }),
    })
    .refine((data) => data.clientId !== null || data.clientGwId !== null, {
      message: 'Client must be selected.',
      path: ['clientName'],
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(mode === 'edit');

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

  const currentClients = contractType === 'gcp' ? clients : gwClients;

  const handleFileAnalysis = async (file: File) => {
    if (!file) return;

    const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_CONTRACT;
    if (!N8N_WEBHOOK_URL) {
      toast({
        title: 'Kesalahan Konfigurasi',
        description:
          'Fitur analisis otomatis belum diaktifkan. Silakan hubungi developer.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisCompleted(false);
    const bodyFormData = new FormData();
    bodyFormData.append('data', file);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: bodyFormData,
      });
      if (!response.ok) {
        throw new Error(
          `Server analisis merespons dengan error: ${response.statusText}`
        );
      }
      const result = await response.json();
      if (result.error) throw new Error(result.error);

      if (result.start_date)
        form.setValue('startDate', result.start_date, {
          shouldDirty: true,
          shouldValidate: true,
        });
      if (result.end_date)
        form.setValue('endDate', result.end_date, {
          shouldDirty: true,
          shouldValidate: true,
        });
      if (result.client_contact_emails?.length > 0)
        form.setValue('clientEmails', result.client_contact_emails, {
          shouldDirty: true,
          shouldValidate: true,
        });

      if (result.client_id && result.client_name) {
        form.setValue('clientName', result.client_name, {
          shouldValidate: true,
          shouldDirty: true,
        });
        if (contractType === 'gcp') {
          form.setValue('clientId', result.client_id, {
            shouldValidate: true,
            shouldDirty: true,
          });
          form.setValue('clientGwId', null, {
            shouldValidate: true,
            shouldDirty: true,
          });
        } else {
          form.setValue('clientGwId', result.client_id, {
            shouldValidate: true,
            shouldDirty: true,
          });
          form.setValue('clientId', null, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }

      await form.trigger();

      setAnalysisCompleted(true);
      toast({
        title: 'Analisis Berhasil',
        description: 'Form telah diisi otomatis. Silakan verifikasi data.',
      });
    } catch (error: any) {
      toast({
        title: 'Analisis Gagal',
        description: error.message || 'Gagal memproses dokumen.',
        variant: 'destructive',
      });
      setAnalysisCompleted(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const setupForm = async () => {
      setAnalysisCompleted(mode === 'edit');
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

          const normalizedClientId =
            details.client_id !== undefined && details.client_id !== null
              ? Number(details.client_id)
              : null;
          const normalizedClientGwId =
            details.client_gw_id !== undefined && details.client_gw_id !== null
              ? Number(details.client_gw_id)
              : null;

          const defaultData = {
            clientName: details.client_name,
            startDate: new Date(details.start_date).toISOString().split('T')[0],
            endDate: new Date(details.end_date).toISOString().split('T')[0],
            notes: details.notes || '',
            file: undefined,
            clientEmails,
            clientId: normalizedClientId,
            clientGwId: normalizedClientGwId,
          };
          form.reset(defaultData);
        } catch (error: any) {
          toast({
            title: 'Error',
            description: `Gagal mengambil detail kontrak: ${error.message}`,
            variant: 'destructive',
          });
          onOpenChange(false);
        } finally {
          setIsFetchingDetails(false);
        }
      } else {
        form.reset({
          clientId: null,
          clientGwId: null,
          clientName: '',
          startDate: '',
          endDate: '',
          notes: '',
          file: undefined,
          clientEmails: [''],
        });
      }
    };

    if (isOpen) {
      setupForm();
    }
  }, [isOpen, mode, initialData]);

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
        title: 'Sukses!',
        description: `Kontrak berhasil ${
          mode === 'add' ? 'dibuat' : 'diperbarui'
        }.`,
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

  const { isSubmitting, isDirty } = form.formState;
  const isFormDisabled = isAnalyzing || (mode === 'add' && !analysisCompleted);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit' : 'Upload'} {contractType.toUpperCase()}{' '}
            Contract
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Pilih file kontrak untuk memulai. Form akan diisi otomatis setelah analisis.'
              : 'Perbarui informasi kontrak.'}
          </DialogDescription>
        </DialogHeader>

        {isFetchingDetails ? (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-4"
            >
              {/* Input file */}
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {mode === 'edit'
                        ? 'Ganti File Kontrak (Opsional)'
                        : 'File Kontrak *'}
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          disabled={isAnalyzing}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            field.onChange(file);
                            if (file) {
                              handleFileAnalysis(file);
                            }
                          }}
                        />
                        {isAnalyzing && (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <fieldset disabled={isFormDisabled} className="space-y-4">
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
                          onChange={(selectedId) => {
                            const numericId = Number(selectedId);
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
                                form.setValue('clientGwId', null, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              } else {
                                form.setValue('clientGwId', numericId, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                                form.setValue('clientId', null, {
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
              </fieldset>

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
                  disabled={
                    isSubmitting ||
                    isAnalyzing ||
                    (mode === 'edit' && !isDirty) ||
                    (mode === 'add' && !analysisCompleted)
                  }
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
