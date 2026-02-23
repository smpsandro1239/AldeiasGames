'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Menu,
  X,
  LayoutDashboard,
  Users,
  Calendar,
  History,
  TrendingUp,
  Settings,
  ShieldCheck,
  Search,
  LogOut,
  Bell,
  Wallet
} from 'lucide-react';
import { Toaster } from 'sonner';

// Custom Hooks
import { useAuthLogic } from '@/hooks/use-auth-logic';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useNotifications } from '@/hooks/use-notifications';
import { useParticipacoes } from '@/hooks/use-participacoes';
import { useOrgData } from '@/hooks/use-org-data';
import { useReports } from '@/hooks/use-reports';

// UI Components
import { UIButton } from '@/components/ui-components';
import { LegalCompliance } from '@/components/LegalCompliance';
import { CookieBanner } from '@/components/CookieBanner';
import { LoadingScreen } from '@/components/LoadingScreen';

// Dashboard Views
import { AdminDashboardView } from '@/features/AdminDashboardView';
import { VendedorDashboardView } from '@/features/VendedorDashboardView';
import { OrganizacaoDashboardView } from '@/features/OrganizacaoDashboardView';
import { ClienteDashboardView } from '@/features/ClienteDashboardView';
import { CRMAdminView } from '@/features/CRMAdminView';

// Modals
import { AuthModal } from '@/components/modals/AuthModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { PaymentHistoryModal } from '@/components/modals/PaymentHistoryModal';
import { WizardModal } from '@/components/modals/WizardModal';
import { CreateModal } from '@/components/modals/CreateModal';
import { ParticiparModal } from '@/components/modals/ParticiparModal';
import { OrgDetailModal } from '@/components/modals/OrgDetailModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';
import { PricingModal } from '@/components/modals/PricingModal';
import { RaspadinhaModal } from '@/components/modals/RaspadinhaModal';
import { GerirParticipacaoModal } from '@/components/modals/GerirParticipacaoModal';

import { User, Aldeia, Evento, Jogo, Participacao } from '@/types/project';

export default function AldeiasGames() {
  const { user, loading: authLoading, setUser, logout } = useAuthLogic();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { stats, refresh: refreshStats } = useDashboardData(user);
  const { unreadCount } = useNotifications(user);
  const { organizacoes, eventos, refresh: refreshOrgData } = useOrgData();
  const {
    minhasParticipacoes,
    fetchMinhasParticipacoes,
    handleParticipar,
    handleRevelarRaspadinha,
    participacaoLoading
  } = useParticipacoes(user, () => {
    refreshStats();
    refreshOrgData();
    fetchMinhasParticipacoes();
  });
  const { exportToExcel } = useReports();

  const [modals, setModals] = useState({
    auth: false,
    profile: false,
    history: false,
    wizard: false,
    create: null as 'organizacao' | 'evento' | 'vendedor' | 'jogo' | null,
    participar: null as Jogo | null,
    orgDetail: null as Aldeia | null,
    eventDetail: null as Evento | null,
    pricing: false,
    raspadinha: null as Participacao | null,
    gerirParticipacao: null as Participacao | null,
  });

  const toggleModal = (key: keyof typeof modals, value: any) => {
    setModals(prev => ({ ...prev, [key]: value }));
  };

  const filteredEventos = useMemo(() => {
    if (!searchQuery) return eventos;
    return eventos.filter(ev =>
      ev.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [eventos, searchQuery]);

  useEffect(() => {
    if (user) {
      fetchMinhasParticipacoes();
    }
  }, [user, fetchMinhasParticipacoes]);

  if (authLoading) return <LoadingScreen message="A carregar ambiente seguro..." />;

  const renderContent = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Trophy className="w-20 h-20 text-indigo-600 mb-6 animate-bounce" />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Bem-vindo ao Aldeias Games</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">A plataforma definitiva para dinamização de eventos e raspadinhas digitais.</p>
          <UIButton onClick={() => toggleModal('auth', true)} size="lg" className="px-8 py-6 text-lg">Começar Agora</UIButton>
        </div>
      );
    }
    if (activeTab === 'crm' && user.role === 'super_admin') return <CRMAdminView stats={stats} />;

    switch (user.role) {
      case 'super_admin':
      case 'aldeia_admin':
        return (
          <AdminDashboardView
            stats={stats}
            organizacoes={organizacoes}
            eventos={eventos}
            activeTab={activeTab}
            onCreateClick={(type) => toggleModal('create', type)}
            onOrgClick={(org) => toggleModal('orgDetail', org)}
            onEventClick={(ev) => toggleModal('eventDetail', ev)}
            onExport={exportToExcel}
          />
        );
      case 'vendedor':
        return <VendedorDashboardView user={user} stats={stats} eventos={eventos} onParticipar={(jogo) => toggleModal('participar', jogo)} />;
      case 'user':
      default:
        return <ClienteDashboardView user={user} eventos={filteredEventos} participacoes={minhasParticipacoes} onParticipar={(jogo: Jogo) => toggleModal('participar', jogo)} onRevelar={async (id) => {
          const res = await handleRevelarRaspadinha(id);
          fetchMinhasParticipacoes();
          return res;
        }} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'historico', label: 'Meu Histórico', icon: History, roles: ['user'] },
    { id: 'crm', label: 'Gestão CRM', icon: Users, roles: ['super_admin'] },
    { id: 'stats', label: 'Estatísticas', icon: TrendingUp, roles: ['super_admin', 'aldeia_admin'] },
    { id: 'config', label: 'Configurações', icon: Settings, roles: ['super_admin'] },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Toaster position="top-right" richColors closeButton />
      <CookieBanner />
      <LegalCompliance />
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-indigo-600 p-2 rounded-lg"><Trophy className="w-6 h-6 text-white" /></div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hidden sm:block">Aldeias Games</span>
          </div>
          {user && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Pesquisar..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
                </button>
                <div className="flex items-center gap-2 p-1 pl-2 hover:bg-gray-100 rounded-xl cursor-pointer" onClick={() => toggleModal('profile', true)}>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold">{user.nome}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{user.role}</p>
                  </div>
                  <div className="w-9 h-9 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-lg font-bold">{user.nome.charAt(0)}</div>
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 lg:hidden text-gray-500 hover:bg-gray-100 rounded-lg">
                  {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <UIButton onClick={() => toggleModal('auth', true)}>Entrar / Registar</UIButton>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {user && (
          <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform lg:translate-x-0 lg:static transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full flex flex-col p-4">
              <nav className="flex-1 space-y-1">
                {filteredNavItems.map((item) => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <item.icon className="w-5 h-5" /> {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-auto pt-4 border-t border-gray-100 space-y-1">
                <button onClick={() => toggleModal('pricing', true)} className="w-full flex items-center gap-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-xl"><ShieldCheck className="w-5 h-5" /> Upgrade</button>
                <button onClick={() => toggleModal('history', true)} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl"><Wallet className="w-5 h-5" /> Pagamentos</button>
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"><LogOut className="w-5 h-5" /> Sair</button>
              </div>
            </div>
          </aside>
        )}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">{renderContent()}</div>
        </main>
      </div>
      <AuthModal isOpen={modals.auth} onClose={() => toggleModal('auth', false)} onSuccess={(userData) => { setUser(userData); toggleModal('auth', false); }} />
      {user && (
        <>
          <ProfileModal isOpen={modals.profile} onClose={() => toggleModal('profile', false)} user={user} onUpdate={(u: User) => setUser(u)} />
          <PaymentHistoryModal isOpen={modals.history} onClose={() => toggleModal('history', false)} userId={user.id} />
          <WizardModal isOpen={modals.wizard} onClose={() => toggleModal('wizard', false)} user={user} onComplete={refreshStats} />
          <CreateModal type={modals.create} onClose={() => toggleModal('create', null)} onSuccess={() => { refreshOrgData(); refreshStats(); toggleModal('create', null); }} />
          <ParticiparModal jogo={modals.participar} isOpen={!!modals.participar} onClose={() => toggleModal('participar', null)} user={user} onConfirm={handleParticipar} isLoading={participacaoLoading} />
          <OrgDetailModal org={modals.orgDetail} onClose={() => toggleModal('orgDetail', null)} onUpdate={refreshOrgData} />
          <EventDetailModal evento={modals.eventDetail} onClose={() => toggleModal('eventDetail', null)} onUpdate={refreshOrgData} />
          <PricingModal isOpen={modals.pricing} onClose={() => toggleModal('pricing', false)} currentPlan="Aldeia Grátis" />
          <RaspadinhaModal isOpen={!!modals.raspadinha} onClose={() => toggleModal('raspadinha', null)} participacao={modals.raspadinha} onRevelar={handleRevelarRaspadinha} />
          <GerirParticipacaoModal isOpen={!!modals.gerirParticipacao} onClose={() => toggleModal('gerirParticipacao', null)} participacao={modals.gerirParticipacao} onAnular={() => {}} onTrocar={() => {}} />
        </>
      )}
      {!user && (
        <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500">&copy; 2026 Aldeias Games. Todos os direitos reservados.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
