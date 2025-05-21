"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { BillingServiceBreakdown } from "@/components/billing-service-breakdown"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for development without API
const mockProjectData = {
  breakdown: [
    { service: "Compute Engine", value: "Rp 3.917.461,65", rawValue: 3917461.6522520026 },
    { service: "Cloud Data Fusion", value: "Rp 1.904.835,84", rawValue: 1904835.8358900005 },
    { service: "Cloud Monitoring", value: "Rp 215.181,83", rawValue: 215181.83332200005 },
    { service: "BigQuery", value: "Rp 185.177,07", rawValue: 185177.07164099996 },
    { service: "Dataplex", value: "Rp 116.946,67", rawValue: 116946.666474 },
    { service: "Cloud Storage", value: "Rp 58.089,56", rawValue: 58089.56221400002 },
    { service: "Artifact Registry", value: "Rp 260,74", rawValue: 260.738464 },
    { service: "Cloud Run Functions", value: "Rp 0,62", rawValue: 0.6181399999999718 },
    { service: "Cloud Scheduler", value: "Rp 0", rawValue: 0 },
    { service: "Networking", value: "Rp 0", rawValue: 0 },
    { service: "Cloud Logging", value: "-Rp 0", rawValue: -1.6940658945086007e-21 },
  ],
  total: {
    value: "Rp 6.397.953,98",
    rawValue: 6397953.978397002,
  },
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [projectData, setProjectData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // COMMENT: Uncomment the API calls when ready to connect to backend
        /*
        const breakdownData = await getProjectBreakdown(id as string, selectedMonth, selectedYear)
        setProjectData(breakdownData)
        */

        // TEMPORARY: Use mock data
        setProjectData(mockProjectData)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (err: any) {
        console.error("Error fetching project data:", err)
        setError(err.message || "Gagal memuat data proyek")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProjectData()
    }
  }, [id, selectedMonth, selectedYear])

  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number.parseInt(value))
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(Number.parseInt(value))
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detail Proyek: {id}</h1>
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
          <TabsTrigger value="details">Detail Biaya</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Biaya</CardTitle>
              <CardDescription>
                Total biaya untuk bulan {months.find((m) => m.value === selectedMonth.toString())?.label} {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{projectData?.total?.value || "Rp 0"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown Layanan</CardTitle>
              <CardDescription>Biaya per layanan GCP</CardDescription>
            </CardHeader>
            <CardContent>
              {projectData?.breakdown && projectData.breakdown.length > 0 ? (
                <BillingServiceBreakdown data={projectData.breakdown} />
              ) : (
                <div className="flex h-[300px] items-center justify-center">Tidak ada data tersedia</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Biaya</CardTitle>
              <CardDescription>Detail biaya per layanan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Detail biaya akan ditampilkan di sini.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
