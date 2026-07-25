'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TransaksiFilterProps {
  jenisList: Array<{ id: string; nama: string }>
}

export function TransaksiFilter({ jenisList }: TransaksiFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari nama nasabah..."
          className="pl-9"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => updateParam('q', e.target.value)}
        />
      </div>
      <Select
        defaultValue={searchParams.get('jenis') ?? 'all'}
        onValueChange={(v) => updateParam('jenis', v)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Semua Jenis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Jenis</SelectItem>
          {jenisList.map((j) => (
            <SelectItem key={j.id} value={j.id}>{j.nama}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        className="w-full sm:w-40"
        defaultValue={searchParams.get('from') ?? ''}
        onChange={(e) => updateParam('from', e.target.value)}
        placeholder="Dari tanggal"
      />
      <Input
        type="date"
        className="w-full sm:w-40"
        defaultValue={searchParams.get('to') ?? ''}
        onChange={(e) => updateParam('to', e.target.value)}
        placeholder="Sampai tanggal"
      />
    </div>
  )
}
