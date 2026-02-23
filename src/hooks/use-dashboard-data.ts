import { useState, useEffect, useCallback } from 'react';

export function useDashboardData(user: any) {
  const [stats, setStats] = useState<any>(null);
  const [globalActivity, setGlobalActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/stats/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setGlobalActivity(data.activity || []);
      }
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, globalActivity, loading, refresh: fetchData };
}
