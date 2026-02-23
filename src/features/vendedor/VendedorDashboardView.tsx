import React from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, Users, Euro, Gamepad2, Ticket, History, ShoppingBag, Eye, Search, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User, Jogo, Participacao, Aldeia, Evento } from '@/types/project';

import { EmptyState } from "@/components/common-ui";
export const VendedorDashboardView = ({
  vendasVendedor,
  setActiveView,
  openJogoDetalhe
}: any) => {

    const totalVendas = vendasVendedor.length;
    const totalAngariado = vendasVendedor.reduce((sum, v) => sum + v.valorPago, 0);
    const vendasHoje = vendasVendedor.filter(v => {
      const today = new Date();
      const vendaDate = new Date(v.createdAt);
      return vendaDate.toDateString() === today.toDateString();
    }).length;

    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
              Painel de Vendedor
            </h2>
            <p className="text-muted-foreground">As suas vendas e métricas</p>
          </div>
          <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700">Vendedor</Badge>
        </div>

        {/* Métricas Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-600">Total Angariado</CardDescription>
              <CardTitle className="text-3xl text-blue-700">{totalAngariado.toFixed(2)}€</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <TrendingUp className="h-4 w-4" />
                <span>{totalVendas} participações vendidas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-600">Vendas Hoje</CardDescription>
              <CardTitle className="text-3xl text-green-700">{vendasHoje}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>Vendas de hoje</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-600">Total de Vendas</CardDescription>
              <CardTitle className="text-3xl text-purple-700">{totalVendas}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <Ticket className="h-4 w-4" />
                <span>Participações registadas</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Últimas Vendas
            </CardTitle>
            <CardDescription>
              Participações registadas por si para clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vendasVendedor.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Sem vendas registadas"
                description="Quando registar participações para clientes, elas aparecerão aqui"
                action={<Button onClick={() => setActiveView('public')}>Ver Jogos</Button>}
              />
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {vendasVendedor.slice(0, 20).map((venda, index) => {
                  const gameType = GAME_TYPES[venda.jogo?.tipo as keyof typeof GAME_TYPES] || GAME_TYPES.rifa;
                  return (
                    <motion.div
                      key={venda.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                          {gameType.emoji}
                        </div>
                        <div>
                          <p className="font-medium">
                            {venda.jogo?.tipo === 'poio_vaca'
                              ? `${venda.dadosParticipacao?.letra}${venda.dadosParticipacao?.numero}`
                              : `Nº ${venda.dadosParticipacao?.numero}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {venda.nomeCliente || 'Cliente não identificado'}
                            {venda.telefoneCliente && <span className="ml-2">• {venda.telefoneCliente}</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(venda.createdAt).toLocaleDateString('pt-PT')} • {venda.metodoPagamento}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{venda.valorPago}€</p>
                        <Badge variant="outline" className="text-xs">
                          {venda.jogo?.evento?.nome || 'Evento'}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => setActiveView('public')}
              >
                <Gamepad2 className="h-6 w-6" />
                <span>Ver Jogos</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => setActiveView('my-games')}
              >
                <Ticket className="h-6 w-6" />
                <span>Minhas Participações</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };
