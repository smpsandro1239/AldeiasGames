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
        fetch('/api/organizacoes'),
        fetch('/api/eventos')
      ]);

      const orgs = await resOrg.json();
      const evs = await resEv.json();

      if (Array.isArray(orgs)) setOrganizacoes(orgs);
      if (Array.isArray(evs)) setEventos(evs);
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
