import {
  Activity,
  BarChart3,
  Building2,
  ChevronDown,
  Factory,
  FileText,
  Gauge,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
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

type Page =
  | "visao-geral"
  | "indicadores"
  | "metodologia"
  | "faq"
  | "pesquisadores";

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
      <button
        className="faq-button"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span>{question}</span>
        <ChevronDown
          size={18}
          className={open ? "faq-icon rotate" : "faq-icon"}
        />
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
        <div
          className="maturity-scale-fill"
          style={{ width: `${percentage}%` }}
        />

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

function NavMenu({
  currentPage,
  onChangePage,
}: {
  currentPage: Page;
  onChangePage: (page: Page) => void;
}) {
  const items: { id: Page; label: string; icon: ElementType }[] = [
    { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
    { id: "indicadores", label: "Indicadores", icon: BarChart3 },
    { id: "metodologia", label: "Metodologia", icon: FileText },
    { id: "faq", label: "Perguntas Frequentes", icon: HelpCircle },
    { id: "pesquisadores", label: "Pesquisadores", icon: GraduationCap },
  ];

  return (
    <nav className="nav-card" aria-label="Navegação principal">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            className={currentPage === item.id ? "nav-item active" : "nav-item"}
            onClick={() => onChangePage(item.id)}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Hero({
  data,
  lastUpdated,
  refreshing,
  onRefresh,
}: {
  data: DashboardData;
  lastUpdated: string;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="hero">
      <div className="hero-main">
        <span className="badge">Observatório Digital de Lages</span>
        <h1>Maturidade Digital e Inovatividade Organizacional</h1>
        <p>
          Portal de pesquisa aplicada conectado à base de respostas do estudo,
          com foco em Lages, setor, porte e relação entre maturidade digital e
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

        <button className="refresh-btn" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? "spin-icon" : ""} />
          {refreshing ? "Atualizando..." : "Atualizar agora"}
        </button>
      </div>
    </header>
  );
}

function KpiGrid({ data }: { data: DashboardData }) {
  return (
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
        title="Índice de Inovatividade"
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
  );
}

function OverviewPage({ data }: { data: DashboardData }) {
  return (
    <>
      <KpiGrid data={data} />

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
              <h3 className="highlight-number">{formatMetric(data.correlacao)}</h3>
              <p className="highlight-text">
                Interpretação atual:{" "}
                <strong>{data.interpretacaoCorrelacao}</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-two equal-cards">
        <div className="card info-card">
          <SectionTitle
            icon={BarChart3}
            title="Principais achados"
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
    </>
  );
}

function IndicatorsPage({ data }: { data: DashboardData }) {
  const setorChartData = data.porSetor.filter(hasData).map((item) => ({
    setor: item.setor,
    maturidade: metricOrZero(item.maturidade),
    inovatividade: metricOrZero(item.inovatividade),
  }));

  const escalaChartData = data.escalaData.filter((item) => item.total > 0);

  return (
    <>
      <section className="page-heading card">
        <SectionTitle
          icon={BarChart3}
          title="Indicadores analíticos"
          description="Visualizações e tabelas para leitura setorial, distribuição dos níveis e porte das organizações."
        />
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
                  fill="#4f8e2c"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="inovatividade"
                  fill="#1f5f99"
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
        <DataTable title="Porte — Comércio Serviços" rows={data.porteComercio} />
        <DataTable
          title="Porte — Indústria e Construção"
          rows={data.porteIndustria}
        />
      </section>
    </>
  );
}

function MethodologyPage() {
  return (
    <>
      <section className="page-heading card">
        <SectionTitle
          icon={FileText}
          title="Metodologia"
          description="Síntese metodológica do estudo e critérios de interpretação dos indicadores."
        />
      </section>

      <section className="methodology-grid">
        <div className="card methodology-card">
          <h3>Objetivo do estudo</h3>
          <p>
            O estudo tem como objetivo analisar o nível de maturidade digital das
            organizações de Lages/SC e sua relação com a inovatividade
            organizacional, contribuindo para o diagnóstico regional de
            transformação digital e inovação.
          </p>
        </div>

        <div className="card methodology-card">
          <h3>Recorte da pesquisa</h3>
          <p>
            O painel considera apenas organizações localizadas em Lages. As
            respostas são analisadas de forma agregada, por setor e por porte,
            sem exposição individual das empresas participantes.
          </p>
        </div>

        <div className="card methodology-card">
          <h3>Instrumento de coleta</h3>
          <p>
            Os dados são provenientes de questionário estruturado aplicado por
            formulário online, contemplando itens relacionados à maturidade
            digital e à inovatividade organizacional.
          </p>
        </div>

        <div className="card methodology-card">
          <h3>Cálculo dos índices</h3>
          <p>
            As respostas são convertidas em scores numéricos e consolidadas em
            médias regionais. O índice de maturidade digital representa o estágio
            médio da amostra, enquanto o índice de inovatividade expressa a
            predisposição das organizações à inovação.
          </p>
        </div>

        <div className="card methodology-card">
          <h3>Correlação</h3>
          <p>
            A relação entre maturidade digital e inovatividade é estimada pelo
            Coeficiente de Correlação de Pearson, utilizado para verificar a
            intensidade e direção da associação linear entre as duas variáveis.
          </p>
        </div>

        <div className="card methodology-card">
          <h3>Limitações</h3>
          <p>
            Os resultados devem ser interpretados considerando o caráter
            autodeclarado das respostas, o recorte regional e o estágio de
            evolução da amostra durante o período de coleta.
          </p>
        </div>
      </section>

      <section className="references-section card">
        <h2>Principais referências</h2>

        <ul>
          <li>
            Berman, S. J. (2012). Digital transformation: Opportunities to create
            new business models. <em>Strategy & Leadership, 40</em>(2), 16–24.
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
    </>
  );
}

function FaqPage() {
  return (
    <section className="card faq-card">
      <SectionTitle
        icon={HelpCircle}
        title="Perguntas Frequentes (FAQ)"
        description="Conceitos centrais e orientações para interpretação acadêmica do painel."
      />

      <div className="faq-list">
        <FaqItem
          question="O que é Maturidade Digital?"
          answer="Maturidade Digital representa o grau de preparo de uma organização para utilizar tecnologias, processos, dados, liderança e cultura organizacional de forma estratégica. Não se restringe à adoção de ferramentas digitais, mas envolve a capacidade institucional de gerar valor, eficiência, competitividade e adaptação contínua em ambientes de mudança."
        />

        <FaqItem
          question="Como interpretar o Índice de Maturidade Digital?"
          answer="O índice apresentado no painel corresponde à média consolidada das organizações respondentes do recorte analisado. Quanto maior o resultado, maior tende a ser o nível de estruturação digital. Esse indicador sintetiza diferentes dimensões organizacionais avaliadas no instrumento de pesquisa, como gestão, processos, relacionamento com clientes, uso de tecnologia e capacidade de inovação."
        />

        <FaqItem
          question="O que significa a Escala de Maturidade?"
          answer="A Escala de Maturidade classifica o estágio organizacional em níveis progressivos, como Não Iniciado, Iniciante, Consciente, Gerenciado e Integrado. Essa tipologia permite interpretar resultados numéricos de forma mais aplicada, identificando em qual estágio médio as organizações da amostra se encontram e quais avanços ainda são necessários."
        />

        <FaqItem
          question="O que é Inovatividade Organizacional?"
          answer="Inovatividade Organizacional é a capacidade de uma empresa desenvolver, adotar e implementar melhorias relevantes em produtos, serviços, processos internos, modelos de negócio ou práticas gerenciais. Trata-se de uma competência estratégica associada à competitividade, diferenciação e sustentabilidade no longo prazo."
        />

        <FaqItem
          question="Como interpretar o Índice de Inovatividade?"
          answer="O índice de inovatividade expressa a tendência média das organizações respondentes em relação a comportamentos e práticas inovadoras. Valores mais elevados indicam maior predisposição à experimentação, melhoria contínua, renovação estratégica e geração de soluções novas ou aprimoradas."
        />

        <FaqItem
          question="Como a correlação foi calculada?"
          answer="A relação entre maturidade digital e inovatividade foi estimada por meio do Coeficiente de Correlação de Pearson, técnica estatística amplamente utilizada para medir associação linear entre variáveis quantitativas. O resultado varia entre -1 e +1, sendo valores positivos mais altos indicativos de associação direta mais intensa."
        />

        <FaqItem
          question="Correlação significa causa e efeito?"
          answer="Não necessariamente. Correlação indica associação estatística entre variáveis, mas não comprova causalidade isoladamente. Em termos práticos, o resultado sugere que organizações mais maduras digitalmente tendem também a apresentar maior inovatividade, porém outros fatores contextuais podem influenciar essa relação."
        />

        <FaqItem
          question="Como os dados são atualizados?"
          answer="O painel está conectado à base consolidada da pesquisa. Novas respostas válidas podem alterar automaticamente médias, distribuições e indicadores estatísticos, permitindo acompanhamento dinâmico da evolução regional durante o período de coleta."
        />

        <FaqItem
          question="Os dados identificam empresas específicas?"
          answer="Não. O painel apresenta resultados agregados e consolidados, preservando anonimato e confidencialidade dos participantes. O objetivo é análise acadêmica e diagnóstico regional, sem exposição individual de organizações respondentes."
        />

        <FaqItem
          question="Qual a utilidade prática deste estudo?"
          answer="Os resultados podem apoiar empresas, entidades setoriais, universidades e formuladores de políticas públicas na compreensão do estágio regional de transformação digital e inovação. Isso contribui para decisões estratégicas, programas de capacitação, investimentos e ações de desenvolvimento econômico."
        />
      </div>
    </section>
  );
}

function ResearchersPage() {
  return (
    <>
      <section className="page-heading card">
        <SectionTitle
          icon={GraduationCap}
          title="Pesquisadores"
          description="Informações institucionais do projeto e equipe de pesquisa."
        />
      </section>

      <section className="researchers-card card">
        <img
          src={logoPPGSP}
          alt="Logo PPGSP UNIPLAC"
          className="researchers-logo"
        />

        <div className="researchers-content">
          <h2>Projeto de Mestrado / PPGSP - UNIPLAC</h2>

          <p>
            <strong>Mestrando:</strong> Patrick A. G. Naufel
          </p>

          <p>
            <strong>Lattes:</strong>{" "}
            <a
              href="http://lattes.cnpq.br/0026328778886854"
              target="_blank"
              rel="noreferrer"
            >
              http://lattes.cnpq.br/0026328778886854
            </a>
          </p>

          <p>
            <strong>Orientadora:</strong> Profa. Dra. Cristina Keiko Yamaguchi
          </p>

          <p>
            <strong>Coorientador:</strong> Prof. Dr. Rogério Antônio Casagrande
          </p>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("visao-geral");

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
        <Hero
          data={data}
          lastUpdated={lastUpdated}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        <NavMenu currentPage={currentPage} onChangePage={setCurrentPage} />

        {currentPage === "visao-geral" && <OverviewPage data={data} />}
        {currentPage === "indicadores" && <IndicatorsPage data={data} />}
        {currentPage === "metodologia" && <MethodologyPage />}
        {currentPage === "faq" && <FaqPage />}
        {currentPage === "pesquisadores" && <ResearchersPage />}

        <footer className="footer-note">
          Projeto de Mestrado / PPGSP - UNIPLAC / Mestrando: Patrick A. G.
          Naufel
        </footer>
      </div>
    </div>
  );
}