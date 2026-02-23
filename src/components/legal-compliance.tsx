import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Aldeia } from '@/types/project';

interface LegalComplianceProps {
  organizacao: Aldeia | null;
  className?: string;
}

export const LegalCompliance: React.FC<LegalComplianceProps> = ({ organizacao, className }) => {
  if (!organizacao) return null;

  const getComplianceText = () => {
    const nome = organizacao.nome || 'esta organização';
    const tipo = organizacao.tipoOrganizacao || 'aldeia';

    let baseText = `Este sorteio é organizado por ${nome}, uma entidade devidamente registada na plataforma Aldeias Games.`;

    if (organizacao.autorizacaoCM) {
      baseText += ` Possui autorização da Câmara Municipal para a realização de sorteios de angariação de fundos.`;
    }

    if (organizacao.numeroAlvara) {
      baseText += ` Licença/Alvará nº ${organizacao.numeroAlvara}.`;
    }

    if (tipo === 'escola' || tipo === 'associacao_pais') {
      baseText += ` Os fundos angariados revertem integralmente para o apoio às atividades educativas e melhoria das instalações escolares.`;
    }

    return baseText;
  };

  return (
    <div className={cn("p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-3", className)}>
      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm">
        <Shield className="h-4 w-4" />
        <h4>CONFORMIDADE LEGAL & TRANSPARÊNCIA</h4>
      </div>

      <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed italic">
        "{getComplianceText()}"
      </p>

      <div className="pt-2 border-t border-blue-200 dark:border-blue-800/50 flex items-start gap-2">
        <Info className="h-3 w-3 text-blue-600 mt-0.5" />
        <p className="text-[10px] text-blue-600 dark:text-blue-500">
          De acordo com o Artigo 159º do Código Civil e o Decreto-Lei nº 422/89 (Lei do Jogo), este sorteio enquadra-se na modalidade de sorteio de modalidade afim do jogo de fortuna ou azar, destinado à angariação de fundos para fins de beneficência ou assistência comunitária.
        </p>
      </div>
    </div>
  );
};

export const CookieBanner: React.FC = () => {
  const [accepted, setAccepted] = React.useState(true);

  React.useEffect(() => {
    const consent = localStorage.getItem('cookie-consent-2026');
    if (!consent) setAccepted(false);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent-2026', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-8 md:max-w-md animate-in slide-in-from-bottom-8">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-2xl rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">Privacidade & Cookies</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Utilizamos cookies para garantir a segurança da sua conta e melhorar a sua experiência na plataforma Aldeias Games. Ao continuar, concorda com a nossa política de privacidade.
            </p>
            <div className="mt-4 flex gap-3">
              <Button size="sm" onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
                Aceitar e Continuar
              </Button>
              <Button size="sm" variant="ghost" className="text-xs">
                Saber mais
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
