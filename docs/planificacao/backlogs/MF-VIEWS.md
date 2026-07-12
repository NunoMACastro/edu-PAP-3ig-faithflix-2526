# MF-VIEWS - Execucao por Macro Fase

## Header

- `doc_id`: `MF-VIEWS`
- `path`: `docs/planificacao/backlogs/MF-VIEWS.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-07-10`
- `document_status`: `CURRENT`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: vista derivada de 66 BK, 66 guias, 94 requisitos e 13 sprints; não representa o estado executado da referência

## Objetivo

Fornecer guias praticos por macro fase para executar os BKs com ordem recomendada e passos claros.

## Regra

- Estado oficial: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Ordem canonica de execucao: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Esta view e derivada da ordem por sprint e nao pode divergir.
- Baseline ativa: `66 BK`, `66 guias`, `94 requisitos` e `13 sprints`.
- Os critérios e estados abaixo pertencem aos alunos. Evidence em `real_dev`
  pode demonstrar a referência docente, mas não altera automaticamente esta
  lane nem promove um BK.

---

## MF0 - Kickoff e governance

> Nota anti-drift: em FaithFlix, `MF0` nao e fase funcional. Esta macro fecha apenas plano, responsabilidades, backlog, DoD, calendario e reuniao de alinhamento. Backend, frontend, base de dados, streaming, catalogo, componentes, rotas e comandos reais comecam apenas em `MF1` ou fases posteriores.

### Sequencia

1. `BK-MF0-01`
2. `BK-MF0-02`
3. `BK-MF0-03`
4. `BK-MF0-04`
5. `BK-MF0-05`
6. `BK-MF0-06`

### Guias disponiveis

- `BK-MF0-01`: `../guias-bk/MF0/BK-MF0-01-publicar-plano-total.md`
- `BK-MF0-02`: `../guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md`
- `BK-MF0-03`: `../guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md`
- `BK-MF0-04`: `../guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md`
- `BK-MF0-05`: `../guias-bk/MF0/BK-MF0-05-definir-calendario-sprints.md`
- `BK-MF0-06`: `../guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`

### Step-by-step

1. Nuno publica os documentos base.
2. Matheus, Mateus, Davi e Kaue validam leitura.
3. Equipa fecha DoD e evidencias.
4. Equipa fecha sprint 1.
5. Equipa confirma handoff para `BK-MF1-01` e `BK-MF1-02`, sem implementar funcionalidades em `MF0`.

### Critérios de conclusão da macro — alunos

- Todos os BKs MF0 em `DONE`.

---

## MF1 - Fundacao tecnica

### Sequencia

1. `BK-MF1-01` (Matheus)
2. `BK-MF1-02` (Mateus)
3. `BK-MF1-03` (Mateus)
4. `BK-MF1-04` (Matheus)
5. `BK-MF1-05` (Kaue)
6. `BK-MF1-06` (Kaue)

### Guias disponiveis

- `BK-MF1-01`: `../guias-bk/MF1/BK-MF1-01-estrutura-base-backend-modulos.md`
- `BK-MF1-02`: `../guias-bk/MF1/BK-MF1-02-estrutura-base-frontend-componentes.md`
- `BK-MF1-03`: `../guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md`
- `BK-MF1-04`: `../guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`
- `BK-MF1-05`: `../guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md`
- `BK-MF1-06`: `../guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`

### Step-by-step

1. Fechar base backend.
2. Fechar base frontend.
3. Integrar cliente API.
4. Fechar seguranca base de sessao.
5. Fechar health-check/logs.
6. Rodar smoke tests.

### Critérios de conclusão da macro — alunos

- FE/BE estaveis.
- Sessao base valida.
- Smoke tests executados.

---

## MF2 - Core streaming MVP

### Sequencia

1. `BK-MF2-01`
2. `BK-MF2-02`
3. `BK-MF2-03`
4. `BK-MF2-04`
5. `BK-MF2-05`
6. `BK-MF2-06`
7. `BK-MF2-07`
8. `BK-MF2-08`

### Guias disponiveis

- `BK-MF2-01`: `../guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md`
- `BK-MF2-02`: `../guias-bk/MF2/BK-MF2-02-edicao-perfil-papeis-base.md`
- `BK-MF2-03`: `../guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md`
- `BK-MF2-04`: `../guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md`
- `BK-MF2-05`: `../guias-bk/MF2/BK-MF2-05-reproducao-continuar-a-ver.md`
- `BK-MF2-06`: `../guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md`
- `BK-MF2-07`: `../guias-bk/MF2/BK-MF2-07-favoritos-watchlist-historico.md`
- `BK-MF2-08`: `../guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md`

### Step-by-step

1. Fechar autenticacao completa.
2. Fechar catalogo e detalhe.
3. Fechar player.
4. Fechar historico/favoritos.
5. Executar E2E principal.
6. Corrigir regressao e fechar.

### Critérios de conclusão da macro — alunos

- Fluxo principal estavel com evidencia.

---

## MF3 - Descoberta e comunidade

### Sequencia

1. `BK-MF3-01`
2. `BK-MF3-02`
3. `BK-MF3-03`
4. `BK-MF3-04`
5. `BK-MF3-05`
6. `BK-MF3-06`

### Guias disponiveis

- `BK-MF3-01`: `../guias-bk/MF3/BK-MF3-01-ratings-e-agregacao.md`
- `BK-MF3-02`: `../guias-bk/MF3/BK-MF3-02-comentarios-curtos-moderados.md`
- `BK-MF3-03`: `../guias-bk/MF3/BK-MF3-03-pesquisa-unificada.md`
- `BK-MF3-04`: `../guias-bk/MF3/BK-MF3-04-filtros-carrosseis-e-relacionados.md`
- `BK-MF3-05`: `../guias-bk/MF3/BK-MF3-05-recomendacao-baseline-cold-start.md`
- `BK-MF3-06`: `../guias-bk/MF3/BK-MF3-06-explicabilidade-de-recomendacao.md`

### Step-by-step

1. Priorizar pesquisa/filtros.
2. Fechar ratings/comentarios.
3. Fechar recomendacao baseline.
4. Fechar explicabilidade.
5. Consolidar descoberta e preparar handoff para monetizacao.

### Critérios de conclusão da macro — alunos

- Descoberta e comunidade funcionais sem quebrar core.

---

## MF4 - Monetizacao solidaria

### Sequencia

1. `BK-MF4-01`
2. `BK-MF4-02`
3. `BK-MF4-08`
4. `BK-MF4-03`
5. `BK-MF4-04`
6. `BK-MF4-05`
7. `BK-MF4-06`

### Guias disponiveis

- `BK-MF4-01`: `../guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md`
- `BK-MF4-02`: `../guias-bk/MF4/BK-MF4-02-metodos-pagamento-simulados-trial.md`
- `BK-MF4-03`: `../guias-bk/MF4/BK-MF4-03-candidaturas-associacoes.md`
- `BK-MF4-04`: `../guias-bk/MF4/BK-MF4-04-aprovacao-entrada-pool.md`
- `BK-MF4-05`: `../guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md`
- `BK-MF4-06`: `../guias-bk/MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md`
- `BK-MF4-08`: `../guias-bk/MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md`

### Step-by-step

1. Fechar planos/subscricao.
2. Fechar pagamento simulado/trial.
3. Fechar candidaturas/aprovacoes.
4. Fechar distribuicao da pool.
5. Fechar relatorios/notificacoes.
6. Fechar evidencias da pool solidaria para gate.

### Critérios de conclusão da macro — alunos

- Subscricoes e pool auditaveis.

---

## MF5 - Operacao e privacidade

### Sequencia

1. `BK-MF5-04`
2. `BK-MF5-01`
3. `BK-MF5-02`
4. `BK-MF5-03`
5. `BK-MF5-05`
6. `BK-MF5-06`

### Guias disponiveis

- `BK-MF5-01`: `../guias-bk/MF5/BK-MF5-01-exportacao-dados-utilizador.md`
- `BK-MF5-02`: `../guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md`
- `BK-MF5-03`: `../guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md`
- `BK-MF5-04`: `../guias-bk/MF5/BK-MF5-04-gestao-de-utilizadores-admin.md`
- `BK-MF5-05`: `../guias-bk/MF5/BK-MF5-05-painel-de-metricas-admin.md`
- `BK-MF5-06`: `../guias-bk/MF5/BK-MF5-06-configuracao-de-integracoes-admin.md`

### Step-by-step

1. Fechar a base administrativa de `BK-MF5-04` na Sprint 8.
2. Fechar RGPD na Sprint 9.
3. Fechar metricas/integracoes depois da base administrativa.
4. Consolidar handoff para regressao e hardening.

### Critérios de conclusão da macro — alunos

- RGPD e operacao admin completos.

---

## MF6 - Hardening tecnico

### Sequencia

1. `BK-MF6-01`
2. `BK-MF6-02`
3. `BK-MF6-03`
4. `BK-MF6-04`
5. `BK-MF6-05`
6. `BK-MF6-06`

### Guias disponiveis

- `BK-MF6-01`: `../guias-bk/MF6/BK-MF6-01-suite-de-regressao-backend.md`
- `BK-MF6-02`: `../guias-bk/MF6/BK-MF6-02-suite-de-regressao-frontend.md`
- `BK-MF6-03`: `../guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md`
- `BK-MF6-04`: `../guias-bk/MF6/BK-MF6-04-otimizacao-de-performance-critica.md`
- `BK-MF6-05`: `../guias-bk/MF6/BK-MF6-05-acessibilidade-e-ux-final.md`
- `BK-MF6-06`: `../guias-bk/MF6/BK-MF6-06-validacao-tecnica-final-por-gate.md`

### Step-by-step

1. Regressao BE.
2. Regressao FE.
3. Hardening de seguranca.
4. Otimizacao de performance.
5. Acessibilidade e UX final.
6. Gate tecnico do Nuno.

### Critérios de conclusão da macro — alunos

- Sem falhas criticas e gate aprovado.

---

## MF7 - Refinamento de UI e navegacao segura

### Sequencia

1. `BK-MF7-01`
2. `BK-MF7-02`
3. `BK-MF7-03`
4. `BK-MF7-04`
5. `BK-MF7-05`

### Guias disponiveis

- `BK-MF7-01`: `../guias-bk/MF7/BK-MF7-01-inventario-ui-vs-mockup-plano-refinamento.md`
- `BK-MF7-02`: `../guias-bk/MF7/BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md`
- `BK-MF7-03`: `../guias-bk/MF7/BK-MF7-03-layout-tokens-header-alinhados-mockup.md`
- `BK-MF7-04`: `../guias-bk/MF7/BK-MF7-04-refinamento-paginas-principais-estados-ux.md`
- `BK-MF7-05`: `../guias-bk/MF7/BK-MF7-05-gate-visual-responsividade-navegacao-segura.md`

### Step-by-step

1. Inventario UI vs mockup e plano de refinamento.
2. Navegacao segura por sessao e perfil.
3. Layout, tokens e header alinhados ao mockup.
4. Refinamento das paginas principais e estados de UX.
5. Gate visual, responsividade e navegacao segura.

### Critérios de conclusão da macro — alunos

- UI defensavel, responsiva e com navegacao segura por perfil.

---

## MF8 - Fecho pratico, testes, readiness, matriz, riscos e scope freeze

### Sequencia

1. `BK-MF8-01`
2. `BK-MF8-02`
3. `BK-MF8-03`
4. `BK-MF8-04`
5. `BK-MF8-05`
6. `BK-MF8-06`
7. `BK-MF8-07`
8. `BK-MF8-08`
9. `BK-MF8-09`
10. `BK-MF8-10`

### Guias disponiveis

- `BK-MF8-01`: `../guias-bk/MF8/BK-MF8-01-alinhamento-visual-parte-i.md`
- `BK-MF8-02`: `../guias-bk/MF8/BK-MF8-02-alinhamento-visual-parte-ii.md`
- `BK-MF8-03`: `../guias-bk/MF8/BK-MF8-03-criacao-testes-finais-aplicacao.md`
- `BK-MF8-04`: `../guias-bk/MF8/BK-MF8-04-painel-readiness-operacional.md`
- `BK-MF8-05`: `../guias-bk/MF8/BK-MF8-05-auditoria-administrativa-final.md`
- `BK-MF8-06`: `../guias-bk/MF8/BK-MF8-06-matriz-final.md`
- `BK-MF8-07`: `../guias-bk/MF8/BK-MF8-07-lista-riscos-totais.md`
- `BK-MF8-08`: `../guias-bk/MF8/BK-MF8-08-execucao-testes-report-erros.md`
- `BK-MF8-09`: `../guias-bk/MF8/BK-MF8-09-correcao-erros-report.md`
- `BK-MF8-10`: `../guias-bk/MF8/BK-MF8-10-scope-freeze.md`

### Step-by-step

1. Alinhamento visual parte I.
2. Alinhamento visual parte II.
3. Criacao de testes finais da aplicacao.
4. Painel de readiness.
5. Auditoria administrativa final.
6. Matriz final.
7. Lista de riscos totais.
8. Execucao de testes e report de erros.
9. Correcao de erros do report anterior.
10. Scope Freeze.

### Critérios de conclusão da macro — alunos

- Frontend real alinhado ao mockup, testes finais preparados e executados, readiness e auditoria administrativa fechados, matriz final colocada depois do trabalho tecnico, riscos totais registados, erros tratados e scope congelado.

---

## MF9 - Plano Pro/Familia, partilha real e qualidade de streaming

### Sequencia

1. `BK-MF9-01`
2. `BK-MF9-02`
3. `BK-MF9-03`
4. `BK-MF9-04`
5. `BK-MF9-05`
6. `BK-MF9-06`

### Guias disponiveis

- `BK-MF9-01`: `../guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md`
- `BK-MF9-02`: `../guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`
- `BK-MF9-03`: `../guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`
- `BK-MF9-04`: `../guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md`
- `BK-MF9-05`: `../guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md`
- `BK-MF9-06`: `../guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md`

### Step-by-step

1. Atualizar planos Pro/Familia e entitlements.
2. Aplicar qualidade de streaming por plano.
3. Criar modelo e API de partilha familiar real.
4. Criar UI de gestao familiar e convites.
5. Integrar privacidade, operacao e metricas com familia.
6. Executar gate MF9, regressao e evidencia final.

### Critérios de conclusão da macro — alunos

- Objetivo dos alunos: demonstrar planos Pro/Familia, partilha entre contas,
  qualidade limitada pelo backend e reflexo em RGPD/metricas, com evidence
  própria suficiente para decisão no gate S13.
- Estado da referência docente em 2026-07-10: contratos locais e media
  sintética parcialmente validados, mas full E2E MF9, 4K real, streaming real e
  gate S13 atual continuam não revalidados.

## Changelog

- `2026-04-11`: versao revista com equipa correta e ownership atualizado.
- `2026-04-12`: blocos "Guias disponiveis" sincronizados para cobertura total (MF0..MF8), sem entradas pendentes.
- `2026-04-13`: ordem de sequencia normalizada para derivar de `PLANO-SPRINTS` (fonte canonica).
- `2026-06-22`: sequencias MF3/MF4/MF5 alinhadas ao rebaseline de escopo MVP com limpeza de itens fora de escopo.
- `2026-05-25`: reforcada nota anti-drift para impedir leitura de `MF0` como fase de implementacao funcional.

- `2026-06-22`: atualizadas MF7/MF8 para nova cadeia.
- `2026-06-27`: MF8 condensada para 10 BKs finais, com alinhamento visual, testes, readiness, auditoria, matriz final, riscos totais, report, correcao e freeze.
- `2026-06-30`: adicionada MF9 com 6 BKs para Pro/Familia, partilha familiar real, qualidade por plano e gate S13.
- `2026-07-10`: explicitada a baseline ativa 66/66/94/13 e separada a lane dos alunos da evidence da referência docente.
