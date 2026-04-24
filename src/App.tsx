import {
  Activity,
  BarChart3,
  Building2,
  ChevronDown,
  Factory,
  Gauge,
  HelpCircle,
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
import { useEffect, useState, type ElementType } from "react";
import { loadResumo, type DashboardData, type SizeRow } from "./lib/loadResumo";
import logoPPGSP from "./assets/logo_ppgsp_home300.png";
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

const helpTexts = {
  cidade: "Recorte geográfico considerado na análise atual do painel.",
  respostas:
    "Quantidade de respostas válidas consideradas no cálculo dos indicadores.",
  maturidade:
    "Índice médio que representa o preparo digital das organizações analisadas.",
  inovatividade:
    "Índice que expressa a capacidade das organizações de inovar em produtos, serviços, processos ou gestão.",
  correlacao:
    "Coeficiente de Pearson usado para medir a relação estatística entre maturidade digital e inovatividade.",
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

function TooltipLabel({ title, help }: { title: string; help: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="tooltip-label">
      <span>{title}</span>

      <button
        className="tooltip-trigger"
        onClick={() => setOpen(!open)}
        type="button"
        aria-label={`Ajuda sobre ${title}`}
      >
        <HelpCircle size={14} />
      </button>

      {open && <div className="tooltip-box">{help}</div>}
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  help,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ElementType;
  help: string;
}) {
  return (
    <div className="card kpi-card">
      <div className="kpi-header">
        <div>
          <div className="kpi-title">
            <TooltipLabel title={title} help={help} />
          </div>
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
  icon: ElementType;
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

function DataTable({ title, rows }: { title: string; rows: SizeRow[] }) {
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="faq-item">
      <button className="faq-button" onClick={() => setOpen(!open)} type="button">
        <span>{question}</span>
        <ChevronDown size={18} className={open ? "faq-icon rotate" : "faq-icon"} />
      </button>

      {open && <div className="faq-answer">{answer}</div>}
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

function MaturityScaleCard({ value, level }: { value: number; level: string }) {
  const max = 80;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const levels = [
    { label: "Não iniciado", position: 0 },
    { label: "Iniciante", position: 25 },
    { label: "Consciente", position: 50 },
    { label: "Gerenciado", position: 75 },
    { label: "Integrado", position: 100 },
  ];

  return (
    <section className="card maturity-scale-card">
      <SectionTitle
        icon={Gauge}
        title="Nível de Maturidade Digital"
        description="Escala regional calculada a partir do índice médio das organizações de Lages."
      />

      <div className="maturity-scale-header">
        <div>
          <span>Índice atual</span>
          <strong>{formatMetric(value)}</strong>
        </div>

        <div className="maturity-current-level">
          <span>Nível atual</span>
          <strong>{level}</strong>
        </div>
      </div>

      <div className="maturity-scale-track">
        <div className="maturity-scale-fill" style={{ width: `${percentage}%` }} />

        {levels.map((item) => (
          <div
            key={item.label}
            className="maturity-marker"
            style={{ left: `${item.position}%` }}
          >
            <span />
          </div>
        ))}
      </div>

      <div className="maturity-scale-labels">
        {levels.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </section>
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
        if (mounted) setError("Não foi possível carregar a planilha.");
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

  const setorChartData = data.porSetor.filter(hasData).map((item) => ({
    setor: item.setor,
    maturidade: metricOrZero(item.maturidade),
    inovatividade: metricOrZero(item.inovatividade),
  }));

  const escalaChartData = data.escalaData.filter((item) => item.total > 0);

  if (loading) return <DashboardSkeleton />;

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

            <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
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
            help={helpTexts.cidade}
          />
          <KpiCard
            title="Respostas válidas"
            value={String(data.totalRespostas)}
            subtitle="Organizações de Lages"
            icon={Users}
            help={helpTexts.respostas}
          />
          <KpiCard
            title="Maturidade Digital"
            value={formatMetric(data.maturidadeRegional)}
            subtitle="Índice médio regional"
            icon={Gauge}
            help={helpTexts.maturidade}
          />
          <KpiCard
            title="Escala Inovatividade"
            value={formatMetric(data.inovatividadeRegional)}
            subtitle="Índice médio regional"
            icon={TrendingUp}
            help={helpTexts.inovatividade}
          />
          <KpiCard
            title="Correlação"
            value={formatMetric(data.correlacao)}
            subtitle={data.interpretacaoCorrelacao}
            icon={Activity}
            help={helpTexts.correlacao}
          />
        </section>

        <MaturityScaleCard
          value={data.maturidadeRegional}
          level={data.escalaRegional}
        />

        <section className="grid-two">
          <div className="card highlight-card">
            <SectionTitle
              icon={Gauge}
              title="Leitura regional"
              description="Síntese executiva do estágio atual das organizações de Lages."
            />

            <div className="highlight-content">
              <div>
                <p className="highlight-label">Escala atual</p>
                <h3 className="highlight-number">{data.escalaRegional}</h3>
                <p className="highlight-text">
                  Maturidade digital:{" "}
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
                O índice regional de maturidade digital aponta nível{" "}
                <strong>{data.escalaRegional}</strong>.
              </li>
              <li>
                O índice regional de inovatividade está em{" "}
                <strong>{formatMetric(data.inovatividadeRegional)}</strong>.
              </li>
              <li>
                A relação entre maturidade digital e inovatividade é{" "}
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

        <section className="card faq-card">
          <SectionTitle
            icon={HelpCircle}
            title="Entenda os indicadores"
            description="Guia rápido para leitura do painel."
          />

          <div className="faq-list">
            <FaqItem
              question="O que é Maturidade Digital?"
              answer="É o nível de preparo da organização para gerar valor por meio de gestão, tecnologia, processos, dados e cultura digital."
            />

            <FaqItem
              question="O que é Nível de Maturidade Digital?"
              answer="É a classificação do estágio atual da organização com base no índice calculado. O painel utiliza níveis como Não iniciado, Iniciante, Consciente, Gerenciado e Integrado."
            />

            <FaqItem
              question="O que é Índice de Inovatividade?"
              answer="É uma medida da capacidade organizacional de criar melhorias, novos produtos, serviços, processos ou práticas de gestão."
            />

            <FaqItem
              question="Como a correlação foi calculada?"
              answer="A correlação foi calculada pelo coeficiente de Pearson, considerando os scores individuais de maturidade digital e inovatividade das organizações respondentes."
            />

            <FaqItem
              question="De onde vêm os dados?"
              answer="Os indicadores são atualizados automaticamente a partir da base de respostas da pesquisa aplicada às organizações participantes."
            />
          </div>
        </section>

        <footer className="footer-note">
          <p>
            Projeto de Mestrado / PPGSP - UNIPLAC / Mestrando: Patrick A. G.
            Naufel /
            <a
              href="http://lattes.cnpq.br/0026328778886854"
              target="_blank"
              rel="noreferrer"
            >
              {" "}Link para Lattes
            </a>{" "}
            / Orientadora: Profa. Dra. Cristina Keiko Yamaguchi / Coorientador:
            Prof. Dr. Rogério Antônio Casagrande
          </p>

          <img
            src={logoPPGSP}
            alt="Logo PPGSP UNIPLAC"
            className="footer-logo"
          />
        </footer>

        <section className="references-section">
          <h2>Principais referências</h2>

          <ul>
            <li>
              Berman, S. J. (2012). Digital transformation: Opportunities to
              create new business models. <em>Strategy & Leadership, 40</em>(2),
              16–24.
            </li>
            <li>
              OECD/Eurostat. (2018). <em>Oslo Manual 2018: Guidelines for
              collecting, reporting and using data on innovation</em> (4th ed.).
              OECD Publishing.
            </li>
            <li>
              Rogers, D. L. (2016). <em>The digital transformation playbook:
              Rethink your business for the digital age</em>. Columbia Business
              School Publishing.
            </li>
            <li>
              Teece, D. J. (2010). Business models, business strategy and
              innovation. <em>Long Range Planning, 43</em>(2–3), 172–194.
            </li>
            <li>
              Valdez-de-Leon, O. (2016). A digital maturity model for
              telecommunications service providers.{" "}
              <em>Technology Innovation Management Review, 6</em>(8), 19–32.
            </li>
            <li>
              Westerman, G., Bonnet, D., & McAfee, A. (2014).{" "}
              <em>Leading digital: Turning technology into business transformation</em>.
              Harvard Business Review Press.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}