import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { formatCurrency, formatNumber, formatPoin } from '@/lib/utils'
import type { Profile } from '@/types'
import { NasabahSearch } from './NasabahSearch'
import { AddNasabahButton } from './AddNasabahButton'

export default async function NasabahPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('nama', `%${searchParams.q}%`)
  }

  const { data: nasabah } = await query.returns<Profile[]>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Nasabah</h2>
          <p className="text-gray-500 mt-1">Daftar seluruh nasabah terdaftar</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">{nasabah?.length ?? 0} Nasabah</span>
          </div>
          <AddNasabahButton />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base">Daftar Nasabah</CardTitle>
            <NasabahSearch defaultValue={searchParams.q} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead className="hidden md:table-cell">No. HP</TableHead>
                <TableHead className="hidden lg:table-cell">Tgl Daftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nasabah?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                    {searchParams.q ? 'Nasabah tidak ditemukan' : 'Belum ada nasabah terdaftar'}
                  </TableCell>
                </TableRow>
              )}
              {nasabah?.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{n.nama}</p>
                      <p className="text-xs text-gray-500 sm:hidden">{n.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-gray-600">{n.email}</TableCell>
                  <TableCell className="text-right font-medium text-green-700">
                    {formatCurrency(n.saldo)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {formatPoin(n.poin)} poin
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-600">
                    {n.no_hp || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-500 text-sm">
                    {formatDate(n.created_at)}
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
