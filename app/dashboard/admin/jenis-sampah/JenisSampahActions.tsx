'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import type { JenisSampah, KategoriSampah } from '@/types'

interface JenisSampahActionsProps {
  mode: 'add' | 'edit'
  jenisSampah?: JenisSampah
}

export function JenisSampahActions({ mode, jenisSampah }: JenisSampahActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama: jenisSampah?.nama ?? '',
    kategori: jenisSampah?.kategori ?? 'organik',
    harga_per_kg: jenisSampah?.harga_per_kg?.toString() ?? '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama || !form.kategori || !form.harga_per_kg) return

    setLoading(true)
    const supabase = createClient()

    try {
      const payload = {
        nama: form.nama,
        kategori: form.kategori,
        harga_per_kg: parseFloat(form.harga_per_kg),
        poin_per_kg: 0, // poin dihitung otomatis: Rp 1.000 = 1 poin
      }

      if (mode === 'add') {
        const { error } = await supabase.from('jenis_sampah').insert(payload)
        if (error) throw error
        toast({ title: 'Berhasil', description: 'Jenis sampah berhasil ditambahkan.' })
      } else {
        const { error } = await supabase.from('jenis_sampah').update(payload).eq('id', jenisSampah!.id)
        if (error) throw error
        toast({ title: 'Berhasil', description: 'Jenis sampah berhasil diperbarui.' })
      }

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    if (!jenisSampah) return
    const supabase = createClient()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('jenis_sampah')
        .update({ aktif: !jenisSampah.aktif })
        .eq('id', jenisSampah.id)
      if (error) throw error
      toast({
        title: 'Status diperbarui',
        description: `${jenisSampah.nama} ${!jenisSampah.aktif ? 'diaktifkan' : 'dinonaktifkan'}.`,
      })
      router.refresh()
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'edit' && jenisSampah) {
    return (
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={handleToggle}
          disabled={loading}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title={jenisSampah.aktif ? 'Nonaktifkan' : 'Aktifkan'}
        >
          {jenisSampah.aktif
            ? <ToggleRight className="h-5 w-5 text-green-600" />
            : <ToggleLeft className="h-5 w-5 text-gray-400" />}
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Edit">
              <Pencil className="h-4 w-4 text-blue-600" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Jenis Sampah</DialogTitle>
            </DialogHeader>
            <JenisSampahForm
              form={form}
              onChange={handleChange}
              onKategoriChange={(v) => setForm(p => ({ ...p, kategori: v as KategoriSampah }))}
              onSubmit={handleSubmit}
              loading={loading}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jenis Sampah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Jenis Sampah</DialogTitle>
          <DialogDescription>Tambahkan jenis sampah baru beserta harganya</DialogDescription>
        </DialogHeader>
        <JenisSampahForm
          form={form}
          onChange={handleChange}
          onKategoriChange={(v) => setForm(p => ({ ...p, kategori: v as KategoriSampah }))}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function JenisSampahForm({
  form,
  onChange,
  onKategoriChange,
  onSubmit,
  loading,
  onCancel,
}: {
  form: { nama: string; kategori: string; harga_per_kg: string }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKategoriChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  onCancel: () => void
}) {
  const harga = parseFloat(form.harga_per_kg) || 0
  const poinPerKg = Math.round((harga / 1000) * 10) / 10

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Sampah</Label>
        <Input name="nama" placeholder="cth. Kertas" value={form.nama} onChange={onChange} required />
      </div>
      <div className="space-y-2">
        <Label>Kategori</Label>
        <Select value={form.kategori} onValueChange={onKategoriChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="organik">Organik</SelectItem>
            <SelectItem value="anorganik">Anorganik</SelectItem>
            <SelectItem value="b3">B3 (Bahan Berbahaya)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Harga / kg (Rp)</Label>
        <Input
          name="harga_per_kg"
          type="number"
          placeholder="2000"
          value={form.harga_per_kg}
          onChange={onChange}
          required
          min="0"
        />
      </div>
      {harga > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
          💡 Poin otomatis: <strong>{Number.isInteger(poinPerKg) ? poinPerKg : poinPerKg.toFixed(1)} poin/kg</strong> (Rp 1.000 = 1 poin)
        </div>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogFooter>
    </form>
  )
}
