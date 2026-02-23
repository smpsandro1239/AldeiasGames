import React from 'react';
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
  Ticket
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotificacoesModal({
  open,
  onClose,
  notificacoes,
  naoLidas,
  onMarcarLidas,
  loading
}: {
  open: boolean;
  onClose: () => void;
  notificacoes: any[];
  naoLidas: number;
  onMarcarLidas: () => void;
  loading: boolean;
}) {
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'evento_novo': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'jogo_novo': return <Gamepad2 className="h-4 w-4 text-green-500" />;
      case 'sorteio': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'participacao': return <Ticket className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoBg = (tipo: string) => {
    switch (tipo) {
      case 'evento_novo': return 'bg-blue-50 dark:bg-blue-950';
      case 'jogo_novo': return 'bg-green-50 dark:bg-green-950';
      case 'sorteio': return 'bg-yellow-50 dark:bg-yellow-950';
      case 'participacao': return 'bg-purple-50 dark:bg-purple-950';
      default: return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle className="text-lg">Notificações</CardTitle>
                  {naoLidas > 0 && (
                    <Badge variant="destructive" className="ml-2">{naoLidas}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {naoLidas > 0 && (
                    <Button variant="ghost" size="sm" onClick={onMarcarLidas}>
                      Marcar lidas
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">A carregar...</span>
                  </div>
                ) : notificacoes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Sem notificações</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notificacoes.map((n, idx) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "p-3 rounded-lg border",
                          n.lida ? "bg-background" : getTipoBg(n.tipo),
                          !n.lida && "border-l-4 border-l-primary"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getTipoIcon(n.tipo)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{n.titulo}</p>
                            <p className="text-xs text-muted-foreground mt-1">{n.mensagem}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(n.createdAt).toLocaleString('pt-PT')}
                            </p>
                          </div>
                          {!n.lida && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
