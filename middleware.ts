import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Public routes that don't need auth
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If not authenticated
  if (!user) {
    if (!isPublicRoute) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // User is authenticated - get their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // Jika profile belum ada, jangan redirect loop - biarkan lewat
  if (!role) {
    return supabaseResponse
  }

  // Redirect authenticated users away from login
  if (isPublicRoute) {
    let dashboardUrl: string
    if (role === 'admin') dashboardUrl = '/dashboard/admin'
    else if (role === 'operator') dashboardUrl = '/dashboard/operator'
    else dashboardUrl = '/dashboard/user'
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  // Role-based protection untuk dashboard routes
  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
    const redirectUrl = role === 'operator' ? '/dashboard/operator' : '/dashboard/user'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  if (pathname.startsWith('/dashboard/operator') && role !== 'operator' && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard/user', request.url))
  }

  if (pathname.startsWith('/dashboard/user') && role !== 'user') {
    const redirectUrl = role === 'admin' ? '/dashboard/admin' : '/dashboard/operator'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Redirect /dashboard ke dashboard sesuai role
  if (pathname === '/dashboard') {
    let dashboardUrl: string
    if (role === 'admin') dashboardUrl = '/dashboard/admin'
    else if (role === 'operator') dashboardUrl = '/dashboard/operator'
    else dashboardUrl = '/dashboard/user'
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
