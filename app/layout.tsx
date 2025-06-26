import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/client-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GCP Billing Dashboard',
  description: 'Dashboard untuk melihat billing GCP',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
