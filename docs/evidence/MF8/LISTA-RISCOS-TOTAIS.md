# MF8 - Lista de riscos totais

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-29`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: riscos consolidados em 2026-06-29; estados atuais pertencem ao report canónico

## Metadados

- Projeto: FaithFlix
- Macro-fase: `MF8`
- BK: `BK-MF8-07`
- Data da execucao: 2026-06-29
- Estado final: `PASS_COM_RESSALVAS`
- Decisao: `GO_COM_RISCOS_CONTROLADOS`
- PR: `NAO_APLICAVEL`

> **Aviso de validade — Fase 2 (2026-07-09):** este documento é um snapshot histórico anterior à Fase 2 de 2026-07-09. Os resultados e decisões preservados abaixo não provam CP2 nem o estado atual da aplicação.

## Fontes usadas

| Fonte | Uso na lista |
| --- | --- |
| `docs/evidence/MF8/MATRIZ-FINAL.md` | RF/RNF ativos, gaps e handoff para riscos finais. |
| `docs/evidence/MF8/AUDITORIA-ADMINISTRATIVA-FINAL.md` | Riscos admin, permissoes, logs e superficies protegidas. |
| `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md` | Riscos operacionais aceites e readiness de fecho. |
| `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Matriz `TST-*` consumida por `BK-MF8-08`. |
| `docs/evidence/MF8/screenshots/*.png` | Prova visual desktop/mobile gerada no sweep final. |
| `tests/e2e/mf2-flow.spec.js`, `tests/e2e/mf4-flow.spec.js`, `tests/e2e/mf8-visual-responsiveness.spec.js` | Regressao browser final e sweep responsivo. |

## Escala

| Campo | Valores |
| --- | --- |
| Severidade | `CRITICA`, `ALTA`, `MEDIA`, `BAIXA` |
| Probabilidade | `ALTA`, `MEDIA`, `BAIXA` |
| Decisao | `MITIGADO_VALIDADO`, `ACEITE_COM_OWNER`, `OBSERVAR_EM_FREEZE`, `CORRIGIDO`, `NAO_APLICAVEL` |

## Registo total de riscos

| ID | Area | Risco | Req/BK afetado | Severidade | Prob. | Owner | Mitigacao/prova | Decisao |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `MF8-RISK-001` | Visual/responsivo | Sweep visual podia ficar incompleto em mobile/desktop. | `RNF01..RNF05`, `RNF21`, `RNF22`, `RNF38..RNF40`, `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-08` | `MEDIA` | `MEDIA` | Mateus | Criado e executado `TST-MF8-VISUAL-RESP`; 6 screenshots finais em `docs/evidence/MF8/screenshots/`; sem overflow horizontal. | `MITIGADO_VALIDADO` |
| `MF8-RISK-002` | E2E/browser | Fluxos autenticados MF2/MF4 podiam nao estar validados em browser real. | `RF02`, `RF04`, `RF19..RF24`, `RF41..RF48`, `RNF21`, `RNF22`, `RNF29`, `BK-MF8-08` | `ALTA` | `MEDIA` | Davi/Matheus | `TST-MF8-E2E-MF2` e `TST-MF8-E2E-MF4` passaram fora da sandbox apos correcao de fixtures/locators de teste. | `MITIGADO_VALIDADO` |
| `MF8-RISK-003` | Deployment/rollback | Rollback/deployment formal ainda nao esta convertido num runbook unico de entrega. | `RNF31`, `RNF32`, `BK-MF8-04`, freeze | `MEDIA` | `MEDIA` | Matheus | Readiness operacional mantem risco aceite; nao bloqueia MVP local, mas deve entrar no freeze final. | `ACEITE_COM_OWNER` |
| `MF8-RISK-004` | Documentacao tecnica | Falta documento tecnico unico final, separado das evidencias por BK. | `RNF33`, `BK-MF8-06`, freeze | `MEDIA` | `MEDIA` | Matheus | Matriz final e relatorio acumulado existem; documento unico fica como entrega de fecho. | `ACEITE_COM_OWNER` |
| `MF8-RISK-005` | Admin/associacoes/pool | Cobertura admin de associacoes/pool podia ficar apenas estatica. | `RF41..RF48`, `RNF19`, `RNF30`, `BK-MF8-05`, `BK-MF8-08` | `MEDIA` | `MEDIA` | Kaue | Suite backend valida 401/403/logs; E2E MF4 valida candidatura, decisao admin, dashboard da pool, historico privado e notificacoes. | `MITIGADO_VALIDADO` |
| `MF8-RISK-006` | Ambiente de testes | Sandbox bloqueia servidores locais/DNS e podia gerar falsos negativos. | `RNF29`, `RNF31`, `BK-MF8-08` | `MEDIA` | `ALTA` | Nuno/Matheus | Falhas `listen EPERM` e DNS foram repetidas fora da sandbox; comandos criticos passaram nesse ambiente. | `CORRIGIDO` |
| `MF8-RISK-007` | Dados E2E | Seeds E2E podiam ficar desalinhados com regras premium ou deixar dados dinamicos acumulados. | `RNF29`, `RNF30`, `TST-MF8-E2E-MF2`, `TST-MF8-E2E-MF4` | `MEDIA` | `MEDIA` | Davi | Seed MF2 cria subscricao ativa de fixture; seed MF4 limpa padroes E2E dinamicos e o teste rejeita candidatura fixa em vez de aprovar entidades novas. | `MITIGADO_VALIDADO` |
| `MF8-RISK-008` | Drift de suite | Testes E2E tinham textos/rotas/fixtures antigos face a UI PT-PT atual. | `BK-MF8-08`, `RNF29` | `MEDIA` | `MEDIA` | Matheus | Locators foram alinhados com roles, headings PT-PT e fixtures atuais; MF2/MF4 passaram. | `CORRIGIDO` |
| `MF8-RISK-009` | Seguranca/config | Pesquisa textual podia confundir scanners/deny-lists com segredos reais. | `RNF14`, `RNF16`, `RNF17`, `RNF19`, `RNF30` | `BAIXA` | `BAIXA` | Davi | `check-security-baseline` passou; matches estaticos ficaram restritos a scanner, redaction lists, README e teste negativo. | `MITIGADO_VALIDADO` |

## Passos de auditoria BK-MF8-07

| Passo | pr | proof | neg | fonte | decisao |
| --- | --- | --- | --- | --- | --- |
| 1. Agregar riscos da matriz final | `NAO_APLICAVEL` | `MF8-RISK-001..005` | Sem risco P0/P1 novo na matriz final. | `MATRIZ-FINAL.md` | `PASS` |
| 2. Agregar riscos de readiness | `NAO_APLICAVEL` | `MF8-RISK-003`, `MF8-RISK-004`, `MF8-RISK-006` | Readiness continua `GO_COM_RESSALVAS`, nao `NO_GO`. | `PAINEL-READINESS-OPERACIONAL.md` | `PASS_COM_RESSALVAS` |
| 3. Agregar riscos de auditoria admin | `NAO_APLICAVEL` | `MF8-RISK-005` | Rotas admin sem auth/user comum continuam 401/403 em regressao backend. | `AUDITORIA-ADMINISTRATIVA-FINAL.md` | `PASS` |
| 4. Agregar riscos da suite final | `NAO_APLICAVEL` | `MF8-RISK-002`, `MF8-RISK-007`, `MF8-RISK-008` | E2E final ja passou apos correcao da suite/fixtures. | `EXECUCAO-TESTES-REPORT-ERROS.md` | `PASS` |
| 5. Classificar severidade/probabilidade | `NAO_APLICAVEL` | Tabela de registo total com 9 riscos. | Sem risco `CRITICA` aberto. | Este ficheiro | `PASS` |
| 6. Separar aceite/corrigir/validado | `NAO_APLICAVEL` | `MITIGADO_VALIDADO`, `CORRIGIDO`, `ACEITE_COM_OWNER`. | So rollback/documento unico ficam aceites para freeze. | Este ficheiro | `PASS_COM_RESSALVAS` |
| 7. Preparar handoff para BK-MF8-08 | `NAO_APLICAVEL` | IDs `TST-*` consumidos e resultados registados. | Sem erro funcional aberto apos execucao final. | `EXECUCAO-TESTES-REPORT-ERROS.md` | `PASS` |

## Riscos aceites para freeze

| ID | Motivo da aceitacao | Condicao de fecho |
| --- | --- | --- |
| `MF8-RISK-003` | Nao bloqueia validacao local nem MVP funcional; e operacional/documental. | Manter como ressalva operacional no freeze; criar runbook curto antes de `GO` pleno/producao ou como fecho documental pos-PAP. |
| `MF8-RISK-004` | Existem evidencias BK e relatorio acumulado; falta consolidacao em documento unico. | Manter como ressalva documental no freeze; consolidar documento tecnico unico como fecho documental pos-PAP, sem bloquear a MF8 congelada. |

## Decisao observada no BK-MF8-07

`PASS_COM_RESSALVAS`. A lista total de riscos existe, esta rastreada a fontes concretas, separa riscos mitigados/corrigidos/aceites e entrega a `BK-MF8-08` sem blocker P0/P1 aberto.
