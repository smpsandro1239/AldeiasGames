'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { useTheme } from 'next-themes';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Globe,
  MapPin, 
  Calendar, 
  Gamepad2, 
  Ticket, 
  Trophy, 
  CreditCard,
  Users,
  TrendingUp,
  Plus,
  Minus,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  Play,
  Grid3X3,
  Hash,
  Clock,
  Star,
  Award,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Settings,
  Crown,
  ShoppingBag,
  Moon,
  Sun,
  User,
  Upload,
  Image as ImageIcon,
  Database,
  Trash2,
  RotateCcw,
  Download,
  Save,
  History,
  Bell,
  BellOff,
  Activity,
  Monitor,
  Wifi,
  AlertTriangle,
  Shield,
  Gift,
  Euro,
  Share2,
  QrCode,
  BarChart3,
  PieChart,
  Building,
  School,
  Target,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminDashboardView } from '@/features/admin/AdminDashboardView';
import { VendedorDashboardView } from '@/features/vendedor/VendedorDashboardView';
import { PublicGamesView } from '@/features/public/PublicGamesView';
import { PlayerParticipationsView } from '@/features/player/PlayerParticipationsView';
import { useAuthLogic } from '@/hooks/use-auth-logic';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import type { User, Jogo, Participacao, Aldeia, Evento } from '@/types/project';
import { GameCardSkeleton, EmptyState } from '@/components/common-ui';
import { NotificacoesModal } from '@/components/notificacoes-modal';
import { ScratchCard } from '@/components/scratch-card';
import { FundingGoal } from '@/components/funding-goal';
import { RifaNumberSelector } from '@/components/rifa-number-selector';

// Types
// Scratch Card Component - Real Scratch Effect with Canvas


// Game Type Config
const GAME_TYPES = {
  poio_vaca: { 
    name: 'Poio da Vaca', 
    emoji: '🐄', 
    description: 'Escolha uma coordenada no grid. Se a vaca cair na sua coordenada, você ganha!',
    icon: Grid3X3
  },
  rifa: { 
    name: 'Rifa', 
    emoji: '🎟️', 
    description: 'Compre números da sorte. O sorteio determinará o vencedor!',
    icon: Hash
  },
  tombola: { 
    name: 'Tombola', 
    emoji: '🎲', 
    description: 'Compre bilhetes e participe do sorteio tradicional!',
    icon: Ticket
  },
  raspadinha: { 
    name: 'Raspadinha', 
    emoji: ' scratch️', 
    description: 'Compre cartões e raspe para revelar o seu prémio! Cada cartão tem um resultado único.',
    icon: Sparkles
  }
};

export default function DashboardPage() {
  // Theme
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'public' | 'my-games' | 'admin' | 'vendedor'>('public');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data
  const [jogosPublicos, setJogosPublicos] = useState<Jogo[]>([]);
  const [minhasParticipacoes, setMinhasParticipacoes] = useState<Participacao[]>([]);
  const [aldeias, setAldeias] = useState<Aldeia[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [jogosAdmin, setJogosAdmin] = useState<Jogo[]>([]);
  const [vendasVendedor, setVendasVendedor] = useState<Participacao[]>([]); // Vendas do vendedor
  
  // Dashboard Stats (FASE 6)
  const [dashboardStats, setDashboardStats] = useState<{
    totalEventos: number;
    eventosAtivos: number;
    totalJogos: number;
    jogosAtivos: number;
    totalParticipacoes: number;
    totalAngariado: number;
    totalVendedores: number;
    totalPremios: number;
    organizacao: Aldeia | null;
    historicoMensal: { mes: string; valor: number }[];
    rankingVendedores: { nome: string; vendas: number; valor: number }[];
  }>({
    totalEventos: 0,
    eventosAtivos: 0,
    totalJogos: 0,
    jogosAtivos: 0,
    totalParticipacoes: 0,
    totalAngariado: 0,
    totalVendedores: 0,
    totalPremios: 0,
    organizacao: null,
    historicoMensal: [],
    rankingVendedores: [],
  });
  const [dashboardLoading, setDashboardLoading] = useState(false);
  
  // Comparativo Ano a Ano
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [compareYear, setCompareYear] = useState<number>(new Date().getFullYear() - 1);
  const [yearComparison, setYearComparison] = useState<{
    selectedYear: { total: number; meses: { mes: string; valor: number }[] };
    compareYear: { total: number; meses: { mes: string; valor: number }[] };
    variacao: number; // percentagem
  } | null>(null);
  
  // Gráficos Detalhados por Evento
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [eventStats, setEventStats] = useState<{
    evento: Evento | null;
    totalParticipacoes: number;
    totalAngariado: number;
    jogosStats: { jogo: Jogo; participacoes: number; angariado: number }[];
    evolucaoDiaria: { dia: string; valor: number; participacoes: number }[];
    metodosPagamento: { metodo: string; total: number; valor: number }[];
  } | null>(null);
  const [eventStatsLoading, setEventStatsLoading] = useState(false);
  
  // Página Pública de Organização
  const [publicOrgSlug, setPublicOrgSlug] = useState<string | null>(null);
  const [publicOrgData, setPublicOrgData] = useState<{
    organizacao: Aldeia | null;
    eventos: Evento[];
    jogos: Jogo[];
    stats: { totalEventos: number; totalJogos: number; totalParticipacoes: number; totalAngariado: number };
  } | null>(null);
  const [publicOrgLoading, setPublicOrgLoading] = useState(false);
  
  // Notificações
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [notificacoesModalOpen, setNotificacoesModalOpen] = useState(false);
  const [notificacoesLoading, setNotificacoesLoading] = useState(false);
  
  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({ nome: '', email: '', password: '', role: 'user', tipoOrganizacao: 'aldeia' });
  
  const [participarModalOpen, setParticiparModalOpen] = useState(false);
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null);
  const [participacaoLoading, setParticipacaoLoading] = useState(false);
  const [dadosParticipacao, setDadosParticipacao] = useState<any>(null);
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]); // Multi-select para Rifa/Tombola
  const [coordenadasSelecionadas, setCoordenadasSelecionadas] = useState<{letra: string, numero: number}[]>([]); // Multi-select para Poio da Vaca
  const [metodoPagamento, setMetodoPagamento] = useState<'dinheiro' | 'mbway'>('mbway');
  const [telefoneMbway, setTelefoneMbway] = useState('');
  const [step, setStep] = useState<'select' | 'payment' | 'confirm'>('select');
  const [adminParaCliente, setAdminParaCliente] = useState(false); // Flag para admin registar para cliente
  const [nomeCliente, setNomeCliente] = useState(''); // Nome do cliente quando admin regista
  const [telefoneCliente, setTelefoneCliente] = useState(''); // Telemóvel do cliente
  const [emailCliente, setEmailCliente] = useState(''); // Email do cliente
  const [identificacaoValida, setIdentificacaoValida] = useState(false); // Se tem nome+tel OU nome+email
  
  // Raspadinha - Estados para compra e revelação
  const [quantidadeRaspadinha, setQuantidadeRaspadinha] = useState(1);
  const [participacoesRaspadinha, setParticipacoesRaspadinha] = useState<any[]>([]);
  const [raspadinhasReveladas, setRaspadinhasReveladas] = useState<Map<string, any>>(new Map());
  const [revelandoRaspadinha, setRevelandoRaspadinha] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [raspadinhaModalOpen, setRaspadinhaModalOpen] = useState(false); // Modal para mostrar cartões comprados
  const [jogoRaspadinha, setJogoRaspadinha] = useState<Jogo | null>(null); // Jogo de raspadinha atual
  
  // Raspadinha - Estados para criação de jogo
  const [stockInicial, setStockInicial] = useState(100);
  const [premiosRaspadinha, setPremiosRaspadinha] = useState<{nome: string; tipo: 'dinheiro' | 'fisico'; percentagem: number; valor: number}[]>([]);
  const [limitePorUsuario, setLimitePorUsuario] = useState<number>(10);
  const [novoPremioRaspadinha, setNovoPremioRaspadinha] = useState({ nome: '', tipo: 'dinheiro' as const, percentagem: 0, valor: 0 });
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'aldeia' | 'evento' | 'jogo'>('aldeia');
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState<any>({
    // Aldeia / Organização
    nome: '',
    descricao: '',
    localizacao: '',
    tipoOrganizacao: 'aldeia',
    slug: '',
    nomeEscola: '',
    codigoEscola: '',
    nivelEnsino: '',
    responsavel: '',
    contactoResponsavel: '',
    morada: '',
    codigoPostal: '',
    localidade: '',
    autorizacaoCM: false,
    numeroAlvara: '',
    // Evento
    aldeiaId: '',
    dataInicio: '',
    dataFim: '',
    objectivoAngariacao: '',
    // Jogo
    eventoId: '',
    tipo: 'rifa',
    precoParticipacao: 1,
    config: { totalBilhetes: 100 }
  });
  
  const [jogoDetalhe, setJogoDetalhe] = useState<Jogo | null>(null);
  const [ocupados, setOcupados] = useState<any[]>([]);
  const [participacoesJogo, setParticipacoesJogo] = useState<Participacao[]>([]); // Full participation data
  const [loadingOcupados, setLoadingOcupados] = useState(false);
  const [infoPosicaoModal, setInfoPosicaoModal] = useState<{open: boolean, participacao: Participacao | null, posicao: string}>({open: false, participacao: null, posicao: ''});
  
  // Estados para alteração de participações
  const [alterarModalOpen, setAlterarModalOpen] = useState(false);
  const [participacaoParaAlterar, setParticipacaoParaAlterar] = useState<Participacao | null>(null);
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [historicoParticipacao, setHistoricoParticipacao] = useState<any>(null);
  const [alterarLoading, setAlterarLoading] = useState(false);
  const [alterarForm, setAlterarForm] = useState({
    campo: 'numero',
    novoNumero: '',
    novaLetra: '',
    motivo: '',
    tipoAlteracao: 'trocar' as 'trocar' | 'anular'
  });

  // Gestão de vendedores
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [novoVendedorModalOpen, setNovoVendedorModalOpen] = useState(false);
  const [novoVendedorForm, setNovoVendedorForm] = useState({ nome: '', email: '', password: '' });
  const [novoVendedorLoading, setNovoVendedorLoading] = useState(false);

  // Profile Edit Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ nome: '', telefone: '', notificacoesEmail: true });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null); // Store full profile data including ultimoLogin

  // RGPD - Data Export and Account Deletion
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Payment History Modal
  const [pagamentosModalOpen, setPagamentosModalOpen] = useState(false);
  const [pagamentosData, setPagamentosData] = useState<any>(null);
  const [pagamentosLoading, setPagamentosLoading] = useState(false);

  // Logs (for super_admin)
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsStats, setLogsStats] = useState<any>(null);

  // Backup Management
  const [backups, setBackups] = useState<any[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);

  // Gestão de Prémios
  const [premios, setPremios] = useState<any[]>([]);
  const [premiosLoading, setPremiosLoading] = useState(false);
  const [premioModalOpen, setPremioModalOpen] = useState(false);
  const [premioForm, setPremioForm] = useState({
    id: '',
    nome: '',
    descricao: '',
    valorEstimado: '',
    imagemBase64: '',
    patrocinador: '',
    ordem: 0,
    aldeiaId: '',
    isEdit: false
  });
  const [premioLoading, setPremioLoading] = useState(false);
  const premioImageRef = useRef<HTMLInputElement>(null);
  const [backupCreating, setBackupCreating] = useState(false);
  const [backupRestoring, setBackupRestoring] = useState<string | null>(null);
  const [backupDeleting, setBackupDeleting] = useState<string | null>(null);

  // Detalhes da Organização (visualização pública)
  const [orgDetalheModalOpen, setOrgDetalheModalOpen] = useState(false);
  const [orgDetalhe, setOrgDetalhe] = useState<Aldeia | null>(null);
  const [orgDetalheEventos, setOrgDetalheEventos] = useState<Evento[]>([]);
  const [orgDetalheJogos, setOrgDetalheJogos] = useState<Jogo[]>([]);
  const [orgDetalheLoading, setOrgDetalheLoading] = useState(false);

  // Detalhes do Evento/Campanha (visualização pública)
  const [eventoDetalheModalOpen, setEventoDetalheModalOpen] = useState(false);
  const [eventoDetalhe, setEventoDetalhe] = useState<Evento | null>(null);
  const [eventoDetalheJogos, setEventoDetalheJogos] = useState<Jogo[]>([]);
  const [eventoDetalheStats, setEventoDetalheStats] = useState({ totalAngariado: 0, totalParticipacoes: 0 });
  const [eventoDetalheLoading, setEventoDetalheLoading] = useState(false);

  // Partilha e copiar link
  const [linkCopied, setLinkCopied] = useState(false);

  // Wizard de configuração inicial (para novas organizações)
  const [wizardModalOpen, setWizardModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<{
    organizacao: {
      id: string;
      nome: string;
      tipoOrganizacao: string;
      slug: string;
    } | null;
    descricao: string;
    morada: string;
    codigoPostal: string;
    localidade: string;
    responsavel: string;
    contactoResponsavel: string;
    logoBase64: string;
    // Campos específicos para escolas
    nomeEscola: string;
    codigoEscola: string;
    nivelEnsino: string;
    // Campos de conformidade
    autorizacaoCM: boolean;
    numeroAlvara: string;
  }>({
    organizacao: null,
    descricao: '',
    morada: '',
    codigoPostal: '',
    localidade: '',
    responsavel: '',
    contactoResponsavel: '',
    logoBase64: '',
    nomeEscola: '',
    codigoEscola: '',
    nivelEnsino: '',
    autorizacaoCM: false,
    numeroAlvara: '',
  });
  const [wizardLoading, setWizardLoading] = useState(false);
  const wizardLogoRef = useRef<HTMLInputElement>(null);

  // Image Upload refs
  const aldeiaImageRef = useRef<HTMLInputElement>(null);
  const eventoImageRef = useRef<HTMLInputElement>(null);

  // Fetch occupied positions with full participation data
  const fetchOcupados = useCallback(async (jogoId: string) => {
    setLoadingOcupados(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/participacoes?jogoId=${jogoId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      
      console.log('📊 Dados recebidos da API participações:', data);
      
      if (Array.isArray(data)) {
        setParticipacoesJogo(data); // Store full data
        // Extrair dadosParticipacao corretamente
        // Para Rifa/Tombola: {numero: X}
        // Para Poio da Vaca: {letra: X, numero: Y}
        const ocupadosData = data.map((p: Participacao) => {
          // dadosParticipacao já vem parseado da API
          console.log('📊 dadosParticipacao:', p.dadosParticipacao, typeof p.dadosParticipacao);
          return p.dadosParticipacao;
        });
        console.log('📊 Ocupados processados:', ocupadosData);
        setOcupados(ocupadosData);
      } else {
        console.log('📊 Dados não é array:', data);
        setParticipacoesJogo([]);
        setOcupados([]);
      }
    } catch (error) {
      console.error('Error fetching ocupados:', error);
      setParticipacoesJogo([]);
      setOcupados([]);
    } finally {
      setLoadingOcupados(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    setMounted(true);
    
    // Verificar query parameter para página pública de organização
    const params = new URLSearchParams(window.location.search);
    const orgSlug = params.get('org');
    if (orgSlug) {
      setPublicOrgSlug(orgSlug);
      fetchPublicOrgData(orgSlug);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchPublicGames();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMinhasParticipacoes();
      if (['super_admin', 'aldeia_admin'].includes(user.role)) {
        fetchAdminData();
      }
      if (user.role === 'vendedor') {
        fetchVendedorData();
      }
    }
  }, [user]);

  useEffect(() => {
    if (jogoDetalhe) {
      setOcupados([]); // Reset before fetching new data
      fetchOcupados(jogoDetalhe.id);
    }
  }, [jogoDetalhe?.id, fetchOcupados]);

  // Atualizar comparativo quando anos mudam
  useEffect(() => {
    if (user && ['super_admin', 'aldeia_admin'].includes(user.role) && eventos.length > 0) {
      fetchDashboardStats();
    }
  }, [selectedYear, compareYear]);

  // Atualizar stats do evento quando selecionado
  useEffect(() => {
    if (selectedEventId && user && ['super_admin', 'aldeia_admin'].includes(user.role)) {
      fetchEventStats(selectedEventId);
    }
  }, [selectedEventId]);

  // Fetch notificações quando user login
  useEffect(() => {
    if (user) {
      fetchNotificacoes();
    }
  }, [user]);

  // Auth Functions
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = authMode === 'login' 
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao autenticar');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setAuthModalOpen(false);
      setAuthForm({ nome: '', email: '', password: '', role: 'user', tipoOrganizacao: 'aldeia' });
      
      toast.success(authMode === 'login' ? `Bem-vindo, ${data.user.nome}!` : 'Conta criada com sucesso!', {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      // Se é uma nova organização, abrir wizard de configuração
      if (data.isNewOrganization && data.organizacao) {
        setWizardData({
          ...wizardData,
          organizacao: data.organizacao,
          nomeEscola: data.organizacao.tipoOrganizacao === 'escola' ? data.organizacao.nome : '',
        });
        setWizardStep(1);
        setWizardModalOpen(true);
      }
    } catch (error) {
      toast.error('Erro de ligação');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveView('public');
    toast.success('Sessão terminada');
    setAuthForm({ nome: '', email: '', password: '', role: 'user', tipoOrganizacao: 'aldeia' });
  };

  // Quick Login for testing (4 roles)
  const handleQuickLogin = async (role: 'super_admin' | 'aldeia_admin' | 'vendedor' | 'user') => {
    const credentials = {
      super_admin: { email: 'admin@aldeias.pt', password: '123456' },
      aldeia_admin: { email: 'aldeia@gmail.com', password: '123456' },
      vendedor: { email: 'vendedor@gmail.com', password: '123456' },
      user: { email: 'smpsandro1239@gmail.com', password: '123456' },
    };

    const { email, password } = credentials[role];
    setAuthForm({ ...authForm, email, password });
    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao fazer login rápido');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setAuthModalOpen(false);
      setAuthForm({ nome: '', email: '', password: '', role: 'user' });
      
      toast.success(`Login como ${role.replace('_', ' ')}: ${data.user.nome}`, {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      toast.error('Erro de ligação');
    } finally {
      setAuthLoading(false);
    }
  };

  // Data Fetching
  const fetchPublicGames = async () => {
    try {
      const res = await fetch('/api/jogos');
      const data = await res.json();
      setJogosPublicos(Array.isArray(data) ? data.filter((j: Jogo) => j.estado === 'ativo' || j.estado === 'terminado') : []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchMinhasParticipacoes = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch(`/api/participacoes?userId=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMinhasParticipacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  };

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [aldeiasRes, eventosRes, jogosRes] = await Promise.all([
        fetch('/api/aldeias', { headers: { Authorization: `Bearer ${token}` }}),
        fetch('/api/eventos', { headers: { Authorization: `Bearer ${token}` }}),
        fetch('/api/jogos', { headers: { Authorization: `Bearer ${token}` }}),
      ]);

      const [aldeiasData, eventosData, jogosData] = await Promise.all([
        aldeiasRes.json(),
        eventosRes.json(),
        jogosRes.json()
      ]);

      setAldeias(Array.isArray(aldeiasData) ? aldeiasData : []);
      setEventos(Array.isArray(eventosData) ? eventosData : []);
      setJogosAdmin(Array.isArray(jogosData) ? jogosData : []);
      
      // Buscar vendedores da aldeia
      const vendedoresRes = await fetch(`/api/users?role=vendedor${user.role === 'super_admin' ? '' : `&aldeiaId=${user.aldeiaId}`}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vendedoresData = await vendedoresRes.json();
      setVendedores(Array.isArray(vendedoresData) ? vendedoresData : []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Fetch vendedor's sales
  const fetchVendedorData = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    try {
      // Buscar participações registadas pelo vendedor
      const res = await fetch('/api/participacoes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Filtrar apenas as vendas registadas por este vendedor
      const minhasVendas = Array.isArray(data) 
        ? data.filter((p: Participacao) => p.adminRegistouId === user.id)
        : [];
      
      setVendasVendedor(minhasVendas);
    } catch (error) {
      console.error('Error fetching vendedor data:', error);
    }
  };

  // Fetch Dashboard Stats (FASE 6)
  const fetchDashboardStats = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    setDashboardLoading(true);
    try {
      // Buscar organização do utilizador
      let organizacao: Aldeia | null = null;
      if (user.aldeiaId) {
        const orgRes = await fetch(`/api/aldeias/${user.aldeiaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (orgRes.ok) {
          organizacao = await orgRes.json();
        }
      }

      // Buscar participações para calcular estatísticas
      const participacoesRes = await fetch('/api/participacoes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const participacoesData = await participacoesRes.json();
      const participacoes = Array.isArray(participacoesData) ? participacoesData : [];

      // Filtrar participações por organização (se não for super_admin)
      const participacoesFiltradas = user.role === 'super_admin' 
        ? participacoes 
        : participacoes.filter((p: Participacao) => {
            const jogo = jogosAdmin.find(j => j.id === p.jogoId);
            return jogo?.evento?.aldeiaId === user.aldeiaId;
          });

      // Calcular totais
      const totalParticipacoes = participacoesFiltradas.length;
      const totalAngariado = participacoesFiltradas.reduce((sum: number, p: Participacao) => sum + (p.valorPago || 0), 0);

      // Eventos ativos
      const eventosAtivos = eventos.filter(e => e.estado === 'ativo').length;
      
      // Jogos ativos
      const jogosAtivos = jogosAdmin.filter(j => j.estado === 'ativo').length;

      // Ranking de vendedores
      const vendasPorVendedor: Record<string, { nome: string; vendas: number; valor: number }> = {};
      participacoesFiltradas.forEach((p: Participacao) => {
        if (p.adminRegistouId) {
          const vendedorId = p.adminRegistouId;
          if (!vendasPorVendedor[vendedorId]) {
            // Buscar nome do vendedor
            const vendedor = vendedores.find(v => v.id === vendedorId);
            vendasPorVendedor[vendedorId] = {
              nome: vendedor?.nome || 'Desconhecido',
              vendas: 0,
              valor: 0
            };
          }
          vendasPorVendedor[vendedorId].vendas++;
          vendasPorVendedor[vendedorId].valor += p.valorPago || 0;
        }
      });
      const rankingVendedores = Object.values(vendasPorVendedor)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      // Histórico mensal (últimos 6 meses)
      const historicoMensal: { mes: string; valor: number }[] = [];
      const agora = new Date();
      for (let i = 5; i >= 0; i--) {
        const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const mesNome = data.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
        const mesInicio = data.getTime();
        const mesFim = new Date(data.getFullYear(), data.getMonth() + 1, 0).getTime();
        
        const valorMes = participacoesFiltradas
          .filter((p: Participacao) => {
            const dataParticipacao = new Date(p.createdAt).getTime();
            return dataParticipacao >= mesInicio && dataParticipacao <= mesFim;
          })
          .reduce((sum: number, p: Participacao) => sum + (p.valorPago || 0), 0);
        
        historicoMensal.push({ mes: mesNome, valor: valorMes });
      }

      setDashboardStats({
        totalEventos: eventos.length,
        eventosAtivos,
        totalJogos: jogosAdmin.length,
        jogosAtivos,
        totalParticipacoes,
        totalAngariado,
        totalVendedores: vendedores.length,
        totalPremios: premios.length,
        organizacao,
        historicoMensal,
        rankingVendedores,
      });

      // Calcular comparativo ano a ano
      const calcularDadosAno = (ano: number) => {
        const meses: { mes: string; valor: number }[] = [];
        for (let m = 0; m < 12; m++) {
          const dataInicio = new Date(ano, m, 1);
          const dataFim = new Date(ano, m + 1, 0, 23, 59, 59);
          const mesNome = dataInicio.toLocaleDateString('pt-PT', { month: 'short' });
          
          const valorMes = participacoesFiltradas
            .filter((p: Participacao) => {
              const dataParticipacao = new Date(p.createdAt);
              return dataParticipacao >= dataInicio && dataParticipacao <= dataFim;
            })
            .reduce((sum: number, p: Participacao) => sum + (p.valorPago || 0), 0);
          
          meses.push({ mes: mesNome, valor: valorMes });
        }
        const total = meses.reduce((sum, m) => sum + m.valor, 0);
        return { total, meses };
      };

      const selectedYearData = calcularDadosAno(selectedYear);
      const compareYearData = calcularDadosAno(compareYear);
      const variacao = compareYearData.total > 0 
        ? ((selectedYearData.total - compareYearData.total) / compareYearData.total) * 100 
        : selectedYearData.total > 0 ? 100 : 0;

      setYearComparison({
        selectedYear: selectedYearData,
        compareYear: compareYearData,
        variacao
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch Event Stats for Detailed Charts
  const fetchEventStats = async (eventoId: string) => {
    if (!eventoId) {
      setEventStats(null);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setEventStatsLoading(true);
    try {
      // Buscar evento
      const evento = eventos.find(e => e.id === eventoId) || null;

      // Buscar jogos do evento
      const jogosRes = await fetch(`/api/jogos?eventoId=${eventoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jogosData = await jogosRes.json();
      const jogosList = Array.isArray(jogosData) ? jogosData : [];

      // Buscar participações de todos os jogos
      const jogosStats: { jogo: Jogo; participacoes: number; angariado: number }[] = [];
      let totalParticipacoes = 0;
      let totalAngariado = 0;
      const participacoesPorDia: Record<string, { valor: number; count: number }> = {};
      const metodosPagamento: Record<string, { total: number; valor: number }> = {
        dinheiro: { total: 0, valor: 0 },
        mbway: { total: 0, valor: 0 }
      };

      for (const jogo of jogosList) {
        const partRes = await fetch(`/api/participacoes?jogoId=${jogo.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const partData = await partRes.json();
        const participacoes = Array.isArray(partData) ? partData : [];

        const jogoAngariado = participacoes.reduce((sum: number, p: Participacao) => sum + (p.valorPago || 0), 0);
        jogosStats.push({ jogo, participacoes: participacoes.length, angariado: jogoAngariado });

        totalParticipacoes += participacoes.length;
        totalAngariado += jogoAngariado;

        // Processar dados diários e métodos de pagamento
        participacoes.forEach((p: Participacao) => {
          const dia = new Date(p.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
          if (!participacoesPorDia[dia]) {
            participacoesPorDia[dia] = { valor: 0, count: 0 };
          }
          participacoesPorDia[dia].valor += p.valorPago || 0;
          participacoesPorDia[dia].count++;

          // Método de pagamento (assumindo que existe no objeto)
          const metodo = (p as any).metodoPagamento || 'dinheiro';
          if (metodo === 'mbway') {
            metodosPagamento.mbway.total++;
            metodosPagamento.mbway.valor += p.valorPago || 0;
          } else {
            metodosPagamento.dinheiro.total++;
            metodosPagamento.dinheiro.valor += p.valorPago || 0;
          }
        });
      }

      // Ordenar evolução diária
      const evolucaoDiaria = Object.entries(participacoesPorDia)
        .map(([dia, data]) => ({ dia, valor: data.valor, participacoes: data.count }))
        .sort((a, b) => {
          const [da, db] = [a.dia, b.dia].map(d => {
            const [day, month] = d.split('/').map(Number);
            return new Date(new Date().getFullYear(), month - 1, day).getTime();
          });
          return da - db;
        })
        .slice(-30); // Últimos 30 dias

      setEventStats({
        evento,
        totalParticipacoes,
        totalAngariado,
        jogosStats,
        evolucaoDiaria,
        metodosPagamento: [
          { metodo: 'Dinheiro', ...metodosPagamento.dinheiro },
          { metodo: 'MBWay', ...metodosPagamento.mbway }
        ]
      });
    } catch (error) {
      console.error('Error fetching event stats:', error);
    } finally {
      setEventStatsLoading(false);
    }
  };

  // Fetch Public Organization Data by Slug
  const fetchPublicOrgData = async (slug: string) => {
    setPublicOrgLoading(true);
    try {
      // Buscar todas as organizações e encontrar por slug
      const orgsRes = await fetch('/api/aldeias');
      const orgsData = await orgsRes.json();
      const organizacao = Array.isArray(orgsData) 
        ? orgsData.find((o: Aldeia) => o.slug === slug || o.id === slug)
        : null;

      if (!organizacao) {
        toast.error('Organização não encontrada');
        setPublicOrgSlug(null);
        return;
      }

      // Buscar eventos da organização
      const eventosRes = await fetch(`/api/eventos?aldeiaId=${organizacao.id}`);
      const eventosData = await eventosRes.json();
      const eventosList = Array.isArray(eventosData) ? eventosData : [];

      // Buscar jogos de todos os eventos
      const jogosList: Jogo[] = [];
      let totalParticipacoes = 0;
      let totalAngariado = 0;

      for (const evento of eventosList) {
        const jogosRes = await fetch(`/api/jogos?eventoId=${evento.id}`);
        const jogosData = await jogosRes.json();
        if (Array.isArray(jogosData)) {
          for (const jogo of jogosData) {
            jogosList.push(jogo);
            // Buscar participações do jogo
            const partRes = await fetch(`/api/participacoes?jogoId=${jogo.id}`);
            const partData = await partRes.json();
            if (Array.isArray(partData)) {
              totalParticipacoes += partData.length;
              totalAngariado += partData.reduce((sum: number, p: Participacao) => sum + (p.valorPago || 0), 0);
            }
          }
        }
      }

      setPublicOrgData({
        organizacao,
        eventos: eventosList,
        jogos: jogosList,
        stats: {
          totalEventos: eventosList.length,
          totalJogos: jogosList.length,
          totalParticipacoes,
          totalAngariado
        }
      });
    } catch (error) {
      console.error('Error fetching public org data:', error);
      toast.error('Erro ao carregar organização');
    } finally {
      setPublicOrgLoading(false);
    }
  };

  // Fetch Notificações
  const fetchNotificacoes = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/notificacoes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotificacoes(data.notificacoes || []);
        setNotificacoesNaoLidas(data.naoLidas || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Marcar notificações como lidas
  const marcarNotificacoesLidas = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('/api/notificacoes', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificacoesNaoLidas(0);
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Participation
  const openParticiparModal = async (jogo: Jogo) => {
    if (!user) {
      setAuthModalOpen(true);
      toast.info('Inicie sessão para participar');
      return;
    }
    setJogoSelecionado(jogo);
    setDadosParticipacao(null);
    setNumerosSelecionados([]);
    setCoordenadasSelecionadas([]); // Reset multi-select para Poio da Vaca
    setOcupados([]); // Reset occupied positions before fetching new ones
    
    // Admin e Vendedor podem usar dinheiro, utilizador normal só MBWay
    const isAdminOrVendedor = ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role);
    setMetodoPagamento(isAdminOrVendedor ? 'dinheiro' : 'mbway');
    setAdminParaCliente(false);
    setNomeCliente('');
    setTelefoneCliente('');
    setEmailCliente('');
    setIdentificacaoValida(false);
    
    setTelefoneMbway('');
    setStep('select');
    setParticiparModalOpen(true);
    await fetchOcupados(jogo.id);
  };

  const handleParticipar = async () => {
    if (!jogoSelecionado) return;
    
    // Determinar números a participar
    const isAdminOrVendedor = ['super_admin', 'aldeia_admin', 'vendedor'].includes(user?.role || '');
    const isRifaOrTombola = ['rifa', 'tombola'].includes(jogoSelecionado.tipo);
    const numerosAParticipar = isRifaOrTombola && numerosSelecionados.length > 0 
      ? numerosSelecionados 
      : dadosParticipacao?.numero 
        ? [dadosParticipacao.numero] 
        : [];
    
    // Para Poio da Vaca, usar coordenadas selecionadas
    const coordenadasAParticipar = jogoSelecionado.tipo === 'poio_vaca' 
      ? coordenadasSelecionadas 
      : [];
    
    // Para Raspadinha, usar quantidade
    const isRaspadinha = jogoSelecionado.tipo === 'raspadinha';
    
    const hasSelection = isRaspadinha 
      ? quantidadeRaspadinha > 0 
      : jogoSelecionado.tipo === 'poio_vaca' 
        ? coordenadasAParticipar.length > 0 
        : numerosAParticipar.length > 0;
    
    if (!hasSelection) return;
    
    // Validar identificação do cliente se admin/vendedor está a registar
    if (adminParaCliente && isAdminOrVendedor) {
      if (!nomeCliente.trim()) {
        toast.error('Nome do cliente é obrigatório');
        setParticipacaoLoading(false);
        return;
      }
      if (!telefoneCliente.trim() && !emailCliente.trim()) {
        toast.error('É obrigatório indicar telemóvel OU email do cliente');
        setParticipacaoLoading(false);
        return;
      }
    }
    
    setParticipacaoLoading(true);
    const token = localStorage.getItem('token');

    try {
      if (jogoSelecionado.tipo === 'poio_vaca') {
        // Poio da Vaca: múltiplas coordenadas
        let successCount = 0;
        let errorCount = 0;
        
        for (const coord of coordenadasAParticipar) {
          const res = await fetch('/api/participacoes', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              jogoId: jogoSelecionado.id,
              dadosParticipacao: coord,
              valorPago: jogoSelecionado.precoParticipacao,
              metodoPagamento,
              telefoneMbway: metodoPagamento === 'mbway' ? telefoneMbway : null,
              adminParaCliente: adminParaCliente && isAdminOrVendedor,
              nomeCliente: adminParaCliente ? nomeCliente : null,
              telefoneCliente: adminParaCliente ? telefoneCliente : null,
              emailCliente: adminParaCliente ? emailCliente : null
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        }

        if (successCount > 0) {
          const coordsStr = coordenadasAParticipar.slice(0, successCount).map(c => `${c.letra}${c.numero}`).join(', ');
          toast.success(`${successCount} participação${successCount > 1 ? 'ões' : ''} registada${successCount > 1 ? 's' : ''}!`, {
            description: `Coordenadas: ${coordsStr} • Total: ${(successCount * jogoSelecionado.precoParticipacao).toFixed(2)}€`,
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          });
        }
        
        if (errorCount > 0) {
          toast.error(`${errorCount} coordenada${errorCount > 1 ? 's' : ''} já ocupada${errorCount > 1 ? 's' : ''}`);
        }
      } else if (isRaspadinha) {
        // Raspadinha: comprar múltiplos cartões
        const res = await fetch('/api/participacoes', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            jogoId: jogoSelecionado.id,
            dadosParticipacao: { quantidade: quantidadeRaspadinha },
            valorPago: jogoSelecionado.precoParticipacao * quantidadeRaspadinha,
            metodoPagamento,
            telefoneMbway: metodoPagamento === 'mbway' ? telefoneMbway : null,
            adminParaCliente: adminParaCliente && isAdminOrVendedor,
            nomeCliente: adminParaCliente ? nomeCliente : null,
            telefoneCliente: adminParaCliente ? telefoneCliente : null,
            emailCliente: adminParaCliente ? emailCliente : null,
            // Raspadinha specific
            isRaspadinha: true,
            quantidade: quantidadeRaspadinha
          }),
        });

        if (res.ok) {
          const data = await res.json();
          toast.success(`${quantidadeRaspadinha} cartão${quantidadeRaspadinha > 1 ? 's' : ''} comprado${quantidadeRaspadinha > 1 ? 's' : ''}!`, {
            description: `Total: ${(quantidadeRaspadinha * jogoSelecionado.precoParticipacao).toFixed(2)}€`,
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          });
          
          // Se retornou participações, mostrar raspadinhas para jogar
          if (data.participacoes && data.participacoes.length > 0) {
            setParticipacoesRaspadinha(data.participacoes);
            setJogoRaspadinha(jogoSelecionado);
            setRaspadinhasReveladas(new Map()); // Reset reveladas
            setParticiparModalOpen(false);
            setRaspadinhaModalOpen(true); // Abrir modal de raspadinha para jogar
            return; // Don't close participar modal yet, show raspadinha modal
          }
        } else {
          const errorData = await res.json();
          toast.error(errorData.error || 'Erro ao comprar cartões');
        }
      } else {
        // Rifa/Tombola: múltiplas participações
        let successCount = 0;
        let errorCount = 0;
        
        for (const numero of numerosAParticipar) {
          const res = await fetch('/api/participacoes', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              jogoId: jogoSelecionado.id,
              dadosParticipacao: { numero },
              valorPago: jogoSelecionado.precoParticipacao,
              metodoPagamento,
              telefoneMbway: metodoPagamento === 'mbway' ? telefoneMbway : null,
              adminParaCliente: adminParaCliente && isAdminOrVendedor,
              nomeCliente: adminParaCliente ? nomeCliente : null,
              telefoneCliente: adminParaCliente ? telefoneCliente : null,
              emailCliente: adminParaCliente ? emailCliente : null
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`${successCount} participação${successCount > 1 ? 'ões' : ''} registada${successCount > 1 ? 's' : ''}!`, {
            description: `Total: ${(successCount * jogoSelecionado.precoParticipacao).toFixed(2)}€`,
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          });
        }
        
        if (errorCount > 0) {
          toast.error(`${errorCount} número${errorCount > 1 ? 's' : ''} já ocupado${errorCount > 1 ? 's' : ''}`);
        }
      }
      
      setParticiparModalOpen(false);
      fetchPublicGames();
      fetchMinhasParticipacoes();
    } catch (error) {
      toast.error('Erro ao participar');
    } finally {
      setParticipacaoLoading(false);
    }
  };

  // Revelar Raspadinha
  const handleRevelarRaspadinha = async (participacaoId: string) => {
    if (raspadinhasReveladas.has(participacaoId)) return; // Já revelada
    
    setRevelandoRaspadinha(participacaoId);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/participacoes/${participacaoId}/revelar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao revelar cartão');
        return;
      }

      // Adicionar às reveladas
      setRaspadinhasReveladas(prev => {
        const newMap = new Map(prev);
        newMap.set(participacaoId, data.resultado);
        return newMap;
      });

      // Se ganhou prémio, mostrar confetti
      if (data.resultado?.isWinner) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast.success('🎉 Parabéns! Ganhou um prémio!', {
          description: `${data.resultado.premio?.nome} - ${data.resultado.premio?.valor}€`,
          icon: <Trophy className="h-4 w-4 text-yellow-500" />,
          duration: 5000,
        });
      } else {
        toast.info('Cartão revelado!', {
          description: 'Não teve sorte desta vez. Tente novamente!',
        });
      }

      fetchMinhasParticipacoes();
    } catch (error) {
      toast.error('Erro ao revelar cartão');
    } finally {
      setRevelandoRaspadinha(null);
    }
  };

  // Create Functions
  const openCreateModal = (type: 'aldeia' | 'evento' | 'jogo') => {
    setCreateType(type);
    setCreateForm({
      // Aldeia / Organização
      nome: '',
      descricao: '',
      localizacao: '',
      tipoOrganizacao: 'aldeia',
      slug: '',
      nomeEscola: '',
      codigoEscola: '',
      nivelEnsino: '',
      responsavel: '',
      contactoResponsavel: '',
      morada: '',
      codigoPostal: '',
      localidade: '',
      autorizacaoCM: false,
      numeroAlvara: '',
      // Evento
      aldeiaId: aldeias[0]?.id || '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      objectivoAngariacao: '',
      // Jogo
      eventoId: eventos[0]?.id || '',
      tipo: 'rifa',
      precoParticipacao: 1,
      config: { totalBilhetes: 100 },
      imagemUrl: ''
    });
    setCreateModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    const token = localStorage.getItem('token');

    try {
      let endpoint = '';
      let body: any = {};

      switch (createType) {
        case 'aldeia':
          endpoint = '/api/aldeias';
          body = {
            nome: createForm.nome,
            descricao: createForm.descricao,
            localizacao: createForm.localizacao,
            logoBase64: createForm.imagemUrl || null,
            // === Expansão v3.0: Novos campos ===
            tipoOrganizacao: createForm.tipoOrganizacao,
            slug: createForm.slug || null,
            nomeEscola: createForm.tipoOrganizacao === 'escola' ? createForm.nomeEscola : null,
            codigoEscola: createForm.tipoOrganizacao === 'escola' ? createForm.codigoEscola : null,
            nivelEnsino: ['escola', 'associacao_pais'].includes(createForm.tipoOrganizacao) ? createForm.nivelEnsino : null,
            responsavel: createForm.responsavel || null,
            contactoResponsavel: createForm.contactoResponsavel || null,
            morada: createForm.morada || null,
            codigoPostal: createForm.codigoPostal || null,
            localidade: createForm.localidade || null,
            autorizacaoCM: createForm.autorizacaoCM,
            numeroAlvara: createForm.numeroAlvara || null
          };
          break;
        case 'evento':
          endpoint = '/api/eventos';
          body = {
            nome: createForm.nome,
            descricao: createForm.descricao,
            aldeiaId: createForm.aldeiaId,
            dataInicio: new Date(createForm.dataInicio),
            dataFim: createForm.dataFim ? new Date(createForm.dataFim) : null,
            estado: 'ativo',
            imagemBase64: createForm.imagemUrl || null,
            // === Expansão v3.0: Meta de angariação ===
            objectivoAngariacao: createForm.objectivoAngariacao ? parseFloat(createForm.objectivoAngariacao) : null
          };
          break;
        case 'jogo':
          endpoint = '/api/jogos';
          body = {
            eventoId: createForm.eventoId,
            tipo: createForm.tipo,
            config: createForm.tipo === 'poio_vaca' 
              ? { linhas: createForm.config.linhas || 10, colunas: createForm.config.colunas || 10 }
              : createForm.tipo === 'raspadinha'
              ? {}
              : { totalBilhetes: createForm.config.totalBilhetes },
            precoParticipacao: createForm.precoParticipacao,
            premioId: createForm.premioId || null,
            // Raspadinha fields
            ...(createForm.tipo === 'raspadinha' && {
              stockInicial: stockInicial,
              premiosRaspadinha: premiosRaspadinha,
              imagemCapa: createForm.imagemUrl || null,
              limitePorUsuario: limitePorUsuario || null,
            })
          };
          break;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || `Erro ao criar ${createType}`);
        return;
      }

      toast.success(`${createType.charAt(0).toUpperCase() + createType.slice(1)} criado com sucesso!`);
      setCreateModalOpen(false);
      setCreateForm({ ...createForm, imagemUrl: '' }); // Reset image
      fetchAdminData();
      fetchPublicGames();
    } catch (error) {
      toast.error('Erro ao criar');
    } finally {
      setCreateLoading(false);
    }
  };

  // Sorteio
  const handleSorteio = async (jogoId: string) => {
    const token = localStorage.getItem('token');
    
    toast.promise(
      fetch(`/api/sorteios/${jogoId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao sortear');
        return data;
      }),
      {
        loading: 'A realizar sorteio...',
        success: (data) => {
          fetchAdminData();
          fetchPublicGames();
          return { message: 'Sorteio realizado!', description: `Vencedor: ${JSON.stringify(data.resultado)}` };
        },
        error: (err) => ({ message: 'Erro no sorteio', description: err.message }),
      }
    );
  };

  // Alterar participação
  const openAlterarModal = (participacao: Participacao) => {
    setParticipacaoParaAlterar(participacao);
    setAlterarForm({
      campo: participacao.jogo?.tipo === 'poio_vaca' ? 'coordenada' : 'numero',
      novoNumero: '',
      novaLetra: '',
      motivo: '',
      tipoAlteracao: 'trocar'
    });
    setAlterarModalOpen(true);
  };

  const handleAlterarParticipacao = async () => {
    if (!participacaoParaAlterar || !alterarForm.motivo.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Se for trocar, verificar se o novo número/coordenada foi preenchido
    if (alterarForm.tipoAlteracao === 'trocar' && !alterarForm.novoNumero) {
      toast.error('Indique o novo número/coordenada');
      return;
    }

    setAlterarLoading(true);
    const token = localStorage.getItem('token');

    try {
      const body: any = {
        campo: alterarForm.campo,
        motivo: alterarForm.motivo,
        tipoAlteracao: alterarForm.tipoAlteracao
      };

      if (alterarForm.tipoAlteracao === 'trocar') {
        if (alterarForm.campo === 'numero') {
          body.novoNumero = parseInt(alterarForm.novoNumero);
        } else if (alterarForm.campo === 'coordenada') {
          body.novaCoordenada = {
            letra: alterarForm.novaLetra.toUpperCase(),
            numero: parseInt(alterarForm.novoNumero)
          };
        }
      }

      const res = await fetch(`/api/participacoes/${participacaoParaAlterar.id}/alterar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao alterar participação');
        return;
      }

      if (alterarForm.tipoAlteracao === 'anular') {
        toast.success('Participação anulada com sucesso!', {
          description: data.infoAdicional || 'O número está agora disponível',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
      } else {
        toast.success('Participação alterada com sucesso!', {
          description: `Campo ${alterarForm.campo} atualizado`,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
      }

      setAlterarModalOpen(false);
      fetchMinhasParticipacoes();
      fetchAdminData();
      if (jogoDetalhe) {
        fetchOcupados(jogoDetalhe.id);
      }
    } catch (error) {
      toast.error('Erro ao alterar participação');
    } finally {
      setAlterarLoading(false);
    }
  };

  // Ver histórico de alterações
  const openHistoricoModal = async (participacao: Participacao) => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/participacoes/${participacao.id}/historico`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao carregar histórico');
        return;
      }

      setHistoricoParticipacao(data);
      setHistoricoModalOpen(true);
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    }
  };

  // Criar novo vendedor
  const handleCriarVendedor = async () => {
    if (!novoVendedorForm.nome || !novoVendedorForm.email || !novoVendedorForm.password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setNovoVendedorLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: novoVendedorForm.nome,
          email: novoVendedorForm.email,
          password: novoVendedorForm.password,
          role: 'vendedor',
          aldeiaId: user?.aldeiaId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao criar vendedor');
        return;
      }

      toast.success('Vendedor criado com sucesso!', {
        description: `${novoVendedorForm.nome} pode agora fazer login`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      setNovoVendedorModalOpen(false);
      setNovoVendedorForm({ nome: '', email: '', password: '' });
      fetchAdminData();
    } catch (error) {
      toast.error('Erro ao criar vendedor');
    } finally {
      setNovoVendedorLoading(false);
    }
  };

  // Profile Edit Functions
  const openProfileModal = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/users/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setProfileForm({ 
          nome: data.nome || '', 
          telefone: data.telefone || '',
          notificacoesEmail: data.notificacoesEmail ?? true
        });
        setProfileData(data); // Store full profile data
        setProfileModalOpen(true);
      }
    } catch (error) {
      toast.error('Erro ao carregar perfil');
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setProfileLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/users/perfil', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: profileForm.nome,
          telefone: profileForm.telefone,
          notificacoesEmail: profileForm.notificacoesEmail
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao atualizar perfil');
        return;
      }

      // Update local user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...userData, nome: data.nome, telefone: data.telefone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileData(data); // Update profile data

      toast.success('Perfil atualizado com sucesso!', {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      setProfileModalOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  // RGPD - Export Data Function
  const handleExportData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setExportLoading(true);
    try {
      const res = await fetch('/api/users/exportar-dados', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erro ao exportar dados');
        return;
      }

      const data = await res.json();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meus_dados_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!', {
        icon: <Download className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      toast.error('Erro ao exportar dados');
    } finally {
      setExportLoading(false);
    }
  };

  // RGPD - Delete Account Function
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'APAGAR') {
      toast.error('Digite "APAGAR" para confirmar');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setDeleteLoading(true);
    try {
      const res = await fetch('/api/users/apagar-dados', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao apagar conta');
        return;
      }

      toast.success('Conta apagada com sucesso', {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      // Clear localStorage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setActiveView('public');
      setDeleteAccountModalOpen(false);
      setProfileModalOpen(false);
    } catch (error) {
      toast.error('Erro ao apagar conta');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Payment History Functions
  const openPagamentosModal = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setPagamentosLoading(true);
    setPagamentosModalOpen(true);
    
    try {
      const res = await fetch('/api/users/historico-pagamentos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setPagamentosData(data);
      } else {
        toast.error('Erro ao carregar histórico');
      }
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    } finally {
      setPagamentosLoading(false);
    }
  };

  // Logs Functions
  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLogsLoading(true);
    try {
      const res = await fetch('/api/logs-acesso', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setLogs(data.logs || []);
        setLogsStats(data.estatisticas || null);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  // Export CSV Function
  const handleExportCSV = async (tipo: 'participacoes' | 'vendedores' | 'eventos') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/export?tipo=${tipo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        toast.error('Erro ao exportar dados');
        return;
      }

      const csv = await res.text();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Exportação concluída!', {
        icon: <Download className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      toast.error('Erro ao exportar dados');
    }
  };

  // Export PDF Report Function (FASE 6)
  const handleExportPDF = async (tipo: 'dashboard' | 'evento' | 'participacoes', eventoId?: string) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(34, 139, 34); // Green color
      doc.text('Aldeias Games', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('Relatório de Atividade', pageWidth / 2, 28, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, pageWidth / 2, 35, { align: 'center' });
      
      // Organization info
      if (dashboardStats.organizacao) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Organização: ${dashboardStats.organizacao.nome}`, 14, 45);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const tipoLabels: Record<string, string> = {
          aldeia: 'Aldeia',
          escola: 'Escola',
          associacao_pais: 'Associação de Pais',
          clube: 'Clube'
        };
        doc.text(`Tipo: ${tipoLabels[dashboardStats.organizacao.tipoOrganizacao || 'aldeia']}`, 14, 52);
        if (dashboardStats.organizacao.localidade) {
          doc.text(`Localidade: ${dashboardStats.organizacao.localidade}`, 14, 58);
        }
      }
      
      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 65, pageWidth - 14, 65);
      
      let yPos = 75;
      
      if (tipo === 'dashboard') {
        // Dashboard Summary
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Resumo Geral', 14, yPos);
        yPos += 10;
        
        // Stats table
        autoTable(doc, {
          startY: yPos,
          head: [['Métrica', 'Valor']],
          body: [
            ['Total Angariado', `${dashboardStats.totalAngariado.toFixed(2)}€`],
            ['Total Participações', dashboardStats.totalParticipacoes.toString()],
            ['Eventos Ativos', dashboardStats.eventosAtivos.toString()],
            ['Jogos Ativos', dashboardStats.jogosAtivos.toString()],
            ['Total Eventos', dashboardStats.totalEventos.toString()],
            ['Total Jogos', dashboardStats.totalJogos.toString()],
            ['Vendedores', dashboardStats.totalVendedores.toString()],
            ['Prémios', dashboardStats.totalPremios.toString()],
          ],
          theme: 'striped',
          headStyles: { fillColor: [34, 139, 34] },
          margin: { left: 14, right: 14 },
        });
        
        // @ts-ignore - autotable adds lastAutoTable to doc
        yPos = doc.lastAutoTable.finalY + 15;
        
        // Monthly evolution
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Evolução Mensal (últimos 6 meses)', 14, yPos);
        yPos += 5;
        
        autoTable(doc, {
          startY: yPos,
          head: [['Mês', 'Valor Angariado']],
          body: dashboardStats.historicoMensal.map(h => [
            h.mes.charAt(0).toUpperCase() + h.mes.slice(1),
            `${h.valor.toFixed(2)}€`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [34, 139, 34] },
          margin: { left: 14, right: 14 },
        });
        
        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 15;
        
        // Top vendors
        if (dashboardStats.rankingVendedores.length > 0) {
          if (yPos > 220) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text('Top Vendedores', 14, yPos);
          yPos += 5;
          
          autoTable(doc, {
            startY: yPos,
            head: [['#', 'Nome', 'Vendas', 'Valor']],
            body: dashboardStats.rankingVendedores.map((v, idx) => [
              (idx + 1).toString(),
              v.nome,
              v.vendas.toString(),
              `${v.valor.toFixed(2)}€`
            ]),
            theme: 'striped',
            headStyles: { fillColor: [34, 139, 34] },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipo === 'participacoes') {
        // Participations Report
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Lista de Participações', 14, yPos);
        yPos += 5;
        
        const token = localStorage.getItem('token');
        const res = await fetch('/api/participacoes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const participacoes = await res.json();
        
        if (Array.isArray(participacoes) && participacoes.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Jogo', 'Tipo', 'Posição/Nº', 'Valor', 'Data']],
            body: participacoes.slice(0, 50).map((p: Participacao) => {
              const pos = p.dadosParticipacao?.letra 
                ? `${p.dadosParticipacao.letra}${p.dadosParticipacao.numero}`
                : p.dadosParticipacao?.numero?.toString() || '-';
              return [
                p.jogo?.tipo?.replace('_', ' ') || '-',
                p.jogo?.evento?.nome || '-',
                pos,
                `${p.valorPago.toFixed(2)}€`,
                new Date(p.createdAt).toLocaleDateString('pt-PT')
              ];
            }),
            theme: 'striped',
            headStyles: { fillColor: [34, 139, 34] },
            margin: { left: 14, right: 14 },
          });
        } else {
          doc.setFontSize(10);
          doc.text('Sem participações registadas', 14, yPos + 5);
        }
      } else if (tipo === 'evento' && eventoId) {
        // Event Report
        const evento = eventos.find(e => e.id === eventoId);
        if (evento) {
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(`Evento: ${evento.nome}`, 14, yPos);
          yPos += 10;
          
          autoTable(doc, {
            startY: yPos,
            head: [['Campo', 'Valor']],
            body: [
              ['Estado', evento.estado],
              ['Data Início', new Date(evento.dataInicio).toLocaleDateString('pt-PT')],
              ['Data Fim', evento.dataFim ? new Date(evento.dataFim).toLocaleDateString('pt-PT') : 'Indefinido'],
              ['Meta Angariação', evento.objectivoAngariacao ? `${evento.objectivoAngariacao}€` : 'Não definida'],
              ['Organização', evento.aldeia?.nome || '-'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [34, 139, 34] },
            margin: { left: 14, right: 14 },
          });
        }
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount} - Aldeias Games © ${new Date().getFullYear()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      const filename = `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      toast.success('Relatório PDF gerado com sucesso!', {
        icon: <FileText className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    }
  };

  // Backup Management Functions
  const fetchBackups = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setBackupsLoading(true);
    try {
      const res = await fetch('/api/backup', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setBackupsLoading(false);
    }
  };

  // Prémios Management Functions
  const fetchPremios = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setPremiosLoading(true);
    try {
      const res = await fetch('/api/premios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setPremios(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching premios:', error);
    } finally {
      setPremiosLoading(false);
    }
  };

  const openPremioModal = (premio?: any) => {
    if (premio) {
      setPremioForm({
        id: premio.id,
        nome: premio.nome,
        descricao: premio.descricao || '',
        valorEstimado: premio.valorEstimado?.toString() || '',
        imagemBase64: premio.imagemBase64 || '',
        patrocinador: premio.patrocinador || '',
        ordem: premio.ordem || 0,
        aldeiaId: premio.aldeiaId || aldeias[0]?.id || '',
        isEdit: true
      });
    } else {
      setPremioForm({
        id: '',
        nome: '',
        descricao: '',
        valorEstimado: '',
        imagemBase64: '',
        patrocinador: '',
        ordem: 0,
        aldeiaId: user?.role === 'super_admin' ? (aldeias[0]?.id || '') : (user.aldeiaId || ''),
        isEdit: false
      });
    }
    setPremioModalOpen(true);
  };

  const handlePremioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um ficheiro de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setPremioForm({ ...premioForm, imagemBase64: base64 });
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      toast.error('Erro ao carregar imagem');
    }
  };

  const handleSavePremio = async () => {
    if (!premioForm.nome.trim()) {
      toast.error('Nome do prémio é obrigatório');
      return;
    }

    setPremioLoading(true);
    const token = localStorage.getItem('token');

    try {
      const url = premioForm.isEdit 
        ? `/api/premios/${premioForm.id}`
        : '/api/premios';
      const method = premioForm.isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: premioForm.nome,
          descricao: premioForm.descricao || null,
          valorEstimado: premioForm.valorEstimado || null,
          imagemBase64: premioForm.imagemBase64 || null,
          patrocinador: premioForm.patrocinador || null,
          ordem: premioForm.ordem,
          aldeiaId: premioForm.aldeiaId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao salvar prémio');
        return;
      }

      toast.success(premioForm.isEdit ? 'Prémio atualizado!' : 'Prémio criado!', {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      setPremioModalOpen(false);
      fetchPremios();
    } catch (error) {
      toast.error('Erro ao salvar prémio');
    } finally {
      setPremioLoading(false);
    }
  };

  const handleDeletePremio = async (premioId: string) => {
    if (!confirm('Tem certeza que deseja apagar este prémio?')) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/premios/${premioId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao apagar prémio');
        return;
      }

      toast.success(data.message || 'Prémio apagado!', {
        description: data.infoAdicional,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      fetchPremios();
    } catch (error) {
      toast.error('Erro ao apagar prémio');
    }
  };

  const handleCreateBackup = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setBackupCreating(true);
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao criar backup');
        return;
      }

      toast.success('Backup criado com sucesso!', {
        description: data.backup?.nome,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      fetchBackups();
    } catch (error) {
      toast.error('Erro ao criar backup');
    } finally {
      setBackupCreating(false);
    }
  };

  const handleRestoreBackup = async (backupName: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm(`Tem certeza que deseja restaurar o backup "${backupName}"? A base de dados atual será substituída.`)) {
      return;
    }

    setBackupRestoring(backupName);
    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ backupName, criarBackupAtual: true })
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao restaurar backup');
        return;
      }

      toast.success('Backup restaurado com sucesso!', {
        description: 'Um backup do estado anterior foi criado automaticamente.',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      fetchBackups();
      fetchAdminData();
    } catch (error) {
      toast.error('Erro ao restaurar backup');
    } finally {
      setBackupRestoring(null);
    }
  };

  const handleDeleteBackup = async (backupName: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm(`Tem certeza que deseja apagar o backup "${backupName}"?`)) {
      return;
    }

    setBackupDeleting(backupName);
    try {
      const res = await fetch(`/api/backup/restore?backupName=${encodeURIComponent(backupName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao apagar backup');
        return;
      }

      toast.success('Backup apagado com sucesso!');
      fetchBackups();
    } catch (error) {
      toast.error('Erro ao apagar backup');
    } finally {
      setBackupDeleting(null);
    }
  };

  // Image to Base64 conversion
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'aldeia' | 'evento') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um ficheiro de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setCreateForm({ ...createForm, imagemUrl: base64 });
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      toast.error('Erro ao carregar imagem');
    }
  };

  // Abrir modal de detalhes da organização
  const openOrgDetalheModal = async (aldeia: Aldeia) => {
    setOrgDetalhe(aldeia);
    setOrgDetalheModalOpen(true);
    setOrgDetalheLoading(true);

    try {
      // Buscar eventos e jogos da organização
      const [eventosRes, jogosRes] = await Promise.all([
        fetch(`/api/eventos?aldeiaId=${aldeia.id}`),
        fetch(`/api/jogos`)
      ]);

      const eventosData = await eventosRes.json();
      const jogosData = await jogosRes.json();

      // Filtrar eventos da organização
      const eventosOrg = Array.isArray(eventosData) ? eventosData.filter((e: Evento) => e.aldeiaId === aldeia.id) : [];
      setOrgDetalheEventos(eventosOrg);

      // Filtrar jogos dos eventos da organização
      const eventoIds = eventosOrg.map((e: Evento) => e.id);
      const jogosOrg = Array.isArray(jogosData) ? jogosData.filter((j: Jogo) => eventoIds.includes(j.eventoId)) : [];
      setOrgDetalheJogos(jogosOrg);
    } catch (error) {
      console.error('Erro ao carregar dados da organização:', error);
      toast.error('Erro ao carregar dados da organização');
    } finally {
      setOrgDetalheLoading(false);
    }
  };

  // Abrir modal de detalhes do evento/campanha
  const openEventoDetalheModal = async (evento: Evento) => {
    setEventoDetalhe(evento);
    setEventoDetalheModalOpen(true);
    setEventoDetalheLoading(true);

    try {
      // Buscar jogos do evento
      const jogosRes = await fetch(`/api/jogos?eventoId=${evento.id}`);
      const jogosData = await jogosRes.json();
      const jogosList = Array.isArray(jogosData) ? jogosData : [];
      setEventoDetalheJogos(jogosList);

      // Calcular estatísticas
      let totalAngariado = 0;
      let totalParticipacoes = 0;
      
      for (const jogo of jogosList) {
        const partRes = await fetch(`/api/participacoes?jogoId=${jogo.id}`);
        const partData = await partRes.json();
        if (Array.isArray(partData)) {
          totalParticipacoes += partData.length;
          totalAngariado += partData.reduce((sum: number, p: Participacao) => sum + (p.valorPago || 0), 0);
        }
      }
      
      setEventoDetalheStats({ totalAngariado, totalParticipacoes });
    } catch (error) {
      console.error('Erro ao carregar dados do evento:', error);
      toast.error('Erro ao carregar dados do evento');
    } finally {
      setEventoDetalheLoading(false);
    }
  };

  // Funções de partilha
  const getShareUrl = () => {
    return window.location.href;
  };

  const handleShare = async (type: 'evento' | 'jogo', data: any) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/?share=${type}_${data.id}`;
    const shareTitle = type === 'evento' 
      ? `${data.nome} - Aldeias Games`
      : `Jogo de ${data.tipo?.replace('_', ' ')} - Aldeias Games`;
    const shareText = type === 'evento'
      ? `Participe em "${data.nome}" e ajude a angariar fundos! ${data.aldeia?.nome || ''}`
      : `Participe neste jogo e concorra a prémios! ${data.precoParticipacao}€ por participação`;

    // Tenta usar Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        toast.success('Partilhado com sucesso!');
        return;
      } catch (error: any) {
        if (error.name === 'AbortError') return; // Utilizador cancelou
        // Se falhar, continua para os botões manuais
      }
    }
  };

  const handleShareFacebook = (type: 'evento' | 'jogo', data: any) => {
    const shareUrl = `${window.location.origin}/?share=${type}_${data.id}`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = (type: 'evento' | 'jogo', data: any) => {
    const shareUrl = `${window.location.origin}/?share=${type}_${data.id}`;
    const text = type === 'evento'
      ? `Participe em "${data.nome}" e ajude a angariar fundos!`
      : `Participe neste jogo e concorra a prémios!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = (type: 'evento' | 'jogo', data: any) => {
    const shareUrl = `${window.location.origin}/?share=${type}_${data.id}`;
    const text = type === 'evento'
      ? `🎮 Participe em "${data.nome}" e ajude a angariar fundos! ${data.aldeia?.nome || ''}\n\n${shareUrl}`
      : `🎲 Jogo de ${data.tipo?.replace('_', ' ')} - ${data.precoParticipacao}€ por participação\n\n${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = async (type: 'evento' | 'jogo', data: any) => {
    const shareUrl = `${window.location.origin}/?share=${type}_${data.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success('Link copiado!', {
        description: 'O link foi copiado para a área de transferência',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  // Componente de botões de partilha
  const ShareButtons = ({ type, data }: { type: 'evento' | 'jogo', data: any }) => (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-xs text-muted-foreground w-full mb-1">Partilhar:</p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare(type, data)}
        className="gap-1"
      >
        <Share2 className="h-4 w-4" />
        Partilhar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShareFacebook(type, data)}
        className="gap-1 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
      >
        <span className="text-sm font-bold">f</span>
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShareTwitter(type, data)}
        className="gap-1"
      >
        <span className="text-sm font-bold">𝕏</span>
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShareWhatsApp(type, data)}
        className="gap-1 bg-green-600 text-white hover:bg-green-700 border-green-600"
      >
        <span className="text-sm">📱</span>
        WhatsApp
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleCopyLink(type, data)}
        className="gap-1"
      >
        {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        {linkCopied ? 'Copiado!' : 'Copiar'}
      </Button>
    </div>
  );

  // Wizard de Configuração - Upload de logo
  const handleWizardLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um ficheiro de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setWizardData({ ...wizardData, logoBase64: base64 });
      toast.success('Logo carregado com sucesso!');
    } catch (error) {
      toast.error('Erro ao carregar imagem');
    }
  };

  // Wizard de Configuração - Guardar dados
  const handleSaveWizard = async (skip: boolean = false) => {
    if (!wizardData.organizacao) return;

    setWizardLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/aldeias/${wizardData.organizacao.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descricao: wizardData.descricao || null,
          morada: wizardData.morada || null,
          codigoPostal: wizardData.codigoPostal || null,
          localidade: wizardData.localidade || null,
          responsavel: wizardData.responsavel || null,
          contactoResponsavel: wizardData.contactoResponsavel || null,
          logoBase64: wizardData.logoBase64 || null,
          nomeEscola: wizardData.organizacao.tipoOrganizacao === 'escola' ? wizardData.nomeEscola : null,
          codigoEscola: wizardData.organizacao.tipoOrganizacao === 'escola' ? wizardData.codigoEscola : null,
          nivelEnsino: ['escola', 'associacao_pais'].includes(wizardData.organizacao.tipoOrganizacao) ? wizardData.nivelEnsino : null,
          autorizacaoCM: wizardData.autorizacaoCM,
          numeroAlvara: wizardData.numeroAlvara || null,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erro ao guardar configuração');
        return;
      }

      toast.success(skip ? 'Pode configurar mais tarde nas definições' : 'Configuração guardada com sucesso!', {
        description: 'A sua organização está pronta para usar',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      setWizardModalOpen(false);
      fetchAdminData();
    } catch (error) {
      toast.error('Erro ao guardar configuração');
    } finally {
      setWizardLoading(false);
    }
  };

  // Check if position is occupied
  const isOcupado = (dados: any) => {
    return ocupados.some(o => {
      if (dados.letra !== undefined) {
        return o.letra === dados.letra && o.numero === dados.numero;
      }
      return o.numero === dados.numero;
    });
  };

  // Check if position belongs to current user
  const isMeu = (dados: any) => {
    if (!user) return false;
    return participacoesJogo.some(p => {
      if (p.userId !== user.id) return false;
      if (dados.letra !== undefined) {
        return p.dadosParticipacao.letra === dados.letra && p.dadosParticipacao.numero === dados.numero;
      }
      return p.dadosParticipacao.numero === dados.numero;
    });
  };

  // Get participation info for a position
  const getParticipacaoByPosicao = (dados: any): Participacao | undefined => {
    return participacoesJogo.find(p => {
      if (dados.letra !== undefined) {
        return p.dadosParticipacao.letra === dados.letra && p.dadosParticipacao.numero === dados.numero;
      }
      return p.dadosParticipacao.numero === dados.numero;
    });
  };

  // Handle click on occupied position (for admin to see who played)
  const handlePosicaoClick = (dados: any, isAdminOrVendedor: boolean) => {
    if (!isOcupado(dados)) return;
    
    const participacao = getParticipacaoByPosicao(dados);
    if (participacao && isAdminOrVendedor) {
      const posicao = dados.letra !== undefined 
        ? `${dados.letra}${dados.numero}` 
        : `Nº ${dados.numero}`;
      setInfoPosicaoModal({ open: true, participacao, posicao });
    }
  };

  // Helper function to generate compliance text
  const getComplianceText = (aldeia: any) => {
    if (!aldeia) return null;
    
    const parts: string[] = [];
    
    // Tipo de organização
    const tipoLabels: Record<string, string> = {
      aldeia: 'Aldeia',
      escola: 'Escola',
      associacao_pais: 'Associação de Pais',
      clube: 'Clube'
    };
    const tipo = tipoLabels[aldeia.tipoOrganizacao] || 'Organização';
    
    // Texto base
    parts.push(`${tipo} "${aldeia.nome}" organizadora deste jogo.`);
    
    // Autorização CM
    if (aldeia.autorizacaoCM) {
      parts.push(`Possui autorização da Câmara Municipal${aldeia.dataAutorizacaoCM ? ` desde ${new Date(aldeia.dataAutorizacaoCM).toLocaleDateString('pt-PT')}` : ''}.`);
    }
    
    // Alvará
    if (aldeia.numeroAlvara) {
      parts.push(`Alvará nº ${aldeia.numeroAlvara}.`);
    }
    
    // Responsável
    if (aldeia.responsavel) {
      parts.push(`Responsável: ${aldeia.responsavel}.`);
    }
    
    return parts.join(' ');
  };

  // Render Grid for Poio da Vaca
  const renderPoioVacaGrid = (jogo: Jogo, isModal: boolean = false) => {
    const config = typeof jogo.config === 'string' ? JSON.parse(jogo.config) : jogo.config;
    const linhas = config.linhas || 10;
    const colunas = config.colunas || 10;
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, linhas);
    const maxCoordenadas = 10;
    const isAdminOrVendedor = user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role);
    
    // Helper function to check if coordinate is selected
    const isCoordSelected = (coord: { letra: string; numero: number }) => {
      return coordenadasSelecionadas.some(c => c.letra === coord.letra && c.numero === coord.numero);
    };
    
    // Helper function to toggle coordinate selection
    const toggleCoordenada = (coord: { letra: string; numero: number }) => {
      const isSelected = isCoordSelected(coord);
      if (isSelected) {
        setCoordenadasSelecionadas(prev => prev.filter(c => !(c.letra === coord.letra && c.numero === coord.numero)));
      } else if (coordenadasSelecionadas.length < maxCoordenadas) {
        setCoordenadasSelecionadas(prev => [...prev, coord]);
      }
    };
    
    return (
      <div className="overflow-x-auto">
        {/* Multi-select info */}
        {isModal && (
          <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg mb-2">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Selecionados: {coordenadasSelecionadas.length}/{maxCoordenadas}
              </span>
            </div>
            <span className="text-sm font-bold text-green-700">
              Total: {(coordenadasSelecionadas.length * jogo.precoParticipacao).toFixed(2)}€
            </span>
          </div>
        )}
        
        {/* Legenda */}
        {isModal && (
          <div className="flex flex-wrap items-center gap-3 mb-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-emerald-500 rounded border border-emerald-600"></div>
              <span className="text-muted-foreground">Selecionado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-amber-500 rounded border border-amber-600"></div>
              <span className="text-muted-foreground">Meus</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-rose-400 rounded border border-rose-500"></div>
              <span className="text-muted-foreground">Ocupados</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-300 rounded border border-gray-400"></div>
              <span className="text-muted-foreground">Sem permissão</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white rounded border border-gray-200"></div>
              <span className="text-muted-foreground">Disponíveis</span>
            </div>
          </div>
        )}
        
        {loadingOcupados && isModal && (
          <div className="flex items-center justify-center py-4 mb-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">A carregar posições...</span>
          </div>
        )}
        <div className="inline-block">
          <div className="flex">
            <div className="w-8 h-8" />
            {Array.from({ length: colunas }).map((_, i) => (
              <div key={i} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-muted-foreground">
                {i + 1}
              </div>
            ))}
          </div>
          {letras.split('').map((letra, l) => (
            <div key={letra} className="flex">
              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-muted-foreground">
                {letra}
              </div>
              {Array.from({ length: colunas }).map((_, c) => {
                const coord = { letra, numero: c + 1 };
                const isSelected = isCoordSelected(coord);
                const occupied = isOcupado(coord);
                const isMyPosition = isMeu(coord);
                const canSelect = jogo.estado === 'ativo' && !occupied && !loadingOcupados;
                const canSelectMore = coordenadasSelecionadas.length < maxCoordenadas;
                
                // Get participation data for this position if occupied
                const participationData = occupied ? getParticipacaoByPosicao(coord) : null;
                
                // Check if current user can alter this participation
                const canAlter = () => {
                  if (!user || !occupied || !participationData) return false;
                  const isSuperAdmin = user.role === 'super_admin';
                  const isAldeiaAdmin = user.role === 'aldeia_admin';
                  const isVendedor = user.role === 'vendedor';
                  
                  if (isSuperAdmin) return true;
                  if (isAldeiaAdmin) {
                    // Aldeia admin can alter any participation in their aldeia's games
                    return jogo.evento?.aldeiaId === user.aldeiaId;
                  }
                  if (isVendedor) {
                    // Vendedor can only alter participations they registered or played
                    return participationData.adminRegistouId === user.id || participationData.userId === user.id;
                  }
                  return false;
                };
                
                const hasAlterPermission = canAlter();
                const isMyOwn = isMyPosition && !isSelected;
                
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      if (canSelect) {
                        toggleCoordenada(coord);
                      } else if (occupied && isAdminOrVendedor) {
                        handlePosicaoClick(coord, true);
                      }
                    }}
                    disabled={!canSelect && (!occupied || !isAdminOrVendedor)}
                    className={cn(
                      "w-8 h-8 border transition-all text-xs relative",
                      isSelected 
                        ? "bg-emerald-500 text-white border-emerald-600 scale-110 z-10 font-bold" 
                        : isMyOwn
                          ? "bg-amber-500 text-white border-amber-600 cursor-pointer hover:bg-amber-600"
                          : occupied
                            ? hasAlterPermission
                              ? "bg-rose-400 text-white border-rose-500 cursor-pointer hover:bg-rose-500"
                              : "bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed"
                            : !canSelectMore
                              ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50"
                              : "bg-white hover:bg-emerald-50 border-gray-200",
                      !canSelect && !occupied && !isMyOwn && "cursor-not-allowed opacity-50"
                    )}
                    title={
                      isSelected ? `Selecionado: ${letra}${c + 1}` :
                      isMyOwn ? `Meu: ${letra}${c + 1}` :
                      occupied 
                        ? hasAlterPermission 
                          ? "Clique para ver detalhes e gerir" 
                          : "Ocupado - Sem permissão para alterar"
                        : `Coordenada ${letra}${c + 1}`
                    }
                  >
                    {isSelected && '✓'}
                    {isMyOwn && !isSelected && '★'}
                    {occupied && !isSelected && !isMyOwn && (hasAlterPermission ? '●' : '⊘')}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rifa Numbers is now handled by RifaNumberSelector component

  // Main Render


  // Public Organization Page
  const renderPublicOrgPage = () => {
    if (publicOrgLoading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-green-600 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            </div>
            <p className="text-muted-foreground">A carregar organização...</p>
          </motion.div>
        </div>
      );
    }

    if (!publicOrgData || !publicOrgData.organizacao) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <EmptyState
            icon={Building}
            title="Organização não encontrada"
            description="A organização que procura não existe ou foi removida."
            action={<Button onClick={() => { setPublicOrgSlug(null); window.history.pushState({}, '', '/'); }}>Voltar</Button>}
          />
        </div>
      );
    }

    const { organizacao, eventos, jogos, stats } = publicOrgData;
    const tipoIcon: Record<string, string> = {
      aldeia: '🏘️',
      escola: '🏫',
      associacao_pais: '👨‍👩‍👧‍👦',
      clube: '⚽'
    };
    const tipoLabel: Record<string, string> = {
      aldeia: 'Aldeia',
      escola: 'Escola',
      associacao_pais: 'Associação de Pais',
      clube: 'Clube'
    };
    const tipoBg: Record<string, string> = {
      aldeia: 'bg-green-100 dark:bg-green-900',
      escola: 'bg-blue-100 dark:bg-blue-900',
      associacao_pais: 'bg-purple-100 dark:bg-purple-900',
      clube: 'bg-orange-100 dark:bg-orange-900'
    };
    const tipo = organizacao.tipoOrganizacao || 'aldeia';
    const jogosAtivos = jogos.filter(j => j.estado === 'ativo');

    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header da Organização */}
        <Card className="overflow-hidden">
          <div className={cn(
            "h-32 bg-gradient-to-r",
            tipo === 'aldeia' && "from-green-400 to-green-600",
            tipo === 'escola' && "from-blue-400 to-blue-600",
            tipo === 'associacao_pais' && "from-purple-400 to-purple-600",
            tipo === 'clube' && "from-orange-400 to-orange-600"
          )} />
          <CardContent className="relative pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              {organizacao.logoBase64 ? (
                <img 
                  src={organizacao.logoBase64} 
                  alt={organizacao.nome}
                  className="w-24 h-24 object-cover rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
                />
              ) : (
                <div className={cn("w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center text-4xl", tipoBg[tipo])}>
                  {tipoIcon[tipo]}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{organizacao.nome}</h1>
                  <Badge variant="secondary">{tipoLabel[tipo]}</Badge>
                </div>
                {organizacao.localizacao && (
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {organizacao.localizacao}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}?org=${organizacao.slug || organizacao.id}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Link copiado!');
                  }}
                  className="gap-1"
                >
                  <Share2 className="h-4 w-4" />
                  Partilhar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setPublicOrgSlug(null); window.history.pushState({}, '', '/'); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {organizacao.descricao && (
              <p className="mt-4 text-muted-foreground">{organizacao.descricao}</p>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.totalAngariado.toFixed(2)}€</p>
              <p className="text-sm text-muted-foreground">Total Angariado</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalParticipacoes}</p>
              <p className="text-sm text-muted-foreground">Participações</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.totalEventos}</p>
              <p className="text-sm text-muted-foreground">Eventos</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{jogosAtivos.length}</p>
              <p className="text-sm text-muted-foreground">Jogos Ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Jogos Ativos */}
        {jogosAtivos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-green-600" />
                Jogos Disponíveis
              </CardTitle>
              <CardDescription>Participe nos jogos desta organização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {jogosAtivos.map((jogo, index) => {
                  const gameType = GAME_TYPES[jogo.tipo as keyof typeof GAME_TYPES] || GAME_TYPES.rifa;
                  return (
                    <motion.div
                      key={jogo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{gameType.emoji}</span>
                              <div>
                                <p className="font-semibold capitalize">{jogo.tipo.replace('_', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{jogo.evento?.nome}</p>
                              </div>
                            </div>
                            <Badge>{jogo._count?.participacoes || 0} part.</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-green-600">{jogo.precoParticipacao}€</p>
                            <Button size="sm" onClick={() => openParticiparModal(jogo)}>
                              Participar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Eventos */}
        {eventos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventos.map((evento) => (
                  <div key={evento.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {evento.imagemBase64 ? (
                        <img src={evento.imagemBase64} alt={evento.nome} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{evento.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(evento.dataInicio).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={evento.estado === 'ativo' ? 'default' : 'secondary'}>
                      {evento.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informação de Contacto */}
        {(organizacao.responsavel || organizacao.morada || organizacao.contactoResponsavel) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {organizacao.responsavel && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Responsável: {organizacao.responsavel}</span>
                  </div>
                )}
                {organizacao.morada && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{organizacao.morada}, {organizacao.codigoPostal || ''} {organizacao.localidade || ''}</span>
                  </div>
                )}
                {organizacao.contactoResponsavel && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{organizacao.contactoResponsavel}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Quer participar?</h3>
            <p className="text-muted-foreground mb-4">
              Crie uma conta para participar nos jogos e concorrer a prémios!
            </p>
            <Button onClick={() => setAuthModalOpen(true)} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Criar Conta
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
          </div>
          <p className="text-muted-foreground">A carregar jogos...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Aldeias Games</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Jogos de aldeias do mundo</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button 
              variant={activeView === 'public' ? 'default' : 'ghost'}
              onClick={() => setActiveView('public')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Jogos
            </Button>
            <Button 
              variant={activeView === 'my-games' ? 'default' : 'ghost'}
              onClick={() => setActiveView('my-games')}
              className="gap-2"
            >
              <Ticket className="h-4 w-4" />
              Meus Jogos
            </Button>
            {user && ['super_admin', 'aldeia_admin'].includes(user.role) && (
              <Button 
                variant={activeView === 'admin' ? 'default' : 'ghost'}
                onClick={() => setActiveView('admin')}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            )}
            {user && user.role === 'vendedor' && (
              <Button 
                variant={activeView === 'vendedor' ? 'default' : 'ghost'}
                onClick={() => setActiveView('vendedor')}
                className="gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Vendas
              </Button>
            )}
          </nav>
          
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{user.nome}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {/* Notifications Button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setNotificacoesModalOpen(true)} 
                  title="Notificações"
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {notificacoesNaoLidas > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas}
                    </span>
                  )}
                </Button>
                {/* Payment History Button */}
                <Button variant="ghost" size="icon" onClick={openPagamentosModal} title="Histórico de Pagamentos">
                  <History className="h-4 w-4" />
                </Button>
                {/* Profile Button */}
                <Button variant="ghost" size="icon" onClick={openProfileModal} title="Editar Perfil">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Terminar Sessão">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => setAuthModalOpen(true)}>
                Entrar
              </Button>
            )}
            
            {/* Mobile menu */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-white z-50 p-4 md:hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-2">
                <Button 
                  variant={activeView === 'public' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => { setActiveView('public'); setSidebarOpen(false); }}
                >
                  <Globe className="h-4 w-4" />
                  Jogos
                </Button>
                <Button 
                  variant={activeView === 'my-games' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => { setActiveView('my-games'); setSidebarOpen(false); }}
                >
                  <Ticket className="h-4 w-4" />
                  Meus Jogos
                </Button>
                {user && ['super_admin', 'aldeia_admin'].includes(user.role) && (
                  <Button 
                    variant={activeView === 'admin' ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => { setActiveView('admin'); setSidebarOpen(false); }}
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                {user && user.role === 'vendedor' && (
                  <Button 
                    variant={activeView === 'vendedor' ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => { setActiveView('vendedor'); setSidebarOpen(false); }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Vendas
                  </Button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {publicOrgSlug ? (
            <div key="public-org">{renderPublicOrgPage()}</div>
          ) : (
            <>
              {activeView === 'public' && <div key="public"><PublicGamesView
                jogosPublicos={jogosPublicos}
                loading={loading}
                openJogoDetalhe={openJogoDetalhe}
                handleShare={handleShare}
                GAME_TYPES={GAME_TYPES}
              /></div>}
              {activeView === 'my-games' && <div key="my-games"><PlayerParticipationsView
                minhasParticipacoes={minhasParticipacoes}
                loading={loading}
                setActiveView={setActiveView}
                openJogoDetalhe={openJogoDetalhe}
                handleRevelarRaspadinha={handleRevelarRaspadinha}
                GAME_TYPES={GAME_TYPES}
              /></div>}
              {activeView === 'admin' && <div key="admin"><AdminDashboardView
                user={user}
                dashboardStats={dashboardStats}
                dashboardLoading={dashboardLoading}
                activeAdminTab={activeAdminTab}
                setActiveAdminTab={setActiveAdminTab}
                eventos={eventos}
                jogosAdmin={jogosAdmin}
                aldeias={aldeias}
                premios={premios}
                logs={logs}
                logsLoading={logsLoading}
                logsStats={logsStats}
                backups={backups}
                backupsLoading={backupsLoading}
                openCreateModal={openCreateModal}
                openEventoDetalheModal={openEventoDetalheModal}
                openPremioModal={openPremioModal}
                handleDeletePremio={handleDeletePremio}
                handleCreateBackup={handleCreateBackup}
                handleRestoreBackup={handleRestoreBackup}
                handleDeleteBackup={handleDeleteBackup}
                fetchDashboardStats={fetchDashboardStats}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                compareYear={compareYear}
                setCompareYear={setCompareYear}
                yearComparison={yearComparison}
                selectedEventId={selectedEventId}
                setSelectedEventId={setSelectedEventId}
                eventStats={eventStats}
                eventStatsLoading={eventStatsLoading}
                exportData={exportData}
                exportLoading={exportLoading}
                backupCreating={backupCreating}
                backupRestoring={backupRestoring}
                backupDeleting={backupDeleting}
              /></div>}
              {activeView === 'vendedor' && <div key="vendedor"><VendedorDashboardView
                vendasVendedor={vendasVendedor}
                setActiveView={setActiveView}
                openJogoDetalhe={openJogoDetalhe}
              /></div>}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>🌍 Aldeias Games - Jogos tradicionais de aldeias de todo o mundo</p>
          <p className="mt-1">Sorteios transparentes e auditáveis</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAuthModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-md">
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setAuthModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle>{authMode === 'login' ? 'Entrar' : 'Criar Conta'}</CardTitle>
                  <CardDescription>
                    {authMode === 'login' 
                      ? 'Entre para participar nos jogos'
                      : 'Crie uma conta e comece a jogar'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'register' && (
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          placeholder="O seu nome"
                          value={authForm.nome}
                          onChange={(e) => setAuthForm({ ...authForm, nome: e.target.value })}
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemplo@email.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        required
                      />
                    </div>
                    {authMode === 'register' && (
                      <div className="space-y-2">
                        <Label>Tipo de Conta</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={authForm.role === 'user' ? 'default' : 'outline'}
                            onClick={() => setAuthForm({ ...authForm, role: 'user' })}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Jogador
                          </Button>
                          <Button
                            type="button"
                            variant={authForm.role === 'aldeia_admin' ? 'default' : 'outline'}
                            onClick={() => setAuthForm({ ...authForm, role: 'aldeia_admin' })}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Organização
                          </Button>
                        </div>
                      </div>
                    )}
                    {authMode === 'register' && authForm.role === 'aldeia_admin' && (
                      <div className="space-y-2">
                        <Label>Tipo de Organização</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={authForm.tipoOrganizacao === 'aldeia' ? 'default' : 'outline'}
                            onClick={() => setAuthForm({ ...authForm, tipoOrganizacao: 'aldeia' })}
                            className="text-xs"
                          >
                            🏘️ Aldeia
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={authForm.tipoOrganizacao === 'escola' ? 'default' : 'outline'}
                            onClick={() => setAuthForm({ ...authForm, tipoOrganizacao: 'escola' })}
                            className="text-xs"
                          >
                            🏫 Escola
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={authForm.tipoOrganizacao === 'associacao_pais' ? 'default' : 'outline'}
                            onClick={() => setAuthForm({ ...authForm, tipoOrganizacao: 'associacao_pais' })}
                            className="text-xs"
                          >
                            👨‍👩‍👧‍👦 Assoc. Pais
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={authForm.tipoOrganizacao === 'clube' ? 'default' : 'outline'}
                            onClick={() => setAuthForm({ ...authForm, tipoOrganizacao: 'clube' })}
                            className="text-xs"
                          >
                            ⚽ Clube
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {authForm.tipoOrganizacao === 'aldeia' && 'Para aldeias e comunidades locais'}
                          {authForm.tipoOrganizacao === 'escola' && 'Para escolas e instituições de ensino'}
                          {authForm.tipoOrganizacao === 'associacao_pais' && 'Para associações de pais e encarregados'}
                          {authForm.tipoOrganizacao === 'clube' && 'Para clubes desportivos e recreativos'}
                        </p>
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={authLoading}>
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A processar...
                        </>
                      ) : (
                        authMode === 'login' ? 'Entrar' : 'Criar Conta'
                      )}
                    </Button>
                  </form>
                  <div className="mt-4 text-center text-sm">
                    <button
                      className="text-green-600 hover:underline"
                      onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    >
                      {authMode === 'login' 
                        ? 'Não tem conta? Registe-se'
                        : 'Já tem conta? Entre'}
                    </button>
                  </div>

                  {/* Quick Login Buttons (Test Mode) */}
                  {authMode === 'login' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        🔑 Login rápido para testes:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickLogin('super_admin')}
                          disabled={authLoading}
                          className="text-xs"
                        >
                          <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                          Super Admin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickLogin('aldeia_admin')}
                          disabled={authLoading}
                          className="text-xs"
                        >
                          <MapPin className="h-3 w-3 mr-1 text-green-500" />
                          Admin Aldeia
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickLogin('vendedor')}
                          disabled={authLoading}
                          className="text-xs"
                        >
                          <ShoppingBag className="h-3 w-3 mr-1 text-blue-500" />
                          Vendedor
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickLogin('user')}
                          disabled={authLoading}
                          className="text-xs"
                        >
                          <Users className="h-3 w-3 mr-1 text-gray-500" />
                          Jogador
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wizard de Configuração Inicial */}
      <AnimatePresence>
        {wizardModalOpen && wizardData.organizacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setWizardModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Configuração Inicial
                      </CardTitle>
                      <CardDescription>
                        Configure a sua organização em poucos passos
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveWizard(true)}
                      disabled={wizardLoading}
                      className="text-muted-foreground"
                    >
                      Saltar
                    </Button>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center gap-1 flex-1">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          wizardStep >= s 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        )}>
                          {wizardStep > s ? <Check className="h-4 w-4" /> : s}
                        </div>
                        {s < 3 && (
                          <div className={cn(
                            "flex-1 h-1 rounded",
                            wizardStep > s ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                          )} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex text-xs text-muted-foreground mt-1">
                    <span className="flex-1">Geral</span>
                    <span className="flex-1 text-center">Contacto</span>
                    <span className="flex-1 text-right">Legal</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Step 1: Informações Gerais */}
                  {wizardStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      {/* Tipo Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={cn(
                          wizardData.organizacao.tipoOrganizacao === 'aldeia' && "bg-green-500",
                          wizardData.organizacao.tipoOrganizacao === 'escola' && "bg-blue-500",
                          wizardData.organizacao.tipoOrganizacao === 'associacao_pais' && "bg-purple-500",
                          wizardData.organizacao.tipoOrganizacao === 'clube' && "bg-orange-500"
                        )}>
                          {wizardData.organizacao.tipoOrganizacao === 'aldeia' && '🏘️ Aldeia'}
                          {wizardData.organizacao.tipoOrganizacao === 'escola' && '🏫 Escola'}
                          {wizardData.organizacao.tipoOrganizacao === 'associacao_pais' && '👨‍👩‍👧‍👦 Assoc. Pais'}
                          {wizardData.organizacao.tipoOrganizacao === 'clube' && '⚽ Clube'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {wizardData.organizacao.nome}
                        </span>
                      </div>

                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label>Logo da Organização</Label>
                        <div className="flex items-center gap-4">
                          {wizardData.logoBase64 ? (
                            <div className="relative">
                              <img 
                                src={wizardData.logoBase64} 
                                alt="Logo" 
                                className="w-16 h-16 rounded-lg object-cover border"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-5 w-5"
                                onClick={() => setWizardData({ ...wizardData, logoBase64: '' })}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
                              onClick={() => wizardLogoRef.current?.click()}
                            >
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <input
                              ref={wizardLogoRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleWizardLogoUpload}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => wizardLogoRef.current?.click()}
                            >
                              Carregar Logo
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG até 5MB
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Descrição */}
                      <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input
                          id="descricao"
                          placeholder="Descreva brevemente a sua organização"
                          value={wizardData.descricao}
                          onChange={(e) => setWizardData({ ...wizardData, descricao: e.target.value })}
                        />
                      </div>

                      {/* Campos específicos para escolas */}
                      {wizardData.organizacao.tipoOrganizacao === 'escola' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="nomeEscola">Nome da Escola</Label>
                            <Input
                              id="nomeEscola"
                              placeholder="Nome oficial da escola"
                              value={wizardData.nomeEscola}
                              onChange={(e) => setWizardData({ ...wizardData, nomeEscola: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="codigoEscola">Código da Escola</Label>
                              <Input
                                id="codigoEscola"
                                placeholder="Ex: 123456"
                                value={wizardData.codigoEscola}
                                onChange={(e) => setWizardData({ ...wizardData, codigoEscola: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nivelEnsino">Nível de Ensino</Label>
                              <select
                                id="nivelEnsino"
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={wizardData.nivelEnsino}
                                onChange={(e) => setWizardData({ ...wizardData, nivelEnsino: e.target.value })}
                              >
                                <option value="">Selecionar...</option>
                                <option value="pre_escola">Pré-Escola</option>
                                <option value="1_ciclo">1º Ciclo</option>
                                <option value="2_ciclo">2º Ciclo</option>
                                <option value="3_ciclo">3º Ciclo</option>
                                <option value="secundario">Secundário</option>
                                <option value="profissional">Profissional</option>
                                <option value="superior">Superior</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Nível de ensino para associações de pais */}
                      {wizardData.organizacao.tipoOrganizacao === 'associacao_pais' && (
                        <div className="space-y-2">
                          <Label htmlFor="nivelEnsinoAp">Nível de Ensino Associado</Label>
                          <select
                            id="nivelEnsinoAp"
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={wizardData.nivelEnsino}
                            onChange={(e) => setWizardData({ ...wizardData, nivelEnsino: e.target.value })}
                          >
                            <option value="">Selecionar...</option>
                            <option value="pre_escola">Pré-Escola</option>
                            <option value="1_ciclo">1º Ciclo</option>
                            <option value="2_ciclo">2º Ciclo</option>
                            <option value="3_ciclo">3º Ciclo</option>
                            <option value="secundario">Secundário</option>
                          </select>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Contactos e Localização */}
                  {wizardStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="responsavel">Responsável</Label>
                          <Input
                            id="responsavel"
                            placeholder="Nome do responsável"
                            value={wizardData.responsavel}
                            onChange={(e) => setWizardData({ ...wizardData, responsavel: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactoResponsavel">Contacto</Label>
                          <Input
                            id="contactoResponsavel"
                            placeholder="Telefone ou email"
                            value={wizardData.contactoResponsavel}
                            onChange={(e) => setWizardData({ ...wizardData, contactoResponsavel: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="morada">Morada</Label>
                        <Input
                          id="morada"
                          placeholder="Rua, número, andar..."
                          value={wizardData.morada}
                          onChange={(e) => setWizardData({ ...wizardData, morada: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="codigoPostal">Código Postal</Label>
                          <Input
                            id="codigoPostal"
                            placeholder="0000-000"
                            value={wizardData.codigoPostal}
                            onChange={(e) => setWizardData({ ...wizardData, codigoPostal: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="localidade">Localidade</Label>
                          <Input
                            id="localidade"
                            placeholder="Cidade ou vila"
                            value={wizardData.localidade}
                            onChange={(e) => setWizardData({ ...wizardData, localidade: e.target.value })}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Conformidade Legal */}
                  {wizardStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-700 dark:text-blue-300">Conformidade Legal</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              Para jogos de sorteio com prémios, pode ser necessária autorização da Câmara Municipal.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="autorizacaoCM">Autorização da Câmara Municipal</Label>
                          <p className="text-xs text-muted-foreground">
                            Indique se possui autorização para realizar eventos de angariação
                          </p>
                        </div>
                        <Switch
                          id="autorizacaoCM"
                          checked={wizardData.autorizacaoCM}
                          onCheckedChange={(checked) => setWizardData({ ...wizardData, autorizacaoCM: checked })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numeroAlvara">Número de Alvará (opcional)</Label>
                        <Input
                          id="numeroAlvara"
                          placeholder="Número do alvará, se aplicável"
                          value={wizardData.numeroAlvara}
                          onChange={(e) => setWizardData({ ...wizardData, numeroAlvara: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Alvará de atividade ou licença específica para eventos
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setWizardModalOpen(false)}
                    disabled={wizardLoading}
                  >
                    {wizardStep > 1 ? 'Anterior' : 'Cancelar'}
                  </Button>
                  
                  {wizardStep < 3 ? (
                    <Button
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSaveWizard(false)}
                      disabled={wizardLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {wizardLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A guardar...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Concluir
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participar Modal */}
      <AnimatePresence>
        {participarModalOpen && jogoSelecionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setParticiparModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setParticiparModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">
                      {GAME_TYPES[jogoSelecionado.tipo as keyof typeof GAME_TYPES]?.emoji}
                    </span>
                    Participar em {jogoSelecionado.tipo.replace('_', ' ')}
                  </CardTitle>
                  <CardDescription>
                    {jogoSelecionado.evento?.aldeia?.nome} • {jogoSelecionado.evento?.nome}
                  </CardDescription>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                      step === 'select' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    )}>
                      <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-white text-xs font-bold">1</span>
                      Seleção
                    </div>
                    <div className="h-px flex-1 bg-gray-200" />
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                      step === 'payment' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    )}>
                      <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-white text-xs font-bold">2</span>
                      Pagamento
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Aviso Legal com Conformidade */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-semibold mb-1">Informação Legal</p>
                        {getComplianceText(jogoSelecionado.evento?.aldeia) || (
                          <p>Este jogo é organizado por {jogoSelecionado.evento?.aldeia?.nome || 'uma organização registada'} para angariação de fundos. O sorteio é realizado de forma transparente e verificável.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 1: Selection */}
                  {step === 'select' && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Preço por participação</p>
                          <p className="text-2xl font-bold text-green-600">{jogoSelecionado.precoParticipacao}€</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Participações</p>
                          <p className="text-2xl font-bold">{jogoSelecionado._count?.participacoes || 0}</p>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 max-h-[250px] overflow-auto">
                        {/* === RASPADINHA === */}
                        {jogoSelecionado.tipo === 'raspadinha' && (
                          <div className="space-y-4">
                            {/* Stock Info */}
                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="flex items-center gap-3">
                                <Sparkles className="h-6 w-6 text-amber-600" />
                                <div>
                                  <p className="text-sm text-amber-700 dark:text-amber-300">Cartões Disponíveis</p>
                                  <p className="text-xl font-bold text-amber-800 dark:text-amber-200">
                                    {jogoSelecionado.stockRestante || 0} / {jogoSelecionado.stockInicial || 0}
                                  </p>
                                </div>
                              </div>
                              <Badge className={(jogoSelecionado.stockRestante || 0) > 0 ? "bg-green-500" : "bg-red-500"}>
                                {(jogoSelecionado.stockRestante || 0) > 0 ? 'Disponível' : 'Esgotado'}
                              </Badge>
                            </div>

                            {/* Prémios */}
                            {jogoSelecionado.premiosRaspadinha && (
                              <div>
                                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Gift className="h-4 w-4" />
                                  Prémios Disponíveis
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {(typeof jogoSelecionado.premiosRaspadinha === 'string' 
                                    ? JSON.parse(jogoSelecionado.premiosRaspadinha) 
                                    : jogoSelecionado.premiosRaspadinha
                                  ).map((premio: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded text-sm">
                                      <div>
                                        <span className="font-medium">{premio.nome}</span>
                                        <span className="text-amber-600 dark:text-amber-400 ml-1">({premio.valor}€)</span>
                                      </div>
                                      <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900">
                                        {premio.quantidade}x
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quantidade */}
                            <div>
                              <Label className="font-semibold">Quantidade de cartões:</Label>
                              <div className="flex items-center gap-3 mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setQuantidadeRaspadinha(Math.max(1, quantidadeRaspadinha - 1))}
                                  disabled={quantidadeRaspadinha <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  max={Math.min(
                                    jogoSelecionado.stockRestante || 100,
                                    jogoSelecionado.limitePorUsuario || 100
                                  )}
                                  value={quantidadeRaspadinha}
                                  onChange={(e) => {
                                    const max = Math.min(
                                      jogoSelecionado.stockRestante || 100,
                                      jogoSelecionado.limitePorUsuario || 100
                                    );
                                    const val = parseInt(e.target.value) || 1;
                                    setQuantidadeRaspadinha(Math.min(max, Math.max(1, val)));
                                  }}
                                  className="w-20 text-center text-xl font-bold"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const max = Math.min(
                                      jogoSelecionado.stockRestante || 100,
                                      jogoSelecionado.limitePorUsuario || 100
                                    );
                                    setQuantidadeRaspadinha(Math.min(max, quantidadeRaspadinha + 1));
                                  }}
                                  disabled={quantidadeRaspadinha >= Math.min(
                                    jogoSelecionado.stockRestante || 100,
                                    jogoSelecionado.limitePorUsuario || 100
                                  )}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {jogoSelecionado.limitePorUsuario && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Limite: {jogoSelecionado.limitePorUsuario} cartões por pessoa
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* === OUTROS JOGOS === */}
                        {jogoSelecionado.tipo !== 'raspadinha' && (
                          <>
                            <p className="text-sm text-muted-foreground mb-4 text-center">
                              {jogoSelecionado.tipo === 'poio_vaca' 
                                ? 'Selecione uma coordenada no grid:' 
                                : 'Selecione um número:'}
                            </p>
                            
                            {jogoSelecionado.tipo === 'poio_vaca' && renderPoioVacaGrid(jogoSelecionado, true)}
                        {jogoSelecionado.tipo === 'rifa' && (
                          <RifaNumberSelector 
                            jogo={jogoSelecionado} 
                            selected={dadosParticipacao?.numero}
                            onSelect={(num) => setDadosParticipacao({ numero: num })}
                            ocupados={ocupados.map(o => o.numero)}
                            loading={loadingOcupados}
                            multiSelect={true}
                            selectedNumbers={numerosSelecionados}
                            onToggleNumber={(num) => {
                              if (numerosSelecionados.includes(num)) {
                                setNumerosSelecionados(prev => prev.filter(n => n !== num));
                              } else if (numerosSelecionados.length < 10) {
                                setNumerosSelecionados(prev => [...prev, num]);
                              }
                            }}
                            maxNumbers={10}
                            meusNumeros={participacoesJogo.filter(p => p.userId === user?.id).map(p => p.dadosParticipacao.numero)}
                            participacoesJogo={participacoesJogo}
                            onOccupiedClick={(num) => handlePosicaoClick({ numero: num }, ['super_admin', 'aldeia_admin', 'vendedor'].includes(user?.role || ''))}
                            isAdminOrVendedor={user ? ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) : false}
                          />
                        )}
                        {jogoSelecionado.tipo === 'tombola' && (
                          <RifaNumberSelector 
                            jogo={jogoSelecionado} 
                            selected={dadosParticipacao?.numero}
                            onSelect={(num) => setDadosParticipacao({ numero: num })}
                            ocupados={ocupados.map(o => o.numero)}
                            loading={loadingOcupados}
                            multiSelect={true}
                            selectedNumbers={numerosSelecionados}
                            onToggleNumber={(num) => {
                              if (numerosSelecionados.includes(num)) {
                                setNumerosSelecionados(prev => prev.filter(n => n !== num));
                              } else if (numerosSelecionados.length < 10) {
                                setNumerosSelecionados(prev => [...prev, num]);
                              }
                            }}
                            maxNumbers={10}
                            meusNumeros={participacoesJogo.filter(p => p.userId === user?.id).map(p => p.dadosParticipacao.numero)}
                            participacoesJogo={participacoesJogo}
                            onOccupiedClick={(num) => handlePosicaoClick({ numero: num }, ['super_admin', 'aldeia_admin', 'vendedor'].includes(user?.role || ''))}
                            isAdminOrVendedor={user ? ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) : false}
                          />
                        )}
                          </>
                        )}
                      </div>

                      {/* Seleção - Mostrar resumo */}
                      {jogoSelecionado.tipo === 'raspadinha' && quantidadeRaspadinha > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-amber-700 font-medium">
                              {quantidadeRaspadinha} cartão{quantidadeRaspadinha > 1 ? 's' : ''} selecionado{quantidadeRaspadinha > 1 ? 's' : ''}:
                            </p>
                            <p className="text-sm font-bold text-amber-700">
                              Total: {(quantidadeRaspadinha * jogoSelecionado.precoParticipacao).toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      )}
                      {jogoSelecionado.tipo === 'poio_vaca' && coordenadasSelecionadas.length > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-green-700 font-medium">
                              {coordenadasSelecionadas.length} coordenada{coordenadasSelecionadas.length > 1 ? 's' : ''} selecionada{coordenadasSelecionadas.length > 1 ? 's' : ''}:
                            </p>
                            <p className="text-sm font-bold text-green-700">
                              Total: {(coordenadasSelecionadas.length * jogoSelecionado.precoParticipacao).toFixed(2)}€
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {coordenadasSelecionadas.map((c, i) => (
                              <span key={i} className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-medium">
                                {c.letra}{c.numero}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {['rifa', 'tombola'].includes(jogoSelecionado.tipo) && numerosSelecionados.length > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-green-700 font-medium">
                              {numerosSelecionados.length} número{numerosSelecionados.length > 1 ? 's' : ''} selecionado{numerosSelecionados.length > 1 ? 's' : ''}:
                            </p>
                            <p className="text-sm font-bold text-green-700">
                              Total: {(numerosSelecionados.length * jogoSelecionado.precoParticipacao).toFixed(2)}€
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {numerosSelecionados.sort((a, b) => a - b).map(n => (
                              <span key={n} className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-medium">
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 2: Payment */}
                  {step === 'payment' && (
                    <>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">Participação selecionada:</p>
                        {jogoSelecionado.tipo === 'raspadinha' ? (
                          <div>
                            <p className="text-xl font-bold text-green-700">
                              {quantidadeRaspadinha} cartão{quantidadeRaspadinha > 1 ? 's' : ''} de raspadinha
                            </p>
                          </div>
                        ) : jogoSelecionado.tipo === 'poio_vaca' ? (
                          <div>
                            <p className="text-xl font-bold text-green-700">
                              {coordenadasSelecionadas.length} coordenada{coordenadasSelecionadas.length > 1 ? 's' : ''}: {coordenadasSelecionadas.map(c => `${c.letra}${c.numero}`).join(', ')}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xl font-bold text-green-700">
                              {numerosSelecionados.length} número{numerosSelecionados.length > 1 ? 's' : ''}: {numerosSelecionados.sort((a, b) => a - b).join(', ')}
                            </p>
                          </div>
                        )}
                        <p className="text-lg font-bold text-green-600 mt-2">
                          Total: {((jogoSelecionado.tipo === 'raspadinha' 
                            ? quantidadeRaspadinha 
                            : jogoSelecionado.tipo === 'poio_vaca' 
                              ? coordenadasSelecionadas.length 
                              : numerosSelecionados.length) * jogoSelecionado.precoParticipacao).toFixed(2)}€
                        </p>
                      </div>

                      {/* Admin: opção de registar para cliente */}
                      {user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">Registar para cliente</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={adminParaCliente} 
                                onChange={(e) => setAdminParaCliente(e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                          </div>
                          {adminParaCliente && (
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs text-blue-600 mb-1 block">Nome do cliente *</Label>
                                <Input
                                  placeholder="Nome completo"
                                  value={nomeCliente}
                                  onChange={(e) => setNomeCliente(e.target.value)}
                                  className="bg-white"
                                />
                              </div>
                              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                                ⚠️ É obrigatório indicar telemóvel <strong>OU</strong> email para identificar o cliente
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs text-blue-600 mb-1 block">Telemóvel</Label>
                                  <Input
                                    type="tel"
                                    placeholder="912345678"
                                    value={telefoneCliente}
                                    onChange={(e) => setTelefoneCliente(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                    className="bg-white"
                                    maxLength={9}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-blue-600 mb-1 block">Email</Label>
                                  <Input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    value={emailCliente}
                                    onChange={(e) => setEmailCliente(e.target.value)}
                                    className="bg-white"
                                  />
                                </div>
                              </div>
                              {nomeCliente.trim() && (telefoneCliente.trim().length >= 9 || emailCliente.trim()) && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Identificação válida: {nomeCliente}
                                  {telefoneCliente && ` • ${telefoneCliente}`}
                                  {emailCliente && ` • ${emailCliente}`}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Método de Pagamento</Label>
                        
                        {/* Dinheiro para Admin e Vendedor */}
                        {user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) && (
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setMetodoPagamento('dinheiro')}
                              className={cn(
                                "p-4 border-2 rounded-xl text-left transition-all",
                                metodoPagamento === 'dinheiro' 
                                  ? "border-green-500 bg-green-50" 
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                  metodoPagamento === 'dinheiro' ? "bg-green-500 text-white" : "bg-gray-100"
                                )}>
                                  <span className="text-xl">💵</span>
                                </div>
                                <div>
                                  <p className="font-semibold">Dinheiro</p>
                                  <p className="text-xs text-muted-foreground">No tablet</p>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setMetodoPagamento('mbway')}
                              className={cn(
                                "p-4 border-2 rounded-xl text-left transition-all",
                                metodoPagamento === 'mbway' 
                                  ? "border-green-500 bg-green-50" 
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                  metodoPagamento === 'mbway' ? "bg-green-500 text-white" : "bg-gray-100"
                                )}>
                                  <span className="text-xl">📱</span>
                                </div>
                                <div>
                                  <p className="font-semibold">MBWay</p>
                                  <p className="text-xs text-muted-foreground">Pagamento móvel</p>
                                </div>
                              </div>
                            </button>
                          </div>
                        )}
                        
                        {/* Utilizador normal: apenas MBWay */}
                        {user && !['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center">
                                <span className="text-2xl">📱</span>
                              </div>
                              <div>
                                <p className="font-semibold text-purple-700">Pagamento por MBWay</p>
                                <p className="text-sm text-purple-600">Introduza o seu número de telemóvel</p>
                              </div>
                            </div>
                            <Input
                              type="tel"
                              placeholder="912345678"
                              value={telefoneMbway}
                              onChange={(e) => setTelefoneMbway(e.target.value.replace(/\D/g, '').slice(0, 9))}
                              className="mt-3 bg-white"
                              maxLength={9}
                            />
                          </div>
                        )}

                        {/* MBWay phone input para admins/vendedores que escolhem MBWay */}
                        {metodoPagamento === 'mbway' && user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <Label htmlFor="telefone">Número de Telemóvel do Cliente *</Label>
                            <Input
                              id="telefone"
                              type="tel"
                              placeholder="912345678"
                              value={telefoneMbway}
                              onChange={(e) => setTelefoneMbway(e.target.value.replace(/\D/g, '').slice(0, 9))}
                              className="text-lg"
                            />
                            <p className="text-xs text-muted-foreground">
                              Número do cliente para pagamento MBWay
                            </p>
                          </motion.div>
                        )}

                        {metodoPagamento === 'dinheiro' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                          >
                            <p className="text-sm text-yellow-800">
                              <strong>💵 Pagamento no Tablet</strong><br />
                              O cliente paga em dinheiro ao administrador. O pagamento é registado automaticamente.
                            </p>
                          </motion.div>
                        )}

                        {metodoPagamento === 'mbway' && telefoneMbway.length === 9 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <p className="text-sm text-blue-800">
                              <strong>📱 Pagamento MBWay</strong><br />
                              Após confirmar, será enviada uma notificação MBWay para autorizar o pagamento.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
                
                <CardFooter className="gap-2">
                  {step === 'select' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setParticiparModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="flex-1 gap-2"
                        disabled={
                          jogoSelecionado.tipo === 'raspadinha'
                            ? quantidadeRaspadinha < 1 || (jogoSelecionado.stockRestante || 0) < 1
                            : jogoSelecionado.tipo === 'poio_vaca' 
                              ? coordenadasSelecionadas.length === 0
                              : numerosSelecionados.length === 0
                        }
                        onClick={() => setStep('payment')}
                      >
                        Continuar {jogoSelecionado.tipo === 'raspadinha'
                          ? quantidadeRaspadinha > 0 && `(${quantidadeRaspadinha})`
                          : jogoSelecionado.tipo === 'poio_vaca' 
                            ? coordenadasSelecionadas.length > 0 && `(${coordenadasSelecionadas.length})`
                            : numerosSelecionados.length > 0 && `(${numerosSelecionados.length})`
                        }
                      </Button>
                    </>
                  )}
                  
                  {step === 'payment' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setStep('select')}
                      >
                        Voltar
                      </Button>
                      <Button 
                        className="flex-1 gap-2"
                        disabled={
                          participacaoLoading || 
                          (metodoPagamento === 'mbway' && telefoneMbway.length !== 9) ||
                          (adminParaCliente && (!nomeCliente.trim() || (!telefoneCliente.trim() && !emailCliente.trim())))
                        }
                        onClick={handleParticipar}
                      >
                        {participacaoLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            A processar...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Confirmar ({((jogoSelecionado.tipo === 'raspadinha' 
                              ? quantidadeRaspadinha 
                              : jogoSelecionado.tipo === 'poio_vaca' 
                                ? coordenadasSelecionadas.length 
                                : numerosSelecionados.length) * jogoSelecionado.precoParticipacao).toFixed(2)}€)
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Raspadinha Modal - Revelar Cartões */}
      <AnimatePresence>
        {raspadinhaModalOpen && participacoesRaspadinha.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRaspadinhaModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setRaspadinhaModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Os Seus Cartões Raspadinha
                  </CardTitle>
                  <CardDescription>
                    {jogoRaspadinha?.evento?.aldeia?.nome} • {jogoRaspadinha?.evento?.nome}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {participacoesRaspadinha.map((participacao) => {
                      const isRevelada = raspadinhasReveladas.has(participacao.id);
                      const resultado = raspadinhasReveladas.get(participacao.id);
                      const isRevelando = revelandoRaspadinha === participacao.id;
                      const isWinner = resultado?.isWinner;
                      
                      return (
                        <ScratchCard
                          key={participacao.id}
                          participacaoId={participacao.id}
                          numeroCartao={participacao.numeroCartao}
                          isRevelada={isRevelada}
                          isRevelando={isRevelando}
                          resultado={resultado}
                          onReveal={handleRevelarRaspadinha}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Summary */}
                  {raspadinhasReveladas.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Cartões revelados</p>
                          <p className="font-bold">{raspadinhasReveladas.size} / {participacoesRaspadinha.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Prémios ganhos</p>
                          <p className="font-bold text-yellow-600">
                            {Array.from(raspadinhasReveladas.values()).filter((r: any) => r?.isWinner).length} prémio(s)
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
                
                <CardFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setRaspadinhaModalOpen(false)}
                  >
                    Fechar
                  </Button>
                  {raspadinhasReveladas.size === participacoesRaspadinha.length && (
                    <Button 
                      className="flex-1 gap-2"
                      onClick={() => {
                        setRaspadinhaModalOpen(false);
                        setActiveView('my-games');
                      }}
                    >
                      Ver Minhas Participações
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alterar Participação Modal */}
      <AnimatePresence>
        {alterarModalOpen && participacaoParaAlterar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAlterarModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setAlterarModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Gerir Participação
                  </CardTitle>
                  <CardDescription>
                    {participacaoParaAlterar.jogo?.tipo === 'poio_vaca' 
                      ? `Coordenada: ${participacaoParaAlterar.dadosParticipacao?.letra}${participacaoParaAlterar.dadosParticipacao?.numero}`
                      : `Número: ${participacaoParaAlterar.dadosParticipacao?.numero}`
                    } • {participacaoParaAlterar.nomeCliente || participacaoParaAlterar.user?.nome || 'Cliente'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tipo de Ação */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Escolha a ação:</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAlterarForm({ ...alterarForm, tipoAlteracao: 'trocar' })}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-left",
                          alterarForm.tipoAlteracao === 'trocar'
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <RotateCcw className={cn(
                          "h-6 w-6 mb-2",
                          alterarForm.tipoAlteracao === 'trocar' ? "text-blue-600" : "text-gray-400"
                        )} />
                        <p className="font-semibold text-sm">🔄 Trocar</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mudar para outro número/coordenada
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlterarForm({ ...alterarForm, tipoAlteracao: 'anular' })}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-left",
                          alterarForm.tipoAlteracao === 'anular'
                            ? "border-red-500 bg-red-50 dark:bg-red-950"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Trash2 className={cn(
                          "h-6 w-6 mb-2",
                          alterarForm.tipoAlteracao === 'anular' ? "text-red-600" : "text-gray-400"
                        )} />
                        <p className="font-semibold text-sm">🗑️ Anular</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Cancelar e libertar o número
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Campos de Troca */}
                  {alterarForm.tipoAlteracao === 'trocar' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {alterarForm.campo === 'numero' && (
                        <div className="space-y-2">
                          <Label>Novo número</Label>
                          <Input
                            type="number"
                            placeholder="Ex: 42"
                            value={alterarForm.novoNumero}
                            onChange={(e) => setAlterarForm({ ...alterarForm, novoNumero: e.target.value })}
                          />
                        </div>
                      )}

                      {alterarForm.campo === 'coordenada' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Letra</Label>
                            <Input
                              type="text"
                              maxLength={1}
                              placeholder="Ex: A"
                              value={alterarForm.novaLetra}
                              onChange={(e) => setAlterarForm({ ...alterarForm, novaLetra: e.target.value.toUpperCase() })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Número</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 5"
                              value={alterarForm.novoNumero}
                              onChange={(e) => setAlterarForm({ ...alterarForm, novoNumero: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Aviso de Anulação */}
                  {alterarForm.tipoAlteracao === 'anular' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>🔴 Anular participação:</strong> A participação será cancelada e o número/coordenada ficará disponível para outros jogadores. O cliente será notificado.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Motivo */}
                  <div className="space-y-2">
                    <Label>Motivo da alteração *</Label>
                    <Input
                      placeholder="Ex: Erro de registo, troca a pedido do cliente..."
                      value={alterarForm.motivo}
                      onChange={(e) => setAlterarForm({ ...alterarForm, motivo: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      O motivo é obrigatório e ficará visível no histórico
                    </p>
                  </div>

                  <div className="p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>⚠️ Nota:</strong> Todas as alterações ficam registadas para auditoria.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAlterarModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className={cn(
                      "flex-1",
                      alterarForm.tipoAlteracao === 'anular' && "bg-red-600 hover:bg-red-700"
                    )}
                    disabled={alterarLoading || !alterarForm.motivo.trim() || (alterarForm.tipoAlteracao === 'trocar' && !alterarForm.novoNumero)}
                    onClick={handleAlterarParticipacao}
                  >
                    {alterarLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {alterarForm.tipoAlteracao === 'anular' ? 'A anular...' : 'A alterar...'}
                      </>
                    ) : (
                      <>
                        {alterarForm.tipoAlteracao === 'anular' ? (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Anular Participação
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirmar Troca
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico de Alterações Modal */}
      <AnimatePresence>
        {historicoModalOpen && historicoParticipacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setHistoricoModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setHistoricoModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Histórico de Alterações
                  </CardTitle>
                  <CardDescription>
                    Participação em {historicoParticipacao.participacao?.jogo?.tipo?.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[50vh] overflow-y-auto">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <strong>Jogo:</strong> {historicoParticipacao.participacao?.jogo?.evento?.nome}
                    </p>
                    <p className="text-sm">
                      <strong>Posição:</strong> {historicoParticipacao.participacao?.jogo?.tipo === 'poio_vaca'
                        ? `${historicoParticipacao.participacao?.dadosParticipacao?.letra}${historicoParticipacao.participacao?.dadosParticipacao?.numero}`
                        : `Nº ${historicoParticipacao.participacao?.dadosParticipacao?.numero}`}
                    </p>
                  </div>

                  {historicoParticipacao.historico?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Sem alterações registadas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historicoParticipacao.historico?.map((alt: any, index: number) => (
                        <motion.div
                          key={alt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{alt.campo}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alt.createdAt).toLocaleString('pt-PT')}
                              </span>
                            </div>
                            {alt.notificadoJogador && (
                              <Badge variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" /> Notificado
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div>
                              <p className="text-muted-foreground">Anterior:</p>
                              <p className="font-medium">
                                {typeof alt.valorAnterior === 'object' 
                                  ? JSON.stringify(alt.valorAnterior) 
                                  : alt.valorAnterior}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Novo:</p>
                              <p className="font-medium text-green-600">
                                {typeof alt.valorNovo === 'object' 
                                  ? JSON.stringify(alt.valorNovo) 
                                  : alt.valorNovo}
                              </p>
                            </div>
                          </div>
                          <div className="p-2 bg-muted/50 rounded text-sm">
                            <p className="text-muted-foreground">Motivo: {alt.motivo}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Alterado por: {alt.admin?.nome} ({alt.admin?.email})
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setHistoricoModalOpen(false)}>
                    Fechar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCreateModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setCreateModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Nova {createType === 'aldeia' ? 'Organização' : createType === 'evento' ? 'Campanha' : 'Jogo'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="space-y-4">
                    {/* Common fields */}
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input
                        placeholder={`Nome da${createType === 'aldeia' ? ' organização' : createType === 'evento' ? ' campanha' : 'o jogo'}`}
                        value={createForm.nome}
                        onChange={(e) => setCreateForm({ ...createForm, nome: e.target.value })}
                        required
                      />
                    </div>

                    {createType !== 'jogo' && (
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                          placeholder="Descrição opcional"
                          value={createForm.descricao}
                          onChange={(e) => setCreateForm({ ...createForm, descricao: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Aldeia / Organização specific */}
                    {createType === 'aldeia' && (
                      <>
                        {/* Tipo de Organização */}
                        <div className="space-y-2">
                          <Label>Tipo de Organização *</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { value: 'aldeia', label: '🏘️ Aldeia', desc: 'Comunidade tradicional' },
                              { value: 'escola', label: '🏫 Escola', desc: 'Estabelecimento ensino' },
                              { value: 'associacao_pais', label: '👨‍👩‍👧‍👦 Assoc. Pais', desc: 'Associação de pais' },
                              { value: 'clube', label: '⚽ Clube', desc: 'Clube desportivo' },
                            ].map((tipo) => (
                              <button
                                key={tipo.value}
                                type="button"
                                onClick={() => setCreateForm({ ...createForm, tipoOrganizacao: tipo.value })}
                                className={cn(
                                  "p-3 border-2 rounded-xl text-center transition-all",
                                  createForm.tipoOrganizacao === tipo.value
                                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                              >
                                <span className="text-lg">{tipo.label.split(' ')[0]}</span>
                                <p className="text-xs mt-1">{tipo.label.split(' ').slice(1).join(' ')}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Nome/Descrição/Localização */}
                        <div className="space-y-2">
                          <Label>Localização</Label>
                          <Input
                            placeholder="Ex: Vila Verde, Braga"
                            value={createForm.localizacao}
                            onChange={(e) => setCreateForm({ ...createForm, localizacao: e.target.value })}
                          />
                        </div>

                        {/* Campos específicos para Escola */}
                        {createForm.tipoOrganizacao === 'escola' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
                          >
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Informações da Escola</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nome da Escola *</Label>
                                <Input
                                  placeholder="Ex: Escola Básica de Vila Verde"
                                  value={createForm.nomeEscola}
                                  onChange={(e) => setCreateForm({ ...createForm, nomeEscola: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Código da Escola</Label>
                                <Input
                                  placeholder="Código do Ministério"
                                  value={createForm.codigoEscola}
                                  onChange={(e) => setCreateForm({ ...createForm, codigoEscola: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Nível de Ensino</Label>
                              <select
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                                value={createForm.nivelEnsino}
                                onChange={(e) => setCreateForm({ ...createForm, nivelEnsino: e.target.value })}
                              >
                                <option value="">Selecione...</option>
                                <option value="pre-escolar">Pré-Escolar</option>
                                <option value="1ciclo">1º Ciclo</option>
                                <option value="2ciclo">2º Ciclo</option>
                                <option value="3ciclo">3º Ciclo</option>
                                <option value="secundario">Secundário</option>
                                <option value="profissional">Profissional</option>
                              </select>
                            </div>
                          </motion.div>
                        )}

                        {/* Campos para Associação de Pais */}
                        {createForm.tipoOrganizacao === 'associacao_pais' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Informações da Associação</p>
                            <div className="space-y-2">
                              <Label>Nível de Ensino Associado</Label>
                              <select
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                                value={createForm.nivelEnsino}
                                onChange={(e) => setCreateForm({ ...createForm, nivelEnsino: e.target.value })}
                              >
                                <option value="">Selecione...</option>
                                <option value="pre-escolar">Pré-Escolar</option>
                                <option value="1ciclo">1º Ciclo</option>
                                <option value="2ciclo">2º Ciclo</option>
                                <option value="3ciclo">3º Ciclo</option>
                                <option value="secundario">Secundário</option>
                              </select>
                            </div>
                          </motion.div>
                        )}

                        {/* Responsável */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Responsável</Label>
                            <Input
                              placeholder="Nome do responsável"
                              value={createForm.responsavel}
                              onChange={(e) => setCreateForm({ ...createForm, responsavel: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contacto Responsável</Label>
                            <Input
                              type="tel"
                              placeholder="Telemóvel ou email"
                              value={createForm.contactoResponsavel}
                              onChange={(e) => setCreateForm({ ...createForm, contactoResponsavel: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Endereço */}
                        <div className="space-y-2">
                          <Label>Morada</Label>
                          <Input
                            placeholder="Rua, número, andar..."
                            value={createForm.morada}
                            onChange={(e) => setCreateForm({ ...createForm, morada: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Código Postal</Label>
                            <Input
                              placeholder="0000-000"
                              value={createForm.codigoPostal}
                              onChange={(e) => setCreateForm({ ...createForm, codigoPostal: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Localidade</Label>
                            <Input
                              placeholder="Cidade/Vila"
                              value={createForm.localidade}
                              onChange={(e) => setCreateForm({ ...createForm, localidade: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Conformidade Legal */}
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 space-y-4">
                          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Conformidade Legal
                          </p>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="autorizacaoCM"
                              checked={createForm.autorizacaoCM}
                              onChange={(e) => setCreateForm({ ...createForm, autorizacaoCM: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <Label htmlFor="autorizacaoCM" className="text-sm">
                              Autorização da Câmara Municipal
                            </Label>
                          </div>
                          <div className="space-y-2">
                            <Label>Número de Alvará</Label>
                            <Input
                              placeholder="Número do alvará (se aplicável)"
                              value={createForm.numeroAlvara}
                              onChange={(e) => setCreateForm({ ...createForm, numeroAlvara: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Logo */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Logo / Imagem
                          </Label>
                          <input
                            ref={aldeiaImageRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'aldeia')}
                          />
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => aldeiaImageRef.current?.click()}
                              className="gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Carregar Imagem
                            </Button>
                            {createForm.imagemUrl && (
                              <div className="flex items-center gap-2">
                                <img 
                                  src={createForm.imagemUrl} 
                                  alt="Preview" 
                                  className="w-12 h-12 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCreateForm({ ...createForm, imagemUrl: '' })}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">Formatos: JPG, PNG, GIF. Máx: 5MB</p>
                        </div>
                      </>
                    )}

                    {/* Evento specific */}
                    {createType === 'evento' && (
                      <>
                        <div className="space-y-2">
                          <Label>Aldeia *</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg bg-background"
                            value={createForm.aldeiaId}
                            onChange={(e) => setCreateForm({ ...createForm, aldeiaId: e.target.value })}
                            required
                          >
                            <option value="">Selecione uma aldeia</option>
                            {aldeias.map(a => (
                              <option key={a.id} value={a.id}>{a.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data Início *</Label>
                            <Input
                              type="date"
                              value={createForm.dataInicio}
                              onChange={(e) => setCreateForm({ ...createForm, dataInicio: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data Fim</Label>
                            <Input
                              type="date"
                              value={createForm.dataFim}
                              onChange={(e) => setCreateForm({ ...createForm, dataFim: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Imagem do Evento
                          </Label>
                          <input
                            ref={eventoImageRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'evento')}
                          />
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => eventoImageRef.current?.click()}
                              className="gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Carregar Imagem
                            </Button>
                            {createForm.imagemUrl && (
                              <div className="flex items-center gap-2">
                                <img 
                                  src={createForm.imagemUrl} 
                                  alt="Preview" 
                                  className="w-12 h-12 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCreateForm({ ...createForm, imagemUrl: '' })}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">Formatos: JPG, PNG, GIF. Máx: 5MB</p>
                        </div>
                      </>
                    )}

                    {/* Jogo specific */}
                    {createType === 'jogo' && (
                      <>
                        <div className="space-y-2">
                          <Label>Evento *</Label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg bg-background"
                            value={createForm.eventoId}
                            onChange={(e) => setCreateForm({ ...createForm, eventoId: e.target.value })}
                            required
                          >
                            <option value="">Selecione um evento</option>
                            {eventos.map(e => (
                              <option key={e.id} value={e.id}>{e.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Jogo *</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(GAME_TYPES).map(([key, value]) => (
                              <Button
                                key={key}
                                type="button"
                                variant={createForm.tipo === key ? 'default' : 'outline'}
                                onClick={() => setCreateForm({ 
                                  ...createForm, 
                                  tipo: key,
                                  config: key === 'poio_vaca' 
                                    ? { linhas: 10, colunas: 10 }
                                    : { totalBilhetes: 100 }
                                })}
                                className="flex-col h-auto py-2"
                              >
                                <span className="text-xl">{value.emoji}</span>
                                <span className="text-xs">{value.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Preço por Participação (€) *</Label>
                          <Input
                            type="number"
                            step="0.50"
                            min="0.50"
                            placeholder="1.00"
                            value={createForm.precoParticipacao}
                            onChange={(e) => setCreateForm({ ...createForm, precoParticipacao: parseFloat(e.target.value) })}
                            required
                          />
                        </div>
                        {createForm.tipo === 'poio_vaca' && (
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                              <Grid3X3 className="h-4 w-4" />
                              Configuração do Grid
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Linhas (A-Z)</Label>
                                <Input
                                  type="number"
                                  min="2"
                                  max="26"
                                  value={createForm.config.linhas || 10}
                                  onChange={(e) => setCreateForm({ 
                                    ...createForm, 
                                    config: { 
                                      ...createForm.config,
                                      linhas: parseInt(e.target.value) || 10 
                                    } 
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Colunas (1-99)</Label>
                                <Input
                                  type="number"
                                  min="2"
                                  max="99"
                                  value={createForm.config.colunas || 10}
                                  onChange={(e) => setCreateForm({ 
                                    ...createForm, 
                                    config: { 
                                      ...createForm.config,
                                      colunas: parseInt(e.target.value) || 10 
                                    } 
                                  })}
                                />
                              </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">Total de coordenadas:</p>
                              <p className="text-2xl font-bold text-green-600">
                                {(createForm.config.linhas || 10) * (createForm.config.colunas || 10)}
                              </p>
                            </div>
                          </div>
                        )}
                        {createForm.tipo === 'rifa' && (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Total de Bilhetes
                            </Label>
                            <Input
                              type="number"
                              min="10"
                              value={createForm.config.totalBilhetes}
                              onChange={(e) => setCreateForm({ 
                                ...createForm, 
                                config: { totalBilhetes: parseInt(e.target.value) } 
                              })}
                            />
                          </div>
                        )}
                        {createForm.tipo === 'tombola' && (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Ticket className="h-4 w-4" />
                              Total de Bilhetes
                            </Label>
                            <Input
                              type="number"
                              min="10"
                              value={createForm.config.totalBilhetes || 50}
                              onChange={(e) => setCreateForm({ 
                                ...createForm, 
                                config: { totalBilhetes: parseInt(e.target.value) } 
                              })}
                            />
                          </div>
                        )}
                        
                        {/* Raspadinha Configuration */}
                        {createForm.tipo === 'raspadinha' && (
                          <div className="space-y-4">
                            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-5 w-5 text-amber-600" />
                                <span className="font-semibold text-amber-700 dark:text-amber-300">Configuração da Raspadinha</span>
                              </div>
                              
                              {/* Stock e Preço */}
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <Label className="text-xs">Nº Total de Cartões</Label>
                                  <Input
                                    type="number"
                                    min="10"
                                    value={stockInicial}
                                    onChange={(e) => setStockInicial(parseInt(e.target.value) || 100)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Limite por Pessoa</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={limitePorUsuario}
                                    onChange={(e) => setLimitePorUsuario(parseInt(e.target.value) || 10)}
                                  />
                                </div>
                              </div>
                              
                              {/* Lista de Prémios */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-semibold">Configuração de Prémios</Label>
                                  <span className={cn(
                                    "text-xs font-bold",
                                    premiosRaspadinha.reduce((sum, p) => sum + p.percentagem, 0) === 1 
                                      ? "text-green-600" 
                                      : "text-red-600"
                                  )}>
                                    Total: {(premiosRaspadinha.reduce((sum, p) => sum + p.percentagem, 0) * 100).toFixed(0)}%
                                    {premiosRaspadinha.reduce((sum, p) => sum + p.percentagem, 0) !== 1 && " (deve ser 100%)"}
                                  </span>
                                </div>
                                
                                {/* Prémios List */}
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                  {premiosRaspadinha.map((premio, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                                      <Input
                                        placeholder="Nome"
                                        value={premio.nome}
                                        onChange={(e) => {
                                          const newPremios = [...premiosRaspadinha];
                                          newPremios[idx].nome = e.target.value;
                                          setPremiosRaspadinha(newPremios);
                                        }}
                                        className="flex-1 h-8 text-xs"
                                      />
                                      <select
                                        value={premio.tipo}
                                        onChange={(e) => {
                                          const newPremios = [...premiosRaspadinha];
                                          newPremios[idx].tipo = e.target.value as 'dinheiro' | 'fisico';
                                          setPremiosRaspadinha(newPremios);
                                        }}
                                        className="h-8 text-xs border rounded px-1"
                                      >
                                        <option value="dinheiro">Dinheiro</option>
                                        <option value="fisico">Físico</option>
                                      </select>
                                      <Input
                                        type="number"
                                        placeholder="%"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={premio.percentagem || ''}
                                        onChange={(e) => {
                                          const newPremios = [...premiosRaspadinha];
                                          newPremios[idx].percentagem = parseFloat(e.target.value) || 0;
                                          setPremiosRaspadinha(newPremios);
                                        }}
                                        className="w-16 h-8 text-xs"
                                      />
                                      <span className="text-xs text-muted-foreground">%</span>
                                      <Input
                                        type="number"
                                        placeholder="Valor €"
                                        step="0.50"
                                        min="0"
                                        value={premio.valor || ''}
                                        onChange={(e) => {
                                          const newPremios = [...premiosRaspadinha];
                                          newPremios[idx].valor = parseFloat(e.target.value) || 0;
                                          setPremiosRaspadinha(newPremios);
                                        }}
                                        className="w-20 h-8 text-xs"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => {
                                          setPremiosRaspadinha(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Add Prémio Button */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setPremiosRaspadinha(prev => [...prev, {
                                      nome: '',
                                      tipo: 'dinheiro' as const,
                                      percentagem: 0,
                                      valor: 0
                                    }]);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Adicionar Prémio
                                </Button>
                              </div>
                            </div>
                            
                            {/* Cálculos Automáticos */}
                            {stockInicial > 0 && premiosRaspadinha.length > 0 && (
                              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 mb-3">
                                  <BarChart3 className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-green-700 dark:text-green-300">Análise Financeira</span>
                                </div>
                                
                                {/* Table of prizes */}
                                <div className="mb-4 overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-1">Prémio</th>
                                        <th className="text-center py-1">%</th>
                                        <th className="text-center py-1">Qtd</th>
                                        <th className="text-right py-1">Valor Un.</th>
                                        <th className="text-right py-1">Custo Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {premiosRaspadinha.map((premio, idx) => {
                                        const quantidade = Math.round(premio.percentagem * stockInicial);
                                        const custo = quantidade * premio.valor;
                                        return (
                                          <tr key={idx} className="border-b">
                                            <td className="py-1">{premio.nome || '-'}</td>
                                            <td className="text-center py-1">{(premio.percentagem * 100).toFixed(1)}%</td>
                                            <td className="text-center py-1">{quantidade}</td>
                                            <td className="text-right py-1">{premio.valor.toFixed(2)}€</td>
                                            <td className="text-right py-1 font-medium">{custo.toFixed(2)}€</td>
                                          </tr>
                                        );
                                      })}
                                      <tr className="border-t-2 border-green-300">
                                        <td colSpan={4} className="py-2 font-semibold">Total Prémios</td>
                                        <td className="text-right py-2 font-bold">
                                          {premiosRaspadinha.reduce((sum, p) => sum + Math.round(p.percentagem * stockInicial) * p.valor, 0).toFixed(2)}€
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Receita Total</p>
                                    <p className="text-xl font-bold text-green-600">
                                      {(stockInicial * createForm.precoParticipacao).toFixed(2)}€
                                    </p>
                                    <p className="text-xs text-muted-foreground">{stockInicial} cartões × {createForm.precoParticipacao}€</p>
                                  </div>
                                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Total Prémios</p>
                                    <p className="text-xl font-bold text-amber-600">
                                      {premiosRaspadinha.reduce((sum, p) => sum + Math.round(p.percentagem * stockInicial) * p.valor, 0).toFixed(2)}€
                                    </p>
                                  </div>
                                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Lucro Estimado</p>
                                    <p className={cn(
                                      "text-xl font-bold",
                                      (stockInicial * createForm.precoParticipacao) - premiosRaspadinha.reduce((sum, p) => sum + Math.round(p.percentagem * stockInicial) * p.valor, 0) >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    )}>
                                      {((stockInicial * createForm.precoParticipacao) - premiosRaspadinha.reduce((sum, p) => sum + Math.round(p.percentagem * stockInicial) * p.valor, 0)).toFixed(2)}€
                                    </p>
                                  </div>
                                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Margem</p>
                                    <p className={cn(
                                      "text-xl font-bold",
                                      ((stockInicial * createForm.precoParticipacao) - premiosRaspadinha.reduce((sum, p) => sum + Math.round(p.percentagem * stockInicial) * p.valor, 0)) / (stockInicial * createForm.precoParticipacao) >= 0.2
                                        ? "text-green-600"
                                        : ((stockInicial * createForm.precoParticipacao) - premiosRaspadinha.reduce((sum, p) => sum + Math.round(p.percentagem * stockInicial) * p.valor, 0)) / (stockInicial * createForm.precoParticipacao) >= 0
                                          ? "text-amber-600"
                                          : "text-red-600"
                                    )}>
                                      {stockInicial * createForm.precoParticipacao > 0 
                                        ? (((stockInicial * createForm.precoParticipacao) - premiosRaspadinha.reduce((sum, p) => sum + Math.round(p.percentagem * stockInicial) * p.valor, 0)) / (stockInicial * createForm.precoParticipacao) * 100).toFixed(1)
                                        : 0}%
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Warning or Success */}
                                {(() => {
                                  const totalPercent = premiosRaspadinha.reduce((sum, p) => sum + p.percentagem, 0);
                                  const lucro = (stockInicial * createForm.precoParticipacao) - premiosRaspadinha.reduce((sum, p) => sum + Math.round(p.percentagem * stockInicial) * p.valor, 0);
                                  
                                  if (totalPercent !== 1) {
                                    return (
                                      <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        As percentagens devem somar 100%
                                      </div>
                                    );
                                  }
                                  if (lucro < 0) {
                                    return (
                                      <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Configuração com prejuízo! Ajuste os prémios ou o preço.
                                      </div>
                                    );
                                  }
                                  if (lucro / (stockInicial * createForm.precoParticipacao) < 0.2) {
                                    return (
                                      <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900 rounded text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Margem baixa. Considere ajustar para pelo menos 20%.
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Configuração viável e lucrativa!
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <Button type="submit" className="w-full" disabled={createLoading || (createForm.tipo === 'raspadinha' && premiosRaspadinha.reduce((sum, p) => sum + p.percentagem, 0) !== 1)}>
                      {createLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A criar...
                        </>
                      ) : (
                        `Criar ${createType === 'aldeia' ? 'Aldeia' : createType === 'evento' ? 'Evento' : 'Jogo'}`
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jogo Detalhe Modal */}
      <AnimatePresence>
        {jogoDetalhe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setJogoDetalhe(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setJogoDetalhe(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">
                      {GAME_TYPES[jogoDetalhe.tipo as keyof typeof GAME_TYPES]?.emoji}
                    </span>
                    {jogoDetalhe.tipo.replace('_', ' ')}
                  </CardTitle>
                  <CardDescription>
                    {jogoDetalhe.evento?.aldeia?.nome} • {jogoDetalhe.evento?.nome}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Preço</p>
                      <p className="text-2xl font-bold text-green-600">{jogoDetalhe.precoParticipacao}€</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Participações</p>
                      <p className="text-2xl font-bold">{jogoDetalhe._count?.participacoes || 0}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Angariado</p>
                      <p className="text-2xl font-bold text-green-600">
                        {((jogoDetalhe._count?.participacoes || 0) * jogoDetalhe.precoParticipacao).toFixed(2)}€
                      </p>
                    </div>
                  </div>

                  {/* Prémio do Jogo */}
                  {jogoDetalhe.premio && (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift className="h-5 w-5 text-amber-600" />
                        <span className="font-semibold text-amber-700 dark:text-amber-300">Prémio Principal</span>
                      </div>
                      <div className="flex items-start gap-4">
                        {jogoDetalhe.premio.imagemBase64 ? (
                          <img 
                            src={jogoDetalhe.premio.imagemBase64} 
                            alt={jogoDetalhe.premio.nome}
                            className="w-20 h-20 object-cover rounded-lg border border-amber-200"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                            <Gift className="h-10 w-10 text-amber-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{jogoDetalhe.premio.nome}</p>
                          {jogoDetalhe.premio.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">{jogoDetalhe.premio.descricao}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {jogoDetalhe.premio.valorEstimado && (
                              <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                <Euro className="h-3 w-3" />
                                {jogoDetalhe.premio.valorEstimado.toFixed(2)}€
                              </Badge>
                            )}
                            {jogoDetalhe.premio.patrocinador && (
                              <span className="text-xs text-muted-foreground">
                                Patrocinado por: {jogoDetalhe.premio.patrocinador}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aviso Legal */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-semibold mb-1">Sorteio Transparente</p>
                        <p>O sorteio utiliza criptografia para garantir imparcialidade. Cada participação tem igual probabilidade de ganhar. O resultado é público e verificável.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 max-h-[300px] overflow-auto">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      {jogoDetalhe.tipo === 'poio_vaca' 
                        ? 'Grid de coordenadas:' 
                        : 'Números disponíveis:'}
                    </p>
                    
                    {jogoDetalhe.tipo === 'poio_vaca' && renderPoioVacaGrid(jogoDetalhe, false)}
                    {(jogoDetalhe.tipo === 'rifa' || jogoDetalhe.tipo === 'tombola') && (
                      <RifaNumberSelector 
                        jogo={jogoDetalhe} 
                        selected={null}
                        onSelect={() => {}}
                        readOnly
                        ocupados={ocupados.map(o => o.numero)}
                        loading={loadingOcupados}
                        meusNumeros={participacoesJogo.filter(p => p.userId === user?.id).map(p => p.dadosParticipacao.numero)}
                        participacoesJogo={participacoesJogo}
                        onOccupiedClick={(num) => handlePosicaoClick({ numero: num }, ['super_admin', 'aldeia_admin', 'vendedor'].includes(user?.role || ''))}
                        isAdminOrVendedor={user ? ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) : false}
                      />
                    )}
                  </div>

                  {/* Lista de Participações para Admins */}
                  {user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) && participacoesJogo.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="p-3 bg-muted/50 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold text-sm">Lista de Participações ({participacoesJogo.length})</span>
                        </div>
                        {user.role === 'super_admin' && (
                          <Badge variant="secondary" className="text-xs">Admin Total</Badge>
                        )}
                      </div>
                      <div className="max-h-[250px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30 sticky top-0">
                            <tr>
                              <th className="text-left p-2 font-medium">Nº/Coord</th>
                              <th className="text-left p-2 font-medium">Cliente</th>
                              <th className="text-left p-2 font-medium hidden sm:table-cell">Contacto</th>
                              <th className="text-center p-2 font-medium">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {participacoesJogo
                              .sort((a, b) => {
                                const numA = a.dadosParticipacao?.numero || 0;
                                const numB = b.dadosParticipacao?.numero || 0;
                                return numA - numB;
                              })
                              .map((p) => {
                                const posicao = jogoDetalhe.tipo === 'poio_vaca'
                                  ? `${p.dadosParticipacao?.letra}${p.dadosParticipacao?.numero}`
                                  : `Nº ${p.dadosParticipacao?.numero}`;
                                
                                const cliente = p.nomeCliente || p.user?.nome || 'N/A';
                                const contacto = p.telefoneCliente || p.emailCliente || '-';
                                
                                // Check permission to alter
                                const canAlterThis = () => {
                                  if (user.role === 'super_admin') return true;
                                  if (user.role === 'aldeia_admin') return jogoDetalhe.evento?.aldeiaId === user.aldeiaId;
                                  if (user.role === 'vendedor') return p.adminRegistouId === user.id || p.userId === user.id;
                                  return false;
                                };
                                const canAlter = canAlterThis();
                                
                                return (
                                  <tr key={p.id} className="hover:bg-muted/20">
                                    <td className="p-2">
                                      <Badge variant="outline" className="font-mono">
                                        {posicao}
                                      </Badge>
                                    </td>
                                    <td className="p-2 font-medium">{cliente}</td>
                                    <td className="p-2 text-muted-foreground hidden sm:table-cell text-xs">
                                      {contacto}
                                    </td>
                                    <td className="p-2 text-center">
                                      {canAlter ? (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 px-2"
                                          onClick={() => {
                                            setParticipacaoParaAlterar(p);
                                            setAlterarForm({
                                              campo: jogoDetalhe.tipo === 'poio_vaca' ? 'coordenada' : 'numero',
                                              novoNumero: '',
                                              novaLetra: '',
                                              motivo: '',
                                              tipoAlteracao: 'trocar'
                                            });
                                            setAlterarModalOpen(true);
                                          }}
                                        >
                                          <Settings className="h-3 w-3 mr-1" />
                                          Gerir
                                        </Button>
                                      ) : (
                                        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                          <Shield className="h-3 w-3" />
                                          Sem acesso
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {jogoDetalhe.sorteio && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <p className="font-semibold text-yellow-800">Resultado do Sorteio</p>
                      </div>
                      <p className="text-lg font-bold text-yellow-700">
                        {jogoDetalhe.tipo === 'poio_vaca' 
                          ? `Coordenada: ${jogoDetalhe.sorteio.resultado.letra}${jogoDetalhe.sorteio.resultado.numero}`
                          : `Número: ${jogoDetalhe.sorteio.resultado.numero}`}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Sorteado em {new Date(jogoDetalhe.sorteio.createdAt).toLocaleString('pt-PT')}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {jogoDetalhe.estado === 'ativo' && (
                    <Button 
                      className="w-full gap-2"
                      onClick={() => {
                        setJogoDetalhe(null);
                        openParticiparModal(jogoDetalhe);
                      }}
                    >
                      <Play className="h-4 w-4" />
                      Participar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Posição Modal - Ver quem jogou */}
      <AnimatePresence>
        {infoPosicaoModal.open && infoPosicaoModal.participacao && (() => {
          const p = infoPosicaoModal.participacao;
          const jogo = p.jogo;
          
          // Check if current user can alter this participation
          const canAlterThis = () => {
            if (!user) return false;
            const isSuperAdmin = user.role === 'super_admin';
            const isAldeiaAdmin = user.role === 'aldeia_admin';
            const isVendedor = user.role === 'vendedor';
            
            if (isSuperAdmin) return true;
            if (isAldeiaAdmin && jogo?.evento?.aldeiaId === user.aldeiaId) return true;
            if (isVendedor && (p.adminRegistouId === user.id || p.userId === user.id)) return true;
            return false;
          };
          
          const canAlter = canAlterThis();
          
          return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setInfoPosicaoModal({ open: false, participacao: null, posicao: '' })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setInfoPosicaoModal({ open: false, participacao: null, posicao: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    {infoPosicaoModal.posicao}
                  </CardTitle>
                  <CardDescription>
                    Informação do jogador
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Data da participação */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {new Date(infoPosicaoModal.participacao.createdAt).toLocaleString('pt-PT')}
                    </p>
                  </div>
                  
                  {/* Info do cliente */}
                  {infoPosicaoModal.participacao.nomeCliente ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Cliente</p>
                        <p className="font-semibold text-blue-800 dark:text-blue-200">
                          {infoPosicaoModal.participacao.nomeCliente}
                        </p>
                        {infoPosicaoModal.participacao.telefoneCliente && (
                          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-1 mt-1">
                            📱 {infoPosicaoModal.participacao.telefoneCliente}
                          </p>
                        )}
                        {infoPosicaoModal.participacao.emailCliente && (
                          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-1">
                            ✉️ {infoPosicaoModal.participacao.emailCliente}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Registado por administrador/vendedor
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">Jogador registado</p>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Participação online
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ID: {infoPosicaoModal.participacao.userId.slice(0, 8)}...
                      </p>
                    </div>
                  )}
                  
                  {/* Valor pago */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Valor pago</p>
                    <p className="text-lg font-bold text-green-600">
                      {infoPosicaoModal.participacao.valorPago}€
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Via {infoPosicaoModal.participacao.metodoPagamento}
                    </p>
                  </div>
                  
                  {/* Permissão info */}
                  {!canAlter && user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) && (
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Sem permissão para alterar esta participação
                      </p>
                    </div>
                  )}
                </CardContent>
                {canAlter && (
                  <CardFooter className="gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setInfoPosicaoModal({ open: false, participacao: null, posicao: '' })}
                    >
                      Fechar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setParticipacaoParaAlterar(infoPosicaoModal.participacao);
                        setAlterarForm({
                          campo: jogo?.tipo === 'poio_vaca' ? 'coordenada' : 'numero',
                          novoNumero: '',
                          novaLetra: '',
                          motivo: '',
                          tipoAlteracao: 'trocar'
                        });
                        setInfoPosicaoModal({ open: false, participacao: null, posicao: '' });
                        setAlterarModalOpen(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Gerir
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Novo Vendedor Modal */}
      <AnimatePresence>
        {novoVendedorModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setNovoVendedorModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setNovoVendedorModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Novo Vendedor
                  </CardTitle>
                  <CardDescription>
                    Adicionar um novo vendedor à aldeia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>📋 Info:</strong> O vendedor poderá registar participações para clientes e receber pagamentos em dinheiro.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendedor-nome">Nome *</Label>
                    <Input
                      id="vendedor-nome"
                      placeholder="Nome completo"
                      value={novoVendedorForm.nome}
                      onChange={(e) => setNovoVendedorForm({ ...novoVendedorForm, nome: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendedor-email">Email *</Label>
                    <Input
                      id="vendedor-email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={novoVendedorForm.email}
                      onChange={(e) => setNovoVendedorForm({ ...novoVendedorForm, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendedor-password">Password *</Label>
                    <Input
                      id="vendedor-password"
                      type="password"
                      placeholder="Password de acesso"
                      value={novoVendedorForm.password}
                      onChange={(e) => setNovoVendedorForm({ ...novoVendedorForm, password: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo 6 caracteres
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setNovoVendedorModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={novoVendedorLoading || !novoVendedorForm.nome || !novoVendedorForm.email || !novoVendedorForm.password}
                    onClick={handleCriarVendedor}
                  >
                    {novoVendedorLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        A criar...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Criar Vendedor
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setProfileModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Editar Perfil
                  </CardTitle>
                  <CardDescription>
                    Atualize as suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-nome">Nome *</Label>
                      <Input
                        id="profile-nome"
                        placeholder="O seu nome"
                        value={profileForm.nome}
                        onChange={(e) => setProfileForm({ ...profileForm, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-telefone">Telefone</Label>
                      <Input
                        id="profile-telefone"
                        placeholder="Ex: 912345678"
                        value={profileForm.telefone}
                        onChange={(e) => setProfileForm({ ...profileForm, telefone: e.target.value })}
                      />
                    </div>
                    
                    {/* Email notifications toggle */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {profileForm.notificacoesEmail ? (
                          <Bell className="h-5 w-5 text-green-600" />
                        ) : (
                          <BellOff className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <Label htmlFor="notificacoes-email" className="cursor-pointer">
                            Receber notificações por email
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Alertas sobre sorteios e resultados
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="notificacoes-email"
                        checked={profileForm.notificacoesEmail}
                        onCheckedChange={(checked) => setProfileForm({ ...profileForm, notificacoesEmail: checked })}
                      />
                    </div>
                    
                    {/* Last login date */}
                    {profileData?.ultimoLogin && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                        <Clock className="h-4 w-4" />
                        <span>Último login: {new Date(profileData.ultimoLogin).toLocaleString('pt-PT')}</span>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      onClick={handleUpdateProfile}
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A guardar...
                        </>
                      ) : (
                        'Guardar Alterações'
                      )}
                    </Button>
                    
                    {/* RGPD Section - Only for regular users and vendedores */}
                    {user && ['user', 'vendedor'].includes(user.role) && (
                      <>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold">Privacidade e Dados (RGPD)</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Gerencie os seus dados pessoais de acordo com o RGPD
                          </p>
                          
                          <div className="space-y-3">
                            {/* Export Data Button */}
                            <Button 
                              variant="outline" 
                              className="w-full justify-start gap-2"
                              onClick={handleExportData}
                              disabled={exportLoading}
                            >
                              {exportLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              Exportar Meus Dados
                            </Button>
                            
                            {/* Delete Account Button */}
                            <Button 
                              variant="destructive" 
                              className="w-full justify-start gap-2"
                              onClick={() => {
                                setDeleteConfirmText('');
                                setDeleteAccountModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Apagar Minha Conta
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteAccountModalOpen} onOpenChange={setDeleteAccountModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Tem a certeza que deseja apagar a sua conta?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p className="text-destructive font-medium">
                Esta ação é irreversível. Todos os seus dados pessoais serão permanentemente eliminados.
              </p>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm" className="text-sm font-medium">
                  Digite <span className="font-bold text-destructive">APAGAR</span> para confirmar:
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="APAGAR"
                  className="border-destructive/50 focus:border-destructive"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'APAGAR' || deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A apagar...
                </>
              ) : (
                'Apagar Conta'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment History Modal */}
      <AnimatePresence>
        {pagamentosModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPagamentosModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setPagamentosModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Pagamentos
                  </CardTitle>
                  <CardDescription>
                    O seu histórico de participações e pagamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pagamentosLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-muted-foreground">A carregar histórico...</span>
                    </div>
                  ) : pagamentosData ? (
                    <div className="space-y-6">
                      {/* Statistics */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                          <CardHeader className="pb-2">
                            <CardDescription className="text-green-600">Total Gasto</CardDescription>
                            <CardTitle className="text-2xl text-green-700">{pagamentosData.estatisticas?.totalGasto?.toFixed(2) || '0.00'}€</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <CardHeader className="pb-2">
                            <CardDescription className="text-blue-600">Participações</CardDescription>
                            <CardTitle className="text-2xl text-blue-700">{pagamentosData.estatisticas?.totalParticipacoes || 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                          <CardHeader className="pb-2">
                            <CardDescription className="text-yellow-600">Vitórias</CardDescription>
                            <CardTitle className="text-2xl text-yellow-700">{pagamentosData.estatisticas?.totalVitorias || 0}</CardTitle>
                          </CardHeader>
                        </Card>
                      </div>

                      {/* Payment methods breakdown */}
                      <div className="flex gap-4">
                        <Badge variant="outline">MBWay: {pagamentosData.estatisticas?.pagamentosPorMetodo?.mbway || 0}</Badge>
                        <Badge variant="outline">Dinheiro: {pagamentosData.estatisticas?.pagamentosPorMetodo?.dinheiro || 0}</Badge>
                      </div>

                      {/* History list */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Participações</h4>
                        {pagamentosData.historico?.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Ticket className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Sem participações registadas</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {pagamentosData.historico?.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                                    {item.jogo?.tipo === 'poio_vaca' ? '🐄' : item.jogo?.tipo === 'rifa' ? '🎟️' : '🎲'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm capitalize">{item.jogo?.tipo?.replace('_', ' ')}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.jogo?.evento} • {item.jogo?.aldeia}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(item.data).toLocaleDateString('pt-PT')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600">{item.valorPago}€</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.jogo?.tipo === 'poio_vaca' 
                                      ? `${item.dadosParticipacao?.letra}${item.dadosParticipacao?.numero}`
                                      : `Nº ${item.dadosParticipacao?.numero}`}
                                  </p>
                                  {item.venceu && (
                                    <Badge className="bg-yellow-500 text-white text-xs mt-1">
                                      <Trophy className="h-3 w-3 mr-1" /> Venceu!
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Erro ao carregar histórico</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes da Organização */}
      <AnimatePresence>
        {orgDetalheModalOpen && orgDetalhe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOrgDetalheModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setOrgDetalheModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-4">
                    {orgDetalhe.logoBase64 ? (
                      <img
                        src={orgDetalhe.logoBase64}
                        alt={orgDetalhe.nome}
                        className="w-16 h-16 object-cover rounded-full border-2 border-green-200"
                      />
                    ) : (
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center text-2xl",
                        orgDetalhe.tipoOrganizacao === 'escola' ? 'bg-blue-100 dark:bg-blue-900' :
                        orgDetalhe.tipoOrganizacao === 'associacao_pais' ? 'bg-purple-100 dark:bg-purple-900' :
                        orgDetalhe.tipoOrganizacao === 'clube' ? 'bg-orange-100 dark:bg-orange-900' :
                        'bg-green-100 dark:bg-green-900'
                      )}>
                        {orgDetalhe.tipoOrganizacao === 'escola' ? '🏫' :
                         orgDetalhe.tipoOrganizacao === 'associacao_pais' ? '👨‍👩‍👧‍👦' :
                         orgDetalhe.tipoOrganizacao === 'clube' ? '⚽' : '🏘️'}
                      </div>
                    )}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {orgDetalhe.nome}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {orgDetalhe.tipoOrganizacao === 'escola' ? 'Escola' :
                           orgDetalhe.tipoOrganizacao === 'associacao_pais' ? 'Associação de Pais' :
                           orgDetalhe.tipoOrganizacao === 'clube' ? 'Clube' : 'Aldeia'}
                        </Badge>
                        {orgDetalhe.localidade && (
                          <span className="text-muted-foreground">{orgDetalhe.localidade}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {orgDetalheLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-muted-foreground">A carregar dados...</span>
                    </div>
                  ) : (
                    <>
                      {/* Informações da Organização */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {orgDetalhe.descricao && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">{orgDetalhe.descricao}</p>
                          </div>
                        )}

                        {/* Localização */}
                        {(orgDetalhe.morada || orgDetalhe.localizacao || orgDetalhe.localidade) && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Localização</p>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {orgDetalhe.morada || orgDetalhe.localizacao}
                              {orgDetalhe.codigoPostal && <span>• {orgDetalhe.codigoPostal}</span>}
                              {orgDetalhe.localidade && <span>• {orgDetalhe.localidade}</span>}
                            </p>
                          </div>
                        )}

                        {/* Responsável */}
                        {orgDetalhe.responsavel && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Responsável</p>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {orgDetalhe.responsavel}
                              {orgDetalhe.contactoResponsavel && (
                                <span className="text-muted-foreground">• {orgDetalhe.contactoResponsavel}</span>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Conformidade Legal */}
                        {(orgDetalhe.autorizacaoCM || orgDetalhe.numeroAlvara) && (
                          <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              Conformidade Legal
                            </p>
                            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                              {orgDetalhe.autorizacaoCM && (
                                <p>✓ Autorização Câmara Municipal {orgDetalhe.dataAutorizacaoCM && `desde ${new Date(orgDetalhe.dataAutorizacaoCM).toLocaleDateString('pt-PT')}`}</p>
                              )}
                              {orgDetalhe.numeroAlvara && (
                                <p>✓ Alvará nº {orgDetalhe.numeroAlvara}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Estatísticas */}
                        <div className="md:col-span-2 grid grid-cols-3 gap-3">
                          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">{orgDetalheEventos.length}</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Eventos</p>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{orgDetalheJogos.length}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Jogos</p>
                          </div>
                          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-center">
                            <p className="text-2xl font-bold text-amber-600">{orgDetalhe._count?.premios || 0}</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">Prémios</p>
                          </div>
                        </div>

                        {/* Eventos Ativos */}
                        {orgDetalheEventos.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Eventos ({orgDetalheEventos.length})
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {orgDetalheEventos.slice(0, 5).map(evento => (
                                <div key={evento.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {evento.imagemBase64 ? (
                                      <img src={evento.imagemBase64} alt={evento.nome} className="w-8 h-8 rounded object-cover" />
                                    ) : (
                                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-medium">{evento.nome}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(evento.dataInicio).toLocaleDateString('pt-PT')}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant={evento.estado === 'ativo' ? 'default' : 'secondary'}>
                                    {evento.estado}
                                  </Badge>
                                </div>
                              ))}
                              {orgDetalheEventos.length > 5 && (
                                <p className="text-xs text-center text-muted-foreground">
                                  +{orgDetalheEventos.length - 5} eventos
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Jogos Ativos */}
                        {orgDetalheJogos.filter(j => j.estado === 'ativo').length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Gamepad2 className="h-4 w-4" />
                              Jogos Ativos
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {orgDetalheJogos.filter(j => j.estado === 'ativo').map(jogo => (
                                <Badge key={jogo.id} variant="outline" className="gap-1">
                                  {jogo.tipo === 'poio_vaca' ? '🐄' : jogo.tipo === 'rifa' ? '🎟️' : '🎲'}
                                  {jogo.tipo.replace('_', ' ')}
                                  <span className="text-green-600">{jogo.precoParticipacao}€</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setOrgDetalheModalOpen(false)}
                  >
                    Fechar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Evento/Campanha */}
      <AnimatePresence>
        {eventoDetalheModalOpen && eventoDetalhe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEventoDetalheModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setEventoDetalheModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-4">
                    {eventoDetalhe.imagemBase64 ? (
                      <img
                        src={eventoDetalhe.imagemBase64}
                        alt={eventoDetalhe.nome}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {eventoDetalhe.nome}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant={eventoDetalhe.estado === 'ativo' ? 'default' : 'secondary'}>
                          {eventoDetalhe.estado}
                        </Badge>
                        {eventoDetalhe.aldeia?.nome && (
                          <span className="text-muted-foreground">{eventoDetalhe.aldeia.nome}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {eventoDetalheLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-muted-foreground">A carregar dados...</span>
                    </div>
                  ) : (
                    <>
                      {/* Descrição */}
                       
                    {eventoDetalhe.objectivoAngariacao && (
                      <div className="mt-6">
                        <FundingGoal
                          current={eventoDetalheStats.totalAngariado}
                          target={eventoDetalhe.objectivoAngariacao}
                        />
                      </div>
                    )}

                      {/* Datas */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Data Início</p>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(eventoDetalhe.dataInicio).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        {eventoDetalhe.dataFim && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Data Fim</p>
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(eventoDetalhe.dataFim).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Barra de Progresso de Angariação */}
                      {eventoDetalhe.objectivoAngariacao && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Progresso da Angariação
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {eventoDetalheStats.totalAngariado.toFixed(2)}€ / {eventoDetalhe.objectivoAngariacao.toFixed(2)}€
                            </p>
                          </div>
                          <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-4 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (eventoDetalheStats.totalAngariado / eventoDetalhe.objectivoAngariacao) * 100)}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                            />
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                            {Math.round((eventoDetalheStats.totalAngariado / eventoDetalhe.objectivoAngariacao) * 100)}% alcançado
                          </p>
                        </div>
                      )}

                      {/* Estatísticas */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">{eventoDetalheJogos.length}</p>
                          <p className="text-xs text-green-700 dark:text-green-300">Jogos</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{eventoDetalheStats.totalParticipacoes}</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Participações</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-center">
                          <p className="text-2xl font-bold text-amber-600">{eventoDetalheStats.totalAngariado.toFixed(0)}€</p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">Angariado</p>
                        </div>
                      </div>

                      {/* Jogos do Evento */}
                      {eventoDetalheJogos.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            Jogos ({eventoDetalheJogos.length})
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {eventoDetalheJogos.map(jogo => (
                              <div key={jogo.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">
                                    {jogo.tipo === 'poio_vaca' ? '🐄' : jogo.tipo === 'rifa' ? '🎟️' : '🎲'}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium capitalize">{jogo.tipo.replace('_', ' ')}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {jogo._count?.participacoes || 0} participações
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-green-600">
                                    {jogo.precoParticipacao}€
                                  </Badge>
                                  <Badge variant={jogo.estado === 'ativo' ? 'default' : 'secondary'}>
                                    {jogo.estado}
                                  </Badge>
                                  {jogo.premio && (
                                    <div className="flex items-center gap-1" title={jogo.premio.nome}>
                                      <Gift className="h-4 w-4 text-amber-500" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prémios do Evento */}
                      {eventoDetalheJogos.some(j => j.premio) && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Gift className="h-4 w-4 text-amber-500" />
                            Prémios
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {eventoDetalheJogos.filter(j => j.premio).map(jogo => (
                              jogo.premio && (
                                <div key={jogo.id} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                                  {jogo.premio.imagemBase64 ? (
                                    <img src={jogo.premio.imagemBase64} alt={jogo.premio.nome} className="w-8 h-8 rounded object-cover" />
                                  ) : (
                                    <Gift className="h-5 w-5 text-amber-500" />
                                  )}
                                  <div>
                                    <p className="text-xs font-medium">{jogo.premio.nome}</p>
                                    {jogo.premio.valorEstimado && (
                                      <p className="text-xs text-amber-600">{jogo.premio.valorEstimado.toFixed(2)}€</p>
                                    )}
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      {/* QR Code da Campanha */}
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          QR Code da Campanha
                        </h4>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="p-4 bg-white rounded-lg shadow-inner">
                            <QRCodeSVG
                              value={`${window.location.origin}/?share=evento_${eventoDetalhe.id}`}
                              size={150}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <p className="text-sm text-muted-foreground mb-3">
                              Scan este código para aceder diretamente à campanha
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                // Download QR Code as PNG
                                const svg = document.querySelector('.bg-white svg') as SVGElement;
                                if (svg) {
                                  const svgData = new XMLSerializer().serializeToString(svg);
                                  const canvas = document.createElement('canvas');
                                  const ctx = canvas.getContext('2d');
                                  const img = new Image();
                                  img.onload = () => {
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    ctx?.fillRect(0, 0, canvas.width, canvas.height);
                                    ctx?.drawImage(img, 0, 0);
                                    const pngFile = canvas.toDataURL('image/png');
                                    const downloadLink = document.createElement('a');
                                    downloadLink.download = `qrcode_${eventoDetalhe.nome?.replace(/\s+/g, '_') || 'campanha'}.png`;
                                    downloadLink.href = pngFile;
                                    downloadLink.click();
                                    toast.success('QR Code descarregado!');
                                  };
                                  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                              Descarregar QR Code
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Partilha em Redes Sociais */}
                      <div className="pt-4 border-t">
                        <ShareButtons type="evento" data={eventoDetalhe} />
                      </div>
                    </>
                  )}
                </CardContent>

                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEventoDetalheModalOpen(false)}
                  >
                    Fechar
                  </Button>
                  {eventoDetalheJogos.some(j => j.estado === 'ativo') && (
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => {
                        setEventoDetalheModalOpen(false);
                        setActiveView('public');
                      }}
                    >
                      <Play className="h-4 w-4" />
                      Participar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificações Modal */}
      <NotificacoesModal
        open={notificacoesModalOpen}
        onClose={() => setNotificacoesModalOpen(false)}
        notificacoes={notificacoes}
        naoLidas={notificacoesNaoLidas}
        onMarcarLidas={marcarNotificacoesLidas}
        loading={notificacoesLoading}
      />
    </div>
  );
}

// Rifa Number Selector Component (to avoid useState in render)
