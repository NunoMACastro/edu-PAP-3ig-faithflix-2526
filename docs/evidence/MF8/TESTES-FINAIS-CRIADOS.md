# Testes finais criados - MF8

## Metadados

- BK: `BK-MF8-03`
- Data: 2026-06-29
- Dependencia consumida: `BK-MF8-02`
- Fonte principal: `RNF29`
- Escopo: inventario, matriz, lacunas, comandos seguros e handoff dos testes finais
- Estado da suite: `PRONTA_COM_RESSALVAS`
- Decisao documental: `PASS_COM_RISCOS`

## Fontes revistas

- `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
- `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
- `docs/evidence/MF6/GATE-S12-MF6.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `backend/package.json`
- `frontend/package.json`
- `backend/tests/`
- `frontend/scripts/check-frontend-regression.mjs`
- `backend/scripts/check-security-baseline.mjs`
- `tests/e2e/`

## Inventario de comandos

| ID | Camada | Ficheiro ou artefacto | Comando/procedimento | Estado | Justificacao |
| --- | --- | --- | --- | --- | --- |
| `TST-MF8-BE-UNIT-VALIDACAO` | Backend unitario | `backend/tests/unit/*.test.js` | `npm --prefix backend test` | `EXISTE` | A suite inclui validadores e regras de dominio de MF2, MF3, MF4 e MF5, com negativos de input, ownership e privacidade. |
| `TST-MF8-BE-INT-HTTP` | Backend integracao HTTP | `backend/tests/integration/*.test.js` | `npm --prefix backend test` | `EXISTE` | Ha testes HTTP para ratings, comentarios, pesquisa, discovery, recomendacoes e associacoes, com base de dados controlada. |
| `TST-MF8-BE-SMOKE-HEALTH` | Backend smoke | `backend/tests/smoke/app.smoke.test.js` | `npm --prefix backend run smoke` | `EXISTE` | Cobre `/health`, `/api`, CORS local, 404 JSON, sessao anonima e cookie invalido. |
| `TST-MF8-BE-REG-HARDENING` | Backend regressao/hardening | `backend/tests/regression/mf6-backend-regression.test.js`; `backend/scripts/check-security-baseline.mjs` | `npm --prefix backend test`; `node backend/scripts/check-security-baseline.mjs` | `EXISTE` | Protege contratos finais de auth, subscricoes, playback, catalogo, pool e rotas admin. |
| `TST-MF8-FE-BUILD` | Frontend build | `frontend/` | `npm --prefix frontend run build` | `EXISTE` | Confirma imports, React/Vite e bundle final. |
| `TST-MF8-FE-SMOKE` | Frontend smoke | `frontend/` | `npm --prefix frontend run smoke` | `EXISTE` | O smoke atual executa o build, suficiente como smoke tecnico sem browser. |
| `TST-MF8-FE-REG` | Frontend regressao | `frontend/scripts/check-frontend-regression.mjs` | `cd frontend && node scripts/check-frontend-regression.mjs` | `EXISTE` | Verifica rotas, paginas principais, estados de UI, `apiClient` com cookies e acessibilidade base. |
| `TST-MF8-MANUAL-CRITICO` | Manual funcional | `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Procedimento manual por fluxo | `MANUAL` | Login, catalogo, detalhe, playback, planos, conta, admin e privacidade precisam de observacao humana final em `BK-MF8-08`. |
| `TST-MF8-VISUAL-RESP` | Visual/responsivo | `docs/evidence/MF7/browser/`; `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Screenshots por viewport e checklist visual | `MANUAL` | MF7 tem screenshots representativos; MF8 deve executar sweep visual consolidado em `BK-MF8-08`. |
| `TST-MF8-E2E-MF2` | E2E principal | `tests/e2e/mf2-flow.spec.js` | `npm run e2e:mf2` | `BLOQUEADO_AMBIENTE` | Exige Playwright e base de dados local configurada; fica preparado para execucao quando o ambiente estiver pronto. |
| `TST-MF8-E2E-MF4` | E2E monetizacao/pool | `tests/e2e/mf4-flow.spec.js` | `npm run e2e:mf4` | `BLOQUEADO_AMBIENTE` | Exige Playwright, seed controlado e base de dados local; nao substitui os testes backend ja existentes. |

## Matriz obrigatoria por teste

| id | camada | ficheiro | comando | RF/RNF | o que valida | porque e necessario | dados usados | assertions principais | cenario negativo | expected result | quando falha | como corrigir ou classificar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `TST-MF8-BE-UNIT-VALIDACAO` | Backend unitario | `backend/tests/unit/*.test.js` | `npm --prefix backend test` | `RNF29`; RF de identidade, catalogo, streaming, subscricao, pool, privacidade e admin | Valida regras pequenas antes do HTTP: email, password, catalogo, progresso, pesquisa, pagamentos simulados, consentimentos e integracoes. | Evita que input invalido ou regra de dominio partida avance para rotas reais. | Fixtures em memoria, payloads validos e invalidos, ObjectId controlado e datas previsiveis. | Valores normalizados, erros lancados, campos sensiveis removidos, ownership preservado. | Password fraca, pesquisa curta, rating invalido, trial repetido, conta bloqueada ou configuracao publica com segredo. | Testes passam e erros invalidos sao previsiveis. | Falha indica regressao de regra local; corrigir no modulo de dominio ou classificar como `FAIL` se o contrato mudou sem BK. |
| `TST-MF8-BE-INT-HTTP` | Backend integracao HTTP | `backend/tests/integration/*.test.js` | `npm --prefix backend test` | `RNF29`; RF de ratings, comentarios, pesquisa, recomendacao e associacoes | Valida rotas, status HTTP, payloads e ligacao entre controller, service e DB controlada. | A defesa precisa de prova de que a API real responde por contratos HTTP, nao apenas funcoes isoladas. | DB fake controlada, conteudos publicados, associacao publica e pedidos sem cookie. | `200` em fluxos positivos, `401` sem autenticacao, `400` para input invalido, payload sem dados privados. | Pedido privado sem cookie, rota de subscricao direta sem checkout ou comentario sem permissao. | Respostas coerentes e sem crash. | Corrigir rota/controller/service; se a porta local for bloqueada pelo ambiente, classificar como `BLOQUEADO_AMBIENTE`. |
| `TST-MF8-BE-SMOKE-HEALTH` | Backend smoke | `backend/tests/smoke/app.smoke.test.js` | `npm --prefix backend run smoke` | `RNF29`, `RNF30`, `RNF31` | Confirma que API arranca, `/health` responde, `/api` responde, CORS local e sessao anonima sao seguros. | E o primeiro sinal de que middlewares, logging, CORS e tratamento de erros estao operacionais. | Servidor de teste local, origem `127.0.0.1:5173`, rota inexistente e cookie falso. | `status 200`, `x-request-id`, `body.status="ok"`, `404` JSON, `user null`. | Cookie `faithflix_session=falso` e rota inexistente. | API responde sem autenticar utilizador falso e sem expor stack trace. | Corrigir middleware/health/session/error handler; se a sandbox bloquear `listen`, repetir fora da sandbox ou marcar ambiente. |
| `TST-MF8-BE-REG-HARDENING` | Backend regressao/hardening | `backend/tests/regression/mf6-backend-regression.test.js`; `backend/scripts/check-security-baseline.mjs` | `npm --prefix backend test`; `node backend/scripts/check-security-baseline.mjs` | `RNF14..RNF20`, `RNF29`, `RNF30` | Protege contratos finais de seguranca, catalogo publicado, playback, pool solidaria e admin. | Evita regressao em areas criticas antes da entrega final. | DB em memoria, sessao simulada, subscricoes, associacoes e rotas admin. | Auth normalizado, draft nao exposto, progresso limitado, distribuicao mensal, role admin exigida, scanner sem segredos. | Role comum em rota admin, segredo literal, `deleteMany({})`, storage de sessao no browser ou pagamento real inventado. | Regressao e scanner passam sem violations funcionais. | Corrigir causa raiz de seguranca; falso positivo deve ser justificado com ficheiro e contexto. |
| `TST-MF8-FE-BUILD` | Frontend build | `frontend/` | `npm --prefix frontend run build` | `RNF21`, `RNF22`, `RNF38`, `RNF40` | Confirma que a interface compila e que imports/rotas/componentes resolvem. | Sem build verde, a app nao e entregavel nem demonstravel. | Codigo React/Vite e variavel publica `VITE_API_BASE_URL` quando aplicavel. | Build termina sem erro, bundle gerado, sem import quebrado. | Import removido, rota quebrada ou dependencia ausente. | Vite gera bundle final. | Corrigir import, componente ou dependencia existente; nao adicionar dependencia sem justificacao. |
| `TST-MF8-FE-SMOKE` | Frontend smoke | `frontend/` | `npm --prefix frontend run smoke` | `RNF21`, `RNF22` | Reexecuta o build como smoke tecnico curto. | Da um comando simples para confirmar que a app abre caminho para demonstracao. | Mesmo contexto do build. | Exit code `0`. | Falha de build ou dependencia local. | Smoke passa. | Corrigir como build; se faltar `node_modules`, classificar como `BLOQUEADO_AMBIENTE`. |
| `TST-MF8-FE-REG` | Frontend regressao | `frontend/scripts/check-frontend-regression.mjs` | `cd frontend && node scripts/check-frontend-regression.mjs` | `RNF21`, `RNF22`, `RNF38`, `RNF40` | Verifica ficheiros, rotas, estados loading/error/empty, `credentials: "include"` e contratos de acessibilidade. | A build pode passar mesmo com rota ou estado de UI removido; este check protege contratos de produto. | Leitura estatica de `src/`, rotas e componentes principais. | Ficheiros existem, rotas existem, markers de UI existem, `apiClient` envia cookies. | Remover rota, remover `EmptyState`, remover `SkipLink` ou retirar cookies do cliente API. | Script imprime `Regressao frontend MF6: PASS`. | Corrigir rota/componente/cliente API; se o contrato mudou, registar drift e nova decisao documental. |
| `TST-MF8-MANUAL-CRITICO` | Manual funcional | `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Checklist manual em `BK-MF8-08` | `RNF29` e RF ativos do MVP | Confirma fluxos essenciais vistos por pessoa: login, catalogo, detalhe, playback, planos, conta, admin e privacidade. | Ha riscos de UX e fluxo que testes estaticos nao captam. | Perfis visitante, user, moderator e admin; rotas listadas no handoff de `BK-MF8-02`. | Cada fluxo tem rota, perfil, acao, observed, expected, evidence e decisao. | User comum em admin, erro cru, layout quebrado, plano que promete pagamento real ou playback sem permissao. | Todos os P0 passam ou ficam com ressalva aceite e owner. | Corrigir em `BK-MF8-09` se for bug; classificar ambiente quando depende de seed/credencial indisponivel. |
| `TST-MF8-VISUAL-RESP` | Visual/responsivo | `docs/evidence/MF7/browser/`; `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Screenshots/checklist em 390, 768, 1366 e 1440px | `RNF21`, `RNF22`, `RNF38`, `RNF40` | Confirma ausencia de sobreposicao, textos legiveis, foco e navegacao basica. | A defesa pode falhar visualmente mesmo com testes tecnicos verdes. | Viewports representativos e paginas home, catalogo, admin bloqueado, admin home e skip link. | Screenshot identificado por rota, viewport, perfil e decisao. | Texto cortado, botao inacessivel, foco invisivel ou screenshot sem contexto. | Evidence visual suficiente para `GO_COM_RESSALVAS` ou `GO`. | Corrigir UI se bloqueante; se for revisao humana residual, transportar para riscos totais. |
| `TST-MF8-E2E-MF2` | E2E principal | `tests/e2e/mf2-flow.spec.js` | `npm run e2e:mf2` | `RNF29` e RF de identidade/catalogo/playback | Executa fluxo browser completo da MF2 quando ha ambiente com Playwright e DB. | Complementa testes backend/frontend com caminho real de utilizador. | Seed controlado MF2, browser Chromium e MongoDB local ou equivalente seguro. | Login, catalogo, detalhe e fluxo principal passam. | Seed falha, browser indisponivel ou DB local inacessivel. | `PASS` em ambiente preparado; nesta matriz fica `BLOQUEADO_AMBIENTE` ate pre-requisitos existirem. | Preparar ambiente e executar em `BK-MF8-08`; nao mascarar falta de Mongo/browser como sucesso. |
| `TST-MF8-E2E-MF4` | E2E monetizacao/pool | `tests/e2e/mf4-flow.spec.js` | `npm run e2e:mf4` | `RNF29` e RF de subscricao/pool | Executa fluxo de subscricao simulada e pool quando ha ambiente completo. | Protege o dominio diferencial do FaithFlix em demonstracao. | Seed MF4, browser Chromium e MongoDB local ou equivalente seguro. | Plano/subscricao/pool respondem conforme expected. | Falta seed, DB, browser ou variavel de ambiente. | `PASS` em ambiente preparado; nesta matriz fica `BLOQUEADO_AMBIENTE`. | Preparar ambiente e executar em `BK-MF8-08`; falhas funcionais seguem para `BK-MF8-09`. |

## Lacunas e decisoes

| Lacuna | Risco descoberto | Tipo de teste | Ficheiro recomendado | Comando/procedimento | Owner | Prioridade | Decisao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sweep visual completo MF8 ainda nao executado em todas as rotas do handoff. | Sobreposicao, texto cortado ou foco invisivel em pagina nao coberta pelas screenshots MF7. | Visual/manual. | `docs/evidence/MF8/screenshots/` e report em `EXECUCAO-TESTES-REPORT-ERROS.md`. | Capturar 390, 768, 1366 e 1440px por rota critica. | Matheus | P1 | `MANUAL_CRITICO`; executar em `BK-MF8-08`. |
| E2E MF2/MF4 depende de browser e base de dados local. | Fluxo browser completo pode ficar sem prova se o ambiente nao estiver preparado. | E2E. | `tests/e2e/mf2-flow.spec.js`; `tests/e2e/mf4-flow.spec.js`. | `npm run e2e:mf2`; `npm run e2e:mf4`. | Davi | P2 | `BLOQUEADO_AMBIENTE` ate Playwright/Mongo estarem disponiveis. |
| Readiness de rollback/deployment ainda nao tem artefacto operacional proprio. | Decisao final pode nao explicar como recuperar de falha de deploy. | Checklist/readiness. | `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md`. | Validar nomes de variaveis, comandos e plano de rollback sem segredos. | Matheus | P2 | Encaminhado para `BK-MF8-04` como ressalva controlada. |

Nenhuma lacuna P0/P1 fica sem decisao, ficheiro recomendado, expected result e owner.

## Como criar teste automatico em falta

Usar `node:test` e `node:assert/strict` quando a regra for repetivel e tiver expected result claro. O ficheiro deve ficar na camada correspondente e deve ter sempre positivo e negativo.

```js
// backend/tests/smoke/mf8-critical-smoke.test.js
/**
 * @file Smoke final MF8 para validar health-check e sessao anonima.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startTestServer } from "../helpers/test-server.js";

let testServer;

before(async () => {
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }
});

test("TST-MF8-BE-SMOKE-HEALTH confirma health-check operacional", async () => {
    const response = await fetch(`${testServer.baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(response.headers.get("x-request-id"));
    assert.equal(body.status, "ok");
});

test("TST-MF8-BE-SMOKE-HEALTH rejeita sessao falsa sem autenticar", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/session/me`, {
        headers: {
            Cookie: "faithflix_session=falso",
        },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.user, null);
});
```

## Testes manuais criticos

| id | Fluxo | Perfil | Rota/ecra | Acao | Expected result | Evidence esperada | Decisao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `TST-MF8-MANUAL-CRITICO-LOGIN` | Login/logout e sessao | Visitante e user | `/login`, header | Entrar e terminar sessao. | Header muda estado autenticado e logout limpa sessao visual. | Screenshot/checklist com perfil e data. | `MANUAL_DEFINIDO` |
| `TST-MF8-MANUAL-CRITICO-CATALOGO` | Catalogo, pesquisa e detalhe | Visitante/user | `/catalogo`, `/pesquisa`, `/catalogo/:idOrSlug` | Pesquisar, abrir detalhe e voltar. | Conteudo publicado aparece, filtros respondem e detalhe abre sem erro. | Screenshot/checklist por rota. | `MANUAL_DEFINIDO` |
| `TST-MF8-MANUAL-CRITICO-PLAYBACK` | Playback | User com permissao | `/ver/:contentId` | Abrir player e rever estados. | Player mostra conteudo/estado autorizado sem quebrar layout. | Screenshot/checklist. | `MANUAL_DEFINIDO` |
| `TST-MF8-MANUAL-CRITICO-SUBSCRICAO` | Plano/subscricao | User | `/planos` | Rever plano, trial e pagamento simulado. | Texto deixa claro que pagamento e simulado e mostra estado coerente. | Screenshot/checklist. | `MANUAL_DEFINIDO` |
| `TST-MF8-MANUAL-CRITICO-ADMIN` | Area admin | User comum, moderator, admin | `/admin/catalogo`, `/admin/metricas` | Testar acesso permitido e bloqueado. | User comum nao entra; moderator so acede a catalogo; admin acede a paineis. | Screenshot/checklist por perfil. | `MANUAL_DEFINIDO` |
| `TST-MF8-MANUAL-CRITICO-PRIVACIDADE` | Conta e privacidade | User | `/conta` | Abrir paines de conta, parental e privacidade. | Estados de loading/error/empty/success sao compreensiveis e seguros. | Screenshot/checklist. | `MANUAL_DEFINIDO` |

## Comandos de preparacao e execucao segura

| id | diretorio | comando | variaveis por nome | output seguro | decisao |
| --- | --- | --- | --- | --- | --- |
| `TST-MF8-BE-UNIT-VALIDACAO` | raiz | `npm --prefix backend test` | `MONGODB_URI`, `MONGODB_DB_NAME` se a suite passar a usar DB real | Resumo de testes e primeira stack util sem dados sensiveis. | `PASS`, `FAIL` ou `BLOQUEADO_AMBIENTE`. |
| `TST-MF8-BE-SMOKE-HEALTH` | raiz | `npm --prefix backend run smoke` | `PORT` apenas se for necessario mudar porta | Resumo `node:test`, status e primeira falha. | `PASS`, `FAIL` ou `BLOQUEADO_AMBIENTE`. |
| `TST-MF8-BE-REG-HARDENING` | backend | `node scripts/check-security-baseline.mjs` | Nenhuma obrigatoria. | Linha `Hardening MF6: PASS` ou lista de falhas. | `PASS` ou `FAIL`. |
| `TST-MF8-FE-BUILD` | raiz | `npm --prefix frontend run build` | `VITE_API_BASE_URL` sem valor escrito na evidence. | Resumo Vite e erro de compilacao quando houver. | `PASS`, `FAIL` ou `BLOQUEADO_AMBIENTE`. |
| `TST-MF8-FE-SMOKE` | raiz | `npm --prefix frontend run smoke` | `VITE_API_BASE_URL` sem valor escrito na evidence. | Resumo de build/smoke. | `PASS`, `FAIL` ou `BLOQUEADO_AMBIENTE`. |
| `TST-MF8-FE-REG` | frontend | `node scripts/check-frontend-regression.mjs` | Nenhuma obrigatoria. | Linha `Regressao frontend MF6: PASS` ou marker em falta. | `PASS` ou `FAIL`. |
| `TST-MF8-E2E-MF2` | raiz | `npm run e2e:mf2` | `MONGODB_URI`, `VITE_API_BASE_URL`, credenciais de fixture se aplicavel | Resultado Playwright sem cookies, passwords ou tokens reais. | `PASS`, `FAIL` ou `BLOQUEADO_AMBIENTE`. |
| `TST-MF8-E2E-MF4` | raiz | `npm run e2e:mf4` | `MONGODB_URI`, `VITE_API_BASE_URL`, credenciais de fixture se aplicavel | Resultado Playwright sem dados sensiveis. | `PASS`, `FAIL` ou `BLOQUEADO_AMBIENTE`. |

## Passos do BK

| Passo | pr | proof | neg | fonte | Decisao |
| --- | --- | --- | --- | --- | --- |
| 1. Inventariar testes existentes | `NAO_APLICAVEL`; entrega local sem PR. | Tabela "Inventario de comandos" cobre backend unitario, HTTP, smoke, regressao, frontend, manual, visual e E2E. | Comando sem script fica `NAO_EXISTE` ou `BLOQUEADO_AMBIENTE`, nunca inventado como sucesso. | `BK-MF8-03`; `RNF29`; `package.json`. | `PASS` |
| 2. Definir matriz obrigatoria | `NAO_APLICAVEL`. | Tabela "Matriz obrigatoria por teste" preenche id, camada, ficheiro, comando, RF/RNF, validacao, razao, dados, assertions, negativo, expected e classificacao. | Linha sem expected result ou negativo fica incompleta. | `BK-MF8-03`; `MATRIZ-CANONICA-BK.md`. | `PASS` |
| 3. Classificar lacunas | `NAO_APLICAVEL`. | Secao "Lacunas e decisoes" define risco, tipo, ficheiro, comando, owner, prioridade e decisao. | Lacuna P0/P1 sem owner ou expected result bloqueia a suite. | `BK-MF8-03`; handoff de `BK-MF8-02`. | `PASS_COM_RISCOS` |
| 4. Como criar testes em falta | `NAO_APLICAVEL`. | Modelo `node:test` inclui positivo, negativo e fecho de servidor. | Teste sem negativo obrigatorio fica `PASS_COM_RESSALVAS`. | `BK-MF8-03`; `backend/tests/smoke/app.smoke.test.js`. | `PASS` |
| 5. Definir testes manuais e visuais | `NAO_APLICAVEL`. | Tabela de testes manuais cobre login, catalogo, playback, subscricao, admin, privacidade e visual responsivo. | Screenshot sem rota, viewport, perfil e data nao prova o teste. | `BK-MF8-02`; `BK-MF7-05`. | `PASS_COM_RISCOS` |
| 6. Documentar comandos seguros | `NAO_APLICAVEL`. | Tabela de preparacao lista diretorio, comando, variaveis apenas por nome, output seguro e decisao. | Evidence nunca deve guardar cookies, tokens, passwords ou `.env`. | `RNF17`; `RNF29`. | `PASS` |
| 7. Entregar suite pronta | `NAO_APLICAVEL`. | Handoff lista IDs para `BK-MF8-08` e criterios para `BK-MF8-09`. | ID critico sem comando ou decisao impediria avancar. | `BK-MF8-08`; `BK-MF8-09`. | `PASS_COM_RISCOS` |

## Handoff

- Proximo BK: `BK-MF8-04`.
- Entrega principal: esta matriz fica pronta para alimentar o painel de readiness.
- Para `BK-MF8-08`: executar e reportar por `TST-*`, incluindo bloqueios de ambiente dos E2E quando aplicavel.
- Para `BK-MF8-09`: corrigir apenas erros observados na execucao, nao lacunas abstratas sem evidence.
- Para `BK-MF8-10`: manter a distincao entre testes automaticos passados, testes manuais executados e testes bloqueados por ambiente.

## Resultado

`BK-MF8-03` fica `PRONTA_COM_RESSALVAS`: a suite final esta desenhada, rastreavel e executavel por IDs. As ressalvas ficam limitadas a sweep visual/manual e E2E dependente de ambiente, ambos com owner e proximo BK definidos.
