'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCog,
  Recycle,
  ArrowLeftRight,
  Banknote,
  BarChart3,
  Scale,
  History,
  Wallet,
  LogOut,
  Leaf,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Nasabah', href: '/dashboard/admin/nasabah', icon: Users },
  { label: 'Operator', href: '/dashboard/admin/operator', icon: UserCog },
  { label: 'Jenis Sampah', href: '/dashboard/admin/jenis-sampah', icon: Recycle },
  { label: 'Transaksi', href: '/dashboard/admin/transaksi', icon: ArrowLeftRight },
  { label: 'Penarikan', href: '/dashboard/admin/penarikan', icon: Banknote },
  { label: 'Laporan', href: '/dashboard/admin/laporan', icon: BarChart3 },
]

const operatorNav: NavItem[] = [
  { label: 'Input Timbang', href: '/dashboard/operator', icon: Scale },
  { label: 'Riwayat', href: '/dashboard/operator/riwayat', icon: History },
]

const userNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/user', icon: LayoutDashboard },
  { label: 'Riwayat Setoran', href: '/dashboard/user/riwayat', icon: History },
  { label: 'Penarikan', href: '/dashboard/user/penarikan', icon: Wallet },
]

interface SidebarProps {
  role: Role
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const navItems = role === 'admin' ? adminNav : role === 'operator' ? operatorNav : userNav

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-green-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <Leaf className="h-5 w-5 text-green-700" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">Bank Sampah</p>
          <p className="text-xs text-green-200 mt-0.5">Pengelolaan Sampah</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard/admin' && 
             item.href !== '/dashboard/operator' && 
             item.href !== '/dashboard/user' && 
             pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-green-700 px-3 py-4">
        <div className="mb-2 px-3 py-2">
          <p className="text-xs text-green-300">Masuk sebagai</p>
          <p className="text-sm font-semibold text-white truncate">{userName}</p>
          <span className="inline-block mt-1 rounded-full bg-green-700 px-2 py-0.5 text-xs text-green-100 capitalize">
            {role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-green-100 hover:bg-green-700 hover:text-white transition-all"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 rounded-lg bg-green-700 p-2 text-white shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-green-800 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-green-800">
        <SidebarContent />
      </aside>
    </>
  )
}
