"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Building } from "lucide-react"

// PLACEHOLDER: Mock clients data (same as in create-user page)
const mockClients = [
  { id: 13, name: "atur kuliner - GITS Indonesia" },
  { id: 8, name: "BahanaTCW - GITS Indonesia" },
  { id: 15, name: "Billing Account for gits.id" },
  { id: 4, name: "CV Sinar Baja Elektric Co.Ltd - GITS Indonesia" },
  { id: 7, name: "Danpac Pharma - GITS Indonesia" },
  { id: 26, name: "DIGITS.ID - GITS Indonesia" },
  { id: 11, name: "Fast 8 - GITS Indonesia" },
  { id: 6, name: "GITS Development - GITS Indonesia" },
  { id: 23, name: "GITS GCP Billing 1" },
  { id: 20, name: "Hydac Indonesia - GITS Indonesia" },
  { id: 27, name: "Marugo Rubber Indonesia - GITS Indonesia" },
  { id: 16, name: "Mineral Langgeng Megatama (IKN) - GITS Indonesia," },
  { id: 25, name: "Nutricell - GITS Indonesia" },
  { id: 3, name: "Pertamina - GITS Indonesia" },
  { id: 10, name: "PT Blockchain - Collanium - GITS Indonesia" },
  { id: 22, name: "PT Blockchain - otonomiq - GITS Indonesia" },
  { id: 19, name: "PT BPR Sejahtera Artha Sembada - GITS Indonesia" },
  { id: 12, name: "PT Dhasatra MoneyTransfer - GITS Indonesia" },
  { id: 18, name: "PT Global Jasa Sejahtera (MNC Land) - GITS Indonesia" },
  { id: 1, name: "PT. PHOENIX SOLUSI INDONESIA - GITS Indonesia" },
  { id: 24, name: "PT Ritel Teknologi Pintar (Danpac Mart)- GITS Indonesia" },
  { id: 5, name: "Pusdatin Kemdikbud - GITS Indonesia" },
  { id: 17, name: "Sadewa Technology - Metro - GITS Indonesia" },
  { id: 2, name: "Sadewa Technology - TransIce - GITS Indonesia" },
  { id: 9, name: "SANF - GITS Indonesia" },
  { id: 21, name: "Voucher JR - GITS Indonesia" },
  { id: 14, name: "Voucher PT.Alnair Inovasi Solusindo - GITS Indonesia" },
]

export default function ClientsPage() {
  const [clients] = useState(mockClients)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Clients</h1>
          <p className="text-muted-foreground">Daftar semua client yang terdaftar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Daftar Clients
          </CardTitle>
          <CardDescription>Semua client yang terdaftar dalam sistem (Placeholder Data)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Cari client..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Client</TableHead>
                  <TableHead className="text-right">Total Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.id}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-gray-500">{Math.floor(Math.random() * 5) + 1} users</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Tidak ada client yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-3 bg-orange-50 rounded-md">
            <p className="text-sm text-orange-600">
              <strong>Note:</strong> Data ini adalah placeholder. Integrasi dengan API akan ditambahkan nanti.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
