// "use client"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Download, Eye, FileText } from "lucide-react"

// export default function InvoicesPage() {
//   // Mock data - would come from API in real implementation
//   const invoices = [
//     {
//       id: "INV-001",
//       date: "01 Mar 2023",
//       amount: "1,250,000",
//       status: "Lunas",
//       dueDate: "15 Mar 2023",
//     },
//     {
//       id: "INV-002",
//       date: "01 Apr 2023",
//       amount: "1,100,500",
//       status: "Lunas",
//       dueDate: "15 Apr 2023",
//     },
//     {
//       id: "INV-003",
//       date: "01 May 2023",
//       amount: "1,350,250",
//       status: "Lunas",
//       dueDate: "15 May 2023",
//     },
//     {
//       id: "INV-004",
//       date: "01 Jun 2023",
//       amount: "1,420,750",
//       status: "Lunas",
//       dueDate: "15 Jun 2023",
//     },
//     {
//       id: "INV-005",
//       date: "01 Jul 2023",
//       amount: "1,250,750",
//       status: "Belum Lunas",
//       dueDate: "15 Jul 2023",
//     },
//   ]

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Tagihan</h1>
//           <p className="text-muted-foreground">Riwayat tagihan penggunaan GCP Anda</p>
//         </div>
//         <Button>
//           <Download className="mr-2 h-4 w-4" />
//           Ekspor
//         </Button>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Riwayat Tagihan</CardTitle>
//           <CardDescription>Daftar tagihan penggunaan GCP Anda</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>No. Invoice</TableHead>
//                 <TableHead>Tanggal</TableHead>
//                 <TableHead>Jatuh Tempo</TableHead>
//                 <TableHead>Jumlah</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Aksi</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {invoices.map((invoice) => (
//                 <TableRow key={invoice.id}>
//                   <TableCell className="font-medium">{invoice.id}</TableCell>
//                   <TableCell>{invoice.date}</TableCell>
//                   <TableCell>{invoice.dueDate}</TableCell>
//                   <TableCell>Rp {invoice.amount}</TableCell>
//                   <TableCell>
//                     <div
//                       className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
//                         invoice.status === "Lunas" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {invoice.status}
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-2">
//                       <Button variant="ghost" size="icon">
//                         <Eye className="h-4 w-4" />
//                         <span className="sr-only">Lihat</span>
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <FileText className="h-4 w-4" />
//                         <span className="sr-only">Detail</span>
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Download className="h-4 w-4" />
//                         <span className="sr-only">Unduh</span>
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
