/**
 * ClienteHistoricoPremios.tsx
 * Histórico de prémios do cliente
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Gift, 
  CheckCircle, 
  Clock,
  Trophy,
  Filter
} from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';

interface Premio {
  id: string;
  titulo: string;
  descricao?: string;
  valor?: number;
  estado: string;
  dataResgate?: string;
  createdAt: string;
  aldeia?: {
    nome: string;
  };
  jogos?: Array<{
    titulo: string;
  }>;
}

interface HistoricoData {
  premios: Premio[];
  participacoes: any[];
  totalPremios: number;
  totalResgatados: number;
}

export function ClienteHistoricoPremios() {
  const [historico, setHistorico] = useState<HistoricoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'resgatados' | 'pendentes'>('todos');

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const response = await fetch('/api/premios/historico');
      if (response.ok) {
        const data = await response.json();
        setHistorico(data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPremioIcon = (estado: string) => {
    if (estado === 'resgatado') {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    return <Clock className="w-6 h-6 text-yellow-500" />;
  };

  const filteredPremios = () => {
    if (!historico) return [];
    
    switch (filtro) {
      case 'resgatados':
        return historico.premios.filter(p => p.dataResgate);
      case 'pendentes':
        return historico.premios.filter(p => !p.dataResgate);
      default:
        return historico.premios;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Os Meus Prémios</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filtro === 'todos' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('resgatados')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filtro === 'resgatados' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Resgatados
          </button>
          <button
            onClick={() => setFiltro('pendentes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filtro === 'pendentes' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Pendentes
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UICard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{historico?.totalPremios || 0}</p>
            <p className="text-sm text-gray-500">Total de Prémios</p>
          </div>
        </UICard>

        <UICard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{historico?.totalResgatados || 0}</p>
            <p className="text-sm text-gray-500">Resgatados</p>
          </div>
        </UICard>

        <UICard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {(historico?.totalPremios || 0) - (historico?.totalResgatados || 0)}
            </p>
            <p className="text-sm text-gray-500">Por Resgatar</p>
          </div>
        </UICard>
      </div>

      {/* Lista de Prémios */}
      {filteredPremios().length === 0 ? (
        <UICard className="p-8 text-center">
          <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">
            {filtro === 'todos' 
              ? 'Ainda não ganhaste nenhum prémio' 
              : filtro === 'resgatados'
                ? 'Não tens prémios resgatados'
                : 'Não tens prémios pendentes'}
          </h3>
          <p className="text-gray-400 mt-2">
            Participa em jogos para teres a chance de ganhar!
          </p>
        </UICard>
      ) : (
        <div className="space-y-4">
          {filteredPremios().map((premio) => (
            <UICard key={premio.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    premio.dataResgate ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {getPremioIcon(premio.estado)}
                  </div>
                  
                  <div>
                    <h4 className="font-bold">{premio.titulo}</h4>
                    {premio.descricao && (
                      <p className="text-sm text-gray-500">{premio.descricao}</p>
                    )}
                    <div className="flex gap-3 mt-1">
                      {premio.aldeia && (
                        <span className="text-xs text-gray-400">{premio.aldeia.nome}</span>
                      )}
                      {premio.jogos && premio.jogos.length > 0 && (
                        <span className="text-xs text-gray-400">
                          Jogo: {premio.jogos[0].titulo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {premio.valor && (
                    <p className="font-bold text-lg">€{premio.valor.toFixed(2)}</p>
                  )}
                  {premio.dataResgate ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Resgatado em {new Date(premio.dataResgate).toLocaleDateString('pt-PT')}
                    </p>
                  ) : (
                    <p className="text-sm text-yellow-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Por Resgatar
                    </p>
                  )}
                </div>
              </div>
            </UICard>
          ))}
        </div>
      )}
    </div>
  );
}
