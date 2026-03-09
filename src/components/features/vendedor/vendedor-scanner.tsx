/**
 * VendedorScanner.tsx
 * Scanner QR Code para Vendedor
 * Utilizado para validar prémios, registar vendas, etc.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Flashlight,
  Keyboard
} from 'lucide-react';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';

interface VendedorScannerProps {
  aldeiaId: string;
  onScan?: (data: string) => void;
  tipo?: 'validacao' | 'venda' | 'registo';
}

type ScanResult = {
  data: string;
  timestamp: Date;
  valido?: boolean;
  mensagem?: string;
};

export function VendedorScanner({ aldeiaId, onScan, tipo = 'validacao' }: VendedorScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerId = 'vendedor-qr-scanner';

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setLastResult(null);
    
    try {
      // Verificar permissões primeiro
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      scannerRef.current = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Erros de scan são normais, ignoramos
          // console.log('Scan error:', errorMessage);
        }
      );
      
      setIsScanning(true);
      setScannerReady(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao iniciar câmara';
      setError(errorMsg);
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        // Ignorar erros ao limpar
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScannerReady(false);
  };

  const handleScan = async (data: string) => {
    // Pausar scanning temporariamente
    await stopScanner();
    
    const result: ScanResult = {
      data,
      timestamp: new Date(),
    };
    
    // Validar o código scaneado via API
    setLoading(true);
    try {
      const response = await fetch('/api/vendedor/validar-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          qrData: data, 
          aldeiaId, 
          tipo 
        }),
      });
      
      const validation = await response.json();
      result.valido = validation.valido;
      result.mensagem = validation.mensagem || (validation.valido ? 'Válido' : 'Inválido');
    } catch (err) {
      result.valido = false;
      result.mensagem = 'Erro ao validar código';
    }
    
    setLastResult(result);
    setLoading(false);
    
    // Callback opcional
    if (onScan) {
      onScan(data);
    }
  };

  const resetScanner = () => {
    setLastResult(null);
    setError(null);
    startScanner();
  };

  const getTipoLabel = () => {
    switch (tipo) {
      case 'validacao': return 'Validação de Prémio';
      case 'venda': return 'Registo de Venda';
      case 'registo': return 'Registo de Cliente';
      default: return 'Scanner';
    }
  };

  return (
    <div className="space-y-4">
      <UICard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{getTipoLabel()}</h3>
          </div>
          <UIBadge variant={isScanning ? 'default' : 'secondary'}>
            {isScanning ? 'Ativo' : 'Inativo'}
          </UIBadge>
        </div>

        {!isScanning && !lastResult && !error && (
          <div className="text-center py-8">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Clique em &quot;Iniciar Scanner&quot; para começar a ler códigos QR
            </p>
            <UIButton onClick={startScanner}>
              <Camera className="w-4 h-4 mr-2" />
              Iniciar Scanner
            </UIButton>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <p className="text-red-500 mb-4">{error}</p>
            <UIButton onClick={startScanner} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </UIButton>
          </div>
        )}

        {isScanning && (
          <div>
            <div id={scannerId} className="w-full" />
            <div className="mt-4 text-center">
              <UIButton 
                onClick={stopScanner} 
                variant="outline"
                className="w-full"
              >
                <CameraOff className="w-4 h-4 mr-2" />
                Parar Scanner
              </UIButton>
            </div>
          </div>
        )}

        {lastResult && (
          <div className="text-center py-4">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              lastResult.valido ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {lastResult.valido ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <h4 className={`text-lg font-semibold mb-2 ${
              lastResult.valido ? 'text-green-600' : 'text-red-600'
            }`}>
              {lastResult.valido ? 'Código Válido' : 'Código Inválido'}
            </h4>
            
            <p className="text-muted-foreground mb-2">
              {lastResult.mensagem}
            </p>
            
            <div className="bg-muted p-2 rounded text-sm font-mono mb-4 break-all">
              {lastResult.data}
            </div>
            
            <p className="text-xs text-muted-foreground mb-4">
              {lastResult.timestamp.toLocaleString('pt-PT')}
            </p>
            
            <UIButton onClick={resetScanner} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Escanear Novo Código
            </UIButton>
          </div>
        )}
      </UICard>
      
      {loading && (
        <div className="text-center py-4">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground mt-2">A validar código...</p>
        </div>
      )}
    </div>
  );
}
