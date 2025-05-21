"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Bell, Info } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - would come from API in real implementation
const alertsData = [
  {
    id: 1,
    title: "Budget mendekati batas",
    description: "Penggunaan Anda telah mencapai 85% dari budget bulanan",
    type: "warning",
    date: "2 hari yang lalu",
  },
  {
    id: 2,
    title: "Peningkatan penggunaan Compute Engine",
    description: "Penggunaan Compute Engine meningkat 30% dibandingkan rata-rata minggu lalu",
    type: "info",
    date: "5 hari yang lalu",
  },
  {
    id: 3,
    title: "Rekomendasi optimasi",
    description: "Anda dapat menghemat hingga Rp 200.000 dengan menyesuaikan instance Compute Engine",
    type: "info",
    date: "1 minggu yang lalu",
  },
]

export function BillingAlerts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Peringatan & Notifikasi</CardTitle>
          <CardDescription>Peringatan terkait penggunaan dan billing GCP Anda</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <Bell className="h-4 w-4" />
          Kelola Peringatan
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alertsData.map((alert) => (
            <div key={alert.id} className="flex items-start gap-4 rounded-lg border p-4">
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1",
                  alert.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600",
                )}
              >
                {alert.type === "warning" ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{alert.title}</p>
                  <Badge variant={alert.type === "warning" ? "destructive" : "secondary"}>
                    {alert.type === "warning" ? "Peringatan" : "Info"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground">{alert.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
