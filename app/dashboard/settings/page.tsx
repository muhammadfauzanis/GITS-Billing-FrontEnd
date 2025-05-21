"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveChanges = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan akun dan preferensi notifikasi</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Akun</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Perbarui informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input id="client-id" defaultValue={user?.clientId} disabled />
                </div>
              </div>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>Perbarui password akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Ubah Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferensi Notifikasi</CardTitle>
              <CardDescription>Kelola preferensi notifikasi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="billing-alerts">Peringatan Billing</Label>
                    <p className="text-sm text-muted-foreground">
                      Dapatkan notifikasi saat penggunaan mendekati batas budget
                    </p>
                  </div>
                  <Switch id="billing-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="usage-reports">Laporan Penggunaan</Label>
                    <p className="text-sm text-muted-foreground">
                      Dapatkan laporan mingguan tentang penggunaan GCP Anda
                    </p>
                  </div>
                  <Switch id="usage-reports" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="invoice-notifications">Notifikasi Invoice</Label>
                    <p className="text-sm text-muted-foreground">Dapatkan notifikasi saat invoice baru tersedia</p>
                  </div>
                  <Switch id="invoice-notifications" defaultChecked />
                </div>
              </div>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Preferensi"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Billing</CardTitle>
              <CardDescription>Kelola pengaturan billing dan budget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Budget Bulanan (Rp)</Label>
                  <Input id="budget-amount" defaultValue="1,500,000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-threshold">Ambang Peringatan (%)</Label>
                  <Input id="budget-threshold" defaultValue="80" />
                </div>
              </div>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
