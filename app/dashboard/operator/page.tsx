import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile, JenisSampah } from '@/types'
import { InputTimbangForm } from './InputTimbangForm'

export default async function OperatorPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: operatorProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  const [{ data: nasabah }, { data: jenisSampah }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, nama, email')
      .eq('role', 'user')
      .order('nama'),
    supabase
      .from('jenis_sampah')
      .select('*')
      .eq('aktif', true)
      .order('nama')
      .returns<JenisSampah[]>(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Input Timbang</h2>
        <p className="text-gray-500 mt-1">Catat setoran sampah dari nasabah</p>
      </div>

      <InputTimbangForm
        operatorId={user.id}
        nasabahList={nasabah ?? []}
        jenisSampahList={jenisSampah ?? []}
      />
    </div>
  )
}
