import React from 'react';
import { colors } from '@/styles/tokens/colors';

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Aldeias Games
        </h1>
        <p className="text-lg">
          Plataforma de jogos tradicionais portugueses
        </p>
        <a href="#"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded transition-colors">
          Começar a Jogar
        </a>
      </div>
    </section>
  );
};

export default HeroSection;