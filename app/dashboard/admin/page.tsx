import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, ArrowLeftRight, Banknote, Scale } from 'lucide-react'
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils'
import { AdminChart } from './AdminChart'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Stats
  const [
    { count: totalNasabah },
    { count: totalTransaksi },
    { data: nilaiData },
    { data: beratData },
    { data: recentTransaksi },
    { data: monthlyData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('transaksi').select('*', { count: 'exact', head: true }),
    supabase.from('transaksi').select('total_nilai'),
    supabase.from('transaksi').select('berat'),
    supabase
      .from('transaksi')
      .select('*, nasabah:profiles!nasabah_id(nama), operator:profiles!operator_id(nama), jenis_sampah:jenis_sampah(nama)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('transaksi')
      .select('created_at, total_nilai')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString()),
  ])

  const totalNilai = nilaiData?.reduce((sum, t) => sum + Number(t.total_nilai), 0) ?? 0
  const totalBerat = beratData?.reduce((sum, t) => sum + Number(t.berat), 0) ?? 0

  // Group monthly data
  const monthlyMap: Record<string, number> = {}
  monthlyData?.forEach((t) => {
    const month = new Date(t.created_at).toLocaleString('id-ID', { month: 'short', year: '2-digit' })
    monthlyMap[month] = (monthlyMap[month] || 0) + Number(t.total_nilai)
  })
  const chartData = Object.entries(monthlyMap).map(([month, nilai]) => ({ month, nilai }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Admin</h2>
        <p className="text-gray-500 mt-1">Ringkasan pengelolaan bank sampah</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Nasabah"
          value={formatNumber(totalNasabah ?? 0)}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          description="Nasabah terdaftar"
        />
        <StatsCard
          title="Total Transaksi"
          value={formatNumber(totalTransaksi ?? 0)}
          icon={ArrowLeftRight}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          description="Semua transaksi setoran"
        />
        <StatsCard
          title="Total Nilai"
          value={formatCurrency(totalNilai)}
          icon={Banknote}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
          description="Total nilai sampah"
        />
        <StatsCard
          title="Total Sampah"
          value={`${formatNumber(Math.round(totalBerat * 100) / 100)} kg`}
          icon={Scale}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          description="Berat sampah terkumpul"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaksi 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminChart data={chartData} />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nasabah</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead className="hidden sm:table-cell">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransaksi?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      Belum ada transaksi
                    </TableCell>
                  </TableRow>
                )}
                {recentTransaksi?.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.nasabah?.nama ?? '-'}</TableCell>
                    <TableCell>{t.jenis_sampah?.nama ?? '-'}</TableCell>
                    <TableCell className="text-right text-green-700 font-medium">
                      {formatCurrency(t.total_nilai)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-gray-500 text-xs">
                      {formatDateTime(t.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
