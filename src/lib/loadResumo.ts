import { classifySize, summarize, type Participant, type Summary } from './analytics.ts';
export type { SizeRow, SectorRow, ScaleRow } from './analytics.ts';
export type DashboardData = Summary & { cidade: string; participantes: Participant[]; respostasExcluidas: number };
const SHEET_ID = '1LuJz5olkb3HWzEpX5eTuOm16EvosHae67-42BkRa3wo';
const RAW_SHEET_NAME = 'Respostas ao formulário 1';
type GViz = { table?: { rows?: { c: ({ v?: unknown } | null)[] }[] } };
const text = (value: unknown) => value == null ? '' : String(value).trim();
function colToIndex(col: string) {
  return [...col].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
}
const responseValues: Record<string, number> = {
  'Discordo Totalmente': 0, 'Discordo Parcialmente': 1, Neutro: 2,
  'Concordo Parcialmente': 3, 'Concordo Totalmente': 4,
};
function score(row: unknown[], columns: number[]): number | null {
  let total = 0;
  for (const column of columns) {
    const label = text(row[column]);
    if (!Object.hasOwn(responseValues, label)) return null;
    const value = responseValues[label];
    total += value;
  }
  return total;
}
const maturityColumns = Array.from({ length: 20 }, (_, i) => colToIndex('D') + i);
// Existing questionnaire mapping: X:AP and AR; AQ is not a scored item.
const innovationColumns = [...Array.from({ length: 19 }, (_, i) => colToIndex('X') + i), colToIndex('AR')];

export function parseResumo(rawText: string): DashboardData {
  const match = rawText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
  if (!match) throw new Error('Não foi possível interpretar a resposta do Google Sheets.');
  const json = JSON.parse(match[1]) as GViz;
  if (!json.table?.rows) throw new Error('A planilha não retornou uma tabela de respostas.');
  const participantes: Participant[] = [];
  let respostasExcluidas = 0;
  for (const entry of json.table.rows) {
    const row = entry.c.map(cell => cell?.v ?? null);
    const setor = text(row[colToIndex('AS')]);
    if (setor !== 'Comércio Serviços' && setor !== 'Indústria e Construção') continue;
    const comercio = setor === 'Comércio Serviços';
    if (text(row[colToIndex(comercio ? 'AW' : 'BB')]) !== 'Lages') continue;
    const maturidade = score(row, maturityColumns);
    const inovatividade = score(row, innovationColumns);
    if (maturidade === null || inovatividade === null) { respostasExcluidas++; continue; }
    const porte = classifySize(text(row[colToIndex(comercio ? 'AU' : 'AZ')]), setor);
    participantes.push({ setor, porte, maturidade, inovatividade });
  }
  return { cidade: 'Lages', participantes, respostasExcluidas, ...summarize(participantes) };
}

export async function loadResumo(): Promise<DashboardData> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(RAW_SHEET_NAME)}&headers=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erro HTTP ao carregar planilha: ${response.status}`);
  return parseResumo(await response.text());
}
