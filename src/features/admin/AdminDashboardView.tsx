import React from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, Calendar, Gamepad2, Users, Trophy, TrendingUp, Eye, Target,
  Settings, Database, History, Activity, BarChart3, Building, School, FileText,
  Search, Download, Trash2, RotateCcw, Loader2, Shield, MapPin, Gift, Euro, Ticket, PieChart, CreditCard, Save, CheckCircle2, X, Monitor, Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User, Jogo, Participacao, Aldeia, Evento } from '@/types/project';
import { EmptyState } from '@/components/common-ui';
import { FundingGoal } from '@/components/funding-goal';

export const AdminDashboardView = ({
  user,
  dashboardStats,
  dashboardLoading,
  activeAdminTab,
  setActiveAdminTab,
  eventos,
  jogosAdmin,
  aldeias,
  premios,
  logs,
  logsLoading,
  logsStats,
  backups,
  backupsLoading,
  openCreateModal,
  openEventoDetalheModal,
  openPremioModal,
  handleDeletePremio,
  handleCreateBackup,
  handleRestoreBackup,
  handleDeleteBackup,
  fetchDashboardStats,
  selectedYear,
  setSelectedYear,
  compareYear,
  setCompareYear,
  yearComparison,
  selectedEventId,
  setSelectedEventId,
  eventStats,
  eventStatsLoading,
  exportData,
  exportLoading,
  backupCreating,
  backupRestoring,
  backupDeleting
}: any) => {
  return (

    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-green-600" />
            Painel de Administração
          </h2>
          <p className="text-muted-foreground">Gerir aldeias, eventos e jogos</p>
        </div>
        <Badge variant="outline" className="font-mono">{user?.role}</Badge>
      </div>

      {!user ? (
        <EmptyState
          icon={Users}
          title="Inicie sessão"
          description="Faça login como administrador para aceder a esta área"
          action={<Button onClick={() => setAuthModalOpen(true)}>Entrar</Button>}
        />
      ) : !['super_admin', 'aldeia_admin'].includes(user.role) ? (
        <EmptyState
          icon={Award}
          title="Acesso restrito"
          description="Apenas administradores podem aceder a esta área"
        />
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={(value) => {
          if (value === 'backups' && user?.role === 'super_admin') {
            fetchBackups();
          }
          if (value === 'dashboard') {
            fetchDashboardStats();
          }
        }}>
          <TabsList className={cn(
            "grid w-full",
            user?.role === 'super_admin' ? "grid-cols-8" : "grid-cols-6"
          )}>
            <TabsTrigger value="dashboard" className="gap-2" onClick={() => fetchDashboardStats()}>
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="jogos" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="eventos" className="gap-2">
              <Calendar className="h-4 w-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="aldeias" className="gap-2">
              <MapPin className="h-4 w-4" />
              Aldeias
            </TabsTrigger>
            <TabsTrigger value="vendedores" className="gap-2">
              <Users className="h-4 w-4" />
              Vendedores
            </TabsTrigger>
            <TabsTrigger value="premios" className="gap-2" onClick={() => fetchPremios()}>
              <Gift className="h-4 w-4" />
              Prémios
            </TabsTrigger>
            {user?.role === 'super_admin' && (
              <TabsTrigger value="backups" className="gap-2" onClick={() => fetchBackups()}>
                <Database className="h-4 w-4" />
                Backups
              </TabsTrigger>
            )}
            {user?.role === 'super_admin' && (
              <TabsTrigger value="logs" className="gap-2" onClick={() => fetchLogs()}>
                <Activity className="h-4 w-4" />
                Logs
              </TabsTrigger>
            )}
          </TabsList>

          {/* Dashboard Tab (FASE 6) */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                {/* Organization Header */}
                {dashboardStats.organizacao && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
                    {dashboardStats.organizacao.logoBase64 ? (
                      <img
                        src={dashboardStats.organizacao.logoBase64}
                        alt="Logo"
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center text-white text-2xl">
                        {dashboardStats.organizacao.tipoOrganizacao === 'escola' ? '🏫' :
                         dashboardStats.organizacao.tipoOrganizacao === 'associacao_pais' ? '👨‍👩‍👧‍👦' :
                         dashboardStats.organizacao.tipoOrganizacao === 'clube' ? '⚽' : '🏘️'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{dashboardStats.organizacao.nome}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge className={cn(
                          dashboardStats.organizacao.tipoOrganizacao === 'aldeia' && "bg-green-500",
                          dashboardStats.organizacao.tipoOrganizacao === 'escola' && "bg-blue-500",
                          dashboardStats.organizacao.tipoOrganizacao === 'associacao_pais' && "bg-purple-500",
                          dashboardStats.organizacao.tipoOrganizacao === 'clube' && "bg-orange-500"
                        )}>
                          {dashboardStats.organizacao.tipoOrganizacao === 'aldeia' && 'Aldeia'}
                          {dashboardStats.organizacao.tipoOrganizacao === 'escola' && 'Escola'}
                          {dashboardStats.organizacao.tipoOrganizacao === 'associacao_pais' && 'Assoc. Pais'}
                          {dashboardStats.organizacao.tipoOrganizacao === 'clube' && 'Clube'}
                        </Badge>
                        {dashboardStats.organizacao.localidade && (
                          <span className="text-sm">• {dashboardStats.organizacao.localidade}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF Export Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExportPDF('dashboard')}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Exportar Relatório Geral (PDF)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportPDF('participacoes')}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Exportar Participações (PDF)
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <Euro className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Angariado</p>
                          <p className="text-xl font-bold">{dashboardStats.totalAngariado.toFixed(2)}€</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Ticket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Participações</p>
                          <p className="text-xl font-bold">{dashboardStats.totalParticipacoes}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Eventos Ativos</p>
                          <p className="text-xl font-bold">{dashboardStats.eventosAtivos}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Jogos Ativos</p>
                          <p className="text-xl font-bold">{dashboardStats.jogosAtivos}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Histórico Mensal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Evolução Mensal
                      </CardTitle>
                      <CardDescription>Últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardStats.historicoMensal.map((item, idx) => {
                          const maxValor = Math.max(...dashboardStats.historicoMensal.map(h => h.valor), 1);
                          const percent = (item.valor / maxValor) * 100;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{item.mes}</span>
                                <span className="font-medium">{item.valor.toFixed(2)}€</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percent}%` }}
                                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ranking Vendedores */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Top Vendedores
                      </CardTitle>
                      <CardDescription>Por valor angariado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardStats.rankingVendedores.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Sem dados de vendedores
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {dashboardStats.rankingVendedores.map((vendedor, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                idx === 0 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                                idx === 1 && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                                idx === 2 && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
                                idx > 2 && "bg-muted text-muted-foreground"
                              )}>
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{vendedor.nome}</p>
                                <p className="text-xs text-muted-foreground">{vendedor.vendas} vendas</p>
                              </div>
                              <p className="font-bold text-green-600">{vendedor.valor.toFixed(2)}€</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats for Schools */}
                {dashboardStats.organizacao?.tipoOrganizacao === 'escola' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <School className="h-5 w-5 text-blue-600" />
                        Informação Escolar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalVendedores}</p>
                          <p className="text-sm text-muted-foreground">Professores/Vendedores</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{dashboardStats.totalPremios}</p>
                          <p className="text-sm text-muted-foreground">Prémios Disponíveis</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{dashboardStats.totalEventos}</p>
                          <p className="text-sm text-muted-foreground">Campanhas</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                          <p className="text-2xl font-bold text-amber-600">{dashboardStats.totalJogos}</p>
                          <p className="text-sm text-muted-foreground">Jogos Realizados</p>
                        </div>
                      </div>
                      {dashboardStats.organizacao.nivelEnsino && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Nível de Ensino:</p>
                          <p className="font-medium capitalize">{dashboardStats.organizacao.nivelEnsino.replace('_', ' ')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Additional Stats for Clubs */}
                {dashboardStats.organizacao?.tipoOrganizacao === 'clube' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-600" />
                        Performance do Clube
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{dashboardStats.totalParticipacoes}</p>
                          <p className="text-sm text-muted-foreground">Participações</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{dashboardStats.totalAngariado.toFixed(0)}€</p>
                          <p className="text-sm text-muted-foreground">Angariado</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalVendedores}</p>
                          <p className="text-sm text-muted-foreground">Colaboradores</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Comparativo Ano a Ano */}
                {yearComparison && (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            Comparativo Ano a Ano
                          </CardTitle>
                          <CardDescription>Compare a evolução entre anos</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-3 py-1.5 text-sm border rounded-lg bg-background"
                          >
                            {[2024, 2025, 2026].map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <span className="text-muted-foreground">vs</span>
                          <select
                            value={compareYear}
                            onChange={(e) => setCompareYear(parseInt(e.target.value))}
                            className="px-3 py-1.5 text-sm border rounded-lg bg-background"
                          >
                            {[2022, 2023, 2024, 2025].map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Resumo da comparação */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">{selectedYear}</p>
                          <p className="text-2xl font-bold text-indigo-600">{yearComparison.selectedYear.total.toFixed(2)}€</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">{compareYear}</p>
                          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{yearComparison.compareYear.total.toFixed(2)}€</p>
                        </div>
                        <div className={cn(
                          "text-center p-4 rounded-lg",
                          yearComparison.variacao >= 0
                            ? "bg-green-50 dark:bg-green-950"
                            : "bg-red-50 dark:bg-red-950"
                        )}>
                          <p className="text-sm text-muted-foreground mb-1">Variação</p>
                          <p className={cn(
                            "text-2xl font-bold flex items-center justify-center gap-1",
                            yearComparison.variacao >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {yearComparison.variacao >= 0 ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingUp className="h-5 w-5 rotate-180" />
                            )}
                            {Math.abs(yearComparison.variacao).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Gráfico de barras comparativo */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                            <span className="text-sm text-muted-foreground">{selectedYear}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            <span className="text-sm text-muted-foreground">{compareYear}</span>
                          </div>
                        </div>

                        {yearComparison.selectedYear.meses.map((mes, idx) => {
                          const maxValor = Math.max(
                            ...yearComparison.selectedYear.meses.map(m => m.valor),
                            ...yearComparison.compareYear.meses.map(m => m.valor),
                            1
                          );
                          const percentSelected = (mes.valor / maxValor) * 100;
                          const percentCompare = (yearComparison.compareYear.meses[idx].valor / maxValor) * 100;

                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize w-12">{mes.mes}</span>
                                <div className="flex gap-4 text-right">
                                  <span className="font-medium text-indigo-600 w-20">{mes.valor.toFixed(2)}€</span>
                                  <span className="text-muted-foreground w-20">{yearComparison.compareYear.meses[idx].valor.toFixed(2)}€</span>
                                </div>
                              </div>
                              <div className="flex gap-1 h-3">
                                <div className="flex-1 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentSelected}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.03 }}
                                    className="h-full bg-indigo-500 rounded-full"
                                  />
                                </div>
                                <div className="flex-1 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentCompare}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.03 + 0.1 }}
                                    className="h-full bg-gray-300 dark:bg-gray-600 rounded-full"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Gráficos Detalhados por Evento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-600" />
                      Análise por Evento
                    </CardTitle>
                    <CardDescription>Selecione um evento para ver estatísticas detalhadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                      >
                        <option value="">Selecione um evento...</option>
                        {eventos.map(e => (
                          <option key={e.id} value={e.id}>{e.nome} ({e.estado})</option>
                        ))}
                      </select>
                    </div>

                    {eventStatsLoading && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span className="text-muted-foreground">A carregar estatísticas...</span>
                      </div>
                    )}

                    {eventStats && !eventStatsLoading && (
                      <div className="space-y-6">
                        {/* Resumo do Evento */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{eventStats.totalParticipacoes}</p>
                            <p className="text-sm text-muted-foreground">Participações</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{eventStats.totalAngariado.toFixed(2)}€</p>
                            <p className="text-sm text-muted-foreground">Total Angariado</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{eventStats.jogosStats.length}</p>
                            <p className="text-sm text-muted-foreground">Jogos</p>
                          </div>
                          <div className="text-center p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                            <p className="text-2xl font-bold text-amber-600">
                              {eventStats.totalParticipacoes > 0
                                ? (eventStats.totalAngariado / eventStats.totalParticipacoes).toFixed(2)
                                : '0.00'}€
                            </p>
                            <p className="text-sm text-muted-foreground">Ticket Médio</p>
                          </div>
                        </div>

                        {/* Gráfico de Jogos e evolução diária */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Jogos do Evento */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Gamepad2 className="h-4 w-4" />
                              Jogos do Evento
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {eventStats.jogosStats.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {GAME_TYPES[item.jogo.tipo as keyof typeof GAME_TYPES]?.emoji || '🎲'}
                                    </span>
                                    <div>
                                      <p className="font-medium capitalize text-sm">{item.jogo.tipo.replace('_', ' ')}</p>
                                      <p className="text-xs text-muted-foreground">{item.participacoes} participações</p>
                                    </div>
                                  </div>
                                  <p className="font-bold text-green-600">{item.angariado.toFixed(2)}€</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Métodos de Pagamento */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Métodos de Pagamento
                            </h4>
                            <div className="space-y-3">
                              {eventStats.metodosPagamento.map((m, idx) => {
                                const totalMetodos = eventStats.metodosPagamento.reduce((sum, mm) => sum + mm.total, 0);
                                const percent = totalMetodos > 0 ? (m.total / totalMetodos) * 100 : 0;
                                return (
                                  <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="flex items-center gap-2">
                                        {m.metodo === 'MBWay' ? (
                                          <span className="text-blue-600 font-bold">MB</span>
                                        ) : (
                                          <Euro className="h-4 w-4 text-green-600" />
                                        )}
                                        {m.metodo}
                                      </span>
                                      <span>{m.total} ({percent.toFixed(0)}%)</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 0.5 }}
                                        className={cn(
                                          "h-full rounded-full",
                                          m.metodo === 'MBWay' ? "bg-blue-500" : "bg-green-500"
                                        )}
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-right">{m.valor.toFixed(2)}€</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Evolução Diária */}
                        {eventStats.evolucaoDiaria.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Evolução Diária (Últimos 30 dias)
                            </h4>
                            <div className="space-y-2">
                              {eventStats.evolucaoDiaria.slice(-14).map((dia, idx) => {
                                const maxValor = Math.max(...eventStats.evolucaoDiaria.map(d => d.valor), 1);
                                const percent = (dia.valor / maxValor) * 100;
                                return (
                                  <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{dia.dia}</span>
                                      <div className="flex gap-4">
                                        <span className="text-muted-foreground">{dia.participacoes} part.</span>
                                        <span className="font-medium text-green-600">{dia.valor.toFixed(2)}€</span>
                                      </div>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 0.3, delay: idx * 0.02 }}
                                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="jogos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Jogos ({jogosAdmin.length})</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExportCSV('participacoes')} className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
                <Button onClick={() => openCreateModal('jogo')} className="gap-2">
                  <Plus className="h-4 w-4" /> Novo Jogo
                </Button>
              </div>
            </div>

            {jogosAdmin.length === 0 ? (
              <EmptyState
                icon={Gamepad2}
                title="Sem jogos"
                description="Crie um jogo para começar a angariar fundos"
              />
            ) : (
              <div className="grid gap-4">
                {jogosAdmin.map((jogo) => (
                  <Card key={jogo.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xl">
                            {GAME_TYPES[jogo.tipo as keyof typeof GAME_TYPES]?.emoji || '🎲'}
                          </div>
                          <div>
                            <p className="font-semibold capitalize">{jogo.tipo.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              {jogo.evento?.nome} • {jogo.evento?.aldeia?.nome}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            jogo.estado === 'ativo' ? 'default' :
                            jogo.estado === 'fechado' ? 'secondary' : 'outline'
                          }>
                            {jogo.estado}
                          </Badge>
                          {jogo.estado === 'fechado' && !jogo.sorteio && (
                            <Button size="sm" onClick={() => handleSorteio(jogo.id)}>
                              <Trophy className="h-4 w-4 mr-1" /> Sortear
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="eventos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Eventos ({eventos.length})</h3>
              <Button onClick={() => openCreateModal('evento')} className="gap-2">
                <Plus className="h-4 w-4" /> Novo Evento
              </Button>
            </div>

            {eventos.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Sem eventos"
                description="Crie um evento para organizar jogos"
              />
            ) : (
              <div className="grid gap-4">
                {eventos.map((evento) => (
                  <Card key={evento.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {evento.imagemBase64 ? (
                            <img
                              src={evento.imagemBase64}
                              alt={evento.nome}
                              className="w-10 h-10 object-cover rounded-full border-2 border-blue-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{evento.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {evento.aldeia?.nome} • {new Date(evento.dataInicio).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{evento._count?.jogos || 0} jogos</Badge>
                          {evento.objectivoAngariacao && (
                            <div className="w-full max-w-[200px]">
                              <FundingGoal
                                current={0} // Ideally we'd pass stats here
                                target={evento.objectivoAngariacao}
                                label="Objectivo"
                              />
                            </div>
                          )}
                          <Badge variant={
                            evento.estado === 'ativo' ? 'default' : 'outline'
                          }>
                            {evento.estado}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEventoDetalheModal(evento)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Detalhes</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="aldeias" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Organizações ({aldeias.length})</h3>
              {user?.role === 'super_admin' && (
                <Button onClick={() => openCreateModal('aldeia')} className="gap-2">
                  <Plus className="h-4 w-4" /> Nova Organização
                </Button>
              )}
            </div>

            {aldeias.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="Sem organizações"
                description={user?.role === 'super_admin' ? "Crie uma organização para começar" : "Contacte o super admin para criar organizações"}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {aldeias.map((aldeia) => {
                  const tipoIcon: Record<string, string> = {
                    aldeia: '🏘️',
                    escola: '🏫',
                    associacao_pais: '👨‍👩‍👧‍👦',
                    clube: '⚽'
                  };
                  const tipoLabel: Record<string, string> = {
                    aldeia: 'Aldeia',
                    escola: 'Escola',
                    associacao_pais: 'Assoc. Pais',
                    clube: 'Clube'
                  };
                  const tipoBg: Record<string, string> = {
                    aldeia: 'bg-green-100 dark:bg-green-900',
                    escola: 'bg-blue-100 dark:bg-blue-900',
                    associacao_pais: 'bg-purple-100 dark:bg-purple-900',
                    clube: 'bg-orange-100 dark:bg-orange-900'
                  };
                  const tipo = aldeia.tipoOrganizacao || 'aldeia';

                  return (
                    <Card key={aldeia.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {aldeia.logoBase64 ? (
                            <img
                              src={aldeia.logoBase64}
                              alt={aldeia.nome}
                              className="w-12 h-12 object-cover rounded-full border-2 border-green-200"
                            />
                          ) : aldeia.logoUrl ? (
                            <img
                              src={aldeia.logoUrl}
                              alt={aldeia.nome}
                              className="w-12 h-12 object-cover rounded-full border-2 border-green-200"
                            />
                          ) : (
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", tipoBg[tipo])}>
                              <span className="text-xl">{tipoIcon[tipo]}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate">{aldeia.nome}</p>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {tipoLabel[tipo]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {aldeia.localizacao || aldeia.morada || aldeia.localidade || 'Sem localização'}
                            </p>
                          </div>
                          <div className="flex gap-1 sm:gap-2 shrink-0">
                            <Badge variant="secondary" className="text-xs">{aldeia._count?.eventos || 0} eventos</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openOrgDetalheModal(aldeia)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">Detalhes</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vendedores" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Vendedores ({vendedores.length})</h3>
              <Button onClick={() => setNovoVendedorModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Novo Vendedor
              </Button>
            </div>

            {vendedores.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sem vendedores"
                description="Adicione vendedores para ajudar na angariação de fundos"
                action={<Button onClick={() => setNovoVendedorModalOpen(true)}>Adicionar Vendedor</Button>}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {vendedores.map((vendedor) => (
                  <Card key={vendedor.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{vendedor.nome}</p>
                          <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Criado em {new Date(vendedor.createdAt).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          Vendedor
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {user?.role === 'super_admin' && (
            <TabsContent value="backups" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Gestão de Backups
                </h3>
                <Button
                  onClick={handleCreateBackup}
                  className="gap-2"
                  disabled={backupCreating}
                >
                  {backupCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Criar Backup
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardDescription>
                    Faça backups regulares da base de dados para prevenir perda de dados.
                    Os backups são armazenados no servidor.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {backupsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-muted-foreground">A carregar backups...</span>
                    </div>
                  ) : backups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum backup disponível</p>
                      <p className="text-sm">Clique em "Criar Backup" para fazer o primeiro backup</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {backups.map((backup) => (
                        <div
                          key={backup.nome}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{backup.nome}</p>
                              <p className="text-xs text-muted-foreground">
                                {(backup.tamanho / 1024).toFixed(2)} KB • {new Date(backup.criadoEm).toLocaleString('pt-PT')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestoreBackup(backup.nome)}
                              disabled={backupRestoring === backup.nome || backupDeleting === backup.nome}
                              className="gap-1"
                            >
                              {backupRestoring === backup.nome ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                              Restaurar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteBackup(backup.nome)}
                              disabled={backupRestoring === backup.nome || backupDeleting === backup.nome}
                              className="gap-1"
                            >
                              {backupDeleting === backup.nome ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {user?.role === 'super_admin' && (
            <TabsContent value="logs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Logs de Acesso
                </h3>
              </div>

              {/* Stats */}
              {logsStats && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-green-600">Logins Hoje</CardDescription>
                      <CardTitle className="text-3xl text-green-700">{logsStats.loginsHoje}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-blue-600">Total Logins</CardDescription>
                      <CardTitle className="text-3xl text-blue-700">{logsStats.totalLogins}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-red-600">Tentativas Falhadas</CardDescription>
                      <CardTitle className="text-3xl text-red-700">{logsStats.totalFalhas}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardDescription>
                    Histórico de tentativas de login no sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-muted-foreground">A carregar logs...</span>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum log disponível</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              log.sucesso
                                ? "bg-green-100 dark:bg-green-900"
                                : "bg-red-100 dark:bg-red-900"
                            )}>
                              {log.sucesso ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{log.user?.nome || 'Utilizador desconhecido'}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.user?.email} • {log.user?.role}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString('pt-PT')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                <Monitor className="h-3 w-3" />
                                {log.ip || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                <Wifi className="h-3 w-3" />
                                {log.userAgent?.slice(0, 30) || 'N/A'}...
                              </p>
                            </div>
                            <Badge variant={log.sucesso ? 'default' : 'destructive'} className="text-xs">
                              {log.sucesso ? 'Sucesso' : 'Falhou'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </motion.div>

  );
};
