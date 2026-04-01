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
  Wallet,
  Crown,
  Building2,
  User as UserIcon,
  Monitor,
  Folder,
  HelpCircle,
  ChevronDown,
  Minus,
  Square,
} from 'lucide-react';

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
import { SuperAdminDashboard } from '@/components/dashboard/super-admin/super-admin-dashboard';
import { AldeiaAdminDashboard } from '@/features/AldeiaAdminDashboard';
import { VendedorDashboardView } from '@/features/VendedorDashboardView';
import { NotificacoesModal } from '@/components/notificacoes-modal';
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

import type { User, Aldeia, Evento, Jogo, Participacao } from '../types/types';

// ─── Win2000 CSS-in-JS helpers ────────────────────────────────────────────────
const win2k = {
  // Classic raised button border
  raised: {
    borderTop: '2px solid #ffffff',
    borderLeft: '2px solid #ffffff',
    borderRight: '2px solid #808080',
    borderBottom: '2px solid #808080',
    outline: '1px solid #000000',
  } as React.CSSProperties,
  // Classic sunken / inset border
  sunken: {
    borderTop: '2px solid #808080',
    borderLeft: '2px solid #808080',
    borderRight: '2px solid #ffffff',
    borderBottom: '2px solid #ffffff',
    outline: '1px solid #000000',
  } as React.CSSProperties,
  // Window border (outer frame)
  window: {
    border: '2px solid #000000',
    outline: '1px solid #808080',
    outlineOffset: '-1px',
  } as React.CSSProperties,
  // Classic blue title bar gradient
  titleBar: {
    background: 'linear-gradient(to right, #0A246A, #A6CAF0)',
  } as React.CSSProperties,
  // Classic grey body
  body: {
    backgroundColor: '#D4D0C8',
    color: '#000000',
  } as React.CSSProperties,
  // Classic button active (pressed) state
  pressed: {
    borderTop: '2px solid #808080',
    borderLeft: '2px solid #808080',
    borderRight: '2px solid #ffffff',
    borderBottom: '2px solid #ffffff',
    outline: '1px solid #000000',
  } as React.CSSProperties,
};

// ─── Win2000 Button ───────────────────────────────────────────────────────────
function W2KButton({
  children,
  onClick,
  disabled,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'primary' | 'danger';
}) {
  const [pressed, setPressed] = useState(false);
  const bgColor =
    variant === 'primary'
      ? '#0A246A'
      : variant === 'danger'
      ? '#800000'
      : '#D4D0C8';
  const textColor =
    variant === 'primary' || variant === 'danger' ? '#ffffff' : '#000000';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={`px-3 py-1 text-xs font-sans cursor-pointer select-none active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
        fontSize: '11px',
        backgroundColor: bgColor,
        color: textColor,
        ...(pressed ? win2k.pressed : win2k.raised),
      }}
    >
      {children}
    </button>
  );
}

// ─── Win2000 Window Panel ─────────────────────────────────────────────────────
function W2KWindow({
  title,
  icon,
  children,
  className = '',
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col ${className}`}
      style={{ ...win2k.window, backgroundColor: '#D4D0C8' }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-2 py-1 select-none"
        style={{ ...win2k.titleBar, minHeight: '22px' }}
      >
        <div className="flex items-center gap-1">
          {icon && <span className="w-4 h-4 flex items-center">{icon}</span>}
          <span
            style={{
              fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-px">
          <button
            className="w-5 h-5 flex items-center justify-center text-black"
            style={{ ...win2k.raised, backgroundColor: '#D4D0C8', fontSize: '10px' }}
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            className="w-5 h-5 flex items-center justify-center text-black"
            style={{ ...win2k.raised, backgroundColor: '#D4D0C8', fontSize: '10px' }}
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            className="w-5 h-5 flex items-center justify-center text-black font-bold"
            style={{ ...win2k.raised, backgroundColor: '#D4D0C8', fontSize: '10px' }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 p-2">{children}</div>
    </div>
  );
}

// ─── Win2000 Menu Bar ─────────────────────────────────────────────────────────
function W2KMenuBar({ user, onLogin }: { user: any; onLogin: () => void }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menus = [
    { label: 'Ficheiro', items: ['Novo', 'Abrir', '---', 'Sair'] },
    { label: 'Editar', items: ['Copiar', 'Colar', 'Selecionar Tudo'] },
    { label: 'Ver', items: ['Atualizar', '---', 'Ecrã Completo'] },
    { label: 'Ajuda', items: ['Tópicos de Ajuda', '---', 'Acerca de Aldeias Games...'] },
  ];

  return (
    <div
      className="flex items-center relative"
      style={{
        fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
        fontSize: '11px',
        height: '22px',
        borderBottom: '1px solid #808080',
        backgroundColor: '#D4D0C8',
      }}
    >
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            className="px-2 py-0.5 hover:bg-[#0A246A] hover:text-white"
            style={{ fontSize: '11px' }}
            onClick={() =>
              setActiveMenu(activeMenu === menu.label ? null : menu.label)
            }
            onBlur={() => setTimeout(() => setActiveMenu(null), 150)}
          >
            {menu.label}
          </button>
          {activeMenu === menu.label && (
            <div
              className="absolute top-full left-0 z-50 min-w-[160px]"
              style={{
                ...win2k.raised,
                backgroundColor: '#D4D0C8',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {menu.items.map((item, i) =>
                item === '---' ? (
                  <div
                    key={i}
                    className="my-1 mx-2"
                    style={{
                      borderTop: '1px solid #808080',
                      borderBottom: '1px solid #ffffff',
                    }}
                  />
                ) : (
                  <button
                    key={item}
                    className="w-full text-left px-4 py-0.5 hover:bg-[#0A246A] hover:text-white text-black"
                    style={{ fontSize: '11px' }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
      <div className="ml-auto flex items-center pr-2 gap-2">
        {!user && (
          <button
            onClick={onLogin}
            className="px-2 py-0.5 hover:bg-[#0A246A] hover:text-white"
            style={{ fontSize: '11px' }}
          >
            Entrar / Registar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Win2000 Toolbar ──────────────────────────────────────────────────────────
function W2KToolbar({
  user,
  searchQuery,
  onSearch,
  onNotifications,
  onProfile,
  onSidebar,
  isSidebarOpen,
  unreadCount,
}: {
  user: any;
  searchQuery: string;
  onSearch: (v: string) => void;
  onNotifications: () => void;
  onProfile: () => void;
  onSidebar: () => void;
  isSidebarOpen: boolean;
  unreadCount: number;
}) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1"
      style={{
        borderBottom: '1px solid #808080',
        backgroundColor: '#D4D0C8',
        height: '36px',
      }}
    >
      {/* Nav buttons */}
      <W2KButton className="flex items-center gap-1">
        <span>◀</span> Voltar
      </W2KButton>
      <W2KButton className="flex items-center gap-1">
        Avançar <span>▶</span>
      </W2KButton>
      <W2KButton className="flex items-center gap-1">
        <span>🔄</span> Atualizar
      </W2KButton>
      <W2KButton className="flex items-center gap-1">
        <span>🏠</span> Início
      </W2KButton>

      {/* Separator */}
      <div
        className="h-5"
        style={{
          borderLeft: '1px solid #808080',
          borderRight: '1px solid #ffffff',
          margin: '0 4px',
        }}
      />

      {/* Address bar */}
      {user && (
        <div className="flex-1 flex items-center gap-1">
          <span style={{ fontSize: '11px', fontFamily: 'Tahoma, sans-serif', whiteSpace: 'nowrap' }}>
            Pesquisar:
          </span>
          <div className="flex-1 flex items-center" style={win2k.sunken}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Pesquisar..."
              className="flex-1 px-1 bg-white outline-none"
              style={{
                fontFamily: 'Tahoma, sans-serif',
                fontSize: '11px',
                height: '18px',
              }}
            />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1">
        {user && (
          <>
            <W2KButton onClick={onNotifications} className="relative">
              <Bell className="w-3 h-3 inline" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full"
                >
                  {unreadCount}
                </span>
              )}
            </W2KButton>
            <W2KButton onClick={onProfile} className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{user.nome}</span>
            </W2KButton>
            <W2KButton onClick={onSidebar} className="lg:hidden">
              {isSidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
            </W2KButton>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Win2000 Sidebar ──────────────────────────────────────────────────────────
function W2KSidebar({
  user,
  activeTab,
  onTabChange,
  isSidebarOpen,
  onPricing,
  onHistory,
  onLogout,
}: {
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSidebarOpen: boolean;
  onPricing: () => void;
  onHistory: () => void;
  onLogout: () => void;
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🖥️' },
    { id: 'eventos', label: 'Eventos', icon: '📅' },
    { id: 'historico', label: 'Meu Histórico', icon: '📋', roles: ['user'] },
    { id: 'crm', label: 'Gestão CRM', icon: '👥', roles: ['super_admin'] },
    { id: 'stats', label: 'Estatísticas', icon: '📊', roles: ['super_admin', 'aldeia_admin'] },
    { id: 'config', label: 'Configurações', icon: '⚙️', roles: ['super_admin'] },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 lg:static w-52 flex flex-col transform transition-transform duration-200 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{
        backgroundColor: '#D4D0C8',
        borderRight: '2px solid #808080',
        borderRightColor: '#808080',
      }}
    >
      {/* Sidebar title */}
      <div
        className="px-2 py-1 flex items-center gap-1"
        style={{
          ...win2k.titleBar,
          fontFamily: 'Tahoma, sans-serif',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#ffffff',
          minHeight: '22px',
        }}
      >
        <Folder className="w-3 h-3" />
        Navegação
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-1 space-y-px overflow-y-auto">
        {filteredNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="w-full text-left flex items-center gap-2 px-2 py-1"
            style={{
              fontFamily: 'Tahoma, sans-serif',
              fontSize: '11px',
              backgroundColor: activeTab === item.id ? '#0A246A' : 'transparent',
              color: activeTab === item.id ? '#ffffff' : '#000000',
              ...(activeTab === item.id ? {} : {}),
            }}
          >
            <span className="text-sm">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div
        className="p-1 space-y-px"
        style={{ borderTop: '2px solid #808080', paddingTop: '4px' }}
      >
        <button
          onClick={onPricing}
          className="w-full text-left flex items-center gap-2 px-2 py-1 hover:bg-[#0A246A] hover:text-white"
          style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px' }}
        >
          <ShieldCheck className="w-3 h-3" /> Upgrade
        </button>
        <button
          onClick={onHistory}
          className="w-full text-left flex items-center gap-2 px-2 py-1 hover:bg-[#0A246A] hover:text-white"
          style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px' }}
        >
          <Wallet className="w-3 h-3" /> Pagamentos
        </button>
        <button
          onClick={onLogout}
          className="w-full text-left flex items-center gap-2 px-2 py-1 hover:bg-[#800000] hover:text-white"
          style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', color: '#800000' }}
        >
          <LogOut className="w-3 h-3" /> Sair
        </button>
      </div>
    </aside>
  );
}

// ─── Win2000 Welcome Screen (not logged in) ───────────────────────────────────
function W2KWelcome({
  loginAs,
  loginAsLoading,
  onLogin,
}: {
  loginAs: (email: string, role: string) => void;
  loginAsLoading: string | null;
  onLogin: () => void;
}) {
  const roleButtons = [
    {
      role: 'SUPER_ADMIN',
      email: 'admin@aldeias.pt',
      label: 'Super Admin',
      icon: '👑',
      titleBarColor: 'linear-gradient(to right, #4A0080, #C080FF)',
    },
    {
      role: 'ALDEIA_ADMIN',
      email: 'aldeia@gmail.com',
      label: 'Admin Aldeia',
      icon: '🏛️',
      titleBarColor: 'linear-gradient(to right, #0A246A, #A6CAF0)',
    },
    {
      role: 'VENDEDOR',
      email: 'vendedor@gmail.com',
      label: 'Vendedor',
      icon: '🛒',
      titleBarColor: 'linear-gradient(to right, #004A00, #60C060)',
    },
    {
      role: 'CLIENTE',
      email: 'smpsandro1239@gmail.com',
      label: 'Jogador',
      icon: '🎮',
      titleBarColor: 'linear-gradient(to right, #804A00, #FFA040)',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Main welcome window */}
      <W2KWindow
        title="Bem-vindo ao Aldeias Games"
        icon={<Trophy className="w-3 h-3 text-yellow-300" />}
      >
        <div
          className="p-4 text-center"
          style={{
            fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
          }}
        >
          <div className="flex justify-center mb-3">
            <div
              className="w-16 h-16 flex items-center justify-center"
              style={{ ...win2k.sunken, backgroundColor: '#ffffff' }}
            >
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          <h1
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000080',
              fontFamily: 'Tahoma, sans-serif',
            }}
          >
            Aldeias Games
          </h1>
          <p style={{ fontSize: '11px', color: '#000000', margin: '8px 0' }}>
            A plataforma definitiva para dinamização de eventos<br />e raspadinhas digitais.
          </p>
          <div
            className="text-left p-2 mb-3"
            style={{ ...win2k.sunken, backgroundColor: '#ffffff', fontSize: '11px' }}
          >
            <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px' }}>
              ℹ️ <strong>Versão 2.0.0</strong> — © 2026 Aldeias Games. Todos os direitos reservados.
            </p>
            <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', color: '#000080' }}>
              Sistema operacional: Windows 2000 Edition
            </p>
          </div>
          <W2KButton onClick={onLogin} variant="primary" className="mx-auto">
            Entrar / Registar na Plataforma
          </W2KButton>
        </div>
      </W2KWindow>

      {/* Quick-login grid */}
      <div>
        <div
          className="mb-2"
          style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', fontWeight: 'bold' }}
        >
          Acesso Rápido por Perfil:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roleButtons.map(({ role, email, label, icon, titleBarColor }) => (
            <div
              key={role}
              style={{ ...win2k.window, backgroundColor: '#D4D0C8' }}
              className="flex flex-col"
            >
              {/* Mini title bar */}
              <div
                className="flex items-center justify-between px-2 py-0.5"
                style={{ background: titleBarColor }}
              >
                <span
                  style={{
                    fontFamily: 'Tahoma, sans-serif',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                  }}
                >
                  {icon} {label}
                </span>
                <div className="flex gap-px">
                  {['−', '□', '✕'].map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 flex items-center justify-center text-black text-[10px]"
                      style={{ ...win2k.raised, backgroundColor: '#D4D0C8' }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-2 flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 flex items-center justify-center text-2xl"
                  style={{ ...win2k.sunken, backgroundColor: '#ffffff' }}
                >
                  {icon}
                </div>
                <span
                  style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#000080' }}
                >
                  {email}
                </span>
                <W2KButton
                  onClick={() => loginAs(email, role)}
                  disabled={loginAsLoading === role}
                  className="w-full"
                >
                  {loginAsLoading === role ? (
                    <span>A carregar...</span>
                  ) : (
                    <span>Entrar como {label}</span>
                  )}
                </W2KButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Win2000 Status Bar ───────────────────────────────────────────────────────
function W2KStatusBar({ user }: { user: any }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
      );
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-2"
      style={{
        borderTop: '2px solid #808080',
        backgroundColor: '#D4D0C8',
        height: '22px',
        fontFamily: 'Tahoma, sans-serif',
        fontSize: '11px',
      }}
    >
      <div className="flex items-center gap-3">
        <span style={win2k.sunken} className="px-2 py-px">
          {user ? `✅ Conectado como: ${user.nome} (${user.role})` : '🔒 Não autenticado'}
        </span>
        <span style={win2k.sunken} className="px-2 py-px">
          Aldeias Games v2.0
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span style={win2k.sunken} className="px-2 py-px">
          🖥️ 1 item
        </span>
        <div
          className="flex items-center gap-2 px-2 py-px"
          style={{ ...win2k.sunken, minWidth: '60px', justifyContent: 'center' }}
        >
          <span>🔔</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function AldeiasGames() {
  const { user, loading: authLoading, setUser, logout } = useAuthLogic();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { stats, refresh: refreshStats } = useDashboardData(user);
  const { unreadCount } = useNotifications(user);
  const { organizacoes, eventos, refresh: refreshOrgData } = useOrgData();
  const {
    minhasParticipacoes,
    fetchMinhasParticipacoes,
    handleParticipar,
    handleRevelarRaspadinha,
    participacaoLoading,
  } = useParticipacoes(user, () => {
    refreshStats();
    refreshOrgData();
    fetchMinhasParticipacoes();
  });
  const { exportToExcel } = useReports();

  const [loginAsLoading, setLoginAsLoading] = useState<string | null>(null);

  const loginAs = async (email: string, role: string) => {
    setLoginAsLoading(role);
    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        document.cookie = `user-role=${role.toUpperCase()}; path=/; max-age=86400`;
        document.cookie = `auth-token=${data.token}; path=/; max-age=86400`;
        setUser(data.user);
        const redirectMap: Record<string, string> = {
          SUPER_ADMIN: '/superadmin/dashboard',
          ALDEIA_ADMIN: '/admin/dashboard',
          VENDEDOR: '/vendedor/dashboard',
          CLIENTE: '/cliente/dashboard',
          USER: '/cliente/dashboard',
        };
        window.location.href = redirectMap[role.toUpperCase()] || '/';
      } else {
        const mockUser = {
          id: `dev-${role}`,
          nome: `Dev ${role.replace('_', ' ')}`,
          email,
          role: role.toUpperCase(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('token', 'dev-token');
        document.cookie = `user-role=${role.toUpperCase()}; path=/; max-age=86400`;
        setUser(mockUser as any);
        const redirectMap: Record<string, string> = {
          SUPER_ADMIN: '/superadmin/dashboard',
          ALDEIA_ADMIN: '/admin/dashboard',
          VENDEDOR: '/vendedor/dashboard',
          CLIENTE: '/cliente/dashboard',
          USER: '/cliente/dashboard',
        };
        window.location.href = redirectMap[role.toUpperCase()] || '/';
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoginAsLoading(null);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      const role = user.role.toUpperCase();
      const redirectMap: Record<string, string> = {
        SUPER_ADMIN: '/superadmin/dashboard',
        ALDEIA_ADMIN: '/admin/dashboard',
        VENDEDOR: '/vendedor/dashboard',
        CLIENTE: '/cliente/dashboard',
        USER: '/cliente/dashboard',
      };
      if (redirectMap[role]) {
        window.location.href = redirectMap[role];
      }
    }
  }, [user, authLoading]);

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
    setModals((prev) => ({ ...prev, [key]: value }));
  };

  const filteredEventos = useMemo(() => {
    if (!searchQuery) return eventos;
    return eventos.filter(
      (ev) =>
        ev.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [eventos, searchQuery]);

  useEffect(() => {
    if (user) {
      fetchMinhasParticipacoes();
    }
  }, [user, fetchMinhasParticipacoes]);

  if (authLoading)
    return <LoadingScreen message="A carregar ambiente seguro..." />;

  const renderContent = () => {
    if (!user) {
      return (
        <W2KWelcome
          loginAs={loginAs}
          loginAsLoading={loginAsLoading}
          onLogin={() => toggleModal('auth', true)}
        />
      );
    }
    if (activeTab === 'crm' && user.role.toUpperCase() === 'SUPER_ADMIN')
      return <CRMAdminView stats={stats as any} />;

    const roleNormalized = user.role.toUpperCase();
    switch (roleNormalized) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;
      case 'ALDEIA_ADMIN':
        return (
          <AldeiaAdminDashboard
            aldeiaId={user.aldeiaId || ''}
            aldeiaNome={user.aldeia?.nome || 'Minha Aldeia'}
          />
        );
      case 'VENDEDOR':
        return (
          <VendedorDashboardView
            user={user}
            stats={stats as any}
            eventos={eventos}
            onParticipar={(jogo) => toggleModal('participar', jogo)}
          />
        );
      case 'CLIENTE':
      case 'USER':
      default:
        return (
          <ClienteDashboardView
            user={user}
            eventos={filteredEventos}
            participacoes={minhasParticipacoes}
            onParticipar={(jogo: Jogo) => toggleModal('participar', jogo)}
            onRevelar={async (id) => {
              const res = await handleRevelarRaspadinha(id);
              fetchMinhasParticipacoes();
              return res;
            }}
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#D4D0C8',
        fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
        fontSize: '11px',
        color: '#000000',
      }}
    >
      <CookieBanner />
      <LegalCompliance />

      {/* ── Title / Header bar ── */}
      <header>
        {/* App title bar (like a Windows window title) */}
        <div
          className="flex items-center justify-between px-2 py-1 select-none"
          style={{ ...win2k.titleBar, minHeight: '28px' }}
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-white" />
            <span
              style={{
                fontFamily: 'Tahoma, sans-serif',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              Aldeias Games — Plataforma de Jogos
            </span>
          </div>
          <div className="flex items-center gap-1">
            {['−', '□', '✕'].map((c, i) => (
              <span
                key={i}
                className="w-5 h-5 flex items-center justify-center text-black text-xs cursor-pointer"
                style={{ ...win2k.raised, backgroundColor: '#D4D0C8' }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Menu bar */}
        <W2KMenuBar user={user} onLogin={() => toggleModal('auth', true)} />

        {/* Toolbar */}
        <W2KToolbar
          user={user}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onNotifications={() => setShowNotificacoes(true)}
          onProfile={() => toggleModal('profile', true)}
          onSidebar={() => setSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          unreadCount={unreadCount}
        />

        {/* Address bar */}
        <div
          className="flex items-center gap-2 px-2 py-1"
          style={{
            borderBottom: '1px solid #808080',
            backgroundColor: '#D4D0C8',
            height: '28px',
          }}
        >
          <span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Endereço:</span>
          <div
            className="flex-1 flex items-center px-1"
            style={{ ...win2k.sunken, backgroundColor: '#ffffff', height: '20px' }}
          >
            <span style={{ fontSize: '11px', color: '#000080' }}>
              🌐 https://aldeiasgames.pt/{user ? user.role.toLowerCase() : 'home'}
            </span>
          </div>
          <W2KButton>Ir</W2KButton>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {user && (
          <W2KSidebar
            user={user}
            activeTab={activeTab}
            onTabChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }}
            isSidebarOpen={isSidebarOpen}
            onPricing={() => toggleModal('pricing', true)}
            onHistory={() => toggleModal('history', true)}
            onLogout={logout}
          />
        )}

        {/* Content area */}
        <main
          className="flex-1 overflow-y-auto p-3"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* ── Status bar ── */}
      <W2KStatusBar user={user} />

      {/* ── Modals ── */}
      <AuthModal
        isOpen={modals.auth}
        onClose={() => toggleModal('auth', false)}
        onSuccess={(userData) => { setUser(userData); toggleModal('auth', false); }}
      />
      {user && (
        <>
          <ProfileModal
            isOpen={modals.profile}
            onClose={() => toggleModal('profile', false)}
            user={user}
            onUpdate={(u: User) => setUser(u)}
          />
          <PaymentHistoryModal
            isOpen={modals.history}
            onClose={() => toggleModal('history', false)}
            userId={user.id}
          />
          {/* @ts-ignore */}
          <WizardModal
            isOpen={modals.wizard}
            onClose={() => toggleModal('wizard', false)}
            user={user}
            onComplete={refreshStats}
          />
          <CreateModal
            type={modals.create}
            onClose={() => toggleModal('create', null)}
            onSuccess={() => { refreshOrgData(); refreshStats(); toggleModal('create', null); }}
          />
          <ParticiparModal
            jogo={modals.participar}
            isOpen={!!modals.participar}
            onClose={() => toggleModal('participar', null)}
            user={user}
            onConfirm={handleParticipar}
            isLoading={participacaoLoading}
          />
          <OrgDetailModal
            org={modals.orgDetail}
            onClose={() => toggleModal('orgDetail', null)}
            onUpdate={refreshOrgData}
          />
          <EventDetailModal
            evento={modals.eventDetail}
            onClose={() => toggleModal('eventDetail', null)}
            onUpdate={refreshOrgData}
          />
          <PricingModal
            isOpen={modals.pricing}
            onClose={() => toggleModal('pricing', false)}
            currentPlan="Aldeia Grátis"
          />
          <RaspadinhaModal
            isOpen={!!modals.raspadinha}
            onClose={() => toggleModal('raspadinha', null)}
            participacao={modals.raspadinha}
            onRevelar={handleRevelarRaspadinha}
          />
          <GerirParticipacaoModal
            isOpen={!!modals.gerirParticipacao}
            onClose={() => toggleModal('gerirParticipacao', null)}
            participacao={modals.gerirParticipacao}
            onAnular={() => {}}
            onTrocar={() => {}}
          />
        </>
      )}

      {/* Notifications modal */}
      {showNotificacoes && user && (
        <NotificacoesModal
          isOpen={showNotificacoes}
          onClose={() => setShowNotificacoes(false)}
          userId={user.id}
        />
      )}

      {/* Footer for logged-out state */}
      {!user && (
        <div
          className="text-center py-2"
          style={{
            borderTop: '2px solid #808080',
            fontSize: '10px',
            fontFamily: 'Tahoma, sans-serif',
            backgroundColor: '#D4D0C8',
            color: '#444444',
          }}
        >
          © 2026 Aldeias Games. Todos os direitos reservados. | Windows 2000 Edition
        </div>
      )}
    </div>
  );
}
