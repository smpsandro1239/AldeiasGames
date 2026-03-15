import React, { useState } from 'react';

const RifaGrid = () => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (number) => {
    if (selectedNumbers.length >= 5) return;

    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      }
      return [...prev, number];
    });
  };

  const handleSubmit = async () => {
    if (selectedNumbers.length < 5) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/jogadas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numeros: selectedNumbers }),
      });
      const data = await response.json();
      console.log('Jogada registrada:', data);
      alert('Jogada registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar jogada:', error);
      alert('Erro ao registrar jogada. Tente novamente!');
    } finally {
      setIsSubmitting(false);
      setSelectedNumbers([]);
    }
  };

  return (
    <div className="grid grid-cols-10 gap-2 p-4">
      {[...Array(200)].map((_, index) => {
        const number = index + 1;
        const isSelected = selectedNumbers.includes(number);
        return (
          <button
            key={number}
            onClick={() => handleSelect(number)}
            className={`p-2 rounded-md bg-gray-200 hover:bg-gray-300 ${isSelected ? 'bg-blue-500 text-white' : ''}`}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
};

export default