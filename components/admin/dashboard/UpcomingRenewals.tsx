'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/store/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function UpcomingRenewals() {
  const { upcomingRenewals, loading } = useAdminStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Renewals</CardTitle>
        <CardDescription>
          Contracts expiring in the next 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading.dashboard ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingRenewals.length > 0 ? (
                upcomingRenewals.map((contract) => (
                  <TableRow key={`${contract.type}-${contract.id}`}>
                    <TableCell className="font-medium">
                      {contract.client_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          contract.type === 'GCP' ? 'default' : 'secondary'
                        }
                      >
                        {contract.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(contract.end_date)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No contracts expiring soon.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 flex justify-end">
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href="/admin/contracts">View all contracts</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
