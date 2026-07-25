import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Penarikan } from '@/types'
import { PenarikanActions } from './PenarikanActions'

const statusConfig = {
  pending: { label: 'Menunggu', class: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Disetujui', class: 'bg-green-100 text-green-800' },
  rejected: { label: 'Ditolak', class: 'bg-red-100 text-red-800' },
}

export default async function AdminPenarikanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: penarikan } = await supabase
    .from('penarikan')
    .select('*, nasabah:profiles!nasabah_id(nama, email)')
    .order('created_at', { ascending: false })
    .returns<(Penarikan & { nasabah: { nama: string; email: string } | null })[]>()

  const pending = penarikan?.filter(p => p.status === 'pending').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request Penarikan</h2>
          <p className="text-gray-500 mt-1">Kelola permintaan penarikan saldo nasabah</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm font-medium text-yellow-700">{pending} menunggu</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Permintaan Penarikan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nasabah</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="hidden md:table-cell">Rekening</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penarikan?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-10">
                    Belum ada permintaan penarikan
                  </TableCell>
                </TableRow>
              )}
              {penarikan?.map((p) => {
                const status = statusConfig[p.status]
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{(p.nasabah as any)?.nama ?? '-'}</p>
                        <p className="text-xs text-gray-500">{(p.nasabah as any)?.email ?? '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-700">
                      {formatCurrency(p.jumlah)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm">{p.metode}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {p.metode === 'transfer' ? (
                        <div>
                          <p>{p.nama_bank}</p>
                          <p className="text-xs">{p.no_rekening}</p>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.class}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-gray-500 text-xs">
                      {formatDateTime(p.created_at)}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.status === 'pending' && <PenarikanActions penarikan={p} />}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
