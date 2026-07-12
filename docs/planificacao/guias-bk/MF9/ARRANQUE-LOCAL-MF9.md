# Arranque local e validação da MF9 — implementações dos alunos

- `last_updated`: `2026-07-10`
- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md`
- `proof_scope`: comandos que existem nos manifests públicos `backend/` e `frontend/`; não valida a referência privada

## Objetivo e fronteira

Este runbook serve exclusivamente as implementações dos alunos em `backend/` e
`frontend/`. Os quatro documentos em `docs/runbooks/` são a autoridade
operacional separada da lane `REFERENCE`; os respetivos scripts de worker,
backup, restore, migração, health avançado e harness E2E não devem ser
apresentados aqui como comandos já existentes nos projetos dos alunos.

O `package.json` da raiz orquestra a referência privada. Por isso, um aluno não
deve usar scripts root para arrancar, semear ou validar a sua implementação.

## Pré-requisitos

- Node.js 20 ou superior.
- Dependências instaladas separadamente em `backend/` e `frontend/`.
- MongoDB local/efémero reservado à implementação dos alunos.
- Nunca usar uma base normal, partilhada ou de produção para testes destrutivos.
- Nunca copiar `.env`, URI, cookies, tokens ou passwords para evidence.

Confirma os scripts públicos antes de começar:

```bash
npm --prefix backend pkg get scripts
npm --prefix frontend pkg get scripts
```

Se um comando documentado não aparecer no manifest correspondente, para e
regista drift documental; não copies um script da referência privada.

## Preparação do ambiente

Cria os ficheiros locais apenas quando ainda não existem:

```bash
cp -n backend/.env.example backend/.env
cp -n frontend/.env.example frontend/.env
```

O exemplo público usa, por defeito:

- API em `http://127.0.0.1:3000` ou `http://localhost:3000`;
- frontend Vite em `http://127.0.0.1:5173` ou `http://localhost:5173`;
- `VITE_API_BASE_URL=http://localhost:3000`;
- `FRONTEND_ORIGIN` limitado às origens locais do frontend.

Altera valores apenas no `.env` local. Não os registes no terminal partilhado,
no Git ou em screenshots.

## Arranque em desenvolvimento

Em dois terminais:

```bash
npm --prefix backend run dev
```

```bash
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

Valida:

1. `GET http://127.0.0.1:3000/health` responde sem expor URI ou erro interno;
2. `http://127.0.0.1:5173` abre o FaithFlix;
3. o frontend comunica com a API sem erro CORS;
4. uma sessão anónima não recebe privilégios administrativos.

O endpoint `/health` acima é o único atualmente presente no root dos alunos. O
contrato final de `/health/live`, `/health/ready` e alias de readiness é ensinado
no BK MF1 correspondente, mas só deve ser marcado como executável nesta lane
depois de o código dos alunos o implementar e testar.

## Validação disponível nos manifests dos alunos

Backend:

```bash
npm --prefix backend test
npm --prefix backend run smoke
```

Frontend:

```bash
npm --prefix frontend run smoke
npm --prefix frontend run build
```

O `smoke` frontend atual é um build técnico. Não substitui teste funcional em
browser, acessibilidade, Firefox/WebKit/Safari ou integração com MongoDB.

## Media e player

Ainda não existem vídeos reais fornecidos pelos alunos. Conteúdo publicado sem
media continua no catálogo com `mediaStatus: "pending"`, `isPlayable: false` e
CTA desativado.

Fixtures MP4/HLS/DASH sintéticas da referência não são assets dos alunos e não
devem ser copiadas para apresentar reprodução real. Mesmo quando uma fixture
chega a `canplay`, isso não prova 4K, CDN, ABR, DRM, carga ou streaming real:

- `RNF08`: `NAO_PROVADO`;
- `RNF10`: `NAO_PROVADO`;
- `RNF23`: no máximo `PARCIAL_VALIDADO` na referência.

## Pagamentos, família e pool

- O checkout e as renovações permanecem simulados; não existe gateway real.
- Uma membership familiar não representa pagamento nem receita para a pool.
- `Idempotency-Key`, transações, leases e ledger v2 só podem ser considerados
  implementados pelos alunos quando existirem no seu código e tiverem evidence
  própria.
- Não ativar subscrições diretamente para fazer uma demonstração passar.
- Não executar migrações, worker ou fecho financeiro por comandos improvisados.

## E2E, seeds e Playwright

Este runbook não publica um comando E2E dos alunos porque os manifests públicos
atuais não possuem um harness student-owned completo e isolado. Os scripts E2E
da raiz pertencem à lane `REFERENCE`; executá-los não valida a entrega dos
alunos.

Quando um BK criar um harness dos alunos, o contrato mínimo será:

- seed e browser em comandos separados;
- `NODE_ENV=test` e opt-in explícito de seed;
- URI loopback sem credenciais e com `replicaSet`;
- DB exclusiva terminada em `_e2e`, diferente da DB normal;
- `reuseExistingServer: false` em validação formal;
- rede não-loopback bloqueada;
- artefactos em `test-results/` ou `playwright-report/` antes de publicação;
- execução direta, fora de scripts npm, através de
  `npm exec playwright -- test`.

Até esse contrato existir na lane dos alunos, classifica o E2E como
`BLOQUEADO_PRODUTO` ou `NAO_EXECUTADO`; nunca reutilizes o `PASS` da referência.

## Comandos deliberadamente fora desta lane

Os seguintes comandos não existem no manifest público atual e não podem ser
inventados neste runbook:

- `worker`;
- `backup:db`;
- `restore:verify`;
- `migrate:payment-attempts:v2`;
- suites root de media, acessibilidade ou E2E da referência.

Para a operação da referência privada consulta, sem transpor os comandos para a
entrega dos alunos:

- `docs/runbooks/ARRANQUE-E-SHUTDOWN-LOCAL.md`;
- `docs/runbooks/WORKER-LOCAL.md`;
- `docs/runbooks/BACKUP-RESTORE-LOCAL.md`;
- `docs/runbooks/ROLLBACK-MANUAL-LOCAL.md`.

## Evidence e gate MF9

Para cada comando realmente executado, regista:

- data e cwd;
- comando sem valores secretos;
- exit code;
- contagem real e primeira falha útil;
- implementação observada (`STUDENT`);
- limitações e testes não executados.

Um screenshot deve identificar rota, browser real, viewport, perfil e data. A
evidence segue `docs/evidence/README.md` e não pode transformar um snapshot ou
uma prova da referência em estado dos alunos.

Checklist final:

- [ ] Apenas `backend/` e `frontend/` foram arrancados.
- [ ] Os comandos usados existem nos manifests públicos.
- [ ] Nenhum seed, migração ou comando destrutivo foi executado sem isolamento e autorização.
- [ ] Conteúdo sem media ficou não reproduzível.
- [ ] Pagamento foi apresentado como simulado.
- [ ] Nenhum resultado sintético foi apresentado como vídeo/4K/carga real.
- [ ] Bloqueios e testes não executados ficaram explícitos.
- [ ] O estado dos BK dos alunos não foi promovido pela referência.

O gate técnico máximo conhecido da referência continua
`GO_LOCAL_COM_RESSALVAS`; produção permanece `NO_GO_PRODUCAO`. Estes estados não
fecham automaticamente o gate S13 dos alunos.
