import { useCallback } from 'react';
import { toast } from 'sonner';

export function useReports() {
  const exportToExcel = useCallback(async (type: string, id?: string) => {
    toast.info('A gerar relatório...');
    try {
      const token = localStorage.getItem('token');
      const query = id ? `?id=${id}` : '';
      const res = await fetch(`/api/reports/export/${type}${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Falha no download');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao exportar relatório');
    }
  }, []);

  return { exportToExcel };
}
