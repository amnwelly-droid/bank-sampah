import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserCog } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types'
import { AddOperatorButton } from './AddOperatorButton'

export default async function OperatorPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: operators } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'operator')
    .order('created_at', { ascending: false })
    .returns<Profile[]>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Operator</h2>
          <p className="text-gray-500 mt-1">Kelola akun operator bank sampah</p>
        </div>
        <AddOperatorButton />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daftar Operator</CardTitle>
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
              <UserCog className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{operators?.length ?? 0} Operator</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">No. HP</TableHead>
                <TableHead className="hidden lg:table-cell">Tgl Daftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                    Belum ada operator terdaftar
                  </TableCell>
                </TableRow>
              )}
              {operators?.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{op.nama}</p>
                      <p className="text-xs text-gray-500 md:hidden">{op.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-600">{op.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-gray-600">{op.no_hp || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-500 text-sm">
                    {formatDate(op.created_at)}
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
