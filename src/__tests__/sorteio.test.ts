import { createHash } from 'crypto';

function calcularResultado(tipo: string, config: any, seed: string) {
  const hash = createHash('sha256').update(seed).digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);
  if (tipo === 'poio_vaca') {
    const total = (config.linhas || 10) * (config.colunas || 10);
    const idx = num % total;
    return { linha: Math.floor(idx / config.colunas) + 1, coluna: (idx % config.colunas) + 1, quadrado: idx + 1 };
  }
  return { raw: num };
}

describe('Lógica de Sorteio', () => {
  const config = { linhas: 10, colunas: 10 };
  const seed = 'test-seed-1234567890-abcdef-ghijk';

  test('mesma seed gera sempre o mesmo resultado', () => {
    const res1 = calcularResultado('poio_vaca', config, seed);
    const res2 = calcularResultado('poio_vaca', config, seed);
    expect(res1).toEqual(res2);
  });

  test('resultado está dentro dos limites da grelha', () => {
    const res = calcularResultado('poio_vaca', config, seed);
    expect(res.linha).toBeGreaterThanOrEqual(1);
    expect(res.linha).toBeLessThanOrEqual(10);
    expect(res.coluna).toBeGreaterThanOrEqual(1);
    expect(res.coluna).toBeLessThanOrEqual(10);
  });

  test('hash SHA-256 é consistente', () => {
    const hash = createHash('sha256').update(seed).digest('hex');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});
