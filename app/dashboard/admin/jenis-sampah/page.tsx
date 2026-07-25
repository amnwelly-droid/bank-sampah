import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPoin } from '@/lib/utils'
import type { JenisSampah } from '@/types'
import { JenisSampahActions } from './JenisSampahActions'

const kategoriLabel: Record<string, string> = {
  organik: 'Organik',
  anorganik: 'Anorganik',
  b3: 'B3',
}

const kategoriColor: Record<string, string> = {
  organik: 'bg-green-100 text-green-800',
  anorganik: 'bg-blue-100 text-blue-800',
  b3: 'bg-red-100 text-red-800',
}

export default async function JenisSampahPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jenisSampah } = await supabase
    .from('jenis_sampah')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<JenisSampah[]>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Jenis Sampah</h2>
          <p className="text-gray-500 mt-1">Kelola kategori dan harga sampah</p>
        </div>
        <JenisSampahActions mode="add" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Jenis Sampah</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga/kg</TableHead>
                <TableHead className="text-center">
                  <span className="text-xs text-gray-500">Poin otomatis: Rp 1.000 = 1 poin</span>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jenisSampah?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                    Belum ada jenis sampah
                  </TableCell>
                </TableRow>
              )}
              {jenisSampah?.map((js) => (
                <TableRow key={js.id}>
                  <TableCell className="font-medium">{js.nama}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${kategoriColor[js.kategori]}`}>
                      {kategoriLabel[js.kategori]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-700">
                    {formatCurrency(js.harga_per_kg)}
                  </TableCell>
                  <TableCell className="text-center text-xs text-gray-400">
                    {formatPoin(Math.round((js.harga_per_kg / 1000) * 10) / 10)} poin/kg
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={js.aktif ? 'success' : 'secondary'}>
                      {js.aktif ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <JenisSampahActions mode="edit" jenisSampah={js} />
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
