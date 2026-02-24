import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  X,
  Loader2,
  Calendar,
  Gamepad2,
  Trophy,
  Ticket,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

export function NotificacoesModal({ onClose }: { onClose: () => void }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/notificacoes');
        if (res.ok) {
          const data = await res.json();
          setNotificacoes(data.notificacoes || data || []);
        }
      } catch (e) {
        console.error('Erro ao carregar notificacoes:', e);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarTodasLidas = async () => {
    try {
      await fetch('/api/notificacoes/marcar-lidas', { method: 'POST' });
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    } catch (e) {
      console.error('Erro ao marcar como lidas:', e);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'evento_novo': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'jogo_novo': return <Gamepad2 className="h-4 w-4 text-green-500" />;
      case 'sorteio': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'participacao': return <Ticket className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="w-full max-w-sm mt-16"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificacoes
                {naoLidas > 0 && (
                  <Badge variant="destructive" className="ml-1">{naoLidas}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {naoLidas > 0 && (
                  <Button variant="ghost" size="sm" onClick={marcarTodasLidas}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sem notificacoes de momento</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notificacoes.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-3 rounded-lg border text-sm transition-colors',
                        notif.lida ? 'bg-background' : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {getTipoIcon(notif.tipo)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{notif.titulo}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{notif.mensagem}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(notif.createdAt).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        {!notif.lida && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
