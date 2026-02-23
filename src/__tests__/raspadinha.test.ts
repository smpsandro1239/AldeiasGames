import crypto from 'crypto';

function determinePrize(
  premiosConfig: { nome: string; percentagem: number; valor: number }[],
  stockInicial: number,
  cardNumber: number
) {
  let currentCard = 1;
  for (const premio of premiosConfig) {
    const quantity = Math.round(premio.percentagem * stockInicial / 100);
    const endCard = currentCard + quantity - 1;
    if (cardNumber >= currentCard && cardNumber <= endCard) {
      return premio;
    }
    currentCard = endCard + 1;
  }
  return null;
}

describe('Lógica de Raspadinhas', () => {
  const premios = [
    { nome: 'Grande Prémio', percentagem: 1, valor: 100 },
    { nome: 'Prémio Médio', percentagem: 5, valor: 20 },
    { nome: 'Prémio Pequeno', percentagem: 10, valor: 5 }
  ];
  const stock = 1000;

  test('atribui Grande Prémio para cartões iniciais', () => {
    // 1% de 1000 = 10 cartões
    const result = determinePrize(premios, stock, 5);
    expect(result?.nome).toBe('Grande Prémio');
  });

  test('atribui null para cartões fora do range de prémios', () => {
    // Total prémios = 1+5+10 = 16% = 160 cartões
    const result = determinePrize(premios, stock, 500);
    expect(result).toBeNull();
  });

  test('distribuição é determinística', () => {
    const res1 = determinePrize(premios, stock, 50);
    const res2 = determinePrize(premios, stock, 50);
    expect(res1).toEqual(res2);
  });
});
