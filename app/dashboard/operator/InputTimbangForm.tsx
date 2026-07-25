'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Calculator, CheckCircle } from 'lucide-react'
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
import { formatCurrency, formatNumber, formatPoin } from '@/lib/utils'
import type { JenisSampah } from '@/types'

interface InputTimbangFormProps {
  operatorId: string
  nasabahList: Array<{ id: string; nama: string; email: string }>
  jenisSampahList: JenisSampah[]
}

export function InputTimbangForm({ operatorId, nasabahList, jenisSampahList }: InputTimbangFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [nasabahId, setNasabahId] = useState('')
  const [jenisSampahId, setJenisSampahId] = useState('')
  const [berat, setBerat] = useState('')
  const [catatan, setCatatan] = useState('')

  const selectedJenis = jenisSampahList.find(j => j.id === jenisSampahId)
  const beratNum = parseFloat(berat) || 0
  const totalNilai = selectedJenis ? beratNum * selectedJenis.harga_per_kg : 0
  // 1 poin per Rp 1.000 nilai sampah, desimal 1 angka
  const totalPoin = Math.round((totalNilai / 1000) * 10) / 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nasabahId || !jenisSampahId || !berat || beratNum <= 0) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Silakan isi semua field yang diperlukan.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Insert transaksi
      const { error: transaksiError } = await supabase
        .from('transaksi')
        .insert({
          nasabah_id: nasabahId,
          operator_id: operatorId,
          jenis_sampah_id: jenisSampahId,
          berat: beratNum,
          total_nilai: totalNilai,
          total_poin: totalPoin,
          catatan: catatan || null,
        })

      if (transaksiError) throw transaksiError

      // Update saldo & poin nasabah
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('saldo, poin')
        .eq('id', nasabahId)
        .single()

      if (fetchError) throw fetchError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          saldo: Number(profileData.saldo) + totalNilai,
          poin: Number(profileData.poin) + totalPoin,
        })
        .eq('id', nasabahId)

      if (updateError) throw updateError

      const nasabah = nasabahList.find(n => n.id === nasabahId)
      toast({
        title: 'Transaksi berhasil!',
        description: `Setoran ${nasabah?.nama} sebesar ${formatCurrency(totalNilai)} berhasil dicatat.`,
        variant: 'default',
      })

      // Reset form
      setNasabahId('')
      setJenisSampahId('')
      setBerat('')
      setCatatan('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Gagal menyimpan',
        description: error.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-5 w-5 text-green-600" />
            Form Input Timbang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nasabah */}
            <div className="space-y-2">
              <Label htmlFor="nasabah">Nasabah <span className="text-red-500">*</span></Label>
              <Select value={nasabahId} onValueChange={setNasabahId}>
                <SelectTrigger id="nasabah">
                  <SelectValue placeholder="Pilih nasabah..." />
                </SelectTrigger>
                <SelectContent>
                  {nasabahList.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      <span className="font-medium">{n.nama}</span>
                      <span className="text-gray-500 text-xs ml-1">({n.email})</span>
                    </SelectItem>
                  ))}
                  {nasabahList.length === 0 && (
                    <SelectItem value="empty" disabled>Belum ada nasabah</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Jenis Sampah */}
            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis Sampah <span className="text-red-500">*</span></Label>
              <Select value={jenisSampahId} onValueChange={setJenisSampahId}>
                <SelectTrigger id="jenis">
                  <SelectValue placeholder="Pilih jenis sampah..." />
                </SelectTrigger>
                <SelectContent>
                  {jenisSampahList.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      <span>{j.nama}</span>
                      <span className="text-gray-500 text-xs ml-1">({formatCurrency(j.harga_per_kg)}/kg)</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Berat */}
            <div className="space-y-2">
              <Label htmlFor="berat">Berat (kg) <span className="text-red-500">*</span></Label>
              <Input
                id="berat"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.000"
                value={berat}
                onChange={(e) => setBerat(e.target.value)}
                required
              />
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan (opsional)</Label>
              <Input
                id="catatan"
                placeholder="Catatan tambahan..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading || !nasabahId || !jenisSampahId || beratNum <= 0}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menyimpan...
                </span>
              ) : success ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Tersimpan!
                </span>
              ) : 'Simpan Transaksi'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview Kalkulasi */}
      <Card className={selectedJenis && beratNum > 0 ? 'border-green-200 bg-green-50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-5 w-5 text-green-600" />
            Preview Kalkulasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedJenis || beratNum <= 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Scale className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Pilih jenis sampah dan masukkan berat untuk melihat kalkulasi</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-3 border border-green-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jenis Sampah</span>
                  <span className="font-medium">{selectedJenis.nama}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Berat</span>
                  <span className="font-medium">{beratNum} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Harga / kg</span>
                  <span className="font-medium">{formatCurrency(selectedJenis.harga_per_kg)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Konversi Poin</span>
                  <span className="font-medium text-blue-600">Rp 1.000 = 1 poin</span>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Total Nilai</span>
                    <span className="font-bold text-green-700 text-lg">{formatCurrency(totalNilai)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Total Poin</span>
                    <span className="font-bold text-blue-700">{formatPoin(totalPoin)} poin</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Saldo dan poin nasabah akan diperbarui otomatis
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
