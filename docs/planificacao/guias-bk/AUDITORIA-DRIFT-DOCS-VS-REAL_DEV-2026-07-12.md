# Auditoria de drift entre `real_dev` e documentação — 2026-07-12

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: cruzamento estático da implementação fechada em `real_dev` com `docs`, complementado por testes focados sem DB, seed, migração, servidor ou browser real

## 1. Decisão executiva

Foram confirmados e corrigidos drifts documentais posteriores à baseline
canónica de 2026-07-10. A implementação em `real_dev` permaneceu congelada;
todas as correções ficaram em `docs/**` e no validador documental.

Estado global: `CORRIGIDO_VALIDADO`.

| Severidade | Quantidade | Decisão |
| --- | ---: | --- |
| `P1` | 4 | `CORRIGIDO_VALIDADO` |
| `P2` | 4 | `CORRIGIDO_VALIDADO` |
| `P3` | 1 | `CORRIGIDO_VALIDADO` |

Não foi identificado fundamento para reabrir ou alterar a aplicação. Os drifts
resultam sobretudo da remediação administrativa concluída em 2026-07-12 não ter
sido propagada à cadeia documental fechada em 2026-07-10.

## 2. Âmbito e método

Foram cruzados:

- contratos de produto em `docs/RF.md` e `docs/RNF.md`;
- arquitetura, política de evidence, runbooks e autoridade canónica atual;
- matriz canónica e guias student-facing diretamente afetados;
- rotas, layouts, clientes API, controllers, services e validações atuais de
  `real_dev/backend` e `real_dev/frontend`;
- o fecho de remediação em
  `docs/evidence/AUDITORIA-UI-UX-AREA-ADMIN-2026-07-12.md`.

As pastas públicas `backend/` e `frontend/` não foram usadas como implementação
de referência. Nos guias STUDENT, caminhos `backend/` e `frontend/` continuam
corretos enquanto política de publicação; o drift aqui reportado é semântico e
funcional, não a ausência do prefixo privado `real_dev/`.

## 3. Findings confirmados

### `FF-DOC-DRIFT-001` — O gate documental atual falha

- Severidade: `P1`.
- Tipo: governance e validação documental.
- Estado: `CORRIGIDO_VALIDADO`.

`npm run test:docs` terminou com exit code `1`. O validador verificou `66` BK,
`66` guias, `94` requisitos, `10` MF views e `33` evidences, mas recusou
`docs/evidence/AUDITORIA-UI-UX-AREA-ADMIN-2026-07-12.md` por ausência dos cinco
metadados obrigatórios e dos campos derivados `status`/`lane`.

Isto contradiz a política de `docs/evidence/README.md`, que obriga novos reports
ou documents materialmente atualizados a declarar `document_status`,
`snapshot_date`, `implementation_lane`, `current_authority` e `proof_scope`.

Correção exclusivamente documental:

1. adicionar os metadados obrigatórios ao relatório administrativo;
2. manter a secção 0 como estado atual e as secções 1–10 explicitamente como
   snapshot histórico anterior à remediação;
3. repetir `npm run test:docs` e registar o resultado real.

### `FF-DOC-DRIFT-002` — A autoridade canónica ficou anterior à app fechada

- Severidade: `P1`.
- Tipo: autoridade, baseline e prova.
- Estado: `CORRIGIDO_VALIDADO`.

`docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md` continua
marcado como `CURRENT`, mas fecha a decisão em 2026-07-10 e declara `30`
evidences, testes frontend `197/197` e backend completo `271/271`. O estado
posterior confirmado em 2026-07-12 inclui `33` evidences antes deste report,
novo shell/dashboard administrativo e provas focadas com contagens superiores.

O relatório administrativo de 2026-07-12 aponta para a implementação posterior,
mas não substitui formalmente nem atualiza a autoridade global. Assim, quem
seguir apenas a precedência publicada em `docs/evidence/README.md` termina numa
baseline que não descreve a versão fechada atual.

Correção exclusivamente documental:

1. acrescentar à autoridade canónica um checkpoint pós-remediação de 2026-07-12;
2. atualizar apenas os totais e gates que forem novamente executados, sem
   reescrever resultados históricos de 2026-07-10;
3. ligar explicitamente o relatório administrativo como prova posterior;
4. manter `NO_GO_PRODUCAO` e os bloqueios externos enquanto não existir nova
   prova que os feche.

### `FF-DOC-DRIFT-003` — Landing pós-autenticação contradiz a implementação

- Severidade: `P1`.
- Tipo: contrato funcional de identidade e navegação.
- Estado: `CORRIGIDO_VALIDADO`.

`docs/RF.md` e
`docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md`
afirmam que login/registo navegam para `/` quando não existe `next`.

Na implementação fechada,
`real_dev/frontend/src/utils/authRedirect.js` define:

- `admin` -> `/admin`;
- `moderator` -> `/admin/catalogo`;
- restantes utilizadores -> `/`;
- um `next` interno seguro continua a ter precedência.

`AuthForms.jsx` aplica este resolver depois de login e registo, e
`AnonymousRoute.jsx` usa a mesma landing quando já existe sessão.

Correção exclusivamente documental: atualizar o critério RF01–RF05, o guia
BK-MF2-01, a matriz de navegação por perfil e os cenários de autenticação. Não
alterar o resolver nem voltar a encaminhar staff para a home pública.

### `FF-DOC-DRIFT-004` — O novo backoffice não foi propagado aos guias

- Severidade: `P2`.
- Tipo: arquitetura de informação, rotas e acessibilidade.
- Estado: `CORRIGIDO_VALIDADO`.

A implementação atual usa `AdminLayout`, `AdminNavigation`, dashboard `/admin`,
sidebar/drawer por role, breadcrumb e um único context switch `Ver site público`.
Também separa catálogo e passagens bíblicas em rotas list-first de listagem,
criação, edição, taxonomias e associações.

Continuam a ensinar o modelo anterior:

- `MF1/BK-MF1-02`: registo de rotas sem o dashboard e sem as novas subrotas;
- `MF2/BK-MF2-03`: `AdminCatalogPage` monolítica e criação/edição dentro de
  `/admin/catalogo`;
- `MF6/BK-MF6-05`: links administrativos no header público;
- `MF7/BK-MF7-02`: header plano com links públicos e administrativos, rotas
  administrativas isoladas e `AdminCatalogPage` antiga.

O próprio fecho da auditoria administrativa usa ainda o nome `PublicLayout`,
mas esse símbolo não existe em `real_dev/frontend/src`; as rotas públicas
continuam dentro de `AppLayout` e só o backoffice usa `AdminLayout`.

Correção exclusivamente documental: recompor estes guias de forma cumulativa,
preservando os objetivos pedagógicos de cada MF, mas fazendo o estado final
convergir para a árvore atual de `AppRoutes.jsx`, `AdminLayout.jsx`,
`AdminNavigation.jsx` e `routeMetadata.js`. Atualizar também os critérios
`RNF01`/`RNF03` da matriz para cobrir o shell dedicado e a matriz 320–2048 px,
e corrigir `PublicLayout` para o nome real `AppLayout` na evidence.

### `FF-DOC-DRIFT-005` — O fecho manual da pool omite preview e token stale

- Severidade: `P1`.
- Tipo: contrato financeiro e segurança operacional.
- Estado: `CORRIGIDO_VALIDADO`.

O guia `MF4/BK-MF4-05` ainda ensina a enviar apenas `{ month }` diretamente para
`POST /api/charities/pool/distributions`, após `window.confirm()`.
`docs/RF.md` e a linha RF44 da matriz canónica também não tornam obrigatório o
contrato de preview.

A implementação fechada exige:

1. `GET /api/charities/pool/distributions/:month/preview`, sem escrita/audit;
2. apresentação do valor e das associações antes da confirmação;
3. `POST /api/charities/pool/distributions` com `month` e `previewToken`;
4. recusa `409 POOL_PREVIEW_STALE` se os dados mudarem antes do commit;
5. audit log apenas no commit efetivo.

Os testes focados confirmaram que a preview não escreve e que um token stale
recusa o commit antes do audit.

Correção exclusivamente documental: atualizar RF44/RF46, matriz, BK-MF4-05,
cliente `charitiesApi`, UI, negativos e evidence esperada. Não remover o token
da implementação para fazer o snippet antigo funcionar.

### `FF-DOC-DRIFT-006` — A decisão de candidaturas ainda fixa o motivo

- Severidade: `P2`.
- Tipo: UX administrativa e auditabilidade.
- Estado: `CORRIGIDO_VALIDADO`.

`MF4/BK-MF4-04` envia automaticamente
`Não cumpre os critérios mínimos da pool.` em todas as rejeições. A app fechada
abre detalhe da candidatura, permite filtrar por estado e exige motivo editável
entre 10 e 500 caracteres antes de rejeitar.

Correção exclusivamente documental: atualizar o snippet frontend, critérios
RF42 e prova negativa para motivo ausente/curto/longo. Preservar a validação e
transação backend já documentadas.

### `FF-DOC-DRIFT-007` — Membership administrativa ainda é ensinada por IDs

- Severidade: `P2`.
- Tipo: UX administrativa e prevenção de erro operacional.
- Estado: `CORRIGIDO_VALIDADO`.

`MF4/BK-MF4-06` pede manualmente `ID da associação` e `ID do utilizador`. A
implementação fechada usa autocompletes canceláveis por nome/email, consulta
associações através de `GET /api/charities/admin/lookup`, reutiliza a listagem
segura de utilizadores ativos e confirma nomes antes de enviar apenas os IDs ao
backend.

Correção exclusivamente documental: atualizar BK-MF4-06 com lookup, estados de
loading/erro/vazio, navegação por teclado, confirmação nominal e negativo que
garanta que o endpoint de associações só devolve `{ id, name }` de entidades
ativas/elegíveis.

### `FF-DOC-DRIFT-008` — Métricas e integrações descrevem a UX anterior

- Severidade: `P2`.
- Tipo: operação administrativa.
- Estado: `CORRIGIDO_VALIDADO`.

Em métricas, `MF5/BK-MF5-05` só documenta `GET /api/admin/metrics` e os cards
anteriores. A implementação acrescenta agregados de catálogo, solidariedade,
integrações e família, capability de exportação e
`GET /api/admin/metrics/export.csv`, consumido por download autenticado.

Em integrações, `MF5/BK-MF5-06` ainda orienta alternar um controlo e observar
`Integração atualizada.`. A implementação mantém drafts locais, sinaliza
`Alterações por guardar`, permite Guardar/Cancelar e confirma o diff antes do
único PATCH.

Correção exclusivamente documental: atualizar os dois guias, os critérios RF59
e RF60, a matriz e os negativos de cancelamento, duplo clique, download sem PII
e resposta tardia. Não é necessário criar endpoints novos.

### `FF-DOC-DRIFT-009` — Runbook REFERENCE usa um cwd STUDENT

- Severidade: `P3`.
- Tipo: caminho operacional.
- Estado: `CORRIGIDO_VALIDADO`.

`docs/runbooks/DEMO-DATASET.md` declara scope `real_dev`, mas a secção de
migração manda executar a partir de `backend/` e aponta o exemplo para
`backend/scripts/series-episodes.mapping.example.json`. A implementação e o
manifest reais estão em `real_dev/backend`.

Correção exclusivamente documental: usar `real_dev/backend` como cwd e caminho
do exemplo, ou comandos inequívocos com `npm --prefix real_dev/backend`. Não
alterar a política dos guias STUDENT; este finding é específico do runbook
REFERENCE.

## 4. Elementos revistos que não são drift

- `66` BK, `66` guias, `94` requisitos e `10` MF views continuam alinhados; a
  falha atual do validador está concentrada na metadata da nova evidence.
- As referências históricas a `30` evidences dentro de logs datados de
  2026-07-10 podem permanecer. Só o resumo/estado corrente deve passar a
  distinguir a contagem atual.
- `docs/evidence/MF8/SCOPE-FREEZE.md` está corretamente marcado como
  `HISTORICAL_SNAPSHOT`; não deve ser reescrito como se provasse a app atual.
- Caminhos `backend/` e `frontend/` nos guias STUDENT são intencionais e não
  devem ser substituídos por `real_dev/`.
- A separação entre pagamentos simulados, fixtures media e prova de produção
  continua coerente. Nada nesta auditoria fecha `RNF08`, `RNF10`, restore real,
  E2E com replica set ou `NO_GO_PRODUCAO`.

## 5. Ordem aplicada na correção documental

1. Metadata e gate estrutural corrigidos.
2. Autoridade canónica atualizada com checkpoint pós-2026-07-12.
3. RF/matriz alinhados para landing por role e preview financeira obrigatória.
4. Guias de navegação/shell/rotas administrativas recompostos.
5. Candidaturas, memberships, métricas e integrações atualizadas.
6. Cwd do runbook REFERENCE corrigido.
7. Baseline e suite negativa repetidas com sucesso.

Cada correção deve preservar snapshots históricos e alterar apenas o contrato
ativo ou o procedimento atual. Não se deve apagar evidência antiga nem mudar
`real_dev` para satisfazer documentação desatualizada.

## 6. Validações executadas nesta auditoria

| Comando | Cwd | Resultado |
| --- | --- | --- |
| `npm run test:docs` | raiz | `FAIL`; 66 BK, 66 guias, 94 requisitos, 10 MF views, 33 evidences; 7 erros derivados da metadata em falta no novo relatório administrativo. |
| Testes Vitest focados de auth redirect, router, admin layout, candidaturas, memberships, pool, métricas e integrações | `real_dev/frontend` | `PASS`; 8 ficheiros e 32/32 testes. |
| Testes Node focados de métricas CSV, lookup administrativo, billing/pool preview e validações | `real_dev/backend` | `PASS`; 30/30 testes. |

Não foram executados DB, seed, migração, servidor, Playwright ou browser real.
Esta limitação não impede confirmar os drifts textuais e contratuais acima, mas
impede usar esta auditoria como nova prova runtime global da aplicação.

## 7. Validação pós-correção

| Comando | Resultado final |
| --- | --- |
| `npm run test:docs` | `PASS`; 66 BK, 66 guias, 94 requisitos, 10 MF views, 33 evidences e zero erros. |
| `python3 scripts/test_validate_planificacao_negatives.py` | `PASS`; baseline verde e 150/150 classes de drift isoladas recusadas. |
| Compilação in-memory dos dois scripts Python | `PASS`; `syntax_ok=2`. |

O validador passou a recusar explicitamente regressões de landing por role,
shell admin, rotas editoriais, preview/token stale, motivo de rejeição, lookup
nominal, CSV, drafts de integrações e root REFERENCE do runbook.

## 8. Conclusão

Os nove findings ficaram `CORRIGIDO_VALIDADO`. A documentação ativa converge
agora para a implementação fechada, os snapshots históricos foram preservados e
`real_dev` não foi alterado. Mantêm-se apenas os riscos runtime/produtivos já
declarados pela autoridade canónica, fora do âmbito destes drifts.
