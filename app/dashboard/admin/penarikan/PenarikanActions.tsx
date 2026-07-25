'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
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
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import type { Penarikan } from '@/types'

interface PenarikanActionsProps {
  penarikan: Penarikan
}

export function PenarikanActions({ penarikan }: PenarikanActionsProps) {
  const router = useRouter()
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | null>(null)
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    if (!dialogMode) return
    setLoading(true)

    const supabase = createClient()
    try {
      const newStatus = dialogMode === 'approve' ? 'approved' : 'rejected'

      const { error: updateError } = await supabase
        .from('penarikan')
        .update({ status: newStatus, catatan_admin: catatan })
        .eq('id', penarikan.id)

      if (updateError) throw updateError

      // If approved and metode transfer, deduct saldo
      if (dialogMode === 'approve' && penarikan.metode === 'transfer') {
        const { error: saldoError } = await supabase.rpc('deduct_saldo', {
          user_id: penarikan.nasabah_id,
          amount: penarikan.jumlah,
        })
        // Fallback if RPC not available
        if (saldoError) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('saldo')
            .eq('id', penarikan.nasabah_id)
            .single()
          
          if (profileData) {
            await supabase
              .from('profiles')
              .update({ saldo: Math.max(0, Number(profileData.saldo) - Number(penarikan.jumlah)) })
              .eq('id', penarikan.nasabah_id)
          }
        }
      }

      toast({
        title: dialogMode === 'approve' ? 'Penarikan disetujui' : 'Penarikan ditolak',
        description: `Request penarikan ${formatCurrency(penarikan.jumlah)} telah ${dialogMode === 'approve' ? 'disetujui' : 'ditolak'}.`,
      })

      setDialogMode(null)
      setCatatan('')
      router.refresh()
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => setDialogMode('approve')}
          className="p-1.5 rounded hover:bg-green-50 transition-colors"
          title="Setujui"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
        </button>
        <button
          onClick={() => setDialogMode('reject')}
          className="p-1.5 rounded hover:bg-red-50 transition-colors"
          title="Tolak"
        >
          <XCircle className="h-5 w-5 text-red-500" />
        </button>
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'approve' ? 'Setujui Penarikan' : 'Tolak Penarikan'}
            </DialogTitle>
            <DialogDescription>
              Jumlah: <span className="font-semibold text-gray-900">{formatCurrency(penarikan.jumlah)}</span>
              {' via '}{penarikan.metode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="catatan-admin">Catatan (opsional)</Label>
              <Input
                id="catatan-admin"
                placeholder="Catatan untuk nasabah..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
            <Button
              className={dialogMode === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? 'Memproses...' : dialogMode === 'approve' ? 'Setujui' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
