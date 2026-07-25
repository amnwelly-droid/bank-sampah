import { Sidebar } from './Sidebar'
import { Header } from './Header'
import type { Role } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: Role
  userName: string
  title?: string
}

export function DashboardLayout({ children, role, userName, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} />
      <div className="lg:pl-64">
        <Header userName={userName} role={role} title={title} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
