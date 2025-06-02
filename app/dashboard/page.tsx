'use client';

import { useEffect, useState, useCallback } from 'react';
import { BillingOverview } from '@/components/billing-overview';
import { ClientSelector } from '@/components/ClientSelector';
import { useAuth } from '@/lib/auth';
import {
  getBillingSummary,
  getOverallServiceBreakdown,
  getMonthlyUsage,
  getClientProjects,
  getAllProjectBreakdown,
  getClientName,
  getClients,
} from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ProjectsList } from '@/components/projects-list';
import { BillingProjectBreakdown } from '@/components/billing-project-breakdown';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';

export default function DashboardPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    undefined
  );
  const [currentClientIdForData, setCurrentClientIdForData] = useState<
    string | undefined
  >(undefined);

  const [summaryData, setSummaryData] = useState<any>(null);
  const [serviceBreakdown, setServiceBreakdown] = useState<any[]>([]);
  const [projectBreakdownData, setProjectBreakdownData] = useState<any>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsLoadingClients(true);
      getClients()
        .then((res) => {
          setClients(res.clients || []);
        })
        .catch((err) => {
          console.error('Failed to load client list:', err);
          setError('Gagal memuat daftar client.');
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoadingClients(false);
        });
    } else if (user && user.role !== 'admin') {
      setSelectedClientId(user.clientId);
      setCurrentClientIdForData(user.clientId);
    } else if (!user) {
      setIsLoading(false);
    }
  }, [user]);

  const handleClientChangeByAdmin = useCallback(
    (newClientId: string) => {
      setSelectedClientId(newClientId);
      setCurrentClientIdForData(newClientId);
      const selectedClientDetail = clients.find(
        (c) => c.id.toString() === newClientId
      );
      if (selectedClientDetail) {
        setClientName(selectedClientDetail.name);
      } else {
        setClientName('');
      }
    },
    [clients]
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      const clientIdToFetch =
        user?.role === 'admin' ? currentClientIdForData : user?.clientId;

      if (!clientIdToFetch) {
        if (user?.role === 'admin') {
          setSummaryData(null);
          setServiceBreakdown([]);
          setMonthlyUsage(null);
          setProjects([]);
          setProjectBreakdownData(null);
          setClientName('');
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      if (user?.role === 'admin') {
        const clientFromList = clients.find(
          (c) => c.id.toString() === clientIdToFetch
        );
        if (clientFromList && clientName !== clientFromList.name) {
          setClientName(clientFromList.name);
        }
      }

      try {
        const apiCalls: Promise<any>[] = [
          getBillingSummary(clientIdToFetch),
          getOverallServiceBreakdown(
            currentMonth,
            currentYear,
            clientIdToFetch
          ),
          getMonthlyUsage('service', 6, clientIdToFetch),
          getClientProjects(clientIdToFetch),
          getAllProjectBreakdown(currentMonth, currentYear, clientIdToFetch),
        ];

        let shouldFetchClientNameSeparately = user?.role !== 'admin';
        if (user?.role === 'admin') {
          const clientFromList = clients.find(
            (c) => c.id.toString() === clientIdToFetch
          );
          if (!clientFromList || clientName !== clientFromList.name) {
            shouldFetchClientNameSeparately = true;
          }
        }

        if (shouldFetchClientNameSeparately) {
          apiCalls.push(getClientName(clientIdToFetch));
        }

        const responses = await Promise.all(apiCalls);

        setSummaryData(responses[0]);
        setServiceBreakdown(responses[1]);
        setMonthlyUsage(responses[2]);
        setProjects(responses[3]?.projects || []);
        setProjectBreakdownData(responses[4]);

        if (shouldFetchClientNameSeparately) {
          const clientNameResponse = responses[5];
          if (
            clientNameResponse &&
            typeof clientNameResponse.name !== 'undefined'
          ) {
            setClientName(clientNameResponse.name);
          } else if (user?.role !== 'admin') {
            setClientName('');
          }
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Gagal memuat data dashboard.');
        setSummaryData(null);
        setServiceBreakdown([]);
        setMonthlyUsage(null);
        setProjects([]);
        setProjectBreakdownData(null);
        setClientName('');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !isLoadingClients) {
      if (
        (user.role === 'admin' && currentClientIdForData) ||
        (user.role !== 'admin' && user.clientId)
      ) {
        fetchDashboardData();
      } else if (user.role === 'admin' && !currentClientIdForData) {
        setSummaryData(null);
        setServiceBreakdown([]);
        setMonthlyUsage(null);
        setProjects([]);
        setProjectBreakdownData(null);
        setClientName('');
        setIsLoading(false);
      }
    } else if (!user) {
      setIsLoading(false);
    }
  }, [
    user,
    currentClientIdForData,
    currentMonth,
    currentYear,
    clients,
    isLoadingClients,
    clientName,
    handleClientChangeByAdmin,
  ]);

  if (!user && !isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        Sesi tidak ditemukan atau belum login.
      </div>
    );
  }

  if (
    isLoading ||
    (user?.role === 'admin' &&
      isLoadingClients &&
      clients.length === 0 &&
      !currentClientIdForData)
  ) {
    let loadingMessage = 'Memuat data...';
    if (user?.role === 'admin' && isLoadingClients && clients.length === 0) {
      loadingMessage = 'Memuat daftar client...';
    }
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        {loadingMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Billing
          </h1>
          {clientName && (
            <h3
              className={`text-lg font-semibold ${
                user?.role === 'admin' && currentClientIdForData
                  ? 'text-blue-600'
                  : ''
              }`}
            >
              {user?.role === 'admin' && currentClientIdForData
                ? `Menampilkan data untuk: ${clientName}`
                : user?.role !== 'admin'
                ? clientName
                : ''}
            </h3>
          )}
          <p className="text-muted-foreground">
            Ringkasan penggunaan dan biaya GCP Anda
          </p>
        </div>
        {user?.role === 'admin' && !isLoadingClients && clients.length > 0 && (
          <div className="w-full min-w-[250px] md:w-auto">
            <ClientSelector
              selectedClientId={selectedClientId}
              onClientChange={handleClientChangeByAdmin}
            />
          </div>
        )}
        {user?.role === 'admin' &&
          !isLoadingClients &&
          clients.length === 0 &&
          !error && (
            <p className="text-sm text-muted-foreground">
              Tidak ada client yang tersedia untuk dipilih.
            </p>
          )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {user?.role === 'admin' &&
        !currentClientIdForData &&
        !isLoading &&
        !error && (
          <Alert
            variant="default"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            <AlertCircle className="h-4 w-4 !text-blue-700" />
            <AlertTitle>Pilih Client</AlertTitle>
            <AlertDescription>
              Silakan pilih client dari dropdown di atas untuk melihat data
              billing.
            </AlertDescription>
          </Alert>
        )}

      {!isLoading && !error && currentClientIdForData && (
        <>
          {summaryData ? (
            <BillingOverview data={summaryData} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Billing</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Data ringkasan tidak tersedia untuk client ini.</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="overflow-hidden border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Top 5 Project</CardTitle>
                <CardDescription>
                  Biaya 5 project teratas bulan ini
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[450px]">
                {projectBreakdownData?.breakdown &&
                projectBreakdownData.breakdown.length > 0 ? (
                  <BillingProjectBreakdown
                    data={projectBreakdownData}
                    showSearch={false}
                    showAll={false}
                  />
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    Tidak ada data project breakdown tersedia.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Breakdown Layanan</CardTitle>
                <CardDescription>Biaya per layanan GCP</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceBreakdown && serviceBreakdown.length > 0 ? (
                  <BillingServiceBreakdown data={serviceBreakdown} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    Tidak ada data breakdown layanan tersedia.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Proyek GCP</CardTitle>
              <CardDescription>
                Daftar proyek GCP yang terhubung
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <ProjectsList projects={projects} />
              ) : (
                <div className="flex h-[100px] items-center justify-center">
                  Tidak ada proyek tersedia untuk client ini.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
