'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function JogadorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jogos, setJogos] = useState([])
  const [saldo, setSaldo] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    if (!['PLAYER', 'SUPERADMIN'].includes(session.user.role)) {
      router.push('/dashboard')
      return
    }

    fetchDados()
  }, [session, status, router])

  const fetchDados = async () => {
    try {
      const [jogosResponse, saldoResponse] = await Promise.all([
        fetch('/api/jogos'),
        fetch('/api/saldo')
      ])

      const jogosData = await jogosResponse.json()
      const saldoData = await saldoResponse.json()

      if (jogosData.success) {
        setJogos(jogosData.data.filter(j => j.status === 'ATIVO'))
      }

      if (saldoData.success && saldoData.data) {
        setSaldo(saldoData.data.saldo || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecarregarSaldo = async () => {
    try {
      const valor = prompt('Valor a recarregar (máx 10000):')
      if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
        alert('Valor inválido')
        return
      }

      const response = await fetch('/api/saldo/recarregar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valor: parseFloat(valor), metodoPagamento: 'MBWAY' })
      })

      const data = await response.json()
      if (response.ok) {
        alert(`Saldo recarregado com sucesso! Novo saldo: ${data.data.novoSaldo.toFixed(2)}`)
        fetchDados()
      } else {
        alert(data.error || 'Erro ao recarregar')
      }
    } catch (error) {
      alert('Erro ao processar recarga')
    }
  }

  const handleComprarJogo = async (jogoId: string, tipo: string) => {
    try {
      const detalhes = await getDetalhesJogo(tipo)
      
      const response = await fetch('/api/jogadas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jogoId,
          tipoJogo: tipo,
          detalhes,
          valor: getPrecoJogo(tipo),
          metodoPagamento: 'SALDO'
        })
      })

      const data = await response.json()
      if (response.ok) {
        alert('Compra efetuada com sucesso!')
        fetchDados()
      } else {
        alert(data.error || 'Erro na compra')
      }
    } catch (error) {
      alert('Erro ao processar compra')
    }
  }

  const getDetalhesJogo = (tipo: string) => {
    switch (tipo) {
      case 'RIFA':
        return { numeros: [Math.floor(Math.random() * 200) + 1] }
      case 'POIO':
        return { coordenadaX: Math.floor(Math.random() * 20) + 1, coordenadaY: Math.floor(Math.random() * 20) + 1 }
      case 'RASPADINHA':
        return { quantidade: 1 }
      default:
        return {}
    }
  }

  const getPrecoJogo = (tipo: string) => {
    const precos = {
      RIFA: 2.00,
      POIO: 1.50,
      RASPADINHA: 5.00
    }
    return precos[tipo as keyof typeof precos] || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">A carregar...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aldeias Games</h1>
            <p className="text-gray-600">Seja bem-vindo, {session?.user?.name || 'Jogador'}!</p>
          </div>
          <button
            onClick={handleRecarregarSaldo}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Recarregar Saldo
          </button>
        </header>

        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Saldo Atual</h2>
            <div className="text-2xl font-bold text-green-600">{saldo.toFixed(2)} €</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jogos.map(jogo => (
            <div key={jogo.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2">{jogo.nome}</h3>
              <p className="text-gray-600 mb-4">{jogo.descricao}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">{getPrecoJogo(jogo.tipo)} €</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {jogo.tipo}
                </span>
              </div>
              <button
                onClick={() => handleComprarJogo(jogo.id, jogo.tipo)}
                disabled={saldo < getPrecoJogo(jogo.tipo)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saldo < getPrecoJogo(jogo.tipo) 
                  ? `Saldo insuficiente (${getPrecoJogo(jogo.tipo)} €)`
                  : 'Comprar Agora'
                }
              </button>
            </div>
          ))}
        </div>

        {jogos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum jogo ativo disponível.</p>
          </div>
        )}
      </div>
    </div>
  )
}