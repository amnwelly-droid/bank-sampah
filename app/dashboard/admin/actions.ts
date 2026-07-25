'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateUserPayload {
  nama: string
  email: string
  password: string
  no_hp?: string
  alamat?: string
  role: 'user' | 'operator'
}

export async function createUserAction(payload: CreateUserPayload) {
  // Pastikan yang memanggil adalah admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Akses ditolak' }

  // Buat user dengan admin client (tidak mengganti sesi admin)
  const adminClient = createAdminClient()

  const { data, error: createError } = await adminClient.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true, // langsung aktif tanpa verifikasi email
    user_metadata: {
      nama: payload.nama,
      role: payload.role,
    },
  })

  if (createError) return { error: createError.message }

  // Tunggu trigger membuat profile, lalu update dengan data lengkap
  await new Promise(resolve => setTimeout(resolve, 800))

  const { error: updateError } = await adminClient
    .from('profiles')
    .update({
      nama: payload.nama,
      role: payload.role,
      no_hp: payload.no_hp || null,
      alamat: payload.alamat || null,
    })
    .eq('id', data.user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard/admin/nasabah')
  revalidatePath('/dashboard/admin/operator')

  return { success: true, userId: data.user.id }
}

export async function deleteUserAction(userId: string) {
  // Pastikan yang memanggil adalah admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Akses ditolak' }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/nasabah')
  revalidatePath('/dashboard/admin/operator')

  return { success: true }
}
