'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { createUserAction } from '../actions'

export function AddNasabahButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    no_hp: '',
    alamat: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama || !form.email || !form.password) return

    setLoading(true)
    try {
      const result = await createUserAction({
        nama: form.nama,
        email: form.email,
        password: form.password,
        no_hp: form.no_hp,
        alamat: form.alamat,
        role: 'user',
      })

      if (result.error) throw new Error(result.error)

      toast({
        title: 'Nasabah berhasil ditambahkan',
        description: `${form.nama} telah terdaftar sebagai nasabah.`,
      })

      setOpen(false)
      setForm({ nama: '', email: '', password: '', no_hp: '', alamat: '' })
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Gagal menambahkan nasabah',
        description: error.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Nasabah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Nasabah Baru</DialogTitle>
          <DialogDescription>
            Buat akun nasabah baru. Nasabah bisa langsung login dengan email dan password ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nas-nama">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input
              id="nas-nama"
              name="nama"
              placeholder="Nama nasabah"
              value={form.nama}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nas-email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="nas-email"
              name="email"
              type="email"
              placeholder="nasabah@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nas-password">Password <span className="text-red-500">*</span></Label>
            <Input
              id="nas-password"
              name="password"
              type="password"
              placeholder="Min. 6 karakter"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nas-nohp">No. HP</Label>
            <Input
              id="nas-nohp"
              name="no_hp"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.no_hp}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nas-alamat">Alamat</Label>
            <Input
              id="nas-alamat"
              name="alamat"
              placeholder="Alamat nasabah"
              value={form.alamat}
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
