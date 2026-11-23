import {
  Activity,
  BarChart3,
  ChevronDown,
  FileText,
  Gauge,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState, type ElementType } from "react";
import { loadResumo, type DashboardData } from "./lib/loadResumo";
import logoPPGSP from "./assets/logo_ppgsp_home300.png";
import "./App.css";
import { LEVELS, summarize } from "./lib/analytics";

const IndicatorsPage = lazy(() => import("./Indicators"));

type Page =
  | "visao-geral"
  | "indicadores"
  | "metodologia"
  | "faq"
  | "pesquisadores";

const defaultData: DashboardData = {
  cidade: "Lages", participantes: [], respostasExcluidas: 0, ...summarize([]),
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

function MaturityScaleCard({ value, level }: { value: number | null; level: string }) {
  const max = 100;
  const percentage = Math.min(Math.max(((value ?? 0) / max) * 100, 0), 100);

  const levels = LEVELS.map(item => ({ label: item.nivel, faixa: item.faixa, color: item.color }));

  return (
    <section className="card maturity-scale-card">
      <SectionTitle
        icon={Gauge}
        title="Nível de Maturidade Digital"
        description="Índice médio normalizado de 0 a 100 pontos. Classificação operacional baseada na escala original de 0 a 80."
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

      <div className="maturity-scale-track" role="img" aria-label={`IMD ${formatMetric(value)} de 100 pontos; nível ${level}`}>
        <div className="maturity-scale-bands">
          {LEVELS.map(item => <span key={item.nivel} style={{ width: `${(item.max - item.min) * 1.25 / max * 100}%`, background: item.color }} />)}
        </div>
        {value !== null && <div className="maturity-marker" style={{ left: `${percentage}%` }}><span /></div>}
      </div>

      <div className="maturity-scale-labels">
        {levels.map((item) => (
          <span key={item.label}><i className="level-dot" style={{ background: item.color }} />{item.label}<small>{item.faixa}</small></span>
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

function Hero({ data }: { data: DashboardData }) {
  return (
    <header className="hero">
      <div className="hero-main">
        <span className="badge">Painel de Maturidade Digital de Lages</span>
        <h1>Maturidade Digital e Inovatividade Organizacional</h1>
        <p>
          Painel público dos resultados finais da pesquisa,
          com foco em Lages, setor, porte e relação entre maturidade digital e
          inovatividade.
        </p>
        <p className="survey-closed">Coleta encerrada em 23/11/2026 · resultados finais (n = 82)</p>
      </div>

      <div className="hero-side">
        <div className="hero-mini-card">
          <p>Localidade</p>
          <strong>{data.cidade}</strong>
        </div>

        <div className="hero-mini-card">
          <p>Encerramento da coleta</p>
          <strong>23/11/2026</strong>
        </div>


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
        subtitle="Média da amostra · 0–100 pontos"
        icon={Gauge}
        help={helpTexts.maturidade}
      />
      <KpiCard
        title="Índice de Inovatividade"
        value={formatMetric(data.inovatividadeRegional)}
        subtitle="Média da amostra · 0–100 pontos"
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
            description="Síntese executiva das 82 organizações participantes de Lages."
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
            description="Resumo dos resultados finais de 2026."
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
            description="Base anonimizada e congelada após o encerramento da pesquisa."
          />

          <ul className="insight-list">
            <li>Coleta encerrada em 23/11/2026.</li>
            <li>82 organizações válidas de Lages (SC).</li>
            <li>Os indicadores não recebem novas respostas.</li>
          </ul>
        </div>
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
            Cada instrumento contém 20 itens, codificados de 0 a 4, totalizando de 0 a 80 pontos brutos, posteriormente normalizados para 0 a 100. As médias são calculadas por organização. Respostas de Lages com itens ausentes ou não reconhecidos são excluídas, sem converter ausência em zero. O IMD é tratado como variável contínua na correlação; as seis faixas operacionais são usadas para descrição.
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
            autodeclarado das respostas, a amostra não probabilística por conveniência e a coleta encerrada em 23/11/2026. Os resultados descrevem as organizações participantes, sem generalização estatística para todas as empresas de Lages. Correlação não implica causalidade; comparações por porte devem considerar o número de participantes.
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
          answer="A Escala de Maturidade classifica o estágio organizacional em níveis progressivos, como Não iniciado, Iniciante, Consciente, Gerenciado, Integrado e Otimizado. Essa tipologia permite interpretar resultados numéricos de forma mais aplicada, identificando em qual estágio médio as organizações da amostra se encontram e quais avanços ainda são necessários."
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
          answer="A coleta foi encerrada em 23/11/2026. O painel utiliza uma base final anonimizada e congelada com 82 organizações válidas; novas respostas não alteram os indicadores."
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
  const [currentPage, setCurrentPage] = useState<Page>("visao-geral");

  useEffect(() => {
    let mounted = true;

    async function run() {

      try {
        const result = await loadResumo();

        if (!mounted) return;

        setData(result);
        setError("");

      } catch (err) {
        console.error(err);
        if (mounted) setError("Não foi possível carregar a base final da pesquisa.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    run();



    return () => {
      mounted = false;

    };
  }, []);

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
        />

        <NavMenu currentPage={currentPage} onChangePage={setCurrentPage} />

        {currentPage === "visao-geral" && <OverviewPage data={data} />}
        {currentPage === "indicadores" && <Suspense fallback={<SkeletonChartCard />}><IndicatorsPage data={data} /></Suspense>}
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
