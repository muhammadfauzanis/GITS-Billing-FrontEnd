'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, AlertCircle } from 'lucide-react';
import {
  getInternalEmails,
  addInternalEmail,
  deleteInternalEmail,
} from '@/lib/api/admin';

export function EmailInputBox() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const emailList = await getInternalEmails();
      setEmails(emailList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsAdding(true);
    try {
      await addInternalEmail(newEmail);
      toast({
        title: 'Success',
        description: 'Internal email has been added.',
      });
      setNewEmail('');
      await fetchEmails();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteEmail = async (emailToDelete: string) => {
    setDeletingEmail(emailToDelete);
    try {
      await deleteInternalEmail(emailToDelete);
      toast({
        title: 'Success',
        description: 'Internal email has been deleted.',
      });
      setEmails((prevEmails) =>
        prevEmails.filter((email) => email !== emailToDelete)
      );
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setDeletingEmail(null);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAddEmail} className="flex items-end gap-2">
        <div className="flex-grow space-y-1">
          <Label htmlFor="new-email" className="sr-only">
            Add New Email
          </Label>
          <Input
            id="new-email"
            type="email"
            placeholder="email.internal@gits.id"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={isAdding}
          />
        </div>
        <Button type="submit" disabled={isAdding || !newEmail.trim()}>
          {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add
        </Button>
      </form>

      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Registered Emails
        </h3>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : emails.length > 0 ? (
          <div className="rounded-md border max-h-48 overflow-y-auto">
            {emails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-3 border-b last:border-b-0"
              >
                <span className="text-sm">{email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteEmail(email)}
                  disabled={deletingEmail === email}
                  className="h-8 w-8"
                >
                  {deletingEmail === email ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-center text-muted-foreground py-4 border rounded-md">
            No internal emails have been added yet.
          </div>
        )}
      </div>
    </div>
  );
}
