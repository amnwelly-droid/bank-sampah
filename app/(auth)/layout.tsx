import { Leaf } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-lg mb-4">
            <Leaf className="h-8 w-8 text-green-700" />
          </div>
          <h1 className="text-3xl font-bold text-white">Bank Sampah</h1>
          <p className="text-green-200 mt-1">Sistem Pengelolaan Sampah Digital</p>
        </div>
        {children}
      </div>
    </div>
  )
}
