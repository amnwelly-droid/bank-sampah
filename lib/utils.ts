import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

// Format poin dengan 1 desimal jika ada, tanpa desimal jika bulat
export function formatPoin(poin: number): string {
  const rounded = Math.round(poin * 10) / 10
  if (Number.isInteger(rounded)) {
    return new Intl.NumberFormat('id-ID').format(rounded)
  }
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rounded)
}

export function formatDate(dateStr: string, formatStr: string = 'dd MMM yyyy'): string {
  try {
    return format(new Date(dateStr), formatStr, { locale: id })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'dd MMM yyyy HH:mm')
}
