import { useState, useCallback } from 'react';
import { Jogo, Participacao, Aldeia, Evento } from '@/types/project';

export function useDashboardData() {
  const [jogosPublicos, setJogosPublicos] = useState<Jogo[]>([]);
  const [minhasParticipacoes, setMinhasParticipacoes] = useState<Participacao[]>([]);
  const [aldeias, setAldeias] = useState<Aldeia[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [jogosAdmin, setJogosAdmin] = useState<Jogo[]>([]);
  const [vendasVendedor, setVendasVendedor] = useState<Participacao[]>([]);

  const fetchPublicGames = useCallback(async () => {
    try {
      const res = await fetch('/api/jogos');
      const data = await res.json();
      setJogosPublicos(Array.isArray(data) ? data.filter((j: Jogo) => j.estado === 'ativo' || j.estado === 'terminado') : []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }, []);

  return {
    jogosPublicos,
    setJogosPublicos,
    minhasParticipacoes,
    setMinhasParticipacoes,
    aldeias,
    setAldeias,
    eventos,
    setEventos,
    jogosAdmin,
    setJogosAdmin,
    vendasVendedor,
    setVendasVendedor,
    fetchPublicGames
  };
}
