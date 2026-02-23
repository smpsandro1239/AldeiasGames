import React from 'react';
import { Trophy } from 'lucide-react';

export function LoadingScreen({ message = "A carregar..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <div className="bg-indigo-600 p-4 rounded-xl animate-bounce">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}
