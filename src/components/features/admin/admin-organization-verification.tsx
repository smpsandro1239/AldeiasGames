/**
 * AdminOrganizationVerification.tsx
 * Componente de Verificação/Aprovação de Organizações para Admin
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  MapPin, 
  Users,
  Calendar,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { UIButton, UICard, UIBadge, UIInput } from '@/components/ui-components';
import { Aldeia } from '@/types/project';

interface AdminOrganizationVerificationProps {
  onVerify?: (id: string, verificada: boolean) => Promise<void>;
}

export function AdminOrganizationVerification({ onVerify }: AdminOrganizationVerificationProps) {
  const [organizacoes, setOrganizacoes] = useState<Aldeia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'verificadas'>('pendentes');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarOrganizacoes();
  }, [filtro]);

  const carregarOrganizacoes = async () => {
    try {
      setLoading(true);
      const endpoint = filtro === 'todas' 
        ? '/api/aldeias' 
        : `/api/aldeias/pendentes?pendentes=${filtro === 'pendentes'}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      setOrganizacoes(data);
    } catch (error) {
      console.error('Erro ao carregar organizações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async (id: string, verificada: boolean) => {
    try {
      const res = await fetch(`/api/aldeias/${id}/verificar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificada })
      });

      if (res.ok) {
        // Atualizar lista local
        setOrganizacoes(prev => 
          prev.map(org => 
            org.id === id ? { ...org, verificada } : org
          )
        );
      }
    } catch (error) {
      console.error('Erro ao verificar organização:', error);
    }
  };

  const organizacoesFiltradas = organizacoes.filter(org =>
    org.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.localizacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      aldeia: 'Aldeia',
      escola: 'Escola',
      associacao_pais: 'Associação de Pais',
      Clube: 'Clube'
    };
    return labels[tipo] || tipo;
  };

  const getStatusBadge = (verificada: boolean) => {
    return verificada ? (
      <UIBadge className="bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3 mr-1" /> Verificada
      </UIBadge>
    ) : (
      <UIBadge className="bg-amber-100 text-amber-700">
        <Clock className="w-3 h-3 mr-1" /> Pendente
      </UIBadge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Verificação de Organizações</h1>
          <p className="text-gray-500">Aprovar ou rejeitar organizações que querem usar a plataforma</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <UIInput
            placeholder="Pesquisar organizações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <UIButton 
            variant={filtro === 'pendentes' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFiltro('pendentes')}
          >
            <Clock className="w-4 h-4 mr-1" /> Pendentes
          </UIButton>
          <UIButton 
            variant={filtro === 'verificadas' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFiltro('verificadas')}
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Verificadas
          </UIButton>
          <UIButton 
            variant={filtro === 'todas' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFiltro('todas')}
          >
            Todas
          </UIButton>
        </div>
      </div>

      {/* Lista de Organizações */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">A carregar...</div>
      ) : organizacoesFiltradas.length === 0 ? (
        <UICard className="p-8 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma organização encontrada</p>
        </UICard>
      ) : (
        <div className="space-y-4">
          {organizacoesFiltradas.map((org) => (
            <UICard key={org.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Info Principal */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={org.nome} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building2 className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{org.nome}</h3>
                      {getStatusBadge(org.verificada)}
                    </div>
                    <p className="text-sm text-gray-500">{getTipoLabel(org.tipoOrganizacao)}</p>
                    {org.descricao && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{org.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {org.localizacao && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {org.localizacao}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(org.createdAt).toLocaleDateString('pt-PT')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {org._count?.users || 0} membros
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {org._count?.eventos || 0} eventos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                {!org.verificada && (
                  <div className="flex gap-2 lg:flex-shrink-0">
                    <UIButton 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleVerificar(org.id, false)}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                    </UIButton>
                    <UIButton 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerificar(org.id, true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                    </UIButton>
                  </div>
                )}
              </div>
            </UICard>
          ))}
        </div>
      )}
    </div>
  );
}
