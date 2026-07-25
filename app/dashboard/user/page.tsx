import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Wallet, Star, Package, Scale } from 'lucide-react'
import { formatCurrency, formatNumber, formatPoin, formatDateTime } from '@/lib/utils'
import type { Profile } from '@/types'

export default async function UserDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: recentTransaksi },
    { count: totalTransaksi },
    { data: beratData },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single<Profile>(),
    supabase
      .from('transaksi')
      .select('*, jenis_sampah:jenis_sampah(nama), operator:profiles!operator_id(nama)')
      .eq('nasabah_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('transaksi').select('*', { count: 'exact', head: true }).eq('nasabah_id', user.id),
    supabase.from('transaksi').select('berat').eq('nasabah_id', user.id),
  ])

  const totalBerat = beratData?.reduce((s, t) => s + Number(t.berat), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Halo, {profile?.nama?.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-500 mt-1">Selamat datang di Bank Sampah Digital</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Saldo"
          value={formatCurrency(profile?.saldo ?? 0)}
          icon={Wallet}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          description="Saldo tersimpan"
        />
        <StatsCard
          title="Poin"
          value={`${formatPoin(profile?.poin ?? 0)} poin`}
          icon={Star}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
          description="Poin terkumpul"
        />
        <StatsCard
          title="Total Setoran"
          value={formatNumber(totalTransaksi ?? 0)}
          icon={Package}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          description="Kali setoran"
        />
        <StatsCard
          title="Total Sampah"
          value={`${formatNumber(Math.round(totalBerat * 100) / 100)} kg`}
          icon={Scale}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          description="Sampah disetor"
        />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">5 Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis Sampah</TableHead>
                <TableHead className="text-right">Berat</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Poin</TableHead>
                <TableHead className="hidden md:table-cell">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransaksi?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    Belum ada transaksi setoran
                  </TableCell>
                </TableRow>
              )}
              {recentTransaksi?.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.jenis_sampah?.nama ?? '-'}</TableCell>
                  <TableCell className="text-right">{t.berat} kg</TableCell>
                  <TableCell className="text-right font-medium text-green-700">
                    {formatCurrency(t.total_nilai)}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-blue-700">
                    +{formatPoin(t.total_poin)}
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
