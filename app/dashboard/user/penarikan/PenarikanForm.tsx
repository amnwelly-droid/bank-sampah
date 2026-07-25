'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

interface PenarikanFormProps {
  nasabahId: string
  saldo: number
  poin: number
}

export function PenarikanForm({ nasabahId, saldo, poin }: PenarikanFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [metode, setMetode] = useState<'transfer' | 'poin'>('transfer')
  const [form, setForm] = useState({
    jumlah: '',
    no_rekening: '',
    nama_bank: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const jumlahNum = parseFloat(form.jumlah)
    if (isNaN(jumlahNum) || jumlahNum <= 0) {
      toast({ title: 'Jumlah tidak valid', description: 'Masukkan jumlah penarikan yang valid.', variant: 'destructive' })
      return
    }

    if (metode === 'transfer' && jumlahNum > saldo) {
      toast({ title: 'Saldo tidak cukup', description: `Saldo Anda hanya ${formatCurrency(saldo)}.`, variant: 'destructive' })
      return
    }

    if (metode === 'transfer' && (!form.no_rekening || !form.nama_bank)) {
      toast({ title: 'Data rekening diperlukan', description: 'Isi nomor rekening dan nama bank.', variant: 'destructive' })
      return
    }

    const minPenarikan = 10000
    if (metode === 'transfer' && jumlahNum < minPenarikan) {
      toast({ title: 'Minimum penarikan', description: `Minimum penarikan adalah ${formatCurrency(minPenarikan)}.`, variant: 'destructive' })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from('penarikan').insert({
        nasabah_id: nasabahId,
        jumlah: jumlahNum,
        metode,
        no_rekening: metode === 'transfer' ? form.no_rekening : null,
        nama_bank: metode === 'transfer' ? form.nama_bank : null,
        status: 'pending',
      })

      if (error) throw error

      toast({
        title: 'Permintaan penarikan diajukan',
        description: 'Admin akan memproses permintaan Anda segera.',
      })

      setForm({ jumlah: '', no_rekening: '', nama_bank: '' })
      router.refresh()
    } catch (error: any) {
      toast({ title: 'Gagal mengajukan', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="h-5 w-5 text-green-600" />
          Form Penarikan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Metode Penarikan</Label>
            <Select value={metode} onValueChange={(v) => setMetode(v as 'transfer' | 'poin')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transfer Bank</SelectItem>
                <SelectItem value="poin">Poin (belum tersedia)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah Penarikan (Rp)</Label>
            <Input
              id="jumlah"
              name="jumlah"
              type="number"
              min="10000"
              max={saldo}
              step="1000"
              placeholder="Minimum Rp 10.000"
              value={form.jumlah}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500">
              Saldo tersedia: <span className="font-medium text-green-700">{formatCurrency(saldo)}</span>
            </p>
          </div>

          {metode === 'transfer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nama_bank">Nama Bank</Label>
                <Input
                  id="nama_bank"
                  name="nama_bank"
                  placeholder="cth. BCA, BRI, Mandiri"
                  value={form.nama_bank}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_rekening">Nomor Rekening</Label>
                <Input
                  id="no_rekening"
                  name="no_rekening"
                  placeholder="Nomor rekening Anda"
                  value={form.no_rekening}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Mengajukan...
              </span>
            ) : 'Ajukan Penarikan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
