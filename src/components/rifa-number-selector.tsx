import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Jogo, Participacao } from '@/types/project';

export function RifaNumberSelector({
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
