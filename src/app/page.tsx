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
import type { User, Jogo, Participacao, Aldeia, Evento } from '@/types/project';
import { GameCardSkeleton, EmptyState } from '@/components/common-ui';
import { NotificacoesModal } from '@/components/notificacoes-modal';
import { ScratchCard } from '@/components/scratch-card';
import { RifaNumberSelector } from '@/components/rifa-number-selector';
import { FundingGoal } from '@/components/funding-goal';
import { AdminDashboardView } from '@/features/admin/AdminDashboardView';
import { VendedorDashboardView } from '@/features/vendedor/VendedorDashboardView';
import { PublicGamesView } from '@/features/public/PublicGamesView';
import { PlayerParticipationsView } from '@/features/player/PlayerParticipationsView';
import { AuthModal } from '@/components/modals/AuthModal';
import { ParticiparModal } from '@/components/modals/ParticiparModal';
import { CreateModal } from '@/components/modals/CreateModal';
import { WizardModal } from '@/components/modals/WizardModal';

// Skeleton Components
const GameCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-24 w-full" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

// Empty State Component
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
      <Icon className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-center max-w-md mb-4">{description}</p>
    {action}
  </motion.div>
);

// Scratch Card Component - Real Scratch Effect with Canvas
const ScratchCard = ({
  participacaoId,
  numeroCartao,
  isRevelada,
  isRevelando,
  resultado,
  onReveal
}: {
  participacaoId: string;
  numeroCartao: number;
  isRevelada: boolean;
  isRevelando: boolean;
  resultado: any;
  onReveal: (id: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const isWinner = resultado?.isWinner;

  // Initialize canvas with scratch layer
  useEffect(() => {
    if (isRevelada || isRevelando) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw scratch layer (golden/silver gradient)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(0.5, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add texture pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add text instruction
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${Math.max(14, canvas.width / 12)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RASPE AQUI', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = `${Math.max(10, canvas.width / 16)}px sans-serif`;
    ctx.fillText('✨', canvas.width / 2, canvas.height / 2 + 15);
  }, [isRevelada, isRevelando]);

  // Handle scratch
  const handleScratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isRevelada || isRevelando) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Erase scratch layer
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Calculate progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }
    const progress = (transparent / (pixels.length / 4)) * 100;
    setScratchProgress(progress);

    // Auto-reveal when 50% scratched
    if (progress > 50 && !isScratching) {
      setIsScratching(true);
      onReveal(participacaoId);
    }
  }, [isRevelada, isRevelando, isScratching, participacaoId, onReveal]);

  // Show result animation
  useEffect(() => {
    if (isRevelada && resultado) {
      setTimeout(() => setShowResult(true), 100);
    }
  }, [isRevelada, resultado]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative rounded-xl overflow-hidden border-2 transition-all",
        isRevelada && isWinner ? "border-yellow-500 shadow-lg shadow-yellow-200 dark:shadow-yellow-900/50" : "border-gray-200 dark:border-gray-700",
        !isRevelada && !isRevelando && "hover:border-amber-400 hover:shadow-lg cursor-pointer"
      )}
    >
      {/* Card Number Badge */}
      <div className="absolute top-2 left-2 z-20">
        <Badge className="bg-black/70 text-white text-xs">
          #{numeroCartao}
        </Badge>
      </div>

      {/* Scratch Area */}
      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full"
      >
        {/* Background Result Layer */}
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center p-3",
          isRevelada && isWinner
            ? "bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 dark:from-yellow-900/50 dark:via-amber-900/30 dark:to-yellow-900/50"
            : isRevelada
              ? "bg-gradient-to-br from-gray-100 via-slate-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
              : "bg-gradient-to-br from-amber-400 to-orange-500"
        )}>
          {/* Revealed Content */}
          {isRevelada && showResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-center"
            >
              {isWinner ? (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.3 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center mb-2 mx-auto shadow-lg">
                      <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-800" />
                    </div>
                  </motion.div>
                  <p className="text-yellow-800 dark:text-yellow-200 font-bold text-lg sm:text-xl mb-1">🎉 GANHOU!</p>
                  <p className="text-yellow-700 dark:text-yellow-300 font-semibold text-sm sm:text-base">{resultado?.premio?.nome}</p>
                  <Badge className="bg-yellow-500 text-white mt-2 text-base sm:text-lg px-3 py-1">
                    {resultado?.premio?.valor}€
                  </Badge>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-3xl sm:text-4xl">😔</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-bold text-base sm:text-lg mb-1">Sem prémio</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Mais sorte na próxima!</p>
                </>
              )}
            </motion.div>
          ) : isRevelando ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="text-white text-sm">A revelar...</p>
            </div>
          ) : !isRevelada ? (
            <>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <p className="text-white font-bold text-base sm:text-lg mb-1">Raspadinha</p>
              <p className="text-white/80 text-xs sm:text-sm">Raspe para revelar!</p>
            </>
          ) : null}
        </div>

        {/* Canvas Scratch Layer */}
        {!isRevelada && !isRevelando && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={() => setIsScratching(true)}
            onMouseUp={() => setIsScratching(false)}
            onMouseLeave={() => setIsScratching(false)}
            onMouseMove={isScratching ? handleScratch : undefined}
            onTouchStart={() => setIsScratching(true)}
            onTouchEnd={() => setIsScratching(false)}
            onTouchMove={handleScratch}
          />
        )}
      </div>

      {/* Verification Badge */}
      {isRevelada && (
        <div className="absolute bottom-2 right-2 z-10">
          <Badge variant="outline" className="text-xs bg-white/90 dark:bg-gray-800/90">
            <Shield className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        </div>
      )}

      {/* Progress indicator */}
      {!isRevelada && !isRevelando && scratchProgress > 0 && (
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div className="h-1 bg-gray-300/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${scratchProgress}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

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
  const renderPublicGames = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-green-600" />
            Jogos Disponíveis
          </h2>
          <p className="text-muted-foreground">Participe em jogos de aldeias de todo o mundo</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {jogosPublicos.filter(j => j.estado === 'ativo').length} jogos ativos
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GameCardSkeleton />
          <GameCardSkeleton />
          <GameCardSkeleton />
        </div>
      ) : jogosPublicos.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="Sem jogos disponíveis"
          description="Não há jogos ativos no momento. Volte em breve!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jogosPublicos.map((jogo, index) => {
            const gameType = GAME_TYPES[jogo.tipo as keyof typeof GAME_TYPES] || GAME_TYPES.rifa;
            const config = typeof jogo.config === 'string' ? JSON.parse(jogo.config) : jogo.config;

            return (
              <motion.div
                key={jogo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "overflow-hidden hover:shadow-xl transition-all duration-300 group",
                  jogo.estado === 'terminado' && "opacity-75"
                )}>
                  <div className={cn(
                    "h-2",
                    jogo.estado === 'ativo' ? "bg-gradient-to-r from-green-400 to-green-600" :
                    jogo.estado === 'terminado' ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                    "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  )} />

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{gameType.emoji}</span>
                          <span className="capitalize">{jogo.tipo.replace('_', ' ')}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {jogo.evento?.aldeia?.nome || 'Aldeia'} • {jogo.evento?.nome || 'Evento'}
                        </CardDescription>
                      </div>
                      <Badge variant={jogo.estado === 'ativo' ? 'default' : 'secondary'}>
                        {jogo.estado}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {gameType.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Preço</p>
                        <p className="text-lg font-bold text-green-600">{jogo.precoParticipacao}€</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Participações</p>
                        <p className="text-lg font-bold">{jogo._count?.participacoes || 0}</p>
                      </div>
                    </div>

                    {/* Prémio */}
                    {jogo.premio && (
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Prémio</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {jogo.premio.imagemBase64 ? (
                            <img
                              src={jogo.premio.imagemBase64}
                              alt={jogo.premio.nome}
                              className="w-12 h-12 object-cover rounded-lg border border-amber-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                              <Gift className="h-6 w-6 text-amber-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{jogo.premio.nome}</p>
                            {jogo.premio.valorEstimado && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                Valor: {jogo.premio.valorEstimado.toFixed(2)}€
                              </p>
                            )}
                            {jogo.premio.patrocinador && (
                              <p className="text-xs text-muted-foreground">
                                Patrocinado por: {jogo.premio.patrocinador}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {jogo.estado === 'terminado' && jogo.sorteio && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Vencedor: {JSON.stringify(jogo.sorteio.resultado)}
                        </p>
                      </div>
                    )}

                    {jogo.tipo === 'poio_vaca' && (
                      <div className="text-xs text-muted-foreground">
                        Grid: {config.linhas || 10}×{config.colunas || 10} = {(config.linhas || 10) * (config.colunas || 10)} coordenadas
                      </div>
                    )}
                    {jogo.tipo === 'rifa' && (
                      <div className="text-xs text-muted-foreground">
                        {config.totalBilhetes || 100} números disponíveis
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="gap-2">
                    {jogo.estado === 'ativo' ? (
                      <>
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => openParticiparModal(jogo)}
                        >
                          <Play className="h-4 w-4" />
                          Participar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setJogoDetalhe(jogo)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink('jogo', jogo);
                          }}
                          title="Partilhar jogo"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex w-full gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setJogoDetalhe(jogo)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink('jogo', jogo);
                          }}
                          title="Partilhar jogo"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  const renderMyGames = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-green-600" />
            Minhas Participações
          </h2>
          <p className="text-muted-foreground">Veja todos os jogos onde participou</p>
        </div>
      </div>

      {!user ? (
        <EmptyState
          icon={Users}
          title="Inicie sessão"
          description="Faça login para ver as suas participações"
          action={<Button onClick={() => setAuthModalOpen(true)}>Entrar</Button>}
        />
      ) : minhasParticipacoes.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Sem participações"
          description="Ainda não participou em nenhum jogo. Explore os jogos disponíveis!"
          action={<Button onClick={() => setActiveView('public')}>Ver Jogos</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {minhasParticipacoes.map((part, index) => {
            const gameType = GAME_TYPES[part.jogo?.tipo as keyof typeof GAME_TYPES] || GAME_TYPES.rifa;
            const isWinner = part.jogo?.sorteio &&
              JSON.stringify(part.jogo.sorteio.resultado) === JSON.stringify(part.dadosParticipacao);

            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "hover:shadow-lg transition-all",
                  isWinner && "ring-2 ring-yellow-500 bg-yellow-50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl relative">
                          {gameType.emoji}
                          {/* Círculo indicando que o número foi jogado */}
                          <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-pulse opacity-50" />
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{part.jogo?.tipo?.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {part.jogo?.evento?.aldeia?.nome} • {part.jogo?.evento?.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(part.createdAt).toLocaleDateString('pt-PT')}
                          </p>
                          {/* Info do cliente se registado por admin */}
                          {part.nomeCliente && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {part.nomeCliente}
                              {part.telefoneCliente && <span>• {part.telefoneCliente}</span>}
                              {part.emailCliente && !part.telefoneCliente && <span>• {part.emailCliente}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          {isWinner ? (
                            <Badge className="bg-yellow-500 text-white gap-1">
                              <Trophy className="h-3 w-3" /> Venceu!
                            </Badge>
                          ) : part.jogo?.estado === 'terminado' ? (
                            <Badge variant="secondary">Terminado</Badge>
                          ) : (
                            <Badge variant="default">Ativo</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center font-bold text-green-700">
                            {part.jogo?.tipo === 'poio_vaca'
                              ? `${part.dadosParticipacao.letra}${part.dadosParticipacao.numero}`
                              : part.dadosParticipacao.numero
                            }
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{part.valorPago}€</p>

                        {/* Botões de ação para admins */}
                        {user && ['super_admin', 'aldeia_admin'].includes(user.role) && !part.jogo?.sorteio && (
                          <div className="flex gap-1 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAlterarModal(part);
                              }}
                              className="h-7 text-xs"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Alterar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openHistoricoModal(part);
                              }}
                              className="h-7 text-xs"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Histórico
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  const renderAdmin = () => (
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

  // Vendedor Dashboard
  const renderVendedorDashboard = () => {
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
              {activeView === 'public' && <div key="public">{renderPublicGames()}</div>}
              {activeView === 'my-games' && <div key="my-games">{renderMyGames()}</div>}
              {activeView === 'admin' && <div key="admin">{renderAdmin()}</div>}
              {activeView === 'vendedor' && <div key="vendedor">{renderVendedorDashboard()}</div>}
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
      {/* Modals Refatorados */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        handleAuth={handleAuth}
        authLoading={authLoading}
        handleQuickLogin={handleQuickLogin}
      />

      <ParticiparModal
        isOpen={participarModalOpen}
        onClose={() => setParticiparModalOpen(false)}
        jogoSelecionado={jogoSelecionado}
        user={user}
        step={step}
        setStep={setStep}
        numerosSelecionados={numerosSelecionados}
        setNumerosSelecionados={setNumerosSelecionados}
        coordenadasSelecionadas={coordenadasSelecionadas}
        setCoordenadasSelecionadas={setCoordenadasSelecionadas}
        quantidadeRaspadinha={quantidadeRaspadinha}
        setQuantidadeRaspadinha={setQuantidadeRaspadinha}
        metodoPagamento={metodoPagamento}
        setMetodoPagamento={setMetodoPagamento}
        telefoneMbway={telefoneMbway}
        setTelefoneMbway={setTelefoneMbway}
        adminParaCliente={adminParaCliente}
        setAdminParaCliente={setAdminParaCliente}
        nomeCliente={nomeCliente}
        setNomeCliente={setNomeCliente}
        telefoneCliente={telefoneCliente}
        setTelefoneCliente={setTelefoneCliente}
        emailCliente={emailCliente}
        setEmailCliente={setEmailCliente}
        identificacaoValida={identificacaoValida}
        participacaoLoading={participacaoLoading}
        handleParticipar={handleParticipar}
        getComplianceText={getComplianceText}
      />

      <CreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        createType={createType}
        createForm={createForm}
        setCreateForm={setCreateForm}
        handleCreate={handleCreate}
        createLoading={createLoading}
        aldeias={aldeias}
        eventos={eventos}
        premios={premios}
        handleImageUpload={handleImageUpload}
        aldeiaImageRef={aldeiaImageRef}
        eventoImageRef={eventoImageRef}
        stockInicial={stockInicial}
        setStockInicial={setStockInicial}
        premiosRaspadinha={premiosRaspadinha}
        setPremiosRaspadinha={setPremiosRaspadinha}
        limitePorUsuario={limitePorUsuario}
        setLimitePorUsuario={setLimitePorUsuario}
        novoPremioRaspadinha={novoPremioRaspadinha}
        setNovoPremioRaspadinha={setNovoPremioRaspadinha}
        addPremioRaspadinha={addPremioRaspadinha}
        removePremioRaspadinha={removePremioRaspadinha}
      />

      <WizardModal
        isOpen={wizardModalOpen}
        onClose={() => setWizardModalOpen(false)}
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        wizardData={wizardData}
        setWizardData={setWizardData}
        wizardLoading={wizardLoading}
        handleSaveWizard={handleSaveWizard}
        wizardLogoRef={wizardLogoRef}
        handleImageUpload={handleImageUpload}
      />
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
                      {eventoDetalhe.descricao && (
                        <p className="text-sm text-muted-foreground">{eventoDetalhe.descricao}</p>
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
function RifaNumberSelector({
  jogo,
  selected,
  onSelect,
  readOnly = false,
  ocupados = [],
  loading = false,
  multiSelect = false,
  selectedNumbers = [],
  onToggleNumber,
  maxNumbers = 10,
  meusNumeros = [],
  participacoesJogo = [],
  onOccupiedClick,
  isAdminOrVendedor = false
}: {
  jogo: Jogo;
  selected: number | null;
  onSelect: (num: number) => void;
  readOnly?: boolean;
  ocupados?: number[];
  loading?: boolean;
  multiSelect?: boolean;
  selectedNumbers?: number[];
  onToggleNumber?: (num: number) => void;
  maxNumbers?: number;
  meusNumeros?: number[];
  participacoesJogo?: Participacao[];
  onOccupiedClick?: (num: number) => void;
  isAdminOrVendedor?: boolean;
}) {
  const config = typeof jogo.config === 'string' ? JSON.parse(jogo.config) : jogo.config;
  const total = config.totalBilhetes || 100;
  const [pagina, setPagina] = useState(0);
  const numerosPorPagina = 50;

  const inicio = pagina * numerosPorPagina;
  const fim = Math.min(inicio + numerosPorPagina, total);

  // Ensure ocupados is always an array
  const ocupadosList = Array.isArray(ocupados) ? ocupados : [];
  const meusNumerosList = Array.isArray(meusNumeros) ? meusNumeros : [];

  // Debug logs
  console.log('🎲 RifaNumberSelector - ocupadosList:', ocupadosList, 'tipos:', ocupadosList.map(o => typeof o));
  console.log('🎲 RifaNumberSelector - meusNumerosList:', meusNumerosList);

  const isOcupado = (num: number) => {
    // Comparação robusta - converte para number
    const result = ocupadosList.some(o => Number(o) === Number(num));
    if (result) {
      console.log(`🎲 Número ${num} está ocupado!`);
    }
    return result;
  };
  const isMeu = (num: number) => meusNumerosList.some(m => Number(m) === Number(num));
  const isSelected = (num: number) => multiSelect
    ? selectedNumbers.includes(num)
    : selected === num;
  const canSelectMore = multiSelect && selectedNumbers.length < maxNumbers;

  const handleNumberClick = (num: number) => {
    // Prevent selection while loading occupied positions
    if (loading) return;

    if (jogo.estado !== 'ativo' || readOnly) {
      // Allow clicking on occupied numbers for admins
      if (isOcupado(num) && isAdminOrVendedor && onOccupiedClick) {
        onOccupiedClick(num);
      }
      return;
    }

    // If occupied and admin, show info
    if (isOcupado(num) && !isMeu(num)) {
      if (isAdminOrVendedor && onOccupiedClick) {
        onOccupiedClick(num);
      }
      return;
    }

    // Can't select if it's occupied by someone else
    if (isOcupado(num) && !isMeu(num)) return;

    if (multiSelect && onToggleNumber) {
      // Multi-select mode - allow deselecting own numbers
      if (isMeu(num) && selectedNumbers.includes(num)) {
        onToggleNumber(num);
      } else if (!isOcupado(num) && (selectedNumbers.includes(num) || canSelectMore)) {
        onToggleNumber(num);
      }
    } else {
      // Single-select mode
      if (!isOcupado(num) || isMeu(num)) {
        onSelect(num);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Multi-select info */}
      {multiSelect && (
        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Selecionados: {selectedNumbers.length}/{maxNumbers}
            </span>
          </div>
          <span className="text-sm font-bold text-green-700">
            Total: {(selectedNumbers.length * jogo.precoParticipacao).toFixed(2)}€
          </span>
        </div>
      )}

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-muted-foreground">Meus</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span className="text-muted-foreground">Ocupados</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-muted-foreground">Disponíveis</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">A carregar números...</span>
        </div>
      )}
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: fim - inicio }).map((_, i) => {
          const num = inicio + i + 1;
          const selected = isSelected(num);
          const occupied = isOcupado(num);
          const meu = isMeu(num);
          const canSelect = jogo.estado === 'ativo' && !readOnly && (!occupied || meu) && !loading;
          const disabledInMulti = multiSelect && !selected && !canSelectMore;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleNumberClick(num)}
              disabled={loading || (!canSelect && !disabledInMulti && (!occupied || !isAdminOrVendedor))}
              className={cn(
                "w-8 h-8 rounded text-xs font-medium transition-all",
                loading ? "bg-gray-100 text-gray-400 cursor-wait" :
                selected
                  ? "bg-green-500 text-white scale-110 font-bold ring-2 ring-green-300"
                  : meu
                    ? "bg-blue-500 text-white font-bold hover:bg-blue-600"
                    : occupied
                      ? "bg-red-100 text-red-600 cursor-pointer hover:bg-red-200"
                      : disabledInMulti
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-gray-100 hover:bg-green-50",
                !canSelect && !occupied && !disabledInMulti && !meu && !loading && "cursor-not-allowed opacity-50"
              )}
              title={
                loading ? "A carregar..." :
                selected ? `Selecionado: ${num}` :
                meu ? `Meu: ${num}` :
                occupied ? (isAdminOrVendedor ? "Clique para ver quem jogou" : "Já ocupado") :
                `Número ${num}`
              }
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : meu && !selected ? '★' : num}
            </button>
          );
        })}
      </div>
      {total > numerosPorPagina && (
        <div className="flex justify-center gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina(p => Math.max(0, p - 1))}
            disabled={pagina === 0}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground min-w-[100px] text-center">
            {inicio + 1}-{fim} de {total}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina(p => p + 1)}
            disabled={fim >= total}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}

// Notificações Modal Component
function NotificacoesModal({
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
