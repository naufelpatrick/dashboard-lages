export type SectorRow = {
  setor: string;
  respostas: number;
  maturidade: number | null;
  inovatividade: number | null;
};

export type SizeRow = {
  porte: string;
  respostas: number;
  maturidade: number | null;
  inovatividade: number | null;
};

export type ScaleRow = {
  nivel: string;
  total: number;
  color: string;
};

export type DashboardData = {
  cidade: string;
  totalRespostas: number;
  maturidadeRegional: number;
  escalaRegional: string;
  inovatividadeRegional: number;
  correlacao: number;
  interpretacaoCorrelacao: string;
  porSetor: SectorRow[];
  porteComercio: SizeRow[];
  porteIndustria: SizeRow[];
  escalaData: ScaleRow[];
};

const SHEET_ID = "1LuJz5olkb3HWzEpX5eTuOm16EvosHae67-42BkRa3wo";
const RAW_SHEET_NAME = "Respostas ao formulário 1";

const COMERCIO_PORTES = [
  "até 1 colaborador",
  "até 9 colaboradores",
  "50 a 99 colaboradores",
  "100 ou mais empregados",
];

const INDUSTRIA_PORTES = [
  "até 1 colaborador",
  "até 19 colaboradores",
  "20 a 99 colaboradores",
  "100 a 499 colaboradores",
  "500 ou mais empregados",
];

const SCALE_COLORS: Record<string, string> = {
  "Não iniciado": "#ef4444",
  Iniciante: "#f97316",
  Consciente: "#eab308",
  Gerenciado: "#3b82f6",
  Integrado: "#8b5cf6",
};

function colToIndex(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result - 1;
}

function text(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function parseGViz(textResponse: string) {
  const match = textResponse.match(
    /google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/
  );

  if (!match || !match[1]) {
    throw new Error("Não foi possível interpretar a resposta do Google Sheets.");
  }

  return JSON.parse(match[1]);
}

function extractRows(json: any): unknown[][] {
  if (!json?.table?.rows) return [];

  return json.table.rows.map((row: any) =>
    (row.c || []).map((cell: any) => cell?.v ?? null)
  );
}

function likertToNumber(value: unknown): number {
  const v = text(value);

  switch (v) {
    case "Discordo Totalmente":
      return 0;
    case "Discordo Parcialmente":
      return 1;
    case "Neutro":
      return 2;
    case "Concordo Parcialmente":
      return 3;
    case "Concordo Totalmente":
      return 4;
    default:
      return 0;
  }
}

function sumColumns(row: unknown[], startCol: string, endCol: string): number {
  const start = colToIndex(startCol);
  const end = colToIndex(endCol);

  let total = 0;
  for (let i = start; i <= end; i++) {
    total += likertToNumber(row[i]);
  }
  return total;
}

function sumInnovation(row: unknown[]): number {
  // X:AP + AR (ignorando AQ)
  const part1 = sumColumns(row, "X", "AP");
  const ar = likertToNumber(row[colToIndex("AR")]);
  return part1 + ar;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}

function round2(n: number): number {
  return Number(n.toFixed(2));
}

function deriveScale(score: number): string {
  if (score <= 19) return "Não iniciado";
  if (score <= 39) return "Iniciante";
  if (score <= 59) return "Consciente";
  if (score <= 79) return "Gerenciado";
  return "Integrado";
}

function deriveCorrelationLabel(r: number): string {
  const abs = Math.abs(r);
  if (abs < 0.2) return "Muito fraca";
  if (abs < 0.4) return "Fraca";
  if (abs < 0.6) return "Moderada";
  if (abs < 0.8) return "Forte";
  return "Muito forte";
}

function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;

  const meanX = average(x);
  const meanY = average(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (!denominator) return 0;

  return numerator / denominator;
}

export async function loadResumo(): Promise<DashboardData> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(
    RAW_SHEET_NAME
  )}&headers=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro HTTP ao carregar planilha: ${response.status}`);
  }

  const rawText = await response.text();
  const json = parseGViz(rawText);
  const rows = extractRows(json);

  const idxAS = colToIndex("AS");
  const idxAU = colToIndex("AU");
  const idxAW = colToIndex("AW");
  const idxAZ = colToIndex("AZ");
  const idxBB = colToIndex("BB");

  const validRows = rows
    .map((row) => {
      const setor = text(row[idxAS]);

      if (setor !== "Comércio Serviços" && setor !== "Indústria e Construção") {
        return null;
      }

      const localizacao =
        setor === "Comércio Serviços"
          ? text(row[idxAW])
          : text(row[idxBB]);

      if (localizacao !== "Lages") {
        return null;
      }

      const porte =
        setor === "Comércio Serviços"
          ? text(row[idxAU])
          : text(row[idxAZ]);

      const maturidade = sumColumns(row, "D", "W");
      const inovatividade = sumInnovation(row);

      return {
        setor,
        porte,
        maturidade,
        inovatividade,
      };
    })
    .filter(Boolean) as {
    setor: string;
    porte: string;
    maturidade: number;
    inovatividade: number;
  }[];

  const totalRespostas = validRows.length;

  const maturidades = validRows.map((r) => r.maturidade);
  const inovatividades = validRows.map((r) => r.inovatividade);

  const maturidadeRegional = round2(average(maturidades));
  const inovatividadeRegional = round2(average(inovatividades));
  const correlacao = round2(pearsonCorrelation(maturidades, inovatividades));
  const escalaRegional = deriveScale(maturidadeRegional);
  const interpretacaoCorrelacao = deriveCorrelationLabel(correlacao);

  const buildSectorRow = (setor: string): SectorRow => {
    const subset = validRows.filter((r) => r.setor === setor);

    if (!subset.length) {
      return {
        setor,
        respostas: 0,
        maturidade: null,
        inovatividade: null,
      };
    }

    return {
      setor,
      respostas: subset.length,
      maturidade: round2(average(subset.map((r) => r.maturidade))),
      inovatividade: round2(average(subset.map((r) => r.inovatividade))),
    };
  };

  const porSetor: SectorRow[] = [
    buildSectorRow("Comércio Serviços"),
    buildSectorRow("Indústria e Construção"),
  ];

  const buildSizeRows = (setor: string, portes: string[]): SizeRow[] => {
    return portes.map((porte) => {
      const subset = validRows.filter(
        (r) => r.setor === setor && r.porte === porte
      );

      if (!subset.length) {
        return {
          porte,
          respostas: 0,
          maturidade: null,
          inovatividade: null,
        };
      }

      return {
        porte,
        respostas: subset.length,
        maturidade: round2(average(subset.map((r) => r.maturidade))),
        inovatividade: round2(average(subset.map((r) => r.inovatividade))),
      };
    });
  };

  const porteComercio = buildSizeRows("Comércio Serviços", COMERCIO_PORTES);
  const porteIndustria = buildSizeRows("Indústria e Construção", INDUSTRIA_PORTES);

  const scaleCounts: Record<string, number> = {
    "Não iniciado": 0,
    Iniciante: 0,
    Consciente: 0,
    Gerenciado: 0,
    Integrado: 0,
  };

  validRows.forEach((row) => {
    const nivel = deriveScale(row.maturidade);
    scaleCounts[nivel] += 1;
  });

  const escalaData: ScaleRow[] = Object.entries(scaleCounts).map(
    ([nivel, total]) => ({
      nivel,
      total,
      color: SCALE_COLORS[nivel] ?? "#94a3b8",
    })
  );

  return {
    cidade: "Lages",
    totalRespostas,
    maturidadeRegional,
    escalaRegional,
    inovatividadeRegional,
    correlacao,
    interpretacaoCorrelacao,
    porSetor,
    porteComercio,
    porteIndustria,
    escalaData,
  };
}