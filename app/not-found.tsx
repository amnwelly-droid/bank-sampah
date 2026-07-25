import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <Leaf className="h-8 w-8 text-green-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-6">Halaman yang Anda cari tidak ditemukan.</p>
        <Link href="/login">
          <Button className="bg-green-600 hover:bg-green-700">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  )
}
