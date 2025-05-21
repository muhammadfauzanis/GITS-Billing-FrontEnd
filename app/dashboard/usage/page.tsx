"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { BillingUsageChart } from "@/components/billing-usage-chart"
import { BillingServiceBreakdown } from "@/components/billing-service-breakdown"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for development without API
const mockMonthlyUsage = {
  data: [
    {
      id: "Compute Engine",
      name: "Compute Engine",
      months: {
        "Mei 2025": 31456864.254132006,
        "April 2025": 66790559.38494999,
        "Maret 2025": 66231992.57080698,
        "Februari 2025": 58142873.741754,
        "Januari 2025": 0,
        "Desember 2024": 0,
      },
    },
    {
      id: "Cloud SQL",
      name: "Cloud SQL",
      months: {
        "Mei 2025": 2604090.8672660002,
        "April 2025": 8971159.992072005,
        "Maret 2025": 10086580.828782003,
        "Februari 2025": 9180253.950640006,
        "Januari 2025": 0,
        "Desember 2024": 0,
      },
    },
    {
      id: "Cloud Data Fusion",
      name: "Cloud Data Fusion",
      months: {
        "Mei 2025": 1904835.8358900005,
        "April 2025": 4195399.745933,
        "Maret 2025": 4253855.710645,
        "Februari 2025": 3807094.2515530013,
        "Januari 2025": 0,
        "Desember 2024": 0,
      },
    },
  ],
  months: ["Mei 2025", "April 2025", "Maret 2025", "Februari 2025", "Januari 2025", "Desember 2024"],
}

const mockServiceBreakdown = [
  { service: "Compute Engine", value: "Rp 31.456.864,25", rawValue: 31456864.254132006 },
  { service: "Cloud SQL", value: "Rp 2.604.090,87", rawValue: 2604090.8672660002 },
  { service: "Cloud Data Fusion", value: "Rp 1.904.835,84", rawValue: 1904835.8358900005 },
  { service: "Networking", value: "Rp 1.538.248,43", rawValue: 1538248.430035 },
  { service: "Cloud Filestore", value: "Rp 1.428.366,1", rawValue: 1428366.0970089994 },
  { service: "Cloud Monitoring", value: "Rp 593.707,03", rawValue: 593707.0340140002 },
]

export default function UsagePage() {
  const [monthlyUsage, setMonthlyUsage] = useState<any>(null)
  const [serviceBreakdown, setServiceBreakdown] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [groupBy, setGroupBy] = useState<"service" | "project">("service")
  const [timeRange, setTimeRange] = useState<string>("6")

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // COMMENT: Uncomment the API calls when ready to connect to backend
        /*
        const [usageResponse, breakdownResponse] = await Promise.all([
          getMonthlyUsage(groupBy, Number.parseInt(timeRange)),
          getOverallServiceBreakdown(selectedMonth, selectedYear),
        ])

        setMonthlyUsage(usageResponse)
        setServiceBreakdown(breakdownResponse)
        */

        // TEMPORARY: Use mock data
        setMonthlyUsage(mockMonthlyUsage)
        setServiceBreakdown(mockServiceBreakdown)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (err: any) {
        console.error("Error fetching usage data:", err)
        setError(err.message || "Gagal memuat data penggunaan")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageData()
  }, [selectedMonth, selectedYear, groupBy, timeRange])

  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number.parseInt(value))
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(Number.parseInt(value))
  }

  const handleGroupByChange = (value: string) => {
    setGroupBy(value as "service" | "project")
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ]

  const years = [
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ]

  if (isLoading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penggunaan GCP</h1>
          <p className="text-muted-foreground">Detail penggunaan layanan Google Cloud Platform</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="compute">Compute</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Select value={groupBy} onValueChange={handleGroupByChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kelompokkan berdasarkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Layanan</SelectItem>
                  <SelectItem value="project">Proyek</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rentang waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 bulan</SelectItem>
                  <SelectItem value="6">6 bulan</SelectItem>
                  <SelectItem value="12">12 bulan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tren Penggunaan</CardTitle>
              <CardDescription>
                Penggunaan GCP selama {timeRange} bulan terakhir berdasarkan{" "}
                {groupBy === "service" ? "layanan" : "proyek"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyUsage ? (
                <BillingUsageChart data={monthlyUsage} />
              ) : (
                <div className="flex h-[300px] items-center justify-center">Tidak ada data tersedia</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown Layanan</CardTitle>
              <CardDescription>
                Biaya per layanan GCP untuk bulan {months.find((m) => m.value === selectedMonth.toString())?.label}{" "}
                {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serviceBreakdown && serviceBreakdown.length > 0 ? (
                <BillingServiceBreakdown data={serviceBreakdown} />
              ) : (
                <div className="flex h-[300px] items-center justify-center">Tidak ada data tersedia</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compute" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Penggunaan Compute Engine</CardTitle>
              <CardDescription>Detail penggunaan layanan komputasi</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detail penggunaan Compute Engine akan ditampilkan di sini.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Penggunaan Storage</CardTitle>
              <CardDescription>Detail penggunaan layanan penyimpanan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Detail penggunaan Storage akan ditampilkan di sini.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Penggunaan Database</CardTitle>
              <CardDescription>Detail penggunaan layanan database</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Detail penggunaan Database akan ditampilkan di sini.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networking" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Penggunaan Networking</CardTitle>
              <CardDescription>Detail penggunaan layanan jaringan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Detail penggunaan Networking akan ditampilkan di sini.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
