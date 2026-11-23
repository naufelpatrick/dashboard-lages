# Painel de Maturidade Digital e Inovatividade — Lages (SC), 2026

**Coleta encerrada em 23 de novembro de 2026.** Painel de resultados finais da dissertação de Patrick Alexander Giusti Naufel, PPGSP.

A base analítica anonimizada foi congelada em `src/data/pesquisa-2026.json` com **82 organizações válidas**. O dashboard **não consulta mais a planilha Google Sheets, não coleta dados e não oferece link para participação**. O formulário de origem deve ser desativado separadamente nas configurações do Google Forms.

## Executar e testar

```sh
npm ci
npm run build
npm run lint
node --test tests/analytics.test.mjs
```

Os testes exigem Node com suporte nativo a TypeScript (22.18+ ou 24+).

## Indicadores finais da dissertação

- n = 82 organizações de Lages (SC)
- Maturidade digital: **58,84/100** (média bruta 47,07/80), faixa operacional **Gerenciado**
- Inovatividade organizacional: **69,15/100**
- Correlação de Pearson: **r = 0,72**
- Distribuição em seis faixas: **6, 12, 21, 20, 15, 8**

Ambos os instrumentos têm 20 itens codificados de 0 a 4. A escala bruta 0–80 é convertida para 0–100 por multiplicação por 1,25. A classificação dos seis níveis permanece baseada no IMD bruto. A transformação linear preserva Pearson.

A amostra não é probabilística; não permite generalização estatística para todas as empresas de Lages nem inferência causal. Os indicadores por porte e setor são exploratórios, devendo ser interpretados junto de seus respectivos tamanhos de grupo.

## Proteção de dados

O repositório contém apenas registros analíticos anonimizados (setor, porte, soma dos dois instrumentos). Nomes, e-mails, datas de resposta e respostas individuais por item não foram incorporados.
