'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useCallback } from 'react'

interface NasabahSearchProps {
  defaultValue?: string
}

export function NasabahSearch({ defaultValue }: NasabahSearchProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const params = new URLSearchParams()
    if (value) params.set('q', value)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Cari nama nasabah..."
        className="pl-9 w-full sm:w-64"
        defaultValue={defaultValue}
        onChange={handleSearch}
      />
    </div>
  )
}
