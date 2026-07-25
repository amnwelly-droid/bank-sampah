import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { LaporanCharts } from './LaporanCharts'
import { LaporanFilter } from './LaporanFilter'

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: { bulan?: string; tahun?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const bulan = searchParams.bulan ? parseInt(searchParams.bulan) : now.getMonth() + 1
  const tahun = searchParams.tahun ? parseInt(searchParams.tahun) : now.getFullYear()

  const startDate = new Date(tahun, bulan - 1, 1).toISOString()
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59).toISOString()

  const [
    { data: transaksi },
    { count: nasabahAktif },
  ] = await Promise.all([
    supabase
      .from('transaksi')
      .select('*, jenis_sampah:jenis_sampah(nama, kategori)')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true }),
    supabase
      .from('transaksi')
      .select('nasabah_id', { count: 'exact', head: false })
      .gte('created_at', startDate)
      .lte('created_at', endDate),
  ])

  // Stats
  const totalBerat = transaksi?.reduce((s, t) => s + Number(t.berat), 0) ?? 0
  const totalNilai = transaksi?.reduce((s, t) => s + Number(t.total_nilai), 0) ?? 0
  const totalTranaksi = transaksi?.length ?? 0
  const rataRata = totalTranaksi > 0 ? totalNilai / totalTranaksi : 0

  // Unique nasabah
  const uniqueNasabah = new Set(transaksi?.map((t: any) => t.nasabah_id)).size

  // Daily chart data
  const dailyMap: Record<string, number> = {}
  transaksi?.forEach((t) => {
    const day = new Date(t.created_at).getDate().toString()
    dailyMap[day] = (dailyMap[day] || 0) + 1
  })
  const dailyData = Array.from({ length: new Date(tahun, bulan, 0).getDate() }, (_, i) => ({
    day: (i + 1).toString(),
    count: dailyMap[(i + 1).toString()] || 0,
  }))

  // Pie chart: by jenis
  const jenisMap: Record<string, number> = {}
  transaksi?.forEach((t: any) => {
    const nama = t.jenis_sampah?.nama ?? 'Lainnya'
    jenisMap[nama] = (jenisMap[nama] || 0) + Number(t.berat)
  })
  const pieData = Object.entries(jenisMap).map(([name, value]) => ({ name, value }))

  // Table by jenis
  const jenisSummary: Record<string, { berat: number; nilai: number; count: number }> = {}
  transaksi?.forEach((t: any) => {
    const nama = t.jenis_sampah?.nama ?? 'Lainnya'
    if (!jenisSummary[nama]) jenisSummary[nama] = { berat: 0, nilai: 0, count: 0 }
    jenisSummary[nama].berat += Number(t.berat)
    jenisSummary[nama].nilai += Number(t.total_nilai)
    jenisSummary[nama].count += 1
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan</h2>
          <p className="text-gray-500 mt-1">Ringkasan aktivitas bank sampah</p>
        </div>
        <LaporanFilter currentBulan={bulan} currentTahun={tahun} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Sampah</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatNumber(Math.round(totalBerat * 100) / 100)} kg</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Nilai</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(totalNilai)}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Nasabah Aktif</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{uniqueNasabah}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Rata-rata / Transaksi</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{formatCurrency(rataRata)}</p>
        </div>
      </div>

      {/* Charts */}
      <LaporanCharts dailyData={dailyData} pieData={pieData} />

      {/* Summary table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan Per Jenis Sampah</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis Sampah</TableHead>
                <TableHead className="text-center">Jumlah Transaksi</TableHead>
                <TableHead className="text-right">Total Berat</TableHead>
                <TableHead className="text-right">Total Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(jenisSummary).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Tidak ada transaksi pada periode ini
                  </TableCell>
                </TableRow>
              )}
              {Object.entries(jenisSummary).map(([nama, data]) => (
                <TableRow key={nama}>
                  <TableCell className="font-medium">{nama}</TableCell>
                  <TableCell className="text-center">{data.count}</TableCell>
                  <TableCell className="text-right">{formatNumber(Math.round(data.berat * 100) / 100)} kg</TableCell>
                  <TableCell className="text-right font-medium text-green-700">{formatCurrency(data.nilai)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
