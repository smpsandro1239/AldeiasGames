import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Aldeia, Evento } from '@/types/project';

export function useOrgData() {
  const [organizacoes, setOrganizacoes] = useState<Aldeia[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resOrg, resEv] = await Promise.all([
        fetch('/api/aldeias'),
        fetch('/api/eventos')
      ]);

      const orgsData = await resOrg.json();
      const evsData = await resEv.json();

      const orgs = Array.isArray(orgsData) ? orgsData : (orgsData?.dados ?? []);
      const evs = Array.isArray(evsData) ? evsData : (evsData?.dados ?? []);

      setOrganizacoes(orgs);
      setEventos(evs);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados do servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => fetchData();

  return {
    organizacoes,
    setOrganizacoes,
    eventos,
    setEventos,
    loading,
    refresh
  };
}
