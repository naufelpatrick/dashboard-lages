import { useMemo, useState, type ReactNode } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { LEVELS, summarize, type SizeRow } from './lib/analytics';
import type { DashboardData } from './lib/loadResumo';

const number = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const percent = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const chartNumber = (value: unknown) => typeof value === 'number' ? number(value) : String(value ?? '');
function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="card analytics-panel"><h3>{title}</h3><p className="analytics-description">{description}</p>{children}</section>;
}
function Comparison({ rows, field }: { rows: (SizeRow | { setor: string; respostas: number; maturidade: number | null; inovatividade: number | null })[]; field: 'porte' | 'setor' }) {
  const available = rows.filter(r => r.respostas > 0);
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 280 }}>
    <BarChart data={available} layout="vertical" margin={{ left: 0, right: 18, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
      <XAxis type="number" domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} />
      <YAxis type="category" dataKey={field} width={field === 'porte' ? 108 : 132} tick={{ fontSize: 11 }} />
      <Tooltip formatter={chartNumber} /><Legend />
      <Bar dataKey="maturidade" name="Maturidade" fill="#4f8e2c" radius={[0, 5, 5, 0]} />
      <Bar dataKey="inovatividade" name="Inovatividade" fill="#1f5f99" radius={[0, 5, 5, 0]} />
    </BarChart>
  </ResponsiveContainer></div>;
}
function ResultsTable({ rows }: { rows: SizeRow[] }) {
  return <div className="table-wrap"><table>
    <caption className="sr-only">Resultados por porte; ambos os índices variam de 0 a 80 pontos</caption>
    <thead><tr><th scope="col">Porte</th><th scope="col">n</th><th scope="col">Maturidade</th><th scope="col">Inovatividade</th></tr></thead>
    <tbody>{rows.filter(r => r.porte !== 'Não classificado' || r.respostas > 0).map(r => <tr key={r.porte}><th scope="row">{r.porte}</th><td>{r.respostas}</td><td>{number(r.maturidade)}</td><td>{number(r.inovatividade)}</td></tr>)}</tbody>
  </table></div>;
}
export default function IndicatorsPage({ data }: { data: DashboardData }) {
  const [sector, setSector] = useState('Todos');
  const summary = useMemo(() => summarize(data.participantes.filter(r => sector === 'Todos' || r.setor === sector)), [data.participantes, sector]);
  const n = summary.totalRespostas;
  const share = (count: number) => n ? percent(count / n * 100) : '—';
  return <>
    <section className="page-heading card analytics-heading">
      <div><h2>Indicadores analíticos</h2><p>Distribuição das notas e comparações entre as organizações participantes de Lages.</p></div>
      <label className="sector-filter">Setor analisado<select value={sector} onChange={e => setSector(e.target.value)}><option>Todos</option><option>Comércio Serviços</option><option>Indústria e Construção</option></select></label>
      <p className="analytics-note">{n} respostas válidas neste recorte · índices de 0 a 80 pontos · dados atualizados com a coleta.</p>
      {data.respostasExcluidas > 0 && <p className="analytics-note">{data.respostasExcluidas} respostas de Lages com itens ausentes ou não reconhecidos foram excluídas dos cálculos.</p>}
    </section>
    {!n ? <section className="card"><h3>Sem respostas válidas neste recorte</h3><p>Selecione outro setor para visualizar os resultados.</p></section> : <>
      <section className="analytics-kpis" aria-label="Indicadores de distribuição">
        {[
          ['Mediana do IMD', number(summary.mediana), 'Nota central da distribuição; escala 0–80.'],
          ['Desvio padrão do IMD', number(summary.desvioPadrao), 'Dispersão amostral das notas, em pontos.'],
          ['Níveis iniciais', share(summary.niveisIniciais), `${summary.niveisIniciais} de ${n} · Não iniciado + Iniciante.`],
          ['Níveis superiores', share(summary.niveisSuperiores), `${summary.niveisSuperiores} de ${n} · Integrado + Otimizado.`],
        ].map(([title, value, description]) => <article className="card" key={title}><h3 className="kpi-title">{title}</h3><p className="kpi-value">{value}</p><p className="kpi-subtitle">{description}</p></article>)}
      </section>
      <div className="grid-two">
        <Panel title="Distribuição dos níveis de maturidade" description="Participação de cada faixa operacional do IMD na amostra selecionada.">
          <div className="chart-wrap donut-chart" role="img" aria-label={`Distribuição de ${n} respostas pelos seis níveis de maturidade; valores na tabela abaixo.`}>
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 280 }}><PieChart><Pie data={summary.escalaData.filter(r => r.total)} dataKey="total" nameKey="nivel" innerRadius="48%" outerRadius="78%" paddingAngle={2}>
              {summary.escalaData.filter(r => r.total).map(r => <Cell key={r.nivel} fill={r.color} />)}
            </Pie><Tooltip formatter={(value, name) => [`${value} empresas (${share(Number(value))})`, name]} /></PieChart></ResponsiveContainer>
            <div className="donut-center"><strong>{n}</strong><span>respostas</span></div>
          </div>
          <div className="table-wrap"><table><thead><tr><th scope="col">Nível</th><th scope="col">n</th><th scope="col">%</th></tr></thead><tbody>{summary.escalaData.map(r => <tr key={r.nivel}><th scope="row"><span className="level-dot" style={{ background: r.color }} />{r.nivel}</th><td>{r.total}</td><td>{percent(r.percentual)}</td></tr>)}</tbody></table></div>
        </Panel>
        <Panel title="Comparativo por porte" description="Médias de maturidade e inovatividade por porte, classificadas conforme o setor na dissertação. Escala 0–80.">
          <Comparison rows={summary.porPorte} field="porte" />
          <ResultsTable rows={summary.porPorte} />
          <p className="analytics-note">n = participantes. Grupos sem respostas aparecem com traço na tabela; grupos pequenos exigem cautela na comparação.</p>
        </Panel>
      </div>
      <div className="grid-two">
        <Panel title="Níveis de maturidade por porte" description="Percentual dentro de cada porte. Cada barra representa 100% das respostas daquele grupo.">
          <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 280 }}><BarChart data={summary.distribuicaoPorte} layout="vertical" margin={{ right: 18 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} /><YAxis type="category" dataKey="porte" width={108} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => percent(Number(v))} /><Legend />
            {LEVELS.map(l => <Bar key={l.nivel} dataKey={l.nivel} stackId="levels" fill={l.color} />)}
          </BarChart></ResponsiveContainer></div>
          <details className="analytics-details"><summary>Ver percentuais em tabela</summary><div className="table-wrap"><table><thead><tr><th scope="col">Porte</th><th scope="col">n</th>{LEVELS.map(l => <th scope="col" key={l.nivel}>{l.nivel}</th>)}</tr></thead><tbody>{summary.distribuicaoPorte.map(r => <tr key={r.porte}><th scope="row">{r.porte}</th><td>{r.respostas}</td>{LEVELS.map(l => <td key={l.nivel}>{percent(Number(r[l.nivel as keyof typeof r]))}</td>)}</tr>)}</tbody></table></div></details>
        </Panel>
        <Panel title="Maturidade × inovatividade" description="Pares de notas sem identificação das organizações. Pontos maiores representam mais respostas com o mesmo par de notas.">
          <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 280 }}><ScatterChart margin={{ top: 15, right: 20, bottom: 25, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" dataKey="maturidade" name="Maturidade" domain={[0, 80]} label={{ value: 'Maturidade (0–80)', position: 'bottom', offset: 5 }} /><YAxis type="number" dataKey="inovatividade" name="Inovatividade" domain={[0, 80]} width={40} /><ZAxis type="number" dataKey="total" name="Respostas" range={[50, 200]} /><Tooltip formatter={chartNumber} /><Scatter name="Pares de notas" data={summary.dispersao} fill="#1f5f99" fillOpacity={0.65} />
          </ScatterChart></ResponsiveContainer></div>
          <p className="analytics-note">Eixo vertical: inovatividade (0–80). Pearson: <strong>{number(summary.correlacao)}</strong> · {summary.interpretacaoCorrelacao}. Associação não implica causalidade.</p>
        </Panel>
      </div>
      <div className="grid-two">
        <Panel title="Comparativo por setor" description="Médias na escala 0–80; o filtro de setor também se aplica a esta visualização.">
          <Comparison rows={summary.porSetor} field="setor" />
          <ul className="sample-counts">{summary.porSetor.filter(r => r.respostas).map(r => <li key={r.setor}>{r.setor}: <strong>n = {r.respostas}</strong> · IMD {number(r.maturidade)} · Inovatividade {number(r.inovatividade)}</li>)}</ul>
        </Panel>
        <Panel title="Critérios de porte" description="Tabela 3 da dissertação. O enquadramento respeita a categoria selecionada no questionário e o setor.">
          <div className="table-wrap"><table><thead><tr><th scope="col">Porte</th><th scope="col">Comércio e Serviços</th><th scope="col">Indústria e Construção</th></tr></thead><tbody>
            {[
              ['MEI', 'Até 1', 'Até 1'], ['Microempresa', 'Até 9', 'Até 19'], ['Pequena', '10–49', '20–99'], ['Média', '50–99', '100–499'], ['Grande', '100 ou mais', '500 ou mais'],
            ].map(row => <tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td></tr>)}
          </tbody></table></div>
          <p className="analytics-note">Faixas em número de empregados. MEI é apresentado segundo a categoria da coleta; quantidade de empregados isoladamente não comprova enquadramento legal.</p>
          <p className="analytics-note">As médias gerais são calculadas por organização, sem dar o mesmo peso a grupos de tamanhos diferentes. A amostra é por conveniência e não representa estatisticamente todas as empresas de Lages.</p>
        </Panel>
      </div>
      <div className="grid-two">
        {sector !== 'Indústria e Construção' && <Panel title="Porte — Comércio e Serviços" description="Resultados por categoria na escala 0–80."><ResultsTable rows={summary.porteComercio} /></Panel>}
        {sector !== 'Comércio Serviços' && <Panel title="Porte — Indústria e Construção" description="Resultados por categoria na escala 0–80."><ResultsTable rows={summary.porteIndustria} /></Panel>}
      </div>
    </>}
  </>;
}
