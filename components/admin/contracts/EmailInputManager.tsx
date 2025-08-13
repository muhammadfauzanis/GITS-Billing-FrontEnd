'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';

interface EmailInputManagerProps {
  label: string;
  emails: string[];
  setEmails: (emails: string[]) => void;
}

export const EmailInputManager: React.FC<EmailInputManagerProps> = ({
  label,
  emails,
  setEmails,
}) => {
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmailInput = () => setEmails([...emails, '']);
  const removeEmailInput = (index: number) =>
    setEmails(emails.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {emails.map((email, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              placeholder={
                label.includes('Client')
                  ? 'email@client.com'
                  : 'email@internal.com'
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeEmailInput(index)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEmailInput}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Email
        </Button>
      </div>
    </div>
  );
};
