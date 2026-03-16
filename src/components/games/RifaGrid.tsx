import React, { useState } from 'react';
import { colors } from '@/styles/tokens/colors';

interface RifaGridProps {
  numbers: number[];
  onNumberSelect?: (number: number) => void;
}

export default function RifaGrid({ numbers = [], onNumberSelect }: RifaGridProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const handleNumberClick = (number: number) => {
    if (onNumberSelect) {
      onNumberSelect(number);
    }
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      }
      return [...prev, number];
    });
  };

  const isSelected = (number: number) => selectedNumbers.includes(number);

  return (
    <div className="rifa-grid">
      <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
        {numbers.map((number) => (
          <button
            key={number}
            onClick={() => handleNumberClick(number)}
            className={`relative transition-all duration-200 ${
              isSelected(number)
                ? 'bg-amber-500 text-white'
                : 'bg-gray-700 text-white hover:bg-amber-600'
            }`}
          >
            <span className="text-lg font-bold">
              {number.toString().padStart(2, '0')}
            </span>
            {isSelected(number) && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}