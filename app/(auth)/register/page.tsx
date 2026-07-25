import { redirect } from 'next/navigation'

// Halaman register dinonaktifkan - akun dibuat oleh admin
export default function RegisterPage() {
  redirect('/login')
}
