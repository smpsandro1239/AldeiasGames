import React, { useRef, useState, useEffect, useCallback } from 'react';
import './Raspadinha.css';

interface RaspadinhaProps {
  prizeAmount?: number;
  onPrizeRevealed?: (amount: number) => void;
  onPurchaseComplete?: () => void;
}

const Raspadinha: React.FC<RaspadinhaProps> = ({
  prizeAmount = 0,
  onPrizeRevealed,
  onPurchaseComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  // Inicializa o canvas com camada de cobertura
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preenche com cor de cobertura (cinza)
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Adiciona texto indicativo
    ctx.font = '20px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('Raspe aqui', canvas.width / 2, canvas.height / 2);
  }, []);

  // Calcula percentual raspado
  const calculateScratchPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    return (transparentPixels / (pixels.length / 4)) * 100;
  }, []);

  // Lida com o evento de raspar
  const handleScratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.type === 'touchstart' || e.type === 'touchmove')
      ? (e as React.TouchEvent).touches[0].clientX - rect.left
      : (e as React.MouseEvent).clientX - rect.left;
    const y = (e.type === 'touchstart' || e.type === 'touchmove')
      ? (e as React.TouchEvent).touches[0].clientY - rect.top
      : (e as React.MouseEvent).clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    const percent = calculateScratchPercent();
    setScratchPercent(percent);

    if (percent > 90 && !isRevealed) {
      setIsRevealed(true);
      if (onPrizeRevealed) onPrizeRevealed(prizeAmount);
    }
  }, [isRevealed, prizeAmount, onPrizeRevealed, calculateScratchPercent]);

  // Compra da raspadinha (simula débito de saldo)
  const handlePurchase = async () => {
    try {
      const response = await fetch('/api/jogadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jogo: 'raspadinha', quantidade: 1 })
      });

      if (!response.ok) throw new Error('Falha na compra');

      setIsPurchased(true);
      if (onPurchaseComplete) onPurchaseComplete();

      // Aqui o backend deveria retornar o prêmio; usamos prizeAmount como exemplo
    } catch (error) {
      console.error('Erro ao comprar raspadinha:', error);
      alert('Não foi possível completar a compra. Verifique o seu saldo.');
    }
  };

  // Inicializa canvas ao montar
  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  return (
    <div className="raspadinha-container">
      <h2 className="raspadinha-title">Raspadinha</h2>

      {!isPurchased ? (
        <button className="raspadinha-buy-button" onClick={handlePurchase}>
          Comprar por 5,00€
        </button>
      ) : (
        <div className="raspadinha-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={300}
            height={150}
            className="raspadinha-canvas"
            onMouseDown={handleScratch}
            onMouseMove={(e) => { if (e.buttons === 1) handleScratch(e); }}
            onTouchStart={handleScratch}
            onTouchMove={handleScratch}
            aria-label="Área de raspagem - raspe para revelar prémio"
            role="button"
            tabIndex={0}
          />

          <div className="raspadinha-info">
            {isRevealed ? (
              <div className="raspadinha-prize">
                <strong>Prémio: {prizeAmount.toFixed(2)}€</strong>
              </div>
            ) : (
              <p>Raspe para descobrir o prémio</p>
            )}
            <p className="raspadinha-progress">{scratchPercent.toFixed(0)}% raspado</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Raspadinha;