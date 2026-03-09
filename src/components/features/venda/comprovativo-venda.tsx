/**
 * ComprovativoVenda.tsx
 * Componente para geração de comprovativos de venda
 */

'use client';

import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  CheckCircle,
  Clock,
  XCircle,
  QrCode
} from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';

interface ItemVenda {
  id: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface Venda {
  id: string;
  valorTotal: number;
  metodoPagamento: string;
  estado: string;
  referencia?: string;
  telefone?: string;
  observacoes?: string;
  createdAt: string;
  vendedor: {
    id: string;
    nome: string;
    email?: string;
  };
  cliente?: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
  };
  aldeia: {
    id: string;
    nome: string;
    localizacao?: string;
    logoUrl?: string;
  };
  itens: ItemVenda[];
}

interface ComprovativoVendaProps {
  venda: Venda;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  simple?: boolean; // Versão simplificada para显示
}

export function ComprovativoVenda({ 
  venda, 
  onPrint, 
  onDownload, 
  onShare,
  simple = false 
}: ComprovativoVendaProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pago':
        return (
          <span className="inline-flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            Pago
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 text-yellow-600">
            <Clock className="w-4 h-4" />
            Pendente
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 text-red-600">
            <XCircle className="w-4 h-4" />
            Cancelado
          </span>
        );
      default:
        return estado;
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Comprovativo - ${venda.id.slice(0, 8)}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
                .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
              </style>
            </head>
            <body>${printRef.current.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
    onPrint?.();
  };

  const handleDownload = () => {
    // Simples download como texto
    const text = `
COMPROVATIVO DE VENDA
======================
${venda.aldeia.nome}

Número: ${venda.id.slice(0, 8)}
Data: ${formatDate(venda.createdAt)}
Estado: ${venda.estado.toUpperCase()}

Vendedor: ${venda.vendedor.nome}
${venda.cliente ? `Cliente: ${venda.cliente.nome}` : ''}

ITENS:
${venda.itens.map(item => `- ${item.descricao} x${item.quantidade} = €${item.subtotal.toFixed(2)}`).join('\n')}

TOTAL: €${venda.valorTotal.toFixed(2)}
Método: ${venda.metodoPagamento}
${venda.referencia ? `Referência: ${venda.referencia}` : ''}

Obrigado pela preferência!
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovativo-${venda.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    onDownload?.();
  };

  if (simple) {
    // Versão simples para display inline
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-lg">#{venda.id.slice(0, 8)}</p>
            <p className="text-sm text-gray-500">{formatDate(venda.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-xl">€{venda.valorTotal.toFixed(2)}</p>
            {getEstadoBadge(venda.estado)}
          </div>
        </div>
        
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-500">Vendedor:</span> {venda.vendedor.nome}</p>
          {venda.cliente && (
            <p><span className="text-gray-500">Cliente:</span> {venda.cliente.nome}</p>
          )}
          <p><span className="text-gray-500">Método:</span> {venda.metodoPagamento}</p>
        </div>

        {venda.itens.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {venda.itens.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.descricao} x{item.quantidade}</span>
                <span>€{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div ref={printRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 text-center">
          <div className="flex justify-center mb-2">
            {venda.aldeia.logoUrl ? (
              <img src={venda.aldeia.logoUrl} alt={venda.aldeia.nome} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">{venda.aldeia.nome.charAt(0)}</span>
              </div>
            )}
          </div>
          <h2 className="font-bold text-xl">{venda.aldeia.nome}</h2>
          {venda.aldeia.localizacao && (
            <p className="text-indigo-200 text-sm">{venda.aldeia.localizacao}</p>
          )}
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Comprovativo</p>
              <p className="font-mono font-bold text-lg">#{venda.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Data</p>
              <p className="font-medium">{formatDate(venda.createdAt)}</p>
            </div>
          </div>

          <div className="mb-4">
            {getEstadoBadge(venda.estado)}
          </div>

          {/* Vendedor/Cliente */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Vendedor</p>
              <p className="font-medium">{venda.vendedor.nome}</p>
            </div>
            {venda.cliente && (
              <div>
                <p className="text-gray-500">Cliente</p>
                <p className="font-medium">{venda.cliente.nome}</p>
              </div>
            )}
          </div>

          {/* Itens */}
          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <h3 className="font-medium mb-3">Itens</h3>
            <div className="space-y-2">
              {venda.itens.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.descricao}</p>
                    <p className="text-sm text-gray-500">x{item.quantidade}</p>
                  </div>
                  <p className="font-medium">€{item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold text-indigo-600">
              €{venda.valorTotal.toFixed(2)}
            </span>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Método de Pagamento</span>
              <span className="font-medium capitalize">{venda.metodoPagamento}</span>
            </div>
            {venda.referencia && (
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">Referência</span>
                <span className="font-mono">{venda.referencia}</span>
              </div>
            )}
            {venda.telefone && (
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">Telemóvel</span>
                <span className="font-mono">{venda.telefone}</span>
              </div>
            )}
          </div>

          {venda.observacoes && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm">
              <p className="text-yellow-800">{venda.observacoes}</p>
            </div>
          )}
        </div>

        {/* QR Code placeholder */}
        <div className="bg-gray-50 p-4 text-center">
          <div className="inline-block p-2 bg-white rounded-lg">
            <QrCode className="w-16 h-16 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Guarde este comprovativo
          </p>
        </div>

        {/* Footer */}
        <div className="bg-indigo-600 text-white p-4 text-center text-sm">
          <p>Obrigado pela sua preferência!</p>
          <p className="text-indigo-200 text-xs">Aldeias Games 2026</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 justify-center">
        <UIButton variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </UIButton>
        <UIButton variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </UIButton>
        <UIButton variant="outline" onClick={onShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Partilhar
        </UIButton>
      </div>
    </div>
  );
}
