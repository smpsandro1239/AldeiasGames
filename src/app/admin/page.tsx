'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
    }

    if (status === 'unauthenticated') {
      return <div className="min-h-screen">Aqui você precisa estar logado como SUPERADMIN</p>
      <button
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        onClick={() => router.push('/login')}
      >Ir para Login
    </button>
    </div>
    }

    if (session?.user?.role !== 'SUPERADMIN') {
      return <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Acesso negado. Você não tem permissão para acessar esta área.</p>
      </div>
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Super Administrador</h1>
        <p className="mt-4 text-gray-700">
          Bem-vindo, {session?.user?.name || 'Super Admin'}!
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg">Relatórios</h2>
            <p>Resumo de atividades, transações e auditoria</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg">Configurações</h2>
            <p>Configurações gerais do sistema</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-bold text-lg">Segurança</h2>
            <p>Logs de auditoria, acessos e monitoramento</p>
          </div>
        </div>
      </div>
    </div>
  )
}