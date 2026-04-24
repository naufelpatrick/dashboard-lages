import {
  Activity,
  BarChart3,
  Building2,
  Factory,
  Gauge,
  MapPin,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { loadResumo, type DashboardData, type SizeRow } from "./lib/loadResumo";
import "./App.css";

const defaultData: DashboardData = {
  cidade: "Lages",
  totalRespostas: 0,
  maturidadeRegional: 0,
  escalaRegional: "-",
  inovatividadeRegional: 0,
  correlacao: 0,
  interpretacaoCorrelacao: "-",
  porSetor: [],
  porteComercio: [],
  porteIndustria: [],
  escalaData: [],
};

function formatMetric(value: number | null) {
  if (value === null || Number.isNaN(value)) return "-";
  return value.toFixed(2).replace(".", ",");
}

function metricOrZero(value: number | null) {
  return value ?? 0;
}

function hasData<T extends { respostas: number }>(row: T) {
  return row.respostas > 0;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className="card kpi-card">
      <div className="kpi-header">
        <div>
          <p className="kpi-title">{title}</p>
          <h3 className="kpi-value">{value}</h3>
          <p className="kpi-subtitle">{subtitle}</p>
        </div>
        <div className="icon-wrap">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="section-title">
      <div className="section-icon">
        <Icon size={18} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function DataTable({
  title,
  rows,
}: {
  title: string;
  rows: SizeRow[];
}) {
  return (
    <div className="card table-card">
      <h3 className="table-title">{title}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Porte</th>
              <th>Respostas</th>
              <th>Maturidade</th>
              <th>Inovatividade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.porte}>
                <td>{row.porte}</td>
                <td>{row.respostas}</td>
                <td>{formatMetric(row.maturidade)}</td>
                <td>{formatMetric(row.inovatividade)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card kpi-card skeleton-card">
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line large" />
      <div className="skeleton skeleton-line medium" />
    </div>
  );
}

function SkeletonChartCard() {
  return (
    <div className="card chart-card">
      <div className="skeleton skeleton-line medium" />
      <div className="skeleton skeleton-line long" />
      <div className="skeleton skeleton-chart" />
    </div>
  );
}

function SkeletonTableCard() {
  return (
    <div className="card table-card">
      <div className="skeleton skeleton-line medium" />
      <div className="skeleton skeleton-line long" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="app-shell">
      <div className="container">
        <header className="hero hero-loading">
          <div>
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-title short-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text medium-text" />
          </div>

          <div className="hero-side">
            <div className="hero-mini-card">
              <div className="skeleton skeleton-line medium" />
              <div className="skeleton skeleton-line short" />
            </div>
            <div className="hero-mini-card">
              <div className="skeleton skeleton-line medium" />
              <div className="skeleton skeleton-line short" />
            </div>
            <div className="skeleton skeleton-button" />
          </div>
        </header>

        <section className="kpi-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </section>

        <section className="grid-two">
          <SkeletonChartCard />
          <SkeletonChartCard />
        </section>

        <section className="grid-two">
          <SkeletonTableCard />
          <SkeletonTableCard />
        </section>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run(showLoading = false, manual = false) {
      if (showLoading && mounted) setLoading(true);
      if (manual && mounted) setRefreshing(true);

      try {
        const result = await loadResumo();

        if (!mounted) return;

        setData(result);
        setError("");
        setLastUpdated(
          new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Não foi possível carregar a planilha.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    run(true);

    const interval = window.setInterval(() => {
      run(false);
    }, 5 * 60 * 1000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const result = await loadResumo();
      setData(result);
      setError("");
      setLastUpdated(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar a planilha.");
    } finally {
      setRefreshing(false);
    }
  }

  const setorChartData = data.porSetor
    .filter(hasData)
    .map((item) => ({
      setor: item.setor,
      maturidade: metricOrZero(item.maturidade),
      inovatividade: metricOrZero(item.inovatividade),
    }));

  const escalaChartData = data.escalaData.filter((item) => item.total > 0);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="container">
          <div className="card loading-card">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="container">
        <header className="hero">
          <div className="hero-main">
            <span className="badge">Observatório Digital de Lages</span>
            <h1>Maturidade Digital e Inovatividade Organizacional</h1>
            <p>
              Dashboard regional conectado à planilha da pesquisa, com foco em
              Lages, setor, porte e correlação entre maturidade digital e
              inovatividade.
            </p>
          </div>

          <div className="hero-side">
            <div className="hero-mini-card">
              <p>Localidade</p>
              <strong>{data.cidade}</strong>
            </div>

            <div className="hero-mini-card">
              <p>Última atualização</p>
              <strong>{lastUpdated || "Agora"}</strong>
            </div>

            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "spin-icon" : ""} />
              {refreshing ? "Atualizando..." : "Atualizar agora"}
            </button>
          </div>
        </header>

        <section className="kpi-grid">
          <KpiCard
            title="Cidade"
            value={data.cidade}
            subtitle="Recorte do estudo"
            icon={MapPin}
          />
          <KpiCard
            title="Respostas válidas"
            value={String(data.totalRespostas)}
            subtitle="Organizações de Lages"
            icon={Users}
          />
          <KpiCard
            title="Maturidade Digital"
            value={formatMetric(data.maturidadeRegional)}
            subtitle="Índice médio regional"
            icon={Gauge}
          />
          <KpiCard
            title="Nível de Maturidade Digital"
            value={data.escalaRegional}
            subtitle="Classificação atual"
            icon={BarChart3}
          />
          <KpiCard
            title="Índice de Inovatividade"
            value={formatMetric(data.inovatividadeRegional)}
            subtitle="Índice médio regional"
            icon={TrendingUp}
          />
          <KpiCard
            title="Correlação"
            value={formatMetric(data.correlacao)}
            subtitle={data.interpretacaoCorrelacao}
            icon={Activity}
          />
        </section>

        <section className="grid-two">
          <div className="card highlight-card">
            <SectionTitle
              icon={Gauge}
              title="Leitura regional"
              description="Síntese executiva do estágio atual das organizações de Lages."
            />
            <div className="highlight-content">
              <div>
                <p className="highlight-label">Nível de Maturidade atual</p>
                <h3 className="highlight-number">{data.escalaRegional}</h3>
                <p className="highlight-text">
                  Maturidade regional:{" "}
                  <strong>{formatMetric(data.maturidadeRegional)}</strong> ·
                  Inovatividade:{" "}
                  <strong>{formatMetric(data.inovatividadeRegional)}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="card highlight-card purple">
            <SectionTitle
              icon={Activity}
              title="Correlação observada"
              description="Associação entre maturidade digital e inovatividade."
            />
            <div className="highlight-content">
              <div>
                <p className="highlight-label">Coeficiente de Pearson</p>
                <h3 className="highlight-number">
                  {formatMetric(data.correlacao)}
                </h3>
                <p className="highlight-text">
                  Interpretação atual:{" "}
                  <strong>{data.interpretacaoCorrelacao}</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid-two">
          <div className="card chart-card">
            <SectionTitle
              icon={Building2}
              title="Comparativo por setor"
              description="O gráfico exibe apenas setores com respostas válidas."
            />
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={setorChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="setor" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="maturidade"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="inovatividade"
                    fill="#8b5cf6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card chart-card">
            <SectionTitle
              icon={Factory}
              title="Distribuição da escala"
              description="Faixas de maturidade com ocorrência na amostra."
            />
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={escalaChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nivel" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                    {escalaChartData.map((item) => (
                      <Cell key={item.nivel} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid-two">
          <DataTable
            title="Porte — Comércio Serviços"
            rows={data.porteComercio}
          />
          <DataTable
            title="Porte — Indústria e Construção"
            rows={data.porteIndustria}
          />
        </section>

        <section className="grid-two equal-cards">
          <div className="card info-card">
            <SectionTitle
              icon={BarChart3}
              title="Leitura metodológica"
              description="Resumo interpretativo da base atual."
            />
            <ul className="insight-list">
              <li>
                O índice regional de maturidade aponta nível{" "}
                <strong>{data.escalaRegional}</strong>.
              </li>
              <li>
                O índice regional de inovatividade está em{" "}
                <strong>{formatMetric(data.inovatividadeRegional)}</strong>.
              </li>
              <li>
                A relação entre maturidade e inovatividade é{" "}
                <strong>{data.interpretacaoCorrelacao}</strong>.
              </li>
            </ul>
          </div>

          <div className="card info-card">
            <SectionTitle
              icon={TrendingUp}
              title="Painel conectado"
              description="Os dados são lidos automaticamente da planilha."
            />
            <ul className="insight-list">
              <li>Novas respostas atualizam os indicadores.</li>
              <li>Setor e porte acompanham a base real.</li>
              <li>Atualização automática a cada 5 minutos.</li>
            </ul>
          </div>
        </section>

        <footer className="footer-note">
          Desenvolvido por Patrick Naufel • Pesquisa de Mestrado • PPGSP • UNIPLAC 
        </footer>
      </div>
    </div>
  );
}