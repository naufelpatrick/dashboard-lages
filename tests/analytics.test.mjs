import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifySize, deriveScale, summarize } from '../src/lib/analytics.ts';
import { parseResumo } from '../src/lib/loadResumo.ts';

const company = (maturidade, inovatividade = maturidade, porte = 'Pequena', setor = 'Comércio Serviços') => ({ maturidade, inovatividade, porte, setor });
test('classifies all six maturity levels at their boundaries', () => {
  const samples = [[0,'Não iniciado'],[19,'Não iniciado'],[20,'Iniciante'],[30,'Iniciante'],[31,'Consciente'],[45,'Consciente'],[46,'Gerenciado'],[60,'Gerenciado'],[61,'Integrado'],[70,'Integrado'],[71,'Otimizado'],[80,'Otimizado']];
  for (const [score, level] of samples) assert.equal(deriveScale(score), level);
});
test('classifies survey categories by sector including commerce small businesses', () => {
  for (const [sector, labels] of [
    ['Comércio Serviços', ['até 1 colaborador','até 9 colaboradores','10 a 49 colaboradores','50 a 99 colaboradores','100 ou mais empregados']],
    ['Indústria e Construção', ['até 1 colaborador','até 19 colaboradores','20 a 99 colaboradores','100 a 499 colaboradores','500 ou mais empregados']],
  ]) labels.forEach((label, i) => assert.equal(classifySize(label, sector), ['MEI','Microempresa','Pequena','Média','Grande'][i]));
  assert.equal(classifySize('não informado','Comércio Serviços'), 'Não classificado');
  assert.equal(classifySize('até 19 colaboradores','Comércio Serviços'), 'Não classificado');
});
test('weights each company equally and reconciles all group counts', () => {
  const summary = summarize([company(0),company(0),company(80, 80, 'Grande')]);
  assert.equal(summary.maturidadeRegional,26.67);
  assert.equal(summary.mediana,0);
  assert.ok(Math.abs(summary.desvioPadrao - 46.188021535) < 1e-6);
  assert.equal(summary.porPorte.reduce((n,r)=>n+r.respostas,0),3);
  assert.equal(summary.escalaData.reduce((n,r)=>n+r.total,0),3);
  assert.ok(Math.abs(summary.escalaData.reduce((n,r)=>n+r.percentual,0)-100)<1e-10);
  assert.equal(summary.niveisIniciais,2);
  assert.equal(summary.niveisSuperiores,1);
  assert.equal(summary.correlacao,1);
  assert.equal(summary.porPorte.find(r=>r.porte==='Média').maturidade,null);
});
test('does not manufacture zero scores or correlations for absent/constant samples', () => {
  const empty = summarize([]);
  assert.equal(empty.maturidadeRegional,null);
  assert.equal(empty.mediana,null);
  assert.equal(empty.correlacao,null);
  assert.equal(summarize([company(5)]).desvioPadrao,null);
  assert.equal(summarize([company(5,1),company(5,3)]).correlacao,null);
  assert.equal(summarize([company(0,80),company(80,0)]).correlacao,-1);
});
test('uses exact mean for maturity classification rather than a rounded boundary', () => {
  const s=summarize([...Array.from({length:200},()=>company(30)),company(31)]);
  assert.equal(s.maturidadeRegional,30);
  assert.equal(s.escalaRegional,'Consciente');
});
test('anonymous scatter groups identical score pairs without losing frequency', () => {
  assert.deepEqual(summarize([company(20,30),company(20,30),company(30,40)]).dispersao,[{maturidade:20,inovatividade:30,total:2},{maturidade:30,inovatividade:40,total:1}]);
});
test('parser excludes incomplete scores; keeps actual disagreement as zero; ignores AQ', () => {
  const row=()=>{
    const c=Array.from({length:54},()=>({v:null}));
    for(let i=3;i<=41;i++) c[i]={v:'Discordo Totalmente'};
    c[42]={v:'not a scored item'}; c[43]={v:'Concordo Totalmente'};
    c[44]={v:'Comércio Serviços'};c[46]={v:'10 a 49 colaboradores'};c[48]={v:'Lages'};
    return c;
  };
  const complete=row(), missing=row(), otherCity=row();
  missing[3]={v:null};otherCity[48]={v:'Outra cidade'};
  const result=parseResumo(`google.visualization.Query.setResponse(${JSON.stringify({table:{rows:[{c:complete},{c:missing},{c:otherCity}]}})});`);
  assert.equal(result.totalRespostas,1);assert.equal(result.respostasExcluidas,1);
  assert.equal(result.maturidadeRegional,0);assert.equal(result.inovatividadeRegional,4);
  assert.equal(result.porPorte.find(r=>r.porte==='Pequena').respostas,1);
  assert.throws(()=>parseResumo('invalid'));
});
