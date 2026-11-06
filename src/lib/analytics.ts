export const LEVELS = [
  { nivel: 'Não iniciado', faixa: '< 20', color: '#dc2626', min: 0, max: 20 },
  { nivel: 'Iniciante', faixa: '20–30', color: '#ea580c', min: 20, max: 30 },
  { nivel: 'Consciente', faixa: '31–45', color: '#ca8a04', min: 30, max: 45 },
  { nivel: 'Gerenciado', faixa: '46–60', color: '#2563eb', min: 45, max: 60 },
  { nivel: 'Integrado', faixa: '61–70', color: '#7c3aed', min: 60, max: 70 },
  { nivel: 'Otimizado', faixa: '> 70', color: '#16a34a', min: 70, max: 80 },
] as const;
export const SIZES = ['MEI', 'Microempresa', 'Pequena', 'Média', 'Grande', 'Não classificado'] as const;
export type CompanySize = typeof SIZES[number];
export type Participant = { setor: string; porte: CompanySize; maturidade: number; inovatividade: number };
export type SizeRow = { porte: string; respostas: number; maturidade: number | null; inovatividade: number | null };
export type SectorRow = Omit<SizeRow, 'porte'> & { setor: string };
export type ScaleRow = { nivel: string; total: number; percentual: number; color: string };
export const average = (values: number[]): number | null => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const round = (value: number | null) => value === null ? null : Number(value.toFixed(2));

export function deriveScale(score: number): string {
  if (score < 20) return 'Não iniciado';
  if (score <= 30) return 'Iniciante';
  if (score <= 45) return 'Consciente';
  if (score <= 60) return 'Gerenciado';
  if (score <= 70) return 'Integrado';
  return 'Otimizado';
}

export function classifySize(raw: string, sector: string): CompanySize {
  const label = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  // Use the selected survey category, never infer legal MEI status from a headcount.
  if (/^ate 1 (colaborador|empregado)$/.test(label)) return 'MEI';
  if (sector === 'Comércio Serviços') {
    if (/^ate 9 /.test(label)) return 'Microempresa';
    if (/^10 a 49 /.test(label)) return 'Pequena';
    if (/^50 a 99 /.test(label)) return 'Média';
    if (/^100 ou mais /.test(label)) return 'Grande';
  } else if (sector === 'Indústria e Construção') {
    if (/^ate 19 /.test(label)) return 'Microempresa';
    if (/^20 a 99 /.test(label)) return 'Pequena';
    if (/^100 a 499 /.test(label)) return 'Média';
    if (/^500 ou mais /.test(label)) return 'Grande';
  }
  return 'Não classificado';
}

function correlation(rows: Participant[]): number | null {
  if (rows.length < 2) return null;
  const mx = average(rows.map(r => r.maturidade))!;
  const my = average(rows.map(r => r.inovatividade))!;
  let xy = 0, xx = 0, yy = 0;
  for (const r of rows) {
    const x = r.maturidade - mx, y = r.inovatividade - my;
    xy += x * y; xx += x * x; yy += y * y;
  }
  return xx && yy ? xy / Math.sqrt(xx * yy) : null;
}

export function summarize(rows: Participant[]) {
  const scores = rows.map(r => r.maturidade).sort((a, b) => a - b);
  const n = scores.length;
  const mean = average(scores);
  const r = correlation(rows);
  const metric = (subset: Participant[]) => ({
    respostas: subset.length,
    maturidade: round(average(subset.map(r => r.maturidade))),
    inovatividade: round(average(subset.map(r => r.inovatividade))),
  });
  const sizes = (subset: Participant[]): SizeRow[] => SIZES.map(porte => ({ porte, ...metric(subset.filter(r => r.porte === porte)) }));
  const escalaData: ScaleRow[] = LEVELS.map(level => {
    const total = rows.filter(r => deriveScale(r.maturidade) === level.nivel).length;
    return { ...level, total, percentual: n ? total / n * 100 : 0 };
  });
  return {
    totalRespostas: n,
    maturidadeRegional: round(mean),
    inovatividadeRegional: round(average(rows.map(r => r.inovatividade))),
    escalaRegional: mean === null ? 'Sem dados' : deriveScale(mean),
    correlacao: round(r),
    interpretacaoCorrelacao: r === null ? 'Não calculável' : Math.abs(r) < .2 ? 'Muito fraca' : Math.abs(r) < .4 ? 'Fraca' : Math.abs(r) < .6 ? 'Moderada' : Math.abs(r) < .8 ? 'Forte' : 'Muito forte',
    porSetor: ['Comércio Serviços', 'Indústria e Construção'].map(setor => ({ setor, ...metric(rows.filter(r => r.setor === setor)) })),
    porteComercio: sizes(rows.filter(r => r.setor === 'Comércio Serviços')),
    porteIndustria: sizes(rows.filter(r => r.setor === 'Indústria e Construção')),
    porPorte: sizes(rows),
    escalaData,
    mediana: n ? (scores[Math.floor((n - 1) / 2)] + scores[Math.floor(n / 2)]) / 2 : null,
    desvioPadrao: n > 1 ? Math.sqrt(scores.reduce((sum, s) => sum + (s - mean!) ** 2, 0) / (n - 1)) : null,
    niveisIniciais: escalaData[0].total + escalaData[1].total,
    niveisSuperiores: escalaData[4].total + escalaData[5].total,
    distribuicaoPorte: sizes(rows).filter(s => s.respostas).map(s => ({
      porte: s.porte, respostas: s.respostas,
      ...Object.fromEntries(LEVELS.map(l => [l.nivel, rows.filter(r => r.porte === s.porte && deriveScale(r.maturidade) === l.nivel).length / s.respostas * 100])),
    })),
    dispersao: Array.from(rows.reduce((map, row) => {
      const key = `${row.maturidade}:${row.inovatividade}`;
      const current = map.get(key);
      if (current) current.total++;
      else map.set(key, { maturidade: row.maturidade, inovatividade: row.inovatividade, total: 1 });
      return map;
    }, new Map<string, { maturidade: number; inovatividade: number; total: number }>()).values()),
  };
}
export type Summary = ReturnType<typeof summarize>;
