import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatNumber, formatPoin, formatDateTime } from '@/lib/utils'

export default async function OperatorRiwayatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: transaksi } = await supabase
    .from('transaksi')
    .select('*, nasabah:profiles!nasabah_id(nama), jenis_sampah:jenis_sampah(nama)')
    .eq('operator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const totalNilai = transaksi?.reduce((s, t) => s + Number(t.total_nilai), 0) ?? 0
  const totalBerat = transaksi?.reduce((s, t) => s + Number(t.berat), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h2>
        <p className="text-gray-500 mt-1">Semua transaksi yang Anda input</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{transaksi?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total Transaksi</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-xl font-bold text-green-700">{formatCurrency(totalNilai)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Nilai</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-xl font-bold text-blue-700">{formatNumber(Math.round(totalBerat * 100) / 100)} kg</p>
          <p className="text-xs text-gray-500 mt-1">Total Berat</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nasabah</TableHead>
                <TableHead>Jenis Sampah</TableHead>
                <TableHead className="text-right">Berat</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Poin</TableHead>
                <TableHead className="hidden md:table-cell">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaksi?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                    Belum ada transaksi
                  </TableCell>
                </TableRow>
              )}
              {transaksi?.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.nasabah?.nama ?? '-'}</TableCell>
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
