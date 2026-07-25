import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPoin, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

export default async function UserRiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: transaksi, count } = await supabase
    .from('transaksi')
    .select('*, jenis_sampah:jenis_sampah(nama), operator:profiles!operator_id(nama)', { count: 'exact' })
    .eq('nasabah_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Setoran</h2>
        <p className="text-gray-500 mt-1">Semua riwayat setoran sampah Anda</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Riwayat Transaksi</CardTitle>
            <span className="text-sm text-gray-500">{count ?? 0} total setoran</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis Sampah</TableHead>
                <TableHead className="text-right">Berat</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Poin</TableHead>
                <TableHead className="hidden md:table-cell">Operator</TableHead>
                <TableHead className="hidden lg:table-cell">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaksi?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                    Belum ada riwayat setoran
                  </TableCell>
                </TableRow>
              )}
              {transaksi?.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.jenis_sampah?.nama ?? '-'}</TableCell>
                  <TableCell className="text-right">{t.berat} kg</TableCell>
                  <TableCell className="text-right font-medium text-green-700">
                    {formatCurrency(t.total_nilai)}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-blue-700">
                    +{formatPoin(t.total_poin)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-600 text-sm">
                    {t.operator?.nama ?? '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-500 text-xs">
                    {formatDateTime(t.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link href={`?page=${Math.max(1, page - 1)}`}>
            <Button variant="outline" size="sm" disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-sm text-gray-600">
            Halaman {page} dari {totalPages}
          </span>
          <Link href={`?page=${Math.min(totalPages, page + 1)}`}>
            <Button variant="outline" size="sm" disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
