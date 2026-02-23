import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { User, Participacao, Jogo } from '@/types/project';

export function useParticipacoes(user: User | null, onParticipacaoSuccess?: () => void) {
  const [minhasParticipacoes, setMinhasParticipacoes] = useState<Participacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [participacaoLoading, setParticipacaoLoading] = useState(false);

  const fetchMinhasParticipacoes = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/participacoes?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMinhasParticipacoes(data);
      }
    } catch (error) {
      console.error('Error fetching participations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleParticipar = useCallback(async (
    jogo: Jogo,
    dados: any,
    metodo: string,
    telefone: string,
    adminParaCliente: boolean = false,
    clienteInfo: any = {}
  ) => {
    setParticipacaoLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/participacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jogoId: jogo.id,
          dadosParticipacao: dados,
          valorPago: jogo.precoParticipacao,
          metodoPagamento: metodo,
          telefoneMbway: metodo === 'mbway' ? telefone : null,
          adminParaCliente,
          ...clienteInfo
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao participar');
        return false;
      }

      toast.success(data.mensagem || 'Participação registada!');
      if (onParticipacaoSuccess) onParticipacaoSuccess();
      return true;
    } catch (error) {
      toast.error('Erro de ligação');
      return false;
    } finally {
      setParticipacaoLoading(false);
    }
  }, [onParticipacaoSuccess]);

  const handleRevelarRaspadinha = useCallback(async (participacaoId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/participacoes/${participacaoId}/revelar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        return data.resultado;
      }
      toast.error(data.error || 'Erro ao revelar');
    } catch (error) {
      toast.error('Erro de ligação');
    }
    return null;
  }, []);

  return {
    minhasParticipacoes,
    setMinhasParticipacoes,
    loading,
    participacaoLoading,
    fetchMinhasParticipacoes,
    handleParticipar,
    handleRevelarRaspadinha
  };
}
