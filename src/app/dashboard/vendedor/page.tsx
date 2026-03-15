'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function VendedorDashboard() {
  const { data: session, status } = useSession()
  const [vendasRecentes, setVendasRecentes] = useState<any[]>([])

  useEffect(() => {
    if (session) {
      fetchVendasRecentes()
    }
  }, [session])

  const fetchVendasRecentes = async () => {
    try {
      const res = await fetch('/api/jogadas')
      const data = await res.json()
      if (data.success) {
        setVendasRecentes(data.data.slice(0, 10))
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
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
            <h1 className="text-3xl font-bold text-gray-900">Painel do Vendedor</h1>
            <p className="text-gray-600">
              Olá, {session.user.name} - ({session.user.email})
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/vendedor/nova-venda'}
            className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-medium"
          >
            + Nova Venda
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Vendas Hoje</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Saldo Pendente</h3>
            <p className="text-2xl font-bold">€0</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Comissão Estimada</h3>
            <p className="text-2xl font-bold">€0</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Vendas Recentes</h2>
          {vendasRecentes.length === 0 ? (
            <p className="text-gray-500">Nenhuma venda registada.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jogo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendasRecentes.map(venda => (
                  <tr key={venda.id}>
                    <td className="px-6 py-4">{venda.jogo?.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Tipo: {venda.tipoJogo}
                      {venda.detalhes && (
                        <div>
                          {venda.tipoJogo === 'RIFA' && `Números: ${venda.detalhes.numeros?.join(', ')}`}
                          {venda.tipoJogo === 'POIO' && `Coordenada: ${venda.detalhes.coordenadaX}, ${venda.detalhes.coordenadaY}`}
                          {venda.tipoJogo === 'RASPADINHA' && `${venda.detalhes.quantidade} unidades`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">€{venda.valor ? venda.valor.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        venda.statusJogada === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                        venda.statusJogada === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                        venda.statusJogada === 'REEMBOLSADO' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {venda.statusJogada}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-bold text-yellow-800">Ações Rápidas</h3>
          <div className="mt-2 space-y-2">
            <a href="/vendedor/nova-venda" className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Registrar Nova Venda
            </a>
            <a href="/vendedor/alteracoes" className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Minhas Solicitações de Alteração
            </a>
            <a href="/vendedor/minhas-comissoes" className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Ver Minhas Comissões
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}