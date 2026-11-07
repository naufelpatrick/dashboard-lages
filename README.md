# Painel de Maturidade Digital de Lages

Dashboard de maturidade digital e inovatividade organizacional, desenvolvido em React, TypeScript, Vite e Recharts. A fonte é a planilha já configurada em `src/lib/loadResumo.ts`, atualizada ao abrir o painel, manualmente e a cada cinco minutos.

## Executar

```sh
npm ci
npm run dev
```

## Verificar

```sh
npm run build
npm run lint
node --test tests/analytics.test.mjs
```

Os testes usam o suporte nativo a TypeScript do Node 22.18+ (ou Node 24+).

## Indicadores

- Rosca e tabela com os seis níveis operacionais de maturidade, frequências e percentuais.
- Comparação das médias de maturidade e inovatividade por porte e setor, com tamanho de cada grupo.
- Distribuição percentual dos níveis dentro de cada porte.
- Dispersão dos pares de notas, sem identificação das organizações, agrupando pares repetidos.
- Mediana, desvio padrão amostral e participação dos níveis iniciais e superiores do IMD.
- Filtro por setor aplicado a todos os indicadores da página.

## Regras de cálculo

Ambos os índices somam vinte itens de 0 a 4 (escala 0–80). O IMD usa D:W; a inovatividade usa X:AP e AR, preservando o mapeamento existente do questionário e ignorando AQ. São consideradas as respostas de Lages dos dois setores previstos. Itens ausentes ou desconhecidos excluem a resposta dos cálculos e são contabilizados, sem transformar ausência em nota zero.

As faixas operacionais seguem a Tabela 4 da dissertação: IMD <20, 20–30, 31–45, 46–60, 61–70 e >70. Classificação da média usa o valor completo, antes do arredondamento de apresentação. A correlação usa as notas contínuas. Correlações com menos de duas respostas ou variância nula aparecem como não calculáveis.

O porte segue a Tabela 3, respeitando a categoria selecionada na coleta. Comércio/Serviços: micro até 9, pequena 10–49, média 50–99 e grande 100 ou mais. Indústria/Construção: micro até 19, pequena 20–99, média 100–499 e grande 500 ou mais. A categoria selecionada “até 1 colaborador” aparece como MEI conforme a tipologia da pesquisa; não se infere enquadramento legal apenas do número de empregados. Categorias desconhecidas permanecem como “Não classificado”, sem desaparecer do total.

As médias agregadas são calculadas diretamente por organização, não pela média simples das médias dos portes. Grupos vazios exibem traço. A amostra é não probabilística por conveniência: os resultados descrevem participantes e não constituem inferência causal ou generalização para todas as empresas do município.
