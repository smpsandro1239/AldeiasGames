import React, { useState, useEffect } from 'react';
import { UIButton } from './ui-components';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white border-t border-gray-200 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-500">
      <p className="text-sm text-gray-600">
        Utilizamos cookies para melhorar a sua experiência e garantir a segurança das transações.
        Consulte a nossa <a href="#" className="text-indigo-600 underline">Política de Privacidade</a>.
      </p>
      <div className="flex gap-2">
        <UIButton variant="secondary" size="sm" onClick={() => setShow(false)}>Recusar</UIButton>
        <UIButton size="sm" onClick={() => {
          localStorage.setItem('cookie-consent', 'true');
          setShow(false);
        }}>Aceitar Todos</UIButton>
      </div>
    </div>
  );
}
