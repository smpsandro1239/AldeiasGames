'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OrgAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jogos, setJogos] = useState<any[]>([])

  useEffect(() => {
    if (status === 'loading') {
      return <p>Carregando...</p>
    }

    if (!session || !['ORG_ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return <p className="text-red-600">Não autorizado</p>
    }
    
    fetchJogos()
  }, [session, status])

  const fetchJogos = async () => {
    try {
      const res = await fetch('/api/jogos')
      const data = await res.json()
      if (data.success) {
        setJogos(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar jogos:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">A carregar...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - {session.user.org?.name || 'Minha Organização'}
            </h1>
            <p className="text-gray-600">
              Admin: {session.user.name}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sair
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Jogos Ativos" value={jogos.filter(j => j.status === 'ATIVO').length.toString()} />
          <StatCard title="Vendas Hoje" value="0" />
          <StatCard title="Receita Total" value="€0" />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Meus Jogos</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Novo Jogo
            </button>
          </div>

          {jogos.length === 0 ? (
            <p className="text-gray-500">Nenhum jogo criado ainda.</p>
          ) : (
            <div className="space-y-2">
              {jogos.map(jogo => (
                <div key={jogo.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{jogo.nome}</h3>
                    <p className="text-sm text-gray-600">
                      Tipo: {jogo.tipo} | Criado: {new Date(jogo.criadoEm).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-gray-200 px-3 py-1 rounded text-sm">Gerir</button>
                    <button className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">Relatórios</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Atividades Recentes</h2>
            <ul className="space-y-3">
              <li className="text-gray-600">Nenhuma atividade recente</li>
            </ul>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              <button className="block w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100">
                Criar Novo Jogo
              </button>
              <button className="block w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100">
                Exportar Dados
              </button>
              <button className="block w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100">
                Configurar Vendedores
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple stat card component
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}