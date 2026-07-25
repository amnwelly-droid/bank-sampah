import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Profile, Penarikan } from '@/types'
import { PenarikanForm } from './PenarikanForm'

const statusConfig = {
  pending: { label: 'Menunggu', class: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Disetujui', class: 'bg-green-100 text-green-800' },
  rejected: { label: 'Ditolak', class: 'bg-red-100 text-red-800' },
}

export default async function UserPenarikanPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: riwayatPenarikan }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single<Profile>(),
    supabase
      .from('penarikan')
      .select('*')
      .eq('nasabah_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Penarikan Saldo</h2>
        <p className="text-gray-500 mt-1">Ajukan penarikan saldo atau tukar poin</p>
      </div>

      {/* Saldo info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Saldo Tersedia</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(profile?.saldo ?? 0)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Poin Tersedia</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{profile?.poin ?? 0} poin</p>
        </div>
      </div>

      {/* Form */}
      <PenarikanForm
        nasabahId={user.id}
        saldo={profile?.saldo ?? 0}
        poin={profile?.poin ?? 0}
      />

      {/* Riwayat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Penarikan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="hidden md:table-cell">Bank / Rekening</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riwayatPenarikan?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    Belum ada riwayat penarikan
                  </TableCell>
                </TableRow>
              )}
              {riwayatPenarikan?.map((p) => {
                const status = statusConfig[p.status as keyof typeof statusConfig]
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-right font-bold text-green-700">
                      {formatCurrency(p.jumlah)}
                    </TableCell>
                    <TableCell className="capitalize">{p.metode}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {p.metode === 'transfer' ? `${p.nama_bank} - ${p.no_rekening}` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.class}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-gray-500 text-xs">
                      {formatDateTime(p.created_at)}
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
