'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const bulanList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

interface LaporanFilterProps {
  currentBulan: number
  currentTahun: number
}

export function LaporanFilter({ currentBulan, currentTahun }: LaporanFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const update = (bulan: string, tahun: string) => {
    router.push(`${pathname}?bulan=${bulan}&tahun=${tahun}`)
  }

  return (
    <div className="flex gap-3">
      <Select
        defaultValue={currentBulan.toString()}
        onValueChange={(v) => update(v, currentTahun.toString())}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {bulanList.map((b, i) => (
            <SelectItem key={i + 1} value={(i + 1).toString()}>{b}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={currentTahun.toString()}
        onValueChange={(v) => update(currentBulan.toString(), v)}
      >
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
