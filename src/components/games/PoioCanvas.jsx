import React, { useState } from 'react';
import './PoioCanvas.css';

const PoioCanvas = ({ images }) => {
  const [revealed, setRevealed] = useState(new Set());

  const handleClick = (index) => {
    setRevealed(prev => new Set(prev, [index]));
  };

  const isRevealed = (index) => revealed.has(index);

  // Helper to get 2D coordinates if needed later
  // const getCoordinates = (index) => [Math.floor(index / 20), index % 20];

  return (
    <div className="poio-canvas">
      <div className="poio-grid">
        {/* Create 400 cells */}
        {[...Array(400)].map((_, i) => (
          <div
            key={i}
            className={`poio-cell ${isRevealed(i) ? 'poio-cell--revealed' : ''}`}
            onClick={() => handleClick(i)}
            style={{
              backgroundImage: images[i] ? `url(${images[i]})` : 'url(/placeholder.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }`
          >
            {isRevealed(i) && <div className="poio-overlay">Revealed!</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoioCanvas;