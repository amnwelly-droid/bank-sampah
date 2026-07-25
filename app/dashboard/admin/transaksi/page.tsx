import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatNumber, formatPoin, formatDateTime } from '@/lib/utils'
import { TransaksiFilter } from './TransaksiFilter'

export default async function AdminTransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; jenis?: string; from?: string; to?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams

  let query = supabase
    .from('transaksi')
    .select('*, nasabah:profiles!nasabah_id(nama), operator:profiles!operator_id(nama), jenis_sampah:jenis_sampah(nama)')
    .order('created_at', { ascending: false })

  if (params.jenis) query = query.eq('jenis_sampah_id', params.jenis)
  if (params.from) query = query.gte('created_at', params.from)
  if (params.to) query = query.lte('created_at', params.to + 'T23:59:59')

  const { data: transaksi } = await query.limit(100)

  const filtered = params.q
    ? transaksi?.filter((t: any) =>
        t.nasabah?.nama?.toLowerCase().includes(params.q!.toLowerCase())
      )
    : transaksi

  const { data: jenisList } = await supabase.from('jenis_sampah').select('id, nama').eq('aktif', true)

  const totalNilai = filtered?.reduce((sum: number, t: any) => sum + Number(t.total_nilai), 0) ?? 0
  const totalBerat = filtered?.reduce((sum: number, t: any) => sum + Number(t.berat), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Semua Transaksi</h2>
        <p className="text-gray-500 mt-1">Riwayat seluruh transaksi setoran sampah</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{filtered?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total Transaksi</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalNilai)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Nilai</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{formatNumber(Math.round(totalBerat * 100) / 100)} kg</p>
          <p className="text-xs text-gray-500 mt-1">Total Berat</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-base">Daftar Transaksi</CardTitle>
            <TransaksiFilter jenisList={jenisList ?? []} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nasabah</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Jenis Sampah</TableHead>
                <TableHead className="text-right">Berat</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Poin</TableHead>
                <TableHead className="hidden md:table-cell">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-10">
                    Tidak ada transaksi ditemukan
                  </TableCell>
                </TableRow>
              )}
              {filtered?.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.nasabah?.nama ?? '-'}</TableCell>
                  <TableCell className="text-gray-600">{t.operator?.nama ?? '-'}</TableCell>
                  <TableCell>{t.jenis_sampah?.nama ?? '-'}</TableCell>
                  <TableCell className="text-right">{t.berat} kg</TableCell>
                  <TableCell className="text-right font-medium text-green-700">
                    {formatCurrency(t.total_nilai)}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-blue-700">
                    {formatPoin(t.total_poin)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500 text-xs">
                    {formatDateTime(t.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
