import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Role } from '@/types'

interface HeaderProps {
  userName: string
  role: Role
  title?: string
}

const roleLabel: Record<Role, string> = {
  admin: 'Admin',
  operator: 'Operator',
  user: 'Nasabah',
}

const roleBadgeClass: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-800',
  operator: 'bg-blue-100 text-blue-800',
  user: 'bg-green-100 text-green-800',
}

export function Header({ userName, role, title }: HeaderProps) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6 shadow-sm">
      <div className="pl-12 lg:pl-0">
        {title && (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass[role]}`}>
            {roleLabel[role]}
          </span>
        </div>
        <Avatar className="h-9 w-9 bg-green-100 text-green-700 font-semibold">
          <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
