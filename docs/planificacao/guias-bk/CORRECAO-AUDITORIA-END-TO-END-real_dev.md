# Correcao integral da auditoria end-to-end - `real_dev`

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: fonte canónica da correção local e dos respetivos bloqueios; não autoriza produção, DB, seed, migração ou E2E

## 1. Metadados e baseline

- `audit_id`: `FF-E2E-AUD-2026-07-09`
- `project`: `FaithFlix`
- `modo`: `corrigir_auditoria_end_to_end`
- `implementation_root`: `real_dev`
- `backend_root`: `real_dev/backend`
- `frontend_root`: `real_dev/frontend`
- `docs_root`: `docs`
- `excluded_implementation_roots`: `backend`, `frontend`
- `baseline_commit`: `1f33e61d1751fcae702ee92d1865fccfe295a0e0`
- `data_inicio`: `2026-07-09`
- `commits_permitidos`: `nao`
- `migracao_db_atual_permitida`: `nao`
- `seed_db_atual_permitida`: `nao`
- `gate_maximo`: `GO_LOCAL_COM_RESSALVAS`
- `gate_producao`: `NO_GO_PRODUCAO`
- `fase_ativa`: `FASE_9_DOCUMENTAL_VALIDADA`
- `fase_documental_estado`: `VALIDADO`
- `subfase_documental_ativa`: `-`
- `estado_execucao`: `BLOQUEADO_PRODUTO`
- `bloqueios_adicionais`: `BLOQUEADO_AMBIENTE`

### Baseline do worktree

O worktree ja continha alteracoes do utilizador antes desta correcao. Em particular, existiam alteracoes em `backend/`, `frontend/`, `mockup/`, `package.json`, `playwright.config.js` e varios documentos/evidences. Essas alteracoes sao pre-existentes, pertencem ao utilizador e nao podem ser limpas, revertidas ou atribuidas a esta execucao.

`git check-ignore -v` confirmou que `real_dev/` e ignorado por `.gitignore:2` (`# Prof`). Por decisao do utilizador, a referencia docente permanece privada e ignorada neste repositorio.

## 2. Decisoes vinculativas

- Nas Fases 1-8, a implementação técnica ficou limitada a `real_dev/backend`
  e `real_dev/frontend`.
- Na Fase 9, não existem escritas runtime: apenas `docs/**`, `README.md`,
  `ARCHITECTURE.md`, `scripts/validate_planificacao_canonica.py` e
  `scripts/test_validate_planificacao_negatives.py` podem ser alterados.
- Nao alterar as implementacoes dos alunos em `backend/` e `frontend/`, nem a
  referência privada em `real_dev/**`, durante a Fase 9.
- Manter `real_dev` privado e ignorado.
- Nao adicionar Docker, CI remoto ou manifests cloud.
- Nao adicionar videos reais nem URLs externas.
- Testar o player apenas com fixtures sinteticas locais MP4/HLS/DASH.
- Conteudo sem media pode permanecer publicado, com `mediaStatus: "pending"`, `isPlayable: false` e CTA desativado.
- Nao executar seeds, E2E, migracoes ou comandos destrutivos antes de `CP1`.
- Nao executar migracoes contra a base configurada nesta correcao.
- Nao fazer commits.
- Resultados historicos MF6-MF9 nao constituem prova atual.
- RNF08 e RNF10 permanecem `NAO_PROVADO` enquanto nao existir media/infraestrutura real.
- RNF23 pode atingir apenas `PARCIAL_VALIDADO` com adapters e fixtures locais.

## 3. Regras para o agente executor

1. Ler este report no inicio de cada turno e antes de editar.
2. Manter apenas uma fase em `EM_CORRECAO`.
3. Corrigir a causa raiz, sem refactors laterais.
4. Atualizar este report no mesmo turno de cada alteracao material.
5. Registar comando, cwd, data, exit code e resultado real.
6. Nao fechar findings apenas com scanners textuais.
7. `CORRIGIDO_NAO_VALIDADO` nao conta como fechado.
8. Nunca imprimir `.env`, URI MongoDB, cookies, tokens ou passwords.
9. Preservar o dirty worktree e nunca tocar nos roots excluidos.
10. Nao adicionar dependencias sem justificar necessidade e alternativa nativa.
11. Nao alterar RF/RNF para obter um teste verde.
12. Se faltar ambiente, browser, replica set ou ferramenta, registar o bloqueio honestamente.
13. Fechar cada fase com testes focados, suite acumulada, `git diff --check` e atualizacao deste report.

## 4. Estados permitidos

- `ABERTO`
- `EM_CORRECAO`
- `CORRIGIDO_NAO_VALIDADO`
- `VALIDADO`
- `BLOQUEADO_AMBIENTE`
- `BLOQUEADO_PRODUTO`
- `ACEITE_COM_RISCO`
- `NAO_APLICAVEL`

Um finding so fecha em `VALIDADO` ou `ACEITE_COM_RISCO` com decisao, justificacao e impacto residual.

## 5. Registo mestre de findings

| ID | Severidade | Finding agrupado | Fase | Estado |
| --- | --- | --- | --- | --- |
| `FF-AUD-001` | `P1` | Seeds E2E destrutivos sobre a DB configurada | 1 | `BLOQUEADO_AMBIENTE` |
| `FF-AUD-002` | `P1` | Seed demo cria admin com credencial fixa | 1 | `VALIDADO` |
| `FF-AUD-003` | `P1` | Catalogo publico expoe URLs de media e contorna entitlements | 2/8 | `VALIDADO` |
| `FF-AUD-004` | `P1` | Player aponta para media inexistente; E2E falso-verde; HLS/DASH ausente | 4 | `VALIDADO` |
| `FF-AUD-005` | `P1` | Consentimentos e parental nao condicionam recomendacoes/notificacoes | 2 | `VALIDADO` |
| `FF-AUD-006` | `P1` | Ausencia de rate limiting e protecao brute-force | 2/8 | `VALIDADO` |
| `FF-AUD-007` | `P1/P2` | CSRF, HTTPS, headers e configuracao de producao incompletos | 2 | `VALIDADO` |
| `FF-AUD-008` | `P1` | Reset concorrente e sem revogacao de sessoes | 2 | `VALIDADO` |
| `FF-AUD-009` | `P1` | Operacoes criticas nao transacionais | 3/8 | `BLOQUEADO_AMBIENTE` |
| `FF-AUD-010` | `P2` | Limite familiar e idempotencia vulneraveis a concorrencia | 3 | `BLOQUEADO_AMBIENTE` |
| `FF-AUD-011` | `P1` | Renovacao/expiracao/pool sem worker e contabilidade mensal incorreta | 3 | `BLOQUEADO_AMBIENTE` |
| `FF-AUD-012` | `P1/P2` | Health falso-verde e ausencia de graceful shutdown | 6 | `VALIDADO` |
| `FF-AUD-013` | `P1/P2` | Ciclo de sessao e cliente API incompletos | 4/8 | `VALIDADO` |
| `FF-AUD-014` | `P1/P2` | Pesquisa, catalogo admin e rotas funcionais incompletos | 4 | `VALIDADO` |
| `FF-AUD-015` | `P2` | Races, progresso, optimistic UI e acoes admin frageis | 5 | `VALIDADO` |
| `FF-AUD-016` | `P2/P3` | Acessibilidade, responsividade, PT-PT e performance | 5 | `VALIDADO` |
| `FF-AUD-017` | `P3` | Paginacao backend, coercoes e limites de input | 5 | `VALIDADO` |
| `FF-AUD-018` | `P2` | Vite vulneravel, toolchain e supply chain nao reproduziveis | 1 | `VALIDADO` |
| `FF-AUD-019` | `P2` | Cobertura frontend/E2E estreita, Chromium-only e servidor reutilizavel | 1/7 | `BLOQUEADO_AMBIENTE` |
| `FF-AUD-020` | `P1` | Evidence executa roots dos alunos e sobrestima RF63/streaming | 7/8/9 | `VALIDADO` |
| `FF-AUD-021` | `P1/P2` | Validador, guias, backlog, sessao e runbooks contraditorios | 7/9 | `VALIDADO` |
| `FF-AUD-022` | `P2` | `real_dev` e lockfiles fora de SCM | 0 | `ACEITE_COM_RISCO` |
| `FF-AUD-023` | `P2` | CI, deploy, backup, rollback e arquitetura incompletos | 6 | `ACEITE_COM_RISCO` |
| `FF-AUD-024` | `P1` | Credencial MongoDB embebida no `.env` privado da referencia | 2 | `BLOQUEADO_PRODUTO` |
| `FF-DOC-001` | `P1` | Procedimentos E2E atuais contradizem os guardas de isolamento | D1 | `VALIDADO` |
| `FF-DOC-002` | `P1` | Guias de catalogo/media reintroduzem fontes publicas | D3/D7 | `VALIDADO` |
| `FF-DOC-003` | `P1` | Cliente API, CSRF, CORS e API base documentados de forma incompleta | D3/D7 | `VALIDADO` |
| `FF-DOC-004` | `P1` | Guia de health ensina readiness falso-verde | D3 | `VALIDADO` |
| `FF-DOC-005` | `P1` | Eliminacao RGPD copiavel sem password/transacao | D3 | `VALIDADO` |
| `FF-DOC-006` | `P2` | Snippet de sessao converte indisponibilidade em logout | D3/D7 | `VALIDADO` |
| `FF-DOC-007` | `P2` | Runbook mistura roots, portas e scripts de alunos/referencia | D4 | `VALIDADO` |
| `FF-DOC-008` | `P2` | Rate limits e schemas operacionais nao estao consolidados | D2/D4/D7 | `VALIDADO` |
| `FF-DOC-009` | `P2` | Matriz canonica conserva criterios/evidence genericos | D2 | `VALIDADO` |
| `FF-DOC-010` | `P2` | Evidence confunde referencia privada, alunos e prova atual | D5/D7 | `VALIDADO` |
| `FF-DOC-011` | `P2` | Baseline historica 60/60 aparece como atual | D5 | `VALIDADO` |
| `FF-DOC-012` | `P2` | Lifecycle de rotas e limite de email incompletos | D2/D4/D7 | `VALIDADO` |
| `FF-DOC-013` | `P2` | Snippets financeiros v1 continuam copiaveis | D4/D7 | `VALIDADO` |
| `FF-DOC-014` | `P2` | README e template dos guias definem contratos concorrentes | D5/D7 | `VALIDADO` |
| `FF-DOC-015` | `P3` | Stack, comandos, metadata e linguagem editorial com drift | D5/D7 | `VALIDADO` |
| `FF-DOC-016` | `P1/P2` | Validador nao deteta os drifts documentais materiais | D6/D7 | `VALIDADO` |

### Aceitacao de risco `FF-AUD-022`

- `decisao`: manter `real_dev` privado e ignorado neste repositorio.
- `justificacao`: separar a referencia docente das implementacoes entregues pelos alunos.
- `impacto_residual`: este checkout nao oferece provenance, code review, rollback ou reproducibilidade de producao para `real_dev`.
- `condicao_pre_producao`: mover a referencia e lockfiles para um repositorio privado autoritativo antes de qualquer deploy real.
- `aprovacao`: decisao explicita do utilizador em 2026-07-09.

### Bloqueio `FF-AUD-024`

- `descoberta`: revisao independente encontrou uma URI MongoDB com credenciais embebidas em `real_dev/backend/.env`; o valor nunca foi reproduzido no report ou nos logs.
- `correcao_local`: permissoes do ficheiro reduzidas de `0644` para `0600`; o ficheiro continua ignorado pelo Git.
- `bloqueio`: a rotacao/revogacao da credencial no fornecedor exige acesso e decisao externa do titular.
- `impacto_residual`: se a credencial ainda estiver valida, deve ser considerada comprometida por exposicao local e a baseline nao pode ser promovida a producao.
- `estado`: `BLOQUEADO_PRODUTO` ate existir prova de rotacao.

### Aceitacao de risco `FF-AUD-023`

- `decisao`: fechar o finding para a baseline local, aceitando explicitamente a ausência de CI/deploy, rollback remoto, backup diário automático e restore real demonstrado.
- `justificacao`: o utilizador limitou esta execução a uma baseline local, sem Docker, CI remoto ou manifests cloud. Foram acrescentados arquitetura, runbooks, health, shutdown e CLIs fail-closed, que são a correção máxima dentro desse âmbito.
- `prova_local`: 228/228 testes backend; health negativo/positivo; shutdown API/worker com fakes; scripts backup/restore com 10/10 doubles; documentação e guardas revistos independentemente.
- `bloqueio_ambiente`: `mongodump` e `mongorestore` não existem no `PATH`; nenhum backup/restore real foi executado e `RNF20` permanece apenas `PARCIAL_VALIDADO`.
- `impacto_residual`: não existem RPO/RTO demonstrados, recuperação automática, retenção externa, pipeline autoritativo ou rollback de dados/serviço. Um incidente real dependeria de operação manual não ensaiada neste ambiente.
- `condicao_pre_producao`: instalar as Database Tools, demonstrar backup+restore numa DB isolada, criar repositório privado/CI/deploy autoritativos e testar rollback remoto antes de rever `NO_GO_PRODUCAO`.

### Bloqueios `FF-AUD-001` e `FF-AUD-019`

- `correcao_local`: seeds e harness exigem cumulativamente test mode, opt-in de seed, URI loopback sem credenciais/proxy, replica set explícito, DB ASCII `_e2e` não operacional e configuração diferente da DB normal. O cleanup pré-valida todas as coleções e elimina apenas pelo marcador exato.
- `prova_local`: guards seed/env 16/16; contrato formal 5/5; backend unit 196/196; tentativa sem env recusada antes de build/servidores; revisão independente sem P0/P1 residual destrutivo.
- `bloqueio_ambiente`: não existe replica set dedicado autorizado, por isso nenhum seed, E2E funcional ou teste de concorrência MongoDB foi executado.
- `impacto_residual`: depois de um fluxo real, services podem criar documentos sem `e2eFixture`; o re-seed na mesma DB aborta em segurança e não é idempotente. Cada run exige hoje uma DB nova até o run marker ser propagado transacionalmente.
- `condicao_de_fecho`: demonstrar `seed -> E2E -> seed` ou teardown equivalente numa DB isolada, executar Chromium/Firefox/WebKit funcionalmente e registar Chrome/Edge/Safari reais quando disponíveis.

### Reaberturas da Fase 8

- `FF-AUD-003`: a reauditoria encontrou aliases de fonte `url` e `source.url` ainda reproduzíveis no catálogo público; foi aplicada uma allowlist estrita. A revisão final encontrou ainda um CTA falso-positivo para fontes textuais inválidas; catálogo e playback passaram a partilhar a mesma canonicalização de localização/protocolo/MIME.
- `FF-AUD-006`: além do limite cumulativo em recuperação de password já corrigido, a reauditoria encontrou um caminho criptográfico mais curto no login para utilizadores inexistentes/inativos; exige uma verificação `scrypt` constante por tentativa e teste observável.
- `FF-AUD-009`: a primeira correção transacional de integrações revelou gaps da mesma causa raiz em passagens bíblicas/associações, moderação privilegiada de comentários e fecho manual da pool. Todas as mutações administrativas devem propagar ator/`requestId`, usar a mesma sessão e reverter domínio quando o audit falha; o helper de audit deve recusar chamadas fora de `runInTransaction`. A revisão final mostrou também que o invariante do último admin contava estados inativos/desconhecidos como operacionais; a allowlist passou a coincidir com a sessão (`active` ou legacy sem estado).
- `FF-AUD-010`: a revisão final mostrou que planos Family incompletos recebiam por defeito 4K/cinco lugares. Entitlements deixam de completar campos ausentes ou coercivos; planos ativos malformados são omitidos da oferta pública e não dão acesso premium.
- `FF-AUD-013`: o registo criava primeiro `users` e só depois uma sessão fora da mesma transação. Falha no insert da sessão deixava conta criada e resposta de erro; exige registo+sessão no mesmo commit e fault injection.

## 6. Plano e checkpoints

| Fase | Objetivo | Estado | Checkpoint |
| --- | --- | --- | --- |
| 0 | Report, baseline e freeze de operacoes perigosas | `VALIDADO` | `CP0_VALIDADO` |
| 1 | Seeds/E2E isolados e toolchain | `BLOQUEADO_AMBIENTE` | `CP1_SEGURANCA_VALIDADA_RUNTIME_PENDENTE` |
| 2 | Seguranca, autorizacao, sessao e privacidade | `BLOQUEADO_PRODUTO` | `CP2_VALIDADO_LOCAL_CREDENCIAL_PENDENTE` |
| 3 | Transacoes, idempotencia, familia, billing e worker | `BLOQUEADO_AMBIENTE` | `CP3_VALIDADO_LOCAL_REPLICA_SET_PENDENTE` |
| 4 | Frontend funcional e player sintetico | `VALIDADO` | `CP4_VALIDADO_LOCAL` |
| 5 | Robustez, acessibilidade e performance | `VALIDADO` | `CP5_VALIDADO_LOCAL` |
| 6 | Operacao local e documentacao tecnica | `BLOQUEADO_AMBIENTE` | `CP6_VALIDADO_LOCAL_RESTORE_BLOQUEADO` |
| 7 | Testes, guias, evidence e validador | `BLOQUEADO_AMBIENTE` | `CP7_VALIDADO_LOCAL_E2E_DB_PENDENTE` |
| 8 | Reauditoria e gate final | `VALIDADO` | `GATE_FINAL_GO_LOCAL_COM_RESSALVAS` |
| 9 | Remediacao documental integral | `VALIDADO` | `CP-D7_VALIDADO` |

### Checkpoint documental D0

- `baseline_commit`: `1f33e61d1751fcae702ee92d1865fccfe295a0e0`.
- `dirty_worktree`: confirmado e preservado; continha alteracoes pre-existentes nas implementacoes dos alunos, mockup, orquestracao e documentacao.
- `roots_excluidos`: `real_dev/**`, `backend/**`, `frontend/**`, `mockup/**`, manifests, dependencias e lockfiles.
- `escritas_permitidas`: `docs/**`, `README.md`, `ARCHITECTURE.md`, `scripts/validate_planificacao_canonica.py` e `scripts/test_validate_planificacao_negatives.py`.
- `operacoes_proibidas`: DB, seeds, E2E, migracoes e servidores.
- `precedencia_documental`: RF/RNF -> arquitetura -> matriz -> guias/runbooks -> evidence.
- `decisao`: a Fase 9 usa este report como unica fonte de verdade e nao cria um report concorrente.
- `reaberturas`: `FF-AUD-020` e `FF-AUD-021` regressam a `EM_CORRECAO`; os findings tecnicos conservam os estados anteriores e recebem apenas rastreabilidade para `FF-DOC-*`.

`CP-D0` fica `VALIDADO`: a política foi publicada em `docs/evidence/README.md`
e `docs/planificacao/README.md`; os roots excluídos não foram alterados por esta
fase documental.

### Estado das subfases documentais

| Subfase | Objetivo | Estado |
| --- | --- | --- |
| D0 | Baseline, autoridade e metadata | `VALIDADO` |
| D1 | Procedimentos E2E/Playwright seguros | `VALIDADO` |
| D2 | RF/RNF, arquitetura e matriz | `VALIDADO` |
| D3 | Guias críticos | `VALIDADO` |
| D4 | Operação, UI, rate limits e finanças | `VALIDADO` |
| D5 | Evidence, snapshots e contrato editorial | `VALIDADO` |
| D6 | Validador e negativos | `VALIDADO` |
| D7 | Reauditoria e fecho | `VALIDADO` |

### Checkpoint documental D7 final

- `baseline_canonica`: `66` BK, `66` guias, `94` requisitos, `10` MF views e
  `30` evidences, com zero erro.
- `validador_negativo`: `143/143` mutações isoladas recusadas pelo field
  esperado; inclui guardas E2E, lane STUDENT/REFERENCE, snippets críticos,
  lifecycle, transações, cleanup e loading público.
- `sweeps_documentais`: `163` documentos e `10` links locais com zero target
  inexistente; `66` guias sem paths privados; `29` referências à baseline 60
  classificadas como política, snapshot, caveat, finding ou changelog; `8`
  fences E2E atuais sem `MONGODB_*` normal; zero padrão legacy e uma única
  autoridade de checkout.
- `consistencia_executavel`: `685` fences válidas (`335` JS, `105` JSX, `1` TS,
  `229` Bash e `15` JSON); `832` imports relativos nomeados, `492` símbolos
  exportados e zero import pedagógico globalmente indefinido.
- `runbooks`: `5` documentos, `14` comandos npm e zero incompatibilidade
  estática com os manifests correspondentes.
- `revisao_humana`: as reauditorias independentes encontraram problemas
  residuais reais durante D7; todos foram corrigidos, cobertos por mutações
  negativas e novamente revistos. A última cross-audit dos helpers estáveis não
  encontrou P0/P1/P2 residual.
- `limites_da_prova`: não foram executados DB, seed, migração, browser, E2E,
  servidor ou runtime. A validação é exclusivamente documental e estática.

`CP-D7` fica `VALIDADO`. Todos os `FF-DOC-001..016`, `FF-AUD-020` e
`FF-AUD-021` ficam `VALIDADO`; os bloqueios runtime, ambientais e de produto
mantêm os respetivos estados e não são convertidos em prova documental.

### Reabertura documental D3 por composição

A primeira validação D3 confirmou os contratos isolados, mas uma revisão
independente de execução sequencial encontrou imports/helpers não ensinados e
substituições destrutivas de ficheiros partilhados. Em particular, a cadeia
pedagógica ainda não criava `runInTransaction`/`pingDatabase`/`closeDatabase`,
o catálogo público documentado não cumpria o próprio envelope paginado, o guia
media podia apagar validators editoriais, a eliminação podia apagar exports
anteriores e o router MF7 podia remover lazy routes/ErrorBoundary/lifecycle.

Por isso, D3 e `FF-DOC-002..006` foram reabertos. O validador estrutural também
foi corrigido para recusar pontos top-level `8..N`; 17 passos em quatro guias
MF1 ficaram explicitamente pendentes. D5 conserva as alterações já aplicadas,
mas volta a `ABERTO` enquanto D3 é a única subfase em `EM_CORRECAO`.

A recomposição subsequente fechou essas causas: os helpers de MongoDB,
transação, sessão, CSRF, health, audit e rate limit passaram a ser ensinados
antes do uso; catálogo/media usam DTOs e canonicalização aditivos; frontend,
RBAC e RGPD preservam módulos anteriores; os pontos ficaram exatamente em
`1..7`. O validador global de 2026-07-10 já não acusa contratos críticos,
composição, headings, pontos, metadata ou media: restam apenas 151 violações do
orçamento de comentários didáticos. D3 passa por isso a
`CORRIGIDO_NAO_VALIDADO` e D5 torna-se a única subfase em `EM_CORRECAO`.

### Transição D5/D6 para D7

Os três lotes de comentários didáticos eliminaram os 151 erros restantes sem
alterar a semântica dos snippets. A inspeção dos procedimentos atuais detetou
ainda exemplos de nomes de DB E2E reutilizáveis em evidence híbrida MF8/MF9;
foram substituídos por nomes com run ID UTC e instrução explícita de gerar uma
DB nova por execução, mantendo seed e browser em comandos separados.

O validador passou também a verificar os schemas `payment_attempts` v2 e
`contents.mediaStatus`, os scripts `npm` dos cinco runbooks contra os quatro
manifests da respetiva lane e o procedimento MF9 atual. A baseline ficou verde
e 57 mutações temporárias isoladas foram recusadas. D6 fica `VALIDADO`; D5
aguarda apenas a reauditoria acumulada e D7 torna-se a única subfase em
`EM_CORRECAO`.

### Reabertura D7 após reauditoria humana

A baseline verde de D6 não fechou a correção. Duas revisões read-only
independentes encontraram drifts de composição que exigem leitura sequencial
dos tutorials e, por isso, não eram detetados pelos markers anteriores:

- `BK-MF2-01` substituía a fundação MF1 de env/sessão/CSRF, usava helpers e
  assinaturas inexistentes e limpava identidade local numa falha operacional;
- `BK-MF9-02` importava acesso efetivo criado apenas no BK seguinte e não
  exigia `hasPremiumAccess`, permitindo fallback de fonte sem subscrição;
- MF9 declarava eligibility de planos antes de billing sem a aplicar ao
  checkout/ativação/renovação autoritativos;
- a política E2E MF2 usava dois helpers de fixtures não definidos;
- catálogo e playback divergiam para qualidades desconhecidas; parental
  malformado falhava aberto; a UI enviava qualidade automática recusada pelo
  backend; eliminação não montava os limites normativos;
- rotas React posteriores reintroduziam imports eager/bindings duplicados e
  quatro páginas admin eram usadas sem declaração; notificações desapareciam
  do header;
- o tutorial MF9 familiar e um fragmento MF4 de charities ainda continham
  helpers/exports cumulativos incompletos;
- 15 guias tinham headings `####` extra, o arquivo não tinha metadata D0, 12
  híbridos não tinham boundary estrutural e dois snapshots STUDENT não
  distinguiam a comparação REFERENCE;
- o cliente esperava `CSRF_INVALID`, mas o middleware não atribuía esse código,
  e o runbook do worker expandia potencialmente a URI no argv.

Por isso, `FF-DOC-002/003/006/008/010/012/013/014/015/016` regressam a
`EM_CORRECAO`. O validador e os 57 negativos continuam prova histórica de D6,
mas não contam como prova pós-correção D7; serão ampliados e repetidos depois de
todos estes findings ficarem compostos.

### Segunda reabertura D7 por execução sequencial completa

Uma nova leitura dos 66 guias, já depois dos primeiros 88 contratos negativos,
encontrou causas adicionais que o parser sintático não consegue provar:

- MF7/MF6 voltavam a substituir catálogo, pesquisa, biblioteca e player por
  versões sem paginação, cancelamento, URL-state ou adapters HLS/DASH;
- MF4 removia as rotas fixas `/preferences` ao acrescentar o entitlement de
  playback, e MF7 chamava um nome inexistente em `recommendationsApi`;
- páginas de subscrição MF7/MF9 omitiam `Idempotency-Key`, podendo enviar a
  string constante `undefined`, e a UI Family não aplicava confirmação,
  cancelamento, busy por operação ou encoding de IDs;
- `Origin`/CSRF de auth público, quatro procedimentos curl e o middleware de
  hardening não formavam um contrato executável coerente;
- o rate limit de recomendações, o canal dev-only de reset, o guard destrutivo
  de seed e a fundação de worker/jobs eram prometidos sem implementação
  copiável;
- metadata de rotas, moderator no catálogo, menu mobile, consentimentos e
  gestão de utilizadores perdiam requisitos de robustez em guias posteriores.
- o contrato Family afirmava que `past_due`/`canceled` fechavam memberships no
  mesmo ciclo, mas ainda não ensinava a extensão cumulativa do billing job nem
  a propagação de `{ session }`; a integração MF9 ficou reaberta até existir
  snippet e fault injection copiáveis.
- a reauditoria humana pós-110 negativos encontrou seis false-negatives
  semânticos adicionais: MF4-08 substituía o progresso seguro; o guard E2E
  podia cair nas variáveis MongoDB normais em `test`; comandos MF9-06 omitiam
  env obrigatória; MF9-05 reintroduzia pool v1, limpava a outbox pelo campo
  errado e media consentimentos por `changedAt` inexistente.
- a continuação da mesma reauditoria encontrou consentimentos sem
  transação/índice, middleware auth concorrente, cliente a aceitar `2xx`
  inválido, bodies usados antes de validação, cache privado incompleto, helper
  media e state de qualidade indefinidos, ranks desconhecidos permissivos e
  `requestId` arbitrário refletido em header/log.
- o cruzamento de MF4/MF9 mostrou ainda que a autorização própria bloqueava
  apenas três estados em vez de aceitar explicitamente `active|trialing`, e a
  versão MF9-02 procurava um plano persistido `trial`, retirando o entitlement
  1080p prometido ao trial válido.
- MF9-03 usava três eventos Family ausentes da allowlist de notificações, pelo
  que invite/accept/remove fariam rollback; além disso, `isActiveAccount` e o
  lock de billing ignoravam `user.status`, permitindo owner bloqueado/inativo
  quando `accountStatus` estivesse ausente.
- MF5-04/MF9-05 repetiam a mesma omissão na invariante do último admin:
  outro admin com `status: blocked|inactive|unknown` podia ser contado como
  operacional e permitir eliminar/despromover o último admin autenticável.
- a auditoria dos ficheiros fora dos lotes encontrou autorização Charity
  fail-open, códigos `HttpError` descartados, review coercivo, ratings não
  atómicos/racy, motivo de moderação público, recomendações sem dedupe/feedback
  e com erro de rede tratado como logout, mais quatro drifts Charity de status,
  idempotência, body nulo e leituras tardias.
- o handoff do middleware único revelou 19 referências/imports residuais em 15
  guias para
  `modules/auth/auth.middleware.js`; o tutorial canónico cria apenas
  `src/middlewares/auth.middleware.js`, pelo que esses routers/testes não
  conseguiriam resolver o módulo.
- a continuação MF4/MF5 encontrou export RGPD sem cancelamento/reserva e com
  sanitização apenas top-level; métricas com datas/estados e UI incoerentes;
  integrações sem índice único e com blacklist de segredos permissiva; pool a
  somar moedas diferentes/overflow e controller a aceder a body nulo.
- MF6-04 aceitava base URL externa e enviava-lhe o cookie da sessão, sem
  timeout; MF7 deixava um `401` privado esconder planos públicos, não protegia
  por URL direta as páginas privadas em `unavailable` e permitia duplo logout
  antes do rerender.
- MF3-06 prometia reason codes de scoring/semântica inexistentes e escondia o
  drift com fallback; MF7-04 renderizava a explicação antes de confirmar que o
  grupo tinha candidatos, criando secções vazias.
- o fecho de sessão encontrou `decodeURIComponent` de cookie sem proteção e
  `/api/session/me` com identidade sem `Cache-Control: private, no-store`;
  cookie malformado podia causar 500 e a resposta podia ser cacheada.
- o primeiro fix MF6-04 fechou URL/cookie/curl, mas limpava o timer ao receber
  headers; um body que nunca termina ainda podia pendurar a medição.
- a conclusão read-only acrescentou suite MF6-01 incompatível com idempotência
  e transações, pesquisa com `$lookup` pesado antes da paginação, URL pública
  com credenciais, eliminação sem reserva/cancelamento e Home sem cancelamento,
  erro seguro ou CTAs coerentes com sessão.
- a reauditoria pós-fix dos 18 guias security/governance confirmou zero P0/P1,
  mas manteve quatro P2: imports/referências para a localização auth obsoleta,
  paginação de users prometida sem implementação, reserva de preferências de
  notificações dependente de state React e evidence MF6-01 que sobrestimava uma
  integração transacional apenas instruída, não executada nesta fase.
- a reauditoria pós-fix do lote core encontrou ainda dois P1 e dois P2
  copiáveis: env MF1-04 exigia a DB normal também em `test`; sessão MF1-04
  aceitava `accountStatus:blocked` quando `status` era legacy; alteração de
  role MF2-02 não era transacional/auditada; rating MF3-01 acedia a body nulo.
- as três reauditorias finais mantiveram zero P0, mas reabriram um P1 e sete
  P2: fonte de qualidade `locked` selecionável; smoke MF1 com DB normal e
  colisão de lane na evidence; complete/fail de job com lease expirado; página
  pública de planos acoplada a `getMine`; trigger financeiro impossível;
  remontagem de `attachSession`; criações admin sem transação/audit.
- a cross-audit dos últimos fixes encontrou ainda um P1 e um P2: a branch de
  sessão não autenticada saía antes do único `setLoading(false)` em MF9-04, e
  o DB double do smoke MF1-06 não era limpo quando `listen`/`server.close`
  falhavam. Ambos ficam reabertos até cleanup em `finally` e nova mutação.
- a cross-audit de governação confirmou o loading e encontrou um false-negative
  P2: `smoke_isolation` recusava `MONGODB_*`, mas ainda aceitava
  `TEST_MONGODB_*`. A regra passa a recusar ambas e recebe uma segunda mutação.
- a última cross-audit encontrou outro P2 no validador: contar duas strings de
  reset não provava que cada `finally` tinha uma instrução ativa. A regra passa
  a extrair os blocos de close/startup e a mutação preserva a string em comentário.

Estes pontos mantêm D7 e os findings documentais afetados em `EM_CORRECAO`.
Resultados verdes anteriores continuam registados no ledger, mas deixam de ser
prova de fecho. As correções são feitas nos guias proprietários e recebem uma
mutação negativa antes da repetição integral.

### Checkpoint tecnico da Fase 2

- Catalogo publico: serializers recursivos removem `media`, `playbackUrl` e qualquer `src`; admin preserva fontes; legado sem estado fica `pending`.
- Playback: autenticado, uma unica fonte selecionada, opcoes sem URL, `409 MEDIA_NOT_READY` e `Cache-Control: private, no-store`.
- Privacidade: personalizacao exige consentimento explicito, cold-start nao le colecoes pessoais, parental filtra sinais/candidatos e alertas opcionais respeitam consentimento/preferencias.
- Sessao/CSRF: TTL absoluto de 24 h, token apenas em memoria no frontend, hashes limitados por sessao para multi-tab, token obrigatorio em mutacoes autenticadas e Origin/Fetch Metadata como camada adicional.
- Brute-force: contadores Mongo pseudonimizados por HMAC/TTL; combinacoes por IP, email, token ou utilizador; reset confirma token antes de `scrypt`; eliminacao tem limites por utilizador e IP.
- Reset: claim atomico, password 10-128, revogacao dos restantes resets e de todas as sessoes dentro da transacao.
- Eliminacao: frase e password atual, transacao, remocao de PII em comentarios, convites, outbox e trials; ledger financeiro mantido apenas com marcacao/pseudonimizacao.
- Frontend: API base fail-closed, timeout/abort, 204/205, JSON invalido, `requestId`, retry CSRF unico, estados `loading|authenticated|anonymous|unavailable`, safe-next, logout e limpeza apos eliminacao.
- Prova atual: backend 97/97 e frontend 43/43, todos com doubles locais/in-memory; configuracao de producao importada com valores sinteticos.
- Residual: transacoes Mongo reais/topologia replica set ficam para `CP3`; browser E2E fica para `CP4/CP7`; rotacao da credencial externa permanece `FF-AUD-024`.

`CP2` esta validado para a baseline local. A fase aparece como `BLOQUEADO_PRODUTO` exclusivamente porque a credencial descoberta tem de ser rodada fora do repositorio; esse bloqueio nao autoriza nem exige acesso a MongoDB durante as fases seguintes.

### Checkpoint tecnico da Fase 3

- Transacoes: helper Mongo sem fallback real, retry apenas de `TransientTransactionError`, commit incerto sem repeticao da callback e rejeicao de transacoes aninhadas.
- Billing: checkout/trial exigem idempotencia, serializam a conta, recusam contas indisponiveis e segunda subscricao ativa, persistem snapshot financeiro v2 e audit no mesmo commit.
- Familia e administracao: lugares incluem owner, write-conflicts e indices fecham races; review, membership, catalogo CAS, user admin, ultimo admin e RGPD partilham transacao e audit minimizado.
- Worker: processo separado, leases por ciclo/mes, renovacao deterministica simulada, expiracao/cancelamento, calendario EOM e catch-up mensal em lotes progressivos.
- Pool: apenas pagamentos v2 aprovados, EUR e nao estimados; snapshot invalido falha fechado; mes sem associacao elegivel fica `deferred_no_eligible_charities` e nunca e redistribuido retroativamente.
- Performance local: indice parcial `payment_attempts_pool_month_v2` cobre filtro, range e ordenacao do fecho/catch-up.
- Prova atual: 140/140 unitarios, 18/18 regressao+integracao HTTP e 167/167 backend acumulados; zero skips, seeds, migracoes ou DB configurada.
- Revisao independente: nao encontrou mais P0/P1/P2 corrigivel na baseline local e confirmou sintaxe dos 14 ficheiros F3.
- Bloqueio: nao existe replica set MongoDB dedicado autorizado. Transacoes, write conflicts, indices, leases, concorrencia e fault injection reais permanecem por demonstrar; por isso `FF-AUD-009/010/011` nao sao fechados como `VALIDADO`.

`CP3` esta corrigido e validado apenas com doubles locais. A execucao avanca para `FASE_4`, mantendo o bloqueio de ambiente e `NO_GO_PRODUCAO` sem converter prova in-memory em prova MongoDB real.

### Checkpoint tecnico da Fase 4

- Backend: catálogo/search paginados e estáveis; create editorial força media pending, update recusa campos media; playback devolve uma única fonte canónica após publicação, subscrição, parental e disponibilidade.
- Frontend: cliente/sessão/safe-next/logout, boundary/lazy routes, navegação, pesquisa URL-driven, notificações com rollback, catálogo metadata-only, CTA pending e player com retry/cancelamento ficaram cobertos por testes comportamentais.
- Player: adapters progressive, HLS nativo/`hls.js` e `dashjs` são lazy e destruídos em troca/unmount; options/tracks não transportam fontes; progresso é serial/coalescido e só confirma posição depois do backend.
- Fixtures: o antigo `piloto.mp4` foi identificado como áudio PCM, não vídeo, e deixou de ser usado. A fixture atual é canvas fMP4 H.264 baseline 320×180, sem áudio/conteúdo real, com init/segment, HLS/DASH, checksums e geração local documentada.
- Prova atual: backend 183/183; frontend 77/77 + lint/build; media preview-only 9/9 em Chromium/Firefox/WebKit, com API/media intercetadas, HTTP Range, rede apenas loopback e zero backend/DB/seed.
- Documentação: sessão, catálogo administrativo, playback, guias E2E/runbook e snapshots históricos foram sincronizados; validador 66/66, paths públicos e whitespace confirmados.
- Limites: a matriz 9/9 não é full E2E funcional, vídeo/4K/CDN/ABR/DRM/performance/carga real. `RNF08`/`RNF10` continuam `NAO_PROVADO`; `RNF23` fica `PARCIAL_VALIDADO`; full E2E isolado com DB `_e2e` continua em `FF-AUD-001/019/020` para F7.

`CP4` fica `VALIDADO` para a baseline local. A execução avança para `FASE_5`; nenhuma prova sintética altera o `NO_GO_PRODUCAO`.

### Checkpoint tecnico da Fase 5

- Robustez frontend: leituras usam `AbortController`/epoch, mutações ficam serializadas, optimistic UI reverte em falha e ações administrativas críticas exigem confirmação e busy state localizado. O editor de catálogo reserva exclusivamente o formulário, preserva página/seleção atuais e não deixa sucesso ou conflito de outra linha apagar alterações locais.
- Inputs/listagens: bodies JSON exigem tipos reais; query/path aceitam apenas scalars; arrays, números serializados e truncagem silenciosa são recusados. Listagens pessoais e administrativas têm limites `<=50`, metadata e ordenação estável.
- Acessibilidade/UX: tokens AA, foco visível, targets de 44 px, reduced motion, header móvel fechado de 68 px, Escape com restituição de foco, PT-PT e estados loading/error/empty/retry uniformes.
- Performance: logo 19,91 kB; JS inicial 61,90 kB gzip e CSS 5,38 kB gzip. `hls.js`/`dashjs` permanecem em imports/chunks lazy fora do bundle inicial.
- Prova atual: backend 196/196; frontend 50 ficheiros/197 testes + lint/build; Axe 14/14 em Chromium incluindo `/admin/catalogo`; media sintética 9/9 em Chromium/Firefox/WebKit; validador 66/66 e whitespace/diff limpos.
- Documentação: RF/RNF, matriz, guias MF2/MF3/MF4/MF5/MF7/MF8/MF9 e evidence associada foram sincronizados por adendos vinculativos, sem promover estados dos alunos nem introduzir paths privados nos guias públicos.
- Limites: Axe automatizado não substitui Safari real/Chrome/Edge branded nem auditoria manual completa; media 9/9 continua preview sintético e não prova streaming/CDN/4K/carga real; transações/concorrência Mongo reais permanecem bloqueadas pelo ambiente.

`CP5` fica `VALIDADO` para a baseline local. A execução avança para `FASE_6`, mantendo `NO_GO_PRODUCAO` e todos os bloqueios externos já registados.

### Checkpoint tecnico da Fase 6

- Health: `/health/live` não consulta DB/sessão e permanece 200; `/health/ready` e o alias `/health` fazem ping com deadline total de 500 ms, devolvem 200/503, usam `no-store` e nunca serializam a exceção interna.
- Ciclo de vida: API deixa de aceitar tráfego, fecha ligações idle, drena/força HTTP dentro de budgets e só depois fecha MongoDB; worker cancela o polling, aguarda o ciclo ativo e fecha a DB uma vez. Sinais repetidos são idempotentes.
- Produção fail-closed: `NODE_ENV` aceita apenas `development|test|production`; produção exige serviço/Mongo explícitos, pepper forte, HTTPS e trusted proxy fechado. Erros incluem apenas nomes de variáveis.
- Database Tools: URI/DB e opt-in são dedicados; archive absoluto não sofre overwrite; config/artefactos usam `0600`; subprocessos têm shell/output fechados e environment allowlisted; restore só elimina target derivado com ownership marker.
- Documentação: `ARCHITECTURE.md`, quatro runbooks, README, RNF, runbook MF9 e adendos MF6/MF8 distinguem baseline local, bloqueios e snapshots históricos.
- Prova atual: 228/228 backend; 30/30 focados F6; 16/16 após a revisão independente; 66/66 validador; sintaxe, fences, whitespace e diff limpos. Nenhum servidor principal/worker, seed, migração, DB configurada ou Database Tool real foi executado.
- Revisão independente: encontrou e levou à correção de `NODE_ENV` permissivo e secrets herdados pelo subprocesso; depois disso não ficou outro P0/P1/P2 sólido no scope F6.
- Bloqueio: `mongodump`/`mongorestore` ausentes. Restore real, backup diário, CI/deploy e rollback remoto não são validados; `FF-AUD-023` fecha apenas por aceitação de risco explícita da baseline local.

`FF-AUD-012` fica `VALIDADO` localmente. A Fase 6 fica `BLOQUEADO_AMBIENTE` apenas na demonstração real de backup/restore e a execução avança para `FASE_7`; nenhuma destas provas altera `NO_GO_PRODUCAO`.

### Checkpoint tecnico da Fase 7

- Harness formal: Chromium/Firefox/WebKit, `reuseExistingServer:false`, `start`/`preview`, bind loopback, política de rede em todos os contextos e publicação direta em evidence recusada.
- Seeds: guard Mongo comum fail-closed, ausência de fallback normal, parâmetros restritos a `replicaSet` e cleanup two-pass exclusivamente pelo marcador. Hosts externos, proxy, credenciais, DB operacional e deletes por identidade foram fechados.
- Na prova histórica da Fase 7, o validador cruzava 66 BK/guias, 94 requisitos,
  10 MF views e 29 evidences; validava anexos exatos, namespace, lane
  pedagógica, paths públicos case-insensitive em guias/runbook, placeholders e
  wrapper oficial exato. Nessa prova, treze mutações temporárias falhavam
  deliberadamente; os totais atuais constam do checkpoint D7.
- Documentação/evidence: comandos docentes usam `real_dev`; guias dos alunos mantêm `backend/frontend`; sessão, MF4 e MF9 estão alinhados; templates legacy estão arquivados; snapshots históricos não são prova atual; RF63/media/4K/carga não são sobrestimados.
- Prova acumulada: `npm run validate` final passou com backend 196/196 unit + 18/18 integração, frontend 50 ficheiros/197, contratos 5/5 + 12/12 + 21/21, segurança 10/10 + scanner, build/lint/media verdes. A flake de sessão ficou 5/5 em três repetições focadas.
- Revisão independente: não encontrou P0/P1 residual; confirmou um P2 operacional no rerun pós-E2E, mantido em `FF-AUD-001/019` como bloqueio de ambiente/prova.
- Limites: full E2E funcional, replica set real e browsers branded/Safari real não foram executados. A matriz media 9/9 e Axe 14/14 continuam provas preview-only separadas.

`FF-AUD-020` e `FF-AUD-021` ficam `VALIDADO`. A Fase 7 fecha localmente como `BLOQUEADO_AMBIENTE` por `FF-AUD-001/019`, e a execução avança para `FASE_8` sem converter configuração em prova browser/DB.

### Checkpoint técnico da Fase 8

- Reauditoria: duas passagens independentes read-only cobriram catálogo/media,
  autenticação/sessão/reset, subscrições/família e superfícies administrativas.
  Depois das correções, a revisão final não encontrou P0/P1/P2 residual
  corrigível no scope local.
- Catálogo/playback: serializer público por allowlist e canonicalização
  partilhada de localização/protocolo/MIME/qualidade; aliases inseguros e
  containers legacy malformados não expõem fontes, não ativam CTA falso e não
  causam `500`.
- Auth/sessão: login executa uma derivação em todos os caminhos; recuperação
  persiste dummy TTL sem PII; registo+sessões partilham transação e reconciliam
  commit desconhecido pelo `_id`/token exatos; estados não `active` falham
  fechados.
- Subscrições/família: plano incompleto não recebe defaults nem entra na oferta,
  checkout ou renovação; owner bloqueado perde acesso derivado; os cinco
  comandos familiares constroem o overview sequencialmente dentro da mesma
  sessão transacional.
- Administração: audit helper exige transação; integrações, pool manual,
  passagens/associações bíblicas e comentários privilegiados propagam ator e
  `requestId`, usam a mesma sessão e revertem domínio quando o audit falha. Só
  admins autenticáveis contam para a invariante do último admin.
- Documentação: blocos executáveis MF2-01/MF3-02/MF9-03 foram substituídos, não
  apenas contraditos por adendos. RF, arquitetura e guias de catálogo, playback,
  utilizadores e entitlements refletem o runtime atual. Na retoma final, 19
  reports/evidences docentes deixaram de usar aliases privados inexistentes e
  passaram a apontar a `real_dev`; os dois snapshots MF9 passaram a declarar
  explicitamente que labels 2160p/4K não provam reprodução real.
- Prova então corrente na Fase 8: backend completo 271/271; `npm run validate` com backend unit
  233/233, integração 19/19, frontend 197/197, contratos 5/5 + 14/14 + 21/21,
  segurança 11/11 + scanner, lint/build e media checks verdes; validador então
  em 66/66/94/10/29 e 13/13 negativos. A revisão independente correu 114/114
  focados. Audits npm dos três packages ficaram em zero vulnerabilidades.
- Provas browser já executadas nesta Fase 8 e não afetadas pelas correções
  backend/docs finais: Axe preview-only 14/14 em Chromium e media sintética 9/9
  em Chromium/Firefox/WebKit. Continuam sem valor probatório para streaming,
  4K, carga, CDN ou Safari real.
- Limites: nenhum seed, migração, full E2E funcional, DB configurada, replica set
  real ou Database Tool foi executado. A atomicidade Mongo, concorrência real,
  rerun pós-E2E e restore continuam `BLOQUEADO_AMBIENTE`; rotação da credencial
  privada permanece `BLOQUEADO_PRODUTO`.

`FF-AUD-003`, `FF-AUD-006` e `FF-AUD-013` ficam `VALIDADO` para a baseline
local. `FF-AUD-009` volta a `BLOQUEADO_AMBIENTE`: a causa de código ficou
corrigida e validada por fault injection, mas não existe prova honesta numa
topologia MongoDB transacional. A Fase 8 fica `VALIDADO` como processo de
reauditoria e decisão; o estado global permanece bloqueado para promoção.

## 7. Alteracoes publicas previstas

- Catalogo publico sem fontes media; acrescenta `mediaStatus` e `isPlayable`.
- Respostas administrativas de catalogo incluem `version`; edit/status/revert exigem `expectedVersion` numerico.
- Concorrencia editorial devolve `409 CONTENT_VERSION_CONFLICT`; publish repetido com versao atual e idempotente.
- Playback autenticado devolve exatamente uma `content.source` autorizada (`url`, `protocol`, `mimeType`), `selectedQuality`, `selectedAudioLanguage` e `qualityOptions` sem fontes; sem media devolve `409 MEDIA_NOT_READY`.
- Novo `GET /api/session/csrf-token`.
- Eliminacao de conta exige confirmacao e password.
- Checkout/trial exigem `Idempotency-Key` ASCII seguro de 1-128 caracteres; a mesma chave/hash devolve replay e payload diferente devolve `409 IDEMPOTENCY_KEY_REUSED`.
- Tentativas financeiras novas usam schema v2 e snapshot imutavel (`amountCents`, moeda, percentagem, intervalo, `approvedAt`, ciclo e `accountingEstimate:false`).
- Overview familiar conta o owner em `maxFamilyMembers`; convites `pending` e membros `active` ocupam lugar.
- Distribuicao mensal recusa mes UTC aberto, devolve `replayed` e `financialSnapshot`, e exclui legacy/backfill estimado. Sem associacao elegivel, fecha um ledger imutavel `deferred_no_eligible_charities`, sem distribuicao retroativa automatica.
- Listagens administrativas passam a devolver metadados de paginacao.
- Novos `/health/live` e `/health/ready`; `/health` e alias de readiness.
- Erros seguem `{ code, message, requestId, details? }` sem detalhes internos.

## 8. Ledger de ficheiros alterados

| Data | Fase | Ficheiro | Motivo |
| --- | --- | --- | --- |
| 2026-07-09 | 0 | `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md` | Criacao do report canonico e registo da baseline. |
| 2026-07-09 | 1 | `real_dev/backend/scripts/seed-safety.js` e seeds E2E/demo/editorial | Guards fail-closed, DB `_e2e` explicita, opt-in e conflitos protegidos. |
| 2026-07-09 | 1 | `real_dev/backend/tests/unit/seed-safety.test.js` | Testes locais dos guards e cleanup por marcador. |
| 2026-07-09 | 1 | `real_dev/frontend/package.json`, configs ESLint/Vitest e testes baseline | Vite corrigido, lint e testes comportamentais. |
| 2026-07-09 | 1 | `package.json`, `playwright.config.js`, `tests/e2e/*`, `tests/fixtures/media/*` | Seeds separados do E2E, tres engines, rede fail-closed e fixtures locais. |
| 2026-07-09 | 1 | Guias MF8/MF9 e evidence MF8/MF9 de execucao | Seeds seguros, `real_dev`, servidores formais e snapshots historicos documentados. |
| 2026-07-09 | 2 | `real_dev/backend/src/config/*`, `middlewares/*`, `modules/auth/*` | Sessao de 24 h, HTTPS/headers, erro seguro, CSRF, rate limiting e reset atomico. |
| 2026-07-09 | 2 | `real_dev/backend/src/modules/catalog/*`, `modules/playback/*` | Serializers separados, media pendente fail-closed e uma unica fonte autorizada. |
| 2026-07-09 | 2 | `real_dev/backend/src/modules/privacy/*`, `modules/recommendations/*` | Consentimento e parental fail-closed, eliminacao forte/transacional e remocao de PII. |
| 2026-07-09 | 2 | `real_dev/backend/tests/unit/*`, `tests/integration/*`, `tests/smoke/app.smoke.test.js` | Negativos de media, consentimento, CSRF, reset, rate limit e isolamento total dos testes HTTP. |
| 2026-07-09 | 2 | `real_dev/frontend/src/config/*`, `services/api/*`, `context/*`, auth/layout/privacy e testes | API fail-closed, timeout/abort, CSRF em memoria, estados de sessao, safe-next, logout e eliminacao. |
| 2026-07-09 | 2 | `real_dev/backend/.env` | Apenas modo do ficheiro alterado para `0600`; conteudo nao lido nem reproduzido. |
| 2026-07-09 | 2 | `docs/RF.md`, 15 guias MF1/MF2/MF3/MF4/MF5/MF6/MF9 e 9 evidence | Contratos implementados documentados; snapshots historicos preservados e adendo atual separado. |
| 2026-07-09 | 3 | `real_dev/backend/src/config/database.js`, `server.js` | Retry transiente, rejeicao de nested transactions e guard de topologia em producao. |
| 2026-07-09 | 3 | `real_dev/backend/src/modules/audit/audit.service.js`, notificacoes e testes de DB | Audit sanitizado/session-aware, indices e notificacoes aptas a partilhar transacao. |
| 2026-07-09 | 3 | `real_dev/backend/src/modules/payments/*`, `modules/subscriptions/subscriptions.service.js` | F3-B: checkout/trial com `Idempotency-Key`, request hash, ledger financeiro v2 e multi-writes session-aware dentro de uma transacao. |
| 2026-07-09 | 3 | `real_dev/backend/tests/unit/f3-billing-transaction.test.js`, chamadas legacy de checkout em MF6/MF9 | F3-B: replay, conflito de payload, indices parciais e rollback por fault injection sem MongoDB real. |
| 2026-07-09 | 3 | `real_dev/backend/src/modules/jobs/scheduled-jobs.service.js`, `server.js`, testes | Lease Mongo atomico, recuperacao de worker expirado, retry e conclusao terminal. |
| 2026-07-09 | 3 | `real_dev/backend/src/modules/charities/pool-distribution.service.js` e testes MF4/MF6/MF9 | Pool fechada apenas para meses UTC terminados, calculada de pagamentos v2 aprovados, snapshot financeiro imutavel, rotacao deterministica e replay idempotente. |
| 2026-07-10 | 3 | `real_dev/backend/src/modules/payments/payments.service.js`, `pool-distribution.service.js` e fixtures | Contabilidade fail-closed: novos pagamentos declaram `accountingEstimate:false`; pool exige schema v2 exato e exclui legacy/backfills estimados. |
| 2026-07-09 | 3 | `real_dev/backend/src/modules/subscriptions/subscriptions.validation.js`, `tests/unit/billing-cycles.test.js` | Ciclos mensais/anuais em UTC com clamp ao ultimo dia, incluindo 31 de janeiro e anos bissextos. |
| 2026-07-10 | 3 | `real_dev/backend/src/modules/jobs/renewal-adapter.js`, `billing-jobs.service.js`, `src/worker.js`, `modules/subscriptions/subscriptions.service.js`, `package.json` | Worker separado com adapter simulado deterministico, lease por subscricao/ciclo e mes, renovacao/expiracao transacional, compatibilidade sem renovacao antecipada, retry e fecho mensal anterior. |
| 2026-07-10 | 3 | `real_dev/backend/tests/unit/billing-jobs.test.js`, `billing-cycles.test.js`, `scheduled-jobs.test.js` | Concorrencia entre workers, ledger v2, fault injection, expiração, meses UTC e idempotencia sem DB/rede. |
| 2026-07-09 | 3 | `real_dev/backend/src/modules/catalog/catalog.service.js`, `catalog.controller.js`, `catalog.validation.js` | Revisao e mutacao no mesmo `runInTransaction`, versao/CAS por `expectedVersion`, publish idempotente e audit log na mesma sessao. |
| 2026-07-09 | 3 | `real_dev/backend/tests/unit/catalog-transactions.test.js` | Fault injection prova rollback de revisao/update/audit, conflito estavel, publish repetido e revert sem revisao orfa. |
| 2026-07-09 | 3 | `real_dev/backend/src/modules/charities/charity-applications*`, `charity-review*`, membership em `charity-reports*` e `modules/users/*` | F3-D: candidatura pending unica, review/charity/audit atomicos, membership sem transferencia implicita e user update/audit/revogacao transacionais com protecao do ultimo admin. |
| 2026-07-09 | 3 | `real_dev/backend/tests/unit/f3-admin-transactions.test.js` | F3-D: doubles com rollback e concorrencia para review, membership, audit, sessoes e invariante de admin ativo, sem DB real. |
| 2026-07-10 | 3 | `docs/RF.md`, `docs/RNF.md`, guias `BK-MF2-03`/`BK-MF2-04` | Contrato docente/aluno do catalogo sincronizado para `version`/`expectedVersion`, CAS, `409 CONTENT_VERSION_CONFLICT`, transacao, publish idempotente e media pending; guias mantêm paths publicos. |
| 2026-07-10 | 3 | Auditoria MF2, evidence `AUDITORIA-ADMINISTRATIVA-FINAL.md` e cabula de funcoes | Adendos datados preservam snapshots historicos e separam prova atual local da evidencia antiga. |
| 2026-07-10 | 3 | `real_dev/backend/src/modules/payments/payment-attempts-v2-migration.js`, `scripts/migrate-payment-attempts-v2.js`, `package.json` | F3-B2: migracao retomavel com dry-run por defeito, DB explicitamente nomeada e escrita duplamente protegida por `--apply` e `ALLOW_DATA_MIGRATION=true`; nao executada nesta correcao. |
| 2026-07-10 | 3 | `real_dev/backend/tests/unit/payment-attempts-v2-migration.test.js` | F3-B2: provas in-memory de zero writes em dry-run, apply guard, idempotencia, estimativas marcadas e preservacao de v2/distribuicoes. |
| 2026-07-10 | 3 | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js` | F3-Family: invite/accept/decline/remove/leave transacionais; write-conflict por owner antes da recontagem; limite inclui owner e notificacoes partilham `db/session`. |
| 2026-07-10 | 3 | `real_dev/backend/tests/unit/f3-family-transactions.test.js` | F3-Family: doubles com staging/rollback provam limite concorrente, membership unica, ultimo lugar, indice parcial e fault injection sem DB/rede. |
| 2026-07-10 | 3 | `docs/RF.md`, `docs/RNF.md`, guias MF4-01/02/05 e MF9-01/03/05 | Contratos de idempotencia/transacao, payment v2, worker simulado, pool UTC, ciclos EOM e familia concorrente sincronizados; paths dos alunos mantidos em `backend/frontend`. |
| 2026-07-10 | 3 | `docs/planificacao/guias-bk/MF9/ARRANQUE-LOCAL-MF9.md`, backlog e matriz canonica | Runbook documenta worker/migracao fail-closed; tracking separa estado dos alunos da referencia e atualiza criterios mensuraveis sem promover BKs. |
| 2026-07-10 | 3 | Cabulas tecnica e de funcoes fundamentais | Narrativa ativa sincronizada para idempotencia/worker/pool/familia; inventario AST historico preservado com adendo de assinaturas/modulos posteriores. |
| 2026-07-10 | 3 | Implementacao/auditoria MF4/MF9 e evidence MF9 | Adendos datados preservam snapshots antigos e registam limites: sem gateway, migracao aplicada, worker/replica set real ou nova prova E2E. |
| 2026-07-10 | 3 | Guias MF4-03/04/06, MF5-04, MF8-03/05/08, MF9-06 e runbook MF9 | F3-D documentada com candidatura pending unica, review/membership/user admin transacionais, revogacao de sessoes, audit/requestId e ultimo admin; paths publicos mantidos em `backend/frontend`. |
| 2026-07-10 | 3 | Evidence MF8/MF9 e relatorios de implementacao/auditoria/correcao MF4/MF5/MF8/MF9 | Adendos datados separam prova F3-D atual dos snapshots historicos, registam `14/14` local e preservam a limitacao de replica set/browser nao provados. |
| 2026-07-10 | 3 | `real_dev/backend/src/modules/charities/pool-distribution.service.js`, `modules/jobs/billing-jobs.service.js` e testes MF4/jobs | Fecho contabilistico sem retry infinito quando nao existem associacoes elegiveis; catch-up atravessa lotes historicos ja fechados e limita trabalho pendente a 120 meses por passagem. |
| 2026-07-10 | 3 | `real_dev/backend/src/modules/charities/charity-reports.service.js`, `modules/privacy/privacy.service.js`, `modules/audit/audit.service.js`, user/review e testes | Contencao entre membership e eliminacao/bloqueio, limpeza/export RGPD da membership e audit minimizado sem email/telefone ou snapshots pessoais integrais. |
| 2026-07-10 | 3 | `real_dev/backend/tests/unit/mf5-validation.test.js`, `f3-billing-transaction.test.js`, `f3-admin-transactions.test.js` | Corrige fixture do ultimo admin e acrescenta negativos para conta indisponivel, membership administrativa e retencao minima no audit. |
| 2026-07-10 | 3 | `real_dev/backend/src/modules/payments/payments.service.js`, `tests/unit/f3-billing-transaction.test.js` | Indice parcial composto cobre consultas mensais v2 por estado, estimativa, `approvedAt` e desempate por `_id`. |
| 2026-07-10 | 4 | `real_dev/frontend/src/components/privacy/PrivacyDangerZone.jsx`, `privacyApi.js` e teste | Eliminação envia frase e password atual, mantendo limpeza da sessão e redirect seguro. |
| 2026-07-10 | 4 | `real_dev/frontend/src/components/layout/AppHeader.jsx` e teste | Logout regressa a `/`; notificações e quatro áreas administrativas passam a estar alcançáveis pela navegação autorizada. |
| 2026-07-10 | 4 | `real_dev/frontend/src/services/api/apiClient.js` e teste | Respostas de erro não JSON deixam de expor texto bruto do servidor na mensagem da UI. |
| 2026-07-10 | 4 | `real_dev/frontend/src/pages/SearchPage.jsx`, `SearchFilters.jsx`, `searchApi.js` e teste | Pesquisa passa a ser URL-driven, paginada, cancelável e protegida contra respostas antigas; query/filtros/página sobrevivem a refresh e navegação. |
| 2026-07-10 | 4 | `real_dev/frontend/src/pages/NotificationsPage.jsx`, `notificationsApi.js` e teste | Preferências completas com rollback/estado autoritativo, leituras canceláveis e busy state por operação; marcação atualiza apenas a linha confirmada. |
| 2026-07-10 | 4 | `real_dev/frontend/src/components/errors/ErrorBoundary.jsx`, `routes/AppRoutes.jsx`, `RouteLifecycle.jsx`, `routeMetadata.js` e testes | Boundary seguro, retry, páginas lazy/Suspense, títulos fechados e scroll/foco apenas em mudança de pathname. |
| 2026-07-10 | 4 | `real_dev/frontend/src/pages/AdminCatalogPage.jsx`, `catalogApi.js` e teste | Admin cria/edita apenas metadata/assets/taxonomias, mostra media pendente, envia CAS em edit/status/revert e pagina a listagem; removida media piloto implícita. |
| 2026-07-10 | 4 | `real_dev/frontend/src/pages/ContentDetailPage.jsx` e teste | Conteúdo pendente continua visível, mas apresenta “Vídeo ainda não disponível” e nunca cria CTA de reprodução. |
| 2026-07-10 | 4 | `real_dev/frontend/src/components/playback/mediaAdapter.js`, `progressQueue.js` e testes | Adapters lazy progressive/HLS nativo/hls.js/DASH com destroy/cancelamento; fila de progresso serial, coalescida e confirmada apenas após sucesso. |
| 2026-07-10 | 4 | `real_dev/frontend/src/pages/PlaybackPage.jsx`, `PlaybackPage.test.jsx`, `playbackApi.js`, `components/playback/progressQueue.js` e teste | Player consome apenas a fonte canónica, destrói adapters, cancela leituras, refaz seleção no backend, apresenta `MEDIA_NOT_READY`/erro com retry e faz flush serial em pause/hidden/pagehide/unmount; posição inicial confirmada não gera escrita artificial. |
| 2026-07-10 | 4 | `real_dev/backend/src/modules/catalog/*`, `modules/search/search.service.js` e testes F4 | Create força media vazia/pending; update/revert preservam media; mutação media é recusada; admin/revisions ficam paginados e estáveis; pesquisa ignora taxonomias legacy inválidas e usa desempate `_id`. |
| 2026-07-10 | 4 | `real_dev/backend/src/modules/playback/*`, `modules/subscriptions/subscriptions.service.js`, testes playback/MF9 | Fonte canónica única progressive/HLS/DASH; MIME/legacy fail-closed; opções/faixas sem aliases; published/subscrição/parental/media aplicados a GET, progresso e continue-watching; `private, no-store` também em erros. |
| 2026-07-10 | 4 | `scripts/generate-synthetic-media.mjs`, `check-media-fixtures.mjs`, `tests/fixtures/media/*`, `tests/e2e/network-policy.js`, `media-fixtures.spec.js`, `playwright.media.config.js`, `package.json` | Substitui o falso piloto audio-only por vídeo canvas fMP4 sem conteúdo real; gera MP4/init/segment com checksums, HLS/DASH válidos, Range, rede fail-closed e matriz browser sem backend/DB. |
| 2026-07-10 | 4 | `real_dev/frontend/src/components/playback/mediaAdapter.js` e teste | DASH resolve fontes relativas contra `document.baseURI`, evitando erro CMCD/URL e mantendo destroy/error propagation. |
| 2026-07-10 | 4 | `docs/RF.md`, `docs/RNF.md`, matriz canónica, guias MF2-01/05/06 e MF9-02 | Sessão, safe-next/logout, source única, options/tracks redigidas, refetch de preferências e limites RNF08/RNF10/RNF23 sincronizados; paths dos alunos e estados preservados. |
| 2026-07-10 | 4 | Guias MF2-03/04 e evidence MF8 administrativa/visual | Catálogo admin metadata-only, media read-only, erro de mutação, envelopes paginados/CAS e pesquisa URL/cancelável documentados; snapshots preservados por adendo. |
| 2026-07-10 | 4 | Guias MF2-08/MF9-06, runbook MF9 e evidence MF8/MF9 de testes/gate | Media preview-only 9/9, geração canvas fMP4, checksums, loopback e limites probatórios separados do full E2E/DB e dos gates históricos. |
| 2026-07-10 | 3 | RF/RNF, matriz, guias MF4/MF5/MF9, runbook, cabulas e adendos históricos | Documentação sincronizada para pool deferida, catch-up, membership/RGPD e audit mínimo; snapshots preservados e paths dos alunos públicos. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/AccountPage.jsx`, `userApi.js` e teste | Limite parental vazio deixa de ser convertido em zero; formulário valida inteiro 0-18, usa busy state e leitura cancelável. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/AdminPoolDistributionPage.jsx` e teste | Mês financeiro inicial passa a usar ano/mês civil local, sem conversão UTC por `toISOString`. |
| 2026-07-10 | 5 | `real_dev/frontend/src/components/library/LibraryActions.jsx`, `libraryApi.js` e teste | Favoritos/lista para ver mais tarde ficam paginados, canceláveis, protegidos contra stale responses e duplo clique, com optimistic UI reversível e erros seguros. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/AdminUsersPage.jsx`, `userApi.js` e teste | Gestão de contas passa a paginação estável, filtros limitados, cancelamento, confirmação explícita e busy state por linha; papéis/estados ficam em PT-PT. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/MyLibraryPage.jsx` e teste | Favoritos, lista para ver mais tarde e histórico tornam-se secções paginadas/canceláveis independentes, com loading/error/empty/retry uniformes. |
| 2026-07-10 | 5 | `real_dev/frontend/src/components/ratings/*`, `components/comments/*`, `ratingsApi.js`, `commentsApi.js` e testes | Ratings/comentários usam epochs e AbortController, recusam stale responses/duplicados, serializam mutações e mantêm busy state localizado com reload autoritativo. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/AdminPoolDistributionPage.jsx`, `AdminUsersPage.jsx` e testes | Fecho financeiro e alterações de papel/estado exigem confirmação explícita; cancelamento administrativo repõe o valor controlado sem mutação. |
| 2026-07-10 | 5 | `real_dev/frontend/src/components/playback/ContinueWatchingStrip.jsx`, `playbackApi.js` e teste | Continuar a ver fica limitado/paginado, cancelável, com retry/erro seguro, progresso limitado e imagens/links acessíveis. |
| 2026-07-10 | 5 | `real_dev/frontend/src/styles/*`, `components/layout/AppHeader*`, `components/a11y/SkipLink.test.jsx`, `components/ui/ContentCard*`, `components/discovery/DiscoveryCarousel*` | Tokens AA, foco, reduced motion, targets 44 px, header móvel fechado de 68 px, menu com Escape/restituição de foco, zoom/reflow e imagens lazy protegidos por testes. |
| 2026-07-10 | 5 | `real_dev/frontend/src/assets/faithflix-logo.png`, `components/layout/AppHeader.jsx` | PNG RGBA redimensionado de 689x782/300557 bytes para 141x160/19919 bytes, adequado ao máximo visual 39x44 CSS e DPR elevado; dimensões intrínsecas corrigidas. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/AdminMetricsPage.jsx`, `AdminPoolDashboardPage.jsx`, `metricsApi.js`, `charitiesApi.js` e testes | Leituras administrativas ficam canceláveis/repetíveis, intervalo temporal é validado, estados financeiros são traduzidos e loading/error/empty seguem o mesmo contrato. |
| 2026-07-10 | 5 | `real_dev/frontend/package.json`, `package-lock.json` | `@axe-core/playwright` adicionado apenas como devDependency do pacote privado para auditoria DOM/ARIA local; não entra no bundle runtime. Alternativa nativa do Playwright não oferece regra WCAG equivalente. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/AdminBiblicalPassagesPage*`, `AdminCharityApplicationsPage*`, `AdminCharityMembersPage*`, `AdminIntegrationsPage*`, APIs administrativas e `adminActionApis.test.js` | Ações críticas exigem confirmação, usam busy state localizado, cancelamento/anti-stale e erros seguros; remoção de associação bíblica tardia deixa de contaminar outro conteúdo selecionado. |
| 2026-07-10 | 5 | `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel*`, `PrivacyExportPanel*`, `components/discovery/RelatedContent*`, `pages/DiscoveryHomePage*`, APIs e `privacyDiscoveryApis.test.js` | Leituras/escritas canceláveis, retry, rollback ao consentimento confirmado, erros seguros, imagens lazy e home fail-closed para media/sessão indisponível. |
| 2026-07-10 | 5 | `package.json`, `playwright.a11y.config.js`, `real_dev/frontend/tests/a11y/accessibility.spec.js` | `test:a11y` passa a preview-only sem backend/DB; 13 cenários Axe/reflow com API local intercetada, rede fail-closed, quatro viewports, rotas públicas/autenticadas e teclado móvel. |
| 2026-07-10 | 5 | `real_dev/frontend/src/styles/global.css` | Corrige contraste real do kicker no hero: texto escuro deixa de herdar `--color-text-inverse-soft` sobre fundo accent claro. |
| 2026-07-10 | 5 | `real_dev/frontend/vitest.config.js` | Separa explicitamente `tests/a11y/**` do discovery Vitest para o spec Playwright nunca ser executado pelo runner unitário. |
| 2026-07-10 | 5 | `real_dev/backend/src/utils/pagination.js`, validações/services/controllers de auth, privacy, users, catalog, search, biblical passages, charities, comments, library, notifications e playback | Baseline inicial de paginação comum, limites, metadata e desempate `_id`; revisão independente posterior reabriu `FF-AUD-017` por arrays e coerções numéricas ainda aceites em validadores de catálogo/search/ratings/playback. |
| 2026-07-10 | 5 | `real_dev/backend/tests/unit/f5-validation-pagination.test.js`, `playback-contract.test.js` | Negativos de limites/enums/booleanos/preferências e provas de paginação/ordem/metadata, incluindo listas pessoais e continue-watching. |
| 2026-07-10 | 5 | `real_dev/backend/src/utils/pagination.js` | Mensagem de limite excessivo preserva o contrato legacy “Limite invalido” e acrescenta o máximo efetivo, sem alterar o status 400 nem a validação estrita. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/SubscriptionPage.jsx`, `paymentsApi.js`, `subscriptionsApi.js` e testes | Checkout/trial enviam e reutilizam `Idempotency-Key` após falha ambígua; loads/mutações são canceláveis, ações destrutivas confirmadas, estado familiar traduzido e reload autoritativo. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/ForYouPage.jsx`, `PublicCharitiesPage.jsx`, `CharityHistoryPage.jsx`, `AccountPage.jsx`, APIs e testes | Leituras secundárias deixam de sobreviver ao unmount, ignoram abort como erro e oferecem retry explícito com mensagens seguras. |
| 2026-07-10 | 5 | `docs/RF.md`, `docs/RNF.md`, matriz canónica e guias MF2-05/MF2-07/MF3-01..04 | Contratos de paginação, ordem estável, pesquisa URL-driven, cancelamento, anti-stale, busy state, rollback e reload autoritativo sincronizados; comentários mantidos honestamente limitados a 50 e estado dos alunos não promovido. |
| 2026-07-10 | 5 | Evidence administrativa, auditorias MF4/MF5 e 16 guias MF4/MF5/MF9 | Idempotency key reutilizável, abort/anti-stale, confirmação/busy administrativo, rollback de consentimentos, paginação estável, mês local e PT-PT documentados; paths dos alunos preservados e todos os guias continuam `TODO`. |
| 2026-07-10 | 5 | `real_dev/frontend` catálogo/pesquisa/detalhe/subscrição/conta/associações, APIs e 7 testes | Cancelamento/retry e dados keyed por rota, estado de sessão indisponível preservado, IDs/slugs codificados, mutações de conta serializadas/canceláveis e fallbacks PT-PT sem coerção de vazio. |
| 2026-07-10 | 5 | `real_dev/frontend/src/pages/AdminCatalogPage.jsx`, `AdminCatalogPage.test.jsx`, `services/api/catalogApi.js` | Catálogo administrativo passa a cancelar e invalidar leituras tardias de páginas/revisões, limpar requests no unmount/mudança de seleção, serializar CAS por conteúdo, localizar busy state por linha/ação e traduzir estados/ações para PT-PT; contratos media pending/CAS permanecem intactos. |
| 2026-07-10 | 5 | 19 `real_dev/backend/src/modules/*/*validation.js` e testes `f5-strict-input-types`/MF3/MF10 | Bodies JSON passam a exigir tipos reais, query/path apenas scalars, arrays deixam de ser convertidos, números em bodies deixam de aceitar strings e excesso de texto devolve 400 em vez de truncagem silenciosa. |
| 2026-07-10 | 5 | Continue-watching, discovery carousel/home, biblioteca e catálogo público, com testes | Todos os IDs/slugs dinâmicos remanescentes são codificados antes de entrarem em rotas; a imagem editorial de formatos abaixo do destaque passa a `loading="lazy"` e `decoding="async"`. |
| 2026-07-10 | 5 | `docs/RF.md`, `docs/RNF.md`, 17 guias MF2/MF3/MF4/MF5/MF7 e duas evidence MF7 | Adendos vinculativos sincronizam cancelamento/retry/anti-stale, sessão indisponível, encoding, mutações de conta, PT-PT e inputs estritos; snapshots e estados prévios dos alunos permanecem intactos. |
| 2026-07-10 | 5 | `AdminCatalogPage.jsx`/teste, `global.css` e spec Axe | Editor editorial fica serializado por identidade/epoch, fieldset e seleção protegidos durante submit, reload usa página atual e conflitos de outras linhas preservam alterações; input backdrop duplicado removido e `/admin/catalogo` entra na auditoria Axe. |
| 2026-07-10 | 6 | `ARCHITECTURE.md` | Arquitetura consolidada da referência: processos, domínios, transações, segurança, media sintética, operação local, estratégia de prova e limites explícitos de produção. |
| 2026-07-10 | 6 | `real_dev/backend` env, runtime shutdown, `server.js`, `worker.js` e 3 testes | Produção fail-closed, shutdown HTTP/Mongo idempotente e limitado, signal wiring explícito, worker importável sem arrancar e provas com doubles. |
| 2026-07-10 | 6 | `docs/runbooks/ARRANQUE-E-SHUTDOWN-LOCAL.md`, `WORKER-LOCAL.md`, `BACKUP-RESTORE-LOCAL.md`, `ROLLBACK-MANUAL-LOCAL.md` | Procedimentos locais seguros, variáveis por nome, shutdown, jobs, guardas de tools/DB temporária e rollback sem alegar infraestrutura remota. |
| 2026-07-10 | 6 | `real_dev/backend/scripts/database-tools-safety.js`, CLIs backup/restore, `package.json` e teste | URI/DB dedicadas, opt-ins, config 0600, spawn sem shell/output, archive/checksum/inventário e restore apenas para target temporário com ownership marker/cleanup. |
| 2026-07-10 | 6 | `real_dev/backend/src/server.js`, `docs/runbooks/ARRANQUE-E-SHUTDOWN-LOCAL.md` | Remove alegação residual de seeds no entry point e torna a criação local de `.env` não destrutiva com `cp -n`, proibindo sobrescrever ou reproduzir valores existentes. |
| 2026-07-10 | 6 | `real_dev/backend/README.md`, `README.md`, `docs/RNF.md`, runbook MF9 e evidence MF6/MF8 | Sincroniza live/ready/alias, deadline/no-store/503 seguro, shutdown, env fail-closed, backup/restore protegido e bloqueio real das Database Tools, preservando snapshots, estados e paths públicos. |
| 2026-07-10 | 6 | `real_dev/backend/src/config/env.js`, database-tools/testes e runbook backup/restore | Fecha dois findings da revisão independente: `NODE_ENV` passa a allowlist estrita e subprocessos MongoDB recebem apenas environment allowlisted, sem URI ou restantes secrets do processo pai. |
| 2026-07-10 | 6 | `real_dev/backend/src/app.js`, `modules/system/health*` e testes unit/integration/smoke | Separa liveness/readiness/alias antes de sessão/CSRF, aplica deadline total 500 ms, no-store e 503 sanitizado; cobre DB saudável, falhada e bloqueada com doubles. |
| 2026-07-10 | 7 | Root package/Playwright, `scripts/e2e-environment.mjs`, `tests/contracts/e2e-harness.contract.test.js`, `tests/e2e/formal-config.js`, manifest/spec F7 e package scripts privados | Harness formal fail-closed: DB loopback replica set `_e2e`, zero fallback normal, servidores novos, três engines, suite funcional Chromium e sweep crítico sem mutações de domínio Firefox/WebKit; scripts formais e cobertura sem alegar execução. |
| 2026-07-10 | 7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Validador cruza backlog/headers/estado, sprints/próximo/MF views, contrato/anexos/matriz exatos, lane pedagógica, todos os docs públicos MF, placeholders e wrapper oficial; treze mutações usam apenas cópias temporárias. |
| 2026-07-10 | 7 | Evidence MF1/MF3/MF6/MF7/MF8/MF9 e relatórios `real_dev` | Normaliza comandos docentes para `real_dev`, adiciona validade temporal, separa snapshots de prova atual e remove alegações ativas falsas de RF63/reprodução/4K/HLS/DASH/carga. |
| 2026-07-10 | 7 | Backlog, matriz, anexos RF/RNF/BK, contrato, MF views e headers/runbook dos guias | Alinha estados já oficiais MF1, sprints, dependências, próximo BK, owners/cobertura e ordem; sessão/MF4/E2E usam contratos atuais sem promover novo estado dos alunos nem expor path privado nos guias. |
| 2026-07-10 | 7 | `docs/evidence/MF9/MATRIZ-BROWSERS-MANUAL.md`, `docs/evidence/archive/**` | Regista Chrome/Edge/Safari real como não executados e arquiva templates MF6 duplicados com placeholders sem apagar a história nem permitir que contem como evidence ativa. |
| 2026-07-10 | 7 | `real_dev/backend/scripts/check-security-baseline.mjs` | Scanner runtime deixa de analisar `*.test|*.spec`/pastas de teste colocadas em `src`, evitando classificar fixtures sintéticas deliberadas como secrets/URIs executáveis. |
| 2026-07-10 | 7 | `scripts/e2e-environment.mjs`, specs/fixtures E2E e contrato root | Fecha proxy/params/credenciais Mongo, policy de rede em contextos adicionais, `PUBLISH_EVIDENCE`, bind loopback e regressões estáticas do harness sem executar browser/DB. |
| 2026-07-10 | 7 | `real_dev/backend/scripts/seed-safety.js`, seeds MF2/MF4/MF9 e testes | Guard de seed reutiliza isolamento formal; cleanup pré-valida todo o plano e apaga apenas pelo marcador. Deletes diretos por IDs/emails/mês/regex foram removidos. |
| 2026-07-10 | 7 | `real_dev/backend/src/config/env.js`, `server.js`, `.env.example`, arquitetura/runbooks e testes | Bind local passa a loopback por defeito, `HOST` fica fechado e obrigatório em produção, e o runbook documenta o bloqueio honesto de rerun pós-E2E. |
| 2026-07-10 | 7 | `real_dev/frontend/src/context/SessionContext.test.jsx` | Elimina flake: transições assíncronas esperam o estado final, não apenas a existência imediata do nó ainda em loading. |
| 2026-07-10 | 8 | serializer público de catálogo e teste media-boundary | Reauditoria encontrou aliases `url`/`source.url` reproduzíveis em tracks/opções. O DTO público passou a allowlist estrita de metadata/assets/disponibilidade; aliases internos continuam apenas no admin/playback. Validado depois nos contratos e na suite final. |
| 2026-07-10 | 8 | rota de recuperação e integração de segurança | Reauditoria encontrou apenas 3/email no forgot-password. Foi acrescentado 10/IP/h antes do limite por email, com negativo HTTP para a 4.ª tentativa do mesmo email e 11.ª do mesmo IP. Validado depois em segurança HTTP e na suite final. |
| 2026-07-10 | 8 | `real_dev/backend/tests/regression/mf6-backend-regression.test.js` | Sincroniza a regressão do catálogo público com a allowlist: exige ausência integral de `media`, `tracks` e `qualityOptions`, prova que as três fontes privadas não aparecem no JSON e mantém a preservação das fontes na vista administrativa. |
| 2026-07-10 | 8 | `docs/RF.md`, guia `BK-MF2-01` | Documentação ativa distingue catálogo público sem qualquer campo/alias de media da resposta autenticada de playback; fixa recuperação em 10/IP e 3/email por hora e login em 20/IP e 5 falhas/email por 15 minutos, com uma verificação `scrypt` por tentativa aceite pelos limites. |
| 2026-07-10 | 8 | `real_dev/backend/src/modules/integrations/integrations.service.js`, `tests/unit/f3-admin-transactions.test.js` | Fecha a causa de código FF009: configuração e audit usam `runInTransaction`/mesma sessão; fault injection prova rollback da configuração quando o audit falha. |
| 2026-07-10 | 8 | `docs/RNF.md`, guia `BK-MF5-06` | Contrato docente de integrações sincronizado para commit/rollback atómico de `integration_settings` e `integration.update`, com helper canónico e fault injection obrigatório. |
| 2026-07-10 | 8 | `real_dev/backend/src/modules/auth/auth.service.js`, `tests/unit/auth-login-timing.test.js`, guia `BK-MF2-01` | Login executa exatamente um verifier `scrypt` para conta ativa, inexistente, inativa, bloqueada ou com hash inválido; hash/password dummy limitados nunca autenticam e o guia reproduz os mesmos gates. |
| 2026-07-10 | 8 | auth reset service, `tests/unit/mf2-validation.test.js`, guia `BK-MF2-01` | Recuperação existente/inexistente executa a mesma escrita TTL; dummy não guarda `userId`/email/PII, não entra na outbox e o consumo recusa `dummy:true`, reduzindo enumeração temporal residual. |
| 2026-07-10 | 8 | `real_dev/backend/src/modules/auth/auth.service.js`, `session.service.js`, `tests/unit/auth-registration-transaction.test.js`, `docs/RF.md`, guia `BK-MF2-01` | Registo e sessão inicial partilham `runInTransaction`/session; fault injection na sessão reverte o utilizador. `scrypt` é calculado antes da callback para não prolongar locks nem repetir CPU em retry transiente; a documentação ensina o mesmo contrato. |
| 2026-07-10 | 8 | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js`, `tests/unit/f3-family-transactions.test.js`, `docs/RF.md`, guia `BK-MF9-03` | Overview autoritativo de invite/accept/decline/remove/leave é construído sequencialmente dentro da mesma transação; falha tardia de leitura reverte membership, notificação e lock, evitando sucesso HTTP ambíguo. |
| 2026-07-10 | 8 | `real_dev/backend/src/config/database.js`, `modules/audit/audit.service.js`, teste audit | `writeAdminAudit` falha fechado fora de `runInTransaction`; o contexto AsyncLocalStorage mantém a regra também em doubles sem `ClientSession`. |
| 2026-07-10 | 8 | pool distribution service/controller, billing jobs e testes | Fecho manual valida ator/trigger, propaga `requestId`, audita snapshot mínimo na mesma sessão e reverte por fault; worker usa trigger explícito sem ator/audit e replay não duplica evento. |
| 2026-07-10 | 8 | `docs/RNF.md`, guias `BK-MF4-05`/`BK-MF8-05` | Documentação sincronizada para audit fail-closed, pool manual atómica e distinção admin/worker sem identidade fictícia. |
| 2026-07-10 | 8 | biblical passages service/controller e `tests/unit/f8-biblical-passages-transactions.test.js` | Create/update/status/link/unlink usam transação, mesma sessão, ator e `requestId`; fault audit reverte cada mutação, no-op não duplica e snapshots omitem texto/reflexão/nota. Leituras do link são sequenciais por restrição do driver e updates registam `updatedBy`. |
| 2026-07-10 | 8 | `docs/RF.md`, `ARCHITECTURE.md` | Contrato de passagens/associações administrativas e lista de invariantes auditáveis sincronizados com a implementação F8. |
| 2026-07-10 | 8 | auth/session/subscriptions/billing lock e testes F3/F4/F5/MF9 | Conta/sessão, status/plano/entitlements e owner familiar passam a allowlists fail-closed; billing aceita apenas `active` ou legacy sem campo. Registo reconcilia commit desconhecido pelo `_id` e token exatos da tentativa. |
| 2026-07-10 | 8 | integrations service/controller e regressão MF8 | `requestId` passa do pedido HTTP para `integration.update`, fechando a correlação que faltava na primeira correção transacional. |
| 2026-07-10 | 8 | `docs/RF.md`, guias `BK-MF2-01`, `BK-MF4-02`, `BK-MF5-06`, `BK-MF9-01`/`03` | Documentação ativa sincronizada para sessão/entitlements/billing fail-closed, reconciliação de commit, owner bloqueado sem acesso e correlação de integração. |
| 2026-07-10 | 8 | `tests/regression/mf8-admin-final-audit.test.js` | Matriz RBAC expandida para 18 mutações e 10 leituras privilegiadas; user comum usa CSRF válido, erros/correlação são verificados e negativos deixam zero mutações. Não é apresentada como prova funcional das operações. |
| 2026-07-10 | 8 | comments service/controller e `tests/unit/comments-transactions.test.js` | Moderação e remoção privilegiada usam transação, mesma sessão, ator e `requestId`; falha do audit reverte domínio, snapshots omitem corpo/motivo/PII e remoção normal pelo autor mantém ownership sem evento admin. |
| 2026-07-10 | 8 | `docs/RF.md`, `ARCHITECTURE.md`, guia `BK-MF3-02` | Documentação ativa sincronizada para a fronteira administrativa de comentários, distinguindo remoção do autor de moderação/delete privilegiados, rollback e audit mínimo. |
| 2026-07-10 | 8 | testes playback HTTP/unit e `security-http.test.js` | Fixtures alinhadas ao contrato fail-closed: plano Pro explicitamente ativo e double de reset com escrita TTL dummy sem PII; o runtime seguro não foi relaxado. |
| 2026-07-10 | 8 | `catalog-media.js`, playback service e testes media/playback | Catálogo e playback partilham localização/protocolo/MIME canónicos; esquemas ativos, URLs ambíguas, pares incoerentes e containers malformados deixam de produzir CTA falso ou erro 500. |
| 2026-07-10 | 8 | invariante admin e testes F3/MF5 | Apenas admin autenticável (`active` ou legacy sem estado) conta no roster; admins inativos/desconhecidos não permitem remover o último admin operacional. |
| 2026-07-10 | 8 | subscriptions/payments/billing jobs e testes MF9/jobs | `maxQuality`, `familySharing` e `maxFamilyMembers` deixam de receber defaults permissivos; campos ausentes/coercivos tornam o plano inelegível, removem-no da oferta pública e bloqueiam checkout/renovação antes de qualquer ledger. |
| 2026-07-10 | 8 | RF, arquitetura e guias MF2-03/04/05, MF5-04, MF9-01 | Contratos ativos sincronizados para fonte canónica partilhada, containers media malformados seguros, roster de admin autenticável e planos sem defaults/checkout/renovação indevidos. |
| 2026-07-10 | 8 | guias `BK-MF2-01`, `BK-MF3-02`, `BK-MF9-03` | Blocos executáveis legacy substituídos: auth/reset/registo transacionais, comentários privilegiados auditáveis e cinco comandos familiares com overview sequencial na mesma sessão; zero `Promise.all`/session indefinida nos percursos canónicos. |
| 2026-07-10 | 8 | regressão MF6 de subscrição | Fixture mensal passa a declarar tier/qualidade/partilha/limite completos, sem enfraquecer a rejeição de planos malformados. |
| 2026-07-10 | 8 | 3 evidence MF6 e 16 reports de hidratação/auditoria/implementação | Normalização mecânica dos aliases inexistentes `referencia_privada_docente` e `pasta_privada_do_professor` para o root privado real `real_dev`; resultados e datas históricas foram preservados. |
| 2026-07-10 | 8 | `IMPLEMENTACAO-REAL_DEV-MF9.md`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF9.md` | Caveat vinculativa: 2160p/4K nos snapshots prova apenas entitlement/label/remoção de URL; `RNF08`/`RNF10` continuam `NAO_PROVADO` e `RNF23` `PARCIAL_VALIDADO`. |
| 2026-07-10 | 9/D4 | guias `BK-MF3-03`, `BK-MF3-05`, `BK-MF4-03` | Limites distribuídos tornados mensuráveis: pesquisa 120/IP/min, recomendações 60/utilizador/min e candidaturas 5/IP/h, com primeiro pedido recusado, `429`, `Retry-After`, HMAC e negativos explícitos. |
| 2026-07-10 | 9/D4 | guia `BK-MF6-03` | Matriz completa dos dez scopes de rate limit, schema/indexes HMAC+TTL e contrato fail-closed de backup/restore consolidados no guia de hardening. |
| 2026-07-10 | 9/D4 | guia `BK-MF1-04` | Schema de sessão/CSRF documentado com token bruto nunca persistido, histórico limitado a quatro hashes, comparação segura e TTL absoluto de 24 horas alinhado com o cookie. |
| 2026-07-10 | 9/D4 | guia `BK-MF4-01` e `docs/runbooks/WORKER-LOCAL.md` | Schema/indexes/transições de `scheduled_jobs`, invariantes de lease/owner e procedimento de inspeção estritamente read-only documentados. |
| 2026-07-10 | 9/D4 | guia `BK-MF9-01` | Implementação duplicada e não transacional de checkout removida; MF9 reutiliza exclusivamente o service idempotente/transacional autoritativo de `BK-MF4-02`. |
| 2026-07-10 | 9/D4 | guia `BK-MF4-02` | Snippets históricos substituídos por checkout/trial executáveis com `Idempotency-Key`, `requestHash`, ledger v2, snapshot financeiro, transação única, `{ session }`, notificação, audit e replay concorrente. |
| 2026-07-10 | 9/D4 | guia `BK-MF1-02` | Router eager substituído por contrato executável com `lazy`/`Suspense`, ErrorBoundary PT-PT, títulos fechados e foco/scroll apenas na mudança de pathname. |
| 2026-07-10 | 9/D2 | `docs/RF.md`, `docs/RNF.md`, `ARCHITECTURE.md`, `MATRIZ-CANONICA-BK.md` | Contratos canónicos consolidados: limites e inputs, lifecycle/stack, schemas operacionais e 94/94 critérios/evidence específicos sem alterar owner/BK/prioridade/estado dos alunos. |
| 2026-07-10 | 9/D4 | guias `BK-MF4-01` e `BK-MF4-08` | Últimas duplicações financeiras removidas: ativação aceita `{ db, session, plan, now }`; notificações reutilizam MF4-02 e recebem a mesma sessão, sem redefinir checkout/trial/ativação. |
| 2026-07-10 | 9/D0-D1-D5 | políticas, runbook público, evidence, snapshots, MF views, README e template | Metadata/lane/current-snapshot publicada; E2E usa apenas `TEST_MONGODB_*`+replica set; runbook MF9 separado da referência; baseline 66/66/94/13 e caveats locais sincronizados. |
| 2026-07-10 | 9/D5 | `MF-VIEWS.md` | As dez secções `Pronto da macro` foram renomeadas para `Critérios de conclusão da macro — alunos`, eliminando a leitura ambígua como estado executado da referência. |
| 2026-07-10 | 9/D5 | `docs/evidence/MF9/MATRIZ-BROWSERS-MANUAL.md` | Metadata corrente/lane/autoridade/proof scope acrescentada sem alterar os estados manuais `NAO_EXECUTADO`. |
| 2026-07-10 | 9/D5 | 21 evidence MF1/MF6/MF7/MF8 | Metadata obrigatória aplicada a todos os Markdown ativos que ainda dependiam apenas de avisos narrativos; snapshots e adendos atuais mantêm datas, lane, autoridade e proof scope explícitos. |
| 2026-07-10 | 9/D5 | reports de hidratação/auditoria/correção/implementação/validação e report canónico | Metadata obrigatória aplicada a todo o conjunto ativo de reports técnicos; cada documento declara current/snapshot, data, lane, autoridade e proof scope sem reescrever resultados históricos. |
| 2026-07-10 | 9/D3 | oito guias críticos MF1/MF2/MF5/MF7/MF9 | Blocos ativos de cliente API/CSRF, health/CORS/shutdown, autenticação/rate limits, catálogo/media metadata-only, eliminação RGPD transacional e estados de sessão foram substituídos por contratos autocontidos e copiáveis; a migração estrutural tutorial v2 permanece em curso. |
| 2026-07-10 | 9/D3-D5 | os mesmos oito guias críticos | Migração tutorial v2 concluída: 16 headings `####`, sete pontos em cada passo, markers autónomos e zero contrato concorrente. O catálogo público ficou com uma única implementação paginada/cancelável/retry; RGPD familiar reutiliza transação/session e ledger v2. |
| 2026-07-10 | 9/D5 | `guias-bk/README.md`, `_TEMPLATE-BK.md` e 58 guias não críticos | Contrato tutorial v2 normalizado: 16 headings PT-PT em nível `####`, passos com sete pontos, marker autónomo exato e 28 guias legacy migrados sem alterar o estado dos alunos; os oito guias críticos permanecem sob a mesma subfase ativa até integração. |
| 2026-07-10 | 9/D5 | guias `BK-MF0-01`, `BK-MF0-06` e `BK-MF1-02` | Referências concorrentes React/Next.js foram separadas: a baseline tutorial usa React + Vite + `fetch`/`AbortController`; Next.js/Axios permanece apenas opção futura do RNF. |
| 2026-07-10 | 9/D5 | evidence `MF8/SCOPE-FREEZE.md` e `MF8/MATRIZ-FINAL.md` | Linguagem “final/atual” foi delimitada como observação histórica; o único bloco posterior foi identificado como `Procedimento atual`, preservando resultados do snapshot sem os reutilizar como prova corrente. |
| 2026-07-10 | 9/D5 | `AUDITORIA-HIDRATACAO-MF9.md` | Cabeçalhos internos “auditoria/correção atual” foram renomeados para observações datadas; o histórico em camadas permanece intacto, mas já não se apresenta como estado corrente da baseline. |
| 2026-07-10 | 9/D5 | seis reports/evidence históricos MF3/MF7/MF8 | Cabeçalhos residuais “atual/final” foram convertidos em “observado no snapshot”; não se alteraram resultados, estados ou números históricos. |
| 2026-07-10 | 9/D1-D5 | `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md` | Secções híbridas ficaram explicitamente delimitadas como provas atuais complementares, procedimento atual e snapshot histórico; os comandos seguros permanecem não executados nesta fase. |
| 2026-07-10 | 9/D6 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Validador endurecido para metadata/lanes, 66/66/94/13, tutorial v2, exatamente sete pontos e orçamento de comentários didáticos, contratos críticos, matriz, rate limits, schemas, E2E seguro e contratos concorrentes; suite expandida para 52 mutações isoladas, incluindo ponto 8 adicional e bloco longo sem comentário. URI E2E exige MongoDB loopback sem credenciais, seed/browser partilham as mesmas `TEST_MONGODB_*`, cada execução formal usa DB nova enquanto faltar run marker integral; metadata valida autoridade/proof scope, evidence STUDENT não aponta à referência privada e templates de evidence embutidos exigem os cinco campos D0. |
| 2026-07-10 | 9/D4-D5 | guias `BK-MF2-02`, `BK-MF2-04`, `BK-MF2-05`, `BK-MF2-07` | Adendos/snapshots concorrentes removidos e snippets realmente substituídos: inputs estritos, paginação estável, API cancelável, anti-stale/retry, mutações serializadas/rollback, media pending, adapters progressive/HLS/DASH e fila de progresso autoritativa. |
| 2026-07-10 | 9/D0-D5 | 11 guias MF0/MF6/MF7 com templates de evidence | Templates Markdown embutidos passaram a ensinar `document_status`, `snapshot_date`, lane STUDENT, autoridade e proof scope; MF1-06/MF6-03 ficaram atribuídos ao lote backend ainda em correção. |
| 2026-07-10 | 9/D4-D5 | nove guias MF3/MF4/MF5 | Contratos concorrentes removidos e snippets substituídos: tipos estritos, abort/anti-stale/retry, checkout/trial idempotente/transacional/ledger v2, notification helper criado antes da extensão MF4-08, candidatura rate-limited/paginada, pool auditada e integrações admin transacionais. |
| 2026-07-10 | 9/D5 | guias `BK-MF4-01`, `BK-MF4-02`, `BK-MF4-08` | Comentários didáticos acrescentados nos cinco fences MF4 que não cumpriam os limiares tutorial-v2, explicando entitlement, fronteira transacional e deduplicação de notificações. |
| 2026-07-10 | 9/D3-D5 | guias `BK-MF1-01`, `BK-MF1-04`, `BK-MF1-05`, `BK-MF1-06`, `BK-MF6-03` | Fundação tutorial recomposta: pontos `1..7`, Mongo/transações/sessão/CSRF autocontidos, health/audit/shutdown aditivos, smoke com double e metadata evidence completa. |
| 2026-07-10 | 9/D3-D5 | guias `BK-MF2-01`, `BK-MF2-03`, `BK-MF2-06`, `BK-MF2-08`, `BK-MF9-02`, `BK-MF9-06` | Rate limiter Mongo, safe-next, catálogo paginado por allowlist, validação media aditiva/canónica e procedimentos E2E seguros ficaram definidos sem helpers fantasma ou substituição destrutiva. |
| 2026-07-10 | 9/D3-D5 | guias `BK-MF1-02`, `BK-MF5-02`, `BK-MF7-02`, `BK-MF7-03`, `BK-MF7-04`, `BK-MF9-05` | Frontend/RBAC/RGPD recompostos de forma aditiva: lazy lifecycle preservado, carousel existente reutilizado, export mantido e eliminação familiar transacional com helpers definidos. |
| 2026-07-10 | 9/D5 | 20 guias MF1/MF2/MF3, `BK-MF5-02` e `BK-MF9-06` | Orçamento tutorial-v2 fechado: 237 linhas de comentário didático específico acrescentadas aos 151 findings, sem alterar lógica, imports, headings, pontos, metadata ou paths. |
| 2026-07-10 | 9/D1-D5 | `docs/evidence/MF8/TESTES-FINAIS-CRIADOS.md`, `MF9/REGRESSAO-MF9.md`, `MF9/GATE-S13-MF9.md` | Procedimentos atuais deixam de ensinar nomes de DB E2E genéricos reutilizáveis: exemplos usam run ID UTC novo por execução e o mesmo ID apenas entre seed/browser do respetivo run. Snapshots históricos ficaram intactos. |
| 2026-07-10 | 9/D6 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Regras adicionais para DB E2E timestamped/fresca, procedimento MF9, manifests dos cinco runbooks e schemas `payment_attempts` v2/`contents`; suite passa de 52 para 57 mutações isoladas. |
| 2026-07-10 | 9/D7 | 15 guias MF5/MF7/MF8/MF9 | Dezasseis headings `####` não canónicos foram despromovidos sem apagar conteúdo; os 66 guias passam a conter exatamente as 16 secções tutorial-v2. |
| 2026-07-10 | 9/D7 | `docs/evidence/archive/**`, 12 híbridos e `AUDITORIA-HIDRATACAO-MF5.md`/`MF6.md` | Archive index/templates recebem metadata D0; híbridos ganham boundary H2 único de snapshot; auditorias STUDENT identificam `real_dev` apenas como comparação REFERENCE. Histórico e placeholders arquivados preservados. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-04`, `BK-MF2-03/04/06/08`, `BK-MF4-05`, `BK-MF5-02`, `BK-MF6-04`, `BK-MF7-02`, `BK-MF9-01/02` e runbook worker | Primeira remediação da reauditoria: `CSRF_INVALID`; canonicalização de qualidade; import explícito; helpers Range/rede; API charities aditiva; parental/auto fail-closed; rate limit RGPD; catálogo performance sem v1; sessão indisponível preservada; eligibility financeira/acesso premium; URI fora de argv. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Validador passa a rejeitar headings `####` extra, metadata ausente no arquivo, híbridos sem boundary e comparação STUDENT/REFERENCE ambígua; suite preparada com 61 mutações isoladas, ainda pendente de baseline estável pós-composição. |
| 2026-07-10 | 9/D7 | `BK-MF2-01-registo-login-recuperacao-password.md` | Auth recomposta cumulativamente sobre MF1: env aditivo, token/session/CSRF/cookies transacionais preservados, router e app aditivos, indisponibilidade sem logout e LoginPage lazy. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Treze regressões de composição ganham regras/mutações: auth/session, CSRF retry, E2E helpers, premium gate, eligibility, qualidade, parental/auto, rate RGPD, segredo worker, catálogo performance, charities API e import de detalhe. Total provisório: 74. |
| 2026-07-10 | 9/D7 | 20 guias MF1-MF7 com composição de rotas | Contrato cumulativo de rotas recomposto: 31 páginas por `lazyNamedPage`, zero imports eager, placeholders substituídos sem bindings duplicados, quatro páginas admin declaradas e navegação com login, logout, notificações e oito áreas administrativas preservada. |
| 2026-07-10 | 9/D7 | `BK-MF9-03-modelo-api-partilha-familiar.md` | Fundação familiar tornada autocontida: helpers, serializers, acesso efetivo, lock partilhado, contagens e propagação de sessão foram definidos antes do uso; acesso delegado permanece fail-closed e dependente de owner/plano Família válidos. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Validador passa a rejeitar import eager de páginas, navegação cumulativa incompleta e fundação familiar sem helpers nucleares; duas mutações isoladas elevam o total provisório para 76 classes. |
| 2026-07-10 | 9/D7 | guias `BK-MF3-05/06`, `BK-MF4-04/06`, `BK-MF5-04`, `BK-MF6-05` | Dez schemas/fragmentos contextuais deixaram de ser apresentados como módulos JS/JSX autónomos: ficaram em fences `text` explicitamente rotuladas, preservando o conteúdo pedagógico e mantendo os restantes 36 blocos executáveis sintaticamente válidos. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | O validador passa a fixar a classificação não executável dos dez recortes conhecidos; uma mutação isolada adicional eleva o total provisório para 77 classes. |
| 2026-07-10 | 9/D7 | guias `BK-MF2-04/06/08`, `BK-MF5-03`, `BK-MF6-04`, `BK-MF9-02` e `docs/runbooks/WORKER-LOCAL.md` | Lote residual recomposto: clientes de catálogo/playback preservam API anterior e cancelamento; política E2E valida host antes da fixture e falha no teardown; worker escolhe DB sem corromper URI; performance conserva status real; RGPD envia password; qualidade desconhecida fica locked e redigida. |
| 2026-07-10 | 9/D7 | `BK-MF2-03-crud-catalogo-taxonomias.md` | Catálogo admin deixou de ser uma shell parcial: CRUD metadata-only cobre metadados, assets editoriais e taxonomias, carrega linha para edição, confirma destrutivas, reserva busy state por linha, trata conflitos/versionamento e redige erros; zero fonte de reprodução. |
| 2026-07-10 | 9/D7 | `BK-MF9-02-qualidade-streaming-por-plano.md` | Middleware de playback recomposto sobre acesso efetivo: preserva `requireActiveSubscription`, consulta `getEffectiveSubscriptionAccess`, aceita apenas `hasPremiumAccess === true` e herda a extensão Family do BK seguinte sem bypass por origem/truthiness. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Oito contratos residuais e o guard efetivo passam a regras próprias: APIs cumulativas, host-before-fixture, DB worker, status real, password RGPD, redaction de qualidade, catálogo admin e acesso Family; total provisório sobe para 86 mutações. |
| 2026-07-10 | 9/D7 | `AUDITORIA-HIDRATACAO-MF5.md`, `AUDITORIA-HIDRATACAO-MF6.md`, `docs/planificacao/README.md`, `docs/evidence/README.md` | Drift de lane removido: snapshots STUDENT usam a chave canónica `comparison_lane: REFERENCE` e `target_lane: STUDENT`; as duas políticas explicam que `implementation_lane` continua a classificar apenas a audiência principal. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Validador e negativos deixam de cristalizar `implementation_root_lane`; passam a exigir a chave/política `comparison_lane`, com uma mutação adicional. Total provisório: 87. |
| 2026-07-10 | 9/D7 | `BK-MF7-02-navegacao-segura-por-sessao-e-perfil.md` | Releitura sequencial encontrou coerção residual de resposta ausente para `null`: o provider passa a aceitar anonimato só perante `200 { user: null }`, valida a allowlist do utilizador e trata payload ausente/malformado como `unavailable` sem apagar identidade confirmada. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Contrato de sessão passa a exigir `isPublicUser` e `response?.user === null`, a proibir `response?.user ?? null` e ganha mutação isolada. Total provisório: 88. |
| 2026-07-10 | 9/D7 | `BK-MF4-01-planos-ciclo-subscricao.md` | Router premium recomposto sem apagar as rotas herdadas: imports e `GET/PUT /preferences` ficam antes das rotas dinâmicas, `/me/continue-watching` mantém-se autenticada e apenas playback/progresso recebem o entitlement guard. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Nova regra impede que o router premium volte a perder preferências/continue-watching; total provisório: 89 mutações. |
| 2026-07-10 | 9/D7 | `BK-MF4-02-metodos-pagamento-simulados-trial.md` | Idempotência endurecida na origem: backend rejeita sentinelas literais `undefined`/`null`; cliente valida a chave antes de construir `Headers`, preserva headers existentes e nunca envia implicitamente uma chave constante. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Contrato financeiro passa a exigir guards backend/client contra sentinelas e ganha mutação própria. Total provisório: 90. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Cobertura de híbridos CURRENT ampliada aos cinco documentos MF8/MF9 que alternam prova/procedimento atual e snapshot histórico; cada um exige boundary H2 explícito e há mutação isolada própria. Total provisório: 91. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Cinco contratos security tornam-se regressões verificáveis: Origin/CSRF browser, guard de seed, reset delivery, rate limit de recomendações e hardening HTTPS/headers. Total provisório: 96 mutações. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-04`, `BK-MF2-01/02/05/06/07` e `BK-MF3-05` | Sublote security A-C: Origin distingue browser de CLI por `Origin`/`Sec-Fetch-Site`, auth público tem exceção CSRF exata após validação de Origin, curls ficam coerentes, recomendações montam 60/user/min e reset ganha canal PAP dev-only opt-in, TTL e cleanup transacional sem contaminar dummy/API/logs. |
| 2026-07-10 | 9/D7 | guias `BK-MF2-08` e `BK-MF6-03` | Sublote security D-E: guard E2E central integra MF2/MF4/MF9 com env exclusiva, replica set, DB/run marker, conflito pré-escrita e cleanup seletivo; hardening cria env fail-closed, trusted proxy, HTTPS 426, headers/HSTS/CSP e remove `X-Powered-By`. |
| 2026-07-10 | 9/D7 | `BK-MF2-06-legendas-audio-parental-e-qualidade.md` | Preferências do player recompostas: hidratação inicial, reserva síncrona, AbortController, versões de pedido/operação, guard de conteúdo, cleanup e rollback de state/ref impedem PUT concorrente ou resposta antiga sem apagar adapters/progresso. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | O contrato `media_preferences` fixa a proteção contra races e recebe mutação isolada; total provisório sobe de 108 para 109. A suite completa continua pendente do fecho Family/billing. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-02`, `BK-MF6-05`, `BK-MF7-02/03/04` | Primeiro sublote frontend final: player preserva adapters e fontes por allowlist; catálogo/pesquisa/biblioteca recuperam URL-state, paginação e cancelamento; recomendações usam método existente; checkout/trial geram UUID por intenção; metadata cobre rotas finais; moderator limita-se ao catálogo; menu mobile cumpre semântica, 44px, Escape/foco e reduced motion. |
| 2026-07-10 | 9/D7 | guias `BK-MF4-04/06`, `BK-MF5-03/04`, `BK-MF9-04` | Robustez administrativa/familiar concluída: paginação, confirmação, reservas síncronas, cancelamento/anti-stale, busy por operação, rollback, erros PT-PT, idempotency keys por intenção e IDs de path codificados; APIs existentes são estendidas, nunca redefinidas. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-02`, `BK-MF6-05`, `BK-MF7-02/03/04` | Composição frontend final auditada: metadata 22/22, player descriptor-only sem fontes, páginas com URL-state/paginação/cancelamento, moderator apenas no catálogo, menu acessível, ErrorBoundary/lazy/adapters/retry preservados. |
| 2026-07-10 | 9/D7 | `BK-MF4-01-planos-ciclo-subscricao.md` | P1 worker/jobs deixa de ser promessa: o tutorial cria os quatro ficheiros com índices/key única, claim CAS e lease takeover, complete/fail por owner, retry sanitizado, ciclo transacional/idempotente, ledger v2, EOM, adapter simulado determinístico e loop/shutdown; pool mensal continua propriedade de MF4-05. |
| 2026-07-10 | 9/D7 | `BK-MF4-05-distribuicao-mensal-rotacao.md` | Worker mensal recomposto de forma cumulativa: primeiro dia UTC fecha o mês anterior, catch-up fica limitado a 120 meses, cada mês usa `pool:AAAA-MM`, lease/retry partilhados e `runBillingWorkerCycle` preserva simultaneamente subscrições e pool. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Contratos `worker_jobs` e `pool_worker` tornam índices, leases, ciclo transacional, shutdown, primeiro dia UTC, catch-up e composição do worker obrigatórios; duas mutações isoladas elevam o total provisório de 106 para 108. A integração Family/billing continua aberta e ainda não conta neste total. |
| 2026-07-10 | 9/D7 | `BK-MF9-03-modelo-api-partilha-familiar.md` | Integração Family/billing fechada no tutorial: `canceled` e renovação recusada (`past_due`) removem memberships abertas dentro da mesma transação/session do ciclo, com reason fechado e fault/concurrency matrix; não foi inventado grace, deadline ou job de expiração. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | `family_billing` torna helper, duas chamadas, reasons, `{ session }`, cinco cenários e ausência de expiração automática regressões obrigatórias. Com `media_preferences`, o total provisório passa a 110 mutações isoladas. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | A primeira repetição dos 110 negativos revelou uma fixture stale no caso `final_recommendations_api`; mutação e regra passaram a apontar à chamada executável `getMine({ signal })`, em vez de depender do marker narrativo `getMine()`. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py` | A segunda repetição revelou false-negative em `mobile_reduced_motion`: a regra aceitava a frase narrativa depois de a media query ser mutada. O contrato passou a exigir o bloco CSS exato `@media (prefers-reduced-motion: reduce) {`. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py` | Auditoria preventiva dos casos ainda não percorridos substituiu markers genéricos por declarações executáveis exatas em consentimentos, users admin, review e charity reports; assim, remover a reserva síncrona não pode ser mascarado por usos residuais do mesmo identificador. |
| 2026-07-10 | 9/D7 | `BK-MF2-01-registo-login-recuperacao-password.md` | Parser global encontrou uma entrada isolada de `package.json` marcada como documento JSON completo; o exemplo passou a objeto `{ "scripts": ... }` válido, mantendo a instrução explícita de acrescentar apenas a chave. |
| 2026-07-10 | 9/D7 | guias `BK-MF2-08`, `BK-MF4-08`, `BK-MF6-03`, `BK-MF9-05/06` | Lote reaberto pela terceira reauditoria humana: progresso seguro/notificação, seleção DB test fail-closed, env completa do E2E MF9, pool cumulativa, cleanup da outbox por IDs e métrica por `createdAt` aguardam substituição dos snippets ativos. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-03/05`, `BK-MF2-02/03/06`, `BK-MF5-03`, `BK-MF6-03`, `BK-MF9-01/02` | Segundo lote reaberto: transação/índice de consentimento, auth/error envelope único, `INVALID_RESPONSE`, validação de body, cache privado, helper media, state de preferência, allowlist de qualidade e request ID fechado aguardam correção ativa. |
| 2026-07-10 | 9/D7 | guias `BK-MF4-01`, `BK-MF9-01/02` | Autorização própria/trial reaberta: estados passam a allowlist `active|trialing`; trial exige `planCode: trial` e entitlements próprios, enquanto qualquer estado/plano incoerente falha fechado. |
| 2026-07-10 | 9/D7 | `BK-MF9-03-modelo-api-partilha-familiar.md` e contrato de notificações MF4-08 | Eventos `family_invitation`, `family_invitation_accepted` e `family_member_removed`, mais dupla allowlist `accountStatus`/`status`, reabertos para impedir rollback dos fluxos e entitlement por owner bloqueado. |
| 2026-07-10 | 9/D7 | guias `BK-MF5-04` e `BK-MF9-05` | Invariante do último admin reaberta: role e os dois campos de estado devem ser operacionais; admins bloqueados/inativos/desconhecidos não contam, legacy sem ambos continua compatível. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-01`, `BK-MF3-01/02/05`, `BK-MF4-03/04/06`, `BK-MF5-02` | Lote final de redefinitions reaberto: código de erro canónico, review estrito, ratings atómicos/serializados, comentário público, dedupe/feedback/rede de recomendações e cinco contratos Charity aguardam substituição copiável. |
| 2026-07-10 | 9/D7 | 18 ocorrências atuais em 15 guias MF2-MF7/MF9 | Imports/referências auth reabertos para apontarem exclusivamente a `backend/src/middlewares/auth.middleware.js`; `modules/auth/auth.middleware.js` fica proibido nos 66 guias. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-03/05`, `BK-MF2-02/03`, `BK-MF5-03` | Sublote core inicial corrigido: 2xx inválido gera `INVALID_RESPONSE`; request ID é fechado; auth/role usa um middleware/envelope; bodies são validados antes do acesso; consentimento, evento e leitura partilham transação e índice único. |
| 2026-07-10 | 9/D7 | guias `BK-MF4-05`, `BK-MF5-01/05/06` | Lote MF4/MF5 reaberto: export cancelável/sanitização recursiva, métricas e UI coerentes, integração com índice/allowlist de config, moeda EUR/overflow e body de distribuição estrito aguardam correção. |
| 2026-07-10 | 9/D7 | guias `BK-MF6-04`, `BK-MF7-02/04` | Lote segurança/navegação reaberto: medição apenas loopback sem exfiltração e com timeout, prova curl observável, planos públicos independentes de sessão, guarda das rotas privadas e logout reservado por ref. |
| 2026-07-10 | 9/D7 | guias `BK-MF3-05/06`, `BK-MF7-04` | Contrato de recomendação reaberto para reason codes realmente implementados, dedupe/feedback coerentes e ausência de explicações/carrosséis vazios; não se inventa semantic scoring para fazer a matriz passar. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-04` e `BK-MF2-01` | Sessão reaberta para cookie malformado fail-closed e `/api/session/me` sempre privado/no-store; `HttpError` com quarto argumento já foi corrigido no sublote core e deixa de ser causa aberta. |
| 2026-07-10 | 9/D7 | 18 guias MF2/MF4/MF5/MF6/MF7/MF9 do lote security/governance | Corrigidos snippets ativos de progresso/notificação, DB test fail-closed, cache privado, E2E MF9, privacidade/pool, media/qualidade/trial, notificações/estados Family, Charity, moeda/body, performance loopback, rotas privadas/Home/Subscrição e regressão MF6-01 honesta. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-01/03/04/05`, `BK-MF2-01/02/03`, `BK-MF3-01/02/03/05/06`, `BK-MF4-03/04`, `BK-MF5-02/03` | Lote core congelado: erro/envelope/request ID, cookie/cache, cliente 2xx, auth/body, consentimento atómico, ratings, comentários, pesquisa, recomendações/explicações, candidatura/review e eliminação UI foram substituídos por contratos copiáveis. |
| 2026-07-10 | 9/D7 | guias `BK-MF3-03`, `BK-MF4-03`, `BK-MF5-02`, `BK-MF6-01`, Home MF7 | Último lote da auditoria estável reaberto: pesquisa paginada sem lookup global, URL sem credenciais, eliminação reservada/cancelável, regressão idempotente sem DB normal e Home cancelável/segura por sessão. |
| 2026-07-10 | 9/D7 | guias `BK-MF5-01/05/06` | Lote MF5 congelado: exportação usa allowlist/sanitização recursiva e cancelamento anti-race; métricas usam datas ISO, estados fail-closed e UI cancelável; integrações usam índice único, upsert concorrente seguro, DTO público fechado e rejeição de segredos. |
| 2026-07-10 | 9/D7 | guias `BK-MF4-08`, `BK-MF5-04`, `BK-MF6-01` e referências auth nos guias ativos | Reauditoria pós-fix confirmou zero P0/P1 e reabriu quatro P2: reserva same-tick, paginação admin real, linguagem honesta da integração bloqueada e caminho único `src/middlewares/auth.middleware.js`. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-04`, `BK-MF2-02`, `BK-MF3-01` | Reauditoria pós-fix do lote core reabriu env test e estado de sessão fail-closed (P1), mais alteração de role transacional/auditada e body guard de ratings (P2). |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Regras `composition.export_security`, `composition.metrics_admin` e `composition.integrations_config` tornam os três contratos MF5 regressões obrigatórias, cada uma com mutação isolada. Total provisório: 113 negativos. |
| 2026-07-10 | 9/D7 | guias `BK-MF4-08`, `BK-MF5-04`, `BK-MF6-01` | Quatro P2 pós-fix corrigidos: preferências reservam a operação no mesmo tick e ignoram rollback stale; users têm paginação/total/sort estável; a suite MF6 distingue teste unitário fornecido de integração não fornecida ou bloqueada. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-04`, `BK-MF2-02`, `BK-MF3-01` | Dois P1 e dois P2 pós-fix corrigidos: test mode recusa DB normal e exige double explícito; sessão aplica os dois campos de estado; role usa transação/audit/invariante; ratings validam o body antes de ler `value`. |
| 2026-07-10 | 9/D7 | 15 guias ativos MF2-MF7/MF9 | As 18 ocorrências auth obsoletas foram normalizadas para `backend/src/middlewares/auth.middleware.js` e imports relativos equivalentes; evidence REFERENCE que descreve a localização real privada não foi reescrita. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Dezanove classes pós-auditoria foram acrescentadas ao validador com mutação isolada: auth path, sessão/DB, erro/request ID, consentimentos, progresso, privacidade Family, trial/acesso, notificações Family, users, ratings, comentários, recomendações, Charity, pool, performance, navegação, eliminação, evidence MF6 e DB E2E. Total provisório: 132 negativos. |
| 2026-07-10 | 9/D7 | `BK-MF3-01-ratings-e-agregacao.md` | Dois comentários didáticos em falta foram acrescentados aos guards de tipo/body; a semântica executável não mudou. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-06`, `BK-MF2-02/03/06`, `BK-MF4-01`, `BK-MF9-04/05` | Gate humano final reaberto: oito findings P1/P2 em media locked, isolamento/lane do smoke, lease ativo, planos públicos/sessão, trigger da pool, composição da sessão e atomicidade/audit das criações admin aguardam correção. |
| 2026-07-10 | 9/D7 | `BK-MF1-06-smoke-tests-fe-be.md` | Smoke recomposto sem qualquer variável Mongo: unitários usam o double explícito; evidence STUDENT futura usa path próprio `docs/evidence/student/MF1/README.md`; o snapshot MF1 REFERENCE existente fica preservado. |
| 2026-07-10 | 9/D7 | guias `BK-MF2-02/03/06` | Lote security final corrigido: seleção remove media/áudio/qualidade locked antes do fallback; MF2-02 acrescenta só `userRouter` após sessão/CSRF; criações de conteúdo/taxonomia propagam ator/requestId e partilham transação/session com audit. |
| 2026-07-10 | 9/D7 | guias `BK-MF4-01`, `BK-MF9-04/05` | Lote operação final corrigido: complete/fail exigem lease ainda ativo; `/planos` carrega oferta pública independentemente e condiciona dados/ações privados à sessão; trigger mensal usa `admin`, nunca `manual`. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Oito causas do gate humano final passam a regras/mutações próprias: smoke isolation, evidence lane, media locked, session mount, criação admin/audit, lease ativo, planos públicos/sessão e trigger da pool. Total: 140 negativos. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-06`, `BK-MF9-04` | Cross-audit reabriu cleanup do DB double e loading público: falhas de arranque/fecho ou sessão não autenticada não podem deixar estado global/UI preso. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | `composition.smoke_isolation` passa a recusar também `TEST_MONGODB_*` e ganha mutação própria; total final previsto: 141 negativos. |
| 2026-07-10 | 9/D7 | guias `BK-MF1-06`, `BK-MF9-04` | Cleanup final corrigido: DB override é limpo em `finally` no fecho e no arranque falhado, com close idempotente; o `finally` exterior de `loadData` liberta loading em todas as branches válidas sem resposta stale. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | Novas regras estruturais provam dois resets do smoke e que a branch não autenticada está dentro do try coberto pelo finally de loading; total final: 143 negativos. |
| 2026-07-10 | 9/D6-D7 | `scripts/validate_planificacao_canonica.py`, `scripts/test_validate_planificacao_negatives.py` | `smoke_cleanup` deixa de contar strings globais: exige `setDbForTests(null)` ativo nos `finally` de close e startup; a mutação comenta o segundo reset sem reduzir a contagem textual. |
| 2026-07-10 | 9/D7 | report canónico | Estados finais fechados: Fase 9, D0-D7, `FF-DOC-001..016` e `FF-AUD-020/021` passam a `VALIDADO`; checkpoint e métricas D7 ficam registados sem alterar os bloqueios runtime/ambiente/produto. |

## 9. Ledger de comandos e resultados

| Data | Fase | Cwd | Comando | Exit | Resultado |
| --- | --- | --- | --- | ---: | --- |
| 2026-07-09 | 0 | repo | `git status --short --untracked-files=all` | 0 | Confirmou dirty worktree pre-existente em roots dos alunos, docs, mockup e orquestracao. |
| 2026-07-09 | 0 | repo | `git rev-parse HEAD` | 0 | Baseline `1f33e61d1751fcae702ee92d1865fccfe295a0e0`. |
| 2026-07-09 | 0 | repo | `git check-ignore -v real_dev ...` | 0 | `real_dev/` confirmado como ignorado por `.gitignore:2`. |
| 2026-07-09 | 0 | repo | `test -s report; rg trailing whitespace; git diff --check -- report` | 0 | Report existe, nao esta vazio e nao tem erros de whitespace. `CP0` validado. |
| 2026-07-09 | 1 | `real_dev/backend` | `node --test tests/unit/seed-safety.test.js` | 0 | 6 testes, 6 pass; sem rede ou MongoDB. |
| 2026-07-09 | 1 | `real_dev/backend` | `node --check` nos seeds MF2/MF4/MF9/editorial | 0 | Sintaxe valida; nenhum seed executado. |
| 2026-07-09 | 1 | `real_dev/frontend` | `npm run lint && npm run test:unit && npm run build` | 0 | Lint sem warnings; 4 testes pass e 1 TODO; Vite 8.1.4 build PASS. |
| 2026-07-09 | 1 | `real_dev/frontend` | `npm audit` apos React Router 6.30.4 | 0 | 0 vulnerabilidades. |
| 2026-07-09 | 1 | repo | `node scripts/check-media-fixtures.mjs` | 0 | Fixtures locais, checksum valido e zero URL externa. |
| 2026-07-09 | 1 | repo | `npx playwright test --list` | 0 | 27 testes descobertos: 9 por Chromium, Firefox e WebKit. |
| 2026-07-09 | 1 | repo | `bash scripts/validate-planificacao.sh` | 0 | 66 BKs e 66 guias validados depois da sincronizacao documental da Fase 1. |
| 2026-07-09 | 2 | `real_dev/backend` | `node --test tests/unit/*.test.js` | 0 | 68 testes unitarios pass; inclui media, consentimento, parental, notificacoes, CSRF multi-tab, rate limit, reset concorrente e eliminacao de PII. |
| 2026-07-09 | 2 | `real_dev/backend` | `npm test` fora do sandbox, antes do isolamento do smoke | 1 | A primeira repeticao encontrou regressao real nos doubles e ficou pendurada por uma ligacao Mongo aberta; interrompida. Pode ter incrementado um contador TTL pseudonimizado na DB configurada. |
| 2026-07-09 | 2 | `real_dev/backend` | `npm test -- tests/smoke/app.smoke.test.js` apos DB fake explicita | 0 | 8 testes pass; confirmou que o smoke ja nao abre Mongo configurado. |
| 2026-07-09 | 2 | `real_dev/backend` | `npm test` final com HTTP loopback e DBs in-memory | 0 | 97 testes, 97 pass, 0 fail/skip/cancel; nenhum seed nem DB real. |
| 2026-07-09 | 2 | `real_dev/backend` | import de configuracao com env de producao sintetica | 0 | `FORCE_HTTPS`, trusted proxy e cookie `Secure` validados sem arrancar servidor ou DB. |
| 2026-07-09 | 2 | `real_dev/frontend` | `VITE_API_BASE_URL=https://api.faithflix.test npm run validate` | 0 | ESLint pass; 10 ficheiros/43 testes pass; build Vite 8.1.4 pass; auth publica sem CSRF e `/login` protegido contra sessao autenticada/indisponivel. |
| 2026-07-09 | 2 | repo | `stat; chmod 600; stat real_dev/backend/.env` | 0 | Modo confirmado de `0644` para `0600`; segredo nunca impresso. |
| 2026-07-09 | 2 | repo | `bash scripts/validate-planificacao.sh` | 0 | 66/66 BK e 66/66 guias PASS depois das correcoes e da revisao residual. |
| 2026-07-09 | 2 | repo | `git diff --check` | 0 | Sem erros de whitespace nas alteracoes documentais; report novo validado separadamente por trailing whitespace. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test tests/unit/database-transaction.test.js` | 0 | 3/3: retry apenas transiente, nested transaction recusada e topology guard injetado sem Mongo real. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --check` nos services/controller F3-B de payments/subscriptions | 0 | Sintaxe valida nos quatro modulos alterados. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test tests/unit/mf9-subscriptions.test.js tests/regression/mf6-backend-regression.test.js` | 1 | 21/23 passaram; os dois failures eram exclusivamente os testes de pool sobre mes UTC ainda aberto, fora do scope F3-B. Os dois testes legacy de checkout passaram. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test tests/unit/f3-billing-transaction.test.js` | 0 | 6/6: chave obrigatoria, indices parciais, schema v2, replay sem duplicacao e rollback de checkout/trial por fault injection. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test --test-name-pattern='checkout|subscricoes cobrem' tests/unit/mf9-subscriptions.test.js tests/regression/mf6-backend-regression.test.js` | 0 | 2/2 testes legacy afetados pelo novo contrato idempotente passaram com chaves explicitas. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --check ... && node --test tests/unit/f3-billing-transaction.test.js && node --test --test-name-pattern=...` | 0 | Revalidacao acumulada F3-B: 6/6 testes novos e 2/2 regressões focadas passaram. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test tests/unit/f3-billing-transaction.test.js` apos adicionar prova dos controllers | 1 | 5/6; o double de `res` do teste de trial nao implementava `status`. Falha exclusiva do harness, sem execucao de DB. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test tests/unit/f3-billing-transaction.test.js` apos corrigir o double HTTP | 0 | 6/6; controllers confirmados a propagar a ausencia de `Idempotency-Key` como erro de contrato. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test tests/unit/f3-billing-transaction.test.js tests/unit/mf9-subscriptions.test.js tests/regression/mf6-backend-regression.test.js` | 0 | 29/29; suite F3-B e regressões MF6/MF9 acumuladas passaram depois da estabilização independente dos testes de pool. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test tests/unit/scheduled-jobs.test.js tests/unit/database-transaction.test.js` | 0 | 6/6: lease exclusivo, takeover apos expiracao, owner check, retry e conclusao terminal. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --check pool-distribution.service.js`; `node --test --test-name-pattern='pool\|distribui' ...` | 0 | Sintaxe valida e 3/3 testes focados: limites mensais, pagamentos aprovados, exclusao de memberships, rotacao e replay sem Mongo real. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --check subscriptions.validation.js`; `node --test tests/unit/billing-cycles.test.js` | 0 | 3/3: 31 de janeiro em ano bissexto/comum, 29 de fevereiro anual e intervalo invalido, sem DB/rede. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --check` no adapter, billing jobs, worker e teste; `node --test billing-jobs billing-cycles scheduled-jobs` | 0 | 13/13: leases, dois workers sem duplicacao, renovacao aprovada/recusada, trial, rollback, calendario e pool mensal, sem Mongo real. |
| 2026-07-10 | 3 | `real_dev/backend` | `npm pkg get scripts.worker` | 0 | Entry point local confirmado como `node src/worker.js`; worker nao foi arrancado nem ligado a DB nesta validacao. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --check` billing/subscriptions; `node --test billing-jobs billing-cycles scheduled-jobs f3-family` | 0 | 21/21: renovacao futura recusada tambem no helper legado, worker/pool e familia preservados, sem DB/rede. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/unit/*.test.js` | 0 | 123/123 unitarios acumulados F1-F3 passaram; inclui fault injection, concorrencia, migracao dry-run e zero acesso a DB/rede. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/regression/*.test.js` no sandbox | 1 | 6/8 passaram; dois testes MF8 falharam exclusivamente com `listen EPERM` em `127.0.0.1`, sem regressao funcional observada. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/regression/*.test.js` fora do sandbox | 0 | 8/8 regressões passaram com loopback local e DB in-memory. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/integration/*.test.js` fora do sandbox | 0 | 10/10 integrações HTTP passaram com doubles in-memory; nenhuma seed, migracao ou DB real. |
| 2026-07-10 | 3 | `real_dev/backend` | `npm test` fora do sandbox | 0 | 151/151 testes backend acumulados passaram, sem skips/cancelamentos e sem MongoDB configurado. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test --test-name-pattern='pool\|checkout persiste' ...` | 0 | 5/5 focados depois do fecho contabilistico: checkout marca snapshot real e pool exclui legacy/estimativas sem alterar totais. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --check` catalogo e `node --test tests/unit/catalog-transactions.test.js tests/unit/media-boundary.test.js` | 0 | 14/14: CAS incluindo legado/lost update, atomicidade, publish/revert e serializers media F2 preservados; sem DB ou rede. |
| 2026-07-09 | 3 | `real_dev/backend` | `node --test tests/unit/*.test.js` | 1 | 82/84 pass; os 2 failures pertencem ao trabalho concorrente da pool mensal (`ACCOUNTING_MONTH_NOT_CLOSED`), fora do scope F3-D; os 8 testes de catalogo passaram. |
| 2026-07-09 | 3 | `real_dev/backend` | F3-D: `node --check` services/controllers; `node --test tests/unit/mf4-validation.test.js tests/unit/mf5-validation.test.js` | 1 | Sintaxe F3-D valida e MF5 verde; 1 teste MF4 da pool falhou durante alteracao concorrente de F3-B com `ACCOUNTING_MONTH_NOT_CLOSED`, fora do scope F3-D. |
| 2026-07-09 | 3 | `real_dev/backend` | F3-D: `node --check` dos 8 ficheiros; `node --test tests/unit/f3-admin-transactions.test.js tests/unit/mf5-validation.test.js`; trailing whitespace | 0 | 14/14 pass: rollback tardio, review concorrente, pending unica, membership sem transferencia, sessoes/audit/requestId atomicos e ultimo admin preservado; zero DB/rede. |
| 2026-07-10 | 3 | repo | Verificador Node focado dos contratos documentais de catalogo | 0 | 6/6 documentos ativos/evidence com fences equilibradas, markers F3 presentes e zero path privado nos dois guias dos alunos. |
| 2026-07-10 | 3 | repo | `bash scripts/validate-planificacao.sh` | 0 | `PASS`: 66 BKs e 66 guias, zero erros depois da sincronizacao F3 do catalogo. |
| 2026-07-10 | 3 | repo | `git diff --check` e trailing whitespace nos 7 documentos alterados | 0 | Zero erro de whitespace; snapshots historicos mantidos por adendo datado. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --check` no modulo/CLI/teste F3-B2 e `node --test tests/unit/payment-attempts-v2-migration.test.js` | 0 | 6/6: dry-run, argumentos, DB explicita, apply guard antes de acesso, idempotencia, v2/distribuicoes imutaveis e backfill sempre `accountingEstimate:true`; CLI de migracao nao executado. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/unit/payment-attempts-v2-migration.test.js tests/unit/f3-billing-transaction.test.js tests/unit/mf9-subscriptions.test.js tests/regression/mf6-backend-regression.test.js` | 0 | 35/35 na regressao acumulada F3-B/F3-B2/MF6/MF9, exclusivamente com doubles locais; zero DB, seed, E2E ou migracao. |
| 2026-07-10 | 3 | `real_dev/backend` | parse de `package.json` e trailing whitespace nos ficheiros/report F3-B2 | 0 | Script npm valido e zero trailing whitespace nos artefactos desta fatia. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --check` no service/teste familiar; `node --test tests/unit/f3-family-transactions.test.js` | 0 | 6/6: indice parcial, write-lock antes da recontagem, zero overbooking/duplicados, rollback tardio e sessoes propagadas; sem DB/rede. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/unit/mf9-subscriptions.test.js tests/unit/f3-family-transactions.test.js` | 0 | 23/23 na regressao MF9/F3-Family; checkout/trial preservados e nenhuma seed, E2E ou migracao executada. |
| 2026-07-10 | 3 | repo | Verificador Node dos contratos documentais F3 billing/familia e fences Markdown | 0 | 7 documentos focados continham todos os markers obrigatorios; fences pares em 17 documentos revistos. |
| 2026-07-10 | 3 | repo | Scan de paths privados em todos os guias MF4/MF9 | 0 | Zero `real_dev`, `referencia_privada_docente` ou `pasta_privada_do_professor`; guias usam apenas `backend/frontend`. |
| 2026-07-10 | 3 | repo | `bash scripts/validate-planificacao.sh` | 0 | `PASS`: 66 BKs e 66 guias, zero erros depois da sincronizacao F3 de billing, pool, worker e familia. |
| 2026-07-10 | 3 | repo | `git diff --check` e trailing whitespace nos documentos F3 billing/familia | 0 | Zero erro de whitespace; snapshots historicos mantidos por adendos separados. |
| 2026-07-10 | 3 | repo | Verificacao de fences e trailing whitespace nas duas cabulas | 0 | Fences equilibradas e zero trailing whitespace; contagens AST de 2026-07-07 mantidas como snapshot. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/unit/f3-admin-transactions.test.js tests/unit/mf5-validation.test.js` | 0 | `14/14`: pending unica, rollback/review concorrente, membership sem transferencia, user update/sessoes/audit/requestId e ultimo admin; zero DB/rede. |
| 2026-07-10 | 3 | repo | Scan focado de contratos F3-D, fences e paths privados nos guias alterados | 0 | Markers do codigo e docs coincidem; fences pares; zero `real_dev`, aliases privados ou `apps/*` nos guias publicos tocados. |
| 2026-07-10 | 3 | repo | `bash scripts/validate-planificacao.sh` | 0 | `PASS`: 66 BKs e 66 guias depois da sincronizacao administrativa F3-D. |
| 2026-07-10 | 3 | repo | `git diff --check` e trailing whitespace nos documentos/report F3-D | 0 | Zero erro de whitespace depois da atualizacao dos guias, adendos e ledgers. |
| 2026-07-10 | 3 | repo | Revalidacao documental combinada: validador, 154 Markdown, paths MF4/MF9 e `git diff --check` | 0 | 66/66 BK/guias; zero fence impar/trailing whitespace; zero path privado/`apps/*` nos guias publicos MF4/MF9; diff completo limpo. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test audit-service f3-admin mf4 mf5 billing-jobs` | 0 | 35/35 focados: pool deferred, membership/RGPD, audit minimizado, admin e jobs; exclusivamente in-memory, sem DB/rede. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/unit/*.test.js` | 0 | 138/138 unitarios passaram antes dos dois ultimos negativos; zero fail/skip/cancel, sem DB/rede. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/unit/f3-billing-transaction.test.js` | 0 | 9/9; checkout e trial recusam contas bloqueadas/eliminadas sem criar ledgers ou subscricoes. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --check billing-jobs.service.js && node --test tests/unit/billing-jobs.test.js` | 0 | Sintaxe valida e 12/12 jobs: backlog superior a um lote progride sem bloqueio permanente. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/unit/*.test.js` | 0 | 140/140 unitarios finais F1-F3, zero fail/skip/cancel; apenas doubles in-memory, sem DB/rede. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --test tests/regression/*.test.js tests/integration/*.test.js` fora do sandbox | 0 | 18/18 regressao e integracao HTTP com loopback e DBs in-memory; nenhuma MongoDB configurada. |
| 2026-07-10 | 3 | `real_dev/backend` | `npm test` fora do sandbox | 0 | 167/167 backend acumulados, zero fail/skip/cancel; nenhum seed, E2E ou migracao. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --check src/modules/family/family.service.js` | 1 | Tentativa da revisao independente apontou para ficheiro inexistente; erro de comando, sem impacto no produto. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --check src/modules/users/users-admin.service.js` | 1 | Tentativa da revisao independente apontou para ficheiro inexistente; erro de comando, sem impacto no produto. |
| 2026-07-10 | 3 | `real_dev/backend` | `node --check src/modules/subscriptions/subscriptions.service.js; node --check src/modules/users/user.service.js` | 0 | Paths reais corrigidos; ambos os services passaram sintaxe. Revisao independente confirmou 14 ficheiros F3 e 140/140 unitarios. |
| 2026-07-10 | 4 | `real_dev/frontend` | `npm run test:unit -- PrivacyDangerZone AppHeader apiClient && npm run lint` | 0 | 3 ficheiros/13 testes focados passaram; ESLint completo sem warnings. |
| 2026-07-10 | 4 | `real_dev/frontend` | `npm run test:unit -- src/pages/SearchPage.test.jsx && npm run lint` | 0 | 3/3 comportamentais cobrem URL/página, submissão e stale response; ESLint completo sem warnings. |
| 2026-07-10 | 4 | `real_dev/frontend` | `npm run test:unit -- src/pages/NotificationsPage.test.jsx && npm run lint` | 0 | 4/4 cobrem carga, cancelamento, rollback e busy state; ESLint completo sem warnings. |
| 2026-07-10 | 3 | repo | Primeira tentativa do verificador Node de paths dos guias F3 finais | 1 | Regex do próprio comando estava mal escapada e causou `SyntaxError`; nenhum ficheiro foi alterado pelo comando. |
| 2026-07-10 | 3 | repo | Verificador Node corrigido de paths; `bash scripts/validate-planificacao.sh`; scan de 154 Markdown; `git diff --check` | 0 | Zero paths privados/`apps/*` nos 7 guias tocados; 66/66; fences/whitespace limpos; diff sem erros. |
| 2026-07-10 | 4 | `real_dev/frontend` | Testes shell focados `ErrorBoundary`, `RouteLifecycle`, `AppRoutes` (duas execuções) | 0 | 5/5 em ambas; a primeira imprimiu stacks sintéticas esperadas e o harness foi silenciado, a segunda ficou limpa. |
| 2026-07-10 | 4 | `real_dev/frontend` | ESLint shell; `VITE_API_BASE_URL=https://api.faithflix.test npm run build`; `npm run test:unit`; `npm run lint` | 0 | 56/56 acumulados nessa revisão; build com chunks separados, JS inicial 61,64 kB gzip e CSS 4,80 kB gzip; logo 300,55 kB permanece para F5. |
| 2026-07-10 | 4 | `real_dev/frontend` | Scan `rg` de trailing whitespace nos 7 ficheiros shell | 1 | Zero matches; exit 1 e o resultado esperado do `rg` quando nao encontra whitespace. |
| 2026-07-10 | 4 | `real_dev/frontend` | Primeira execução `npm run test:unit -- src/pages/AdminCatalogPage.test.jsx && npm run lint` | 1 | 3/4 passaram; matcher textual do teste não aceitava texto repartido no mesmo parágrafo. Falha exclusiva do harness; lint não executou devido a `&&`. |
| 2026-07-10 | 4 | `real_dev/frontend` | Reexecução `npm run test:unit -- src/pages/AdminCatalogPage.test.jsx && npm run lint` | 0 | 4/4 comportamentais admin e ESLint completo passaram após corrigir o matcher. |
| 2026-07-10 | 4 | `real_dev/frontend` | `npm run test:unit -- src/pages/ContentDetailPage.test.jsx && npm run lint` | 0 | 2/2 cobrem media pendente e CTA ready autenticado; ESLint completo sem warnings. |
| 2026-07-10 | 4 | `real_dev/frontend` | Tentativa Node de importar diretamente `dashjs` e `hls.js` para inspecionar exports | 1 | `dashjs` é browser-only e a importação direta em Node imprimiu o bundle/stack; nenhum ficheiro, rede ou estado foi alterado. A API foi confirmada depois pelos types/package locais. |
| 2026-07-10 | 4 | `real_dev/frontend` | `npm run test:unit -- mediaAdapter.test.js progressQueue.test.js && npm run lint` | 0 | 7/7 cobrem progressive, HLS nativo/hls.js, DASH, destroy, serialização, coalescing, falha e flush; ESLint completo verde. |
| 2026-07-10 | 4 | `real_dev/frontend` | `npx eslint PlaybackPage/progressQueue; npm run test:unit -- progressQueue mediaAdapter` | 0 | 8/8: adapters mantidos e fila aceita a posição já confirmada pelo backend sem a persistir novamente; lint focado verde. |
| 2026-07-10 | 4 | `real_dev/frontend` | `npx eslint PlaybackPage e testes; npm run test:unit -- PlaybackPage progressQueue mediaAdapter` | 0 | 15/15: fonte única, retoma, `MEDIA_NOT_READY`, retry, seleção canónica, refetch após preferência, rollback, progresso/flush, erro visível, destroy e cancelamento; sem browser, rede ou media real. |
| 2026-07-10 | 4 | `real_dev/frontend` | `VITE_API_BASE_URL=https://api.faithflix.test npm run validate` | 0 | ESLint completo; 20 ficheiros/77 testes; build Vite verde. JS inicial 61,66 kB gzip e CSS 4,80 kB gzip; HLS/DASH ficaram em chunks lazy separados. O warning ESM do bundle `dashjs` e os chunks de media grandes ficam registados para F5, sem impacto no chunk inicial. |
| 2026-07-10 | 4 | `real_dev/backend` | Testes F4 catalog/search focados; HTTP/regressão fora do sandbox; unit completa; `npm test` | 0 | 38/38 focados, 13/13 HTTP/regressão, 152/152 unitários e 183/183 backend acumulados; zero skip, DB configurada, seed, E2E ou migração. A tentativa HTTP no sandbox falhou antes apenas com `listen EPERM`. |
| 2026-07-10 | 4 | `real_dev/backend` | Primeira tentativa dos testes HTTP F4 no sandbox | 1 | Falhou exclusivamente ao abrir loopback com `listen EPERM`; nenhuma DB/rede externa foi usada e os mesmos 13 testes passaram fora do sandbox. |
| 2026-07-10 | 4 | `real_dev/backend` | Playback: suite preexistente focada | 0 | 30/30 preservados em MF9/media/MF2 depois da alteração do DTO. |
| 2026-07-10 | 4 | `real_dev/backend` | Primeira combinação da suite playback com o teste novo | 1 | 28/31; três fixtures do próprio teste usavam shape nested diferente do storage e foram corrigidas, sem regressão do service. |
| 2026-07-10 | 4 | `real_dev/backend` | `node --test tests/unit/playback-contract.test.js` após corrigir fixtures | 0 | 8/8: progressive/HLS/DASH, legacy fechado, qualidade desconhecida, parental/pending, notificação e continue-watching. O HTTP ainda não tinha sido provado pelo agente nesse ponto. |
| 2026-07-10 | 4 | `real_dev/backend` | `node --check` playback; `node --test playback-contract media-boundary mf9-subscriptions` | 0 | 31/31 na validação independente final da fonte canónica, media pública, entitlement, parental, progresso e regressão MF9. |
| 2026-07-10 | 4 | `real_dev/backend` | `node --test tests/integration/playback-http.test.js` fora do sandbox | 0 | 3/3: resposta autorizada única, `409 MEDIA_NOT_READY` e bloqueio parental, todos com `Cache-Control: private, no-store`; loopback/doubles apenas. |
| 2026-07-10 | 4 | `real_dev/backend` | `npm test` fora do sandbox após fecho playback/catalog/search | 0 | 183/183 backend acumulados, zero fail/skip/cancel; nenhuma MongoDB configurada, seed, E2E ou migração. |
| 2026-07-10 | 4 | repo | Checks documentais focados e `bash scripts/validate-planificacao.sh` após sessão/playback/RNF | 0 | Fences pares, zero paths privados/contratos públicos antigos/whitespace; validador `PASS` com 66 BK e 66 guias. |
| 2026-07-10 | 4 | repo | `node --check` config/spec; `playwright ... --list`; `node scripts/check-media-fixtures.mjs` | 0 | Nove casos media descobertos (três protocolos × três engines); checksums e ausência de URLs externas validados. |
| 2026-07-10 | 4 | repo | Primeiras três execuções de `npm run test:media:browser` | 1 | Harness recusado corretamente: duas builds tentaram API loopback em modo production e o preview seguinte não recebeu `--mode test`. Nenhum browser/backend/DB arrancou nessas tentativas. |
| 2026-07-10 | 4 | repo | Duas execuções browser no sandbox após corrigir modo | 1 | Preview bloqueado por `listen EPERM 127.0.0.1:5182`; classificadas como limitação do sandbox e repetidas fora dele. |
| 2026-07-10 | 4 | repo | Primeira matriz media fora do sandbox e repetição com HTTP Range | 1 | 3/9 em ambas: o ficheiro legado `piloto.mp4` não fornecia vídeo compatível; Range não corrigiu a causa. |
| 2026-07-10 | 4 | repo | `afinfo real_dev/frontend/public/media/piloto.mp4` | 0 | Descoberta da causa raiz: o suposto MP4 de vídeo contém apenas uma faixa PCM mono de 20 s; deixou de ser usado como fixture. |
| 2026-07-10 | 4 | repo | Duas tentativas `avconvert` no sandbox | 1 | As extensões/presets foram recusados; nenhum output utilizável ou alteração da workspace. |
| 2026-07-10 | 4 | repo | `avconvert` autorizado para `/tmp` | 0 | Produziu apenas um container audio-only de diagnóstico; foi descartado e nunca entrou nas fixtures. |
| 2026-07-10 | 4 | repo | Primeira consulta Playwright de codecs no sandbox | 1 | Chromium não pôde registar o Mach port dentro do sandbox; nenhum browser útil ou ficheiro foi produzido. |
| 2026-07-10 | 4 | repo | Consulta Playwright de `MediaRecorder.isTypeSupported`/`canPlayType` nas três engines fora do sandbox | 0 | Confirmou codecs locais e permitiu gerar vídeo de canvas sem descarregar ferramentas/dependências. |
| 2026-07-10 | 4 | repo | `node scripts/generate-synthetic-media.mjs` em `/tmp` e workspace, com iterações de normalização | 0 | Gerou fMP4 H.264 baseline 320×180, sem áudio/conteúdo real; separou `ftyp/moov` e `moof/mdat`, removeu `mfra`, normalizou sample/container timing e registou checksums atuais. |
| 2026-07-10 | 4 | repo | Primeira matriz com fMP4 novo | 1 | 8/9: progressive/HLS/DASH verdes salvo DASH/Chromium, que chegou a metadata/buffer mas não `canplay`; a falha permaneceu aberta. |
| 2026-07-10 | 4 | repo | Reexecuções focadas `--project=chromium --grep='local dash'` durante diagnóstico | 1 | Diagnóstico real mostrou timeline inicial artificial do encoder, URL relativa CMCD e manifest/container divergentes; não se reduziu a expectativa do teste. |
| 2026-07-10 | 4 | `real_dev/frontend` | `npx eslint mediaAdapter; npm run test:unit -- mediaAdapter PlaybackPage` | 0 | 11/11 depois da resolução absoluta do manifest DASH; integração unitária preservada. |
| 2026-07-10 | 4 | repo | `node check-media-fixtures; npm run test:media:browser -- --project=chromium --grep='local dash'` | 0 | 1/1: DASH/Chromium atingiu `canplay` depois de timeline/manifest serem derivados das durações reais dos samples. |
| 2026-07-10 | 4 | repo | `npm run test:media:browser` fora do sandbox | 0 | 9/9: progressive, HLS e DASH atingiram `canplay` em Chromium, Firefox e WebKit; sessão/API interceptadas, rede externa zero, sem backend, MongoDB, seeds ou media real. |
| 2026-07-10 | 4 | `real_dev/frontend` | `VITE_API_BASE_URL=https://api.faithflix.test npm run validate` final F4 | 0 | ESLint completo, 20 ficheiros/77 testes e build production verdes depois do ajuste DASH; JS inicial 61,65 kB gzip, CSS 4,80 kB gzip e adapters fora do chunk inicial. Warning ESM/chunks media e logo 300,55 kB transitam para F5. |
| 2026-07-10 | 4 | repo | Checks focados dos 4 documentos admin/search F4 | 0 | Markers obrigatórios, fences, paths públicos e trailing whitespace verdes; `git diff --check` scoped verde. |
| 2026-07-10 | 4 | repo | Duas repetições concorrentes de `bash scripts/validate-planificacao.sh` durante rewrite MF9-06/BK08 | 1 | Estado transitório 65/66: MF9-06 estava temporariamente ausente e BK08 ainda tinha metadata intermédia. O agente não alterou esses ficheiros e não mascarou a falha. |
| 2026-07-10 | 4 | repo | `bash scripts/validate-planificacao.sh` após restaurar/fechar os guias | 0 | `PASS`: 66 BK e 66 guias; MF9-06 presente e metadata BK08 alinhada à matriz. |
| 2026-07-10 | 4 | repo | `git diff --check` final F4 | 0 | Zero erro de whitespace no diff acumulado. |
| 2026-07-10 | 4 | repo | `rg` de trailing whitespace e paths privados nos documentos F4 | 1 | Zero matches em ambos os scans; exit 1 é o resultado esperado do `rg` sem ocorrências. |
| 2026-07-10 | 4 | repo | `node scripts/check-media-fixtures.mjs` final F4 | 0 | Checksums das três fixtures binárias e zero URLs externas confirmados. |
| 2026-07-10 | 4 | repo | Scan de aliases antigos nos guias ativos de playback/media | 0 | Encontrou uma única ocorrência de `option.playbackUrl` na validação de storage interno do guia MF2-06; não está no DTO público nem instrui o frontend a selecionar URLs. Zero `content.media.playbackUrl`, piloto público, `RNF08 playStartMs` ou `4K PASS` nos contratos ativos revistos. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- LibraryActions AccountPage AdminPoolDistributionPage && npm run lint` | 0 | 3 ficheiros/8 testes: cancelamento, rollback, busy state, limite parental vazio e mês local; ESLint completo sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- AdminUsersPage MyLibraryPage && npm run lint` | 0 | 2 ficheiros/8 testes: paginação, cancelamento, confirmação, busy state por linha, retry independente e rótulos PT-PT; ESLint completo sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- RatingBox CommentsPanel interactionApis; npm run lint; npm run test:unit; build production` | 0 | Agente F5 confirmou 12/12 focados e 114/114 acumulados no snapshot então corrente; lint/build verdes, sem rede. Esta contagem antecede os testes AdminUsers/MyLibrary adicionados em paralelo. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- AdminUsersPage AdminPoolDistributionPage && npm run lint` | 0 | 2 ficheiros/6 testes após confirmação explícita e reposição de selects; ESLint completo sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- LibraryActions ContinueWatchingStrip && npm run lint` | 0 | 2 ficheiros/8 testes: procura paginada além da primeira página, cancelamento, rollback, retry, progresso e imagens lazy; ESLint completo sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | Primeira tentativa dos contratos CSS com import `?raw` | 1 | Três suites passaram; nove contratos CSS falharam porque o harness recebeu string vazia, não por incumprimento visual. Nenhum ficheiro externo/DB/rede foi usado. |
| 2026-07-10 | 5 | `real_dev/frontend` | Segunda tentativa dos contratos CSS com `fileURLToPath(import.meta.url)` | 1 | Três suites passaram; a suite CSS não arrancou porque o Vitest forneceu URL não-`file`. Harness corrigido para `process.cwd()`. |
| 2026-07-10 | 5 | `real_dev/frontend` | Testes focados CSS/layout/cards; `npm run lint`; `npm run build` | 0 | 5 ficheiros/20 testes; contrastes AA, targets, header 68 px, menu/teclado e lazy images verdes. Build: JS inicial 61,87 kB gzip e CSS 5,36 kB gzip; logo 300,55 kB e warnings media transitam na F5. |
| 2026-07-10 | 5 | `real_dev/frontend` | `rg` de trailing whitespace nos ficheiros CSS/a11y | 1 | Zero ocorrências; exit 1 é o resultado esperado do `rg` sem matches. |
| 2026-07-10 | 5 | repo | `sips -Z 160 real_dev/frontend/src/assets/faithflix-logo.png`; inspeção visual e metadata | 0 | Logo preservou transparência e identidade visual, passou a 141x160 e 19919 bytes, abaixo do orçamento de 30 kB. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- AppHeader && VITE_API_BASE_URL=https://api.faithflix.test npm run build` | 0 | 3/3; build com logo 19,91 kB, JS inicial 61,88 kB gzip e CSS 5,36 kB gzip. HLS/DASH continuam lazy; warning ESM/chunks media não afeta orçamento inicial. |
| 2026-07-10 | 5 | `real_dev/frontend` | Primeira execução `npm run test:unit -- AdminMetricsPage AdminPoolDashboardPage && npm run lint` | 1 | 4/5 testes: o browser simulado bloqueou corretamente o submit por `min/max`, pelo que o teste não atingiu a guarda defensiva do handler. Harness ajustado para submeter o formulário diretamente; lint não executou devido a `&&`. |
| 2026-07-10 | 5 | `real_dev/frontend` | Segunda execução focada de métricas/pool seguida de lint | 1 | 5/5 testes passaram; lint encontrou variável intermédia não usada em `AdminBiblicalPassagesPage.jsx`, ficheiro pertencente à subtarefa administrativa ainda em edição concorrente. Não foi mascarada nem alterada por esta fatia. |
| 2026-07-10 | 5 | repo | `npm install --save-dev @axe-core/playwright@4.10.2` no sandbox | 1 | Rede bloqueada com `ENOTFOUND registry.npmjs.org`; nenhum pacote instalado. |
| 2026-07-10 | 5 | repo | Repetição autorizada da instalação Axe no root | 1 | A cache npm global contém ficheiros de `root` e devolveu `EACCES`; não se alteraram permissões nem se usou `sudo`. |
| 2026-07-10 | 5 | repo | Repetição com `--cache /tmp/faithflix-npm-cache` no root | 1 | `node_modules/` e `package-lock.json` do root também pertencem a `root`; instalação recusada em `node_modules/fsevents`. O root não foi forçado nem reapropriado. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm install --save-dev @axe-core/playwright@4.10.2 --cache /tmp/faithflix-npm-cache` | 0 | Três pacotes de desenvolvimento adicionados ao pacote privado gravável; audit npm reportou 0 vulnerabilidades. |
| 2026-07-10 | 5 | `real_dev/frontend` | Primeira validação admin após a retoma | 1 | Testes passaram, mas ESLint recusou sincronização de ref durante render (`react-hooks/refs`); implementação corrigida para atualizar o ref apenas no event handler. |
| 2026-07-10 | 5 | `real_dev/frontend` | Testes das quatro páginas admin; `adminActionApis`; lint completo; trailing whitespace | 0 | 12/12 páginas e 2/2 contratos API; ESLint sem warnings. Scan whitespace terminou exit 1 esperado, com zero ocorrências. |
| 2026-07-10 | 5 | `real_dev/frontend` | Primeira suite focada privacy/discovery | 1 | 15/16; `getByText("Filme")` era ambíguo entre hero e carousel. Matcher restringido a `.home-hero-meta`, sem reduzir a expectativa funcional. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- PrivacyConsentsPanel PrivacyExportPanel RelatedContent DiscoveryHomePage privacyDiscoveryApis && npm run lint` | 0 | 5 ficheiros/16 testes: abort/stale/retry/rollback/busy, media pending, sessão indisponível, PT-PT e lazy images; ESLint sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | Scan de trailing whitespace privacy/discovery | 1 | Zero matches; exit 1 é o resultado esperado do `rg`. |
| 2026-07-10 | 5 | repo | `node --check` na config/spec Axe; `playwright --config=playwright.a11y.config.js --list` | 0 | 13 testes descobertos: quatro viewports, três rotas públicas, quatro autenticadas, teclado móvel e reflow equivalente a 200%; nenhum servidor/browser/DB arrancou nesta descoberta. |
| 2026-07-10 | 5 | repo | Primeira execução `npm run test:a11y` no sandbox | 1 | Build verde; preview recusado apenas por `listen EPERM 127.0.0.1:5183`. Nenhum browser/backend/DB/seed foi executado. |
| 2026-07-10 | 5 | repo | Primeira matriz Axe fora do sandbox | 1 | 9/13 passaram. Axe encontrou `color-contrast` serious real no kicker do hero em 390x844, 768x900, 1280x720 e 1440x900: 1,27:1. A regra/expectativa não foi desativada; CSS corrigido. |
| 2026-07-10 | 5 | repo | `npm run test:a11y` fora do sandbox após correção | 0 | 13/13 em Chromium: Axe sem violações serious/critical nas rotas cobertas; quatro viewports sem page overflow; menu Escape/foco, header <=72 px e reflow equivalente a 200% verdes. API/media foram intercetadas, rede externa zero, sem backend/DB/seed. Build: JS inicial 61,90 kB gzip, CSS 5,37 kB gzip e logo 19,91 kB. |
| 2026-07-10 | 5 | `real_dev/frontend` | Primeira `VITE_API_BASE_URL=https://api.faithflix.test npm run validate` F5 | 1 | Lint verde e 45 ficheiros/164 testes unitários passaram; Vitest tentou ainda importar o único spec Playwright em `tests/a11y` e recusou `test()` do runner diferente. Config corrigida com exclusão explícita; build não executou devido a `&&`. |
| 2026-07-10 | 5 | `real_dev/backend` | `node --check` nos 30 ficheiros F5 backend | 0 | Sintaxe válida em todos os módulos/testes alterados. |
| 2026-07-10 | 5 | `real_dev/backend` | Testes focados `f5-validation-pagination` e playback | 0 | 16/16: inputs fechados, paginação/metadata/ordem estável e regressão playback; apenas doubles locais, sem DB/rede. |
| 2026-07-10 | 5 | `real_dev/backend` | `node --test tests/unit/*.test.js` | 0 | 160/160 unitários, zero fail/skip/cancel; nenhuma DB configurada, seed, E2E ou migração. |
| 2026-07-10 | 5 | `real_dev/backend` | Scan de trailing whitespace nos artefactos F5 | 1 | Zero matches; exit 1 esperado do `rg`. |
| 2026-07-10 | 5 | `real_dev/frontend` | Segunda `VITE_API_BASE_URL=https://api.faithflix.test npm run validate` F5 | 0 | ESLint verde; 45 ficheiros/164 testes; build production verde. JS inicial 61,90 kB gzip, CSS 5,37 kB gzip, logo 19,91 kB; adapters media permanecem lazy. |
| 2026-07-10 | 5 | repo | Tentativa direta de Playwright home após um build production | 1 | 0/4 por harness: o `dist` tinha `VITE_API_BASE_URL=https://api.faithflix.test`, fora da rota local intercetada, e o hero ficou sem fixture. Confirmou que o comando direto não é autónomo; o script canónico `test:a11y` reconstrói obrigatoriamente em mode test. |
| 2026-07-10 | 5 | repo | `npm run test:a11y` completo com screenshots finais | 0 | 13/13 novamente; gerou screenshots full-page em `/tmp` para 390x844, 768x900, 1280x720 e 1440x900. Inspeção visual confirmou header fechado, CTA pending, grelhas/footer legíveis e ausência de corte/overflow nas quatro resoluções. |
| 2026-07-10 | 5 | `real_dev/backend` | Primeira `npm test` acumulada F5 fora do sandbox | 1 | 190/191; única falha era regressão textual no teste MF6: esperava `/Limite invalido/`, helper novo devolvia `Limite maximo: 24.`. Todas as restantes suites HTTP/unit passaram; mensagem compatibilizada sem reduzir validação. |
| 2026-07-10 | 5 | `real_dev/backend` | Segunda `npm test` acumulada F5 fora do sandbox | 0 | 191/191, zero fail/skip/cancel; HTTP apenas em loopback e persistência por doubles/in-memory, sem DB configurada, seeds ou migrações. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- SubscriptionPage subscriptionApis && npm run lint` | 0 | 2 ficheiros/7 testes: sinal comum/cancelamento, header idempotente fora do payload, retry com a mesma chave, reload canónico, confirmação e IDs codificados; ESLint completo sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- AccountPage ResilientReadPages && npm run lint` | 0 | 2 ficheiros/7 testes: retry e cancelamento em conta, recomendações, associações públicas e histórico privado; ESLint completo sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm ls @axe-core/playwright --depth=0 && npm audit --omit=dev --json` no sandbox | 1 | Instalação exata 4.10.2 confirmada; audit não contactou o registry por `ENOTFOUND`, sem produzir resultado de vulnerabilidades. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm audit --omit=dev --json --cache /tmp/faithflix-npm-cache` fora do sandbox | 0 | Zero vulnerabilidades runtime: 0 info/low/moderate/high/critical. |
| 2026-07-10 | 5 | repo | Validador, fences, `git diff --check`, trailing whitespace e scan de paths privados após sincronização RF/RNF/MF2/MF3 | 0 | `PASS`: 66 BKs e 66 guias; fences equilibradas, diff limpo, zero whitespace final e zero path privado nos guias públicos alterados. |
| 2026-07-10 | 5 | repo | Validador, fences, estados, `git diff --check` e scans após sincronização administrativa/privacidade MF4/MF5/MF9 | 0 | `PASS`: 66/66; 19 documentos com fences equilibradas, zero whitespace/path privado/`apps/*`, diff global limpo e os 16 guias alterados permanecem `TODO`. |
| 2026-07-10 | 5 | repo | Revalidação documental combinada: validador, `git diff --check`, trailing whitespace e paths privados/`apps/*` em todos os 66 guias | 0 | Estado agregado `PASS`: 66 BKs/66 guias, diff limpo; os dois `rg` terminaram com exit 1 esperado por zero ocorrências. |
| 2026-07-10 | 5 | `real_dev/frontend` | Primeira suite focada residual de catálogo/search/detalhe/subscrição/conta/APIs | 1 | 33/34: o retry da pesquisa não disparava porque `reloadVersion` ficou por lapso na dependência do efeito do formulário; causa corrigida sem reduzir a expectativa. |
| 2026-07-10 | 5 | `real_dev/frontend` | Repetição da suite focada residual | 0 | 8 ficheiros/34 testes: abort/retry/anti-stale, sessão indisponível, encoding de IDs/slugs, serialização/cancelamento de conta e fallbacks PT-PT verdes. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run lint` após a correção residual | 0 | ESLint completo sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | Scan de trailing whitespace nos 17 ficheiros residuais | 1 | Zero ocorrências; exit 1 é o resultado esperado do `rg` sem matches. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run lint` antes dos testes focados de catálogo admin | 0 | ESLint completo verde após o patch funcional inicial. |
| 2026-07-10 | 5 | `real_dev/frontend` | Primeira `npm run test:unit -- AdminCatalogPage` após adicionar sinais às mutações | 1 | 1/4 passou; três testes legacy esperavam aridade exata e não aceitavam o novo argumento opcional `{ signal }`. Falha exclusiva do harness, sem rede ou backend. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- AdminCatalogPage` final | 0 | 8/8 comportamentais: CAS/media pending, abort/epoch anti-stale em páginas e revisões, cleanup no unmount/seleção, confirmação, busy por linha e labels PT-PT. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run lint` final da fatia catálogo admin | 0 | ESLint completo sem warnings depois dos testes novos. |
| 2026-07-10 | 5 | repo | `rg` de trailing whitespace nos três artefactos catálogo admin e report; `git diff --check --` report | 1/0 | `rg` terminou com exit 1 esperado por zero ocorrências; o diff do report terminou limpo. |
| 2026-07-10 | 5 | `real_dev/backend` | Probe inline de coerções antes/depois da correção strict-input | 0 | Antes, os sete casos indevidos ficaram `ACCEPTED`; depois, catálogo/status/filtros/query/rating/progresso ficaram todos `REJECTED`. Exit 0 corresponde ao harness; o conteúdo das sete asserções é a prova. |
| 2026-07-10 | 5 | `real_dev/backend` | `node --check` em todos os validators e testes strict-input/MF3/MF10 | 0 | Sintaxe verde e os três ficheiros de teste passaram. |
| 2026-07-10 | 5 | `real_dev/backend` | Suite focada strict-input, paginação e validações MF2/MF3/MF4/MF5/MF10 | 0 | 52/52 negativos/contratos passaram, sem DB/rede. |
| 2026-07-10 | 5 | `real_dev/backend` | `node --test tests/unit/*.test.js` após strict-input | 0 | 165/165 unitários, zero fail/skip/cancel e sem DB/rede. |
| 2026-07-10 | 5 | `real_dev/backend` | Scan de `String(`/`Number(` em `*validation.js` e trailing whitespace | 1 | Zero coerções genéricas remanescentes; apenas `Number.parseInt` após regex do mês. O scan de whitespace terminou também sem ocorrências. |
| 2026-07-10 | 5 | repo | Primeira tentativa de scan shell de interpolações frontend | 1 | Padrão zsh mal escapado (`bad pattern`); não produziu alteração nem conclusão e foi substituído por pesquisa literal segura. |
| 2026-07-10 | 5 | repo | `rg -n -F '${' real_dev/frontend/src --glob '*.{js,jsx}'` | 0 | Inventário literal identificou quatro rotas dinâmicas ainda sem encoding e uma imagem editorial sem lazy loading; todos foram corrigidos e cobertos. |
| 2026-07-10 | 5 | `real_dev/frontend` | Primeira suite focada de encoding/lazy | 1 | 13/15; duas expectativas usavam nomes acessíveis incorretos, enquanto os hrefs renderizados já estavam codificados. Harness corrigido sem reduzir a expectativa. |
| 2026-07-10 | 5 | `real_dev/frontend` | Segunda suite focada de encoding/lazy | 1 | 25/26; o teste encontrou a imagem lazy correta no DOM, mas aguardava texto repartido por nós. Matcher ajustado ao link acessível. |
| 2026-07-10 | 5 | `real_dev/frontend` | Suite focada final de encoding/lazy | 0 | 6 ficheiros/26 testes: encoding de links em continue-watching/discovery/biblioteca, abort/retry existentes e imagem editorial lazy verdes. |
| 2026-07-10 | 5 | `real_dev/backend` | `npm test` acumulado após strict-input | 0 | 196/196, zero fail/skip/cancel; HTTP apenas em loopback e persistência por doubles/in-memory, sem DB configurada, seeds ou migrações. `FF-AUD-017` fica validado localmente. |
| 2026-07-10 | 5 | `real_dev/frontend` | `VITE_API_BASE_URL=https://api.faithflix.test npm run validate` acumulado | 0 | ESLint verde; 50 ficheiros/195 testes; build production verde. JS inicial 61,90 kB gzip, CSS 5,37 kB gzip e logo 19,91 kB; HLS/DASH continuam lazy, com warnings de ESM/chunks apenas nos adapters fora do bundle inicial. |
| 2026-07-10 | 5 | repo | `npm run test:a11y` após todas as correções F5 | 0 | 13/13 em Chromium: zero violações Axe serious/critical nas rotas cobertas, quatro viewports sem overflow, teclado/menu/foco e reflow equivalente a 200% verdes; API local intercetada, rede externa zero, sem backend/DB/seed. |
| 2026-07-10 | 5 | repo | `npm run check:media` | 0 | Fixtures MP4/HLS/DASH locais preservam checksums válidos e zero URL externa. |
| 2026-07-10 | 5 | repo | `npm run test:media:browser` após todas as correções F5 | 0 | 9/9: progressive/HLS/DASH atingiram `canplay` em Chromium/Firefox/WebKit; preview/API/media isolados, rede externa zero e sem backend, DB, seed ou media real. |
| 2026-07-10 | 5 | repo | Scan de trailing whitespace em `real_dev/backend` e `real_dev/frontend` source/tests | 1 | Zero ocorrências; exit 1 é o resultado esperado do `rg` sem matches. |
| 2026-07-10 | 5 | `real_dev/frontend` | Testes focados usados na sincronização documental residual | 0 | 6 ficheiros/25 testes então selecionados passaram; a suite acumulada posterior de 195 testes é a prova final de código. |
| 2026-07-10 | 5 | repo | Validador, fences, whitespace, paths privados/`apps/*`, estados e `git diff --check` após adendos F5 finais | 0 | 66/66 BK/guias, fences equilibradas e diff limpo; os três scans sem ocorrências terminaram com exit 1 esperado. Estados existentes, incluindo MF3 já `DONE`, não foram alterados. |
| 2026-07-10 | 5 | repo | Revalidação combinada final: validador, `git diff --check`, trailing whitespace e paths privados/`apps/*` | 0 | 66/66 BK/guias e diff limpo; ambos os `rg` terminaram com exit 1 esperado por zero ocorrências. |
| 2026-07-10 | 5 | repo | Primeira tentativa do verificador inline de fences após sincronização final | 1 | Erro de quoting shell `unmatched \"`; não produziu conclusão nem alteração. |
| 2026-07-10 | 5 | repo | Verificador Node corrigido de fences em todos os Markdown de `docs` | 0 | `fences_ok=154`; nenhum fence desequilibrado. |
| 2026-07-10 | 5 | repo | Inventário estático de `<img` no frontend | 0 | Confirmou lazy loading abaixo do destaque; hero, detalhe e logo permanecem eager por estarem acima da dobra. |
| 2026-07-10 | 5 | repo | Primeira tentativa de patch da race final do editor admin | 1 | Contexto já tinha mudado pela remoção concorrente do input backdrop duplicado; `apply_patch` recusou atomicamente e nenhum hunk foi aplicado. Patch foi repartido contra o estado atual. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run test:unit -- AdminCatalogPage` após serialização final do editor | 0 | 10/10: submit editorial exclusivo, fieldset/Editar bloqueados, status de outra linha independente, página atual preservada, conflito alheio não apaga formulário e input backdrop único. |
| 2026-07-10 | 5 | `real_dev/frontend` | `npm run lint` após serialização final do editor | 0 | ESLint completo sem warnings. |
| 2026-07-10 | 5 | `real_dev/frontend` | `VITE_API_BASE_URL=https://api.faithflix.test npm run validate` após a race final | 0 | ESLint verde; 50 ficheiros/197 testes; build production verde. JS inicial 61,90 kB gzip, CSS 5,38 kB gzip e logo 19,91 kB; adapters media continuam lazy. |
| 2026-07-10 | 5 | repo | `npm run test:a11y` final, incluindo `/admin/catalogo` | 0 | 14/14 em Chromium: zero violações Axe serious/critical nas rotas cobertas, quatro viewports sem overflow, reflow/teclado/foco e formulário admin verdes; rede externa zero, sem backend/DB/seed. |
| 2026-07-10 | 5 | repo | Validador, `git diff --check` e trailing whitespace finais de CP5 | 0 | 66/66 BK/guias e diff limpo; `rg` terminou com exit 1 esperado por zero ocorrências no report e source/tests privados. |
| 2026-07-10 | 5 | `real_dev/frontend` | Revisão independente final e repetição `npm run test:unit -- AdminCatalogPage` | 0 | 10/10; confirmou reserva atómica, fieldset/Editar bloqueados, reset condicionado por epoch, conflito alheio preservado, página atual e input backdrop único. Recomendou `FF-AUD-015`/`CP5` validados. |
| 2026-07-10 | 6 | repo | `command -v mongodump`; `command -v mongorestore`; `command -v node` | 1/1/0 | MongoDB Database Tools não estão instaladas/encontráveis no `PATH`; Node está disponível. A execução real de backup/restore fica `BLOQUEADO_AMBIENTE`, sem tentar ligar a qualquer DB. |
| 2026-07-10 | 6 | repo | `mkdir -p docs/runbooks` | 0 | Criada apenas a pasta documental para os runbooks locais; nenhuma operação de sistema/DB foi executada. |
| 2026-07-10 | 6 | `real_dev/backend` | `node --check` inicial nos 4 ficheiros shutdown/env | 0 | Sintaxe válida antes dos testes focados. |
| 2026-07-10 | 6 | `real_dev/backend` | Sintaxe e testes focados env/shutdown/worker | 0 | 11/11 com fakes/in-memory: variáveis de produção, ordem/timeout/idempotência e sinais rotulados; sem sockets, DB ou worker real. |
| 2026-07-10 | 6 | `real_dev/backend` | `node --test tests/unit/*.test.js` após shutdown/env | 0 | 181/181 unitários, zero fail/skip/cancel; nenhum servidor principal, DB, worker, seed, E2E ou migração. |
| 2026-07-10 | 6 | `real_dev/backend` | Sintaxe final nos 7 ficheiros e scan de trailing whitespace | 0/1 | Sintaxe verde; `rg` terminou com exit 1 esperado por zero ocorrências. |
| 2026-07-10 | 6 | `real_dev/backend` | `node --check` nos 3 scripts database-tools e execução `--help` dos dois CLIs | 0 | Sintaxe/contratos CLI verdes; nenhum `mongodump`, `mongorestore` ou MongoDB foi executado. |
| 2026-07-10 | 6 | `real_dev/backend` | Teste focado `database-tools-safety.test.js` | 0 | 10/10 com doubles: guards, config 0600, args sem URI, archive/checksum/inventário, target interno, ownership/cleanup e `DATABASE_TOOL_UNAVAILABLE`. |
| 2026-07-10 | 6 | `real_dev/backend` | Scan final de whitespace dos scripts/teste | 0 | Verificação do agente terminou sem ocorrências. |
| 2026-07-10 | 6 | repo e `real_dev/backend` | Releitura do report e inspeção estática de env, health, shutdown, worker, database tools, arquitetura e runbooks | 0 | Contratos revistos sem arrancar API/worker, sem executar tools e sem tocar em DB; identificadas apenas duas imprecisões documentais locais, corrigidas no mesmo turno. |
| 2026-07-10 | 6 | `real_dev/backend` | `npm test --` seis suites focadas de health/env/shutdown/worker/database-tools | 0 | 30/30: live 200 sem DB, ready/alias 503 seguros e deadline 500 ms; produção fail-closed; fechos idempotentes; backup/restore protegidos. Apenas loopback e doubles/in-memory, sem MongoDB real nem tools. |
| 2026-07-10 | 6 | `real_dev/backend` | `npm test` acumulado F6 | 0 | 227/227, zero fail/skip/cancel; HTTP apenas em loopback e persistência por doubles/in-memory. Nenhum servidor principal, worker, seed, migração, MongoDB configurado ou Database Tool foi executado. |
| 2026-07-10 | 6 | repo | Validação documental F6 do agente: validador, fences, `git diff --check`, whitespace, paths e links | 0 | 66/66 BK/guias, 160 Markdown com fences equilibradas, diff limpo, zero whitespace/path privado/`apps/*` no runbook MF9 e todos os links arquitetura/runbooks existentes. |
| 2026-07-10 | 6 | `real_dev/backend` | Revisão independente read-only F6 e 21 testes focados | 0 | Encontrou P1 em `NODE_ENV` desconhecido e P2 no environment herdado pelas Database Tools; não encontrou outros P0/P1/P2 e confirmou cleanup ownership/falsas alegações ausentes. Findings corrigidos no mesmo turno. |
| 2026-07-10 | 6 | `real_dev/backend` | `node --check` e testes focados env/database-tools após revisão independente | 0 | 16/16: ambientes desconhecidos falham sem revelar valores e o subprocesso preserva apenas `PATH/LANG` allowlisted no double, excluindo URI normal/dedicada e `NODE_OPTIONS`; sem DB/tool/socket. |
| 2026-07-10 | 6 | `real_dev/backend` | `node --check` health e `node --test tests/unit/health-readiness.test.js` pelo agente | 0 | Sete ficheiros com sintaxe válida e 4/4 unitários; sem sockets/DB real. |
| 2026-07-10 | 6 | `real_dev/backend` | Primeira execução integration/smoke health no sandbox | 1 | 0/13 por `listen EPERM 127.0.0.1`; bloqueio exclusivo do sandbox. Repetição escalada do agente foi interrompida pelo utilizador, sem resultado reutilizado. A prova atual válida é a execução principal posterior 30/30 e 227/227. |
| 2026-07-10 | 6 | `real_dev/backend` e repo | Revalidação paralela final: `npm test`, validador, `git diff --check` e `node --check` em dez artefactos F6 | 0 | 228/228 backend, 66/66 BK/guias, diff limpo e sintaxe verde depois das duas correções da revisão independente. |
| 2026-07-10 | 6 | repo | Scan final de trailing whitespace e `git check-ignore -v real_dev real_dev/backend real_dev/frontend` | 1/0 | `rg` exit 1 esperado por zero ocorrências; os três paths privados continuam ignorados por `.gitignore:2`. |
| 2026-07-10 | 6 | repo | Primeira tentativa do checker Node de fences F6 | 1 | Quoting shell incorreto (`unmatched \"`); não alterou ficheiros nem produziu conclusão. |
| 2026-07-10 | 6 | repo | Checker Node de fences corrigido sobre `docs/**/*.md` | 0 | `fences_ok=158`; nenhum Markdown documental com fence desequilibrado. |
| 2026-07-10 | 7 | repo | Inventário F7 de paths/evidence/media/status antes da correção | 0/1 | Encontrou 24 documentos com alias privado legacy, 6 evidence com comandos nas pastas dos alunos, 12 documentos candidatos a alegações media excessivas e 6 estados da matriz promovidos pela referência; zero `apps/backend|frontend` nos guias públicos (exit 1 esperado). |
| 2026-07-10 | 7 | repo | Inventário read-only de planificação, matriz, sprints, MF views, templates, specs E2E, sessão, MF4 e scanners | 0/2 | Mapeou o canon e drifts para os três agentes F7; um `rg` devolveu exit 2 apenas porque `docs/evidence/MF4` não existe. Nenhum ficheiro/DB/processo foi alterado por estes scans. |
| 2026-07-10 | 7 | repo | Leitura de engines e versões locais | 0 | Backend exige Node >=20, frontend `^20.19 || >=22.13`; ambiente usa Node 24.11.1/npm 11.6.2. |
| 2026-07-10 | 7 | repo | Sintaxe e testes de contrato locais do harness | 0 | 5/5: guard, três engines, `reuseExistingServer:false`, comandos sem URI/watcher/seed e manifest das dez áreas sem estados falsos; sem build, browser, servidor ou DB. |
| 2026-07-10 | 7 | repo | Primeira `npm run test:contracts` F7 | 0 | Root 5/5 e backend 12/12; frontend terminou com `passWithNoTests`. O no-op foi detetado na revisão principal e reaberto para executar uma seleção API real. |
| 2026-07-10 | 7 | repo | `npm run test:contracts` após remover o no-op frontend | 0 | Root harness 5/5, backend media/playback 12/12 e frontend API 6 ficheiros/21 testes; zero skips/no-tests, DB, servidores ou browser. |
| 2026-07-10 | 7 | repo | `npm run lint`; negativo `npm run test:e2e` sem env; `git diff --check`/whitespace | 0/1/0 | Lint verde; E2E recusado pelo guard antes de build/servidores com exit 1 esperado; diff/whitespace limpos. Nenhum seed, E2E funcional ou DB executado. |
| 2026-07-10 | 7 | repo | Primeiras execuções do validador ampliado | 1 | Diagnóstico histórico: parser inicial partiu `|` dentro de code span; segunda versão agregou apenas a tabela MF0 (6 BK). Ambos foram corrigidos sem relaxar regras. O primeiro passe completo de 66 BK revelou 63 drifts documentais reais. |
| 2026-07-10 | 7 | repo | Passes intermédios do validador após correções docs/regras canónicas | 1 | 63→32→0: foi removida a regra fora de scope `core_or_reforco`; anexos RF/RNF passaram a superset de cobertura complementar, mantendo BKs primários/declarações obrigatórios. |
| 2026-07-10 | 7 | repo | `bash scripts/validate-planificacao.sh` final da fatia validator | 0 | PASS: 66 BK, 66 guias, 94 requisitos, 10 MF views, 29 evidence ativas e zero erros. |
| 2026-07-10 | 7 | repo | `python3 scripts/test_validate_planificacao_negatives.py` | 0 | Baseline verde e oito cópias temporárias rejeitadas deliberadamente por estado, sprint, próximo BK, matriz, MF views, path privado, placeholder ativo e comando oficial. |
| 2026-07-10 | 7 | repo | `py_compile`, CLI texto, `git diff --check` dos scripts e trailing whitespace | 0/1 | Sintaxe/CLI/diff verdes; `rg` exit 1 esperado por zero whitespace. `ruff` não está instalado (exit 1) e não foi acrescentado como dependência. |
| 2026-07-10 | 7 | repo | Validação documental final do agente: validador, fences, paths, placeholders, claims e diff docs | 0/1 | PASS 66/66, 94 requisitos, 10 MF views e 29 evidence; 160 Markdown equilibrados; zero paths privados/apps nos guias, placeholders fora do arquivo, claims media ativos ou whitespace. `rg` exit 1 esperado por zero matches. |
| 2026-07-10 | 7 | repo | Diagnósticos documentais intermédios | 1 | Um `rg` teve quoting inválido e dois `apply_patch` recusaram contexto atomicamente; nenhum hunk parcial foi aplicado. O primeiro validador ampliado revelou os drifts corrigidos. |
| 2026-07-10 | 7 | repo | Primeira `npm run test:security` no sandbox | 1 | 8/10; os dois HTTP falharam exclusivamente com `listen EPERM 127.0.0.1`, antes do scanner. Nenhuma regressão funcional concluída a partir desta execução. |
| 2026-07-10 | 7 | repo | Repetição `npm run test:security` fora do sandbox antes de limitar o scanner | 1 | 10/10 testes passaram; scanner encontrou cinco falsos positivos em `*.test.*` colocados em frontend `src` (fixtures de URI/token), revelando scope incorreto do scanner. |
| 2026-07-10 | 7 | `real_dev/backend` | Sintaxe e scanner runtime após exclusão explícita de testes | 0 | `Hardening MF6: PASS`; o scan continua a cobrir todo o source runtime backend/frontend. |
| 2026-07-10 | 7 | repo | `npm run test:security` final fora do sandbox | 0 | 10/10 segurança HTTP/unit + `Hardening MF6: PASS`; apenas loopback e doubles/in-memory, sem DB/seed/migração/rede externa. |
| 2026-07-10 | 7 | `scripts/validate_planificacao_canonica.py`, negativos e report canónico | 0 | Revisão principal fechou um false-negative residual: cada anexo exige o namespace `RF` ou `RNF` correto. Validador PASS 66/66/94/10/29; nove mutações temporárias rejeitadas; contrato E2E 5/5; diff e whitespace limpos. |
| 2026-07-10 | 7 | repo | `npm run validate` fora do sandbox, sem E2E funcional | 0 | Docs 66/66/94/10/29; lint; backend unit 192/192 e integração 18/18; frontend 50 ficheiros/197; contratos root 5/5, backend 12/12 e frontend 21/21; segurança 10/10 + scanner; build com JS inicial 61,90 kB gzip/CSS 5,38 kB; fixtures media válidas. Apenas sockets HTTP loopback e doubles/in-memory, sem DB/seed/migração/browser. |
| 2026-07-10 | 7 | guard/harness, validador e evidence MF8 | Em curso | Revisão independente encontrou bypass por `proxyHost`, seis contextos browser sem policy de rede, anexo que aceitava BK excedente e frase errada sobre paths dos alunos. As quatro causas foram corrigidas; revalidação e revisão final ainda pendentes. |
| 2026-07-10 | 7 | `real_dev/backend/scripts/seed-safety.js` e teste | Em curso | Revisão independente demonstrou que o guard original dos seeds aceitava host externo, ausência de replica set e nomes operacionais terminados em `_e2e`. O seed passou a reutilizar o guard Mongo comum fail-closed; testes e suite acumulada ainda pendentes. Nenhum seed/DB foi executado. |
| 2026-07-10 | 7 | validador e negativos | Em curso | A mesma revisão provou dois false-negatives: path privado em maiúsculas e `core_or_reforco` incoerente com a prioridade. A regex ficou case-insensitive e a derivação `P0 => Reforco`, `P1/P2 => Core` passou a ser validada no guia e anexo; revalidação pendente. |
| 2026-07-10 | 7 | env/server formal, arquitetura e runbook | Em curso | Revisão independente confirmou que `listen(port)` aceitava interfaces não-loopback. A API usa agora `env.host`, default local `127.0.0.1`, allowlist fechada e `HOST` obrigatório em produção; o harness formal fixa loopback. Revalidação pendente. |
| 2026-07-10 | 7 | `seed-safety.js` e seeds MF2/MF4/MF9 | Em curso | Revisão independente encontrou deletes por IDs/emails/mês/regex. Foi criado cleanup comum em duas passagens: pré-valida todas as colisões antes da primeira escrita e só depois elimina pelo marcador exato. Migração dos três seeds e revalidação ainda em curso; nenhum seed/DB executado. |
| 2026-07-10 | 7 | harness formal e validador público/wrapper | Em curso | O guard recusa agora `PUBLISH_EVIDENCE=true`; paths privados são verificados case-insensitive em todos os Markdown `MF*`, incluindo runbook e alias histórico; o wrapper oficial exige conteúdo executável exato, impedindo comandos adicionais antes do validador. Revalidação pendente. |
| 2026-07-10 | 7 | repo e `real_dev/backend` | Primeira validação após hardening independente | 1/0/0 | Validador fez fail correto em quatro drifts reais `core_or_reforco` MF1-01..04; contrato harness 5/5, guards seed/env 16/16 e sintaxe de dez ficheiros passaram. Os quatro headers P0 foram sincronizados para `Reforco`; nova prova pendente. |
| 2026-07-10 | 7 | repo | Validador/negativos/contrato/diff após correções independentes | 0 | PASS 66/66/94/10/29; 13/13 drifts temporários rejeitados; harness 5/5; `git diff --check` e whitespace limpos. Inclui paths em maiúsculas/runbook, wrapper extra, namespaces/anexos exatos e lane pedagógica. |
| 2026-07-10 | 7 | repo | Primeira `npm run validate` após migração do cleanup | 1 | Docs/lint passaram; backend unit ficou 195/196 porque um teste estático ainda exigia o nome do helper antigo. A asserção foi atualizada para o helper comum e continua a proibir qualquer `deleteMany` direto no seed MF2. As etapas seguintes não arrancaram devido ao `&&`; sem DB/E2E/seed. |
| 2026-07-10 | 7 | `real_dev/backend` e repo | Regressão do cleanup após atualizar o contrato estático | 0 | Focados 23/23 e backend unit 196/196; scan confirmou zero `deleteMany`/`deleteByAny` nos três seeds e uso do helper two-pass comum. Nenhum seed ou ligação MongoDB foi executado. |
| 2026-07-10 | 7 | runbook MF9 | N/A | Sincronizados `HOST` obrigatório em produção e limite de rerun: após um fluxo real, documentos sem marcador fazem o seed abortar; usar DB `_e2e` nova por execução até existir propagação de run ID. Isto mantém `FF-AUD-001` não validado sem inventar idempotência pós-E2E. |
| 2026-07-10 | 7 | repo | Segunda `npm run validate` após hardening | 1 | Docs e backend unit 196/196 passaram; frontend ficou 196/197 por flake: `findByTestId` encontrava imediatamente o nó já existente em `loading`. Quatro transições de sessão passaram a usar `waitFor` sobre o estado esperado. Integração/contratos/segurança/build/media não arrancaram devido ao `&&`. |
| 2026-07-10 | 7 | `real_dev/frontend` | Três repetições focadas `SessionContext` após corrigir a espera | 0 | 5/5 em cada repetição (15 execuções); as quatro transições aguardam agora o estado final observado em vez da mera existência do nó. |
| 2026-07-10 | 7 | repo | `npm run validate` final fora do sandbox | 0 | Docs 66/66/94/10/29; lint; backend unit 196/196 e integração 18/18; frontend 50 ficheiros/197; contratos root 5/5, backend 12/12 e frontend 21/21; segurança 10/10 + scanner; build com JS inicial 61,90 kB gzip/CSS 5,38 kB; fixtures media válidas. Sem seed/E2E/migração/DB real. |
| 2026-07-10 | 7 | repo | Revisão independente final read-only | 0 | Zero P0/P1 residual na F7; um P2 confirmado: rerun `seed -> E2E -> seed` na mesma DB aborta por documentos de domínio sem marcador. HTML report confirmado ignored/untracked. `FF-AUD-001/019` permanecem bloqueados. |
| 2026-07-10 | 9/D2-D4 | repo | `git diff --check` focado e scan de snippets/boilerplate após primeiro lote documental | 0 | Diff focado limpo e matriz sem boilerplate; scan encontrou uma duplicação financeira adicional em `BK-MF4-08`, mantida aberta para correção antes de fechar `FF-DOC-013`. Nenhuma DB/seed/E2E/migração/servidor. |
| 2026-07-10 | 9/D0-D1-D5 | repo | Validador, manifests públicos, scans de paths/E2E/metadata/template, fences/links/whitespace e `git diff --check` | 0 | PASS 66/66/94/10/30; zero path privado/Playwright direto/comando E2E inseguro no scope corrigido; 27 Markdown sem fence/link/whitespace partido. Sem DB/seed/E2E/browser/servidor/migração. |
| 2026-07-10 | 9/D6 | repo | `env PYTHONDONTWRITEBYTECODE=1 bash scripts/validate-planificacao.sh` | 1 | O validador endurecido verificou 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence e recusou corretamente 16 drifts ainda em correção: 14 contratos concorrentes em guias e 2 markers não autónomos. O resultado é diagnóstico intermédio, não prova de fecho; sem DB/E2E/servidor. |
| 2026-07-10 | 9/D6 | repo | `env PYTHONDONTWRITEBYTECODE=1 python3 -c "... compile(...) ..."` nos dois scripts | 0 | `syntax_ok=2`; validação puramente sintática após acrescentar URI loopback/sem credenciais, igualdade seed/browser e quatro negativos isolados. A suite completa aguarda baseline verde. |
| 2026-07-10 | 9/D3-D5 | repo | Checkers Node inline de tutorial-v2/contratos D3 e parser `@babel/parser` sobre os oito guias críticos | 0 | 8/8 guias com 16 headings e sete pontos por passo; contratos API/health/auth/catalog/media/RGPD/session/family verdes; 87 fences JS/JSX, 84 programas completos válidos e 3 fragmentos pedagógicos identificados. Sem DB/E2E/servidor. |
| 2026-07-10 | 9/D3-D5 | repo | `bash scripts/validate-planificacao.sh`; scans `rg`; `git diff --check -- <8 guias>` | 1/1/0 | O validador intermédio não encontrou erros nos oito guias e falhou apenas por dez contratos concorrentes então em correção noutros ficheiros; os scans sem ocorrências devolveram exit 1 esperado para paths privados, contratos concorrentes, mojibake e whitespace; diff focado limpo. |
| 2026-07-10 | 9/D5 | repo | Checker Python inline de links Markdown relativos em `README.md`, `ARCHITECTURE.md` e `docs/**/*.md` | 0 | 163 ficheiros analisados, excluindo URLs/anchors e conteúdo fenced; zero target relativo inexistente. Sem rede ou escrita. |
| 2026-07-10 | 9/D5 | repo | Scans `rg` de baseline `60/60`, linguagem `atual/final`, stack React/Next e associação `real_dev`/alunos | 0 | Ocorrências de 60 ficaram limitadas a changelogs, caveats ou snapshots datados; headings históricos foram convertidos para “observado”; React/Vite/fetch ficou baseline e Next.js/Axios opção futura; zero frase classifica `real_dev` como entrega dos alunos. |
| 2026-07-10 | 9/D4-D5 | repo | Checker Python inline dos comandos `npm --prefix` nos quatro runbooks REFERENCE e no runbook STUDENT contra os quatro manifests correspondentes | 0 | Cinco documentos, 14 comandos e zero script inexistente; comparação apenas estática, sem executar manifests, worker, backup, restore, servidor ou DB. |
| 2026-07-10 | 9/D5-D6 | repo | Checker Python inline de todos os números top-level por `### Passo N` nos 66 guias | 0 | 395 passos analisados; 17 passos MF1 ainda tinham pontos 8..13 apesar de conterem 1..7. O finding ficou aberto e a regex do validador passou a contar qualquer número, impedindo o falso verde. |
| 2026-07-10 | 9/D4-D5 | repo | Parse esbuild dos fences JS/JSX, `bash -n` dos fences shell, checker tutorial-v2 e scans focados nos quatro guias MF2 consolidados | 0/1 | 49/49 snippets JS/JSX e 27/27 Bash válidos; quatro guias com estrutura v2; zero contrato concorrente/path privado/whitespace (os scans sem match devolveram exit 1 esperado); `git diff --check` focado exit 0. O validador global ainda falhava apenas fora destes quatro. |
| 2026-07-10 | 9/D0-D6 | repo | Checker Python inline de templates Markdown de evidence dentro dos 66 guias | 0 | Encontrou 13 templates sem os cinco campos D0; 11 foram corrigidos no momento e dois encaminhados para o lote backend. O validador passou a detetar esta classe e ganhou negativo isolado. |
| 2026-07-10 | 9/D3 | repo | Inventário Python inline de imports locais nomeados versus definições nos 66 guias | 0 | 379 símbolos importados; 14 sem definição em qualquer tutorial, incluindo transação/audit/session/rate limit, `setDbForTests`, `buildLoginRedirectPath` e `DiscoveryCarousel`. As causas foram distribuídas pelos lotes de composição; este scan não fecha execução/sintaxe por si só. |
| 2026-07-10 | 9/D4-D5 | repo | Validador focado, parse Node/esbuild de fences e scans/diff nos nove guias MF3/MF4/MF5 consolidados | 0/1 | Zero erro do validador no scope; blocos JS e 15 JSX válidos; zero contrato concorrente/path privado/whitespace (exit 1 esperado nos `rg` sem match); `git diff --check` focado exit 0. O validador global continuava vermelho apenas por lotes MF1/MF6 concorrentes. |
| 2026-07-10 | 9/D5-D6 | repo | Checker Python inline dos comentários didáticos em 391 fences JS/JSX/TS/TSX | 0 | Encontrou 149 blocos que ainda não cumprem o limiar tutorial v2 (`>=8` linhas: 1 comentário; `>=20`: 2). O finding permanece aberto para lote próprio; o contrato não foi enfraquecido. |
| 2026-07-10 | 9/D5 | repo | Repetição focada do checker de comentários didáticos em `MF4` | 0 | `MF4_failures=0` depois de corrigir cinco fences; restantes macrofases continuam abertas para lotes próprios. |
| 2026-07-10 | 9/D3-D6 | repo | `env PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_planificacao_canonica.py --project faithflix --json` (checkpoint concorrente) | 1 | 66/66/94/10/30; 154 erros: 152 comentários didáticos, um template evidence MF6 ainda atribuído e um marker media durante edição MF2-06. Já não havia erro de headings/ordem/pontos/contratos concorrentes. Resultado intermédio, não fecho. |
| 2026-07-10 | 8 | repo, `real_dev/backend`, `real_dev/frontend` | `npm audit --json` nos três packages | 0 | Três audits atuais, todos com zero vulnerabilidades; nenhum pacote foi instalado ou alterado por estes comandos. |
| 2026-07-10 | 8 | `real_dev/backend` | `npm test` antes dos dois findings P1 da reauditoria | 0 | 232/232 testes, zero fail/skip; apenas doubles/in-memory e HTTP loopback, sem DB configurada. |
| 2026-07-10 | 8 | `real_dev/backend` | Suites focadas de transações, segurança, health e jobs | 0 | 76/76; fault injection, rate limiting, CSRF, readiness e worker validados apenas com doubles/in-memory. |
| 2026-07-10 | 8 | repo | `npm run test:a11y` | 0 | 14/14 cenários preview-only em Chromium; Axe/reflow/teclado sem backend, DB ou rede externa. Não substitui Safari/Chrome/Edge reais. |
| 2026-07-10 | 8 | repo | `npm run test:media:browser` | 0 | 9/9 em Chromium, Firefox e WebKit com MP4/HLS/DASH sintéticos e rede não-loopback bloqueada; não prova streaming, CDN, 4K ou carga reais. |
| 2026-07-10 | 8 | repo | Verificação de Database Tools, ignore privado, diff e whitespace | 0/1 | `mongodump`/`mongorestore` ausentes; `real_dev` continua ignorado; `git diff --check` limpo; `rg` de whitespace terminou exit 1 esperado por zero ocorrências. Restore real permanece bloqueado. |
| 2026-07-10 | 8 | `real_dev/backend` | Testes focados após allowlist pública e limite forgot-password por IP | 0 | 15/15 para catálogo público/playback/segurança HTTP; prova URLs `url`/`source.url` ausentes no público, preservadas no admin, e 10 pedidos/IP/h antes do limite 3/email. |
| 2026-07-10 | 8 | `real_dev/backend` | `npm test` após os dois findings P1 | 1 | 232/233. A implementação passou; uma regressão MF6 antiga tentou ler `tracks.subtitles` no DTO público agora estritamente allowlisted. O teste foi corrigido para exigir ausência total de campos/valores privados; revalidação pendente. |
| 2026-07-10 | 8 | `real_dev/backend` | `npm test -- tests/regression/mf6-backend-regression.test.js tests/unit/media-boundary.test.js tests/integration/security-http.test.js` | 0 | 13/13 após sincronizar a regressão: catálogo público sem campos/valores privados, catálogo admin com fontes preservadas, CSRF e limites cumulativos de recuperação verdes. Apenas HTTP loopback/doubles. |
| 2026-07-10 | 8 | `real_dev/backend` | `npm test` acumulado após correções F8 | 0 | 233/233, zero fail/skip/cancel. Inclui regressão, segurança, transações, fault injection, worker e health com doubles/in-memory e HTTP loopback; não executou MongoDB real, seed ou migração. |
| 2026-07-10 | 8 | repo | `npm run validate` acumulado antes das reaberturas finais FF006/FF009 | 0 | Docs 66/66/94/10/29; lint; unit/integration/frontend/contratos verdes; segurança 11/11 + scanner; build JS inicial 61,90 kB gzip e CSS 5,38 kB; fixtures media válidas. Esta prova precede as duas correções finais e não as fecha. |
| 2026-07-10 | 8 | `real_dev/backend` | `node --check` integrações/teste e `node --test tests/unit/f3-admin-transactions.test.js tests/unit/audit-service.test.js` | 0 | 10/10; sessão idêntica nas duas writes e rollback integral por fault injection, apenas com double transacional local. |
| 2026-07-10 | 8 | `real_dev/backend` | `npm run test:unit` após correção FF009 | 0 | 197/197; zero DB real, seed, E2E ou servidor. Scan de whitespace dos dois ficheiros terminou exit 1 esperado, sem ocorrências. |
| 2026-07-10 | 8 | `real_dev/backend` | Primeira execução `node --test auth-login-timing mf5-validation` | 1 | 9/10: apenas o teste detetou que a primeira constante dummy usava salt de 17 bytes, fora do formato canónico de 16 bytes. A constante foi corrigida; nenhuma regressão de autenticação foi aceite. |
| 2026-07-10 | 8 | `real_dev/backend` | Repetição auth timing; segurança focada; `npm run test:unit`; sintaxe/diff/scanner | 0 | 10/10, depois 18/18 e 199/199; `node --check`, `git diff --check` e `Hardening MF6: PASS`. Uma derivação observada em todos os caminhos, zero sessão dummy, sem DB/rede/seed/E2E. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe auth e `node --test auth-registration-transaction auth-login-timing security-controls mf5-validation` | 0 | 20/20; falha tardia da sessão deixa 0 users/0 sessions e sucesso usa a mesma sessão nas duas escritas. Apenas double local, sem DB/socket/seed/E2E. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe family e `node --test tests/unit/f3-family-transactions.test.js tests/unit/mf9-subscriptions.test.js` | 0 | 26/26; fault durante construção do overview deixa 0 membership/0 notificação e não avança `familyVersion`; restantes fluxos familiares mantêm concorrência/entitlements. Sem DB real. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe de 7 ficheiros; testes audit/billing/MF4/regressão MF6; `npm run test:unit`; diff/whitespace | 0 | 30/30 focados e 212/212 unitários; fault audit deixa zero ledger, session é idêntica, replay não duplica, ator inválido falha antes de writes e worker mantém 0 admin logs. Sem DB/seed/migração/E2E/rede. |
| 2026-07-10 | 8 | `real_dev/backend` | Testes bíblicos do agente e repetição principal após leituras sequenciais/`updatedBy` | 0 | Agente: 12/12 focados, 15/15 MF10+F5, 224/224 unitários. Principal: sintaxe e 27/27 focados; cinco fault injections revertem integralmente e link/unlink no-op não duplicam audit. Sem DB/socket. |
| 2026-07-10 | 8 | repo | Validador documental e negativos após sincronização F8 | 0 | PASS 66 BK/66 guias/94 requisitos/10 MF views/29 evidence; 13/13 classes de drift temporárias rejeitadas. As cópias negativas ficaram fora do workspace autoritativo. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe auth e testes `mf2-validation`, segurança, login timing e registo transacional após dummy reset | 0 | 19/19; existente/inexistente criam uma entrada TTL, apenas a real tem `userId`, dummy nunca autentica/consome, e login/registo mantêm os contratos F8. Sem DB/rede. |
| 2026-07-10 | 8 | `real_dev/backend` | Primeira validação fail-closed de sessão/subscrição | 1 | 35/36; o único fail era fixture MF4 legacy sem `planCode` nem plano ativo, agora incompatível com o contrato seguro. A fixture foi corrigida para plano Pro ativo e trial canónico; não se relaxou a implementação. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe de auth/session/subscriptions/billing/integrations e oito suites focadas | 0 | 67/67: sessão inactive/unknown eliminada; status/plano/trial incoerentes sem premium; owner bloqueado sem acesso familiar; billing recusa quatro estados indisponíveis; commit desconhecido de registo reconciliado; requestId de integração preservado. Sem DB/rede. |
| 2026-07-10 | 8 | `real_dev/backend` | Primeira tentativa da regressão MF8 administrativa expandida no sandbox | 1 | `listen EPERM 127.0.0.1` no hook antes de qualquer asserção; não constitui falha funcional nem prova útil. Sintaxe passou; repetição fora do sandbox pendente. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe de comentários e `node --test comments-transactions mf3-validation mf3-http-positive` fora do sandbox | 0 | 18/18; moderação/delete privilegiado propagam ator, `requestId` e sessão, rollback por falha de audit deixa zero alteração, owner delete não cria audit e RBAC HTTP existente permanece verde. Apenas doubles/loopback, sem DB real. |
| 2026-07-10 | 8 | `real_dev/backend` | `npm test -- tests/regression/mf8-admin-final-audit.test.js` fora do sandbox | 0 | 4/4; dez leituras e dezoito mutações privilegiadas recusam visitante/user comum com códigos e `requestId` correlacionados, sem alterações nos doubles; logs mínimos e contratos de paginação/media permanecem verdes. Esta regressão negativa não prova o sucesso funcional das mutações. |
| 2026-07-10 | 8 | repo | Validador documental e negativos após o adendo transacional de comentários | 0 | PASS 66 BK/66 guias/94 requisitos/10 MF views/29 evidence; 13/13 classes de drift rejeitadas em cópias temporárias isoladas. |
| 2026-07-10 | 8 | `real_dev/backend` | Primeira `npm test` acumulada após todas as correções F8 | 1 | 257/266; cinco contratos playback e três HTTP usavam subscrições/planos legacy agora recusados pela allowlist fail-closed, e o primeiro forgot-password devolveu 500. A falha ficou aberta para distinguir fixtures desatualizadas de regressão real; nenhuma DB configurada foi usada. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe e `npm test -- playback-contract playback-http security-http` após corrigir fixtures | 0 | 14/14; plano ativo permite apenas os cenários canónicos, pending/parental continuam fail-closed e 13 tokens dummy persistidos pelos pedidos aceites não têm `userId` nem email. Apenas doubles/loopback. |
| 2026-07-10 | 8 | `real_dev/backend` | Segunda `npm test` acumulada após todas as correções F8 | 0 | 266/266, zero fail/skip/cancel; inclui HTTP, RBAC, segurança, catálogo/playback, fault injection, sessão, família, jobs e shutdown. Persistência apenas por doubles/in-memory; nenhuma DB configurada, seed ou migração. |
| 2026-07-10 | 8 | repo | `npm run validate` canónico final fora do sandbox | 0 | Docs 66/66/94/10/29; lint; backend unit 228/228 e integração 19/19; frontend 50 ficheiros/197; contratos root 5/5, backend 12/12 e frontend 21/21; segurança 11/11 + scanner; build JS inicial 61,90 kB gzip/CSS 5,38 kB; fixtures media válidas. Sem DB/seed/migração/E2E funcional. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe e cinco suites focadas após a revisão independente final | 0 | 54/54: CTA usa a mesma fonte canónica do playback; containers media malformados não causam 500; planos incompletos não ganham entitlements; admin inativo não conta para remover o último ativo. Apenas in-memory, sem socket/DB. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe e sete suites focadas após fechar checkout/renovação de plano incompleto | 0 | 80/80; além das fronteiras anteriores, plano malformado é omitido e não cria payment attempt, subscrição ou renovação. A importação partilhada não introduziu regressão/ciclo de módulo. Apenas in-memory. |
| 2026-07-10 | 8 | `real_dev/backend` | Primeira `npm test` após hardening final de planos/media/admin | 1 | 270/271; único fail: fixture de regressão MF6 declarava plano ativo sem os novos campos obrigatórios de entitlement e foi corretamente recusada com `PLAN_NOT_FOUND`. Runtime permaneceu fail-closed; fixture ficou por alinhar. |
| 2026-07-10 | 8 | `real_dev/backend` | Sintaxe e regressão MF6 focada após alinhar plano canónico | 0 | 1/1; checkout simulado e cancelamento voltam a passar com plano Pro completo, mantendo a recusa de documentos incompletos. |
| 2026-07-10 | 8 | repo | Validação dos três guias executáveis corrigidos e revisão independente final | 0 | Validador 66/66/94/10/29; 13/13 negativos; fences 56/18/34 pares; novos blocos JS com sintaxe válida; diff/whitespace/paths privados limpos. Revisão independente: 114/114 runtime focado e zero P0/P1/P2 residual no scope, sem DB/rede. |
| 2026-07-10 | 8 | `real_dev/backend` | `npm test` final após hardening P2 e alinhamento documental/fixtures | 0 | 271/271, zero fail/skip/cancel; inclui todos os novos negativos de media canónica, planos incompletos, checkout/renovação, último admin e comentários auditados. Apenas loopback/doubles/in-memory; sem DB configurada, seeds ou migrações. |
| 2026-07-10 | 8 | repo | `npm run validate` canónico de fecho fora do sandbox | 0 | Docs 66/66/94/10/29; lint; backend unit 233/233 e integração 19/19; frontend 50 ficheiros/197; contratos root 5/5, backend 14/14 e frontend 21/21; segurança 11/11 + scanner; build JS inicial 61,90 kB gzip/CSS 5,38 kB; fixtures media válidas. Sem DB/seed/migração/E2E funcional. |
| 2026-07-10 | 8 | repo | Negativos documentais finais, fences, diff, whitespace, ignore e Database Tools | 0/1 | Negativos 13/13; 162 Markdown com fences pares; `git diff --check` limpo; `rg` exit 1 esperado por zero trailing whitespace; `real_dev` continua ignored. `mongodump`/`mongorestore` continuam ausentes (exit 1 cada), logo restore real permanece bloqueado. |
| 2026-07-10 | 8 | repo | Retoma: validador, 13 negativos, sweeps de paths/media, diff e revisão independente | 0/1 | PASS 66/66/94/10/29 e 13/13 negativos; zero path privado nos guias públicos, zero alias/comando para roots dos alunos em evidence e caveats MF9 presentes. `git diff --check` limpo; `rg` exit 1 esperado nos scans sem ocorrências. Uma primeira tentativa de procurar `EM_CORRECAO` usou quoting shell incorreto e produziu apenas `command not found`, sem qualquer escrita; a repetição segura confirmou zero estado mestre em correção. |
| 2026-07-10 | 9/D3-D5 | repo | Checkers focados de headings/pontos, sintaxe de fences, imports/exports, paths e whitespace nos lotes de fundação, contratos cross-guide e frontend/RGPD | 0 | Fundação: 61 fences válidas; contratos cross-guide: 53 JS e 32 Bash válidos; frontend/RGPD: 55 JS/JSX/Bash válidos. Todos com 16 headings, pontos `1..7`, zero path privado e diff/whitespace focados limpos. Nenhuma DB, seed, E2E, migração ou servidor. |
| 2026-07-10 | 9/D0-D5 | repo | `git status --short` e `git rev-parse --short HEAD` | 0 | Dirty worktree preexistente continua preservado, incluindo alterações dos alunos; baseline permanece `1f33e61`. Nenhuma alteração fora do scope foi revertida ou atribuída à Fase 9. |
| 2026-07-10 | 9/D3-D6 | repo | `bash scripts/validate-planificacao.sh` e resumo JSON por field/macro | 1 | 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence; 151 erros, todos exclusivamente `guide.didactic_comments` (MF1 46, MF2 65, MF3 38, MF5 1, MF9 1). Zero erro crítico de media, sessão, health, RGPD, composição, metadata, pontos ou paths. Resultado intermédio; D5 continua aberta. |
| 2026-07-10 | 9/D5 | repo | Checkers focados de comentários, sintaxe, estrutura, paths, whitespace e diff nos lotes MF1, MF2 e MF3/MF5/MF9 | 0 | MF1: 46 findings/67 comentários, 59 fences JS/JSX/TS/TSX e 17 Bash; MF2: 65 findings/108 comentários, 104 JS/JSX, 53 Bash e 3 JSON; residual: 40 findings/62 comentários e 70 fences. Zero erro focado, path privado ou whitespace. |
| 2026-07-10 | 9/D1-D7 | repo | Scans `rg` de `MONGODB_*`, `TEST_MONGODB_*`, Playwright direto, seeds/E2E e leitura dos documentos híbridos MF8/MF9 | 0 | Inventário distinguiu snapshots marcados de procedimento atual e encontrou três exemplos atuais de DB genérica reutilizável. Os três foram corrigidos para run ID UTC novo; nenhuma seed, DB ou E2E foi executada. |
| 2026-07-10 | 9/D6 | repo | Duas tentativas de contar `CASES` por `exec(compile(...))` | 1 | A primeira não definiu `__file__`; a segunda não registou o módulo para `dataclass`. Ambas confirmaram previamente `syntax_ok=2`, mas falharam apenas no harness de contagem e não produziram escrita. A contagem foi repetida por scan literal. |
| 2026-07-10 | 9/D6 | repo | `compile(...)` dos dois scripts, contagem literal de casos e validador após as novas regras | 0 | `syntax_ok=2`; baseline 66/66/94/10/30 com zero erros. A contagem passou primeiro por 55 e terminou em 57 depois das regras de frescura MF8/MF9. |
| 2026-07-10 | 9/D6 | repo | Primeira execução da suite negativa ampliada | 1 | Vinte mutações foram corretamente recusadas; o caso novo `payment_attempts` não encontrou a célula porque o code span cobria apenas parte do nome da coleção. Harness corrigido, sem alteração do canon testado. |
| 2026-07-10 | 9/D6 | repo | Segunda execução da suite negativa ampliada | 1 | Trinta e seis mutações foram corretamente recusadas; o helper genérico encontrou o ID MF2 em três tabelas históricas. A mutação passou a substituir o comando atual exato, sem alargar o validador nem reescrever snapshots. |
| 2026-07-10 | 9/D6 | repo | `python3 scripts/test_validate_planificacao_negatives.py` final | 0 | Baseline verde e 57/57 classes de drift rejeitadas em cópias temporárias: canon, metadata/lanes, matriz, E2E, runbooks/manifests, tutorial, schemas, lifecycle e contratos críticos. Sem runtime, DB, browser ou rede. |
| 2026-07-10 | 9/D7 | repo | Primeira tentativa do checker de links relativos | 1 | O próprio comando tinha uma string regex terminada por backslash e falhou com `SyntaxError`; não leu conclusivamente nem escreveu ficheiros. |
| 2026-07-10 | 9/D7 | repo | Checker corrigido de links relativos em README/arquitetura/docs | 0 | 163 ficheiros analisados fora de fences; zero target relativo inexistente. |
| 2026-07-10 | 9/D7 | repo | Scans de paths privados nos 66 guias, trailing whitespace e `git diff --check` | 1/1/0 | Os dois `rg` terminaram com exit 1 esperado por zero ocorrências; diff global limpo no checkpoint. |
| 2026-07-10 | 9/D7 | repo | Duas reauditorias humanas read-only de segurança/composição e evidence/governação | 0 | Segurança encontrou 4 P1 e 6 P2; governação encontrou headings extra, metadata archive, boundaries híbridos e lanes ambíguas; composição acrescentou rotas eager/indefinidas, helpers familiares, CSRF code, catálogo MF6 e API cumulativa. Findings reabertos, não mascarados por D6. |
| 2026-07-10 | 9/D7 | repo | Validação focada do lote governance: headings, metadata, boundaries, lanes, fences, links, whitespace e diff | 0/1 | 66/66 guias com 16 headings; archive 5/5 documentos; híbridos 12/12; zero fence/link/whitespace/diff. Uma tentativa intermédia usou a variável zsh read-only `status` e falhou; repetição com `statustext` passou. |
| 2026-07-10 | 9/D6-D7 | repo | `compile(...)` dos scripts e contagem literal após regras governance | 0 | `syntax_ok=2`; 61 casos negativos definidos. A suite ainda não foi executada sobre o estado em composição e não conta como prova final. |
| 2026-07-10 | 9/D7 | repo | Validação focada da recomposição `BK-MF2-01` | 0 | Validador 66/66/94; 24 fences JS/JSX e 5 Bash válidas; zero comentário em falta, path privado, whitespace ou erro de diff. Sem runtime/DB/E2E. |
| 2026-07-10 | 9/D6-D7 | repo | `bash scripts/validate-planificacao.sh` após governance/auth e regras de composição | 0 | PASS 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence; resultado intermédio anterior aos lotes lazy/família. |
| 2026-07-10 | 9/D6-D7 | repo | Primeira suite negativa de 74 casos | 1 | Trinta e um casos foram rejeitados; o novo mutator de boundary falhou por `re` não importado no próprio harness. Import corrigido sem alterar regra/canon. |
| 2026-07-10 | 9/D6-D7 | repo | `python3 scripts/test_validate_planificacao_negatives.py` após corrigir o harness | 0 | Baseline verde e 74/74 classes rejeitadas, incluindo 13 composições D7. Ainda é checkpoint intermédio: rotas/família estavam em correção paralela. |
| 2026-07-10 | 9/D7 | repo | Validações focadas da composição de rotas/lazy loading | 0 | Validador 66/66/94; 31 declarações lazy válidas, zero import eager, binding duplicado ou página usada sem definição; header cobre 17 links e preserva logout/notificações/admin; 23 fences JSX válidas, diff e whitespace limpos. |
| 2026-07-10 | 9/D7 | repo | Validações focadas de `BK-MF9-03` | 0 | Oito fences JS e duas Bash válidas; zero helper livre nos cinco contextos; 23 operações MongoDB propagam `session`; 3/3 notificações recebem `{ db, session }`; estrutura tutorial, paths privados, diff e whitespace conformes. |
| 2026-07-10 | 9/D6-D7 | repo | Compilação dos dois scripts e `bash scripts/validate-planificacao.sh` após regras lazy/família | 0 | `syntax_ok=2`; baseline PASS com 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence. Resultado ainda intermédio, anterior aos restantes findings residuais. |
| 2026-07-10 | 9/D7 | repo | Parser focado dos fences nos seis guias com fragmentos | 0 | Antes: 46 blocos JS/JSX e 10 falhas; depois: 36 JS/JSX/TS/TSX, 22 Bash e 1 CSS válidos, mais 10 fences `text` rotuladas; estrutura tutorial, diff e whitespace verdes. |
| 2026-07-10 | 9/D6-D7 | repo | Primeira baseline após regra de classificação de fragmentos | 1 | A regra exigia incorretamente que markers também usados em implementações completas existissem apenas em `text`; o baseline recusou três casos legítimos. Condição corrigida para exigir pelo menos uma fence contextual `text`, sem autorizar o recorte como JS isolado. |
| 2026-07-10 | 9/D6-D7 | repo | Compilação e baseline após corrigir a regra de fragmentos | 0 | `syntax_ok=2`; PASS 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence. Continua checkpoint intermédio até fechar os restantes lotes D7. |
| 2026-07-10 | 9/D7 | repo | Inventário `rg` de APIs cumulativas, sessão, worker, RGPD e regressões antigas | 0/1 | Uma primeira regex composta foi interpretada incorretamente pelo shell e produziu output inconclusivo; scans focados posteriores confirmaram os duplicados de catálogo/playback então em correção, ausência de `status: 200`, `!rank` e `not_configured`, password RGPD presente e seleção de DB do worker sem concatenação da URI. |
| 2026-07-10 | 9/D7 | repo | Validação focada do lote residual catálogo/playback/E2E/worker/performance/RGPD/qualidade | 0 | Validador 66/66/94 e 77/77 negativos; 44 fences JS/JSX/TS/TSX e 31 Bash sem erro; comentários didáticos, diff e whitespace verdes. Nenhuma DB, seed, E2E, migração, browser ou servidor executado. |
| 2026-07-10 | 9/D7 | repo | Validação focada do catálogo administrativo metadata-only | 0 | Dois blocos JS/JSX válidos; 17 markers funcionais e duas confirmações destrutivas presentes; zero campo/token de reprodução no snippet admin; validador 66/66/94, diff e whitespace verdes. |
| 2026-07-10 | 9/D7 | repo | Validação focada do middleware de acesso efetivo em MF9-02 | 0 | Sete fences JS/JSX e uma Bash válidas; middleware/teste sem identificadores livres; estrutura tutorial, validador 66/66/94, diff e whitespace verdes. Sem runtime/DB/E2E. |
| 2026-07-10 | 9/D6-D7 | repo | Primeiras execuções da suite negativa ampliada para 85 casos | 1 | A recolha assíncrona exigiu polling explícito e a mutação `worker_database_selection` revelou falso negativo: a regra aceitava `getSiblingDB` apenas na explicação textual. O marker foi apertado para a instrução de código completa; nenhuma regra canónica foi relaxada. |
| 2026-07-10 | 9/D6-D7 | repo | `python3 scripts/test_validate_planificacao_negatives.py` após fechar os contratos residuais | 0 | Baseline verde e 86/86 mutações isoladas corretamente rejeitadas, incluindo APIs cumulativas, host-before-fixture, worker DB, status real, password RGPD, qualidade desconhecida, catálogo admin, lazy/família e fragmentos. |
| 2026-07-10 | 9/D7 | repo | Reauditoria humana de governação — primeiro finding | 0 | Encontrou P2: os dois snapshots STUDENT e o validador usavam a chave improvisada `implementation_root_lane`; finding reaberto e corrigido no próprio turno, sem tocar em implementações. |
| 2026-07-10 | 9/D6-D7 | repo | Compilação e validador após normalizar `comparison_lane` | 0 | `syntax_ok=2`; PASS 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence. Negativos finais ainda pendentes da conclusão das três reauditorias humanas. |
| 2026-07-10 | 9/D7 | repo | Releitura manual do `SessionProvider` cumulativo MF7 | 0 | Encontrou P1/P2 documental: `response?.user ?? null` convertia payload ausente em logout anónimo. Causa corrigida e protegida por regra/mutação; validação acumulada será repetida no fecho. |
| 2026-07-10 | 9/D6-D7 | repo | Compilação e validador após corrigir a semântica de sessão MF7 | 0 | `syntax_ok=2`; PASS 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence. Suite negativa final aguarda o fim das reauditorias. |
| 2026-07-10 | 9/D7 | repo | Segunda reauditoria humana sequencial dos 66 guias | 0 | Sem P0; encontrou P1/P2/P3 documentais de composição em player/páginas, idempotência, worker, seed guard, hardening, Origin/CSRF, rate limit, reset delivery, Family UI, metadata de rotas, moderator e robustez administrativa. D7 permaneceu aberto; nenhum verde anterior foi usado para mascarar os findings. |
| 2026-07-10 | 9/D7 | repo | Reauditoria governance — cobertura dos híbridos CURRENT | 0 | Conteúdo dos cinco documentos estava delimitado, mas o validador só cobria os 12 híbridos históricos. A classe foi ampliada sem reescrever snapshots e recebeu negativo próprio. |
| 2026-07-10 | 9/D6-D7 | repo | Compilação/validator durante edição paralela do player MF6 | 1 | Scripts compilaram; baseline recusou corretamente a ausência transitória do recorte MF6 que estava a ser substituído pelo lote frontend. Não foi relaxada a regra; o resultado não conta como prova e será repetido após o lote. |
| 2026-07-10 | 9/D7 | repo | Parser focado do worker/jobs em `BK-MF4-01` | 0 | Dezasseis fences JS/JSX válidas; índices, leases, transação, adapter e shutdown presentes. O validador global acusou apenas sete drifts transitórios em ficheiros sob edição paralela, não neste guia; não conta ainda como validação acumulada. |
| 2026-07-10 | 9/D7 | repo | Inventário read-only e patch dos contratos worker/pool | 0 | Confirmou os markers executáveis em MF4-01/MF4-05, ausência de `pastDueExpiresAt`/`subscription-expiry` e acrescentou duas regras/mutações sem tocar em runtime. A reauditoria detetou ainda a integração Family/billing em falta e manteve D7 aberto. |
| 2026-07-10 | 9/D6-D7 | repo | `env PYTHONDONTWRITEBYTECODE=1 python3 -c '... compile(...) ...'` | 0 | `syntax_ok=2` depois de acrescentar os contratos `composition.worker_jobs` e `composition.pool_worker`; não foi criado bytecode. |
| 2026-07-10 | 9/D6-D7 | repo | `env PYTHONDONTWRITEBYTECODE=1 bash scripts/validate-planificacao.sh` | 0 | Baseline intermédia PASS: 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence. Não fecha D7 porque a suite negativa e a extensão Family/billing ainda estão pendentes. |
| 2026-07-10 | 9/D7 | repo | Validação final independente do lote frontend/composição | 0 | Parser Babel validou 424/424 fences JS/JSX; validador 66/66/94/10/30, suite negativa então corrente, metadata 22/22, diff e whitespace verdes. Não executou aplicação, DB, E2E, browser ou servidor; a prova acumulada será repetida depois do último patch Family/billing. |
| 2026-07-10 | 9/D7 | repo | Validação focada da extensão Family/billing MF9-03 | 0 | Dez fences JS e duas Bash válidas; validador 66/66/94, diff e whitespace verdes. A extensão preserva `past_due` conforme RF303-304 e fecha memberships na mesma session; nenhuma expiração/grace adicional foi ensinada. |
| 2026-07-10 | 9/D6-D7 | repo | `python3 scripts/test_validate_planificacao_negatives.py` — primeira repetição de fecho | 1 | Baseline e os primeiros 99 casos foram rejeitados; o harness abortou em `final_recommendations_api` porque procurava a forma antiga sem `{ signal }`. Não é prova de fecho; o teste foi alinhado ao snippet atual e será repetido integralmente. |
| 2026-07-10 | 9/D6-D7 | repo | `python3 scripts/test_validate_planificacao_negatives.py` — segunda repetição de fecho | 1 | Rejeitou 102 casos até `moderator_catalog_scope`; `mobile_reduced_motion` passou indevidamente porque uma ocorrência narrativa satisfazia a regra. O false-negative foi fechado sem alterar o guia e a suite será repetida do início. |
| 2026-07-10 | 9/D6-D7 | repo | Preflight de cardinalidade dos dez markers de mutação finais | 0 | Cada marker executável de reduced motion, reservas, encoding, worker, pool, preferências e Family/billing ocorre exatamente uma vez no respetivo guia; remove ambiguidade do `replace_once`. |
| 2026-07-10 | 9/D6-D7 | repo | `bash scripts/validate-planificacao.sh` — baseline antes da terceira repetição | 0 | PASS: 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence; zero erro. |
| 2026-07-10 | 9/D6-D7 | repo | `python3 scripts/test_validate_planificacao_negatives.py` — terceira repetição integral | 0 | Baseline verde e 110/110 mutações isoladas rejeitadas pelo campo esperado, incluindo os novos contratos security, frontend, worker/pool, preferências e Family/billing. Nenhuma DB, seed, E2E, rede ou servidor. |
| 2026-07-10 | 9/D7 | repo | Checker Python de links Markdown relativos | 0 | 163 documentos, 10 links relativos e zero target inexistente; URLs, anchors e conteúdo fenced foram excluídos da resolução local. |
| 2026-07-10 | 9/D7 | repo | Scan case-insensitive de paths privados nos guias ativos | 0 | Exatamente 66 guias `MF*/BK-*.md`; zero `real_dev`, aliases privados ou `apps/api|web|backend|frontend`. |
| 2026-07-10 | 9/D7 | repo | Scan/classificação de baseline histórica 60/60 | 0 | 28 ocorrências; zero não classificada. Todas pertencem a snapshot, caveat, finding ou changelog/rebaseline datado; 66/66 continua a única baseline ativa. |
| 2026-07-10 | 9/D7 | repo | Scan de fences shell E2E atuais com env MongoDB normal | 0 | Zero comando E2E atual usa `MONGODB_URI`/`MONGODB_DB_NAME`; procedimentos seguros usam apenas `TEST_MONGODB_*` e snapshots históricos não contam. |
| 2026-07-10 | 9/D7 | repo | Scan estático dos 66 guias por padrões legacy de health, sessão, media, RGPD e finanças | 0 | Zero health sempre verde, coerção de sessão para logout, fallback localhost, redaction pública, eliminação vazia, ledger `amount` v1 ou implementação duplicada de checkout em fences ativos. |
| 2026-07-10 | 9/D7 | repo | Primeira tentativa do comparador inline runbook/manifests | 1 | O loader ad hoc não registou o módulo em `sys.modules`; Python 3.14 recusou `@dataclass` antes da comparação. Nenhum ficheiro foi alterado e nenhum comando de runbook foi executado. |
| 2026-07-10 | 9/D7 | repo | Comparador inline runbook/manifests com loader corrigido | 0 | Cinco runbooks, 14 comandos npm e zero prefix/script incompatível com os quatro manifests das lanes STUDENT/REFERENCE; comparação exclusivamente estática. |
| 2026-07-10 | 9/D7 | repo | `git diff --check` | 0 | Zero erro de whitespace no diff tracked; não altera nem limpa o dirty worktree. |
| 2026-07-10 | 9/D7 | repo | Scan Python de trailing whitespace no scope documental e scripts | 0 | 165 ficheiros, incluindo report canónico untracked, e zero linha com espaço/tab final. |
| 2026-07-10 | 9/D7 | repo | Primeira passagem global de parsers sobre Markdown | 1 | 669/670 fences JS/JSX/TS/Bash/JSON válidas; único erro em JSON fragmentário de MF2-01. O exemplo foi tornado JSON completo e a passagem integral será repetida. |
| 2026-07-10 | 9/D7 | repo | Terceira reauditoria humana read-only — checkpoint intermédio | 0 | Encontrou 3 P1 e 3 P2 concretos em composição que a baseline/110 negativos ainda não detetavam: progresso MF4-08, fallback DB test, env MF9-06, pool MF9-05, outbox por email e métrica `changedAt`. Findings reabertos e encaminhados; nenhum verde anterior é usado como fecho. |
| 2026-07-10 | 9/D7 | repo | Terceira reauditoria humana — segundo checkpoint | 0 | Encontrou mais 1 P1 e 8 P2: consentimentos não atómicos/sem índice; auth middleware duplicado; 2xx inválido; bodies nulos; cache privado; helper/state livres; qualidade desconhecida permissiva; request ID sem limites. Todos foram reabertos antes do fecho. |
| 2026-07-10 | 9/D7 | repo | Auditoria read-only das redefinitions fora dos ficheiros em edição | 0 | 206 fences Babel válidas, mas leitura semântica encontrou 1 P1 e 9 P2 em Charity, `HttpError`, review, ratings, comentários, recomendações e UI/inputs. Os findings foram distribuídos antes de qualquer gate final. |
| 2026-07-10 | 9/D7 | repo | Validação focada do sublote core inicial | 0 | 62 fences JS/JSX/JSON e 26 Bash válidas; diff/whitespace dos cinco guias limpos. O validador não acusou estes ficheiros e falhou apenas em três guias sob edição concorrente; logo é checkpoint, não baseline final. |
| 2026-07-10 | 9/D7 | repo | Auditoria read-only MF4/MF5 — terceiro checkpoint | 0 | Encontrou 7 P2 em export RGPD, métricas/backend/UI, integrações/config sensível e pool/moeda/body. Findings distribuídos antes de qualquer repetição do gate. |
| 2026-07-10 | 9/D7 | repo | Auditoria read-only MF6/MF7 — checkpoint | 0 | Encontrou P1 de exfiltração potencial do cookie via base URL externa e P2 em timeout/evidence, planos públicos acoplados a 401, guarda de rotas privadas e duplo logout. Corrigiu também a leitura anterior: `PublicCharitiesPage` final já tinha cancel/retry; apenas histórico privado permanece nesse finding. |
| 2026-07-10 | 9/D7 | repo | Fecho read-only de createApp/sessão estáveis | 0 | Confirmou `HttpError` de quatro argumentos já corrigido e encontrou dois P2 finais: cookie `%` gerava `URIError/500` e `/api/session/me` não tinha cache privado/no-store. Encaminhados antes da reauditoria pós-fix. |
| 2026-07-10 | 9/D7 | repo | Fecho consolidado da terceira auditoria humana read-only | 0 | Zero P0; 2 P1 e P2 agrupados foram confirmados nos ficheiros estáveis, com retrações explícitas para `HttpError`, base URL/cookie/curl MF6-04, cancelamento ForYou/PublicCharities e `resolveSession`. Fora da lista consolidada não ficou outro P0/P1/P2 nos ficheiros lidos; os ficheiros em edição serão reavaliados pós-fix. |
| 2026-07-10 | 9/D7 | repo | Validação focada do lote security/governance congelado | 0 | Checkpoint canónico 66/66/94; 145 fences JS/JSX e 35 Bash sem erro, sublote final 20+4 sem erro, diff e whitespace verdes. Negativos não foram usados como prova porque MF5-05 estava sob edição concorrente; o comentário em falta foi corrigido pelo respetivo agente. |
| 2026-07-10 | 9/D7 | repo | Validação focada do lote core congelado | 0 | Validador PASS 66/66/94/10/30; 133 fences JS/JSX/JSON e 82 Bash sem erro; diff e whitespace focais limpos. Não executou negativos globais, DB, E2E ou runtime. |
| 2026-07-10 | 9/D7 | repo | Segunda passagem global de parsers sobre Markdown | 0 | 163 documentos e 670 fences válidas: 323 JS, 104 JSX, 1 TS, 227 Bash e 15 JSON; zero erro após corrigir o exemplo de manifesto. Checkpoint anterior ao lote dos seis findings humanos. |
| 2026-07-10 | 9/D7 | repo | Inventário global de imports relativos nomeados vs exports ensinados | 0 | 66 guias, 426 blocos executáveis, 784 imports nomeados e 478 nomes exportados; zero símbolo importado sem definição em algum tutorial. Checkpoint será repetido depois do lote aberto. |
| 2026-07-10 | 9/D7 | repo | Releitura do report, `git status`, inventário de paths auth e inspeção read-only do validador/negativos | 0 | Confirmou D7 como única fase ativa, dirty worktree preservado, 17 ocorrências então visíveis da localização auth obsoleta e 110 negativos existentes; nenhuma implementação, DB ou servidor foi tocado. |
| 2026-07-10 | 9/D7 | repo | `python3 -m py_compile scripts/validate_planificacao_canonica.py scripts/test_validate_planificacao_negatives.py` | 0 | Os dois scripts compilavam antes do endurecimento final. O comando pode ter atualizado o diretório `scripts/__pycache__` já untracked; as repetições passam a usar `PYTHONDONTWRITEBYTECODE=1`. |
| 2026-07-10 | 9/D7 | repo | Validação focada do lote MF5-01/05/06 | 0 | 27/27 fences Babel válidas; validador PASS 66/66/94/10/30; diff e trailing whitespace limpos. Sem DB, seed, E2E, migração ou servidor. |
| 2026-07-10 | 9/D7 | repo | Reauditoria humana read-only pós-fix dos 18 guias security/governance | 0 | Zero P0/P1; quatro P2 concretos em auth path, paginação de users, reserva de preferências e sobredeclaração MF6-01. Findings reabertos e encaminhados antes do gate final. |
| 2026-07-10 | 9/D7 | repo | Reauditoria humana read-only pós-fix do lote core | 0 | Zero P0 global no lote; encontrou dois P1 em env/sessão MF1-04 e dois P2 em role MF2-02/rating MF3-01. Os quatro snippets foram reabertos e encaminhados antes do gate final. |
| 2026-07-10 | 9/D6-D7 | repo | Validação focada das regras MF5 do validador | 0 | Scripts compilam; baseline PASS 66/66/94; três mutações focadas foram rejeitadas pelos fields esperados; diff e trailing whitespace limpos. Suite integral fica reservada para o gate final. |
| 2026-07-10 | 9/D7 | repo | Validação focada de MF4-08/MF5-04/MF6-01 pós-fix | 0 | 36 fences JS/JSX/JSON/Bash válidas; zero padrão antigo, erro de diff ou trailing whitespace. Nenhum runtime, DB, seed ou E2E foi executado. |
| 2026-07-10 | 9/D7 | repo | Validação focada de MF1-04/MF2-02/MF3-01 pós-fix | 0 | Sete snippets JS modificados passaram `node --check`; fences equilibradas 38/40/32; zero padrão antigo, erro de diff ou trailing whitespace. Sem runtime/DB/E2E. |
| 2026-07-10 | 9/D7 | repo | Scan e normalização dos paths auth nos 66 guias ativos | 0 | Antes: 18 ocorrências da localização obsoleta; depois: zero ocorrência e 30 referências à localização canónica. Snapshots/evidence REFERENCE ficaram preservados. |
| 2026-07-10 | 9/D6-D7 | repo | Primeira baseline após as 19 regras pós-auditoria | 1 | O validador recusou dois comentários didáticos realmente em falta em MF3-01 e três markers excessivamente específicos do novo código. Findings corrigidos; nenhum RF/RNF foi alterado. |
| 2026-07-10 | 9/D6-D7 | repo | Compilação in-memory dos scripts e segunda baseline canónica pós-auditoria | 0 | `syntax_ok=2`; PASS 66 BK, 66 guias, 94 requisitos, 10 MF views e 30 evidence; zero erro. `PYTHONDONTWRITEBYTECODE=1`, sem DB/E2E/servidor. |
| 2026-07-10 | 9/D6-D7 | repo | Primeira passagem integral das 132 mutações negativas | 1 | 114 casos anteriores foram recusados; `session_database` passou indevidamente porque a fixture alterava apenas texto e não a seleção executável. A mutação foi corrigida para inverter a branch real; a passagem parcial não conta como fecho. |
| 2026-07-10 | 9/D6-D7 | repo | Passagem focada das 19 novas mutações pós-auditoria | 0 | 19/19 recusadas pelo field específico esperado em cópias temporárias; inclui auth path, DB test, transações, DTOs, races, estados, finanças, performance, UI e evidence. |
| 2026-07-10 | 9/D6-D7 | repo | Segunda passagem integral das mutações negativas | 0 | Baseline verde e 132/132 classes isoladas recusadas pelo field esperado. A suite trabalhou apenas em cópias temporárias, sem DB, seed, E2E, browser ou servidor. |
| 2026-07-10 | 9/D7 | repo | Checker final de links Markdown relativos | 0 | 163 documentos, 10 links locais e zero target inexistente; conteúdo fenced, URLs e anchors foram excluídos. |
| 2026-07-10 | 9/D7 | repo | Scan final de paths privados nos guias ativos | 0 | Exatamente 66 guias; zero `real_dev`, aliases privados ou `apps/api|web|backend|frontend`. |
| 2026-07-10 | 9/D7 | repo | Scan final de referências à baseline 60/60 | 0 | 24 ocorrências revistas; todas estão em política, snapshot datado, caveat, finding ou changelog/rebaseline. Nenhuma apresenta 60/60 como baseline ativa. |
| 2026-07-10 | 9/D7 | repo | Scan final dos procedimentos E2E shell atuais | 0 | Oito fences atuais identificadas e zero atribuição a `MONGODB_URI`/`MONGODB_DB_NAME`; usam exclusivamente `TEST_MONGODB_*` quando aplicável. |
| 2026-07-10 | 9/D7 | repo | Scan final de snippets legacy health/sessão/media/RGPD/finanças/auth | 0 | 66 guias, zero padrão legacy e uma única autoridade de `createSimulatedCheckout`, em MF4-02. |
| 2026-07-10 | 9/D7 | repo | Comparador estático final runbook/manifests | 0 | Cinco runbooks, 14 comandos npm e zero prefix/script incompatível; nenhum comando foi executado. |
| 2026-07-10 | 9/D7 | repo | Parser global final de fences Markdown | 0 | 163 documentos e 685 fences executáveis válidas: 335 JS, 105 JSX, 1 TS, 229 Bash e 15 JSON; zero erro. |
| 2026-07-10 | 9/D7 | repo | Primeira tentativa de resolução estrita de imports por path inferido | 1 | Checker ad hoc associou incorretamente 82 imports a labels anteriores ou blocos sem ficheiro (`.`); resultado inconclusivo e sem escritas. Foi substituído por inventário global explícito. |
| 2026-07-10 | 9/D7 | repo | Inventário global final de imports relativos nomeados vs exports ensinados | 0 | 66 guias, 439 blocos, 832 imports nomeados e 492 símbolos exportados; zero nome importado sem definição em algum tutorial. |
| 2026-07-10 | 9/D7 | repo | `git diff --check` e scan de trailing whitespace no scope documental/scripts | 0 | Diff tracked limpo; 165 ficheiros, incluindo o report untracked, e zero espaço/tab final. Checkpoint será repetido após o fecho do report. |
| 2026-07-10 | 9/D7 | repo | Três reauditorias humanas finais read-only — security/core/governação | 0 | Zero P0; um P1 e sete P2 concretos encontrados em sete guias. Os findings foram reabertos e distribuídos; 132/132 negativos não foram usados para os mascarar. |
| 2026-07-10 | 9/D7 | repo | Validação focada do smoke/lane MF1-06 pós-fix | 0 | Validador PASS 66/66/94; 16 fences equilibradas; zero comando Mongo inseguro, erro de diff ou trailing whitespace. Nenhuma DB ou servidor foi executado. |
| 2026-07-10 | 9/D7 | repo | Validação focada de MF2-02/03/06 pós-fix | 0 | 41 fences JS/JSX válidas; validador PASS 66/66/94; diff e whitespace limpos. Sem DB/E2E/servidor. |
| 2026-07-10 | 9/D7 | repo | Validação focada de MF4-01/MF9-04/05 pós-fix | 0 | 32 fences JS/JSX/JSON/Bash válidas; zero trigger `manual`, erro de diff ou trailing whitespace. Sem runtime/DB/E2E. |
| 2026-07-10 | 9/D6-D7 | repo | Compilação, baseline e oito negativos focados do gate humano final | 0 | `syntax_ok=2`; baseline PASS 66/66/94/10/30; 8/8 novas mutações recusadas pelo field esperado em cópias temporárias. |
| 2026-07-10 | 9/D6-D7 | repo | Terceira passagem integral das mutações negativas | 0 | Baseline verde e 140/140 classes isoladas recusadas pelo field esperado; execução puramente documental em cópias temporárias. |
| 2026-07-10 | 9/D7 | repo | Cross-audit read-only de MF2-02/03/06 | 0 | Zero P0/P1/P2 residual: montagem única de sessão, create+audit transacional e exclusão locked foram confirmados por agente diferente. |
| 2026-07-10 | 9/D7 | repo | Cross-audit read-only de MF1-06/MF4-01/MF9-04/05 | 0 | Zero P0; encontrou P1 de loading preso em MF9-04 e P2 de DB double sem cleanup total em MF1-06. Lease e trigger ficaram sem residual. |
| 2026-07-10 | 9/D7 | repo | Cross-audit read-only de governação/validador | 0 | Zero P0/P1; confirmou loading e encontrou P2 false-negative para `TEST_MONGODB_*` no smoke. Regra e caso isolado foram ampliados antes do gate. |
| 2026-07-10 | 9/D7 | repo | Última cross-audit read-only dos helpers e regras cleanup | 0 | Helpers MF1-06/MF9-04 sem P0/P1/P2 residual; governação encontrou P2 false-negative na contagem textual do reset. A regra foi tornada estrutural antes do fecho. |
| 2026-07-10 | 9/D7 | repo | Validação focada dos cleanups MF1-06/MF9-04 | 0 | Baseline PASS 66/66/94/10/30; cinco fences JS/JSX válidas; scripts compilam; três mutações focadas (`TEST_MONGODB_*`, reset e loading) foram recusadas. |
| 2026-07-10 | 9/D6-D7 | repo | Quarta passagem integral das mutações negativas | 0 | Baseline verde e 143/143 classes isoladas recusadas pelo field esperado; inclui as duas variantes Mongo do smoke e os dois cleanups finais. |
| 2026-07-10 | 9/D7 | repo | Primeira versão do checker D7 consolidado | 1 | Três referências históricas à baseline 60 foram classificadas como drift porque a allowlist ad hoc era demasiado estreita. Revisão humana confirmou política/snapshot legítimos; o resultado não contou como fecho e o classificador foi corrigido sem alterar documentos. |
| 2026-07-10 | 9/D7 | repo | Checker D7 consolidado corrigido | 0 | 163 documentos/10 links/0 partidos; 66 guias/0 paths privados; 29 referências à baseline 60/0 não classificadas; 8 fences E2E atuais/0 assignments Mongo normais; 0 snippets legacy, 1 autoridade de checkout e 0 assignments inseguros no smoke. |
| 2026-07-10 | 9/D7 | repo | Parser e inventário de imports após os cleanups finais | 0 | 685 fences executáveis sem erro; 66 guias, 439 blocos, 832 imports relativos nomeados, 492 símbolos exportados e zero nome globalmente indefinido. |
| 2026-07-10 | 9/D7 | repo | `bash scripts/validate-planificacao.sh` antes do fecho dos estados | 0 | PASS: 66 BK, 66 guias, 94 requisitos, 10 MF views, 30 evidences e zero erro. |
| 2026-07-10 | 9/D6-D7 | repo | Quinta passagem integral das mutações negativas antes do fecho | 0 | Baseline verde e 143/143 classes isoladas recusadas pelo field esperado em cópias temporárias. Nenhuma DB, seed, migração, E2E, browser ou servidor foi executado. |
| 2026-07-10 | 9/D7 | repo | `git status --short --untracked-files=all` na retoma do fecho | 0 | Dirty worktree confirmado e preservado; roots dos alunos e restantes alterações preexistentes não foram limpos, revertidos ou atribuídos à Fase 9. |
| 2026-07-10 | 9/D7 | repo | Baseline, `git diff --check` e scan de trailing whitespace após fechar os estados | 0/1 | Validador PASS 66/66/94/10/30 e diff limpo; `rg` terminou com exit 1 esperado por zero linhas com whitespace final no scope permitido. |
| 2026-07-10 | 9/D7 | repo | Primeira tentativa de scan dos estados finais com regex entre aspas duplas | 1 | Os backticks Markdown foram interpretados pelo shell e produziram apenas erros de quoting; nenhuma escrita ocorreu e o resultado não contou como validação. |
| 2026-07-10 | 9/D7 | repo | Scan corrigido e single-quoted das linhas de estado mestre/subfases | 1 | Exit 1 esperado por zero `ABERTO`, `EM_CORRECAO` ou `CORRIGIDO_NAO_VALIDADO` nas linhas de `FF-DOC-*`, `FF-AUD-020/021` e D0-D7. |
| 2026-07-10 | 9/D6-D7 | repo | Sexta passagem integral das mutações negativas com o report fechado | 0 | Baseline verde e 143/143 classes isoladas recusadas pelo field esperado; resultado obtido depois de Fase 9, D0-D7 e findings documentais passarem a `VALIDADO`. |
| 2026-07-10 | 9/D7 | repo | Auditoria independente read-only do report fechado | 0 | Zero P0/P1/P2 residual; confirmou estados, métricas 66/66/94/10/30 e 143/143, parser/imports, gate duplo e preservação explícita dos bloqueios runtime/ambiente/produto. |
| 2026-07-10 | 9/D7 | repo | Self-check final após fechar o ledger: validador, diff, whitespace e estados ativos | 0/1/1 | Baseline PASS 66/66/94/10/30 e `git diff --check` limpo; os dois `rg` terminam com exit 1 esperado por zero whitespace final e zero estado documental aberto nas linhas canónicas. |

### Diagnóstico exato de coerções `FF-AUD-017`

- `cwd`: `real_dev/backend`
- `data`: `2026-07-10`
- `exit`: `0` antes e depois; o harness imprime o resultado de cada asserção.

```bash
node --input-type=module -e "import {assertCatalogPayload,assertStatus,parseCatalogFilters} from './src/modules/catalog/catalog.validation.js'; import {parseSearchFilters,assertSearchQuery} from './src/modules/search/search.validation.js'; import {assertRatingValue} from './src/modules/ratings/ratings.validation.js'; import {assertProgressPayload} from './src/modules/playback/playback.validation.js'; const cases=[['catalog type array',()=>assertCatalogPayload({title:['Filme valido'],synopsis:'x'.repeat(20),type:['movie'],durationSeconds:'120',ageRating:'6'}).type],['status array',()=>assertStatus(['published'])],['catalog query array',()=>parseCatalogFilters({type:['movie']}).type],['search sort array',()=>parseSearchFilters({sort:['title']}).sort],['search query array',()=>assertSearchQuery(['fe'])],['rating string',()=>assertRatingValue('5')],['progress string',()=>assertProgressPayload({currentTimeSeconds:'10'},120).currentTimeSeconds]]; for(const [name,fn] of cases){try{console.log(name+': ACCEPTED -> '+JSON.stringify(fn()))}catch(e){console.log(name+': REJECTED -> '+e.message)}}"
```

Antes da correção, os sete casos imprimiam `ACCEPTED`; após a correção, os sete imprimem `REJECTED`.

## 10. Matriz RF/RNF pos-correcao

| Contrato | Estado inicial | Estado alvo local | Nota |
| --- | --- | --- | --- |
| `RF01-RF05` | `PARCIAL` | `VALIDADO_LOCAL` | Registo/sessão atómicos, timing uniforme, reset concorrente, revogação e estados de sessão fail-closed; Mongo real pendente em RNF19. |
| `RF20` | `PARCIAL` | `VALIDADO_LOCAL` | Comentário público sem `userId`; moderação/delete privilegiado auditados e atómicos nos doubles; owner delete separado. |
| `RF35/RF37` | `PARCIAL` | `VALIDADO_LOCAL` | Subscricao paga apenas por checkout simulado aprovado; chave/hash, ledger v2 e rollback local provados. |
| `RF36` | `NAO_CONFORME` | `VALIDADO_LOCAL` | Renovacao simulada automatica e idempotente. |
| `RF40` | `PARCIAL` | `VALIDADO_LOCAL` | Trial unico, idempotente/transacional e expirado pelo mesmo worker. |
| `RF44` | `NAO_CONFORME` | `VALIDADO_LOCAL` | Pool usa apenas pagamentos v2 aprovados, nao estimados e do mes UTC fechado. |
| `RF45` | `NAO_CONFORME` | `VALIDADO_LOCAL` | Worker mensal e ledger financeiro. |
| `RF62` | `PARCIAL` | `VALIDADO_LOCAL` | Limite inclui owner; serializacao, indice unico, concorrencia e fault injection locais. |
| `RF58` | `PARCIAL` | `VALIDADO_LOCAL` | User admin/audit/sessões no mesmo commit; estados inativos/desconhecidos não contam para último admin. |
| `RF61` | `PARCIAL` | `VALIDADO_LOCAL` | Planos exigem campos completos/tipos reais; malformados ficam sem entitlement e fora de listagem/checkout/renovação. |
| `RF57` | `NAO_CONFORME` | `VALIDADO` | Consentimentos aplicados antes de sinais pessoais. |
| `RF63` | `NAO_CONFORME` | `VALIDADO_LOCAL` | Zero URLs publicas; entitlement antes da fonte. |
| `RNF08` | `NAO_PROVADO` | `NAO_PROVADO` | Exige video e infraestrutura real. |
| `RNF10` | `NAO_PROVADO` | `NAO_PROVADO` | Exige streaming real e teste de carga. |
| `RNF13-16` | `PARCIAL` | `VALIDADO_LOCAL` | HTTPS fail-closed, cookies, CSRF e rate limiting. |
| `RNF18` | `PARCIAL` | `PARCIAL_VALIDADO` | Baseline simulada nao recebe dados reais de cartao; delegacao para gateway real nao foi provada. |
| `RNF19` | `PARCIAL` | `PARCIAL_VALIDADO` | Mutacoes criticas e audit log partilham transacao nos doubles; atomicidade e fault injection num replica set real continuam bloqueados. |
| `RNF20` | `PARCIAL` | `PARCIAL_VALIDADO` | CLIs/guardas locais validados com doubles; restore real bloqueado pela ausência das tools e agendamento fora do scope. |
| `RNF21-22` | `PARCIAL` | `PARCIAL_VALIDADO` | Browsers automatizados e matriz local; Safari real manual. |
| `RNF23` | `NAO_CONFORME` | `PARCIAL_VALIDADO` | Adapters e fixtures locais, sem entrega real. |
| `RNF24` | `NAO_CONFORME` | `NAO_CONFORME` | Adapter `faithflix-simulated`; nenhum gateway ou webhook real. |
| `RNF29` | `PARCIAL` | `PARCIAL_VALIDADO` | Suites locais e harness formal verdes; full E2E com DB isolada não foi executado. |
| `RNF31` | `NAO_CONFORME` | `VALIDADO_LOCAL` | Liveness/readiness reais. |
| `RNF32` | `NAO_PROVADO` | `ACEITE_COM_RISCO` | Sem target de deploy/SCM autoritativo. |
| `RNF33` | `NAO_CONFORME` | `VALIDADO` | Documento de arquitetura e runbooks locais. |

## 11. Bloqueios e riscos aceites

- `real_dev` e lockfiles permanecem fora de SCM: `ACEITE_COM_RISCO`.
- Sem Docker/CI/deploy cloud por decisao do utilizador: risco operacional aceite para baseline local.
- Sem videos reais: RNF08/RNF10 nao podem ser fechados.
- Streaming real/CDN/DRM nao faz parte desta correcao.
- Migracao da base configurada nao esta autorizada.
- A credencial existente no `.env` privado tem de ser rodada externamente; `0600` mitiga apenas acesso local futuro.
- Seeds e E2E permanecem proibidos nesta execução: guards validados, mas falta uma DB transacional dedicada e execução cross-browser autorizada.
- `FF-AUD-001` só pode passar a `VALIDADO` depois de idempotência e conflitos serem provados numa DB `_e2e` dedicada, incluindo rerun após mutações do browser; hoje esse rerun aborta em segurança por documentos sem marcador.
- `FF-AUD-019` só pode passar a `VALIDADO` depois da matriz funcional Chromium/Firefox/WebKit executar; Chrome/Edge branded e Safari real continuam na matriz manual.
- A selecao mensal preserva o snapshot efetivamente distribuido e impede retroatividade automatica. Como os dados legacy nao possuem historico temporal de alteracoes manuais a `status/poolStatus`, uma mudanca externa a aplicacao antes do fecho pode nao reconstruir a elegibilidade historica; producao exige event sourcing ou migracao autorizada desse historial.
- A migracao financeira existe em dry-run e apply protegido, mas nao foi executada por decisao vinculativa; o historico real continua nao provado.
- O adapter de renovacao e os pagamentos sao simulados; gateway, webhooks e reconciliacao reais permanecem fora desta baseline.
- Em escala de producao, `paymentSnapshots` por mes deve ser particionado/bucketed antes de se aproximar do limite de documento MongoDB; o scan de subscricoes e limitado por passagem e exige metricas/alertas de backlog.
- Leases dependem do relogio da aplicacao; producao exige sincronizacao de relogio e observabilidade. Nenhum destes limites foi promovido a prova de producao.
- `continue-watching` pagina depois dos filtros Mongo de publicação, parental e `mediaStatus:ready`, mas mantém uma validação final fail-closed da fonte em JavaScript. Um documento interno corrompido marcado `ready` pode ocupar uma posição e contar no `total` embora seja removido de `items`; ingestão real deve persistir apenas estado canónico validado.

### Incidente de isolamento durante a Fase 2

Ao introduzir o rate limiter, o smoke historico continuava sem `setDbForTests`. Uma primeira execucao HTTP fora do sandbox atingiu a configuracao MongoDB antes da validacao da pesquisa e pode ter incrementado um unico documento em `rate_limit_counters` para o scope `search:ip`. A chave e HMAC pseudonimizada, o documento tem TTL e nenhum dado funcional foi lido, alterado ou eliminado. A execucao foi interrompida; nao foi feita limpeza por falta de autorizacao para escrever/apagar na DB atual. O smoke foi corrigido para uma DB estritamente in-memory e a suite final confirmou 97/97 sem ligacao a Mongo real.

## 12. Reauditoria e gate final

O fecho integral da auditoria exige zero P0/P1 por fechar e todos os P2 em
`VALIDADO` ou `ACEITE_COM_RISCO`, além de nenhum seed capaz de tocar na DB
normal, zero fonte media no catálogo público e nenhuma alegação de streaming
real baseada em fixtures. Esses critérios integrais não estão todos cumpridos:
os findings que exigem replica set/E2E/restore e a rotação externa da credencial
permanecem formalmente bloqueados. O gate local abaixo é, por isso, uma
autorização operacional estreita para a referência sem persistência real, e não
o fecho de todos os findings.

### Decisão final em 2026-07-10

- `gate_local`: `GO_LOCAL_COM_RESSALVAS`
- `gate_producao`: `NO_GO_PRODUCAO`
- `scope_do_go`: execução local da referência, demonstração pedagógica e testes
  que não dependam de persistência real. Não autoriza deploy, uso de dados reais,
  seed/migração da DB configurada ou apresentação como serviço de produção.

### Avaliação dos critérios

- Zero P0 foi encontrado. Depois da última correção, a revisão independente não
  encontrou P1/P2 localmente corrigível nas superfícies reabertas. Continuam,
  porém, findings P1/P2 formalmente por fechar nos estados
  `BLOQUEADO_AMBIENTE` e `BLOQUEADO_PRODUTO`; logo, o critério integral de fecho
  não é apresentado como cumprido.
- `FF-AUD-003`, `FF-AUD-006` e `FF-AUD-013` estão `VALIDADO`. Fontes públicas,
  timing/reset/rate limits e ciclo de sessão têm prova negativa atual.
- `FF-AUD-009` tem zero estado parcial nos fault injections locais, mas continua
  `BLOQUEADO_AMBIENTE` para prova MongoDB real. O mesmo limite mantém
  `FF-AUD-001`, `FF-AUD-010`, `FF-AUD-011` e `FF-AUD-019` bloqueados; não são
  apresentados como fechados nem como falhas de código ainda conhecidas.
- `FF-AUD-024` continua `BLOQUEADO_PRODUTO` até rotação/revogação externa da
  credencial. Esta condição, por si só, impede produção.
- O guard de seed recusa a configuração normal; nenhuma seed, migração,
  `deleteMany`, full E2E funcional ou ligação autorizada a replica set ocorreu.
- O catálogo público usa allowlist e a mesma canonicalização do playback; a
  prova atual contém zero campo/valor de fonte reproduzível e não produz CTA
  verdadeiro para aliases inválidos.
- Backend completo: 271/271, sem fail/skip/cancel. `npm run validate` final:
  backend unit 233/233, integração 19/19, frontend 197/197, contratos
  5/5 + 14/14 + 21/21, segurança 11/11 + scanner, lint/build/media verdes.
- Documentação: 66 BK/66 guias/94 requisitos/10 MF views/30 evidence e 143/143
  mutações negativas. Fences, `git diff --check` e trailing whitespace ficaram
  limpos; nenhum comando docente corrigido aponta para as pastas dos alunos.
- Dependências: audits root/backend/frontend com zero vulnerabilidades na prova
  F8; não houve alteração de dependências depois desses comandos.
- Axe preview-only 14/14 e fixtures media 9/9 continuam válidos para o código
  frontend inalterado. Não provam Safari real, streaming/CDN/4K/carga nem
  RNF08/RNF10. `RNF23` permanece apenas `PARCIAL_VALIDADO`.
- `mongodump`/`mongorestore` continuam ausentes; restore real está
  `BLOQUEADO_AMBIENTE`. `real_dev` continua privado/ignorado e CI/deploy/rollback
  remoto continuam riscos aceites para esta baseline local.

### Razão da ressalva

O `GO_LOCAL_COM_RESSALVAS` significa apenas que a referência pode ser executada
localmente nos fluxos que não dependem de persistência real e que não ficou
finding P0/P1/P2 localmente corrigível conhecido depois da reauditoria. Não
significa que todos os findings estejam fechados: os blockers obrigatórios não
foram transformados em falsos verdes. Antes de produção são obrigatórios, no
mínimo: repositório privado autoritativo, rotação da credencial, replica set
dedicado com fault injection/concorrência/full E2E cross-browser, migração
autorizada e ensaiada, backup+restore demonstrado, gateway real, CI/deploy e
rollback operacional. Até lá, a decisão vinculativa é `NO_GO_PRODUCAO`.
