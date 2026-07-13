# Auditoria end-to-end e UI/UX — Utilizadores, perfis e RBAC

- Data: 2026-07-12
- Sistema: Utilizadores, perfis e RBAC
- Slug: `UTILIZADORES-PERFIS-RBAC`
- Implementação auditada: `real_dev/backend` e `real_dev/frontend`
- Modo: auditoria seguida de correção autorizada
- Decisão final: `PASS`
- Findings abertos: `P0=0`, `P1=0`, `P2=0`, `P3=0`
- Findings fechados nesta execução: `P2=1`, `P3=4`
- Contexto operacional: demonstração final de PAP; não existe lane de produção

## 1. Resumo executivo

O sistema está implementado e ligado entre UI, cliente HTTP, autorização,
validação, serviços e MongoDB. Um utilizador autenticado consegue consultar e
editar o próprio nome e limite parental; um administrador consegue pesquisar e
paginar contas, rever role e estado, bloquear contas com revogação de sessões e
consultar registos eliminados apenas para leitura. O backend continua a ser a
autoridade: usa o `userId` da sessão no autosserviço, protege a administração
com role `admin`, valida enums e limites, impede auto-bloqueio/despromoção,
preserva pelo menos um administrador ativo e inclui alteração, revogação de
sessões e audit log na mesma transação.

A implementação passou os gates atuais: backend `368/368`, frontend `296/296`,
segurança `12/12` com baseline `PASS`, lint, build e Axe/reflow `35/35`. O smoke
read-only do administrador contra a base `_demo` tinha passado `1/1` na auditoria
inicial. A UI foi ainda
inspecionada no browser com fixtures locais sem persistência: a conta manteve
reflow mobile sem overflow, o backoffice conteve a tabela num scroll horizontal,
o diálogo mostrou diff e aviso de revogação e uma sessão `moderator` foi recusada
na gestão de utilizadores.

Os cinco findings foram corrigidos sem dependências novas nem expansão de
âmbito. Administradores e moderadores têm agora “A minha conta” na navegação do
backoffice; a listagem identifica a conta atual e não oferece mutações que o
backend recusaria; a copy pública do domínio usa acentuação PT-PT; a rota legacy
aceita exclusivamente `{ role }`; e existem provas HTTP positivas para perfil,
limite parental e mutação administrativa, incluindo persistência, audit,
revogação de sessões e ausência de campos internos.

Na revalidação final, o smoke live não chegou a abrir o browser porque o guard de
segurança detetou `MONGODB_DB_NAME` e `DEMO_MONGODB_DB_NAME` iguais na
configuração local atual. Não se alterou `.env`: o bloqueio é ambiental, acontece
antes de qualquer acesso ou mutação e não invalida o smoke `1/1` da auditoria
inicial nem os restantes gates pós-correção.

Não foram criados findings por ausência de produção, microserviços, filas,
infraestrutura enterprise ou validação de escala. Esses elementos não fazem
parte da PAP apresentada.

## 2. Scope incluído e excluído

### Incluído

- `RF03` (edição de perfil), `RF04` (papéis de utilizador), `RNF01`–`RNF05`,
  `RNF16` e `RNF19`;
- página `/conta`, perfil, limite parental e dependências diretas de privacidade;
- backoffice `/admin/utilizadores`, pesquisa, filtros, paginação, role e estado;
- roles `user`, `moderator` e `admin` e estados `active`, `blocked` e `deleted`;
- guardas de frontend e autorização server-side;
- ownership, validação, mass assignment, IDOR/BOLA, CSRF e exposição de dados;
- revogação de sessões, último administrador ativo, concorrência e audit trail;
- navegação por role, diálogo de confirmação, loading, erro, sucesso e retry;
- responsividade, teclado, foco, semântica, Axe e reflow;
- testes unitários, integração HTTP, segurança, build e browser read-only.

### Excluído

- autenticação, recuperação de password e lifecycle geral de sessões, já
  tratados na auditoria própria de autenticação;
- regras internas de subscrições, família, catálogo, recomendações e
  solidariedade, exceto quando consomem o estado operacional do utilizador;
- alteração de requisitos, planos, BKs ou evidências anteriores;
- mutações destrutivas na base Atlas `_demo`;
- deployment, produção, carga, browsers físicos e infraestrutura enterprise;
- alterações fora dos cinco findings documentados.

O `README.md`, `tests/e2e/mf2-flow.spec.js` e o relatório de autenticação já
estavam modificados ou não rastreados antes desta execução e foram preservados.

## 3. Fontes e ficheiros consultados

### Contratos e arquitetura

- `README.md`
- `ARCHITECTURE.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/guias-bk/MF5/BK-MF5-04-gestao-de-utilizadores-admin.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-auditoria-administrativa-final.md`

### Backend

- `real_dev/backend/src/app.js`
- `real_dev/backend/src/modules/users/{user.routes,user.controller,user.validation,user.service,admin-invariant.service}.js`
- `real_dev/backend/src/modules/auth/{auth.middleware,session.service,auth.indexes}.js`
- `real_dev/backend/src/middlewares/session.middleware.js`
- `real_dev/backend/src/modules/audit/audit.service.js`
- `real_dev/backend/src/modules/privacy/{privacy.routes,privacy.service}.js`
- `real_dev/backend/src/config/database.js`

### Frontend

- `real_dev/frontend/src/routes/AppRoutes.jsx`
- `real_dev/frontend/src/context/SessionContext.jsx`
- `real_dev/frontend/src/pages/{AccountPage,AdminUsersPage}.jsx`
- `real_dev/frontend/src/services/api/{apiClient,apiErrors,userApi}.js`
- `real_dev/frontend/src/components/auth/{AuthenticatedRoute,AdminRoute}.jsx`
- `real_dev/frontend/src/components/admin/{AdminNavigation,ConfirmDialog}.jsx`
- `real_dev/frontend/src/components/layout/AppHeader.jsx`
- `real_dev/frontend/src/components/privacy/*`
- `real_dev/frontend/src/layouts/AdminLayout.jsx`
- `real_dev/frontend/src/styles/global.css`

### Testes e tooling

- `real_dev/backend/tests/unit/{mf5-validation,f3-admin-transactions}.test.js`
- `real_dev/backend/tests/regression/mf8-admin-final-audit.test.js`
- `real_dev/backend/tests/integration/security-http.test.js`
- `real_dev/frontend/src/pages/{AccountPage,AdminUsersPage}.test.jsx`
- `real_dev/frontend/src/layouts/AdminLayout.test.jsx`
- `real_dev/frontend/src/services/api/adminActionApis.test.js`
- `real_dev/frontend/tests/a11y/accessibility.spec.js`
- `tests/e2e/demo-read-only.spec.js`
- `playwright.a11y.config.js` e `playwright.demo.config.js`

Não foi encontrado um `AGENTS.md` adicional dentro do repositório.

## 4. Mapa do sistema

### 4.1 Objetivo e atores

O sistema permite a cada conta gerir dados próprios de perfil e permite a
administradores gerir permissões e disponibilidade operacional de outras
contas. Os atores são:

- `user`: autosserviço de conta e superfícies de cliente;
- `moderator`: backoffice editorial, sem gestão de utilizadores;
- `admin`: backoffice completo e gestão de roles/estado;
- visitante: apenas redirecionado para autenticação quando tenta aceder a uma
  superfície privada.

Não existe tenancy ou organização aplicável. O isolamento é por identidade de
sessão e por role.

### 4.2 Elementos e classificação

| Elemento | Localização/contrato | Classificação |
| --- | --- | --- |
| Conta própria | `/conta`, `AccountPage` | `IMPLEMENTADO_E_LIGADO` |
| Formulário de perfil | nome entre 2 e 80 caracteres | `IMPLEMENTADO_E_LIGADO` |
| Controlo parental | inteiro entre 0 e 18 | `IMPLEMENTADO_E_LIGADO` |
| Privacidade da conta | exportação, consentimentos e eliminação | `IMPLEMENTADO_E_LIGADO` |
| Gestão de contas | `/admin/utilizadores`, `AdminUsersPage` | `IMPLEMENTADO_E_LIGADO` |
| Navegação pessoal para clientes | menu “A minha conta” | `IMPLEMENTADO_E_LIGADO` |
| Navegação pessoal para staff | “A minha conta” no backoffice | `IMPLEMENTADO_E_LIGADO` |
| Guarda autenticada | `AuthenticatedRoute` | `IMPLEMENTADO_E_LIGADO` |
| Guarda administrativa visual | `AdminRoute` | `IMPLEMENTADO_E_LIGADO` |
| RBAC autoritativo | `requireRole(["admin"])` | `IMPLEMENTADO_E_LIGADO` |
| Perfil próprio API | `GET|PATCH /api/users/me` | `IMPLEMENTADO_E_LIGADO` |
| Parental API | `PATCH /api/users/me/parental` | `IMPLEMENTADO_E_LIGADO` |
| Lista administrativa | `GET /api/users` | `IMPLEMENTADO_E_LIGADO` |
| Alteração administrativa | `PATCH /api/users/:id/admin` | `IMPLEMENTADO_E_LIGADO` |
| Alteração legacy de role | `PATCH /api/users/:id/role`, apenas `{ role }` | `LEGACY_OU_NAO_USADO` |
| Utilizadores | coleção `users` | `IMPLEMENTADO_E_LIGADO` |
| Sessões | coleção `sessions` | `IMPLEMENTADO_E_LIGADO` |
| Invariante de admins | coleção `admin_invariants` | `INTERNO_OPERACIONAL` |
| Audit administrativo | coleção `admin_audit_logs` | `INTERNO_OPERACIONAL` |
| Soft delete/anonimização | `privacy.service.js` | `IMPLEMENTADO_E_LIGADO` |
| Seed e contas demo | scripts `seed-demo-*` e Atlas `_demo` | `SIMULADO_OU_DEMO` |
| Jobs/filas próprios deste domínio | nenhum necessário | `NAO_APLICAVEL` |
| Integrações externas | nenhuma | `NAO_APLICAVEL` |

### 4.3 Dependências e consumidores

- `attachSession` resolve a conta atual em todos os pedidos;
- todas as rotas de autosserviço dependem de `requireAuth`;
- listagem e mutações administrativas dependem de `requireRole(["admin"])`;
- playback, subscrições, família, associações e notificações consomem
  `accountStatus`, role ou `parentalMaxAgeRating`;
- bloqueio administrativo e eliminação de conta revogam sessões;
- a eliminação de conta anonimiza o utilizador e invalida referências pessoais;
- o audit log recebe ator, alvo, request id, before/after mínimo e campos
  alterados, sem email, password, token ou cookie.

## 5. Matriz de jornadas

| Jornada | Ator | Frontend | API/backend | Dados/efeitos | Negativos | UI/UX | Testes | Estado |
| ------- | ---- | -------- | ----------- | ------------- | --------- | ----- | ------ | ------ |
| Consultar conta própria | Qualquer autenticado | `/conta` carrega perfil | `GET /api/users/me` usa sessão | leitura de `users` | anónimo, sessão indisponível e retry | loading/erro/sucesso acessíveis | component + browser sintético | `PASS` |
| Editar nome | Utilizador | formulário com busy único | `PATCH /api/users/me` | atualiza apenas nome/timestamp | nome vazio/curto/longo, abort | resposta autoritativa e status | unit/component + HTTP positivo | `PASS` |
| Alterar limite parental | Utilizador | valida inteiro 0–18 | `PATCH /api/users/me/parental` | atualiza limite/timestamp | vazio, decimal, string e fora do limite | erro claro e resposta autoritativa | unit/component + playback negativos | `PASS` |
| Descobrir conta própria | Qualquer autenticado | menu pessoal ou backoffice contém “A minha conta” | rota autenticada | sem escrita | navegação adaptada por role | clientes e staff encontram | component + browser mobile/desktop | `PASS` |
| Listar/pesquisar contas | Admin | tabela, pesquisa, estado e paginação | `GET /api/users` admin-only | leitura limitada, sort estável | anónimo/user/moderator, filtros e paginação inválidos | loading, vazio, erro e retry | unit, HTTP RBAC, Axe e demo read-only | `PASS` |
| Rever role/estado | Admin | diálogo com diff; conta atual só leitura | `PATCH /api/users/:id/admin` | update + audit na transação | enums inválidos, alvo inexistente/deleted e automutação | confirmação, busy e restrições antecipadas | service/unit + component + HTTP positivo | `PASS` |
| Bloquear conta | Admin | aviso de revogação | backend elimina sessões no commit | estado, sessões e audit atómicos | auto-bloqueio e último admin | ação sensível identificada | fault injection e concorrência | `PASS` |
| Reativar conta | Admin | estado `active` selecionável | mesma rota admin | conta volta a autenticar apenas em nova sessão | deleted não é mutável | diálogo e sucesso | unit/component | `PASS` |
| Preservar último admin | Admin | sem conhecimento da contagem global | invariante transacional | lock lógico `admin_invariants` | duas despromoções concorrentes | erro backend apresentado | teste concorrente local | `PASS` |
| Aceder como moderator | Moderator | nav apenas editorial | users exige `admin` | nenhuma escrita | URL direta recusada | alerta acessível | browser sintético + HTTP RBAC | `PASS` |
| Eliminar conta própria | Utilizador | frase + password, ação disabled | `DELETE /api/privacy/account` | anonimização e revogações transacionais | password errada, blocked/deleted, último admin | zona de perigo e feedback | unit/component | `PASS` |

## 6. Contratos entre camadas

| Método e path | Input | Sucesso | Erros/observações |
| --- | --- | --- | --- |
| `GET /api/users/me` | cookie de sessão | `200 { user }` | `401 AUTH_REQUIRED`, `404`; resposta privada/no-store |
| `PATCH /api/users/me` | `{ name: string }` | `200 { user }` | nome 2–80; user id vem da sessão, campos extra não são persistidos |
| `PATCH /api/users/me/parental` | `{ parentalMaxAgeRating: number }` | `200 { user }` | inteiro 0–18; não aceita string numérica |
| `GET /api/users` | `search?`, `status?`, `page?`, `limit?` | `200 { users, page, limit, total, totalPages }` | admin-only; `limit <= 50`; pesquisa literal até 80 caracteres |
| `PATCH /api/users/:id/admin` | `{ role?, accountStatus? }` | `200 { user }` | exige pelo menos um campo; roles e estados fechados; alvo deleted devolve `404` |
| `PATCH /api/users/:id/role` | exclusivamente `{ role }` | `200 { user }` | admin-only; campos extra ou ausência de `role` devolvem `400` sem escrita |
| `DELETE /api/privacy/account` | `{ confirmation, password }` | `200 { deleted: true, ... }` | frase exata, password atual, rate limit e transação |

O DTO público é allowlisted por `toPublicUser`: `id`, `name`, `email`, `role`,
`accountStatus`, `parentalMaxAgeRating` e, no perfil/lista, timestamps. Nunca
inclui `passwordHash`, hashes de sessão, tokens ou cookies. A listagem usa
projeção defensiva e volta a mapear cada documento para o DTO público.

O cliente HTTP usa `credentials: include`, token CSRF em memória e codifica ids
com `encodeURIComponent`. Mutações autenticadas atravessam o middleware global
de CSRF e as respostas privadas variam por cookie.

## 7. Segurança e privacidade

### Controlos confirmados

- ownership de perfil deriva exclusivamente de `req.user.id`; o browser não
  envia um `userId` para editar a própria conta;
- RBAC de utilizadores é aplicado server-side, não apenas por esconder links;
- `user`, `moderator` e visitante recebem respetivamente `403` ou `401` nas
  superfícies admin;
- ids são validados como `ObjectId` e usados como valores, sem composição de
  query a partir do body;
- pesquisa escapa caracteres de regex e limita comprimento;
- updates usam allowlists; não foi encontrado mass assignment de role no
  autosserviço;
- estados desconhecidos, blocked e deleted falham fechados na autenticação;
- mudar role não conserva autorização antiga: cada pedido resolve novamente o
  documento atual do utilizador;
- bloquear elimina todas as sessões no mesmo contexto transacional;
- o último admin ativo é protegido, incluindo concorrência entre duas
  despromoções;
- audit administrativo faz commit com a alteração e guarda apenas role/estado,
  `changedFields`, ator/alvo e correlação;
- sanitização recursiva remove email, telefone, credenciais, tokens e cookies;
- eliminação própria exige password e frase explícita, anonimiza o documento e
  revoga sessões;
- headers, CORS, CSRF, cookies e rate limiting passaram o gate de segurança.

### Limites proporcionais

- a prova de transações e concorrência usa doubles com rollback/fault injection;
  não foi executada uma mutação destrutiva num replica set real durante esta
  auditoria;
- isto não bloqueia a demonstração PAP: a base `_demo` foi usada apenas em
  leitura e a implementação está coberta por testes locais determinísticos;
- não existe necessidade atual de ABAC, tenancy, IdP externo, fila ou serviço
  independente de identidade.

## 8. Dados, transações e operação

### Persistência e invariantes

- `users.email` tem índice único;
- `sessions.tokenHash` é único e `expiresAt` tem TTL;
- a listagem administrativa ordena por `createdAt: -1, _id: 1`, pagina e limita
  o volume;
- documentos sem `accountStatus` são tratados como legacy `active`;
- `deleted` é apenas filtro/listagem; a gestão administrativa não reabre nem
  altera uma conta eliminada;
- `admin_invariants/_id=active-admin-roster` serializa tentativas que removem um
  admin ativo;
- role/estado, revogação de sessões e `admin_audit_logs` partilham a transação;
- falha tardia do audit reverte update e sessões;
- a eliminação própria preserva apenas o histórico agregado necessário e
  anonimiza PII.

### Operação e observabilidade

- erros usam envelope com `code`, `message` e `requestId`;
- respostas 5xx não expõem exceções internas;
- logs HTTP estruturados incluem correlação e não incluem bodies/segredos;
- health/readiness pertencem à plataforma geral e não há worker específico de
  utilizadores;
- a seed `demo-v2` contém roles e estados variados para a apresentação;
- o smoke demo é deliberadamente read-only e impede mutações de domínio.

## 9. UI/UX e acessibilidade

### Pontos aprovados

- `/conta` organiza identidade, plano, perfil, parental e privacidade numa
  hierarquia clara;
- nome e parental têm labels, limites nativos, estado disabled e busy partilhado;
- leitura e mutações são abortadas ao desmontar a página;
- falha inicial permite retry e sucesso/erro usam regiões live apropriadas;
- a gestão admin separa pesquisa, filtro, tabela e diálogo de revisão;
- o backoffice disponibiliza “A minha conta” a administradores e moderadores;
- o diálogo apresenta entidade humana, role, estado, diff e aviso de revogação;
- a conta da sessão é identificada por “Conta atual” e não oferece uma mutação
  impossível;
- contas deleted são visíveis apenas para leitura;
- a tabela é uma região focável e nomeada, permitindo alcançar o scroll
  horizontal mesmo quando todas as ações da página estão desativadas;
- tabela e formulários funcionam em mobile sem overflow da página;
- em 390 px, a tabela ficou com `clientWidth=343`, `scrollWidth=802` e
  `overflow-x:auto`, enquanto a página manteve `scrollWidth=clientWidth=375`;
- controlos principais da conta mediram 44 px de altura no browser;
- o diálogo móvel coube no viewport, focou “Cancelar” e apresentou claramente a
  ação sensível;
- sidebar/drawer administrativo, breadcrumb, skip link e foco foram validados;
- uma sessão `moderator` não viu “Contas e permissões” e recebeu alerta na URL
  direta;
- Axe, reflow e overflow passaram em mobile, tablet e desktop (`35/35`).

### Correções de UI/UX validadas

- o link de conta de staff foi validado em desktop e no drawer mobile;
- a própria linha administrativa foi validada como não mutável, mantendo as
  restantes contas geríveis;
- as mensagens públicas alteradas usam acentuação PT-PT e continuam a atravessar
  o envelope de erro seguro existente;
- a primeira execução Axe pós-correção detetou a região scrollável sem acesso por
  teclado quando a tabela continha apenas a conta atual; o wrapper recebeu
  semântica, nome acessível e `tabIndex=0`, e a matriz final passou `35/35`.

As screenshots produzidas na inspeção foram transitórias e não foram publicadas
como evidência do repositório, porque os valores estruturados, Axe e o relatório
de execução eram suficientes.

## 10. Testes e comandos executados

| Diretório | Comando | Exit code | Resultado |
| --- | --- | ---: | --- |
| `real_dev/backend` | auditoria inicial: testes focados unitários/regressão | `1` no sandbox | `18/22`; quatro testes HTTP bloqueados por `listen EPERM`, sem falha de asserção |
| `real_dev/backend` | repetição inicial fora do sandbox | `0` | `22/22` |
| `real_dev/backend` | `node --test tests/unit/mf2-validation.test.js tests/unit/mf5-validation.test.js tests/unit/f3-admin-transactions.test.js` | `0` | correções de validação/invariantes `26/26` |
| `real_dev/backend` | `node --test tests/regression/mf8-admin-final-audit.test.js` fora do sandbox | `0` | contratos HTTP pós-correção `6/6` |
| `real_dev/frontend` | testes focados de `AdminUsersPage`, `AdminLayout` e dependências | `0` | 3 ficheiros, `15/15` |
| `real_dev/frontend` | repetição focada de `AdminUsersPage` após correção Axe | `0` | `6/6` |
| `real_dev/backend` | `npm test` | `0` | `368/368` |
| `real_dev/frontend` | `npm run lint` | `0` | sem warnings/erros |
| `real_dev/frontend` | `npm run test:unit` | `0` | 65 ficheiros, `296/296` |
| `real_dev/frontend` | `npm run build:check` | `0` | build Vite concluído; apenas warnings já conhecidos de chunks/dash.js |
| raiz | `npm run test:security` | `0` | `12/12`; `Hardening MF6: PASS` |
| raiz | primeira repetição de `npm run test:a11y` | `1` | `34/35`; detetou região scrollável sem foco na tabela só com a conta atual |
| raiz | Axe focado em `/admin/utilizadores` após correção | `0` | `1/1` |
| raiz | repetição completa de `npm run test:a11y` | `0` | Chromium+Axe/reflow `35/35` |
| raiz | auditoria inicial: `npm run test:e2e:demo -- --grep "admin lê utilizadores"` | `0` | smoke read-only `_demo` `1/1` |
| raiz | revalidação pós-correção do mesmo smoke | `1` antes dos testes | guard recusou nomes iguais para base normal e base demo; sem acesso à base |
| browser local | admin com API sintética sem persistência | `N/A` | link de conta, conta atual não mutável, tabela focável e mobile sem overflow |

O primeiro `listen EPERM` foi classificado como bloqueio do sandbox e não como
defeito. A repetição autorizada passou integralmente. A falha Axe intermédia foi
corrigida antes da matriz final. O bloqueio do smoke live é um guard esperado da
configuração e aconteceu antes de qualquer teste ou contacto com a base. Não
ficaram artefactos de teste intencionais.

## 11. Findings

### [P2 — FECHADO] UTILIZADORES-PERFIS-RBAC-UIUX-001 — Staff não tinha navegação para a própria conta

- Estado: FECHADO
- Área: UI/UX
- Evidência: `docs/RF.md:37`, `docs/RNF.md:26`, rota `/conta`,
  `real_dev/frontend/src/components/admin/AdminNavigation.jsx:46-48` e
  `real_dev/frontend/src/layouts/AdminLayout.test.jsx:48-55`
- Percurso afetado: administrador ou moderador → gerir o próprio perfil, parental, consentimentos, exportação ou eliminação
- Pré-condições: sessão autenticada com role `admin` ou `moderator`
- Passos de reprodução:
    1. Iniciar sessão como administrador ou moderador.
    2. Inspecionar a navegação do backoffice e usar “Ver site público”.
    3. Inspecionar o header público da sessão staff.
    4. Confirmar que só existem regresso à administração e logout, sem link para `/conta`.
- Resultado anterior: `/conta` funcionava por URL direta, mas não existia um caminho visível para staff descobrir o autosserviço da própria conta.
- Resultado esperado: qualquer role autenticada deve conseguir navegar para a própria conta sem conhecer o URL.
- Causa-raiz: `PERSONAL_ITEMS` é renderizado apenas quando `isCustomer`; `AdminLayout` não oferece uma ação equivalente.
- Impacto: perfil e direitos de privacidade ficam materialmente difíceis de descobrir para dois dos três papéis autenticados.
- Correção recomendada: adicionar o link simples “A minha conta” à identidade do `AdminLayout` ou ao header público de staff, preservando o context switch atual.
- Validação recomendada: teste de navegação para `admin` e `moderator`, mais browser mobile/desktop a confirmar link, foco e retorno ao backoffice.
- Correção aplicada: `AdminNavigation` inclui agora um grupo “Conta”, visível a
  `admin` e `moderator`, com link para `/conta` nas variantes desktop e mobile.
- Validação executada: teste de layout para moderator e inspeção em browser
  desktop/mobile confirmaram nome, destino e presença no drawer.

### [P3 — FECHADO] UTILIZADORES-PERFIS-RBAC-UIUX-002 — A UI oferecia auto-bloqueio e auto-despromoção que o backend proíbe

- Estado: FECHADO
- Área: UI/UX
- Evidência: `real_dev/frontend/src/pages/AdminUsersPage.jsx:20-21`,
  `real_dev/frontend/src/pages/AdminUsersPage.jsx:114-124`,
  `real_dev/frontend/src/pages/AdminUsersPage.test.jsx:88-116` e
  `real_dev/backend/src/modules/users/user.service.js:243-255`
- Percurso afetado: administrador → gerir a própria linha em “Contas e permissões”
- Pré-condições: a conta do administrador atual aparece na página da listagem
- Passos de reprodução:
    1. Abrir `/admin/utilizadores` como administrador.
    2. Abrir “Gerir” na própria linha.
    3. Escolher role `user`/`moderator` ou estado `blocked`.
    4. Confirmar a alteração.
- Resultado anterior: o diálogo aceitava e resumia a transição; só depois do pedido o backend respondia que o administrador não podia remover o próprio acesso ou bloquear a própria conta.
- Resultado esperado: a UI deve identificar a própria conta e impedir ou explicar antecipadamente as transições que nunca podem ser aceites.
- Causa-raiz: `AdminUsersPage` não consulta a identidade da sessão ao construir as opções do diálogo.
- Impacto: ação enganadora e pedido desnecessário, sem quebra de segurança porque o backend falha fechado.
- Correção recomendada: comparar `selected.id` com `useSession().user.id`, desativar as opções impossíveis e mostrar uma explicação curta; manter a validação backend.
- Validação recomendada: componente com conta própria e conta alheia, garantindo opções/ajuda corretas e ausência de `PATCH` para transição impossível.
- Correção aplicada: `AdminUsersPage` compara cada id com a sessão e apresenta a
  própria linha como “Conta atual”, com ação desativada; contas alheias mantêm
  “Gerir” e contas eliminadas continuam “Só leitura”.
- Validação executada: o teste de componente prova ausência de diálogo e de
  pedido de update na conta atual; browser confirmou a distinção visual.

### [P3 — FECHADO] UTILIZADORES-PERFIS-RBAC-UIUX-003 — Erros do domínio de utilizadores chegavam à UI sem acentuação PT-PT

- Estado: FECHADO
- Área: UI/UX
- Evidência: `real_dev/backend/src/modules/users/user.validation.js:22-56`,
  `real_dev/backend/src/modules/users/user.validation.js:79-143`,
  `real_dev/backend/src/modules/users/admin-invariant.service.js:51-56`,
  `real_dev/backend/src/modules/users/user.service.js:243-267` e
  `real_dev/frontend/src/services/api/apiErrors.js:98-103`
- Percurso afetado: utilizador/admin → payload inválido, auto-bloqueio/despromoção, último admin ou alvo inválido
- Pré-condições: uma validação do backend devolve erro de domínio ao cliente
- Passos de reprodução:
    1. Tentar bloquear a própria conta administrativa ou enviar role/estado inválido.
    2. Observar a mensagem apresentada no diálogo através de `toUserMessage`.
- Resultado anterior: mensagens como “Nao podes bloquear a tua propria conta”, “Role invalida” e “A operacao removeria o ultimo administrador ativo” eram apresentadas literalmente.
- Resultado esperado: copy pública coerente em português de Portugal, com “Não”, “própria”, “inválida”, “operação” e “último”.
- Causa-raiz: strings antigas sem acentuação no módulo `users`; o cliente preserva corretamente a mensagem segura da API.
- Impacto: inconsistência visível e pouco profissional na apresentação, sem impacto funcional ou de segurança.
- Correção recomendada: corrigir apenas as strings user-facing do domínio e atualizar os testes que verificam essas mensagens.
- Validação recomendada: testes unitários das mensagens e componente admin a verificar a copy final no alerta.
- Correção aplicada: as mensagens públicas de validação, utilizador, automutação,
  concorrência e último administrador foram normalizadas com acentuação PT-PT.
- Validação executada: suites unitárias e regressão HTTP passaram com as novas
  mensagens; os códigos e envelopes de erro foram preservados.

### [P3 — FECHADO] UTILIZADORES-PERFIS-RBAC-E2E-001 — A rota legacy de role aceitava também alterações de estado

- Estado: FECHADO
- Área: contrato
- Evidência: `real_dev/backend/src/modules/users/user.routes.js:22-26`,
  `real_dev/backend/src/modules/users/user.controller.js:53-67`,
  `real_dev/backend/src/modules/users/user.service.js:209-220`,
  `real_dev/backend/src/modules/users/user.validation.js:42-60` e
  `real_dev/backend/tests/regression/mf8-admin-final-audit.test.js:955-1003`
- Percurso afetado: cliente administrativo legacy → alterar apenas a role de uma conta
- Pré-condições: sessão `admin` e alvo operacional
- Passos de reprodução:
    1. Enviar `PATCH /api/users/:id/role` com `{ "accountStatus": "blocked" }`.
    2. Seguir controller → `updateUserRole` → `updateUserByAdmin`.
    3. Confirmar que `assertAdminUserUpdate` aceita `accountStatus` mesmo sem `role`.
- Resultado anterior: o endpoint nominalmente reservado à role também conseguia bloquear/reativar contas.
- Resultado esperado: a rota legacy deve aceitar exclusivamente `{ role }`; role+estado pertencem a `/api/users/:id/admin`.
- Causa-raiz: `updateUserRole` delega o body integral no validador administrativo combinado em vez de aplicar `assertRoleUpdate`.
- Impacto: contrato HTTP mais amplo do que o nome, JSDoc e cliente indicam; não cria escalada porque continua admin-only e auditado.
- Correção recomendada: manter compatibilidade da rota mas validar/encaminhar apenas `role`, ou removê-la se a pesquisa confirmar ausência total de consumidores.
- Validação recomendada: teste HTTP positivo com `{role}` e negativo com `{accountStatus}`, esperando `400` sem escrita, sessão revogada ou audit.
- Correção aplicada: `updateUserRole` chama agora `assertRoleUpdate`, que exige um
  objeto com exatamente a chave `role`; estado e campos extra são rejeitados.
- Validação executada: testes unitários rejeitam payloads mistos/status-only; o
  teste HTTP confirma sucesso de `{ role }`, `400` para `{ accountStatus }`,
  mensagem segura e ausência de efeitos laterais no pedido rejeitado.

### [P3 — FECHADO] UTILIZADORES-PERFIS-RBAC-TEST-001 — Faltava prova positiva ligada das mutações de perfil e RBAC

- Estado: FECHADO
- Área: testes
- Evidência: `real_dev/frontend/src/pages/AccountPage.test.jsx:16-30`,
  `real_dev/frontend/src/pages/AdminUsersPage.test.jsx:10-19`,
  `real_dev/backend/tests/regression/mf8-admin-final-audit.test.js:917-1003` e
  `tests/e2e/demo-read-only.spec.js:150-168`
- Percurso afetado: utilizador → editar perfil/parental; admin → confirmar role/estado até à resposta final
- Pré-condições: suite automatizada normal
- Passos de reprodução:
    1. Listar os testes que exercem `/api/users` e `/api/users/me`.
    2. Confirmar que o HTTP cobre negações de RBAC, o frontend usa mocks e as mutações críticas são chamadas diretamente ao service.
    3. Confirmar que o smoke Atlas é deliberadamente read-only.
- Resultado anterior: cada camada tinha boa cobertura isolada, mas nenhuma prova positiva atravessava rota HTTP, middleware, controller, validação, service e resposta para perfil/parental/admin update.
- Resultado esperado: pelo menos um teste HTTP positivo isolado por mutação crítica, sem tocar na base `_demo`, que complemente os testes de service e componente.
- Causa-raiz: a estratégia separou doubles de backend, mocks de frontend e smoke real exclusivamente de leitura.
- Impacto: wiring ou envelope de sucesso pode regredir sem falhar os testes atuais; risco baixo porque o código é simples e as camadas isoladas passaram.
- Correção recomendada: acrescentar testes HTTP positivos com DB transacional controlada para `PATCH /me`, `/me/parental` e `/:id/admin`; não é necessário criar infraestrutura E2E enterprise.
- Validação recomendada: provar status/body, persistência, audit, revogação, ausência de campos internos e atualização autoritativa consumida pela UI.
- Correção aplicada: a regressão HTTP cobre agora `PATCH /api/users/me`,
  `PATCH /api/users/me/parental` e `PATCH /api/users/:id/admin` através de rota,
  middleware, controller, validação e service.
- Validação executada: os testes provam ownership, role preservada, ausência de
  `passwordHash`, persistência do perfil/parental, role+estado administrativos,
  revogação da sessão e um único audit log; a regressão passou `6/6`.

## 12. Riscos e validações bloqueadas

- Não existe finding nem bloqueio crítico aberto.
- A primeira execução HTTP ficou bloqueada por `listen EPERM` dentro do sandbox;
  a repetição fora do sandbox passou `22/22`.
- Não foram feitas mutações na Atlas `_demo`; a leitura real do backoffice
  passou na auditoria inicial.
- A repetição pós-correção desse smoke foi impedida antes do arranque porque a
  configuração local atual contém nomes iguais para a base normal e a base demo.
  O guard funcionou como desenhado e `.env` foi preservado.
- A atomicidade num replica set real não foi reprovada nem simulada como
  sucesso: permanece sustentada por doubles/fault injection e pela arquitetura
  transacional documentada.
- Tablet e desktop foram cobertos pela matriz Playwright/Axe; a inspeção manual
  adicional concentrou-se no breakpoint mobile mais restritivo.
- Warnings de tamanho de chunks e compatibilidade interna do `dash.js` não
  pertencem ao sistema auditado e não quebraram build ou runtime.
- Produção, carga, backups e escala não são objetivos desta demonstração PAP e
  não foram convertidos em findings.

## 13. Conclusão e decisão final

**Decisão: `PASS`.**

Utilizadores, perfis e RBAC estão completos nas fronteiras principais,
autorizam server-side, falham fechados, preservam ownership e dados sensíveis e
mantêm alterações administrativas críticas dentro da transação com sessões e
audit. A aplicação e a base de demonstração suportam a apresentação final.

O P2 e os quatro P3 foram fechados com correções pequenas e localizadas, sem
dependências novas: navegação de conta para staff, restrição antecipada da conta
atual, copy PT-PT, endpoint legacy estrito e provas HTTP positivas. Nenhum
finding exigiu produção, microserviços ou infraestrutura adicional.

Foram alterados apenas os módulos e testes diretamente necessários aos cinco
findings, além deste relatório. Não foram alterados requisitos, planos, BKs,
evidências anteriores nem configuração; as mudanças preexistentes na worktree
foram preservadas.
