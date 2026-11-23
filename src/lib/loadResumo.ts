import { summarize, type Participant, type Summary } from './analytics.ts';
import snapshot from '../data/pesquisa-2026.json' with { type: 'json' };
export type { SizeRow, SectorRow, ScaleRow } from './analytics.ts';
export type DashboardData = Summary & { cidade: string; participantes: Participant[]; respostasExcluidas: number };
/** Base final anonimizada de 82 organizações, congelada em 23/11/2026.
 * Nenhuma requisição à planilha ou ao formulário é realizada pelo painel.
 */
export async function loadResumo(): Promise<DashboardData> {
  const participantes = snapshot.participantes as Participant[];
  if (participantes.length !== 82) throw new Error('A base final deve conter exatamente 82 registros.');
  return { cidade: 'Lages', participantes, respostasExcluidas: 0, ...summarize(participantes) };
}
