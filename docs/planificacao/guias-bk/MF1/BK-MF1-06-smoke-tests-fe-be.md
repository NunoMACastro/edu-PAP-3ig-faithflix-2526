# BK-MF1-06 - Smoke tests FE/BE

## Header

- `doc_id`: `GUIA-BK-MF1-06`
- `bk_id`: `BK-MF1-06`
- `macro`: `MF1`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-03,BK-MF1-04`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 2`
- `sprint`: `S02`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-01`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`
- `last_updated`: `2026-05-27`

## Bloco pedagogico (obrigatorio)

Este BK ensina a fechar a fundacao tecnica com smoke tests. Smoke tests nao provam tudo; provam que os caminhos essenciais ainda respiram: backend arranca, health responde, sessao base devolve 401 quando deve, frontend compila e cliente API trata erros.

O objetivo pedagogico e perceber a diferenca entre teste unitario, teste de integracao e smoke test. Nesta fase queremos testes pequenos e rapidos para apanhar quebras obvias antes de avançar para `MF2`, onde começam funcionalidades de autenticação e produto.

## Bloco operacional (obrigatorio)

O trabalho operacional e criar scripts de smoke para backend e frontend, usando ferramentas simples. No backend, usar `node:test` sempre que possivel. No frontend, usar `npm run build` como smoke inicial, sem introduzir framework de testes pesada antes de haver necessidade.

#### BK-MF1-06 - Smoke tests FE/BE

##### O que vamos fazer neste BK

Neste BK vamos criar uma suite minima de smoke tests para a fundacao tecnica da FaithFlix. A suite deve validar que backend e frontend continuam funcionais depois dos BKs `MF1-01..05`.

Os testes devem cobrir o essencial: `/health`, rota inexistente, sessao sem cookie, cookie falso, build frontend e comportamento base do cliente API. Como `RNF29` pede testes automatizados para modulos criticos, esta fase cria a disciplina e scripts; os testes funcionais de auth, subscricoes, reproducao e pool solidaria entram nas macros onde essas features existirem.

Este BK tambem cria o handoff final para `BK-MF2-01`: antes de construir registo/login, a equipa deve conseguir correr smoke e saber se a fundacao tecnica esta estavel.

##### Porque e que isto e importante

- Impede que MF2 comece sobre uma base partida.
- Cria habito de validar antes de fechar BK.
- Dá evidence objetiva para a defesa.
- Ajuda a equipa a perceber rapidamente se backend ou frontend falhou.
- Prepara regressao futura sem adicionar complexidade excessiva.

##### O que entra (scope)

- Criar scripts de smoke backend.
- Criar/verificar build smoke frontend.
- Criar comando agregador `smoke`.
- Testar `/health`, 404, `/api/session/me` sem cookie e cookie falso.
- Testar que frontend compila.
- Testar cliente API em pelo menos um cenario de erro controlado quando possivel.
- Criar template de evidence para MF1.

##### O que nao entra (scope-out)

- Nao entra teste E2E completo de login/catalogo/streaming.
- Nao entra Playwright/Cypress por defeito nesta fase.
- Nao entra testar subscricoes, pagamentos ou pool solidaria.
- Nao entra criar utilizadores seed reais.
- Nao entra marcar `RNF29` totalmente fechado para features que ainda nao existem.

##### Como saber que isto ficou bem

- Um colega consegue correr um comando e validar FE/BE.
- Backend smoke cobre sucesso e negativos principais.
- Frontend build passa.
- Falhas devolvem mensagens claras no terminal.
- `BK-MF2-01` recebe uma base testavel antes de implementar auth real.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P1` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `M` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF1` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Kaue` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Mateus` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF1-03,BK-MF1-04` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: cliente API frontend e sessao base backend existem; por sequencia, `/health` de `BK-MF1-05` deve estar disponivel para smoke (DERIVADO)
- Ref. Plano: `MF-VIEWS > MF1`, `PLANO-SPRINTS > Sprint 2`, `MATRIZ-CANONICA-BK > RNF29` (CANONICO)
- Flow ID: `MF1-smoke-fe-be-06` (DERIVADO)
- Fonte de verdade: `docs/RNF.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Descricao: criar smoke tests FE/BE para validar a fundacao tecnica antes de entrar em funcionalidades MF2 (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Criar testes backend com `node:test`.
- Exportar `createApp()` de forma testavel.
- Criar helper de teste para arrancar servidor em porta livre.
- Validar `/health`, 404 e sessao base.
- Criar scripts `smoke:backend`, `smoke:frontend` e `smoke`.
- Usar `npm run build` como smoke frontend.
- Criar evidence final da MF1 com comandos e resultados.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: backend e frontend existem, mas validacao ainda e manual e dispersa.
- Estado esperado depois do BK: existe comando de smoke documentado e repetivel para FE/BE.
- Ficheiros a criar: `backend/tests/smoke/app.smoke.test.js`, `backend/tests/helpers/test-server.js`, `docs/evidence/MF1/README.md` se a equipa ainda nao tiver local de evidence.
- Ficheiros a editar: `backend/package.json`, `frontend/package.json` se necessario, `package.json` na raiz se a equipa decidir criar agregador, `backend/README.md`, `frontend/README.md`.
- Ficheiros a rever: `frontend/src/services/api/apiClient.js`, `backend/src/app.js`, `backend/src/modules/auth/`, `backend/src/modules/system/health.*`.
- Dependencias de BK anteriores e uso: depende de `BK-MF1-03` para cliente API e `BK-MF1-04` para sessao base; usa `/health` de `BK-MF1-05` por sequencia da macro.
- Impacto na arquitetura da app: cria camada de validacao rapida sem mudar features.
- Impacto frontend: valida build e client API em cenarios controlados.
- Impacto backend: valida endpoints tecnicos e negativos de sessao.
- Impacto dados: nenhum.
- Impacto seguranca: confirma que anonimos e cookies falsos nao autenticam.
- Impacto testes: estabelece base de regressao.
- Impacto UI: build garante que UI placeholder nao esta quebrada; screenshots manuais podem complementar.
- Handoff para o proximo BK: `BK-MF2-01` deve começar com smoke verde e acrescentar testes de auth real.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `docs/RNF.md`: `RNF29`.
- Guia `BK-MF1-03`: cliente API e erros.
- Guia `BK-MF1-04`: rotas de sessao e negativos.
- Guia `BK-MF1-05`: `/health` e request id.
- `backend/src/app.js`: export `createApp()`.
- `frontend/package.json` e `backend/package.json`: scripts existentes.

#### Glossario (rapido) (DERIVADO):

- Smoke test: teste rapido que confirma se a app esta minimamente funcional.
- Teste unitario: testa uma funcao isolada.
- Teste de integracao: testa varias partes em conjunto.
- Regressao: erro que reaparece depois de uma alteracao.
- Fixture: dados preparados para teste.
- Helper de teste: funcao auxiliar para reduzir repeticao nos testes.
- Porta livre: porta escolhida automaticamente pelo sistema para evitar conflitos.
- CI: sistema que corre testes automaticamente em commits/PRs.
- Exit code: codigo que indica sucesso ou falha de um comando.
- Evidence: prova objetiva usada no PR/defesa.

#### Conceitos teoricos essenciais (DERIVADO):

**Smoke tests.** Um smoke test nao substitui testes completos. Ele responde a pergunta: "a base ainda arranca e responde ao minimo esperado?". E ideal para correr antes de começar trabalho novo.

**`node:test`.** Node.js inclui um runner de testes nativo. Para a fundacao backend, isto evita adicionar Jest/Vitest antes de haver necessidade clara.

**Testar Express sem porta fixa.** Importar `createApp()` permite iniciar a app numa porta livre durante o teste. Assim nao falha porque a porta 3000 esta ocupada.

**Build frontend como teste.** Antes de haver testes de componentes, `npm run build` ja apanha imports quebrados, erros de sintaxe e muitos problemas de bundling.

**Negativos automatizados.** Testar apenas casos felizes cria falsa seguranca. Aqui e essencial provar que anonimo recebe 401 e rota errada recebe 404.

**Erros comuns.** Criar testes que dependem da ordem do computador, usar dados reais, exigir BD inexistente, deixar servidor de teste aberto ou mascarar falhas com `|| true`.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): Confirmar pre-condicoes da MF1**
   - Descricao detalhada do objetivo: verificar que os BKs tecnicos anteriores existem antes de testar.
   - Justificacao: smoke sobre base incompleta gera ruido.
   - Como fazer (0.1): confirmar `frontend/src/services/api/apiClient.js`.
   - Como fazer (0.2): confirmar `backend/src/modules/auth/` e `/health` se `BK-MF1-05` ja foi executado.
   - Ficheiro a rever: `docs/planificacao/backlogs/BACKLOG-MVP.md`
   - Ficheiro alvo: nenhum ainda.
   - Snippet de referencia: `dependencias: BK-MF1-03,BK-MF1-04`
   - O que verificar: dependencias canonicas existem; se `/health` faltar, registar blocker de sequencia.

1. **Objetivo (~25 min): Preparar helper de servidor de teste**
   - Descricao detalhada do objetivo: criar forma de arrancar Express em porta livre.
   - Justificacao: testes nao devem depender da porta 3000 estar livre.
   - Como fazer (1.1): criar `backend/tests/helpers/test-server.js`.
   - Como fazer (1.2): exportar `startTestServer()` que chama `createApp().listen(0)`.
   - Ficheiro a rever: `backend/src/app.js`
   - Ficheiro alvo: `backend/tests/helpers/test-server.js`
   - Snippet de referencia:
     ```js
     const server = app.listen(0);
     const { port } = server.address();
     ```
   - O que verificar: o helper fecha o servidor no fim do teste.

2. **Objetivo (~30 min): Criar smoke backend para `/health` e `/api`**
   - Descricao detalhada do objetivo: testar endpoints tecnicos positivos.
   - Justificacao: health e API base sao o minimo da fundacao backend.
   - Como fazer (2.1): criar `backend/tests/smoke/app.smoke.test.js`.
   - Como fazer (2.2): usar `fetch` para chamar `/health` e `/api`.
   - Ficheiro a rever: `backend/src/modules/system/`
   - Ficheiro alvo: `backend/tests/smoke/app.smoke.test.js`
   - Snippet de referencia:
     ```js
     test('GET /health responde ok', async () => {
       const response = await fetch(`${baseUrl}/health`);
       assert.equal(response.status, 200);
     });
     ```
   - O que verificar: teste falha se endpoint desaparecer.

3. **Objetivo (~30 min): Criar negativos backend**
   - Descricao detalhada do objetivo: automatizar rotas que devem falhar de forma controlada.
   - Justificacao: negativos protegem seguranca e robustez.
   - Como fazer (3.1): testar `GET /api/nao-existe` e esperar 404.
   - Como fazer (3.2): testar `/api/session/me` sem cookie e com cookie falso, esperando 401.
   - Ficheiro a rever: `backend/src/modules/auth/auth.routes.js`
   - Ficheiro alvo: `backend/tests/smoke/app.smoke.test.js`
   - Snippet de referencia:
     ```js
     const response = await fetch(`${baseUrl}/api/session/me`, { headers: { cookie: 'faithflix_session=falso' } });
     assert.equal(response.status, 401);
     ```
   - O que verificar: cookie falso nunca autentica.

4. **Objetivo (~20 min): Ligar scripts backend**
   - Descricao detalhada do objetivo: garantir que `npm test` ou `npm run smoke:backend` corre os testes.
   - Justificacao: comandos claros reduzem erro humano.
   - Como fazer (4.1): confirmar script `"test": "node --test"` em `backend/package.json`.
   - Como fazer (4.2): se necessario, adicionar `"smoke": "node --test tests/smoke/*.test.js"`.
   - Ficheiro a rever: `backend/package.json`
   - Ficheiro alvo: `backend/package.json`
   - Snippet de referencia:
     ```json
     {
       "scripts": {
         "smoke": "node --test tests/smoke/*.test.js"
       }
     }
     ```
   - O que verificar: comando falha com exit code diferente de 0 quando teste falha.

5. **Objetivo (~20 min): Definir smoke frontend**
   - Descricao detalhada do objetivo: usar build como validacao minima do frontend.
   - Justificacao: ainda nao ha componentes funcionais suficientes para justificar framework adicional.
   - Como fazer (5.1): executar `npm run build` em `frontend/`.
   - Como fazer (5.2): se houver avisos relevantes, corrigir imports/rotas antes de avançar.
   - Ficheiro a rever: `frontend/package.json`
   - Ficheiro alvo: `frontend/package.json`
   - Snippet de referencia:
     ```json
     {
       "scripts": {
         "smoke": "npm run build"
       }
     }
     ```
   - O que verificar: build falha se uma rota importar ficheiro inexistente.

6. **Objetivo (~25 min): Criar comando agregador opcional**
   - Descricao detalhada do objetivo: permitir correr FE/BE com um unico comando da raiz.
   - Justificacao: facilita validacao por professor/colegas.
   - Como fazer (6.1): se nao existir `package.json` na raiz, ponderar criar um apenas para scripts de orquestracao.
   - Como fazer (6.2): adicionar `smoke:backend`, `smoke:frontend` e `smoke`.
   - Ficheiro a rever: `backend/package.json`, `frontend/package.json`
   - Ficheiro alvo: `package.json` na raiz, se a equipa decidir criar.
   - Snippet de referencia:
     ```json
     {
       "scripts": {
         "smoke:backend": "npm --prefix backend run smoke",
         "smoke:frontend": "npm --prefix frontend run smoke",
         "smoke": "npm run smoke:backend && npm run smoke:frontend"
       }
     }
     ```
   - O que verificar: comando agregado nao esconde falhas.

7. **Objetivo (~25 min): Registar evidence e handoff para MF2**
   - Descricao detalhada do objetivo: guardar resultados dos comandos e preparar proximo BK.
   - Justificacao: `BK-MF2-01` deve começar com fundacao verde e evidenciada.
   - Como fazer (7.1): preencher `pr`, `proof`, `neg`, `files`, `commands`, `notes`.
   - Como fazer (7.2): criar ou atualizar `docs/evidence/MF1/README.md` se a equipa usar evidence em ficheiro.
   - Ficheiro a rever: `docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md`
   - Ficheiro alvo: evidence do PR/defesa
   - Snippet de referencia:
     ```md
     Smoke MF1 verde antes de iniciar BK-MF2-01.
     ```
   - O que verificar: MF2 recebe comandos, resultados e riscos residuais.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] `npm --prefix backend run smoke` passa.
- [ ] `npm --prefix frontend run smoke` ou `npm --prefix frontend run build` passa.
- [ ] Comando agregado passa, se existir.
- [ ] Evidence regista outputs.

**Negativos**
- [ ] Passo: 3; input/acao: `GET /api/nao-existe`; resultado esperado: 404 JSON; risco que cobre: regressao do middleware 404.
- [ ] Passo: 3; input/acao: `GET /api/session/me` sem cookie; resultado esperado: 401 JSON; risco que cobre: acesso anonimo indevido.
- [ ] Passo: 3; input/acao: `GET /api/session/me` com cookie falso; resultado esperado: 401 JSON; risco que cobre: token nao validado aceite.

**Tecnico**
- [ ] Testes usam `createApp()` e porta livre.
- [ ] Servidor de teste fecha no fim.
- [ ] Scripts falham quando teste falha.
- [ ] Sem dependencias novas pesadas.

**Regressao das fases anteriores**
- [ ] Cliente API de `BK-MF1-03` continua a compilar.
- [ ] Sessao base de `BK-MF1-04` continua a rejeitar anonimos.
- [ ] Health/logs de `BK-MF1-05` continuam disponiveis se o BK ja foi executado.

**UI/mockup**
- [ ] Build frontend confirma que placeholders inspirados no mockup continuam validos.
- [ ] Nao e exigido pixel-perfect.

**Seguranca**
- [ ] Testes cobrem cookie ausente e falso.
- [ ] Outputs de teste nao mostram cookies reais.
- [ ] Nao existem seeds com passwords reais.

#### Criterios de aceite:

**Outputs:**
- Smoke backend criado.
- Smoke frontend definido.
- Scripts documentados.
- Evidence da MF1 preparada.

**Verificacoes:**
- Backend smoke passa.
- Frontend build/smoke passa.
- Negativos 404/401 passam.
- Comando agregado passa se existir.

**Qualidade:**
- Testes sao pequenos, rapidos e deterministas.
- Nao dependem de BD, pagamentos ou rede externa.
- Falhas sao visiveis por exit code.

**Continuidade:**
- `BK-MF2-01` pode começar com smoke verde.
- Testes de auth real devem ser adicionados sobre esta base.
- Fases futuras podem expandir smoke para catalogo, streaming e subscricoes.

**Evidencia:**
- Output dos comandos.
- Lista de testes executados.
- Negativos documentados.
- Riscos residuais para MF2.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `backend/tests/smoke/app.smoke.test.js`, `backend/tests/helpers/test-server.js`, `backend/package.json`, `frontend/package.json`, `package.json` opcional da raiz, `docs/evidence/MF1/README.md`
- `commands`: `npm --prefix backend run smoke`, `npm --prefix frontend run build`, `npm run smoke` se existir
- `screenshots`: `Opcional; preferir output de terminal dos testes`
- `notes`: `RNF29 fica preparado para expansao; testes funcionais completos entram quando as features existirem`

#### TODOs

- TODO: adicionar testes de autenticação real em `BK-MF2-01`.
- TODO: adicionar testes de catalogo quando `BK-MF2-03` existir.
- TODO: decidir se Playwright/Cypress faz sentido para E2E em `BK-MF2-08` ou fase posterior.
- TODO (BLOCKER): se `BK-MF1-03` ou `BK-MF1-04` nao estiverem executados, nao fechar este BK como validado.
- FOLLOW-UP: `BK-MF2-01` deve acrescentar testes para login valido, credenciais invalidas e logout.
- FOLLOW-UP: `BK-MF6` deve transformar estes smokes em suite de regressao mais completa.
- Assuncao tecnica: usar `node:test` no backend e `npm run build` no frontend para reduzir dependencias nesta fase.
- Decisoes dependentes de mockup: nenhuma, alem de garantir que build das paginas placeholder continua valido.
- Decisoes dependentes de app/codigo ainda inexistente: comando agregado na raiz depende da estrutura final escolhida pela equipa.

## Snippet tecnico aplicavel

```js
// backend/tests/helpers/test-server.js
import { createApp } from '../../src/app.js';

export async function startTestServer() {
  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}
```

## Proximo BK recomendado

`BK-MF2-01`, registo/login/recuperacao de password, deve arrancar apenas depois de smoke MF1 estar verde ou com blockers registados.

## Changelog

- `2026-05-27`: refinado para guia executavel de smoke tests FE/BE, com handoff explicito para a primeira feature funcional da MF2.
