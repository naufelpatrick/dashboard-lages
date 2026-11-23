import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifySize, deriveScale, summarize } from '../src/lib/analytics.ts';
import { loadResumo } from '../src/lib/loadResumo.ts';
const company = (maturidade, inovatividade = maturidade, porte = 'Pequena', setor = 'Comércio Serviços') => ({ maturidade, inovatividade, porte, setor });
test('seis faixas operacionais seguem escala bruta 0 a 80', () => {
  for (const [score,level] of [[0,'Não iniciado'],[19,'Não iniciado'],[20,'Iniciante'],[30,'Iniciante'],[31,'Consciente'],[45,'Consciente'],[46,'Gerenciado'],[60,'Gerenciado'],[61,'Integrado'],[70,'Integrado'],[71,'Otimizado'],[80,'Otimizado']]) assert.equal(deriveScale(score),level);
});
test('classificação por porte preserva grupos existentes', () => {
  assert.equal(classifySize('10 a 49 colaboradores','Comércio Serviços'),'Pequena');
  assert.equal(classifySize('20 a 99 colaboradores','Indústria e Construção'),'Pequena');
});
test('escores apresentados na escala normalizada 0 a 100', () => {
  const summary=summarize([company(0,80),company(80,0)]);
  assert.equal(summary.maturidadeRegional,50);
  assert.equal(summary.inovatividadeRegional,50);
  assert.equal(summary.porPorte.find(x=>x.porte==='Pequena').maturidade,50);
  assert.equal(summary.correlacao,-1);
  assert.equal(summary.escalaData.reduce((t,r)=>t+r.total,0),2);
});
test('base final permanece congelada em 82 registros e reproduz dissertação', async () => {
  const d=await loadResumo();
  assert.equal(d.totalRespostas,82);
  assert.equal(d.maturidadeRegional,58.84);
  assert.equal(d.inovatividadeRegional,69.15);
  assert.equal(d.correlacao,0.72);
  assert.equal(d.escalaRegional,'Gerenciado');
  assert.deepEqual(d.escalaData.map(x=>x.total),[6,12,21,20,15,8]);
});
