'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle, Calendar, Users } from 'lucide-react';
import { Contract, ContractStatus } from '@/lib/adminStore';

const getContractStatus = (endDate: string): ContractStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'active';
};

const getContractStats = (contracts: Contract[]) => {
  const expiringContracts = contracts.filter(
    (c) => getContractStatus(c.endDate) === 'expiring_soon'
  );
  const activeContracts = contracts.filter(
    (c) => getContractStatus(c.endDate) === 'active'
  );
  const uniqueExpiringClients = new Set(
    expiringContracts.map((c) => c.clientName)
  ).size;
  return {
    total: contracts.length,
    expiring: expiringContracts.length,
    active: activeContracts.length,
    clientsExpiringSoon: uniqueExpiringClients,
  };
};

export const ContractStatsCards: React.FC<{ contracts: Contract[] }> = ({
  contracts,
}) => {
  const stats = useMemo(() => getContractStats(contracts), [contracts]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            All registered contracts
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.expiring}
          </div>
          <p className="text-xs text-muted-foreground">
            Expires within 30 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Contracts
          </CardTitle>
          <Calendar className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
          <p className="text-xs text-muted-foreground">
            Valid and ongoing contracts
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Clients Expiring Soon
          </CardTitle>
          <Users className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.clientsExpiringSoon}
          </div>
          <p className="text-xs text-muted-foreground">
            Unique clients expiring soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
