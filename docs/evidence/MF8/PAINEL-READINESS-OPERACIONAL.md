# Painel de readiness operacional - MF8

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: adendo operacional F6 local e snapshot histórico delimitado; restore/deploy reais não provados

## Adendo docente Fase 6 - operação local (2026-07-10)

Este adendo é o sinal atual e não reescreve a decisão histórica preservada mais
abaixo.

| Sinal F6 | Contrato/prova atual | Estado | Limite residual |
| --- | --- | --- | --- |
| Liveness/readiness | `GET /health/live` não consulta DB; `GET /health/ready` e o alias `GET /health` aplicam ping MongoDB com deadline total de `500 ms`; todos usam `Cache-Control: no-store`, correm antes de sessão/CSRF e o erro `503` não expõe URI/exceção. | `VALIDADO_LOCAL` | Prova HTTP usa DB in-memory/doubles; não demonstra monitorização ou MongoDB real. |
| Shutdown API/worker | `SIGTERM`/`SIGINT` drenam HTTP antes do fecho único de MongoDB; o worker cancela a espera e aguarda o ciclo ativo. | `VALIDADO_LOCAL` | Testes usam fakes; processo contínuo/orquestrador real não foi demonstrado. |
| Configuração de produção | `NODE_ENV=production` exige identidade, Mongo explícito, pepper forte, `FORCE_HTTPS=true`, `TRUST_PROXY_HOPS` fechado e `FRONTEND_ORIGIN` HTTPS. Erros listam apenas nomes inválidos. | `VALIDADO_LOCAL` | Import/teste com valores sintéticos não é deployment. |
| Backup/restore | CLIs usam URI/base dedicadas, opt-in, config temporária `0600`, archive/manifest/checksum/inventário e restore para target temporário com ownership/cleanup. | `BLOQUEADO_AMBIENTE` | `mongodump` e `mongorestore` não estavam no `PATH`; 10/10 com doubles não provam backup ou restore real. |
| Arquitetura/rollback | `ARCHITECTURE.md` e quatro runbooks locais descrevem arranque, worker, backup/restore e rollback manual. | `VALIDADO_DOCUMENTAL_LOCAL` | Sem CI, deploy, rollback remoto ou backup diário automático. |

Decisão F6 neste checkpoint: os contratos locais de health, shutdown e env estão
cobertos, mas o restore real continua `BLOQUEADO_AMBIENTE`. A baseline mantém
`GO_LOCAL_COM_RESSALVAS` e `NO_GO_PRODUCAO`; a política diária histórica não é
convertida em prova atual.

## Adendo docente Fase 5 - sinal visual local (2026-07-10)

Este adendo não altera retroativamente a decisão histórica abaixo nem declara
readiness de produção. Acrescenta apenas o sinal atual da baseline local:

| Sinal F5 | Comando/prova atual | Estado | Impacto residual |
| --- | --- | --- | --- |
| Acessibilidade e responsividade preview | `npm run test:a11y`: `14/14` Chromium, incluindo `/admin/catalogo`; zero Axe `serious`/`critical`; `390x844`, `768x900`, `1280x720`, `1440x900`; reflow `200%`; menu Escape/foco; header `68 px`; zero overflow/pedidos externos. | `VALIDADO_LOCAL_COM_LIMITES` | Preview com API sintética; sem backend, DB, seed, dados reais ou matriz cross-browser. |
| Bundle inicial | Build final com JS `61,90 kB` gzip, CSS `5,38 kB` gzip e logo `19,91 kB`; HLS/DASH lazy. | `VALIDADO_LOCAL` | Chunks media e warnings ESM/bundle continuam registados; não é medição de rede/CDN/dispositivo real. |
| Evidência humana | Screenshots full-page das quatro resoluções foram inspecionadas em `/tmp`, sem corte/overflow observado. | `PASS_COM_RESSALVAS` | Artefactos temporários e rotas limitadas; não substituem sweep humano completo. |

Decisão do sinal F5: `VALIDADO_LOCAL_COM_LIMITES`. Não compensa blockers de
segurança, transações reais, health, backup/deploy ou credenciais; também não
fecha full E2E, RNF08, RNF10 ou streaming real. O gate global continua limitado
a `GO_LOCAL_COM_RESSALVAS` e `NO_GO_PRODUCAO`.

## Snapshot histórico — painel de readiness observado em 2026-06-29

A partir desta fronteira, o conteúdo conserva exclusivamente a decisão
histórica dessa data e não demonstra readiness atual ou de produção.

## Metadados

- BK: `BK-MF8-04`
- Data: 2026-06-29
- Dependencia consumida: `BK-MF8-03`
- Fonte principal: `RNF30`, `RNF31`, `RNF32`, `RNF33`
- Escopo: sinais tecnicos, ambiente, configuracao, riscos, evidence e decisao operacional
- Decisao final: `GO_COM_RESSALVAS`
- Estado documental: `PASS_COM_RISCOS`

> **Aviso de validade — Fase 2 (2026-07-09):** este documento é um snapshot histórico anterior à Fase 2 de 2026-07-09. Os resultados e decisões preservados abaixo não provam CP2 nem o estado atual da aplicação.

## Fontes revistas

- `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`
- `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-I.md`
- `docs/evidence/MF8/ALINHAMENTO-VISUAL-PARTE-II.md`
- `docs/evidence/MF7/GATE-UI-NAVEGACAO-SEGURA.md`
- `docs/evidence/MF6/GATE-S12-MF6.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `real_dev/backend/src/utils/logger.js`
- `real_dev/backend/src/middlewares/request-logger.middleware.js`
- `real_dev/backend/src/modules/system/health.service.js`
- `real_dev/backend/src/modules/system/health.controller.js`
- `real_dev/backend/scripts/check-security-baseline.mjs`
- `real_dev/frontend/scripts/check-frontend-regression.mjs`
- `README.md`

## Regra de decisao

| Estado | Regra |
| --- | --- |
| `GO` | Todos os sinais criticos passam, sem blocker P0/P1 e com rollback/documentacao operacional suficientes. |
| `GO_COM_RESSALVAS` | Nao ha blocker P0/P1 confirmado, mas existem riscos controlados, provas manuais pendentes ou lacunas operacionais nao criticas. |
| `NO_GO` | Existe falha P0/P1, segredo exposto, health-check indisponivel, teste critico sem decisao ou risco sem owner. |

## Matriz de readiness

| Sinal | RNF/BK | Prova principal | Negativo associado | Estado | Impacto na decisao |
| --- | --- | --- | --- | --- | --- |
| Suite final desenhada por IDs | `BK-MF8-03`, `RNF29` | `TESTES-FINAIS-CRIADOS.md` define `TST-*`, comandos, expected result, lacunas e handoff. | ID sem comando, expected result ou negativo invalida a suite. | `PASS_COM_RISCOS` | Permite avancar para readiness, mantendo sweep visual/E2E como ressalvas. |
| Backend unitario/integracao/smoke/regressao | `RNF29`, `RNF31` | `real_dev/backend/tests/unit/`, `real_dev/backend/tests/integration/`, `real_dev/backend/tests/smoke/app.smoke.test.js`, `real_dev/backend/tests/regression/mf6-backend-regression.test.js`. | `/api/session/me` com cookie falso devolve `200 {user:null}`; endpoints protegidos devolvem `401`; input invalido devolve `400`; role comum em admin é recusada. | `PASS_COM_RISCOS` | Sinal critico verde quando executado; pode exigir execucao fora da sandbox se houver bloqueio de porta. |
| Frontend build/smoke/regressao | `RNF21`, `RNF22`, `RNF38`, `RNF40` | `real_dev/frontend/package.json`; `real_dev/frontend/scripts/check-frontend-regression.mjs`; evidence MF7/MF8. | Rota removida, `EmptyState` ausente, skip link ausente ou `credentials: "include"` removido. | `PASS_COM_RISCOS` | Sinal critico para defesa e navegacao; browser sweep final ainda recomendado. |
| Logging estruturado | `RNF30` | `real_dev/backend/src/utils/logger.js` escreve JSON com `timestamp`, `level`, `service`, `message` e redacao de chaves sensiveis. `request-logger.middleware.js` adiciona `x-request-id`. | Log com password, token, cookie ou secret sem redacao passa a `NO_GO`. | `PASS` | Observabilidade minima cumpre readiness. |
| Health-check | `RNF31` | `/health` montado em `real_dev/backend/src/app.js`; `health.service.js` devolve `status`, `service`, `timestamp`, `uptimeSeconds` e dependencias. | `/health` indisponivel ou sem `x-request-id` bloqueia readiness. | `PASS` | Deployment/monitorizacao tem endpoint simples. |
| Rollback/deployment | `RNF32` | Scripts de build/test existem e README descreve stack; nao foi encontrado runbook formal de rollback. | Falha critica sem caminho de reversao documentado impediria `GO`. | `PASS_COM_RESSALVAS` | Nao ha blocker de codigo, mas falta artefacto operacional proprio antes de `GO` pleno. |
| Documentacao tecnica | `RNF33` | `README.md`, `docs/planificacao/`, `real_dev/frontend/src/services/api/README.md` e evidences MF6/MF7/MF8 descrevem stack, modulos e fluxos. Nao foi encontrado `ARCHITECTURE.md`. | Documento que exponha segredos ou contradiga stack real passa a `FAIL`. | `PASS_COM_RESSALVAS` | Suficiente para PAP com ressalva; recomenda-se consolidar arquitetura se houver tempo. |
| Configuracao sem segredos | `RNF17`, `RNF30` | `real_dev/backend/src/config/env.js` e `real_dev/frontend/src/config/env.js` leem variaveis por nome; evidence lista nomes sem valores. | Valor real de cookie, password, token, connection string privada ou `.env` na evidence e `NO_GO`. | `PASS` | Evidence preserva privacidade operacional. |
| Alinhamento visual e UX | `BK-MF8-01`, `BK-MF8-02`, `RNF21`, `RNF22` | Evidences MF8 parte I/II e gate MF7 com screenshots representativos. | Sobreposicao critica, foco invisivel ou texto cortado em fluxo P0 fica `FAIL`. | `PASS_COM_RISCOS` | A app esta pronta com ressalva de sweep visual final. |

## Fontes de readiness por passo

| Passo | pr | proof | neg | fonte | Decisao |
| --- | --- | --- | --- | --- | --- |
| 1. Definir fonte do readiness | `NAO_APLICAVEL`; entrega local sem PR. | Fontes listadas nesta evidence, incluindo BK3, MF6, MF7, MF8, scripts e RNF. | Fonte sem caminho ou motivo nao sustenta decisao. | `BK-MF8-04`; `RNF30..33`. | `PASS` |
| 2. Criar matriz de estados | `NAO_APLICAVEL`. | Regras `PASS`, `PASS_COM_RESSALVAS`, `FAIL`, `NAO_APLICAVEL`, `GO`, `GO_COM_RESSALVAS` e `NO_GO`. | `FAIL` critico nao pode permitir `GO`. | `BK-MF8-04`. | `PASS` |
| 3. Definir indicador simples | `NAO_APLICAVEL`. | Decisao final calculada por ausencia de P0/P1 e presenca de ressalvas de ambiente/rollback/documentacao/sweep. | Decisao baseada em opiniao verbal fica invalida. | `MATRIZ-CANONICA-BK.md`; `TESTES-FINAIS-CRIADOS.md`. | `PASS_COM_RISCOS` |
| 4. Ligar checks tecnicos | `NAO_APLICAVEL`. | Matriz liga backend, frontend, hardening, health, logs e testes manuais a comandos/evidence. | Check sem comando ou evidence fica como ressalva, nao como sucesso. | `BK-MF8-03`; `RNF29..31`. | `PASS_COM_RISCOS` |
| 5. Validar configuracao e ambiente | `NAO_APLICAVEL`. | Variaveis listadas apenas por nome; nenhum valor sensivel registado. | Segredo na evidence implica remocao imediata e `NO_GO` ate corrigir. | `RNF17`; `RNF30`; configs backend/frontend. | `PASS` |
| 6. Registar estado de riscos | `NAO_APLICAVEL`. | Tabela de riscos tem severidade, owner, mitigacao e estado. | Risco sem owner nao pode ser aceite. | `BK-MF8-07`; `BK-MF8-10`. | `PASS_COM_RISCOS` |
| 7. Entregar decisao de readiness | `NAO_APLICAVEL`. | Decisao `GO_COM_RESSALVAS`, provas principais, ressalvas e handoff para `BK-MF8-05`. | Decisao sem evidence ou sem fonte fica invalida. | `BK-MF8-05`. | `PASS_COM_RISCOS` |

## Ambiente e configuracao

| Area | Variaveis por nome | Estado | Observacao segura |
| --- | --- | --- | --- |
| Backend HTTP | `PORT`, `SERVICE_NAME` | `PASS` | `PORT` e validado como inteiro seguro; `SERVICE_NAME` aparece nos logs e health. |
| Base de dados | `MONGODB_URI`, `MONGODB_DB_NAME` | `PASS_COM_RISCOS` | A execucao local pode usar DB fake em testes; E2E real exige MongoDB acessivel. Valores nunca devem entrar na evidence. |
| Frontend API | `VITE_API_BASE_URL` | `PASS` | O cliente remove barra final e usa `credentials: "include"`. |
| Performance autenticada | `FAITHFLIX_API_BASE_URL`, `FAITHFLIX_SESSION_COOKIE` | `PASS_COM_RISCOS` | O cookie so pode ser usado localmente; se for executado, deve ser mascarado na evidence. |
| E2E | Variaveis de seed/credenciais de fixture quando aplicavel | `BLOQUEADO_AMBIENTE` | Executar apenas com fixture controlada, sem dados reais. |

## Riscos aceites

| Risco | Severidade | Owner | Mitigacao | Estado |
| --- | --- | --- | --- | --- |
| Sweep visual completo MF8 ainda depende de execucao em `BK-MF8-08`. | Media | Matheus | Usar IDs `TST-MF8-VISUAL-RESP-*`, rotas do handoff e screenshots por viewport. | `ACEITE_COM_OWNER` |
| E2E MF2/MF4 depende de Playwright e MongoDB local preparado. | Media | Davi | Executar em ambiente apropriado; se faltar ambiente, classificar como `BLOQUEADO_AMBIENTE` sem forcar sucesso. | `ACEITE_COM_OWNER` |
| Nao ha runbook formal de rollback/deployment encontrado no checkout. | Media | Matheus | Documentar politica minima de rollback antes de tentar `GO` pleno; ate la, manter `GO_COM_RESSALVAS`. | `ACEITE_COM_OWNER` |
| Nao ha `ARCHITECTURE.md` formal apesar de existir README e evidences tecnicas. | Baixa | Matheus | Consolidar arquitetura principal se o orientador exigir documento unico. | `ACEITE_COM_OWNER` |
| Testes HTTP podem falhar em sandbox por bloqueio de `listen`. | Baixa | Nuno/Matheus | Repetir fora da sandbox quando necessario e registar o erro ambiental. | `ACEITE_COM_OWNER` |

## Provas positivas e negativas por RNF

| RNF | Prova positiva | Prova negativa | Estado |
| --- | --- | --- | --- |
| `RNF30` | Logger JSON com niveis e contexto; request id propagado por header. | Chaves `authorization`, `cookie`, `password`, `token`, `secret` e `set-cookie` sao redigidas. | `PASS` |
| `RNF31` | `/health` montado e coberto por smoke. | Health indisponivel ou sem `x-request-id` bloquearia readiness. | `PASS` |
| `RNF32` | Comandos de build/test existem para detectar falha antes de entrega. | Falta runbook formal de rollback; fica ressalva. | `PASS_COM_RESSALVAS` |
| `RNF33` | README, planificacao e evidences descrevem stack, modulos e fluxos principais. | Falta `ARCHITECTURE.md` formal; fica ressalva. | `PASS_COM_RESSALVAS` |

## Handoff para BK-MF8-05

- Proximo BK: `BK-MF8-05`.
- Decisao a transportar: `GO_COM_RESSALVAS`.
- Sinais fortes: health-check, logs estruturados, scanner de seguranca, regressao frontend, backend tests/smoke/regressao e matriz `TST-*`.
- Ressalvas: sweep visual/manual e E2E dependente de ambiente; rollback/deployment e arquitetura sem artefacto formal unico.
- O `BK-MF8-05` deve focar superficie administrativa, permissoes, logs de auditoria e exposicao indevida, usando esta readiness como entrada.

## Resultado

`BK-MF8-04` fica `GO_COM_RESSALVAS`: os sinais operacionais essenciais permitem continuar para auditoria administrativa, mas a decisao ainda nao deve ser elevada para `GO` enquanto rollback/deployment formal, documento de arquitetura unico, sweep visual final e E2E de ambiente completo nao forem fechados ou aceites no freeze.
